"use client";
import { useActionState } from "react";
import { sendContact } from "./actions";

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContact, null);
  return (
    <form action={action} className="space-y-3 rounded-3xl bg-white p-6 shadow-xl">
      <div><label className="label" htmlFor="topic">What is this about?</label>
        <select id="topic" name="topic" className="field"><option>An order</option><option>A product or CoA</option><option>Wholesale or bulk</option><option>Something else</option></select></div>
      <div><label className="label" htmlFor="c-email">Email</label><input id="c-email" name="email" type="email" required autoComplete="email" className="field" /></div>
      <div><label className="label" htmlFor="msg">Message</label><textarea id="msg" name="message" required rows={5} className="field" /></div>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {state && <p role="status" className={`text-sm ${state.ok ? "text-ok" : "text-accent"}`}>{state.msg}</p>}
      <button type="submit" disabled={pending} className="btn btn-navy w-full">{pending ? "Sending…" : "Send message"}</button>
    </form>
  );
}
