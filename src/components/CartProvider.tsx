"use client";
import { createContext, useContext, useMemo, useSyncExternalStore } from "react";

// The browser cart holds only variant IDs and quantities. The server recomputes price, name and stock at checkout.
export type CartItem = { variantId: number; qty: number };
type Ctx = {
  items: CartItem[];
  count: number;
  ready: boolean;
  add: (variantId: number, qty?: number) => void;
  setQty: (variantId: number, qty: number) => void;
  remove: (variantId: number) => void;
  clear: () => void;
};
const CartCtx = createContext<Ctx | null>(null);
const KEY = "kl-cart";
const EVENT = "kl-cart-change";

// localStorage as an external store: no setState-in-effect, and other tabs stay in sync via the storage event.
const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => { window.removeEventListener("storage", cb); window.removeEventListener(EVENT, cb); };
};
const read = () => { try { return localStorage.getItem(KEY) ?? "[]"; } catch { return "[]"; } };
const write = (items: CartItem[]) => {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  window.dispatchEvent(new Event(EVENT));
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  // null on the server and during hydration => ready=false, so there is no hydration mismatch.
  const raw = useSyncExternalStore<string | null>(subscribe, read, () => null);
  const items = useMemo<CartItem[]>(() => { try { return raw ? JSON.parse(raw) : []; } catch { return []; } }, [raw]);

  const value: Ctx = {
    items,
    ready: raw !== null,
    count: items.reduce((n, i) => n + i.qty, 0),
    add: (variantId, qty = 1) => {
      const found = items.find((i) => i.variantId === variantId);
      write(found ? items.map((i) => (i === found ? { ...i, qty: Math.min(99, i.qty + qty) } : i)) : [...items, { variantId, qty }]);
    },
    setQty: (variantId, qty) => write(qty <= 0 ? items.filter((i) => i.variantId !== variantId) : items.map((i) => (i.variantId === variantId ? { ...i, qty: Math.min(qty, 99) } : i))),
    remove: (variantId) => write(items.filter((i) => i.variantId !== variantId)),
    clear: () => write([]),
  };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
