import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getHotelsList, getCities } from "@/lib/api";

export const metadata: Metadata = {
  title: "About Us | Luxury Hotels & Hotel Booking in UAE",
  description:
    "Learn more about our hotel booking platform offering luxury, business, family, and resort accommodations across Dubai, Abu Dhabi, Sharjah, and the UAE. Find the perfect stay at the best available rates.",
};

const VALUES = [
  {
    icon: "hotel",
    title: "Premium Hotel Collection",
    description:
      "Choose from luxury hotels, resorts, boutique accommodations, and business hotels across the UAE.",
  },
  {
    icon: "verified",
    title: "Best Price Guarantee",
    description:
      "Enjoy competitive hotel rates with transparent pricing and no hidden booking fees.",
  },
  {
    icon: "support_agent",
    title: "24/7 Customer Support",
    description:
      "Our experienced hospitality team is available around the clock to assist with reservations and guest inquiries.",
  },
  {
    icon: "star",
    title: "Trusted Guest Experience",
    description:
      "Highly rated hotels offering exceptional comfort, premium amenities, and outstanding customer service.",
  },
];

export default async function AboutUsPage() {
  const [{ hotels }, cities] = await Promise.all([getHotelsList(), getCities()]);

  const stats = [
    { label: "Luxury Hotels", value: `${hotels.length}+` },
    { label: "Popular Destinations", value: `${cities.length || 7}` },
    { label: "Customer Support", value: "24/7" },
    { label: "Happy Guests", value: "4.8★" },
  ];

  return (
    <>
      <Header />

      <main className="pt-32 pb-section-gap">
        {/* Hero */}
        <section className="px-container-padding-mobile md:px-container-padding-desktop mb-section-gap">
          <div className="max-w-3xl">
            <span className="font-label-caps text-secondary mb-4 block tracking-[0.3em]">ABOUT OUR HOTEL COLLECTION</span>
            <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface leading-tight mb-8">
Discover Exceptional Hotels Across the United Arab Emirates            </h1>
           <p className="font-body-lg text-on-surface-variant max-w-2xl">
  We are dedicated to helping travelers discover the finest hotels across
  Dubai, Abu Dhabi, Sharjah, and other leading destinations throughout the
  United Arab Emirates. Whether you're planning a luxury vacation, business
  trip, family holiday, or romantic getaway, our platform connects you with
  carefully selected accommodations that combine comfort, quality, and
  outstanding hospitality.
</p>
          </div>
        </section>

        {/* Stats */}
        <section className="px-container-padding-mobile md:px-container-padding-desktop mb-section-gap">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-surface-container-high luxury-shadow rounded-lg p-8 text-center"
              >
                <p className="font-headline-lg-mobile md:font-headline-lg text-secondary mb-2">{stat.value}</p>
                <p className="font-label-caps text-label-caps text-on-surface-variant">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story image + text */}
        <section className="px-container-padding-mobile md:px-container-padding-desktop mb-section-gap grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
          <div className="md:col-span-6 aspect-[4/3] overflow-hidden rounded-xl">
            <div
              className="w-full h-full bg-cover bg-center"
              role="img"
              aria-label="Dubai skyline at golden hour"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA95w7p_yxwMWRpXxjixiVrdCrmfYDTWX24MOCr_-gCDYFO7v6RkW0nRV1lXt10osStPSJXJLyhX_WBgbl1mUrr3PDoT-vTXSVInly6kIKO8ThVPef6BP8qztMrANrtD5c0nI0LO2xlreHbx7IrsEUYfSB23PXcU9cxjmLulhgZh-eMbYvgHuZ_FBA2zGo_O0S8_egwkv16ZMnR1IdPPNysJIreZJWwlPLn6J51uzkYyjAE6qGrhg6AeQ')",
              }}
            />
          </div>
          <div className="md:col-span-6">
            <span className="font-label-caps text-secondary mb-4 block">OUR COMMITMENT</span>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-on-surface mb-6">
              Providing Memorable Hotel Experiences for Every Traveler
            </h2>
           <p className="font-body-md text-on-surface-variant mb-4 leading-relaxed">
  Our mission is to make hotel booking simple, reliable, and transparent.
  We partner with trusted hotels and resorts to provide guests with
  exceptional accommodations, competitive prices, and a seamless booking
  experience.
</p>

<p className="font-body-md text-on-surface-variant leading-relaxed">
  From luxury city hotels and beachfront resorts to family-friendly and
  business accommodations, we are committed to helping every guest find the
  perfect place to stay while enjoying world-class hospitality across the UAE.
</p>
          </div>
        </section>

        {/* Values grid */}
        <section className="px-container-padding-mobile md:px-container-padding-desktop mb-section-gap">
          <div className="text-center mb-16">
            <span className="font-label-caps text-secondary mb-4 block">WHY CHOOSE US</span>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-on-surface">
             Why Thousands of Guests Choose Our Hotels
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-8 hover:border-secondary/30 transition-colors"
              >
                <span className="material-symbols-outlined text-secondary text-3xl mb-6 block">{value.icon}</span>
                <h3 className="font-title-md text-on-surface mb-3">{value.title}</h3>
                <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-container-padding-mobile md:px-container-padding-desktop">
          <div className="bg-surface-container-high rounded-2xl p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full" />
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-on-surface mb-6 relative z-10">
              Book Your Perfect Hotel Today
            </h2>
            <p className="font-body-md text-on-surface-variant mb-10 max-w-xl mx-auto relative z-10">
              Browse our collection of luxury hotels, business accommodations,
family-friendly resorts, and boutique stays across Dubai, Abu Dhabi,
Sharjah, and the United Arab Emirates.
            </p>
            <Link
              href="/hotels"
              className="inline-block bg-secondary text-on-secondary px-10 py-4 font-label-caps text-label-caps hover:opacity-90 transition-all relative z-10"
            >
              EXPLORE HOTELS
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}