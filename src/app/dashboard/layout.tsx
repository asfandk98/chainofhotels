"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserSidebar from "@/components/dashboard/UserSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      sessionStorage.setItem("redirect_after_login", window.location.pathname);
      router.push("/login");
      return;
    }
    if (role === "admin") {
      router.push("/admin/dashboard");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="flex bg-surface min-h-screen pt-20">
        <UserSidebar />
        <main className="flex-1 md:ml-60 px-container-padding-mobile md:px-container-padding-desktop py-10 pb-24">
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
}