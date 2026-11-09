import { revalidatePath } from "next/cache";
import { db, paymentMethods } from "@/db";
import { asc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { InstantSwitch } from "@/components/admin/Switches";
import { ImageInput } from "@/components/admin/ImageInput";

async function add(f: FormData) {
  "use server";
  await requireAdmin();
  const name = String(f.get("name") || "").trim();
  if (!name) return;
  await db.insert(paymentMethods).values({ name, image: String(f.get("image") || ""), instructions: String(f.get("instructions") || ""), sort: 99 });
  revalidatePath("/", "layout");
}
async function remove(f: FormData) {
  "use server";
  await requireAdmin();
  await db.delete(paymentMethods).where(eq(paymentMethods.id, Number(f.get("id"))));
  revalidatePath("/", "layout");
}
async function toggle(id: number, enabled: boolean) {
  "use server";
  await requireAdmin();
  await db.update(paymentMethods).set({ enabled }).where(eq(paymentMethods.id, id));
  revalidatePath("/checkout");
}

export default async function AdminPayments() {
  await requireAdmin();
  const rows = await db.select().from(paymentMethods).orderBy(asc(paymentMethods.sort), asc(paymentMethods.id));
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Payment methods</h1>
      <p className="mt-1 text-sm text-muted">Shown at checkout with the image and instructions. The switch saves instantly.</p>
      <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
        {rows.map((m) => (
          <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <span className="flex items-center gap-3">{m.image && <img src={m.image} alt="" className="h-8 w-auto" />}<span><strong>{m.name}</strong><span className="block max-w-xs text-xs text-muted">{m.instructions}</span></span></span>
            <span className="flex items-center gap-3">
              <InstantSwitch label={`${m.name} enabled`} checked={m.enabled} onToggle={toggle.bind(null, m.id)} />
              <form action={remove}><input type="hidden" name="id" value={m.id} /><button type="submit" className="text-sm text-accent underline">Delete</button></form>
            </span>
          </li>
        ))}
      </ul>
      <form action={add} className="mt-6 space-y-3 rounded-2xl border border-line bg-white p-4">
        <h2 className="font-bold">Add payment method</h2>
        <div><label className="label" htmlFor="n">Name</label><input id="n" name="name" required className="field" /></div>
        <ImageInput name="image" label="Image / logo (optional)" />
        <div><label className="label" htmlFor="t">Instructions shown to the customer</label><textarea id="t" name="instructions" rows={3} className="field" /></div>
        <button type="submit" className="btn btn-navy">Add method</button>
      </form>
    </div>
  );
}
