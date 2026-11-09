import Link from "next/link";
import { notFound } from "next/navigation";
import { db, orders, paymentMethods } from "@/db";
import { eq } from "drizzle-orm";
import { getSettings } from "@/lib/settings";
import { orderText } from "@/lib/notify";
import { gbp } from "@/lib/format";

export const metadata = { title: "Order confirmed", robots: { index: false } };

// Deliberately omits the customer's phone and address. The random order number is the only key.
export default async function OrderPage({ params }: PageProps<"/order/[number]">) {
  const { number } = await params;
  const [o] = await db.select().from(orders).where(eq(orders.number, number));
  if (!o) notFound();
  const [pm] = o.paymentMethodId ? await db.select().from(paymentMethods).where(eq(paymentMethods.id, o.paymentMethodId)) : [];
  const s = await getSettings();
  const text = encodeURIComponent(orderText(o));
  // Fallback buttons in case the popup/handoff was blocked.
  const wa = o.channel === "whatsapp" && s.whatsappNumber ? `https://wa.me/${s.whatsappNumber}?text=${text}` : null;
  const sms = o.channel === "sms" && s.smsNumber ? `sms:+${s.smsNumber}?&body=${text}` : null;

  return (
    <div className="wrap max-w-2xl py-12">
      <div className="rise text-center">
        <p className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ok text-3xl text-white" aria-hidden>✓</p>
        <h1 className="mt-4 text-3xl font-bold">Thank you, order received</h1>
        <p className="mt-1 text-muted">Order number <strong className="text-ink">{o.number}</strong></p>
      </div>
      <div className="mt-8 rounded-3xl border border-line bg-white/60 p-5">
        <ul className="divide-y divide-line text-sm">
          {o.items.map((i) => <li key={i.variantId} className="flex justify-between py-2"><span>{i.qty} × {i.name}{i.label !== "Standard" && ` (${i.label})`}</span><span>{gbp(i.pricePence * i.qty)}</span></li>)}
        </ul>
        <p className="mt-3 flex justify-between border-t border-line pt-3 text-lg font-bold"><span>Total</span><span>{gbp(o.totalPence)}</span></p>
      </div>
      <div className="mt-4 rounded-3xl bg-card p-5">
        <h2 className="font-bold">Payment: {o.paymentMethodName}</h2>
        <p className="mt-1 text-sm">{pm?.instructions}</p>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-navy">Send on WhatsApp</a>}
        {sms && <a href={sms} className="btn btn-navy">Send text message</a>}
        <Link href="/store" className="btn btn-line">Continue shopping</Link>
      </div>
    </div>
  );
}
