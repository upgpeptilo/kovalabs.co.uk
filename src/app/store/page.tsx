import Link from "next/link";
import type { Metadata } from "next";
import { db, categories } from "@/db";
import { asc } from "drizzle-orm";
import { listProducts } from "@/lib/shop";
import { ProductGrid } from "@/components/ProductCard";

export const metadata: Metadata = { title: "Shop UK Research Peptides" };

export default async function Store({ searchParams }: PageProps<"/store">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const sort = typeof sp.sort === "string" ? sp.sort : "featured";
  const cats = await db.select().from(categories).orderBy(asc(categories.sort));
  let items = await listProducts({ q });
  if (sort === "low") items = [...items].sort((a, b) => a.fromPence - b.fromPence);
  if (sort === "high") items = [...items].sort((a, b) => b.fromPence - a.fromPence);
  if (sort === "name") items = [...items].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="wrap py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h1 className="text-3xl font-bold md:text-4xl">All research peptides</h1>
        {/* GET form: search + sort work with no JS */}
        <form className="flex w-full gap-2 md:w-auto" role="search">
          <input name="q" defaultValue={q} placeholder="Search peptides" aria-label="Search peptides" className="field min-w-0 flex-1 !rounded-full md:!w-56 md:flex-none" autoFocus={sp.focus === "search"} />
          <select name="sort" defaultValue={sort} aria-label="Sort" className="field !w-28 !rounded-full md:!w-auto">
            <option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name</option>
          </select>
          <button className="btn btn-navy" type="submit">Go</button>
        </form>
      </div>
      <nav aria-label="Categories" className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {[{ slug: "", name: "All", href: "/store" }, ...cats.map((c) => ({ slug: c.slug, name: c.name, href: `/categories/${c.slug}` })), { slug: "b", name: "Blends & Stacks", href: "/collections/bundles" }].map((c, i) => (
          <Link key={c.name} href={c.href} className={`shrink-0 rounded-full border px-4 py-2 text-sm ${i === 0 ? "border-navy bg-navy text-white" : "border-line bg-white hover:border-navy"}`}>{c.name}</Link>
        ))}
      </nav>
      <div className="mt-8"><ProductGrid items={items} /></div>
    </div>
  );
}
