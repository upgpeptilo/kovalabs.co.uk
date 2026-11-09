import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db, categories } from "@/db";
import { eq } from "drizzle-orm";
import { listProducts } from "@/lib/shop";
import { ProductGrid } from "@/components/ProductCard";

export async function generateMetadata({ params }: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [c] = await db.select().from(categories).where(eq(categories.slug, slug));
  return { title: c ? `${c.name} Research Peptides` : "Category" };
}

export default async function Category({ params }: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const [c] = await db.select().from(categories).where(eq(categories.slug, slug));
  if (!c) notFound();
  const items = await listProducts({ category: slug });
  return (
    <div className="wrap py-8">
      <p className="text-xs font-bold uppercase tracking-widest text-muted">Category</p>
      <h1 className="text-3xl font-bold md:text-4xl">{c.name}</h1>
      <p className="mt-2 max-w-xl text-muted">{c.blurb}</p>
      <div className="mt-8"><ProductGrid items={items} /></div>
    </div>
  );
}
