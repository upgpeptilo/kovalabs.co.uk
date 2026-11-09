import { revalidatePath } from "next/cache";
import { db, categories } from "@/db";
import { asc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/format";
import { ImageInput } from "@/components/admin/ImageInput";

async function add(f: FormData) {
  "use server";
  await requireAdmin();
  const name = String(f.get("name") || "").trim();
  if (!name) return;
  const slug = slugify(name);
  await db.insert(categories).values({ name, slug, blurb: String(f.get("blurb") || ""), image: String(f.get("image") || ""), sort: 99 }).onConflictDoNothing({ target: categories.slug });
  revalidatePath("/", "layout");
}
async function remove(f: FormData) {
  "use server";
  await requireAdmin();
  await db.delete(categories).where(eq(categories.id, Number(f.get("id")))); // products keep existing, category becomes none
  revalidatePath("/", "layout");
}

export default async function AdminCategories() {
  await requireAdmin();
  const rows = await db.select().from(categories).orderBy(asc(categories.sort));
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Categories</h1>
      <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
        {rows.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-2">
            <span><strong>{c.name}</strong> <span className="text-xs text-muted">/{c.slug}</span></span>
            <form action={remove}><input type="hidden" name="id" value={c.id} /><button className="btn btn-line !min-h-10 !border-accent !px-4 text-sm !text-accent" type="submit">Delete</button></form>
          </li>
        ))}
      </ul>
      <form action={add} className="mt-6 space-y-3 rounded-2xl border border-line bg-white p-4">
        <h2 className="font-bold">Add category</h2>
        <div><label className="label" htmlFor="n">Name</label><input id="n" name="name" required className="field" /></div>
        <div><label className="label" htmlFor="b">Short description</label><input id="b" name="blurb" className="field" /></div>
        <ImageInput name="image" label="Tile image (optional)" />
        <button type="submit" className="btn btn-navy">Add category</button>
      </form>
    </div>
  );
}
