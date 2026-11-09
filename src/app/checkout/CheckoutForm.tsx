"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { placeOrder, priceCart, type Line } from "@/lib/cart-actions";
import { gbp } from "@/lib/format";

type Method = { id: number; name: string; image: string; instructions: string };
const CH: Record<string, { label: string; submit: string; hint: string }> = {
  email: { label: "Email", submit: "Place order & send by email", hint: "We email you payment details." },
  whatsapp: { label: "WhatsApp", submit: "Place order & continue on WhatsApp", hint: "Opens WhatsApp with your order filled in." },
  sms: { label: "Text message", submit: "Place order & send by text", hint: "Opens your messaging app with your order." },
};

export function CheckoutForm({ methods, channels }: { methods: Method[]; channels: string[] }) {
  const { items, ready, clear } = useCart();
  const router = useRouter();
  const [data, setData] = useState<{ lines: Line[]; totalPence: number } | null>(null);
  const [method, setMethod] = useState<number | null>(methods.length === 1 ? methods[0].id : null);
  const [channel, setChannel] = useState(channels[0]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (ready) priceCart(items).then(setData); }, [items, ready]);

  if (!ready || !data) return <div className="wrap py-12"><div className="h-40 animate-pulse rounded-3xl bg-card" /></div>;
  const blocked = data.lines.length === 0 || data.lines.some((l) => !l.ok);
  if (!items.length || blocked) {
    return (
      <div className="wrap py-20 text-center">
        <h1 className="text-3xl font-bold">{items.length ? "Some items can't be ordered" : "Your cart is empty"}</h1>
        <div className="mt-6 flex justify-center gap-3">
          <Link href={items.length ? "/cart" : "/store"} className="btn btn-navy">{items.length ? "Review cart" : "Shop all peptides"}</Link>
          {items.length > 0 && <button type="button" className="btn btn-line" onClick={() => { if (window.confirm("Remove everything from your cart?")) clear(); }}>Clear cart</button>}
        </div>
      </div>
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!method) return setErr("Please choose a payment method.");
    setErr(""); setBusy(true);
    // Open the tab synchronously inside the click so popup blockers allow it; point it at WhatsApp/SMS once the server answers.
    const tab = channel === "whatsapp" ? window.open("", "_blank") : null;
    const f = new FormData(e.currentTarget);
    try {
      const r = await placeOrder({ items, name: String(f.get("name")), email: String(f.get("email")), phone: String(f.get("phone") || ""), address: String(f.get("address") || ""), notes: String(f.get("notes") || ""), paymentMethodId: method, channel });
      if (!r.ok) { tab?.close(); setErr(r.error); setBusy(false); return; }
      if (r.handoff) { if (tab) tab.location.href = r.handoff; else if (channel === "sms") window.location.href = r.handoff; }
      clear();
      router.push(`/order/${r.number}`);
    } catch {
      tab?.close(); setErr("Something went wrong. Please try again."); setBusy(false);
    }
  }

  const sel = methods.find((m) => m.id === method);
  return (
    <form onSubmit={submit} className="wrap grid max-w-5xl gap-8 py-10 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <section aria-labelledby="h-details" className="space-y-3">
          <h2 id="h-details" className="text-xl font-bold">1. Your details</h2>
          <div><label className="label" htmlFor="name">Full name</label><input id="name" name="name" required autoComplete="name" className="field" /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" className="field" /></div>
            <div><label className="label" htmlFor="phone">Phone (optional)</label><input id="phone" name="phone" type="tel" autoComplete="tel" className="field" /></div>
          </div>
          <div><label className="label" htmlFor="address">Delivery address</label><textarea id="address" name="address" required rows={3} autoComplete="street-address" className="field" /></div>
          <div><label className="label" htmlFor="notes">Notes (optional)</label><textarea id="notes" name="notes" rows={2} className="field" /></div>
        </section>

        <fieldset className="space-y-3">
          <legend className="text-xl font-bold">2. Payment method</legend>
          {methods.map((m) => (
            <label key={m.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 ${method === m.id ? "border-navy bg-white" : "border-line"}`}>
              <input type="radio" name="pm" className="h-5 w-5 accent-[#0c1033]" checked={method === m.id} onChange={() => setMethod(m.id)} />
              {m.image && <img src={m.image} alt="" className="h-8 w-auto" />}
              <span className="font-semibold">{m.name}</span>
            </label>
          ))}
          {sel && <p className="rounded-2xl bg-card p-4 text-sm">{sel.instructions}</p>}
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xl font-bold">3. Send my order by</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {channels.map((c) => (
              <label key={c} className={`cursor-pointer rounded-2xl border p-4 ${channel === c ? "border-navy bg-white" : "border-line"}`}>
                <input type="radio" name="ch" className="sr-only" checked={channel === c} onChange={() => setChannel(c)} />
                <span className="block font-semibold">{CH[c].label}</span><span className="text-sm text-muted">{CH[c].hint}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <aside className="h-fit rounded-3xl bg-card p-5 lg:sticky lg:top-28">
        <h2 className="text-xl font-bold">Order summary</h2>
        <ul className="mt-3 space-y-2 text-sm">{data.lines.map((l) => <li key={l.variantId} className="flex justify-between gap-3"><span>{l.qty} × {l.name}</span><span>{gbp(l.pricePence * l.qty)}</span></li>)}</ul>
        <p className="mt-4 flex justify-between border-t border-line pt-3 text-lg font-bold"><span>Total</span><span>{gbp(data.totalPence)}</span></p>
        {err && <p role="alert" className="mt-3 text-sm text-accent">{err}</p>}
        <button type="submit" disabled={busy} className="btn btn-navy mt-4 w-full">{busy ? "Placing order…" : CH[channel].submit}</button>
        <p className="mt-3 text-xs text-muted">No payment is taken on this site. For laboratory research use only; you confirm you are 18 or over.</p>
      </aside>
    </form>
  );
}
