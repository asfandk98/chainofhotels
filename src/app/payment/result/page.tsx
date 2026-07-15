import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PaymentResultClient from "@/components/payments/PaymentResultClient";

export const metadata = {
  title: "Payment Result | Lumina Dubai",
};

export default function PaymentResultPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <PaymentResultClient />
      </Suspense>
      <Footer />
    </>
  );
}