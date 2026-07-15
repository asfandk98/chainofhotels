"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import type { HotelProperty } from "@/lib/api";
import { toAbsoluteImageUrl } from "@/lib/resolveImage";
import { addToWishlist, removeFromWishlist, getWishlist } from "@/lib/wishlist";
import Reveal from "./Reveal";

const FALLBACK_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB77JtjQPzT4mKBi3FO5PvW1lEA1Gw3KffePXMIa9NXqSmPSH-oD5Ue41A0dutu3EdUd3pbsB21R5wS22P4FV3Ly3_tE-oqAgjFrt2ukMuQROTExFAddm0MPZmRn28htpHscm6Z53GX4rymzcD84Mb70LOaUMWauV6c_0jKf7rkSm1QFTbbzZw3dXO-FF7R-ns57zyicaBnQX5U9cdYqXtzaxW6-fQvzL5IH-S3-lIO_7RHbJK-Zfwxag";

function getName(p: HotelProperty) {
  return p.name ?? p.title ?? "Untitled Property";
}

function getLocation(p: HotelProperty) {
  return p.location ?? p.city ?? "";
}

// Prefers a full image_url, falls back to resolving a relative storage
// path, then thumbnail/images[], then the static fallback.
function resolveHotelImage(p: HotelProperty): string {
  const firstGalleryImage = p.images?.[0];
  const galleryUrl =
    typeof firstGalleryImage === "string"
      ? firstGalleryImage
      : (firstGalleryImage?.url ?? toAbsoluteImageUrl(firstGalleryImage?.path));

  return (
    toAbsoluteImageUrl(p.image_url) ??
    toAbsoluteImageUrl(p.image) ??
    p.thumbnail ??
    galleryUrl ??
    FALLBACK_IMAGE
  );
}

function getPrice(p: HotelProperty) {
  const isOnOffer = p.is_on_offer === true;
  const active = isOnOffer ? p.active_price ?? p.price : p.price ?? p.pricePerNight;
  const original = isOnOffer ? p.original_price ?? p.price : null;

  if (active === undefined || active === null || active === "") {
    return { active: null, original: null };
  }

  const currency = p.currency ?? "AED";
  return {
    active: `${currency} ${active}`,
    original: original ? `${currency} ${original}` : null,
  };
}

function getHref(p: HotelProperty) {
  if (p.slug) return `/hotels/${p.slug}`;
  if (p.id !== undefined) return `/hotels/${p.id}`;
  return "#";
}

function getWishlistKey(p: HotelProperty) {
  return p.hotel_id ?? p.id ?? p.slug ?? "";
}

export default function ProductCard({
  title,
  subtitle,
  properties,
}: {
  title: string;
  subtitle?: string;
  properties: HotelProperty[];
}) {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getWishlist();
        const items = Array.isArray(res) ? res : (res?.data ?? []);
        if (cancelled) return;
        const map: Record<string, boolean> = {};
        items.forEach((i: { hotel_id: string | number }) => {
          map[String(i.hotel_id)] = true;
        });
        setWishlist(map);
      } catch {
        // Not logged in or request failed — leave wishlist empty, no crash.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleWishlist = async (
    e: React.MouseEvent,
    property: HotelProperty
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const key = String(getWishlistKey(property));
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      if (wishlist[key]) {
        await removeFromWishlist(key);
        setWishlist((prev) => ({ ...prev, [key]: false }));
      } else {
        await addToWishlist(key);
        setWishlist((prev) => ({ ...prev, [key]: true }));
      }
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
    }
  };

  if (!properties || properties.length === 0) return null;

  return (
    <section>
      <Reveal className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          {subtitle && (
            <span className="font-label-caps text-secondary mb-2 block">
              {subtitle}
            </span>
          )}
          <h3 className="font-headline-lg-mobile md:font-headline-lg">
            {title}
          </h3>
        </div>
      </Reveal>

      <Reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {properties.map((property, i) => {
          const price = getPrice(property);
          const location = getLocation(property);
          const key = String(getWishlistKey(property) || i);
          const isWishlisted = !!wishlist[key];

          return (
            <Link
              key={property.id ?? property.slug ?? i}
              href={getHref(property)}
              className="group relative aspect-[4/5] overflow-hidden rounded-lg hover-lift block bg-surface-container"
            >
              <img
                src={resolveHotelImage(property)}
                alt={property.alt ?? getName(property)}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover blur-sm scale-105 transition-all duration-500 group-hover:scale-110"
                onLoad={(e) => {
                  e.currentTarget.classList.remove("blur-sm", "scale-105");
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {property.is_on_offer && (
                <span className="absolute top-3 left-3 bg-error text-on-error text-[10px] font-bold px-2 py-1 rounded">
                  DEAL
                </span>
              )}

              {/* Wishlist */}
              <button
                onClick={(e) => toggleWishlist(e, property)}
                className="absolute top-3 right-3 w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/60 transition-all"
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <Heart
                  size={16}
                  className={
                    isWishlisted
                      ? "fill-secondary text-secondary"
                      : "text-white"
                  }
                />
              </button>

              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex justify-between items-start gap-2 mb-1">
                  {location && (
                    <span className="font-label-caps text-secondary text-[10px]">
                      {location.toUpperCase()}
                    </span>
                  )}
                  {property.rating && (
                    <div className="flex items-center gap-1 text-[10px] bg-secondary/90 text-on-secondary px-1.5 py-0.5 rounded font-semibold shrink-0">
                      <Star size={10} className="fill-current" />
                      {property.rating}
                    </div>
                  )}
                </div>

                <h4 className="font-title-md text-white mb-2 line-clamp-1">
                  {getName(property)}
                </h4>

                {price.active && (
                  <div className="flex items-baseline gap-2">
                    <span className="font-label-caps text-white text-xs">
                      {price.active}
                    </span>
                    {price.original && (
                      <span className="text-[10px] text-white/50 line-through">
                        {price.original}
                      </span>
                    )}
                    <span className="text-[10px] text-white/50">/night</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </Reveal>
    </section>
  );
}
