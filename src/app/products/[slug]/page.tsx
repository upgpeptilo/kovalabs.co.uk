import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db, testimonials } from "@/db";
import { desc, sql } from "drizzle-orm";
import { getProduct, listProducts } from "@/lib/shop";
import { getSettings } from "@/lib/settings";
import { gbp } from "@/lib/format";
import { coasFor, coaUrl, longDate } from "@/lib/coas";
import { Gallery } from "@/components/Gallery";
import { ProductBuy, QuickAdd } from "@/components/AddToCart";
import { ProductGrid } from "@/components/ProductCard";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  return p ? { title: `${p.name} | ISO 17025 Lab-Tested UK`, description: p.description, openGraph: { images: p.images.slice(0, 1) } } : {};
}

// Next working day (UK time) if ordered before 15:00 Mon-Fri, otherwise the one after: matches "dispatched same day, 24-hour delivery".
function arrival() {
  const uk = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/London" }));
  let days = uk.getDay() >= 1 && uk.getDay() <= 5 && uk.getHours() < 15 ? 1 : 2;
  const d = new Date(uk);
  while (days > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) days--; }
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
}

export default async function Product({ params }: PageProps<"/products/[slug]">) {
  const p = await getProduct((await params).slug);
  if (!p) notFound();
  const coas = coasFor(p.slug);
  // Stack/Blend pairs share a slug stem (glow-stack / glow-blend).
  const stem = p.slug.match(/^(.*)-(stack|blend)$/);
  const [s, related, water, reviews, [{ n: reviewCount }], mate] = await Promise.all([
    getSettings(),
    p.category ? listProducts({ category: undefined }).then((all) => all.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4)) : [],
    getProduct("bacteriostatic-water"),
    db.select().from(testimonials).orderBy(desc(testimonials.id)).limit(4),
    db.select({ n: sql<number>`count(*)::int` }).from(testimonials),
    stem ? getProduct(`${stem[1]}-${stem[2] === "stack" ? "blend" : "stack"}`) : undefined,
  ]);

  return (
    <div className="wrap py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted"><Link href="/store" className="underline">Shop</Link> / {p.category} / {p.name}</nav>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <Gallery images={p.images} alt={`${p.name} vial`} />
          {p.purity && <p className="mt-3 text-sm"><span className="mr-3 rounded-full bg-white px-3 py-1">ISO 17025 TESTED</span><span className="rounded-full bg-white px-3 py-1">✓ {p.purity} · <Link href="/coas" className="underline">View COA</Link></span></p>}
        </div>
        <div className="min-w-0 rounded-3xl border border-line bg-white/50 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">{p.kind === "single" ? p.category : p.kind === "accessory" ? "Accessories" : "Blends & Stacks"}</p>
          <h1 className="mt-1 text-4xl font-bold">{p.name}</h1>
          <p className="mt-1 text-sm"><span className="text-accent">★★★★★</span> <Link href="/reviews" className="underline">{reviewCount} reviews</Link></p>
          {mate && (
            <div className="mt-4 inline-flex rounded-full border border-line bg-white p-1" role="group" aria-label="Format">
              {[p, mate].sort((a, b) => (a.kind === "stack" ? -1 : 1) - (b.kind === "stack" ? -1 : 1)).map((x) => (
                <Link key={x.id} href={`/products/${x.slug}`} aria-current={x.id === p.id ? "page" : undefined} className={`rounded-full px-5 py-2 text-sm font-semibold ${x.id === p.id ? "bg-navy text-white" : "hover:bg-card"}`}>{x.kind === "stack" ? "Stack" : "Blend"}</Link>
              ))}
            </div>
          )}
          <div className="mt-4"><ProductBuy slug={p.slug} coa={coas[0] && coaUrl(coas[0])} arrival={arrival()} variants={p.variants.map(({ id, label, pricePence, stock }) => ({ id, label, pricePence, stock }))} /></div>
          <ul className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
            <li>Dispatched same day Mon–Fri when ordered before 3pm.</li>
            <li>Free 24-hour delivery on orders over £{s.freeDeliveryOver}.</li>
            <li>For laboratory research only. Not for human or veterinary use. <Link href="/research-disclaimer" className="underline">Disclaimer</Link></li>
          </ul>
        </div>
      </div>

      {water && water.id !== p.id && (
        <div className="mt-8 flex items-center gap-4 rounded-3xl bg-card p-4">
          <img src={water.images[0]} alt="" className="h-16 w-16 rounded-xl object-cover" loading="lazy" />
          <div className="flex-1"><p className="text-xs font-bold uppercase tracking-widest text-accent">Needed for reconstitution</p><p className="font-semibold">{water.name} · {gbp(water.fromPence)}</p></div>
          <div className="w-28"><QuickAdd variantId={water.variants[0].id} soldOut={!water.inStock} /></div>
        </div>
      )}

      {coas.length > 0 && (
        <section className="mt-12" aria-labelledby="coa-h">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-muted">Verified test results</p>
          <h2 id="coa-h" className="text-center text-3xl font-bold">Every batch, independently tested.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {coas.map((c) => (
              <article key={c.file} className="rounded-3xl bg-navy p-6 text-white">
                <p className="text-sm text-white/70">ILS Laboratories · ISO/IEC 17025 accredited</p>
                <p className="mt-2 text-5xl font-bold">{c.purity}<span className="text-2xl">%</span></p>
                <p className="text-xs font-bold uppercase tracking-widest text-white/60">Purity by HPLC</p>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div><dt className="text-white/60">Batch</dt><dd>{c.lot}</dd></div>
                  <div><dt className="text-white/60">Tested</dt><dd>{longDate(c.testedISO)}</dd></div>
                  <div><dt className="text-white/60">Labelled</dt><dd>{c.labelled}</dd></div>
                  <div><dt className="text-white/60">Measured</dt><dd className="text-accent">{c.netMg ?? "n/a"} mg</dd></div>
                </dl>
                <a href={coaUrl(c)} target="_blank" rel="noopener noreferrer" className="btn mt-5 w-full bg-cream text-navy">View certificate →</a>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-line p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Compound information</p>
          <h2 className="mt-1 text-2xl font-bold">About {p.name}</h2>
          <p className="mt-3 text-muted">{p.description}</p>
        </div>
        <div className="rounded-3xl border border-line p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Molecular profile</p>
          <h2 className="mt-1 text-2xl font-bold">Specifications</h2>
          <dl className="mt-3 divide-y divide-line text-sm">
            <div className="flex justify-between py-2"><dt className="text-muted">Product</dt><dd>{p.name}</dd></div>
            <div className="flex justify-between py-2"><dt className="text-muted">Form</dt><dd>Lyophilised powder</dd></div>
            <div className="flex justify-between py-2"><dt className="text-muted">Storage</dt><dd>−20 °C</dd></div>
            {p.purity && <div className="flex justify-between py-2"><dt className="text-muted">Purity (HPLC)</dt><dd>{p.purity}</dd></div>}
          </dl>
        </div>
      </section>

      <section className="mt-8 rounded-3xl bg-navy p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Important research notice</p>
        <p className="mt-2 font-semibold">Not for human or veterinary use.</p>
        <p className="mt-1 text-sm text-white/75">This product is supplied for laboratory research only. It is not a medicine and is not intended to diagnose, treat, cure or prevent any disease.</p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Reviews</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {reviews.map((r) => (
            <figure key={r.id} className="rounded-2xl border border-line p-4">
              <p className="text-accent" aria-label={`${r.rating} out of 5`}>{"★".repeat(r.rating)}</p>
              <blockquote className="text-sm">{r.body}</blockquote>
              <figcaption className="mt-2 text-xs text-muted">{r.name} · Verified purchase</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {related.length > 0 && <section className="mt-12"><h2 className="mb-4 text-2xl font-bold">More from {p.category}</h2><ProductGrid items={related} /></section>}
    </div>
  );
}
