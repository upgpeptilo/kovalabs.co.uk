import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

// Static info + legal pages. Built-in routes (store, cart, ...) win over this catch-all segment.
// Legal wording here is a plain-English starting point: have it reviewed before launch.
const PAGES: Record<string, { title: string; body: (string | string[])[] }> = {
  shipping: {
    title: "Shipping & payment",
    body: [
      "Dispatch: orders placed before 3pm Monday to Friday (10am Saturday) are dispatched the same day from our Greater London facility.",
      "Delivery: tracked, next-day UK delivery. Free 24-hour delivery on orders over £75. We ship across the UK including Northern Ireland, Jersey, Guernsey and the Isle of Man. We don't ship outside the UK and Crown Dependencies yet. Jersey may charge 5% GST on orders over £60.",
      "Payment: no card payments are taken on this site. Choose a payment method at checkout and send your order; we reply with secure payment details. Your order is dispatched once payment clears.",
    ],
  },
  reconstitution: {
    title: "Reconstitution & storage",
    body: [
      "All products are supplied as lyophilised (freeze-dried) powder in sealed vials for laboratory research use only.",
      "Storage: keep unopened vials at -20°C, away from light and moisture. Once received, move them to the freezer promptly.",
      "Handling: allow a vial to reach room temperature before opening to avoid condensation. Use sterile technique and a suitable diluent for your protocol. Bacteriostatic Water is available from our shop.",
      "Product information is for laboratory reference only and is not medical advice or guidance for use in people or animals.",
    ],
  },
  returns: {
    title: "Returns & replacements",
    body: [
      "Cancellations: free of charge any time before your order is dispatched. Email us with your order number.",
      "Damaged in transit: contact us within 7 days of delivery with photos of the parcel and vials and we will arrange a replacement.",
      "Because products are sensitive, temperature-controlled research materials, opened or used items can't be returned.",
    ],
  },
  "research-disclaimer": {
    title: "Research disclaimer",
    body: [
      "All products sold by Kovalabs are supplied strictly for laboratory and in-vitro research. They are not medicines, have no UK marketing authorisation, and are not intended for human or veterinary use.",
      "Nothing on this website is medical advice, and no statement here is a claim that any product can diagnose, treat, cure or prevent any condition. Research summaries are drawn from published studies and are for reference only.",
      "By ordering you confirm you are 18 or over and that you will use the products only for lawful research purposes.",
    ],
  },
  terms: {
    title: "Terms & conditions",
    body: [
      "Kovalabs is a trading name of Floww Group Ltd (company no. 15986643), registered office 66 Paul Street, London, EC2A 4NE.",
      "Orders: an order is an offer to buy. We accept it by dispatching the goods or confirming by email, and may decline or cancel an order, for example if stock is unavailable or an item is priced in error. Prices are in pounds sterling.",
      "Use: products are for laboratory research only (see the research disclaimer). You are responsible for using them lawfully and safely.",
      "Liability: nothing limits liability that cannot be limited by law. Otherwise our liability for any order is limited to the price you paid for it.",
      "These terms are governed by the laws of England and Wales.",
    ],
  },
  privacy: {
    title: "Privacy policy",
    body: [
      "Floww Group Ltd (trading as Kovalabs) is the controller of your personal data.",
      "What we collect: the name, email, phone and delivery address you give us when ordering or contacting us, plus order details.",
      "Why: to process and deliver orders, take payment, answer your questions and meet legal obligations. We don't sell your data.",
      "Who sees it: our team and service providers we use to run the site, email and deliveries, only as needed.",
      "Your rights: you can ask to access, correct or delete your data by emailing us.",
    ],
  },
  "cookie-policy": {
    title: "Cookie policy",
    body: [
      "We use only essential storage: a cookie that remembers you confirmed your age, and your browser's local storage to keep your cart. These are needed for the site to work.",
      "We don't use advertising or tracking cookies.",
    ],
  },
};

export async function generateMetadata({ params }: PageProps<"/[page]">): Promise<Metadata> {
  const p = PAGES[(await params).page];
  return p ? { title: p.title } : {};
}

export default async function Info({ params }: PageProps<"/[page]">) {
  const p = PAGES[(await params).page];
  if (!p) notFound();
  return (
    <div className="wrap max-w-3xl py-12">
      <h1 className="text-3xl font-bold md:text-4xl">{p.title}</h1>
      <div className="mt-6 space-y-4 leading-relaxed">{p.body.map((t, i) => <p key={i}>{t}</p>)}</div>
      <p className="mt-10 text-sm text-muted">Questions? <Link href="/contact" className="underline">Contact us</Link>.</p>
    </div>
  );
}
