import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HotelGallery from "@/components/hotels/HotelGallery";
import RoomsAndBookingBar from "@/components/hotels/RoomsAndBookingBar";
import NearbyBento from "@/components/hotels/NearbyBento";
import { getHotel } from "@/lib/api";
import { toAbsoluteImageUrl } from "@/lib/resolveImage";
import { iconForAmenity } from "@/lib/amenityIcons";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hotel = await getHotel(slug);
  if (!hotel) return { title: "Hotel Not Found | Lumina Dubai" };
  const name = hotel.title ?? hotel.name;
  return {
    title: `${name} | Lumina Dubai`,
    description: `Book ${name} in ${hotel.location}. From $${hotel.price}/night.`,
  };
}

export default async function HotelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hotel = await getHotel(slug);

 if (!hotel) return notFound();

const name = hotel.title ?? hotel.name ?? "";

const galleryItems = hotel.images && hotel.images.length > 0
  ? hotel.images.map((img) => img.url ?? img.path)
  : [hotel.image_url ?? hotel.image];

const gallery = galleryItems
  .map((src) => toAbsoluteImageUrl(src ?? undefined))
  .filter((src): src is string => !!src);

const amenities = hotel.amenities ?? [];
const starsFilled = hotel.stars ?? 5;

  return (
    <>
      <Header />
      <main className="relative pt-20">
        <HotelGallery images={gallery} alt={name} />

        {/* Header info */}
        <section className="px-container-padding-mobile md:px-container-padding-desktop py-12 grid grid-cols-1 md:grid-cols-12 gap-gutter items-end">
          <div className="md:col-span-8">
            <h1 className="font-headline-lg-mobile md:text-display-lg font-display-lg text-on-surface mb-4">
              {name}
            </h1>
            {hotel.description && (
              <p className="font-body-lg text-on-surface-variant max-w-2xl">{hotel.description}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
                <span className="font-label-caps text-label-caps text-secondary">BEST PRICE GUARANTEE</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                <span className="material-symbols-outlined text-secondary text-[18px]">event_available</span>
                <span className="font-label-caps text-label-caps text-secondary">FREE CANCELLATION</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex md:justify-end gap-6">
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end text-secondary mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-[16px]"
                    style={{ fontVariationSettings: `'FILL' ${i <= starsFilled ? 1 : 0}` }}
                  >
                    star
                  </span>
                ))}
              </div>
              <p className="font-label-caps text-label-caps text-on-surface-variant">
                {hotel.reviews_count ?? 0} REVIEWS{hotel.rating ? " • EXCELLENT" : ""}
              </p>
            </div>
          </div>
        </section>

        {/* Amenities */}
        {amenities.length > 0 && (
          <section className="px-container-padding-mobile md:px-container-padding-desktop py-section-gap">
            <h2 className="font-label-caps text-label-caps text-secondary mb-12 uppercase tracking-widest">
              Amenities &amp; Services
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-gutter">
              {amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex flex-col items-center p-8 bg-surface-container-low rounded-xl border border-white/5 hover:border-secondary/20 transition-all group"
                >
                  <span className="material-symbols-outlined text-secondary text-[32px] mb-4 group-hover:scale-110 transition-transform">
                    {iconForAmenity(amenity)}
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface text-center">{amenity}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <RoomsAndBookingBar hotel={hotel} />

        <NearbyBento hotels={hotel.nearby ?? []} />
      </main>
      <Footer />
    </>
  );
}