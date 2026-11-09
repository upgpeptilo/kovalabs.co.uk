"use client";
import { useState } from "react";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  return (
    <div className={`grid grid-cols-[minmax(0,1fr)] gap-3 ${images.length > 1 ? "md:grid-cols-[4.5rem_minmax(0,1fr)]" : ""}`}>
      {images.length > 1 && (
        <div className="order-2 flex gap-2 md:order-1 md:flex-col">
          {images.map((src, n) => (
            <button key={src} type="button" aria-label={`Show image ${n + 1}`} aria-current={n === i} onClick={() => setI(n)} className={`h-16 w-16 min-w-0 overflow-hidden rounded-xl border-2 bg-card ${n === i ? "border-navy" : "border-transparent"}`}>
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="order-1 min-w-0 overflow-hidden rounded-3xl bg-card md:order-2">
        <img src={images[i]} alt={alt} className="aspect-square w-full min-w-0 object-cover" />
      </div>
    </div>
  );
}
