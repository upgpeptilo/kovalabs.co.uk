import { notFound } from "next/navigation";
import { listProducts } from "@/lib/shop";
import { ProductGrid } from "@/components/ProductCard";

const COLLECTIONS: Record<string, { title: string; blurb: string }> = {
  "best-sellers": { title: "Best sellers", blurb: "The compounds our researchers reorder most." },
  bundles: { title: "Blends & Stacks", blurb: "Co-formulated blends in one vial, or stacks as individual vials." },
};

export default async function Collection({ params }: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const c = COLLECTIONS[slug];
  if (!c) notFound();
  const items = await listProducts(slug === "best-sellers" ? { best: true } : { kinds: ["blend", "stack"] });
  return (
    <div className="wrap py-8">
      <h1 className="text-3xl font-bold md:text-4xl">{c.title}</h1>
      <p className="mt-2 max-w-xl text-muted">{c.blurb}</p>
      <div className="mt-8"><ProductGrid items={items} /></div>
    </div>
  );
}
