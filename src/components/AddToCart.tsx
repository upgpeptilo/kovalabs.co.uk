"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { TIERS, pctFor, lineTotal, tiered } from "@/lib/pricing";
import { gbp } from "@/lib/format";

// Product-card "+ Add" button.
export function QuickAdd({ variantId, soldOut }: { variantId: number; soldOut?: boolean }) {
  const { add } = useCart();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      disabled={soldOut}
      className="btn btn-navy flex-1 !min-h-10 !px-3 text-sm"
      onClick={() => { add(variantId); setDone(true); setTimeout(() => setDone(false), 1200); }}
    >
      {soldOut ? "Sold out" : done ? "✓ Added" : "+ Add"}
    </button>
  );
}

type V = { id: number; label: string; pricePence: number; stock: number };

// Product page: size picker, quantity, quantity-pricing tiers, COA link, Add to cart + Proceed to checkout.
export function ProductBuy({ slug, variants, coa, arrival }: { slug: string; variants: V[]; coa?: string; arrival: string }) {
  const { add } = useCart();
  const router = useRouter();
  const multi = variants.length > 1;
  const [vid, setVid] = useState<number>(variants.find((x) => x.stock > 0)?.id ?? variants[0]?.id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const v = variants.find((x) => x.id === vid);
  const out = variants.every((x) => x.stock <= 0);
  const disabled = !v || v.stock <= 0;
  const unit = v?.pricePence ?? 0;
  const pct = pctFor(slug, qty);
  const next = tiered(slug) ? TIERS.find((t) => t.min > qty) : undefined;
  const badge: Record<number, string> = { 5: "Most popular", 10: "Best value" };
  const pick = (n: number) => setQty(Math.max(n, 1));

  return (
    <div className="space-y-5">
      <div className="flex items-end gap-3">
        <p className="text-4xl font-bold">{gbp(lineTotal(unit, 1, 0))}</p>
        {pct > 0 && <p className="pb-1 text-sm font-semibold text-accent">{pct}% off at {qty}</p>}
      </div>

      {multi && (
        <fieldset>
          <legend className="label">Size</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((x) => (
              <button key={x.id} type="button" disabled={x.stock <= 0} aria-pressed={vid === x.id} onClick={() => setVid(x.id)}
                className={`min-h-11 rounded-full border px-5 font-semibold transition ${vid === x.id ? "border-navy bg-navy text-white" : "border-line bg-white hover:border-navy"} disabled:opacity-40`}>
                {x.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {tiered(slug) && v && (
        <fieldset>
          <legend className="label">Quantity pricing</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[{ min: 1, pct: 0 }, ...TIERS].map((t) => {
              const on = pct === t.pct;
              return (
                <button key={t.min} type="button" aria-pressed={on} onClick={() => pick(t.min)}
                  className={`relative rounded-2xl border p-3 text-left transition ${on ? "border-navy bg-navy text-white" : "border-line bg-white hover:border-navy"}`}>
                  {badge[t.min] && <span className="absolute -top-2 left-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">{badge[t.min]}</span>}
                  <span className="block text-sm font-bold">{t.min === 1 ? "1 vial" : `${t.min}+ vials`}</span>
                  <span className={`block text-xs ${on ? "text-white/70" : "text-muted"}`}>{t.pct ? `Save ${t.pct}%` : "Standard"}</span>
                  <span className="mt-1 block font-semibold">{gbp(lineTotal(unit, t.min, t.pct))}</span>
                  <span className={`block text-xs ${on ? "text-white/70" : "text-muted"}`}>{gbp(lineTotal(unit, 1, t.pct))} each</span>
                </button>
              );
            })}
          </div>
          {next && <p className="mt-2 text-sm text-accent">Add {next.min - qty} more to save {next.pct}%.</p>}
        </fieldset>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-line bg-white" role="group" aria-label="Quantity">
          <button type="button" className="h-11 w-11 text-xl" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
          <span className="w-8 text-center font-semibold" aria-live="polite">{qty}</span>
          <button type="button" className="h-11 w-11 text-xl" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(99, q + 1))}>+</button>
        </div>
        <button type="button" disabled={disabled} className="btn btn-navy flex-1" onClick={() => { add(v!.id, qty); setAdded(true); }}>
          {out ? "Sold out" : `Add to cart · ${gbp(lineTotal(unit, qty, pct))}`}
        </button>
      </div>
      <button type="button" disabled={disabled} className="btn btn-line w-full" onClick={() => { add(v!.id, qty); router.push("/checkout"); }}>Proceed to checkout</button>
      {added && <Link href="/store" className="btn btn-line w-full">Continue shopping</Link>}
      {coa && <a href={coa} target="_blank" rel="noopener noreferrer" className="btn btn-line w-full">View certificate of analysis (COA)</a>}
      <p className="text-sm text-muted">Order now for estimated arrival <strong className="text-ink">{arrival}</strong>.</p>
    </div>
  );
}
