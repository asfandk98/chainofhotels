"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminStats, getAdminBookings, type AdminStats, type AdminBooking } from "@/lib/admin";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-green-500/10 text-green-400",
  paid: "bg-green-500/10 text-green-400",
  pending: "bg-yellow-500/10 text-yellow-400",
  cancelled: "bg-red-500/10 text-red-400",
  refunded: "bg-violet-500/10 text-violet-400",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminStats(), getAdminBookings({ page: 1 })])
      .then(([statsRes, bookingsRes]) => {
        setStats(statsRes.data);
        setBookings((bookingsRes.data.data ?? []).slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = stats
    ? [
        { label: "Total Revenue", value: `AED ${Number(stats.revenue).toLocaleString()}`, icon: "payments", note: null },
        { label: "Total Bookings", value: stats.bookings, icon: "event_available", note: `${stats.pending} pending confirmation` },
        { label: "Hotel Partners", value: stats.hotels, icon: "apartment", note: `${stats.active_hotels} active` },
        { label: "Total Rooms", value: stats.rooms, icon: "meeting_room", note: null },
      ]
    : [];

  return (
    <div className="space-y-12">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-surface-container-high p-8 rounded-lg luxury-shadow relative overflow-hidden group transition-all duration-500 hover:-translate-y-1"
          >
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-8xl">{card.icon}</span>
            </div>
            <p className="font-label-caps text-label-caps text-on-surface-variant mb-4">{card.label}</p>
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-secondary">{card.value}</h3>
            {card.note && (
              <div className="mt-4 flex items-center gap-2 text-on-surface-variant">
                <span className="text-xs">{card.note}</span>
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container p-8 rounded-lg luxury-shadow min-h-[300px] flex flex-col">
          <div className="mb-6">
            <h2 className="font-title-md text-title-md text-on-surface">Revenue Performance</h2>
            <p className="text-xs text-on-surface-variant">Monthly breakdown</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant text-center gap-2">
            <span className="material-symbols-outlined text-4xl opacity-30">bar_chart</span>
            <p className="text-xs max-w-xs">
              No monthly revenue endpoint exists yet. Add e.g. <code className="text-secondary">GET /admin/stats/revenue-chart</code>{" "}
              returning per-month totals to enable this.
            </p>
          </div>
        </div>

        <div className="bg-surface-container rounded-lg overflow-hidden relative min-h-[300px]">
          <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-surface to-transparent">
            <h4 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Expansive Horizons</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              System optimization complete. All servers in Dubai Central are performing within peak parameters.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface-container p-8 rounded-lg luxury-shadow">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="font-title-md text-title-md text-on-surface">Recent Bookings</h2>
            <p className="text-xs text-on-surface-variant">Latest 5 reservations</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <p className="text-on-surface-variant text-sm py-8 text-center">No bookings yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant/10">
                <tr>
                  <th className="pb-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Customer</th>
                  <th className="pb-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Hotel Property</th>
                  <th className="pb-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Status</th>
                  <th className="pb-4 font-label-caps text-label-caps text-on-surface-variant opacity-60 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {bookings.map((b) => {
                  const name = b.user?.name ?? b.guest_name ?? "—";
                  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <tr key={b.id} className="hover:bg-surface-container-highest transition-colors">
                      <td className="py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs uppercase">
                            {initials || "—"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-on-surface">{name}</p>
                            <p className="text-[10px] text-on-surface-variant">{b.reference ?? `#${b.id}`}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6">
                        <p className="text-sm text-on-surface">{b.hotel?.title ?? "—"}</p>
                        <p className="text-[10px] text-on-surface-variant">
                          {b.room?.name ?? ""} {b.nights ? `• ${b.nights} Nights` : ""}
                        </p>
                      </td>
                      <td className="py-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            STATUS_STYLES[b.status] ?? "bg-gray-500/10 text-gray-400"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-6 text-right">
                        <p className="text-sm font-bold text-secondary">AED {Number(b.total_price ?? 0).toLocaleString()}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-outline-variant/10 flex justify-center">
          <Link href="/admin/bookings" className="text-secondary font-label-caps text-label-caps hover:underline transition-all">
            View All Bookings
          </Link>
        </div>
      </section>
    </div>
  );
}