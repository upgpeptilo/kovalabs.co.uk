"use client";
import { useState } from "react";

export const COUNTRIES = [
  { code: "GB", name: "United Kingdom", dial: "44" },
  { code: "US", name: "United States", dial: "1" },
  { code: "CA", name: "Canada", dial: "1" },
  { code: "IE", name: "Ireland", dial: "353" },
  { code: "FR", name: "France", dial: "33" },
  { code: "DE", name: "Germany", dial: "49" },
  { code: "ES", name: "Spain", dial: "34" },
  { code: "NG", name: "Nigeria", dial: "234" },
  { code: "ZA", name: "South Africa", dial: "27" },
  { code: "AU", name: "Australia", dial: "61" },
];

// Split stored digits (country code + national number) back into a country and a national part.
function split(digits: string) {
  const hit = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length).find((c) => digits.startsWith(c.dial));
  return hit && digits.length > hit.dial.length ? { code: hit.code, national: digits.slice(hit.dial.length) } : { code: "GB", national: digits };
}

// Country picker + national number. A hidden input submits digits only (country code + number).
export function PhoneField({ name, label, defaultValue = "" }: { name: string; label: string; defaultValue?: string }) {
  const init = split(defaultValue);
  const [code, setCode] = useState(init.code);
  const [national, setNational] = useState(init.national);
  const dial = COUNTRIES.find((c) => c.code === code)!.dial;
  const clean = national.replace(/\D/g, "").replace(/^0+/, ""); // a local leading 0 is dropped
  const digits = clean ? dial + clean : "";

  function onChange(raw: string) {
    const pasted = raw.trim();
    const d = pasted.replace(/\D/g, "");
    // Pasted full number: "+237 677...", "00237...", or 11+ digits starting with a known code.
    const intl = pasted.startsWith("+") || pasted.startsWith("00") || d.length >= 11;
    if (intl) {
      const body = pasted.startsWith("00") ? d.slice(2) : d;
      const hit = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length).find((c) => body.startsWith(c.dial));
      if (hit) { setCode(hit.code); setNational(body.slice(hit.dial.length)); return; }
    }
    setNational(raw);
  }

  return (
    <div>
      <label className="label" htmlFor={`${name}-n`}>{label}</label>
      <div className="flex gap-2">
        <select aria-label={`${label} country`} value={code} onChange={(e) => setCode(e.target.value)} className="field !w-40 shrink-0">
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.code} +{c.dial}</option>)}
        </select>
        <input id={`${name}-n`} inputMode="tel" value={national} onChange={(e) => onChange(e.target.value)} placeholder="7700 900123" className="field min-w-0" />
      </div>
      <input type="hidden" name={name} value={digits} />
      <p className="mt-1 text-xs text-muted">{digits ? `Customers will message +${digits}` : "Not set"}</p>
    </div>
  );
}
