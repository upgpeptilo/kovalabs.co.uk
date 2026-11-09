"use client";
import { useState, useTransition } from "react";

const Track = ({ on }: { on: boolean }) => (
  <span aria-hidden className={`relative inline-block h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-navy" : "bg-line"}`}>
    <span className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${on ? "translate-x-5" : ""}`} />
  </span>
);

// Form switch: submits "on" when enabled (a real checkbox underneath, styled as a switch).
export function FormSwitch({ name, label, defaultChecked = false, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-2xl border border-line bg-white px-4 py-2">
      <span><span className="block font-medium">{label}</span>{hint && <span className="block text-xs text-muted">{hint}</span>}</span>
      <input type="checkbox" role="switch" name={name} checked={on} onChange={(e) => setOn(e.target.checked)} className="peer sr-only" />
      <Track on={on} />
    </label>
  );
}

// Instant-save switch: optimistic update, rolls back if the server call fails.
export function InstantSwitch({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: (next: boolean) => Promise<void> }) {
  const [on, setOn] = useState(checked);
  const [err, setErr] = useState(false);
  const [pending, start] = useTransition();
  return (
    <button
      type="button" role="switch" aria-checked={on} aria-label={label} disabled={pending}
      className="flex min-h-11 items-center gap-2"
      onClick={() => {
        const next = !on; setOn(next); setErr(false);
        start(async () => { try { await onToggle(next); } catch { setOn(!next); setErr(true); } });
      }}
    >
      <Track on={on} />
      <span className="text-sm">{on ? "On" : "Off"}</span>
      {err && <span role="alert" className="text-xs text-accent">Couldn&apos;t save</span>}
    </button>
  );
}
