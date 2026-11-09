import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Kovalabs - UK Research Peptide Supplier" };

const STANDARDS = [
  "Every batch independently tested",
  "Peptide purity by RP-HPLC, minimum 99%",
  "Identity confirmed by HPLC retention time against a reference standard",
  "Net peptide content reported for every variant",
  "Fentanyl screen on every batch",
  "Lyophilised vials, stored at -20°C along the cold chain",
  "Tracked next-day UK delivery",
  "A plain-English research-use-only disclaimer, no medical claims",
];

export default function About() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy py-20 text-white md:py-32">
        <img src="/heroes/hero-gh-axis-v2.webp" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" />
        <div className="wrap"><h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">High-purity research peptides, made simple.</h1></div>
      </section>
      <div className="wrap max-w-3xl py-12">
        <p className="text-lg">Kovalabs supplies research peptides to UK labs and researchers. Every batch is analysed by ILS Laboratories, an independent ISO/IEC 17025 accredited lab in San Diego, and shipped from our Greater London facility, stored at -20°C. Orders placed before 3pm Monday to Friday (10am Saturday) are dispatched the same day.</p>

        <h2 className="mt-10 text-2xl font-bold">Our standards</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[["Tested", "Independent HPLC and identity testing on every batch."], ["Transparent", "Certificates published before you buy."], ["Careful", "Cold-chain storage and tracked delivery."]].map(([t, d]) => (
            <div key={t} className="rounded-3xl bg-card p-5"><h3 className="font-bold">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></div>
          ))}
        </div>
        <ul className="mt-6 list-disc space-y-1 pl-5">{STANDARDS.map((s) => <li key={s}>{s}</li>)}</ul>

        <h2 className="mt-10 text-2xl font-bold">Who we sell to</h2>
        <p className="mt-2">Researchers, universities and life-science companies. Customers must be 18 or over. We do not sell to consumers for personal use. <Link href="/research-disclaimer" className="underline">Research disclaimer</Link>.</p>

        <h2 className="mt-10 text-2xl font-bold">Company details</h2>
        <p className="mt-2">Kovalabs is operated by Floww Group Ltd, incorporated 30 September 2024, company number 15986643. Registered office: 66 Paul Street, London, EC2A 4NE.</p>
        <Link href="/coas" className="btn btn-navy mt-8">Browse certificates</Link>
      </div>
    </>
  );
}
