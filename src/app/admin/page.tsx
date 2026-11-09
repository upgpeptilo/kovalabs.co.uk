import Link from "next/link";
import { db, orders } from "@/db";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { gbp } from "@/lib/format";

export default async function AdminOrders() {
  await requireAdmin();
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200);
  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      {rows.length === 0 ? <p className="mt-6 text-muted">No orders yet.</p> : (
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
          {rows.map((o) => (
            <li key={o.id}>
              <Link href={`/admin/orders/${o.number}`} className="flex min-h-14 flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-card">
                <span><strong>{o.number}</strong> <span className="text-sm text-muted">· {o.name}</span><br /><span className="text-xs text-muted">{o.createdAt.toLocaleString("en-GB")} · via {o.channel}</span></span>
                <span className="text-right"><span className="block font-semibold">{gbp(o.totalPence)}</span><span className="rounded-full bg-card px-2 py-0.5 text-xs">{o.status}</span></span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
