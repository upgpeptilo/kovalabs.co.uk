"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

type Msg = { ok: boolean; text: string } | null;

export function AccountForms({ email }: { email: string }) {
  const router = useRouter();
  const [m1, setM1] = useState<Msg>(null);
  const [m2, setM2] = useState<Msg>(null);

  // Each change re-checks the current password first.
  // The SDK throws on a 401, so a thrown error here means "wrong password".
  const verify = async (password: string) => {
    try { return !(await authClient.signIn.email({ email, password })).error; } catch { return false; }
  };

  async function changeEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      if (!(await verify(String(f.get("current"))))) return setM1({ ok: false, text: "Current password is wrong." });
      const { error } = await authClient.changeEmail({ newEmail: String(f.get("newEmail")) });
      if (error) return setM1({ ok: false, text: error.message || "Could not change email." });
      setM1({ ok: true, text: "Email changed. Use it next time you sign in." });
      router.refresh();
    } catch { setM1({ ok: false, text: "Something went wrong." }); }
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget, f = new FormData(form);
    try {
      if (!(await verify(String(f.get("current"))))) return setM2({ ok: false, text: "Current password is wrong." });
      // No revokeOtherSessions: it signs this admin out.
      const { error } = await authClient.changePassword({ currentPassword: String(f.get("current")), newPassword: String(f.get("next")) });
      if (error) return setM2({ ok: false, text: error.message || "Could not change password." });
      form.reset();
      setM2({ ok: true, text: "Password changed." });
    } catch { setM2({ ok: false, text: "Something went wrong." }); }
  }

  const note = (m: Msg) => m && <p role="status" className={`text-sm ${m.ok ? "text-ok" : "text-accent"}`}>{m.text}</p>;
  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={changeEmail} className="space-y-3 rounded-2xl border border-line bg-white/60 p-4">
        <h2 className="font-bold">Change login email</h2>
        <div><label className="label" htmlFor="ne">New email</label><input id="ne" name="newEmail" type="email" required className="field" /></div>
        <div><label className="label" htmlFor="c1">Current password</label><input id="c1" name="current" type="password" required autoComplete="current-password" className="field" /></div>
        {note(m1)}<button type="submit" className="btn btn-navy">Change email</button>
      </form>
      <form onSubmit={changePassword} className="space-y-3 rounded-2xl border border-line bg-white/60 p-4">
        <h2 className="font-bold">Change password</h2>
        <div><label className="label" htmlFor="c2">Current password</label><input id="c2" name="current" type="password" required autoComplete="current-password" className="field" /></div>
        <div><label className="label" htmlFor="np">New password (8+ characters)</label><input id="np" name="next" type="password" required minLength={8} autoComplete="new-password" className="field" /></div>
        {note(m2)}<button type="submit" className="btn btn-navy">Change password</button>
      </form>
    </div>
  );
}
