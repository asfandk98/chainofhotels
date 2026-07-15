"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyPayment } from "@/lib/payments";

interface OrderView {
  id: string;
  booking_id?: string | number;
  amount: number;
  currency: string;
  hotel_name: string;
  room_name: string;
  check_in: string;
  check_out: string;
  nights: number | string;
  guests: number | string;
  email: string;
  subtotal: number;
  tax: number;
  tourism_fee: number;
  paid_at: string;
}

const money = (v: number | string | undefined) => Number(v ?? 0).toLocaleString();

export default function PaymentResultClient() {
  const params = useSearchParams();
  const orderId = params.get("order_id");
  const resultIndicator = params.get("resultIndicator"); // only present on MPGS success

  const printRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [order, setOrder] = useState<OrderView | null>(null);

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      return;
    }
    // No resultIndicator means MPGS didn't complete the charge — don't
    // bother verifying, it's a failure/cancellation.
    if (!resultIndicator) {
      setStatus("failed");
      return;
    }

    // 1.5s grace period so MPGS finishes processing server-side before we verify
    const timer = setTimeout(() => {
      verifyPayment(orderId)
        .then((data) => {
          if (data.success) {
            setOrder({
              id: orderId,
              booking_id: data.booking_id,
              amount: Number(data.amount ?? 0),
              currency: data.currency ?? "AED",
              hotel_name: data.hotel_name ?? "—",
              room_name: data.room_name ?? "—",
              check_in: data.check_in ?? "—",
              check_out: data.check_out ?? "—",
              nights: data.nights ?? "—",
              guests: data.guests ?? "—",
              email: data.email ?? "—",
              subtotal: Number(data.subtotal ?? 0),
              tax: Number(data.tax ?? 0),
              tourism_fee: Number(data.tourism_fee ?? 0),
              paid_at: new Date().toLocaleString("en-AE", { dateStyle: "long", timeStyle: "short" }),
            });
            setStatus("success");
          } else {
            setStatus("failed");
          }
        })
        .catch(() => setStatus("failed"));
    }, 1500);

    return () => clearTimeout(timer);
  }, [orderId, resultIndicator]);

  const openPrintWindow = () => {
    const w = window.open("", "_blank", "width=720,height=960");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head>
      <title>Receipt — ${orderId}</title>
      <style>
        body{font-family:Georgia,serif;padding:48px;color:#111;max-width:640px;margin:0 auto}
        @media print{body{padding:32px}}
        .hdr{text-align:center;border-bottom:2px solid #111;padding-bottom:20px;margin-bottom:28px}
        .brand{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:8px}
        .ttl{font-size:26px;font-weight:700}
        .dt{font-size:13px;color:#666;margin-top:6px}
        .tag{text-align:center;background:#f6f0e0;border-radius:8px;padding:14px;margin-bottom:28px;color:#8a6d00;font-weight:700;font-size:13px;letter-spacing:2px;text-transform:uppercase}
        table{width:100%;border-collapse:collapse;margin-bottom:24px}
        td{padding:10px 0;border-bottom:1px solid #eee;font-size:14px}
        td:first-child{color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;width:42%}
        td:last-child{font-weight:600}
        .pbox{background:#fafafa;border:1px solid #eee;border-radius:8px;padding:20px;margin-bottom:24px}
        .pr{display:flex;justify-content:space-between;font-size:13px;color:#666;padding:5px 0}
        .tr{display:flex;justify-content:space-between;font-weight:700;font-size:20px;border-top:2px solid #111;margin-top:12px;padding-top:12px}
        .ftr{text-align:center;font-size:11px;color:#aaa;border-top:1px solid #eee;padding-top:20px;margin-top:24px}
      </style>
      </head><body>
      ${printRef.current?.innerHTML ?? ""}
      <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}<\/script>
      </body></html>`);
    w.document.close();
  };

  if (status === "verifying") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin mx-auto mb-5" />
          <p className="font-label-caps text-label-caps text-on-surface">Confirming your payment…</p>
          <p className="text-on-surface-variant text-xs mt-2">Please wait, do not close this page</p>
        </div>
      </div>
    );
  }

  if (status === "failed" || !order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-container-padding-mobile">
        <div className="bg-surface-container-high border border-secondary/10 rounded-2xl p-10 max-w-md w-full text-center">
          <span className="material-symbols-outlined text-error text-[56px] mb-6 inline-block">cancel</span>
          <h1 className="font-headline-lg-mobile text-on-surface mb-2">Payment Failed</h1>
          <p className="text-on-surface-variant text-sm mb-8">
            You have not been charged. Please try again or contact support.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/hotels"
              className="w-full bg-secondary text-on-secondary py-3 rounded-xl font-label-caps text-label-caps hover:opacity-90 transition text-center"
            >
              ← TRY AGAIN
            </Link>
            <Link
              href="/"
              className="w-full border border-secondary/30 text-secondary py-3 rounded-xl font-label-caps text-label-caps hover:bg-secondary/5 transition text-center"
            >
              BACK TO HOME
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const detailRows: { label: string; value: string | number; mono?: boolean }[] = [
    { label: "Order Reference", value: order.id, mono: true },
    { label: "Hotel", value: order.hotel_name },
    { label: "Room", value: order.room_name },
    { label: "Check-in", value: order.check_in },
    { label: "Check-out", value: order.check_out },
    { label: "Duration", value: `${order.nights} night${order.nights !== 1 ? "s" : ""}` },
    { label: "Guests", value: order.guests },
    { label: "Email", value: order.email },
    { label: "Paid at", value: order.paid_at },
  ];

  return (
    <>
      {/* Hidden print template */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <div className="hdr">
            <div className="brand">Lumina Dubai</div>
            <div className="ttl">Booking Confirmation</div>
            <div className="dt">{order.paid_at}</div>
          </div>
          <div className="tag">✓ Payment Successful</div>
          <table>
            <tbody>
              {detailRows.map((r) => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td style={r.mono ? { fontFamily: "monospace" } : {}}>{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pbox">
            {[
              ["Room subtotal", order.subtotal],
              ["Tax (5%)", order.tax],
              ["Tourism fee", order.tourism_fee],
            ].map(([l, v]) => (
              <div key={l as string} className="pr">
                <span>{l}</span>
                <span>{order.currency} {money(v)}</span>
              </div>
            ))}
            <div className="tr">
              <span>Total Paid</span>
              <span>{order.currency} {money(order.amount)}</span>
            </div>
          </div>
          <div className="ftr">
            <div>Secured by Mastercard Payment Gateway Services</div>
            <div style={{ marginTop: 4 }}>Official payment receipt — please keep for your records.</div>
          </div>
        </div>
      </div>

      {/* Screen UI */}
      <div className="min-h-[70vh] px-container-padding-mobile md:px-container-padding-desktop py-16">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Hero */}
          <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20 rounded-2xl px-8 py-10 text-center">
            <span className="material-symbols-outlined text-secondary text-[56px] mb-4 inline-block">check_circle</span>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface mb-1">Booking Confirmed</h1>
            <p className="text-on-surface-variant text-sm">{order.paid_at}</p>
            <div className="mt-6 inline-block bg-secondary/10 border border-secondary/20 rounded-xl px-6 py-3">
              <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">TOTAL PAID</p>
              <p className="font-headline-lg-mobile text-secondary">{order.currency} {money(order.amount)}</p>
            </div>
          </div>

          {/* Booking details */}
          <div className="bg-surface-container-high border border-secondary/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-secondary/10">
              <p className="font-label-caps text-label-caps text-secondary">BOOKING DETAILS</p>
            </div>
            <div className="divide-y divide-secondary/5">
              {detailRows.map((row) => (
                <div key={row.label} className="flex justify-between items-center px-6 py-3.5">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wide">{row.label}</span>
                  <span
                    className={`text-sm font-medium text-on-surface text-right max-w-xs truncate ${
                      row.mono ? "font-mono text-xs" : ""
                    }`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="bg-surface-container-high border border-secondary/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-secondary/10">
              <p className="font-label-caps text-label-caps text-secondary">PRICE BREAKDOWN</p>
            </div>
            <div className="px-6 py-5 space-y-3">
              {[
                ["Room subtotal", order.subtotal],
                ["Tax (5%)", order.tax],
                ["Tourism fee", order.tourism_fee],
              ].map(([label, val]) => (
                <div key={label as string} className="flex justify-between text-sm text-on-surface-variant">
                  <span>{label}</span>
                  <span>{order.currency} {money(val)}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-semibold text-on-surface pt-3 border-t border-secondary/10">
                <span>Total Paid</span>
                <span className="text-secondary">{order.currency} {money(order.amount)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={openPrintWindow}
              className="flex items-center justify-center gap-2 bg-secondary text-on-secondary py-3.5 rounded-xl font-label-caps text-label-caps hover:opacity-90 transition"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              DOWNLOAD RECEIPT
            </button>
            <button
              onClick={openPrintWindow}
              className="flex items-center justify-center gap-2 border border-secondary/30 text-secondary py-3.5 rounded-xl font-label-caps text-label-caps hover:bg-secondary/5 transition"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              PRINT RECEIPT
            </button>
            <Link
              href={order.booking_id ? `/dashboard/bookings/${order.booking_id}` : "/dashboard"}
              className="flex items-center justify-center gap-2 bg-surface-container-highest text-on-surface py-3.5 rounded-xl font-label-caps text-label-caps hover:bg-secondary/10 transition text-center"
            >
              <span className="material-symbols-outlined text-[18px]">event</span>
              {order.booking_id ? "VIEW BOOKING" : "MY DASHBOARD"}
            </Link>
          </div>

          <Link
            href="/"
            className="flex items-center justify-center w-full border border-secondary/20 text-on-surface-variant py-3 rounded-xl font-label-caps text-label-caps hover:bg-secondary/5 transition"
          >
            ← BACK TO HOME
          </Link>

          <p className="text-center text-[10px] text-on-surface-variant/60 flex items-center justify-center gap-1.5 pb-6">
            <span className="material-symbols-outlined text-[14px]">verified_user</span>
            Secured by Mastercard Payment Gateway Services
          </p>
        </div>
      </div>
    </>
  );
}