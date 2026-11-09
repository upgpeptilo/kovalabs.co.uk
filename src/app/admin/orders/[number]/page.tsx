import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, orders } from "@/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { gbp } from "@/lib/format";
import { STATUSES } from "@/lib/statuses";

export default async function AdminOrder({ params }: PageProps<"/admin/orders/[number]">) {
  await requireAdmin();
  const { number } = await params;
  const [o] = await db.select().from(orders).where(eq(orders.number, number));
  if (!o) notFound();

  async function setStatus(f: FormData) {
    "use server";
    await requireAdmin();
    const status = String(f.get("status"));
    if (!(STATUSES as readonly string[]).includes(status)) return;
    await db.update(orders).set({ status }).where(eq(orders.number, number));
    revalidatePath("/admin", "layout");
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin" className="text-sm underline">← Orders</Link>
      <h1 className="mt-2 text-2xl font-bold">{o.number}</h1>
      <p className="text-sm text-muted">{o.createdAt.toLocaleString("en-GB")} · via {o.channel} · {o.paymentMethodName}</p>
      <form action={setStatus} className="mt-4 flex gap-2">
        <label className="sr-only" htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={o.status} className="field !w-auto">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <button type="submit" className="btn btn-navy">Update status</button>
        <Link href={`/admin/orders/${o.number}/receipt`} target="_blank" className="btn btn-line">Print receipt</Link>
      </form>
      <div className="mt-6 rounded-2xl border border-line bg-white p-4">
        <ul className="divide-y divide-line text-sm">{o.items.map((i) => <li key={i.variantId} className="flex justify-between py-2"><span>{i.qty} × {i.name}{i.label !== "Standard" && ` (${i.label})`}</span><span>{gbp(i.pricePence * i.qty)}</span></li>)}</ul>
        <p className="mt-2 flex justify-between border-t border-line pt-2 font-bold"><span>Total</span><span>{gbp(o.totalPence)}</span></p>
      </div>
      <dl className="mt-4 space-y-1 rounded-2xl border border-line bg-white p-4 text-sm">
        <div><dt className="inline text-muted">Name: </dt><dd className="inline">{o.name}</dd></div>
        <div><dt className="inline text-muted">Email: </dt><dd className="inline"><a className="underline" href={`mailto:${o.email}`}>{o.email}</a></dd></div>
        {o.phone && <div><dt className="inline text-muted">Phone: </dt><dd className="inline">{o.phone}</dd></div>}
        <div><dt className="inline text-muted">Address: </dt><dd className="inline whitespace-pre-line">{o.address}</dd></div>
        {o.notes && <div><dt className="inline text-muted">Notes: </dt><dd className="inline whitespace-pre-line">{o.notes}</dd></div>}
      </dl>
    </div>
  );
}
