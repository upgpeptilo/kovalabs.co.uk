import type { Metadata } from "next";
import { db, faqs } from "@/db";
import { asc } from "drizzle-orm";
import { getSettings } from "@/lib/settings";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = { title: "Contact Kovalabs | UK Research Peptide Supplier" };

export default async function Contact() {
  const [s, qs] = await Promise.all([getSettings(), db.select().from(faqs).orderBy(asc(faqs.sort)).limit(5)]);
  const cards = [
    { k: "Address", v: s.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}` },
    s.phone && { k: "Phone", v: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` },
    { k: "Email", v: s.email, href: `mailto:${s.email}` },
  ].filter(Boolean) as { k: string; v: string; href: string }[];
  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy py-16 text-white md:py-24">
        <img src="/heroes/hero-tissue-repair.webp" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" />
        <div className="wrap grid items-center gap-8 lg:grid-cols-2">
          <div><h1 className="text-4xl font-bold md:text-6xl">Get in touch.</h1><p className="mt-3 text-white/80">We reply within one working day.</p></div>
          <ContactForm />
        </div>
      </section>
      <div className="wrap py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((c) => <a key={c.k} href={c.href} className="rounded-3xl bg-card p-5 hover:bg-line"><p className="text-xs font-bold uppercase tracking-widest text-muted">{c.k}</p><p className="mt-1 font-semibold">{c.v}</p></a>)}
        </div>
        {s.showMap && s.address && (
          <iframe title="Map" loading="lazy" className="mt-8 h-80 w-full rounded-3xl border-0" src={`https://www.google.com/maps?q=${encodeURIComponent(s.address)}&output=embed`} />
        )}
        <h2 className="mt-12 text-2xl font-bold">Common questions</h2>
        <div className="mt-3 divide-y divide-line border-y border-line">
          {qs.map((q) => <details key={q.id} className="py-1"><summary className="flex min-h-12 cursor-pointer items-center font-semibold">{q.question}</summary><p className="pb-3 text-muted">{q.answer}</p></details>)}
        </div>
      </div>
    </>
  );
}
