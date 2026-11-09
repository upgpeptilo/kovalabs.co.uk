"use client";
import { useActionState } from "react";
import { FormSwitch } from "@/components/admin/Switches";
import { ImageInput } from "@/components/admin/ImageInput";
import { saveProduct } from "../actions";

type P = { name: string; slug: string; description: string; categoryId: number | null; images: string[]; badge: string; kind: string; bestSeller: boolean; published: boolean; variantsText: string };

export function ProductForm({ id, cats, p }: { id: number | null; cats: { id: number; name: string }[]; p: P | null }) {
  const [state, action, pending] = useActionState(saveProduct.bind(null, id), null);
  return (
    <form action={action} className="mt-4 space-y-4">
      <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" required defaultValue={p?.name} className="field" /></div>
      <div><label className="label" htmlFor="slug">URL slug (optional)</label><input id="slug" name="slug" defaultValue={p?.slug} className="field" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="cat">Category</label><select id="cat" name="categoryId" defaultValue={p?.categoryId ?? ""} className="field"><option value="">None</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label className="label" htmlFor="kind">Type</label><select id="kind" name="kind" defaultValue={p?.kind ?? "single"} className="field"><option value="single">Single</option><option value="blend">Blend</option><option value="stack">Stack</option><option value="accessory">Accessory</option></select></div>
      </div>
      <div><label className="label" htmlFor="desc">Description</label><textarea id="desc" name="description" rows={4} defaultValue={p?.description} className="field" /></div>
      <ImageInput name="images" label="Images (the first is the main image)" multiple defaultValue={p?.images.join("\n")} />
      <div>
        <label className="label" htmlFor="vars">Variants: one per line as <code>label | price | stock</code></label>
        <textarea id="vars" name="variants" rows={4} required defaultValue={p?.variantsText ?? "Standard | 0.00 | 100"} className="field font-mono text-sm" />
        <p className="mt-1 text-xs text-muted">Price in pounds. A single &quot;Standard&quot; variant hides the size picker. Stock 0 shows Sold out.</p>
      </div>
      <div><label className="label" htmlFor="badge">Badge (optional, e.g. Selling fast)</label><input id="badge" name="badge" defaultValue={p?.badge} className="field" /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormSwitch name="bestSeller" label="Best seller" defaultChecked={p?.bestSeller} />
        <FormSwitch name="published" label="Published" defaultChecked={p?.published ?? true} />
      </div>
      {state?.error && <p role="alert" className="text-sm text-accent">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-navy">{pending ? "Saving…" : "Save product"}</button>
    </form>
  );
}
