import { Suspense } from "react";
import HotelsClient from "./HotelsClient";

export const metadata = {
  title: "The Collection | Lumina Dubai",
};

export default function HotelsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-surface">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HotelsClient />
    </Suspense>
  );
}