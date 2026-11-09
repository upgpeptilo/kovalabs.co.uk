"use client";
import { useId, useRef, useState } from "react";

// Image field: choose files from the device (they upload to the store's database) or paste URLs.
// `multiple` = a list of images, one URL per line; otherwise a single URL.
export function ImageInput({ name, label, defaultValue = "", multiple = false }: { name: string; label: string; defaultValue?: string; multiple?: boolean }) {
  const uid = useId();
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const urls = value.split("\n").map((s) => s.trim()).filter(Boolean);

  async function upload(files: FileList) {
    setBusy(true); setErr("");
    const added: string[] = [];
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", f);
      try {
        const r = await fetch("/api/upload", { method: "POST", body: fd });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) { setErr(`${f.name}: ${j.error || "upload failed"}`); continue; }
        added.push(j.url);
      } catch { setErr(`${f.name}: upload failed, check your connection`); }
    }
    if (added.length) setValue((v) => (multiple ? [...v.split("\n").filter(Boolean), ...added].join("\n") : added[0]));
    setBusy(false);
    if (file.current) file.current.value = "";
  }

  const id = `img-${name}-${uid}`; // unique: several forms with the same field name can share a page
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      {multiple
        ? <textarea id={id} name={name} rows={3} value={value} onChange={(e) => setValue(e.target.value)} className="field font-mono text-xs" />
        : <input id={id} name={name} value={value} onChange={(e) => setValue(e.target.value)} className="field" />}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input ref={file} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple={multiple} className="sr-only" id={`${id}-file`} aria-label={`Choose ${label} from your device`} onChange={(e) => e.target.files?.length && upload(e.target.files)} />
        <button type="button" disabled={busy} className="btn btn-line !min-h-10 text-sm" onClick={() => file.current?.click()}>{busy ? "Uploading…" : multiple ? "Upload images" : "Upload image"}</button>
        {urls.slice(0, 6).map((u) => <img key={u} src={u} alt="" className="h-12 w-12 rounded-lg bg-card object-cover" />)}
      </div>
      {err && <p role="alert" className="mt-1 text-sm text-accent">{err}</p>}
    </div>
  );
}
