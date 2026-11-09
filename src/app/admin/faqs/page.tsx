import { revalidatePath } from "next/cache";
import { db, faqs } from "@/db";
import { asc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

async function save(f: FormData) {
  "use server";
  await requireAdmin();
  const v = { section: String(f.get("section") || "General").trim() || "General", question: String(f.get("question") || "").trim(), answer: String(f.get("answer") || "").trim() };
  if (!v.question || !v.answer) return;
  const id = Number(f.get("id"));
  if (id) await db.update(faqs).set(v).where(eq(faqs.id, id));
  else await db.insert(faqs).values({ ...v, sort: 99 });
  revalidatePath("/", "layout");
}
async function remove(f: FormData) {
  "use server";
  await requireAdmin();
  await db.delete(faqs).where(eq(faqs.id, Number(f.get("id"))));
  revalidatePath("/", "layout");
}

function Fields({ r }: { r?: typeof faqs.$inferSelect }) {
  return (
    <>
      {r && <input type="hidden" name="id" value={r.id} />}
      <label className="block"><span className="label">Section</span><input name="section" defaultValue={r?.section ?? "General"} className="field" /></label>
      <label className="block"><span className="label">Question</span><input name="question" required defaultValue={r?.question} className="field" /></label>
      <label className="block"><span className="label">Answer</span><textarea name="answer" required rows={3} defaultValue={r?.answer} className="field" /></label>
    </>
  );
}

export default async function AdminFaqs() {
  await requireAdmin();
  const rows = await db.select().from(faqs).orderBy(asc(faqs.sort), asc(faqs.id));
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">FAQs</h1>
      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <details key={r.id} className="rounded-2xl border border-line bg-white p-3">
            <summary className="flex min-h-11 cursor-pointer items-center font-medium">{r.question}</summary>
            <form action={save} className="mt-3 space-y-3"><Fields r={r} /><button type="submit" className="btn btn-navy">Save</button></form>
            <form action={remove} className="mt-2"><input type="hidden" name="id" value={r.id} /><button type="submit" className="text-sm text-accent underline">Delete</button></form>
          </details>
        ))}
      </div>
      <form action={save} className="mt-6 space-y-3 rounded-2xl border border-line bg-white p-4"><h2 className="font-bold">Add FAQ</h2><Fields /><button type="submit" className="btn btn-navy">Add FAQ</button></form>
    </div>
  );
}
