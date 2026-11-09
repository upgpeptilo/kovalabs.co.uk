import Link from "next/link";
import { db, categories, testimonials } from "@/db";
import { asc, desc } from "drizzle-orm";
import { listProducts } from "@/lib/shop";
import { ProductGrid } from "@/components/ProductCard";
import { HeroSlider, type Slide } from "@/components/HeroSlider";

const SLIDES: Slide[] = [
  { img: "/heroes/hero-metabolic-mots-v1.webp", title: "Research peptides, done properly.", sub: "99%+ purity. Independently tested. CoA with every batch. Dispatched same-day from the UK on orders before 3pm.", cta: "Shop all peptides", href: "/store" },
  { img: "/heroes/hero-cellular-v1.webp", title: "Cellular & senescence research.", sub: "Glutathione, NAD+ and Epithalon, each with a published certificate.", cta: "Shop cellular", href: "/categories/cellular" },
  { img: "/heroes/hero-gh-axis-v2.webp", title: "GH-axis & secretagogues.", sub: "Tesamorelin, Ipamorelin, CJC-1295 and more, HPLC-tested.", cta: "Shop GH axis", href: "/categories/gh-axis" },
  { img: "/heroes/hero-tissue-repair.webp", title: "Tissue repair compounds.", sub: "BPC-157, TB-500, GHK-Cu and KPV, cold-chain stored.", cta: "Shop tissue repair", href: "/categories/tissue-repair" },
  { img: "/heroes/hero-neuropeptides.webp", title: "Neuropeptides.", sub: "Selank, Semax and DSIP, lab-tested to 99%+ purity.", cta: "Shop neuropeptides", href: "/categories/neuropeptides" },
];

const WHY = [
  ["99%+ Purity", "HPLC-tested"],
  ["ISO/IEC 17025 Tested", "Accredited lab"],
  ["Next-Day Delivery", "Same-day dispatch"],
];

export default async function Home() {
  const [best, bundles, cats, reviews] = await Promise.all([
    listProducts({ best: true }),
    listProducts({ kinds: ["blend", "stack"] }),
    db.select().from(categories).orderBy(asc(categories.sort)),
    db.select().from(testimonials).orderBy(desc(testimonials.id)).limit(6),
  ]);
  const fields = cats.filter((c) => c.image);

  return (
    <>
      <HeroSlider slides={SLIDES} />
      <section className="border-b border-line bg-cream">
        <ul className="wrap grid grid-cols-1 gap-2 py-4 text-sm sm:grid-cols-3">
          {WHY.map(([a, b]) => <li key={a} className="text-center"><strong className="uppercase tracking-wide">{a}</strong> <span className="text-muted">({b})</span></li>)}
        </ul>
      </section>

      <section className="wrap pt-14">
        <div className="mb-6 flex items-end justify-between"><h2 className="text-3xl font-bold">Best sellers</h2><Link href="/collections/best-sellers" className="text-sm font-semibold underline">View all →</Link></div>
        <ProductGrid items={best} />
      </section>

      <section className="wrap grid gap-8 pt-20 lg:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="text-4xl font-bold leading-tight">The Research Fields</h2>
          <p className="mt-3 max-w-xs text-muted">Five research ranges, grouped by the pathway each compound acts on: metabolic, the GH axis, tissue repair, neuropeptides, and cellular.</p>
          <Link href="/store" className="btn btn-navy mt-5">Shop all compounds</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {fields.map((c, n) => (
            <Link key={c.id} href={`/categories/${c.slug}`} className={`group relative isolate flex min-h-44 items-end overflow-hidden rounded-3xl p-4 text-white ${n === 0 ? "col-span-2" : ""}`}>
              <img src={c.image} alt="" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy/80 to-transparent" />
              <div><h3 className="text-lg font-bold uppercase tracking-wide">{c.name}</h3><p className="text-xs text-white/80">{c.blurb}</p></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap pt-20">
        <div className="mb-6 flex items-end justify-between"><h2 className="text-3xl font-bold">Blends &amp; Stacks</h2><Link href="/collections/bundles" className="text-sm font-semibold underline">View all →</Link></div>
        <ProductGrid items={bundles.slice(0, 4)} />
      </section>

      <section className="mt-20 bg-navy py-16 text-white">
        <div className="wrap text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Read the certificate before you buy.</h2>
          <p className="mt-2 text-white/70">Every batch, tested by an independent ISO/IEC 17025 accredited lab.</p>
          <Link href="/coas" className="btn mt-6 bg-cream text-navy">Browse all certificates →</Link>
        </div>
      </section>

      <section className="wrap pt-20">
        <h2 className="text-center text-3xl font-bold">What our researchers say.</h2>
        <p className="mt-1 text-center text-muted">Rated 4.9 out of 5 from 192 reviews.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.id} className="rounded-3xl border border-line bg-card p-5">
              <p className="text-accent" aria-label={`${r.rating} out of 5`}>{"★".repeat(r.rating)}</p>
              {r.title && <p className="mt-1 font-semibold">{r.title}</p>}
              <blockquote className="mt-1 text-sm">{r.body}</blockquote>
              <figcaption className="mt-3 text-xs text-muted">{r.name} · {r.date} · Verified purchase{r.product && ` on ${r.product}`}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-6 text-center"><Link href="/reviews" className="text-sm font-semibold underline">Read all reviews →</Link></p>
      </section>

      <section className="mt-20 bg-navy py-16 text-white">
        <div className="wrap grid gap-8 md:grid-cols-2">
          <h2 className="text-4xl font-bold leading-tight md:text-5xl">For research use only.<br /><span className="text-white/60">Not for human consumption.</span></h2>
          <div className="text-sm text-white/80">
            <p>Kovalabs supplies research-grade peptides for laboratory and in-vitro studies only. They are not medicines, hold no UK marketing authorisation, and are not intended to diagnose, treat, cure or prevent any condition.</p>
            <Link href="/research-disclaimer" className="mt-3 inline-block font-semibold underline">Read the full disclaimer →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
