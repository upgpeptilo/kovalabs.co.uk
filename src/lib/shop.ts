import { db, products, variants, categories } from "@/db";
import { and, asc, eq, inArray, ilike } from "drizzle-orm";
import { coasFor } from "./coas";

export type ShopProduct = typeof products.$inferSelect & {
  variants: (typeof variants.$inferSelect)[];
  category: string | null;
  fromPence: number;
  inStock: boolean;
};

export async function listProducts(opts: { category?: string; best?: boolean; kinds?: string[]; q?: string; slug?: string; includeHidden?: boolean } = {}): Promise<ShopProduct[]> {
  const where = [
    opts.includeHidden ? undefined : eq(products.published, true),
    opts.best ? eq(products.bestSeller, true) : undefined,
    opts.kinds ? inArray(products.kind, opts.kinds) : undefined,
    opts.slug ? eq(products.slug, opts.slug) : undefined,
    opts.q ? ilike(products.name, `%${opts.q.replace(/[%_]/g, "")}%`) : undefined,
    opts.category ? eq(categories.slug, opts.category) : undefined,
  ].filter(Boolean);
  const rows = await db
    .select({ p: products, cat: categories.name })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...where))
    .orderBy(asc(products.sort));
  if (!rows.length) return [];
  const vs = await db.select().from(variants).where(inArray(variants.productId, rows.map((r) => r.p.id))).orderBy(asc(variants.sort), asc(variants.pricePence));
  return rows.map(({ p, cat }) => {
    const pv = vs.filter((v) => v.productId === p.id);
    // purity comes from the real certificate, not the DB column (which only holds a fallback)
    const c = coasFor(p.slug)[0];
    return { ...p, purity: c ? `${c.purity}%` : "", variants: pv, category: cat, fromPence: pv.length ? Math.min(...pv.map((v) => v.pricePence)) : 0, inStock: pv.some((v) => v.stock > 0) };
  });
}

export async function getProduct(slug: string) {
  return (await listProducts({ slug }))[0];
}
