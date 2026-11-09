import { revalidatePath } from "next/cache";
import { db, testimonials } from "@/db";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { ImageInput } from "@/components/admin/ImageInput";

async function save(f: FormData) {
  "use server";
  await requireAdmin();
  const rating = Math.min(5, Math.max(1, Number(f.get("rating")) || 5));
  const v = { name: String(f.get("name") || "").trim(), body: String(f.get("body") || "").trim(), title: String(f.get("title") || ""), product: String(f.get("product") || ""), photo: String(f.get("photo") || ""), date: String(f.get("date") || ""), rating };
  if (!v.name || !v.body) return;
  const id = Number(f.get("id"));
  if (id) await db.update(testimonials).set(v).where(eq(testimonials.id, id));
  else await db.insert(testimonials).values(v);
  revalidatePath("/", "layout");
}
async function remove(f: FormData) {
  "use server";
  await requireAdmin();
  await db.delete(testimonials).where(eq(testimonials.id, Number(f.get("id"))));
  revalidatePath("/", "layout");
}

function Fields({ r }: { r?: typeof testimonials.$inferSelect }) {
  return (
    <>
      {r && <input type="hidden" name="id" value={r.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block"><span className="label">Name</span><input name="name" required defaultValue={r?.name} className="field" /></label>
        <label className="block"><span className="label">Date (text)</span><input name="date" defaultValue={r?.date} placeholder="4 Nov 2026" className="field" /></label>
        <label className="block"><span className="label">Product (optional)</span><input name="product" defaultValue={r?.product} className="field" /></label>
        <label className="block"><span className="label">Rating (1-5)</span><input name="rating" type="number" min={1} max={5} defaultValue={r?.rating ?? 5} className="field" /></label>
      </div>
      <label className="block"><span className="label">Headline (optional)</span><input name="title" defaultValue={r?.title} className="field" /></label>
      <label className="block"><span className="label">Review</span><textarea name="body" required rows={3} defaultValue={r?.body} className="field" /></label>
      <ImageInput name="photo" label="Photo (optional)" defaultValue={r?.photo} />
    </>
  );
}

export default async function AdminTestimonials() {
  await requireAdmin();
  const rows = await db.select().from(testimonials).orderBy(desc(testimonials.id));
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Testimonials</h1>
      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <details key={r.id} className="rounded-2xl border border-line bg-white p-3">
            <summary className="flex min-h-11 cursor-pointer items-center font-medium">{r.name} <span className="ml-2 truncate text-sm font-normal text-muted">{r.body}</span></summary>
            <form action={save} className="mt-3 space-y-3"><Fields r={r} /><button type="submit" className="btn btn-navy">Save</button></form>
            <form action={remove} className="mt-2"><input type="hidden" name="id" value={r.id} /><button type="submit" className="text-sm text-accent underline">Delete</button></form>
          </details>
        ))}
      </div>
      <form action={save} className="mt-6 space-y-3 rounded-2xl border border-line bg-white p-4"><h2 className="font-bold">Add testimonial</h2><Fields /><button type="submit" className="btn btn-navy">Add testimonial</button></form>
    </div>
  );
}
