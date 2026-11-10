import { notFound } from "next/navigation";
import { db, orders } from "@/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/settings";
import { gbp } from "@/lib/format";
import { lineTotal } from "@/lib/pricing";
import { PrintButton } from "./PrintButton";

export default async function Receipt({ params }: PageProps<"/admin/orders/[number]/receipt">) {
  await requireAdmin();
  const [o] = await db.select().from(orders).where(eq(orders.number, (await params).number));
  if (!o) notFound();
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-xl bg-white p-8 print:p-0">
      <div className="flex items-start justify-between">
        <div><p className="text-2xl font-bold">{s.storeName}</p><p className="text-sm text-muted">{s.companyLine}</p><p className="text-sm text-muted">{s.address}</p></div>
        <div className="text-right"><p className="font-bold">Receipt</p><p className="text-sm">{o.number}</p><p className="text-sm text-muted">{o.createdAt.toLocaleDateString("en-GB")}</p></div>
      </div>
      <p className="mt-6 text-sm"><strong>Bill to:</strong> {o.name}<br />{o.email}<br /><span className="whitespace-pre-line">{o.address}</span></p>
      <table className="mt-6 w-full text-sm">
        <thead><tr className="border-b border-line text-left"><th className="py-2">Item</th><th>Qty</th><th className="text-right">Price</th><th className="text-right">Total</th></tr></thead>
        <tbody>{o.items.map((i) => <tr key={i.variantId} className="border-b border-line"><td className="py-2">{i.name}{i.label !== "Standard" && ` (${i.label})`}</td><td>{i.qty}</td><td className="text-right">{gbp(i.pricePence)}</td><td className="text-right">{gbp(lineTotal(i.pricePence, i.qty, i.discountPct))}</td></tr>)}</tbody>
      </table>
      <p className="mt-3 text-right text-lg font-bold">Total {gbp(o.totalPence)}</p>
      <p className="mt-1 text-right text-sm text-muted">Payment: {o.paymentMethodName} · Status: {o.status}</p>
      <p className="mt-8 text-xs text-muted">For laboratory research use only. Not for human or veterinary use.</p>
      <PrintButton />
    </div>
  );
}
