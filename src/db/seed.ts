import "./env";
import { db, categories, products, variants, paymentMethods, faqs, testimonials, settings } from "./index";
import { DEFAULTS } from "../lib/settings";

const IMG = "https://images.kovalabs.co.uk/";
const CATS = [
  ["tissue-repair", "Tissue Repair", "GHK-Cu, BPC-157, TB-500 and related compounds.", "/heroes/hero-tissue-repair.webp"],
  ["gh-axis", "GH Axis & Secretagogues", "Tesamorelin, Ipamorelin, CJC-1295 and more.", "/heroes/hero-gh-axis-v2.webp"],
  ["metabolic", "Metabolic", "MOTS-C, AOD-9604, HGH Fragment 176-191.", "/heroes/hero-metabolic-mots-v1.webp"],
  ["cellular", "Cellular & Senescence", "L-Glutathione, NAD+, Epithalon.", "/heroes/hero-cellular-v1.webp"],
  ["neuropeptides", "Neuropeptides", "Selank, Semax, DSIP.", "/heroes/hero-neuropeptides.webp"],
  ["melanocortins", "Melanocortins", "Melanotan and PT-141.", ""],
  ["accessories", "Accessories", "Reconstitution supplies.", ""],
] as const;

// [slug, name, category, price £, image file, kind, badge, purity, bestSeller, stock]
type P = [string, string, string, number, string, string, string, string, boolean, number];
const P: P[] = [
  ["glow-blend", "GLOW Blend", "tissue-repair", 79.99, "glow-blend-70mg-v2-01M1XWM53ZE8VWR72SV75GTJ3S.webp", "blend", "Selling fast", "99.90%", false, 100],
  ["klow-blend", "KLOW Blend", "tissue-repair", 99.99, "klow-blend-80mg-v2-01M1XWM4NKNM4TG8Z325676CY6.webp", "blend", "", "99.83%", true, 100],
  ["tesamorelin", "Tesamorelin", "gh-axis", 39.99, "tesamorelin-muted-01KTC9XYFZNSWWGMB8SV4TKTTH-v3.webp", "single", "Selling fast", "99.33%", true, 100],
  ["mots-c", "MOTS-C", "metabolic", 29.99, "mots-c-center1025-01KT9W1G7CTW8SARN00764GMM6-v3.webp", "single", "", "99.59%", true, 100],
  ["melanotan-1", "Melanotan 1", "melanocortins", 24.99, "melanotan-1-tan-muted-01KTETRYPQ3H5QM19ED1Q67ASS-v3.webp", "single", "", "99.34%", true, 100],
  ["gh-blend", "GH Blend", "gh-axis", 41.99, "cjc-ipamorelin-blend-10mg-v1-01M0QSMVH3A9JX84JG5DVB6Z6A.webp", "blend", "Selling fast", "99.67%", false, 100],
  ["ss-31", "SS-31", "cellular", 29.99, "ss-31-rose-v4-01KZMXQ5M089K5FZBASCSY3SH2.webp", "single", "", "", false, 100],
  ["cjc-1295-dac", "CJC-1295 (DAC)", "gh-axis", 34.99, "cjc-1295-dac-muted-01KTC9Y249AYZBV1F25AQR706D-v3.webp", "single", "", "", false, 100],
  ["thymosin-alpha-1", "Thymosin Alpha-1", "cellular", 39.99, "thymosin-alpha-1-10mg-v4-01KZ2TCPH83JK5YT4SRS10W4B8.webp", "single", "", "", false, 100],
  ["aod-9604", "AOD-9604", "metabolic", 37.99, "aod-9604-peach-01KTBT7GPY242SDFBS18RGT2A5-v3.webp", "single", "", "", false, 100],
  ["igf-1-lr3", "IGF-1 LR3", "gh-axis", 44.99, "igf-1-lr3-muted-01KTC9Y8QJ5CXC55N3Z1X8414Q-v3.webp", "single", "", "", false, 100],
  ["glutathione", "Glutathione", "cellular", 44.99, "glutathione-rose-v4-01KZMXQ55J393A6S2KXV0HMYW1.webp", "single", "", "", false, 100],
  ["pt-141", "PT-141", "melanocortins", 21.99, "pt-141-tan-v4-01KZMYKB0WA0TW9XVX3KCR22SD.webp", "single", "", "", false, 100],
  ["glow-stack", "GLOW Stack", "tissue-repair", 74.99, "glow-stack-individual-vials-v1-01M0J2CVVAAMXY137ZX1AFAH6M.webp", "stack", "Selling fast", "", false, 100],
  ["ghrp-6", "GHRP-6", "gh-axis", 29.99, "ghrp-6-muted-01KTC9XRB0KTGY64KRZAXP1AMY-v3.webp", "single", "", "", false, 100],
  ["5-amino-1mq", "5-Amino-1MQ", "metabolic", 34.99, "5-amino-1mq-01KYGCRBZJ9VD3X3Z2BZAJBNFZ-v3.webp", "single", "", "", false, 100],
  ["epithalon", "Epithalon", "cellular", 21.99, "epithalon-rose-v4-01KZMXQ4NR5C31DZJ7YZQ8K3ZP.webp", "single", "", "", false, 100],
  ["gh-stack", "GH Stack", "gh-axis", 39.99, "gh-bundle-v1-01KTWQN9AS6H3D9V2Y3793QASQ-v3.webp", "stack", "Selling fast", "", false, 100],
  ["bpc-157", "BPC-157", "tissue-repair", 19.99, "bpc-157-muted-01KTC9XF33S8MTNTHF4Q60TBDE-v3.webp", "single", "", "", false, 100],
  ["selank", "Selank", "neuropeptides", 29.99, "selank-10mg-v6-01KZN2J7MR2YNZ8X5SXHMYYRSR.webp", "single", "", "", false, 100],
  ["klow-stack", "KLOW Stack", "tissue-repair", 94.99, "klow-stack-individual-vials-v1-01M0J6PBAQ34AKRGM8W0557JAX.webp", "stack", "", "", false, 100],
  ["ghrp-2", "GHRP-2", "gh-axis", 29.99, "ghrp-2-10mg-v4-01KZ2TCQEP5GN3P1Q0D27HWFEN.webp", "single", "", "", false, 100],
  ["nad", "NAD+", "cellular", 59.99, "nad-reskin-01KT7383AAZ6VEPX5EMPYSSKFP-v3.webp", "single", "", "", false, 100],
  ["tb-500", "TB-500", "tissue-repair", 24.99, "tb-500-muted-01KTC9XBV39110PS5DW9D46K7G-v3.webp", "single", "", "", false, 100],
  ["hgh-fragment-176-191", "HGH Fragment 176-191", "metabolic", 27.99, "hgh-fragment-176-191-peach-01KTBW25KWTAA0PSC6CVFXKTKB-v3.webp", "single", "In preparation", "", false, 0],
  ["sermorelin", "Sermorelin", "gh-axis", 29.99, "sermorelin-muted-01KTC9XVDA19WRYKMVATBD1G5A-v3.webp", "single", "", "", false, 100],
  ["cellular-stack", "Cellular Stack", "cellular", 107.99, "cellular-bundle-v2-01M28FAT6PY60FP00BDQ7W406H.webp", "stack", "", "99.57%", false, 100],
  ["ghk-cu", "GHK-Cu", "tissue-repair", 29.99, "ghk-cu-green-50mg-01KTWMBCJ4WGXY19VTB6HNE4N4-v3.webp", "single", "", "", false, 100],
  ["semax", "Semax", "neuropeptides", 29.99, "semax-10mg-v6-01KZN2J8JXAJQA1FH4PXH3Q89M.webp", "single", "", "", false, 100],
  ["cjc-1295-no-dac", "CJC-1295 (No DAC)", "gh-axis", 24.99, "cjc-1295-no-dac-muted-01KTC9Y5JHJSBWZD38DDG2N75G-v3.webp", "single", "", "", false, 100],
  ["melanotan-2", "Melanotan 2", "melanocortins", 22.99, "melanotan-2-vial-01KZ70J87P2WK9NWWBAY3PCC3H-v1.webp", "single", "", "", false, 100],
  ["kpv", "KPV", "tissue-repair", 32.99, "kpv-muted-01KTC9XJ6QS0NVDFFW45P8GW46-v3.webp", "single", "", "", false, 100],
  ["dsip", "DSIP", "neuropeptides", 16.99, "dsip-5mg-v6-01KZN2J9FD49NM9H6B5BBGDPBT.webp", "single", "", "", false, 100],
  ["ipamorelin", "Ipamorelin", "gh-axis", 20.99, "ipamorelin-muted-01KTC9XN9073ZC953NK13XY6F7-v3.webp", "single", "", "", false, 100],
  ["wolverine-blend", "Wolverine Blend", "tissue-repair", 39.99, "wolverine-blend-10mg-v1-01M0QSMVH4039G5KDZXNTEASVZ.webp", "blend", "", "", false, 100],
  ["kisspeptin-10", "Kisspeptin-10", "neuropeptides", 29.99, "kisspeptin-10mg-v6-01KZN2JA9081VZC2KYNRQC8M7X.webp", "single", "", "", false, 100],
  ["bacteriostatic-water", "Bacteriostatic Water", "accessories", 8.99, "bacteriostatic-water-01KTWTZFGQEFJ1KNK8XZ9507Q1-v3.webp", "accessory", "", "", false, 100],
  ["wolverine-stack", "Wolverine Stack", "tissue-repair", 36.99, "wolverine-bundle-v2-01KTWQN9AK1P9JDA6SEEMDENC2-v3.webp", "stack", "", "", false, 100],
];

const FAQS: [string, string, string][] = [
  ["Ordering & payment", "How do I pay?", "Payment is by UK pay-by-bank. After you place your order we send you a secure payment request by email. We do not take card payments on the storefront."],
  ["Ordering & payment", "Can I cancel my order?", "Yes, free of charge any time before it is dispatched. Email team@kovalabs.co.uk with your order number."],
  ["Shipping & customs", "When do you dispatch?", "Orders placed before 3pm Monday to Friday (10am Saturday) are dispatched the same day. Delivery is free and 24-hour over £75."],
  ["Shipping & customs", "Where do you ship?", "Across the UK including Northern Ireland, Jersey, Guernsey and the Isle of Man. We do not currently ship outside the UK and Crown Dependencies. Jersey may charge 5% GST on orders over £60."],
  ["Quality & testing", "Is every batch tested?", "Yes. Every batch is independently tested by an ISO/IEC 17025 accredited laboratory and the certificate of analysis is published."],
  ["Returns & issues", "What if my order arrives damaged?", "Contact us within 7 days with photos and we will put it right."],
  ["About research peptides", "Are these products for human consumption?", "No. All products are supplied for laboratory research use only. They are not medicines and are not for human or veterinary consumption."],
];

const REVIEWS: [string, string, string, string, string][] = [
  ["Sian F.", "As always excellent service from ordering to the fast delivery, the packaging was really secure and strong, will keep ordering from Kovalabs.", "", "AOD-9604", "4 Nov 2026"],
  ["Phil", "I am satisfied that these are the genuine articles and am happy to say that I will without doubt be using this company again.", "Definitely Happy", "PT-141", "1 Nov 2026"],
  ["Simon E.", "Excellent product, excellent customer service.", "", "GH Stack", "30 Oct 2026"],
  ["Ellie", "Always outstanding customer service. This order I placed yesterday, and it arrived today. Highly recommend.", "My 4th order now…", "Semax", "29 Oct 2026"],
  ["Chris", "This is my second time ordering, and everything has been fantastic once again. Smooth delivery, packed very well, excellent product quality.", "", "GLOW Stack", "20 Oct 2026"],
  ["Daniel", "The quality is as expected - superb. And prices remain highly competitive especially for the assurance you're getting.", "Most transparent provider in the UK", "GLOW Stack", "10 Oct 2026"],
];

async function main() {
  if ((await db.select().from(categories).limit(1)).length) return console.log("already seeded, skipping");

  const cats = await db.insert(categories).values(CATS.map(([slug, name, blurb, image], i) => ({ slug, name, blurb, image, sort: i }))).returning();
  const cid = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  const prods = await db.insert(products).values(
    P.map(([slug, name, cat, , img, kind, badge, purity, best], i) => ({
      slug, name, categoryId: cid[cat], images: [IMG + img], kind, badge, purity, bestSeller: best, sort: i,
      description: "Supplied as a lyophilised research material for laboratory use only. Not for human or veterinary consumption.",
    })),
  ).returning();
  const pid = Object.fromEntries(prods.map((p) => [p.slug, p.id]));
  await db.insert(variants).values(P.map(([slug, , , price, , , , , , stock]) => ({ productId: pid[slug], label: "Standard", pricePence: Math.round(price * 100), stock })));

  await db.insert(paymentMethods).values([
    { name: "Pay by bank (UK)", instructions: "After you place your order we email you a secure pay-by-bank request. Your order is dispatched once payment clears.", sort: 0 },
    { name: "Bank transfer", instructions: "We email our bank details with your order number as the payment reference.", sort: 1 },
  ]);
  await db.insert(faqs).values(FAQS.map(([section, question, answer], i) => ({ section, question, answer, sort: i })));
  await db.insert(testimonials).values(REVIEWS.map(([name, body, title, product, date]) => ({ name, body, title, product, date })));
  await db.insert(settings).values(Object.entries(DEFAULTS).map(([key, v]) => ({ key, value: { v } })));
  console.log("seeded", prods.length, "products");
}
main();
