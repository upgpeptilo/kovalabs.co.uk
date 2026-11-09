import Link from "next/link";
import { db, categories } from "@/db";
import { asc } from "drizzle-orm";
import { SHOP, LEARN } from "@/lib/nav";
import { MobileMenu } from "./MobileMenu";
import { CartButton } from "./CartButton";

export function Logo({ className = "" }: { className?: string }) {
  return <span className={`text-[1.7rem] font-semibold lowercase tracking-tight ${className}`}>kovalabs</span>;
}

function Dropdown({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    // <details> keeps the menu working with no JS.
    <details className="group relative">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-full px-4 font-medium group-open:bg-navy group-open:text-white [&::-webkit-details-marker]:hidden">
        {title} <span className="text-xs transition group-open:rotate-180">▾</span>
      </summary>
      <div className="rise absolute left-0 top-12 z-50 w-64 rounded-3xl bg-card p-3 shadow-xl">
        {links.map((l) => <Link key={l.href} href={l.href} className="flex min-h-11 items-center rounded-xl px-3 hover:bg-cream">{l.label}</Link>)}
      </div>
    </details>
  );
}

export async function Header({ announcement }: { announcement: string }) {
  const cats = await db.select().from(categories).orderBy(asc(categories.sort));
  const catLinks = cats.map((c) => ({ href: `/categories/${c.slug}`, label: c.name }));
  const parts = announcement.split("·").map((s) => s.trim()).filter(Boolean);
  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur">
      {announcement && (
        <div className="overflow-hidden bg-navy py-2.5 text-xs font-bold uppercase tracking-widest text-white" aria-label="Announcement">
          <div className="marquee">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0 gap-16 pr-16" aria-hidden={k === 1}>
                {[...parts, ...parts, ...parts].map((p, i) => <span key={i} className="whitespace-nowrap">{p}</span>)}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="wrap grid h-16 grid-cols-[1fr_auto_1fr] items-center md:h-20">
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          <Dropdown title="Shop" links={[...SHOP, ...catLinks]} />
          <Dropdown title="Learn" links={LEARN} />
          <Link href="/store?focus=search" aria-label="Search" className="grid h-11 w-11 place-items-center rounded-full hover:bg-card">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </Link>
        </nav>
        <div className="md:hidden">
          <MobileMenu groups={[{ title: "Shop", links: SHOP }, { title: "Categories", links: catLinks }, { title: "Learn", links: LEARN }, { title: "Company", links: [{ href: "/about", label: "About" }, { href: "/contact", label: "Contact" }] }]} />
        </div>
        <Link href="/" aria-label="Kovalabs home" className="justify-self-center"><Logo /></Link>
        <div className="flex items-center justify-self-end">
          <Link href="/account" aria-label="Account" className="hidden h-11 w-11 place-items-center rounded-full hover:bg-card sm:grid">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></svg>
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
