import data from "@/data/coas.json";

export type Coa = { file: string; title: string; lot: string; tested: string; testedISO: string; labelled: string; purity: number; netMg: number | null; fentanyl: string | null; slug: string };
export const COAS = data as Coa[];

// Smallest vial first: the card badge shows that lot's purity, like the live site.
export const coasFor = (slug: string) => COAS.filter((c) => c.slug === slug).sort((a, b) => (a.netMg ?? 0) - (b.netMg ?? 0));
export const coaUrl = (c: Coa) => `/coas/${c.file}`;
export const longDate = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
