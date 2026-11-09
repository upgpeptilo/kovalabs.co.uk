import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { listProducts } from "@/lib/shop";
import { gbp } from "@/lib/format";

export default async function AdminProducts() {
  await requireAdmin();
  const items = await listProducts({ includeHidden: true });
  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Products</h1><Link href="/admin/products/new" className="btn btn-navy">New product</Link></div>
      <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
        {items.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/products/${p.id}`} className="flex min-h-16 items-center gap-3 px-3 py-2 hover:bg-card">
              <img src={p.images[0]} alt="" className="h-12 w-12 rounded-xl bg-card object-cover" loading="lazy" />
              <span className="min-w-0 flex-1"><strong className="block truncate">{p.name}</strong><span className="text-xs text-muted">{p.category} · {p.variants.length} variant(s){!p.published && " · hidden"}</span></span>
              <span>{gbp(p.fromPence)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
