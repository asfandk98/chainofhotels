"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";
import FilterDrawer from "@/components/FilterDrawer";
import { getHotelsList, getFilters, type HotelProperty } from "@/lib/api";

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "rating", label: "Rating: Five Star" },
];

export default function HotelsClient() {
  const searchParams = useSearchParams();

  const [hotels, setHotels] = useState<HotelProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<{ locations: string[]; max_price: number }>({
    locations: [],
    max_price: 5000,
  });
  const [sort, setSort] = useState("recommended");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Search-bar-driven params, read once from the URL on load — these came
  // from Hero's search bar (or a shared link) and aren't editable via the
  // filter drawer, so they stay separate from activeFilters/draft state.
  const checkIn = searchParams.get("check_in") ?? "";
  const checkOut = searchParams.get("check_out") ?? "";
  const guests = searchParams.get("guests") ?? "";

  const [activeFilters, setActiveFilters] = useState({
    locations: searchParams.get("location") ? [searchParams.get("location") as string] : [],
    minPrice: "",
  });
  const [draftLocations, setDraftLocations] = useState<string[]>(activeFilters.locations);
  const [draftMinPrice, setDraftMinPrice] = useState(activeFilters.minPrice);

  useEffect(() => {
    getFilters().then((data) =>
      setFilterOptions({
        locations: data.locations ?? ["Dubai", "Abu Dhabi", "Sharjah"],
        max_price: data.max_price ?? 5000,
      })
    );
  }, []);

  const fetchHotels = useCallback(() => {
    setLoading(true);
    getHotelsList({
      location: activeFilters.locations.join(",") || undefined,
      price_min: activeFilters.minPrice || undefined,
      sort,
      check_in: checkIn || undefined,
      check_out: checkOut || undefined,
      guests: guests || undefined,
    }).then(({ hotels }) => {
      setHotels(hotels);
      setLoading(false);
    });
  }, [activeFilters, sort, checkIn, checkOut, guests]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const openDrawer = () => {
    setDraftLocations(activeFilters.locations);
    setDraftMinPrice(activeFilters.minPrice);
    setDrawerOpen(true);
  };

  const toggleDraftLocation = (loc: string) =>
    setDraftLocations((prev) => (prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]));

  const applyFilters = () => {
    setActiveFilters({ locations: draftLocations, minPrice: draftMinPrice });
    setDrawerOpen(false);
  };

  const resetFilters = () => {
    setDraftLocations([]);
    setDraftMinPrice("");
  };

  const cheapestPrice = hotels.length
    ? Math.min(
        ...hotels.map((h) => Number(h.price ?? h.active_price ?? h.pricePerNight) || Infinity)
      )
    : null;

  const fmtDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-AE", { day: "numeric", month: "short" }) : "";

  return (
    <>
      <Header />

      <main className="min-h-screen pt-20">
        {/* Hero */}
        <section className="px-container-padding-mobile md:px-container-padding-desktop py-16">
          <span className="font-label-caps text-secondary mb-4 block tracking-[0.3em] uppercase">
  HOTELS ACROSS THE UAE
</span>

<h2 className="font-display-lg-mobile md:font-display-lg leading-tight max-w-4xl">
  Discover Exceptional Stays in
  <span className="italic text-secondary"> Dubai, Abu Dhabi & Beyond.</span>
</h2>

<p className="mt-6 max-w-3xl text-lg text-on-surface-variant leading-relaxed">
  Browse luxury hotels, beachfront resorts, business accommodations, and family
  retreats across the UAE. Compare rooms, amenities, and prices to book your
  perfect stay with confidence.
</p>

          {/* Search summary — only shows when the person arrived via Hero's search */}
          {(checkIn || checkOut || guests) && (
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-on-surface-variant">
              {checkIn && checkOut && (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-secondary">calendar_month</span>
                  {fmtDate(checkIn)} — {fmtDate(checkOut)}
                </span>
              )}
              {guests && (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-secondary">group</span>
                  {guests}
                </span>
              )}
            </div>
          )}
        </section>

        {/* Filter & sort bar */}
        <section className="sticky top-20 z-40 bg-surface/95 backdrop-blur-md py-6 px-container-padding-mobile md:px-container-padding-desktop border-b border-secondary/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={openDrawer}
                className="flex items-center gap-3 bg-secondary text-on-secondary px-8 py-3 rounded-full font-label-caps hover:scale-105 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-lg">tune</span>
                FILTER BY
              </button>
              <p className="hidden md:block text-on-surface-variant italic">
                {loading
                  ? "Searching…"
                  : `${hotels.length} exclusive ${hotels.length === 1 ? "property" : "properties"} found`}
              </p>
            </div>

            <div className="flex items-center gap-4 self-end md:self-auto">
              <span className="font-label-caps text-on-surface-variant">SORT BY</span>
              <div className="relative group">
                <button className="flex items-center gap-2 border-b border-secondary/40 pb-1 font-title-md text-secondary">
                  {SORT_OPTIONS.find((o) => o.value === sort)?.label}
                  <span className="material-symbols-outlined">expand_more</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-surface-container-high shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => setSort(o.value)}
                      className="block w-full text-left px-6 py-2 hover:bg-secondary/10 hover:text-secondary transition-colors"
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="py-section-gap px-container-padding-mobile md:px-container-padding-desktop">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-surface-container animate-pulse rounded-lg" />
              ))}
            </div>
          ) : hotels.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-title-md text-on-surface mb-2">No properties match your filters</p>
              <p className="text-on-surface-variant italic mb-6">Try adjusting your search criteria</p>
              <button
                onClick={resetFilters}
                className="border border-secondary text-secondary px-8 py-3 font-label-caps hover:bg-secondary hover:text-on-secondary transition-all"
              >
                CLEAR FILTERS
              </button>
            </div>
          ) : (
            <ProductCard title={`${hotels.length} Properties Found`} properties={hotels} />
          )}
        </section>
      </main>

      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        locations={filterOptions.locations}
        selectedLocations={draftLocations}
        onToggleLocation={toggleDraftLocation}
        minPrice={draftMinPrice}
        onMinPriceChange={setDraftMinPrice}
        maxPrice={filterOptions.max_price}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      <Footer />
      <BottomNav price={Number.isFinite(cheapestPrice) ? cheapestPrice ?? undefined : undefined} />
    </>
  );
}