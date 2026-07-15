"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getUserBooking, requestCancelBooking, type UserBooking } from "@/lib/api";
import { toAbsoluteImageUrl } from "@/lib/resolveImage";

const STATUS_CONFIG: Record<string, { label: string; classes: string; icon: string }> = {
  confirmed: { label: "Confirmed", classes: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: "check_circle" },
  pending: { label: "Pending", classes: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: "schedule" },
  cancelled: { label: "Cancelled", classes: "text-error bg-error/10 border-error/20", icon: "cancel" },
  cancellation_requested: { label: "Cancel Requested", classes: "text-orange-400 bg-orange-500/10 border-orange-500/20", icon: "error" },
};

interface FullBooking extends UserBooking {
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  created_at?: string;
}

export default function BookingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const printRef = useRef<HTMLDivElement>(null);

  const [booking, setBooking] = useState<FullBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    getUserBooking(id)
      .then((data) => setBooking(data as FullBooking))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to request cancellation?")) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await requestCancelBooking(id);
      setBooking((prev) => (prev ? { ...prev, status: "cancellation_requested" } : prev));
      setCancelled(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Could not cancel booking.";
      setCancelError(message);
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    if (!booking) return;
    const w = window.open("", "_blank", "width=700,height=900");
    if (!w) return;
    const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
    const now = new Date().toLocaleString("en-AE", { dateStyle: "long", timeStyle: "short" });
    w.document.write(`<!DOCTYPE html><html><head>
      <title>Receipt — ${booking.reference}</title>
      <style>
        body { font-family: Georgia, serif; padding: 40px; color: #111; }
        @media print { body { margin: 0; } }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; }
        td:first-child { color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 40%; }
        .total { font-weight: 700; font-size: 18px; border-top: 2px solid #111; }
        .badge { text-align: center; background: #f6f0e0; border-radius: 8px; padding: 16px 0; margin-bottom: 24px; color: #8a6d00; font-weight: 700; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; }
        .hdr { text-align: center; border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 28px; }
      </style>
      </head><body>
      <div class="hdr">
        <div style="font-size:11px;letter-spacing:3px;color:#888;text-transform:uppercase;margin-bottom:8px">Lumina Dubai</div>
        <div style="font-size:26px;font-weight:700">Booking Receipt</div>
        <div style="font-size:13px;color:#666;margin-top:6px">${now}</div>
      </div>
      <div class="badge">${cfg.label}</div>
      ${printRef.current?.innerHTML ?? ""}
      <div style="text-align:center;font-size:11px;color:#aaa;border-top:1px solid #eee;padding-top:20px;margin-top:24px">
        Secured by Mastercard Payment Gateway Services
      </div>
      <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}<\/script>
      </body></html>`);
    w.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center text-on-surface-variant py-20">
        Booking not found.
        <Link href="/dashboard/bookings" className="block mt-3 text-secondary hover:underline text-sm">
          ← Back to bookings
        </Link>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
  const canCancel = ["confirmed", "pending"].includes(booking.status) && !cancelled;

  return (
    <>
      {/* Hidden print template */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <table>
            <tbody>
              {[
                ["Reference", booking.reference],
                ["Hotel", booking.hotel_name],
                ["Room", booking.room_name],
                ["Check-in", booking.check_in],
                ["Check-out", booking.check_out],
                ["Nights", booking.nights],
                ["Adults", booking.adults],
                ["Children", booking.children],
                ["Guest Name", booking.guest_name || "—"],
                ["Guest Email", booking.guest_email || "—"],
                ["Guest Phone", booking.guest_phone || "—"],
              ].map(([l, v]) => (
                <tr key={l as string}>
                  <td>{l}</td>
                  <td style={{ fontWeight: 600 }}>{v ?? "—"}</td>
                </tr>
              ))}
              <tr>
                <td>Room subtotal</td>
                <td>AED {Number(booking.subtotal ?? 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Tax (5%)</td>
                <td>AED {Number(booking.tax ?? 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Tourism fee</td>
                <td>AED {Number(booking.tourism_fee ?? 0).toLocaleString()}</td>
              </tr>
              <tr className="total">
                <td>Total Paid</td>
                <td>AED {Number(booking.total_price).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Screen UI */}
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/dashboard/bookings" className="flex items-center gap-2 text-on-surface-variant hover:text-secondary transition text-sm">
            <span className="material-symbols-outlined text-lg">arrow_back</span> Back to bookings
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 text-on-surface-variant hover:text-secondary text-xs font-semibold transition"
            >
              <span className="material-symbols-outlined text-sm">print</span> Print
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 text-on-surface-variant hover:text-secondary text-xs font-semibold transition"
            >
              <span className="material-symbols-outlined text-sm">download</span> Download
            </button>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-1">Booking Reference</p>
              <p className="text-on-surface font-mono font-bold text-lg">{booking.reference}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${cfg.classes}`}>
              <span className="material-symbols-outlined text-[16px]">{cfg.icon}</span>
              {cfg.label}
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl overflow-hidden">
          {toAbsoluteImageUrl(booking.hotel_image) && (
            <div className="h-40 overflow-hidden">
              <img src={toAbsoluteImageUrl(booking.hotel_image)!} className="w-full h-full object-cover" alt={booking.hotel_name} />
            </div>
          )}
          <div className="p-5">
            <h2 className="text-on-surface font-bold text-lg">{booking.hotel_name}</h2>
            <p className="text-on-surface-variant text-sm flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[16px]">bed</span> {booking.room_name}
            </p>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl">
          <div className="px-5 py-4 border-b border-outline-variant/10">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Booking Details</p>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {[
              ["Check-in", booking.check_in],
              ["Check-out", booking.check_out],
              ["Duration", `${booking.nights} night${booking.nights !== 1 ? "s" : ""}`],
              [
                "Guests",
                `${booking.adults ?? 1} adult${(booking.adults ?? 1) !== 1 ? "s" : ""}${
                  booking.children ? `, ${booking.children} child${booking.children !== 1 ? "ren" : ""}` : ""
                }`,
              ],
              ["Booked on", booking.created_at?.split("T")[0] ?? "—"],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between items-center px-5 py-3.5">
                <span className="text-xs text-on-surface-variant uppercase tracking-wide">{label}</span>
                <span className="text-sm text-on-surface font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl">
          <div className="px-5 py-4 border-b border-outline-variant/10">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Price Breakdown</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Room subtotal</span>
              <span>AED {Number(booking.subtotal ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Tax (5%)</span>
              <span>AED {Number(booking.tax ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Tourism fee</span>
              <span>AED {Number(booking.tourism_fee ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-on-surface font-bold text-base pt-3 border-t border-outline-variant/10">
              <span>Total Paid</span>
              <span className="text-secondary">AED {Number(booking.total_price).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {cancelError && (
          <div className="bg-error/10 border border-error/20 rounded-2xl p-4 text-center text-error text-sm">{cancelError}</div>
        )}

        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-error/30 text-error hover:bg-error/10 transition text-sm font-semibold disabled:opacity-50"
          >
            {cancelling ? (
              <span className="w-4 h-4 border-2 border-error border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-lg">cancel</span>
            )}
            {cancelling ? "Submitting…" : "Request Cancellation"}
          </button>
        )}

        {cancelled && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 text-center text-orange-400 text-sm font-medium">
            Cancellation request submitted. Our team will be in touch.
          </div>
        )}
      </div>
    </>
  );
}