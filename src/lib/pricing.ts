// Quantity discounts, counted per cart line (same product + size). Used by the server (authoritative) and the UI (preview).
export const TIERS = [{ min: 3, pct: 10 }, { min: 5, pct: 20 }, { min: 10, pct: 25 }] as const;
// ponytail: products with no quantity discount are a code list; make it a product field if the owner wants to edit it in admin.
export const NO_TIERS = ["hgh-fragment-176-191", "cellular-stack"];

export const tiered = (slug: string) => !NO_TIERS.includes(slug);
export const pctFor = (slug: string, qty: number) => (tiered(slug) ? [...TIERS].reverse().find((t) => qty >= t.min)?.pct ?? 0 : 0);
export const lineTotal = (unitPence: number, qty: number, pct = 0) => Math.round((unitPence * qty * (100 - pct)) / 100);
