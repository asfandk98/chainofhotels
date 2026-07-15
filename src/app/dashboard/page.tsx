"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserBookings, getUserWishlistHotels, type UserBooking, type WishlistHotel } from "@/lib/api";
import { toAbsoluteImageUrl } from "@/lib/resolveImage";

interface AuthUser {
  name?: string;
}

const STATUS_CONFIG: Record<string, { label: string; classes: string; icon: string }> = {
  confirmed: { label: "Confirmed", classes: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: "check_circle" },
  pending: { label: "Pending", classes: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: "schedule" },
  cancelled: { label: "Cancelled", classes: "text-error bg-error/10 border-error/20", icon: "cancel" },
  cancellation_requested: { label: "Cancel Req.", classes: "text-orange-400 bg-orange-500/10 border-orange-500/20", icon: "error" },
};

export default function DashboardOverview() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [wishlist, setWishlist] = useState<WishlistHotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore malformed cache
    }

    Promise.all([getUserBookings(), getUserWishlistHotels()])
      .then(([b, w]) => {
        setBookings(b);
        setWishlist(w);
      })
      .finally(() => setLoading(false));
  }, []);

  const upcoming = bookings.filter((b) => new Date(b.check_in) >= new Date() && b.status === "confirmed");
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: "calendar_month" },
    { label: "Confirmed", value: confirmedCount, icon: "check_circle" },
    { label: "Pending", value: pendingCount, icon: "schedule" },
    { label: "Saved Hotels", value: wishlist.length, icon: "favorite" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-secondary">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">Here&apos;s a summary of your activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container-high luxury-shadow rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-label-caps text-label-caps text-on-surface-variant">{s.label}</p>
              <span className="material-symbols-outlined text-secondary text-lg">{s.icon}</span>
            </div>
            <p className="text-3xl font-bold text-secondary">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Upcoming stays */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-title-md text-on-surface">Upcoming Stays</h2>
          <Link href="/dashboard/bookings" className="text-xs text-secondary hover:underline">
            View all →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3 block">calendar_month</span>
            <p className="text-on-surface-variant text-sm">No upcoming stays</p>
            <Link href="/hotels" className="mt-3 inline-block text-xs text-secondary hover:underline">
              Browse hotels →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 3).map((b) => {
              const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.pending;
              return (
                <Link
                  key={b.id}
                  href={`/dashboard/bookings/${b.id}`}
                  className="flex items-center gap-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl p-4 hover:border-secondary/20 transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl bg-surface-container-highest overflow-hidden shrink-0">
                    {toAbsoluteImageUrl(b.hotel_image) ? (
                      <img src={toAbsoluteImageUrl(b.hotel_image)!} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">🏨</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-on-surface text-sm font-semibold truncate">{b.hotel_name}</p>
                    <p className="text-on-surface-variant text-xs mt-0.5 truncate">
                      {b.check_in} → {b.check_out} · {b.nights} night{b.nights !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold shrink-0 ${cfg.classes}`}>
                    <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span>
                    {cfg.label}
                  </div>
                  <p className="text-secondary font-bold text-sm shrink-0">
                    AED {Number(b.total_price).toLocaleString()}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Wishlist preview */}
      {wishlist.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-title-md text-on-surface">Saved Hotels</h2>
            <Link href="/dashboard/wishlist" className="text-xs text-secondary hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {wishlist.slice(0, 4).map((h) => (
              <Link
                key={h.id}
                href={`/hotels/${h.slug}`}
                className="bg-surface-container-low border border-outline-variant/10 rounded-xl overflow-hidden hover:border-secondary/20 transition-colors block"
              >
                <div className="h-24 bg-surface-container-highest overflow-hidden">
                  {toAbsoluteImageUrl(h.image ?? h.image_url) ? (
                    <img src={toAbsoluteImageUrl(h.image ?? h.image_url)!} className="w-full h-full object-cover" alt={h.name ?? h.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🏨</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-on-surface text-xs font-semibold truncate">{h.name ?? h.title}</p>
                  <p className="text-on-surface-variant text-[10px] mt-0.5">
                    AED {Number(h.price ?? 0).toLocaleString()}/night
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}