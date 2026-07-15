"use client";

import { useState } from "react";

export default function HotelGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [selected, setSelected] = useState(0);
  const heroSrc = images[selected] ?? images[0];

  return (
    <>
      {/* Hero */}
      <section className="w-full relative h-[618px] md:h-[751px] overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-1000"
          style={{ backgroundImage: heroSrc ? `url('${heroSrc}')` : undefined }}
          role="img"
          aria-label={alt}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60" />
      </section>

      {/* Thumbnails */}
      {images.length > 1 && (
        <section className="px-container-padding-mobile md:px-container-padding-desktop -mt-24 relative z-10">
          <div className="flex gap-4 overflow-x-auto pb-6 snap-x no-scrollbar">
            {images.map((src, i) => (
              <button
                key={src + i}
                onClick={() => setSelected(i)}
                className={`min-w-[120px] md:min-w-[180px] h-24 md:h-32 rounded-xl overflow-hidden snap-center transition-colors ${
                  i === selected
                    ? "border-2 border-secondary"
                    : "border border-white/10 hover:border-secondary/50"
                }`}
              >
                <img className="w-full h-full object-cover" src={src} alt={`${alt} — view ${i + 1}`} />
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}