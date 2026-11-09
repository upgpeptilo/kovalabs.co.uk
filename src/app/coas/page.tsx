import type { Metadata } from "next";
import Link from "next/link";
import { COAS, coaUrl, longDate } from "@/lib/coas";

export const metadata: Metadata = { title: "Certificates of Analysis (COAs)", description: "Independent ISO/IEC 17025 lab certificates for every Kovalabs batch." };

export default function Coas() {
  return (
    <div className="wrap py-10">
      <p className="text-xs font-bold uppercase tracking-widest text-muted">Verified test results</p>
      <h1 className="text-3xl font-bold md:text-4xl">Read the certificate before you buy.</h1>
      <p className="mt-2 max-w-2xl text-muted">Every batch is tested by ILS Laboratories, an independent ISO/IEC 17025 accredited lab. {COAS.length} certificates, newest first.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COAS.map((c) => (
          <article key={c.file} className="flex flex-col rounded-3xl border border-line bg-white/60 p-5">
            <h2 className="font-semibold">{c.title}</h2>
            <p className="mt-3 text-4xl font-bold">{c.purity}<span className="text-xl">%</span></p>
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Purity by HPLC</p>
            <dl className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Batch</dt><dd>{c.lot}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Tested</dt><dd>{longDate(c.testedISO)}</dd></div>
              {c.netMg !== null && <div className="flex justify-between"><dt className="text-muted">Net peptide</dt><dd>{c.netMg} mg</dd></div>}
              {c.fentanyl && <div className="flex justify-between"><dt className="text-muted">Fentanyl screen</dt><dd>{c.fentanyl}</dd></div>}
            </dl>
            <div className="mt-auto flex gap-2 pt-4">
              <a href={coaUrl(c)} target="_blank" rel="noopener noreferrer" className="btn btn-navy flex-1 !min-h-10 text-sm">View PDF →</a>
              <Link href={`/products/${c.slug}`} className="btn btn-line !min-h-10 !px-4 text-sm">Product</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
