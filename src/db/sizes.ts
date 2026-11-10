import "./env";
import { db, products, variants } from "./index";
import { eq } from "drizzle-orm";

// Sizes from the owner's price sheet (pence). Single-price products keep their one "Standard" variant.
// Idempotent: the first size reuses the existing variant row (so cart/order ids stay valid), the others are inserted if missing.
const SIZES: Record<string, [string, number][]> = {
  tesamorelin: [["5mg", 3999], ["10mg", 6999], ["20mg", 12999]],
  "bpc-157": [["5mg", 1999], ["10mg", 3499]],
  nad: [["500mg", 5999], ["1000mg", 9999]],
  "ghk-cu": [["50mg", 2999], ["100mg", 4999]],
  "bacteriostatic-water": [["10ml", 899]],
  "hgh-fragment-176-191": [["5mg", 2799]],
};

async function main() {
  for (const [slug, sizes] of Object.entries(SIZES)) {
    const [p] = await db.select().from(products).where(eq(products.slug, slug));
    if (!p) { console.log("missing product", slug); continue; }
    const have = await db.select().from(variants).where(eq(variants.productId, p.id)).orderBy(variants.id);
    for (const [i, [label, pricePence]] of sizes.entries()) {
      const row = have.find((v) => v.label === label) ?? (i === 0 ? have.find((v) => v.label === "Standard") : undefined);
      if (row) await db.update(variants).set({ label, pricePence, sort: i }).where(eq(variants.id, row.id));
      else await db.insert(variants).values({ productId: p.id, label, pricePence, stock: have[0]?.stock ?? 100, sort: i });
    }
    console.log("ok", slug, sizes.map((s) => s[0]).join("/"));
  }
}
main();
