"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, products, variants } from "@/db";
import { and, eq, notInArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/format";

const KINDS = ["single", "blend", "stack", "accessory"];

function parseVariants(text: string) {
  // one per line: "label | price in pounds | stock"
  const rows = text.split("\n").map((l) => l.trim()).filter(Boolean).map((l, sort) => {
    const [label, price, stock] = l.split("|").map((x) => x.trim());
    return { label: label || "Standard", pricePence: Math.round(parseFloat(price) * 100), stock: Math.max(0, parseInt(stock ?? "0", 10) || 0), sort };
  });
  if (!rows.length || rows.some((r) => !Number.isFinite(r.pricePence) || r.pricePence < 0)) return null;
  return rows;
}

export async function saveProduct(id: number | null, _: unknown, f: FormData): Promise<{ error: string } | null> {
  await requireAdmin();
  const name = String(f.get("name") || "").trim();
  if (!name) return { error: "Name is required." };
  const slug = slugify(String(f.get("slug") || "") || name);
  const vs = parseVariants(String(f.get("variants") || ""));
  if (!vs) return { error: "Add at least one variant, one per line: label | price | stock (e.g. Standard | 29.99 | 100)." };
  const kind = String(f.get("kind"));
  const images = String(f.get("images") || "").split("\n").map((s) => s.trim()).filter((s) => /^(https:\/\/|\/)/.test(s));
  const catId = Number(f.get("categoryId"));
  const data = {
    name, slug, description: String(f.get("description") || ""), images, badge: String(f.get("badge") || ""),
    kind: KINDS.includes(kind) ? kind : "single", categoryId: Number.isInteger(catId) && catId > 0 ? catId : null,
    bestSeller: f.get("bestSeller") === "on", published: f.get("published") === "on",
  };
  try {
    if (id) {
      await db.update(products).set(data).where(eq(products.id, id));
    } else {
      [{ id }] = await db.insert(products).values(data).returning({ id: products.id });
    }
  } catch {
    return { error: "That URL slug is already used by another product." };
  }
  // Match variants by label so existing carts keep working when a price changes.
  const existing = await db.select().from(variants).where(eq(variants.productId, id!));
  for (const v of vs) {
    const hit = existing.find((e) => e.label === v.label);
    if (hit) await db.update(variants).set(v).where(eq(variants.id, hit.id));
    else await db.insert(variants).values({ ...v, productId: id! });
  }
  await db.delete(variants).where(and(eq(variants.productId, id!), notInArray(variants.label, vs.map((v) => v.label))));
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/", "layout");
  redirect("/admin/products");
}
