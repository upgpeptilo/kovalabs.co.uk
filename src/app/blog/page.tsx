import Link from "next/link";
import type { Metadata } from "next";
import { db, posts } from "@/db";
import { desc, eq } from "drizzle-orm";

export const metadata: Metadata = { title: "Research articles" };

// Each post chooses its own layout, which applies to its card here and to its own page.
export default async function Blog() {
  const rows = await db.select().from(posts).where(eq(posts.published, true)).orderBy(desc(posts.createdAt));
  return (
    <div className="wrap py-10">
      <h1 className="text-3xl font-bold md:text-4xl">Research articles</h1>
      {rows.length === 0 && <p className="mt-8 text-muted">No articles yet.</p>}
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {rows.map((p) => {
          const date = p.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
          const cover = p.cover && <img src={p.cover} alt="" loading="lazy" className="h-full w-full object-cover" />;
          if (p.layout === "magazine")
            return (
              <Link key={p.id} href={`/blog/${p.slug}`} className="group relative isolate flex min-h-80 items-end overflow-hidden rounded-3xl bg-navy p-6 text-white md:col-span-2">
                {p.cover && <img src={p.cover} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 transition group-hover:scale-105" />}
                <div><p className="text-xs uppercase tracking-widest text-white/70">{date}</p><h2 className="text-3xl font-bold">{p.title}</h2><p className="mt-1 max-w-xl text-white/80">{p.excerpt}</p></div>
              </Link>
            );
          if (p.layout === "grid")
            return (
              <Link key={p.id} href={`/blog/${p.slug}`} className="group overflow-hidden rounded-3xl border border-line bg-white/60">
                {p.cover && <div className="aspect-video overflow-hidden bg-card">{cover}</div>}
                <div className="p-5"><p className="text-xs text-muted">{date}</p><h2 className="text-xl font-bold group-hover:underline">{p.title}</h2><p className="mt-1 text-sm text-muted">{p.excerpt}</p></div>
              </Link>
            );
          return (
            <Link key={p.id} href={`/blog/${p.slug}`} className="group flex gap-4 rounded-3xl border border-line bg-white/60 p-4 md:col-span-2">
              {p.cover && <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-card">{cover}</div>}
              <div><p className="text-xs text-muted">{date}</p><h2 className="text-xl font-bold group-hover:underline">{p.title}</h2><p className="mt-1 text-sm text-muted">{p.excerpt}</p></div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
