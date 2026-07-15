"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFilters } from "@/lib/api";

export default function Hero() {
  const router = useRouter();
  const [locations, setLocations] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2 Adults");

  useEffect(() => {
    getFilters().then((data) => {
      setLocations(data.locations ?? ["Dubai", "Abu Dhabi", "Sharjah"]);
    });
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (checkIn) params.set("check_in", checkIn);
    if (checkOut) params.set("check_out", checkOut);
    if (guests) params.set("guests", guests);

    router.push(`/hotels${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          role="img"
          aria-label="Cinematic aerial shot of the Dubai skyline at golden hour with the Burj Khalifa piercing through a light mist."
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA95w7p_yxwMWRpXxjixiVrdCrmfYDTWX24MOCr_-gCDYFO7v6RkW0nRV1lXt10osStPSJXJLyhX_WBgbl1mUrr3PDoT-vTXSVInly6kIKO8ThVPef6BP8qztMrANrtD5c0nI0LO2xlreHbx7IrsEUYfSB23PXcU9cxjmLulhgZh-eMbYvgHuZ_FBA2zGo_O0S8_egwkv16ZMnR1IdPPNysJIreZJWwlPLn6J51uzkYyjAE6qGrhg6AeQ')",
          }}
        />
        <div className="absolute inset-0 hero-scrim" />
      </div>

      <div className="relative z-10 text-center px-container-padding-mobile max-w-4xl">
 <h1 className="font-headline-lg-mobile md:font-headline-lg text-white mb-6 leading-tight">
  Find & Book Hotels in Dubai, Abu Dhabi, Sharjah & Across the UAE
</h1>

<p className="font-body-lg text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
  Browse thousands of hotels across the United Arab Emirates. From luxury
  resorts and beachfront hotels to business accommodations and family-friendly
  stays, compare prices, explore amenities, and enjoy secure online booking
  with instant confirmation.
</p>

        {/* Sleek Search Bar */}
        <div className="w-full glass-card p-2 md:p-4 rounded-xl shadow-2xl flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-4 px-4">
            <div className="flex flex-col items-start border-b md:border-b-0 md:border-r border-white/10 py-2">
              <label className="font-label-caps text-secondary text-[10px] mb-1">
                LOCATION
              </label>
              <select
                className="bg-transparent border-none focus:ring-0 text-white w-full font-body-md appearance-none"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option className="bg-surface-container-high text-on-surface-variant" value="">
                  Select Destination
                </option>
                {locations.map((loc) => (
                  <option key={loc} className="bg-surface-container-high" value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col items-start border-b md:border-b-0 md:border-r border-white/10 py-2">
              <label className="font-label-caps text-secondary text-[10px] mb-1">
                CHECK-IN
              </label>
              <input
                className="bg-transparent border-none focus:ring-0 text-white w-full font-body-md [color-scheme:dark]"
                type="date"
                value={checkIn}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className="flex flex-col items-start border-b md:border-b-0 md:border-r border-white/10 py-2">
              <label className="font-label-caps text-secondary text-[10px] mb-1">
                CHECK-OUT
              </label>
              <input
                className="bg-transparent border-none focus:ring-0 text-white w-full font-body-md [color-scheme:dark]"
                type="date"
                value={checkOut}
                min={checkIn || new Date().toISOString().split("T")[0]}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
            <div className="flex flex-col items-start py-2">
              <label className="font-label-caps text-secondary text-[10px] mb-1">
                GUESTS
              </label>
              <select
                className="bg-transparent border-none focus:ring-0 text-white w-full font-body-md appearance-none"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              >
                <option className="bg-surface-container-high">1 Adult</option>
                <option className="bg-surface-container-high">2 Adults</option>
                <option className="bg-surface-container-high">2 Adults, 1 Child</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="w-full md:w-auto bg-secondary text-on-secondary px-10 py-4 font-label-caps hover:bg-on-secondary-container transition-all"
          >
            FIND HOTELS
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-secondary/60 animate-bounce">
        <span className="font-label-caps text-[10px]">EXPLORE HOTELS</span>
        <span className="material-symbols-outlined">expand_more</span>
      </div>
    </section>
  );
}