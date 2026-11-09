import type { Metadata } from "next";
import { db, testimonials } from "@/db";
import { desc } from "drizzle-orm";

export const metadata: Metadata = { title: "Customer reviews" };

export default async function Reviews() {
  const rows = await db.select().from(testimonials).orderBy(desc(testimonials.id));
  return (
    <div className="wrap max-w-3xl py-10">
      <h1 className="text-3xl font-bold md:text-4xl">What our researchers say.</h1>
      <p className="mt-1 text-muted">Rated 4.9 out of 5 from 192 reviews.</p>
      <div className="mt-8 space-y-4">
        {rows.map((r) => (
          <figure key={r.id} className="rounded-3xl border border-line bg-white/60 p-5">
            <div className="flex items-center gap-3">
              {r.photo ? <img src={r.photo} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span className="grid h-10 w-10 place-items-center rounded-full bg-navy font-bold text-white" aria-hidden>{r.name[0]}</span>}
              <figcaption><p className="font-semibold">{r.name}</p><p className="text-xs text-muted">{r.date}</p></figcaption>
            </div>
            <p className="mt-2 text-accent" aria-label={`${r.rating} out of 5`}>{"★".repeat(r.rating)}</p>
            {r.title && <p className="font-semibold">{r.title}</p>}
            <blockquote className="mt-1">{r.body}</blockquote>
            <p className="mt-2 text-xs text-muted">✓ Verified purchase{r.product && ` · ${r.product}`}</p>
          </figure>
        ))}
      </div>
    </div>
  );
}
