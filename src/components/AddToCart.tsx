"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";

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
const gbp = (p: number) => `£${(p / 100).toFixed(2)}`;

// Product page: variant picker, quantity, Add to cart + Proceed to checkout.
export function ProductBuy({ variants }: { variants: V[] }) {
  const { add } = useCart();
  const router = useRouter();
  const multi = variants.length > 1;
  const [vid, setVid] = useState<number | null>(multi ? null : variants[0]?.id ?? null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const v = variants.find((x) => x.id === vid);
  const out = variants.every((x) => x.stock <= 0);
  const disabled = !v || v.stock <= 0;

  return (
    <div className="space-y-4">
      <p className="text-3xl font-bold">{v ? gbp(v.pricePence) : `From ${gbp(Math.min(...variants.map((x) => x.pricePence)))}`}</p>
      {multi && (
        <fieldset>
          <legend className="label">Size</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((x) => (
              <button
                key={x.id}
                type="button"
                disabled={x.stock <= 0}
                aria-pressed={vid === x.id}
                onClick={() => setVid(x.id)}
                className={`min-h-11 rounded-full border px-5 font-semibold transition ${vid === x.id ? "border-navy bg-navy text-white" : "border-line bg-white hover:border-navy"} disabled:opacity-40`}
              >
                {x.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-line bg-white" role="group" aria-label="Quantity">
          <button type="button" className="h-11 w-11 text-xl" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
          <span className="w-8 text-center font-semibold" aria-live="polite">{qty}</span>
          <button type="button" className="h-11 w-11 text-xl" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(99, q + 1))}>+</button>
        </div>
        <button type="button" disabled={disabled} className="btn btn-navy flex-1" onClick={() => { add(v!.id, qty); setAdded(true); }}>
          {out ? "Sold out" : `Add to cart${v ? ` · ${gbp(v.pricePence * qty)}` : ""}`}
        </button>
      </div>
      <button type="button" disabled={disabled} className="btn btn-line w-full" onClick={() => { add(v!.id, qty); router.push("/checkout"); }}>
        Proceed to checkout
      </button>
      {added && <Link href="/store" className="btn btn-line w-full">Continue shopping</Link>}
    </div>
  );
}
