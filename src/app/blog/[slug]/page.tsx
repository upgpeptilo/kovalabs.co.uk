import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db, posts } from "@/db";
import { and, eq } from "drizzle-orm";

const find = async (slug: string) => (await db.select().from(posts).where(and(eq(posts.slug, slug), eq(posts.published, true))))[0];

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const p = await find((await params).slug);
  return p ? { title: p.title, description: p.excerpt } : {};
}

export default async function Post({ params }: PageProps<"/blog/[slug]">) {
  const p = await find((await params).slug);
  if (!p) notFound();
  const date = p.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  // Body is plain text: blank line = new paragraph. No HTML is rendered, so admin input cannot inject markup.
  const body = p.body.split(/\n{2,}/).map((t, i) => <p key={i} className="mt-4 whitespace-pre-line leading-relaxed">{t}</p>);
  const head = <><p className="text-xs uppercase tracking-widest text-muted">{date}</p><h1 className="mt-1 text-3xl font-bold md:text-5xl">{p.title}</h1></>;

  return (
    <article className="wrap py-10">
      <Link href="/blog" className="text-sm underline">← Research articles</Link>
      {p.layout === "magazine" ? (
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          {p.cover && <img src={p.cover} alt="" className="w-full min-w-0 rounded-3xl object-cover lg:sticky lg:top-28 lg:self-start" />}
          <div className="min-w-0">{head}{body}</div>
        </div>
      ) : p.layout === "grid" ? (
        <div className="mt-6">
          {p.cover && <img src={p.cover} alt="" className="aspect-[21/9] w-full rounded-3xl object-cover" />}
          <div className="mx-auto mt-6 max-w-3xl">{head}{body}</div>
        </div>
      ) : (
        <div className="mx-auto mt-6 max-w-2xl">{head}{p.cover && <img src={p.cover} alt="" className="mt-6 w-full rounded-3xl" />}{body}</div>
      )}
    </article>
  );
}
