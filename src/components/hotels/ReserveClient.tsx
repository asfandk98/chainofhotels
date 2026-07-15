"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { HotelDetail, HotelRoom } from "@/lib/api";
import { getSeasonalPrices } from "@/lib/api";
import { toAbsoluteImageUrl } from "@/lib/resolveImage";
import { initiatePayment } from "@/lib/payments";
import { iconForAmenity } from "@/lib/amenityIcons";
import DateSelector from "./DateSelector";

declare global {
  interface Window {
    Checkout?: { configure: (opts: unknown) => void; showPaymentPage: () => void };
    paymentError?: (err: { cause?: string; explanation?: string }) => void;
    paymentCancelled?: () => void;
    paymentComplete?: () => void;
  }
}

function toDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const d = new Date(val as string);
  return isNaN(d.getTime()) ? null : d;
}

function calcNights(start: Date | null, end: Date | null) {
  if (!start || !end) return 0;
  const ms = end.getTime() - start.getTime();
  return ms > 0 ? Math.ceil(ms / (1000 * 60 * 60 * 24)) : 0;
}

export default function ReserveClient({
  hotel,
  initialRoom,
}: {
  hotel: HotelDetail;
  initialRoom: HotelRoom | null;
}) {
  const router = useRouter();

  const selectedRoom = initialRoom;
  const [dates, setDates] = useState<{ startDate?: Date; endDate?: Date } | null>(null);
  const [guests, setGuests] = useState({ adults: 2, children: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 type SeasonalPrice = Awaited<ReturnType<typeof getSeasonalPrices>>[number];

const [seasonalPrices, setSeasonalPrices] = useState<SeasonalPrice[]>([]);
const [activeSeasonal, setActiveSeasonal] = useState<SeasonalPrice | null>(null);
  const mpgsScriptRef = useRef<HTMLScriptElement | null>(null);

  const startDate = toDate(dates?.startDate);
  const endDate = toDate(dates?.endDate);
  const nights = calcNights(startDate, endDate);
  const hasValidDates = !!(startDate && endDate && nights > 0);

  const roomName = selectedRoom?.name ?? selectedRoom?.title ?? hotel.title ?? hotel.name;
  const roomImage = (() => {
  const first = selectedRoom?.images?.[0];
  if (first) return first.url ?? toAbsoluteImageUrl(first.path);
  return toAbsoluteImageUrl(selectedRoom?.image_url) ?? toAbsoluteImageUrl(selectedRoom?.image);
})();
  const amenities = selectedRoom?.amenities ?? hotel.amenities ?? [];

  // Seasonal prices for the selected room
  useEffect(() => {
    if (!selectedRoom?.id) {
      setSeasonalPrices([]);
      setActiveSeasonal(null);
      return;
    }
    getSeasonalPrices(selectedRoom.id).then(setSeasonalPrices);
  }, [selectedRoom?.id]);

  // Match dates to a seasonal period
  useEffect(() => {
    if (!hasValidDates || seasonalPrices.length === 0) {
      setActiveSeasonal(null);
      return;
    }
    const s = new Date(startDate!);
    s.setHours(0, 0, 0, 0);
    const e = new Date(endDate!);
    e.setHours(0, 0, 0, 0);

    const match = seasonalPrices.find((sp) => {
      const sStart = new Date(sp.start_date);
      sStart.setHours(0, 0, 0, 0);
      const sEnd = new Date(sp.end_date);
      sEnd.setHours(0, 0, 0, 0);
      return sStart <= s && sEnd >= e;
    });
    setActiveSeasonal(match ?? null);
  }, [dates, seasonalPrices, hasValidDates, startDate, endDate]);

  // Pricing
  const basePrice = Number(selectedRoom?.price ?? hotel.price ?? 0);
  const seasonalPrice = activeSeasonal ? Number(activeSeasonal.price) : null;
  const isOnOffer = seasonalPrice !== null && seasonalPrice < basePrice;
  const nightRate = isOnOffer ? seasonalPrice! : basePrice;
  const discountPct = isOnOffer ? Math.round(((basePrice - seasonalPrice!) / basePrice) * 100) : 0;

  const subtotal = nights * nightRate;
  const originalSubtotal = nights * basePrice;
  const amountSaved = originalSubtotal - subtotal;
  const tax = Math.round(subtotal * 0.05);
  const tourismFee = nights > 0 ? 10 * nights : 0;
  const total = subtotal + tax + tourismFee;

  // MPGS callbacks
  useEffect(() => {
    window.paymentError = (err) => {
      setError("Payment failed: " + (err?.cause ?? err?.explanation ?? "Unknown error"));
      setLoading(false);
    };
    window.paymentCancelled = () => {
      setError("Payment was cancelled. You have not been charged.");
      setLoading(false);
    };
    window.paymentComplete = () => {
      window.location.href = "/payment/result";
    };
    return () => {
      delete window.paymentError;
      delete window.paymentCancelled;
      delete window.paymentComplete;
    };
  }, []);

  const loadMpgsAndPay = (sessionId: string, mpgsJsUrl: string) => {
    if (mpgsScriptRef.current) {
      mpgsScriptRef.current.remove();
      mpgsScriptRef.current = null;
    }
    const script = document.createElement("script");
    script.src = mpgsJsUrl;
    script.setAttribute("data-error", "paymentError");
    script.setAttribute("data-cancel", "paymentCancelled");
    script.setAttribute("data-complete", "paymentComplete");
    script.onload = () => {
      if (!window.Checkout) {
        setError("Payment gateway failed to load. Please try again.");
        setLoading(false);
        return;
      }
      window.Checkout.configure({ session: { id: sessionId } });
      window.Checkout.showPaymentPage();
    };
    script.onerror = () => {
      setError("Could not connect to payment gateway. Please try again.");
      setLoading(false);
    };
    document.body.appendChild(script);
    mpgsScriptRef.current = script;
  };

  const handleReserve = async () => {
    if (!hasValidDates || loading) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      sessionStorage.setItem("redirect_after_login", window.location.pathname + window.location.search);
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = JSON.parse(localStorage.getItem("user") ?? "{}");
      const data = await initiatePayment({
        total,
        email: user?.email ?? "",
        hotel_id: hotel.id,
        room_id: selectedRoom?.id ?? null,
        check_in: startDate!.toISOString().split("T")[0],
        check_out: endDate!.toISOString().split("T")[0],
        guests,
        night_rate: nightRate,
        seasonal_price_id: activeSeasonal?.id ?? null,
        description: `${hotel.title}${selectedRoom ? ` — ${roomName}` : ""} · ${nights} night${nights !== 1 ? "s" : ""}`,
      });
      loadMpgsAndPay(data.session_id, data.mpgs_js);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment initiation failed");
      setLoading(false);
    }
  };

  const reserveLabel = () => {
    if (loading) return "Connecting to payment…";
    if (!startDate) return "SELECT DATES TO RESERVE";
    if (!endDate) return "SELECT CHECK-OUT DATE";
    if (nights === 0) return "CHECK-OUT MUST BE AFTER CHECK-IN";
    return "RESERVE NOW";
  };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[530px] md:h-[618px] flex items-end">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: roomImage ? `url('${roomImage}')` : undefined }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
        </div>
        <div className="relative z-10 px-container-padding-mobile md:px-container-padding-desktop pb-12 w-full max-w-7xl mx-auto">
          <div className="inline-block px-4 py-1 bg-secondary text-on-secondary font-label-caps text-[10px] mb-4 tracking-widest">
            SELECTED ACCOMMODATION
          </div>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-2">
            {roomName}
          </h1>
          {selectedRoom?.description && (
            <p className="text-on-surface-variant font-body-lg max-w-xl">{selectedRoom.description}</p>
          )}
        </div>
      </section>

      <section className="px-container-padding-mobile md:px-container-padding-desktop py-12 md:py-section-gap max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left: amenities + checkout note */}
          <div className="lg:col-span-7 space-y-12">
            {amenities.length > 0 && (
              <div className="space-y-6">
                <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-secondary">
                  Suite Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {amenities.map((a) => (
                    <div key={a} className="flex items-center gap-3 text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary">{iconForAmenity(a)}</span>
                      <span className="font-label-caps text-label-caps">{a.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-8 bg-surface-container-low border border-secondary/10 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-title-md text-title-md text-on-surface">Secure Checkout</h3>
                <div className="flex items-center gap-2 grayscale opacity-60">
                  <span className="material-symbols-outlined text-on-surface-variant">verified_user</span>
                  <span className="font-label-caps text-[10px]">ENCRYPTED MPGS SECURE</span>
                </div>
              </div>
              <p className="text-on-surface-variant font-body-md text-sm leading-relaxed">
                You'll enter your card details on Mastercard's own secure checkout page after clicking
                Reserve — we never see or store your card number here.
              </p>
              {error && (
                <div className="mt-4 bg-error/10 border border-error/30 rounded-xl px-4 py-3">
                  <p className="text-xs text-error font-medium">{error}</p>
                  <button onClick={() => setError(null)} className="text-xs text-error/70 underline mt-1">
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: sticky booking sidebar */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-gutter">
              <div className="bg-surface-container-high p-8 rounded-xl shadow-2xl border border-secondary/5">
                <h3 className="font-title-md text-title-md text-secondary mb-6">Reservation Details</h3>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="font-label-caps text-[10px] text-on-surface-variant">SELECT DATES</label>
                    <DateSelector
                      setDates={(d: { startDate?: Date; endDate?: Date } | null) => setDates(d)}
                      roomId={selectedRoom?.id ?? hotel.rooms?.[0]?.id}
                    />
                    {hasValidDates && (
                      <div className="flex justify-between text-body-md pt-2 border-t border-secondary/10">
                        <span className="text-on-surface-variant">Stay Duration</span>
                        <span className="text-secondary font-bold">
                          {nights} Night{nights !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Guest counters */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-label-caps text-[10px] text-on-surface-variant uppercase">Adults</label>
                      <div className="flex items-center justify-between bg-surface/40 px-3 py-2 border border-secondary/10">
                        <button
                          className="text-secondary"
                          onClick={() => setGuests((g) => ({ ...g, adults: Math.max(1, g.adults - 1) }))}
                        >
                          −
                        </button>
                        <span className="font-bold">{guests.adults}</span>
                        <button
                          className="text-secondary"
                          onClick={() => setGuests((g) => ({ ...g, adults: g.adults + 1 }))}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-caps text-[10px] text-on-surface-variant uppercase">Children</label>
                      <div className="flex items-center justify-between bg-surface/40 px-3 py-2 border border-secondary/10">
                        <button
                          className="text-secondary"
                          onClick={() => setGuests((g) => ({ ...g, children: Math.max(0, g.children - 1) }))}
                        >
                          −
                        </button>
                        <span className="font-bold">{guests.children}</span>
                        <button
                          className="text-secondary"
                          onClick={() => setGuests((g) => ({ ...g, children: g.children + 1 }))}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  {hasValidDates ? (
                    <div className="space-y-3 pt-6 border-t border-secondary/10">
                      <div className="flex justify-between text-body-md">
                        <span className="text-on-surface-variant">
                          {isOnOffer ? (
                            <>
                              Subtotal ({nights} night{nights !== 1 ? "s" : ""}){" "}
                              <span className="text-secondary text-[10px] font-bold ml-1">-{discountPct}%</span>
                            </>
                          ) : (
                            `Subtotal (${nights} night${nights !== 1 ? "s" : ""})`
                          )}
                        </span>
                        <span className="text-on-surface">${subtotal.toLocaleString()}</span>
                      </div>
                      {isOnOffer && amountSaved > 0 && (
                        <div className="flex justify-between text-body-md text-secondary">
                          <span>You save</span>
                          <span>${amountSaved.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-body-md">
                        <span className="text-on-surface-variant">Tax (5%)</span>
                        <span className="text-on-surface">${tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-body-md">
                        <span className="text-on-surface-variant">Tourism Fee</span>
                        <span className="text-on-surface">${tourismFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-title-md pt-4 border-t border-secondary/30">
                        <span className="font-headline-lg-mobile text-on-surface">Total</span>
                        <span className="font-headline-lg-mobile text-secondary">${total.toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant/70 pt-4 border-t border-secondary/10">
                      Select your dates to see the full price breakdown.
                    </p>
                  )}

                  <button
                    onClick={handleReserve}
                    disabled={!hasValidDates || loading}
                    className="w-full bg-secondary text-on-secondary font-label-caps py-5 text-label-caps tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {reserveLabel()}
                  </button>

                  <div className="flex flex-col items-center gap-4 pt-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center opacity-50 grayscale">
                        <span
                          className="material-symbols-outlined text-[32px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          lock
                        </span>
                        <span className="font-label-caps text-[8px] leading-tight ml-1 uppercase">
                          Secured by
                          <br />
                          Mastercard
                        </span>
                      </div>
                      <div className="h-8 border-l border-on-surface/10" />
                      <div className="flex items-center gap-1 opacity-50 grayscale">
                        <span className="font-label-caps text-[10px] font-bold">Mastercard</span>
                        <span className="font-label-caps text-[10px]">MPGS</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-on-surface-variant/60 font-body-md text-center">
                      Your transaction is encrypted and secured using the highest banking standards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}