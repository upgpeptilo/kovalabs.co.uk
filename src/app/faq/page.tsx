import type { Metadata } from "next";
import { db, faqs } from "@/db";
import { asc } from "drizzle-orm";

export const metadata: Metadata = { title: "FAQ - Research peptides, testing, shipping & more" };

export default async function Faq() {
  const rows = await db.select().from(faqs).orderBy(asc(faqs.sort), asc(faqs.id));
  const sections = [...new Set(rows.map((r) => r.section))];
  return (
    <div className="wrap max-w-3xl py-10">
      <h1 className="text-3xl font-bold md:text-4xl">Frequently asked questions</h1>
      {sections.map((s) => (
        <section key={s} className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted">{s}</h2>
          <div className="mt-2 divide-y divide-line border-y border-line">
            {rows.filter((r) => r.section === s).map((r) => (
              <details key={r.id} className="group py-1">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">{r.question}<span className="transition group-open:rotate-45" aria-hidden>+</span></summary>
                <p className="pb-4 text-muted">{r.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
