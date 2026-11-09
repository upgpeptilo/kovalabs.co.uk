"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";

export type Slide = { img: string; title: string; sub: string; cta: string; href: string };
const DURATION = 6000;
const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const m = window.matchMedia(REDUCED);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false);
  const x0 = useRef<number | null>(null);

  useEffect(() => {
    if (paused || reduced) return;
    const t = setTimeout(() => setI((n) => (n + 1) % slides.length), DURATION);
    return () => clearTimeout(t); // restarts on every slide change, so the progress bar and timer stay in step
  }, [i, paused, reduced, slides.length]);

  return (
    <section
      aria-roledescription="carousel" aria-label="Featured research ranges"
      className="relative isolate h-[34rem] overflow-hidden bg-navy text-white md:h-[40rem]"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { setPaused(true); x0.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (x0.current !== null) {
          const dx = e.changedTouches[0].clientX - x0.current;
          if (Math.abs(dx) > 40) setI((n) => (n + (dx < 0 ? 1 : -1) + slides.length) % slides.length);
        }
        x0.current = null; setPaused(false);
      }}
    >
      {slides.map((s, n) => (
        <div key={n} role="group" aria-roledescription="slide" aria-label={`${n + 1} of ${slides.length}`} aria-hidden={n !== i} className={`absolute inset-0 transition-opacity duration-700 ${n === i ? "opacity-100" : "pointer-events-none opacity-0"}`}>
          <img src={s.img} alt="" loading={n === 0 ? "eager" : "lazy"} fetchPriority={n === 0 ? "high" : "auto"} className={`absolute inset-0 -z-10 h-full w-full object-cover ${n === i && !reduced ? "scale-110" : "scale-100"}`} style={{ transition: "transform 8s ease-out" }} />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy/70 via-navy/20 to-transparent" />
          <div className="wrap flex h-full flex-col justify-center pb-16">
            <h1 key={`${i}-${n}`} className={`max-w-xl text-4xl font-bold leading-[1.05] md:text-6xl ${n === i ? "rise" : ""}`}>{s.title}</h1>
            <p className={`mt-4 max-w-md text-lg text-white/85 ${n === i ? "rise [animation-delay:120ms]" : ""}`}>{s.sub}</p>
            <div className={`mt-6 flex flex-wrap items-center gap-4 ${n === i ? "rise [animation-delay:220ms]" : ""}`}>
              <Link href={s.href} tabIndex={n === i ? 0 : -1} className="btn bg-navy text-white ring-1 ring-white/30 hover:bg-white hover:text-navy">{s.cta}</Link>
              <Link href="/coas" tabIndex={n === i ? 0 : -1} className="font-semibold underline underline-offset-4">Browse CoAs →</Link>
            </div>
          </div>
        </div>
      ))}
      <div role="tablist" aria-label="Choose slide" className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, n) => (
          <button key={n} role="tab" type="button" aria-selected={n === i} aria-label={`Slide ${n + 1}`} onClick={() => setI(n)} className="grid h-11 place-items-center px-1">
            <span className="relative block h-1.5 w-8 overflow-hidden rounded-full bg-white/35">
              {n === i && <span key={`${i}-${paused}`} className="absolute inset-0 origin-left bg-white" style={reduced || paused ? undefined : { animation: `fill ${DURATION}ms linear forwards` }} />}
            </span>
          </button>
        ))}
      </div>
      <style>{`@keyframes fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
    </section>
  );
}
