"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { priceCart, type Line } from "@/lib/cart-actions";
import { gbp } from "@/lib/format";

export default function Cart() {
  const { items, ready, setQty, remove, clear } = useCart();
  const [data, setData] = useState<{ lines: Line[]; totalPence: number } | null>(null);
  const [gone, setGone] = useState<number | null>(null);

  useEffect(() => {
    if (!ready || !items.length) return; // an empty cart is rendered directly below, no fetch needed
    let live = true;
    priceCart(items).then((d) => live && setData(d));
    return () => { live = false; };
  }, [items, ready]);

  const confirmClear = () => { if (window.confirm("Remove everything from your cart?")) clear(); };

  if (ready && !items.length) {
    return <div className="wrap py-20 text-center"><h1 className="text-3xl font-bold">Your cart is empty</h1><Link href="/store" className="btn btn-navy mt-6">Shop all peptides</Link></div>;
  }
  if (!ready || !data) return <div className="wrap py-12"><div className="h-40 animate-pulse rounded-3xl bg-card" /></div>;
  const blocked = data.lines.some((l) => !l.ok);

  return (
    <div className="wrap max-w-3xl py-10">
      <div className="flex items-center justify-between"><h1 className="text-3xl font-bold">Your cart</h1><button type="button" onClick={confirmClear} className="text-sm underline">Clear cart</button></div>
      {data.lines.length === 0 && <p role="alert" className="mt-6 rounded-2xl bg-card p-4">Some items in your cart are no longer available. Clear your cart to continue.</p>}
      <ul className="mt-6 divide-y divide-line">
        {data.lines.map((l) => (
          <li key={l.variantId} className={`flex gap-4 py-4 transition duration-300 ${gone === l.variantId ? "translate-x-8 opacity-0" : ""}`}>
            <img src={l.image} alt="" className="h-20 w-20 rounded-2xl bg-card object-cover" />
            <div className="min-w-0 flex-1">
              <Link href={`/products/${l.slug}`} className="font-semibold">{l.name}</Link>
              {l.label !== "Standard" && <p className="text-sm text-muted">{l.label}</p>}
              <p className="text-sm">{gbp(l.pricePence)}</p>
              {!l.ok && <p role="alert" className="text-sm text-accent">{l.stock <= 0 ? "Out of stock" : `Only ${l.stock} left`}</p>}
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center rounded-full border border-line bg-white" role="group" aria-label={`Quantity for ${l.name}`}>
                  <button type="button" aria-label="Decrease" className="h-10 w-10" onClick={() => setQty(l.variantId, l.qty - 1)}>−</button>
                  <span className="w-8 text-center">{l.qty}</span>
                  <button type="button" aria-label="Increase" className="h-10 w-10" onClick={() => setQty(l.variantId, l.qty + 1)}>+</button>
                </div>
                <button type="button" className="text-sm underline" onClick={() => { setGone(l.variantId); setTimeout(() => { remove(l.variantId); setGone(null); }, 250); }}>Remove</button>
              </div>
            </div>
            <p className="font-semibold">{gbp(l.pricePence * l.qty)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 rounded-3xl bg-card p-5">
        <p className="flex justify-between text-lg font-bold"><span>Subtotal</span><span>{gbp(data.totalPence)}</span></p>
        <p className="mt-1 text-sm text-muted">Delivery is confirmed in your order email. Free 24-hour delivery on orders over £75.</p>
        {blocked ? <p className="mt-3 text-sm text-accent">Remove unavailable items to continue.</p> : <Link href="/checkout" className="btn btn-navy mt-4 w-full">Checkout</Link>}
      </div>
    </div>
  );
}
