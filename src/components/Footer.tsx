import Link from "next/link";
import { db, categories } from "@/db";
import { asc } from "drizzle-orm";
import { SHOP, LEARN, COMPANY } from "@/lib/nav";
import type { Settings } from "@/lib/settings";
import { Logo } from "./Header";

function Col({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">{title}</h3>
      <ul className="space-y-1">{links.map((l) => <li key={l.href}><Link href={l.href} className="inline-flex min-h-9 items-center text-sm hover:underline">{l.label}</Link></li>)}</ul>
    </div>
  );
}

export async function Footer({ s }: { s: Settings }) {
  const cats = await db.select().from(categories).orderBy(asc(categories.sort));
  return (
    <footer className="mt-24 border-t border-line">
      <div className="wrap grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Logo className="text-3xl" />
          <p className="mt-4 max-w-xs text-sm text-muted">{s.tagline}</p>
        </div>
        <Col title="Shop" links={SHOP} />
        <Col title="Categories" links={cats.map((c) => ({ href: `/categories/${c.slug}`, label: c.name }))} />
        <Col title="Learn" links={LEARN} />
        <Col title="Company" links={COMPANY} />
      </div>
      <div className="wrap flex flex-col gap-4 border-t border-line py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Stay in the loop</p>
          <p className="text-sm">New COAs, restock alerts, new compounds. No spam, no bs.</p>
        </div>
        <a href={`mailto:${s.email}?subject=Subscribe`} className="btn btn-navy self-start">Email us to subscribe</a>
      </div>
      <div className="wrap space-y-2 pb-10 text-xs text-muted">
        <p>{s.companyLine} {s.address}. Email: <a className="underline" href={`mailto:${s.email}`}>{s.email}</a></p>
        <p>All products are sold strictly for laboratory research purposes. Not for human or animal consumption. Not a medicine; not to be used to diagnose, treat, cure or prevent any disease.</p>
        <p>© {new Date().getFullYear()} Floww Group Ltd · Research use only</p>
      </div>
    </footer>
  );
}
