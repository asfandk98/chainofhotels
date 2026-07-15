"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CityProperty } from "@/lib/api";
import { getHotelsList } from "@/lib/api";
import { toAbsoluteImageUrl } from "@/lib/resolveImage";
import { cities as demoCities } from "@/data/cities";
import Reveal from "./Reveal";

const FALLBACK_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDSzCe8pb0p30aPHIQMtnCBATWexFq0taaOy8Uupsgo7x-UE6D4ktH8QH0szzeAtiMjKR-eR2PeprD-cIUeHIkf_seOSWznqHlCQ42CgiKVA8Z-jAmqcJs0IbGoHEQZopAPpfMYzdiyi-I0rlooLG-zQD-ZW16DtJQ_R32vid6qq2G90_4ZaBFxqVyg1Vl6ulFPdvlmBa2aQ2dG0al6UoNfKc6DMjdV1qsCs-A8PDLUH0mHHsA1ND6m3Q";

function getCityName(city: CityProperty) {
  return city.name ?? city.title ?? "Destination";
}

function getCityImage(city: CityProperty) {
  return (
    toAbsoluteImageUrl(city.image_url) ??
    toAbsoluteImageUrl(city.image) ??
    FALLBACK_IMAGE
  );
}

// Prefers a live count fetched from /hotels; falls back to whatever the
// /location endpoint itself provided, if anything.
function getCityLabel(city: CityProperty, liveCount: number | undefined) {
  if (liveCount !== undefined) {
    return `${liveCount} ${liveCount === 1 ? "PROPERTY" : "PROPERTIES"}`;
  }
  if (city.properties) return city.properties;
  const count = city.properties_count ?? city.propertyCount;
  if (count === undefined || count === null) return null;
  return `${count} ${count === 1 ? "PROPERTY" : "PROPERTIES"}`;
}

function getCityHref(city: CityProperty) {
  const key = city.slug ?? city.name ?? city.title;
  return key ? `/hotels?location=${encodeURIComponent(key)}` : "#";
}

export default function BrowseByCity({
  cities,
}: {
  cities?: CityProperty[];
}) {
  // Fall back to the static demo cities if the API returned nothing yet
  // (endpoint not built, request failed, or genuinely empty).
  const items = cities && cities.length > 0 ? cities : demoCities;

  // Live property counts per city, keyed by whatever getCityHref uses to
  // filter (slug/name/title) — fetched from the real /hotels list so the
  // number shown always matches what clicking through actually returns.
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      items.map(async (city) => {
        const key = city.slug ?? city.name ?? city.title;
        if (!key) return null;
        try {
          const { hotels } = await getHotelsList({ location: key });
          return [key, hotels.length] as const;
        } catch {
          return null;
        }
      })
    ).then((results) => {
      if (cancelled) return;
      const map: Record<string, number> = {};
      results.forEach((r) => {
        if (r) map[r[0]] = r[1];
      });
      setCounts(map);
    });

    return () => {
      cancelled = true;
    };
    // items comes from props/demo data and won't change identity per render
    // in practice; re-running per city list change is what we want here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities]);

  return (
    <section className="py-section-gap px-container-padding-mobile md:px-container-padding-desktop">
      <Reveal className="text-center mb-16">
        <span className="font-label-caps text-secondary mb-4 block">
          EXPLORE THE EMIRATES
        </span>
        <h3 className="font-headline-lg-mobile md:font-headline-lg">
          Select Your Destination
        </h3>
      </Reveal>

      <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {items.map((city, i) => {
          const key = city.slug ?? city.name ?? city.title;
          const liveCount = key ? counts[key] : undefined;
          const label = getCityLabel(city, liveCount);

          return (
            <Link
              key={city.id ?? city.slug ?? i}
              href={getCityHref(city)}
              className="group relative h-[400px] overflow-hidden rounded-xl cursor-pointer block"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                role="img"
                aria-label={city.alt ?? getCityName(city)}
                style={{ backgroundImage: `url('${getCityImage(city)}')` }}
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <h4 className="font-headline-lg-mobile text-white text-3xl mb-2">
                  {getCityName(city)}
                </h4>
                {label && (
                  <span className="font-label-caps text-white/80 opacity-0 group-hover:opacity-100 transition-all">
                    {label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </Reveal>
    </section>
  );
}