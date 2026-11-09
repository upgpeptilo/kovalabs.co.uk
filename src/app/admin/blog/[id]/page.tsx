import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, posts } from "@/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/format";
import { FormSwitch } from "@/components/admin/Switches";
import { ImageInput } from "@/components/admin/ImageInput";

const LAYOUTS = [
  { id: "classic", name: "Classic", desc: "Rows in the list; a narrow reading column." },
  { id: "grid", name: "Grid", desc: "Cards in the list; a wide banner on the post." },
  { id: "magazine", name: "Magazine", desc: "A large feature card; image beside the text." },
];

// Wireframes of the list view (left) and the post page (right) for each layout.
function Thumb({ id }: { id: string }) {
  const g = "#c9c0ad", d = "#0c1033";
  const list = id === "classic"
    ? <><rect x="2" y="4" width="14" height="10" rx="2" fill={g} /><rect x="19" y="5" width="30" height="3" fill={d} /><rect x="19" y="10" width="22" height="2" fill={g} /><rect x="2" y="20" width="14" height="10" rx="2" fill={g} /><rect x="19" y="21" width="30" height="3" fill={d} /><rect x="19" y="26" width="22" height="2" fill={g} /></>
    : id === "grid"
    ? <><rect x="2" y="3" width="23" height="14" rx="2" fill={g} /><rect x="2" y="20" width="18" height="3" fill={d} /><rect x="28" y="3" width="23" height="14" rx="2" fill={g} /><rect x="28" y="20" width="18" height="3" fill={d} /></>
    : <><rect x="2" y="3" width="49" height="18" rx="2" fill={d} /><rect x="6" y="13" width="26" height="3" fill="#fff" /><rect x="2" y="24" width="23" height="6" rx="2" fill={g} /><rect x="28" y="24" width="23" height="6" rx="2" fill={g} /></>;
  const post = id === "classic"
    ? <><rect x="14" y="3" width="26" height="4" fill={d} /><rect x="14" y="10" width="26" height="9" rx="2" fill={g} /><rect x="14" y="22" width="26" height="2" fill={g} /><rect x="14" y="26" width="26" height="2" fill={g} /></>
    : id === "grid"
    ? <><rect x="2" y="3" width="49" height="12" rx="2" fill={g} /><rect x="12" y="18" width="29" height="4" fill={d} /><rect x="12" y="25" width="29" height="2" fill={g} /></>
    : <><rect x="2" y="3" width="20" height="26" rx="2" fill={g} /><rect x="26" y="4" width="24" height="4" fill={d} /><rect x="26" y="12" width="24" height="2" fill={g} /><rect x="26" y="16" width="24" height="2" fill={g} /><rect x="26" y="20" width="24" height="2" fill={g} /></>;
  return (
    <span className="flex gap-2" aria-hidden>
      <svg viewBox="0 0 53 33" className="w-1/2 rounded-lg bg-white">{list}</svg>
      <svg viewBox="0 0 53 33" className="w-1/2 rounded-lg bg-white">{post}</svg>
    </span>
  );
}

export default async function EditPost({ params }: PageProps<"/admin/blog/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const [p] = id === "new" ? [undefined] : await db.select().from(posts).where(eq(posts.id, Number(id)));
  if (id !== "new" && !p) notFound();

  async function save(f: FormData) {
    "use server";
    await requireAdmin();
    const title = String(f.get("title") || "").trim();
    if (!title) return;
    const layout = String(f.get("layout"));
    const v = {
      title, slug: slugify(String(f.get("slug") || "") || title), excerpt: String(f.get("excerpt") || ""), body: String(f.get("body") || ""),
      cover: String(f.get("cover") || ""), layout: LAYOUTS.some((l) => l.id === layout) ? layout : "classic", published: f.get("published") === "on",
    };
    if (p) await db.update(posts).set(v).where(eq(posts.id, p.id));
    else await db.insert(posts).values(v).onConflictDoNothing({ target: posts.slug });
    revalidatePath("/", "layout");
    redirect("/admin/blog");
  }
  async function remove() {
    "use server";
    await requireAdmin();
    if (p) await db.delete(posts).where(eq(posts.id, p.id));
    revalidatePath("/", "layout");
    redirect("/admin/blog");
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/blog" className="text-sm underline">← Blog</Link>
      <h1 className="mt-2 text-2xl font-bold">{p ? "Edit post" : "New post"}</h1>
      <form action={save} className="mt-4 space-y-4">
        <div><label className="label" htmlFor="t">Title</label><input id="t" name="title" required defaultValue={p?.title} className="field" /></div>
        <div><label className="label" htmlFor="s">URL slug (optional)</label><input id="s" name="slug" defaultValue={p?.slug} className="field" /></div>
        <div><label className="label" htmlFor="e">Excerpt</label><textarea id="e" name="excerpt" rows={2} defaultValue={p?.excerpt} className="field" /></div>
        <div><label className="label" htmlFor="b">Body (blank line = new paragraph)</label><textarea id="b" name="body" rows={10} defaultValue={p?.body} className="field" /></div>
        <ImageInput name="cover" label="Cover image" defaultValue={p?.cover} />
        <fieldset>
          <legend className="label">Layout</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {LAYOUTS.map((l) => (
              <label key={l.id} className="cursor-pointer">
                <input type="radio" name="layout" value={l.id} defaultChecked={(p?.layout ?? "classic") === l.id} className="peer sr-only" />
                <span className="block rounded-2xl border-2 border-line bg-card p-2 peer-checked:border-navy peer-checked:ring-2 peer-checked:ring-navy/30 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
                  <Thumb id={l.id} />
                  <span className="mt-2 block text-sm font-bold">{l.name}</span>
                  <span className="block text-xs text-muted">{l.desc}</span>
                </span>
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted">Each thumbnail shows the list view (left) and the post page (right).</p>
        </fieldset>
        <FormSwitch name="published" label="Published" defaultChecked={p?.published ?? true} />
        <button type="submit" className="btn btn-navy">Save post</button>
      </form>
      {p && <form action={remove} className="mt-8 border-t border-line pt-6"><button type="submit" className="btn btn-line !border-accent !text-accent">Delete post</button></form>}
    </div>
  );
}
