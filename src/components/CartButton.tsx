"use client";
import Link from "next/link";
import { useCart } from "./CartProvider";

export function CartButton() {
  const { count, ready } = useCart();
  return (
    <Link href="/cart" aria-label={`Cart, ${count} items`} className="relative grid h-11 w-11 place-items-center rounded-full hover:bg-card">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>
      {ready && count > 0 && (
        // key re-triggers the pop animation whenever the count changes
        <span key={count} className="rise absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">{count}</span>
      )}
    </Link>
  );
}
