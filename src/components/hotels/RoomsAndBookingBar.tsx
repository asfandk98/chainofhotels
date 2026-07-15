"use client";

import { useState } from "react";
import type { HotelDetail, HotelRoom } from "@/lib/api";
import { toAbsoluteImageUrl } from "@/lib/resolveImage";
import Link from "next/link";

function roomImage(room: HotelRoom): string | null {
  const first = room.images?.[0];
  if (first) {
    return first.url ?? toAbsoluteImageUrl(first.path);
  }
  // fallback in case a future API version adds a single image field
  return toAbsoluteImageUrl(room.image_url) ?? toAbsoluteImageUrl(room.image);
}

export default function RoomsAndBookingBar({ hotel }: { hotel: HotelDetail }) {
  const rooms = hotel.rooms ?? [];
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);

  const displayPrice = selectedRoom?.price ?? hotel.price ?? "—";

  return (
    <>
      {rooms.length > 0 && (
        <section className="px-container-padding-mobile md:px-container-padding-desktop py-section-gap bg-surface-container-lowest">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="font-label-caps text-label-caps text-secondary mb-4 uppercase tracking-widest">
                Available Accommodations
              </h2>
              <p className="font-headline-lg-mobile md:font-headline-lg font-display-lg text-on-surface">
                Select Your Sanctuary
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {rooms.map((room) => {
              const isSelected = selectedRoom?.id === room.id;
              return (
                <div
                  key={room.id}
                  className={`flex flex-col md:flex-row bg-surface-container-low rounded-2xl overflow-hidden shadow-2xl border group transition-colors ${
                    isSelected ? "border-secondary" : "border-white/5"
                  }`}
                >
                  <div className="md:w-1/2 relative h-[300px] md:h-auto overflow-hidden">
                    {roomImage(room) ? (
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        src={roomImage(room)!}
                        alt={room.name ?? room.title ?? "Room"}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface-container text-3xl">
                        🛏️
                      </div>
                    )}
                    {room.tag && (
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-surface/80 backdrop-blur-md text-[10px] font-bold px-3 py-1 rounded-full text-on-surface">
                          {room.tag}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="md:w-1/2 p-8 flex flex-col justify-between">
                    <div>
                      <h3 className="font-title-md text-on-surface mb-2">{room.name ?? room.title}</h3>
                      {room.description && (
                        <p className="font-body-md text-on-surface-variant mb-6 line-clamp-2">
                          {room.description}
                        </p>
                      )}
                      <div className="space-y-3 mb-8">
                        {(room.size_sqm || room.size_sqft) && (
                          <div className="flex items-center gap-3 text-on-surface-variant">
                            <span className="material-symbols-outlined text-[18px]">aspect_ratio</span>
                            <span className="text-label-caps">
                              {room.size_sqm ? `${room.size_sqm} m²` : ""}
                              {room.size_sqm && room.size_sqft ? " / " : ""}
                              {room.size_sqft ? `${room.size_sqft} ft²` : ""}
                            </span>
                          </div>
                        )}
                        {room.capacity && (
                          <div className="flex items-center gap-3 text-on-surface-variant">
                            <span className="material-symbols-outlined text-[18px]">person</span>
                            <span className="text-label-caps">{room.capacity}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <p className="text-label-caps text-on-surface-variant">PER NIGHT</p>
                        <p className="font-title-md text-secondary">${room.price ?? "—"}</p>
                      </div>
                      <Link
  href={`/hotels/${hotel.slug ?? hotel.id}/reserve?room=${room.slug ?? room.id}`}
  onClick={() => setSelectedRoom(room)}
  className={`px-8 py-3 rounded-full font-label-caps text-label-caps transition-all inline-block ${
    isSelected
      ? "bg-secondary/20 text-secondary border border-secondary"
      : "bg-secondary text-on-secondary hover:opacity-90"
  }`}
>
  {isSelected ? "SELECTED" : "SELECT"}
</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-surface-container-highest border-t border-secondary/10 shadow-2xl flex justify-between items-center px-6 py-4 md:px-container-padding-desktop md:py-6">
        <div className="flex flex-col">
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            {selectedRoom ? (selectedRoom.name ?? selectedRoom.title) : "PRICE FROM"}
          </span>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">payments</span>
            <span className="font-title-md text-secondary">${displayPrice}</span>
            <span className="text-on-surface-variant text-[14px]">/ night</span>
          </div>
        </div>
        <button className="flex items-center justify-center bg-secondary text-on-secondary rounded-full px-8 py-3 md:py-4 md:px-12 scale-95 active:scale-90 transition-all hover:opacity-90 shadow-xl">
          <span className="material-symbols-outlined mr-2">calendar_today</span>
          <span className="font-label-caps text-label-caps">RESERVE</span>
        </button>
      </div>
      <div className="h-24 md:h-32 bg-surface" />
    </>
  );
}