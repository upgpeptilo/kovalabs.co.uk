"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export default function AuthPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = use(params);
  if (path !== "sign-in" && path !== "sign-up") notFound();
  const signUp = path === "sign-up";
  const router = useRouter();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(""); setBusy(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")), password = String(f.get("password"));
    try {
      const { error } = signUp
        ? await authClient.signUp.email({ email, password, name: email })
        : await authClient.signIn.email({ email, password });
      if (error) setErr(error.message || "Could not sign in. Check your email and password.");
      else { router.push("/admin"); router.refresh(); }
    } catch (e) {
      // The SDK throws on HTTP errors such as a 401 for a wrong password: show its message, not a generic one.
      const m = e instanceof Error ? e.message : "";
      setErr(m && m.length < 140 ? m : "Could not sign in. Check your email and password.");
    }
    setBusy(false);
  }

  return (
    <div className="wrap grid min-h-[60vh] place-items-center py-12">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl border border-line bg-white/60 p-6">
        <h1 className="text-2xl font-bold">{signUp ? "Create admin account" : "Admin sign in"}</h1>
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" className="field" /></div>
        <div><label className="label" htmlFor="pw">Password</label><input id="pw" name="password" type="password" required minLength={8} autoComplete={signUp ? "new-password" : "current-password"} className="field" /></div>
        {err && <p role="alert" className="text-sm text-accent">{err}</p>}
        <button type="submit" disabled={busy} className="btn btn-navy w-full">{busy ? "Please wait…" : signUp ? "Create account" : "Sign in"}</button>
        <p className="text-center text-sm text-muted">{signUp ? <Link href="/auth/sign-in" className="underline">Already have an account? Sign in</Link> : <Link href="/" className="underline">Back to store</Link>}</p>
      </form>
    </div>
  );
}
