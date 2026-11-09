import Link from "next/link";
import { notFound } from "next/navigation";
import { db, categories, products, variants } from "@/db";
import { asc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { ProductForm } from "./ProductForm";
import { deleteProduct } from "../actions";

export default async function EditProduct({ params }: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const cats = await db.select().from(categories).orderBy(asc(categories.sort));
  let p = null, vs: (typeof variants.$inferSelect)[] = [];
  if (id !== "new") {
    [p] = await db.select().from(products).where(eq(products.id, Number(id)));
    if (!p) notFound();
    vs = await db.select().from(variants).where(eq(variants.productId, p.id)).orderBy(asc(variants.sort));
  }
  const del = p ? deleteProduct.bind(null, p.id) : null;
  return (
    <div className="max-w-2xl">
      <Link href="/admin/products" className="text-sm underline">← Products</Link>
      <h1 className="mt-2 text-2xl font-bold">{p ? `Edit ${p.name}` : "New product"}</h1>
      <ProductForm id={p?.id ?? null} cats={cats.map((c) => ({ id: c.id, name: c.name }))} p={p ? { ...p, variantsText: vs.map((v) => `${v.label} | ${(v.pricePence / 100).toFixed(2)} | ${v.stock}`).join("\n") } : null} />
      {del && <form action={del} className="mt-8 border-t border-line pt-6"><button type="submit" className="btn btn-line !border-accent !text-accent">Delete product</button></form>}
    </div>
  );
}
