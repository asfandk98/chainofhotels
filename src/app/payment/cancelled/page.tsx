import Link from "next/link";

export const metadata = {
  title: "Payment Cancelled | Lumina Dubai",
};

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="bg-surface-container-high border border-secondary/10 rounded-2xl p-10 max-w-md w-full text-center">
        <span className="material-symbols-outlined text-secondary text-[56px] mb-6 inline-block">
          error
        </span>

        <h1 className="font-headline-lg-mobile text-on-surface mb-2">Payment Cancelled</h1>
        <p className="text-on-surface-variant text-sm mb-8">
          You cancelled the payment. You have not been charged. Your booking has not been confirmed.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/hotels"
            className="w-full bg-secondary text-on-secondary py-3 rounded-xl font-label-caps text-label-caps hover:opacity-90 transition text-center"
          >
            BROWSE HOTELS
          </Link>
          <Link
            href="/dashboard/bookings"
            className="w-full border border-secondary/30 text-secondary py-3 rounded-xl font-label-caps text-label-caps hover:bg-secondary/5 transition text-center"
          >
            MY BOOKINGS
          </Link>
          <Link
            href="/"
            className="w-full text-on-surface-variant py-2 text-sm hover:text-secondary transition text-center"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}