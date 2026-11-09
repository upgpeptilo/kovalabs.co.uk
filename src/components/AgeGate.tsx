import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function agree() {
  "use server";
  (await cookies()).set("kl-age", "1", { maxAge: 60 * 60 * 24 * 365, path: "/", sameSite: "lax" });
  redirect("/");
}

// Server-rendered, so there is no flash: the modal only renders while the cookie is missing.
export async function AgeGate() {
  if ((await cookies()).get("kl-age")) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="age-h" className="fixed inset-0 z-[200] grid place-items-center bg-navy/70 p-4 backdrop-blur-sm">
      <form action={agree} className="rise w-full max-w-md rounded-3xl bg-cream p-8 text-center shadow-2xl">
        <h2 id="age-h" className="text-2xl font-bold">Before you continue</h2>
        <p className="mt-3 text-muted">Kovalabs supplies research-grade peptides for laboratory use only. By entering you confirm you are 18 or over and that products are for research use only, not for human consumption.</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="submit" className="btn btn-navy">I agree</button>
          <a href="https://www.google.com" className="btn btn-line">I disagree</a>
        </div>
      </form>
    </div>
  );
}
