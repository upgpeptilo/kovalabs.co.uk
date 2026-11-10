"use server";
import { randomBytes } from "crypto";
import { db, orders, variants, products, paymentMethods } from "@/db";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { getSettings } from "./settings";
import { notifyOrder, orderText } from "./notify";
import { pctFor, lineTotal } from "./pricing";

type In = { variantId: number; qty: number }[];

export type Line = { variantId: number; qty: number; name: string; label: string; image: string; slug: string; pricePence: number; stock: number; ok: boolean; discountPct: number; totalPence: number };

// Server is the source of truth for price, name and stock; the browser sends only IDs and quantities.
async function priceLines(input: In): Promise<Line[]> {
  const ids = [...new Set(input.map((i) => Number(i.variantId)).filter(Number.isInteger))];
  if (!ids.length) return [];
  const rows = await db
    .select({ v: variants, p: products })
    .from(variants)
    .innerJoin(products, eq(variants.productId, products.id))
    .where(and(inArray(variants.id, ids), eq(products.published, true)));
  return input.flatMap((i) => {
    const r = rows.find((x) => x.v.id === i.variantId);
    if (!r) return [];
    const qty = Math.max(1, Math.min(99, Math.floor(Number(i.qty)) || 1));
    const discountPct = pctFor(r.p.slug, qty);
    return [{ variantId: r.v.id, qty, name: r.p.name, label: r.v.label, image: r.p.images[0] ?? "", slug: r.p.slug, pricePence: r.v.pricePence, stock: r.v.stock, ok: r.v.stock >= qty, discountPct, totalPence: lineTotal(r.v.pricePence, qty, discountPct) }];
  });
}

export async function priceCart(input: In) {
  const lines = await priceLines(input);
  return { lines, totalPence: lines.filter((l) => l.ok).reduce((n, l) => n + l.totalPence, 0) };
}

export async function checkoutInfo() {
  const s = await getSettings();
  const methods = await db.select().from(paymentMethods).where(eq(paymentMethods.enabled, true)).orderBy(paymentMethods.sort);
  const channels = [s.orderByEmail && "email", s.orderByWhatsapp && s.whatsappNumber && "whatsapp", s.orderBySms && s.smsNumber && "sms"].filter(Boolean) as string[];
  return { methods, channels };
}

export type PlaceResult = { ok: true; number: string; handoff?: string } | { ok: false; error: string };

export async function placeOrder(input: { items: In; name: string; email: string; phone: string; address: string; notes: string; paymentMethodId: number; channel: string }): Promise<PlaceResult> {
  const name = input.name.trim(), email = input.email.trim();
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Please enter your name and a valid email." };
  if (input.name.length > 200 || input.address.length > 1000 || input.notes.length > 2000) return { ok: false, error: "Some fields are too long." };

  const [s, info] = [await getSettings(), await checkoutInfo()];
  const method = info.methods.find((m) => m.id === input.paymentMethodId);
  if (!method) return { ok: false, error: "Please choose a payment method." };
  if (!info.channels.includes(input.channel)) return { ok: false, error: "Please choose how to send your order." };

  const lines = await priceLines(input.items);
  if (!lines.length) return { ok: false, error: "Your cart is empty." };
  const bad = lines.find((l) => !l.ok);
  if (bad) return { ok: false, error: `${bad.name} is out of stock or has too few left. Please update your cart.` };

  const items = lines.map((l) => ({ variantId: l.variantId, name: l.name, label: l.label, qty: l.qty, pricePence: l.pricePence, discountPct: l.discountPct }));
  const totalPence = lines.reduce((n, l) => n + l.totalPence, 0);
  const number = `ORD-${randomBytes(5).toString("hex").slice(0, 8).toUpperCase()}`;

  // ponytail: neon-http has no transactions. Stock is decremented with a guarded UPDATE per line, then the order row is written.
  // A crash between the two can leave stock reduced with no order; add a transaction (neon-serverless Pool) if that ever matters.
  for (const l of lines) {
    const r = await db.update(variants).set({ stock: sql`${variants.stock} - ${l.qty}` }).where(and(eq(variants.id, l.variantId), gte(variants.stock, l.qty))).returning({ id: variants.id });
    if (!r.length) return { ok: false, error: `${l.name} just sold out. Please update your cart.` };
  }
  await db.insert(orders).values({ number, name, email, phone: input.phone.trim(), address: input.address.trim(), notes: input.notes.trim(), items, totalPence, paymentMethodId: method.id, paymentMethodName: method.name, channel: input.channel });

  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const order = { number, name, email, phone: input.phone, address: input.address, notes: input.notes, items, totalPence, paymentMethodName: method.name, channel: input.channel };
  await notifyOrder(s, order, site, input.channel === "email");

  const text = encodeURIComponent(orderText(order));
  const handoff = input.channel === "whatsapp" ? `https://wa.me/${s.whatsappNumber}?text=${text}` : input.channel === "sms" ? `sms:+${s.smsNumber}?&body=${text}` : undefined;
  return { ok: true, number, handoff };
}
