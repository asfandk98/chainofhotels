import type { Metadata } from "next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import WhyChooseUs from "@/components/WhyChooseUs";
import BrowseByCity from "@/components/BrowseByCity";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";
import TripPlanner from "@/components/TripPlanner";
import WhatsAppChat from "@/components/WhatsAppChat";
import BottomNav from "@/components/BottomNav";
import { getHotels, getCities } from "@/lib/api";

// SEO metadata — rendered server-side, picked up by Next automatically.
export const metadata: Metadata = {
  title: "Best Hotels in Dubai | Book Cheap Hotels UAE",
  description:
    "Find and book hotels in Dubai, Abu Dhabi, and Sharjah at the best prices.",
  keywords: ["hotels in dubai", "cheap hotels UAE", "abu dhabi hotels"],
};

// Server Component — data is fetched on the server for SEO/perf,
// same pattern as your old project.
export default async function Home() {
  const [{ featured, dubai, abuDhabi, sharjah }, cities] = await Promise.all([
    getHotels(),
    getCities(),
  ]);

  return (
    <>
      <Header />
      <Hero />

      <main className="space-y-section-gap py-section-gap px-container-padding-mobile md:px-container-padding-desktop max-w-7xl mx-auto">
        {/* Main SEO heading */}
        <h1 className="font-headline-lg-mobile md:font-headline-lg">
          Best Hotels in Dubai, Abu Dhabi & Sharjah
        </h1>

        {/* SEO content */}
        <section>
          <h2 className="font-title-md mb-4">Book Hotels in Dubai</h2>
          <p className="font-body-md text-on-surface-variant max-w-2xl">
            Discover the best hotels in Dubai with affordable prices, luxury
            stays, and family-friendly accommodations. Compare deals and book
            instantly.
          </p>
        </section>

        {/* Dynamic, server-fetched hotel sections */}
        {featured.length > 0 && (
          <ProductCard
            subtitle="HANDPICKED FOR YOU"
            title="Featured Hotels"
            properties={featured}
          />
        )}
        <ProductCard title="Stay in Dubai" properties={dubai} />
        <ProductCard
          title="Popular Stays in Abu Dhabi"
          properties={abuDhabi}
        />
        <ProductCard
          title="Available in Sharjah This Weekend"
          properties={sharjah}
        />
      </main>

      <WhyChooseUs />
      <BrowseByCity cities={cities} />
      <BlogSection />
      <Footer />
        <WhatsAppChat />
      <TripPlanner />
    
      <BottomNav />
    </>
  );
}
