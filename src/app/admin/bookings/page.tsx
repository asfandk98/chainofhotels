"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getAdminBookings, updateBookingStatus, type AdminBookingDetail } from "@/lib/admin";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  paid: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  cancelled: "bg-error/10 text-error border-error/30",
  refunded: "bg-violet-500/10 text-violet-400 border-violet-500/30",
};

const STATUSES = ["", "pending", "confirmed", "paid", "cancelled", "refunded"];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBookingDetail[]>([]);
  const [meta, setMeta] = useState<{ last_page?: number }>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminBookingDetail | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const fetchBookings = () => {
    setLoading(true);
    getAdminBookings({ page, search: search || undefined, status: status || undefined })
      .then((res) => {
        setBookings(res.data.data as AdminBookingDetail[]);
        setMeta(res.data.meta ?? {});
      })
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, page]);

  const openDetail = (booking: AdminBookingDetail) => {
    setSelected(booking);
    setNewStatus(booking.status);
  };

  const updateStatus = async () => {
    if (!selected || !newStatus || newStatus === selected.status) return;
    setUpdating(true);
    try {
      const { data: updated } = await updateBookingStatus(selected.id, newStatus);
      setSelected(updated);
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-secondary">Bookings</h1>
        <p className="text-on-surface-variant text-sm mt-1">Track and manage all guest reservations</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
            search
          </span>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search reference or guest name…"
            className="w-full admin-input pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-sm border transition capitalize ${
                status === s
                  ? "bg-secondary text-on-secondary border-secondary"
                  : "border-outline-variant/30 text-on-surface-variant hover:border-secondary/50"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface-container luxury-shadow rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-outline-variant/10">
            <tr>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Reference</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Guest</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Hotel</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Check-in</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Nights</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Amount</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Status</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-16">
                  <div className="w-6 h-6 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-on-surface-variant">No bookings found</td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="hover:bg-surface-container-highest transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">{b.reference ?? `#${b.id}`}</td>
                  <td className="px-6 py-4">
                    <p className="text-on-surface font-medium">{b.user?.name ?? b.guest_name ?? "—"}</p>
                    <p className="text-xs text-on-surface-variant">{b.user?.email ?? b.guest_email ?? ""}</p>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">{b.hotel?.title ?? "—"}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{fmt(b.check_in)}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{b.nights ?? "—"}</td>
                  <td className="px-6 py-4 text-on-surface font-medium">AED {Number(b.total_price ?? 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                        STATUS_STYLES[b.status] ?? "bg-surface-container-highest text-on-surface-variant"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openDetail(b)}
                      className="p-2 text-on-surface-variant hover:text-secondary hover:bg-surface-container-highest rounded-lg transition"
                    >
                      <span className="material-symbols-outlined text-lg">visibility</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(meta.last_page ?? 0) > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: meta.last_page ?? 0 }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm transition ${
                p === page ? "bg-secondary text-on-secondary" : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-surface-container border border-outline-variant/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-outline-variant/10">
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-0.5">Booking</p>
                <h2 className="text-lg font-bold text-on-surface">#{selected.reference ?? selected.id}</h2>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${STATUS_STYLES[selected.status]}`}
                >
                  {selected.status}
                </span>
                <button onClick={() => setSelected(null)} className="text-on-surface-variant hover:text-on-surface transition">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <DetailSection title="Guest Information">
                <DetailRow label="Name" value={selected.user?.name ?? selected.guest_name ?? "—"} />
                <DetailRow label="Email" value={selected.user?.email ?? selected.guest_email ?? "—"} />
                <DetailRow label="Phone" value={selected.user?.phone ?? selected.guest_phone ?? "—"} />
              </DetailSection>

              <DetailSection title="Stay Details">
                <DetailRow label="Hotel" value={selected.hotel?.title ?? "—"} />
                <DetailRow label="Room" value={selected.room?.name ?? "—"} />
                <DetailRow label="Check-in" value={fmt(selected.check_in)} />
                <DetailRow label="Check-out" value={fmt(selected.check_out)} />
                <DetailRow label="Nights" value={selected.nights ?? "—"} />
                <DetailRow label="Guests" value={`${selected.adults ?? 1} adult(s), ${selected.children ?? 0} child(ren)`} />
              </DetailSection>

              <DetailSection title="Price Breakdown">
                <DetailRow
                  label="Room price / night"
                  value={`AED ${Number(selected.room_price ?? selected.room?.price ?? 0).toLocaleString()}`}
                />
                <DetailRow
                  label={`Subtotal (${selected.nights ?? 1} night)`}
                  value={`AED ${Number(selected.subtotal ?? 0).toLocaleString()}`}
                />
                {selected.tax != null && <DetailRow label="Tax (5%)" value={`AED ${Number(selected.tax).toLocaleString()}`} />}
                {selected.tourism_fee != null && (
                  <DetailRow label="Tourism Fee" value={`AED ${Number(selected.tourism_fee).toLocaleString()}`} />
                )}
                <div className="flex justify-between pt-2 border-t border-outline-variant/10 font-semibold">
                  <span className="text-on-surface">Total</span>
                  <span className="text-on-surface">AED {Number(selected.total_price ?? 0).toLocaleString()}</span>
                </div>
              </DetailSection>

              <DetailSection title="Update Status">
                <div className="flex items-center gap-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="flex-1 admin-input"
                  >
                    {["pending", "confirmed", "paid", "cancelled", "refunded"].map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={updateStatus}
                    disabled={updating || newStatus === selected.status}
                    className="bg-secondary text-on-secondary px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-40"
                  >
                    {updating ? "Saving…" : "Update"}
                  </button>
                </div>
              </DetailSection>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .admin-input {
          width: 100%;
          background: #0c1c30;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          color: #d4e3ff;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .admin-input:focus {
          border-color: #e6c364;
        }
        select.admin-input option {
          background: #0c1c30;
        }
      `}</style>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-high rounded-xl p-4 space-y-2.5">
      <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className="text-on-surface font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}