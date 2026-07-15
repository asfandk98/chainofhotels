import Link from "next/link";
import type { NearbyHotel } from "@/lib/api";
import { toAbsoluteImageUrl } from "@/lib/resolveImage";

export default function NearbyBento({ hotels }: { hotels: NearbyHotel[] }) {
  if (!hotels || hotels.length === 0) return null;
  const [big, ...rest] = hotels.slice(0, 3);

  const Card = ({
    hotel,
    className,
  }: {
    hotel: NearbyHotel;
    className: string;
  }) => (
    <Link
      href={`/hotels/${hotel.slug ?? hotel.id}`}
      className={`relative rounded-2xl overflow-hidden group cursor-pointer ${className}`}
    >
      {toAbsoluteImageUrl(hotel.image_url) ?? toAbsoluteImageUrl(hotel.image) ? (
        <img
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          src={(toAbsoluteImageUrl(hotel.image_url) ?? toAbsoluteImageUrl(hotel.image))!}
          alt={hotel.name ?? hotel.title ?? "Nearby hotel"}
        />
      ) : (
        <div className="w-full h-full bg-surface-container-low flex items-center justify-center text-3xl">🏨</div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-80" />
      <div className="absolute bottom-8 left-8">
        {hotel.distance_km && (
          <p className="text-label-caps text-secondary mb-2">{hotel.distance_km} KM AWAY</p>
        )}
        <h4 className="font-title-md text-on-surface">{hotel.name ?? hotel.title}</h4>
      </div>
    </Link>
  );

  return (
    <section className="px-container-padding-mobile md:px-container-padding-desktop py-section-gap">
      <h2 className="font-label-caps text-label-caps text-secondary mb-12 uppercase tracking-widest">
        More To Explore Nearby
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[600px]">
        <Card hotel={big} className="md:col-span-2 md:row-span-2" />
        {rest.map((h) => (
          <Card key={h.id ?? h.slug} hotel={h} className="md:col-span-2 h-64 md:h-full" />
        ))}
      </div>
    </section>
  );
}