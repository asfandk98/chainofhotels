"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { getAdminHotels, deleteAdminHotel, type AdminHotel } from "@/lib/admin";
import { toAbsoluteImageUrl } from "@/lib/resolveImage";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  draft: "bg-surface-container-highest text-on-surface-variant border-outline-variant/30",
};

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<AdminHotel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHotels = () => {
    setLoading(true);
    getAdminHotels()
      .then((res) => {
        const data = res.data;
        setHotels(Array.isArray(data) ? data : (data.data ?? []));
      })
      .catch(() => toast.error("Failed to load hotels"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const remove = async (id: string | number) => {
    if (!confirm("Delete this hotel?")) return;
    try {
      await deleteAdminHotel(id);
      setHotels((prev) => prev.filter((h) => h.id !== id));
      toast.success("Hotel deleted");
    } catch {
      toast.error("Failed to delete hotel");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-secondary">Hotels</h1>
          <p className="text-on-surface-variant text-sm mt-1">{hotels.length} properties</p>
        </div>
        <Link
          href="/admin/hotels/create"
          className="flex items-center gap-2 bg-secondary text-on-secondary px-5 py-2.5 rounded-full font-label-caps text-label-caps hover:opacity-90 transition"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          New Hotel
        </Link>
      </div>

      <div className="bg-surface-container luxury-shadow rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-outline-variant/10">
            <tr>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Hotel</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Location</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Type</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Price</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Status</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Featured</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-16">
                  <div className="w-6 h-6 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            ) : hotels.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-on-surface-variant">No hotels yet</td>
              </tr>
            ) : (
              hotels.map((hotel) => (
                <tr key={hotel.id} className="hover:bg-surface-container-highest transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {toAbsoluteImageUrl(hotel.image) ? (
                        <img
                          src={toAbsoluteImageUrl(hotel.image)!}
                          className="w-10 h-10 rounded-lg object-cover"
                          alt={hotel.title}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-xl">
                          🏨
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-on-surface line-clamp-1">{hotel.title}</p>
                        {hotel.rating && <p className="text-xs text-on-surface-variant">⭐ {hotel.rating}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">{hotel.location}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{hotel.type}</td>
                  <td className="px-6 py-4 text-on-surface">AED {hotel.price}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                        STATUS_STYLES[hotel.status] ?? STATUS_STYLES.draft
                      }`}
                    >
                      {hotel.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {hotel.featured ? (
                      <span className="flex items-center gap-1 text-secondary text-xs">
                        <span className="material-symbols-outlined text-sm">star</span> Featured
                      </span>
                    ) : (
                      <span className="text-on-surface-variant/50 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/hotels/${hotel.id}/edit`}
                        className="p-2 text-on-surface-variant hover:text-secondary hover:bg-surface-container-highest rounded-lg transition"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </Link>
                      <button
                        onClick={() => remove(hotel.id)}
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-surface-container-highest rounded-lg transition"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}