import Link from "next/link";
import { gbp } from "@/lib/format";
import type { ShopProduct } from "@/lib/shop";
import { QuickAdd } from "./AddToCart";

export function ProductCard({ p, eager = false }: { p: ShopProduct; eager?: boolean }) {
  const multi = p.variants.length > 1;
  return (
    <article className="group flex flex-col">
      <Link href={`/products/${p.slug}`} className="relative block aspect-[4/5] overflow-hidden rounded-3xl bg-card">
        {/* plain <img>: remote image host, sizes handled by the source */}
        <img src={p.images[0]} alt={`${p.name} vial`} loading={eager ? "eager" : "lazy"} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        {p.badge && <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-white">{p.badge}</span>}
        {p.purity && <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium">✓ {p.purity} · View COA</span>}
      </Link>
      <h3 className="mt-3 font-semibold">{p.name}</h3>
      <p className="text-lg">{multi && <span className="mr-1 text-xs text-muted">From</span>}{gbp(p.fromPence)}</p>
      <div className="mt-2 flex gap-2">
        <Link href={`/products/${p.slug}`} className="btn btn-line flex-1 !min-h-10 !px-3 text-sm">Details</Link>
        {multi ? (
          <Link href={`/products/${p.slug}`} className="btn btn-navy flex-1 !min-h-10 !px-3 text-sm">Choose</Link>
        ) : (
          <QuickAdd variantId={p.variants[0]?.id} soldOut={!p.inStock} />
        )}
      </div>
    </article>
  );
}

export function ProductGrid({ items }: { items: ShopProduct[] }) {
  if (!items.length) return <p className="py-16 text-center text-muted">No products found.</p>;
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4 lg:gap-x-5">
      {items.map((p, i) => <ProductCard key={p.id} p={p} eager={i < 4} />)}
    </div>
  );
}
