"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// A <details> menu (works without JS) that also closes on: choosing a link, a click outside, Escape, and route changes.
export function NavDropdown({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const path = usePathname();
  const close = () => ref.current?.removeAttribute("open");

  useEffect(close, [path]); // route changed (e.g. arrived via the browser back button)

  useEffect(() => {
    const onDown = (e: Event) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, []);

  return (
    <details ref={ref} className="group relative">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-full px-4 font-medium group-open:bg-navy group-open:text-white [&::-webkit-details-marker]:hidden">
        {title} <span className="text-xs transition group-open:rotate-180">▾</span>
      </summary>
      {/* onClick also covers a link to the page you are already on, where the pathname does not change */}
      <div className="rise absolute left-0 top-12 z-50 w-64 rounded-3xl bg-card p-3 shadow-xl" onClick={(e) => { if ((e.target as HTMLElement).closest("a")) close(); }}>
        {links.map((l) => <Link key={l.href} href={l.href} className="flex min-h-11 items-center rounded-xl px-3 hover:bg-cream">{l.label}</Link>)}
      </div>
    </details>
  );
}
