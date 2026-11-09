"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Group = { title: string; links: { href: string; label: string }[] };

// Slide-in drawer rendered through a portal: a sticky header with backdrop-blur would trap position:fixed children.
export function MobileMenu({ groups, extra }: { groups: Group[]; extra?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button type="button" aria-label="Open menu" aria-expanded={open} className="grid h-11 w-11 place-items-center rounded-full md:hidden" onClick={() => setOpen(true)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
      </button>
      {/* open only becomes true after a click, so document always exists here: no mounted flag needed */}
      {open && createPortal(
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-navy/50" onClick={() => setOpen(false)} />
          <nav aria-label="Menu" className="rise absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col overflow-y-auto bg-cream p-5 shadow-2xl">
            <button type="button" aria-label="Close menu" className="ml-auto grid h-11 w-11 place-items-center text-2xl" onClick={() => setOpen(false)}>✕</button>
            {groups.map((g) => (
              <div key={g.title} className="mt-4">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">{g.title}</p>
                {g.links.map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setOpen(false)} aria-current={path === l.href ? "page" : undefined}
                    className={`flex min-h-12 items-center rounded-xl px-3 text-lg ${path === l.href ? "bg-navy font-semibold text-white" : ""}`}>
                    {l.label}
                  </Link>
                ))}
              </div>
            ))}
            {extra && <div className="mt-auto pt-6" onClick={() => setOpen(false)}>{extra}</div>}
          </nav>
        </div>,
        document.body,
      )}
    </>
  );
}
