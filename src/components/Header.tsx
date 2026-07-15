"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { logoutUser } from "@/lib/auth";

interface AuthUser {
  name?: string;
}

const NAV_LINKS = [
  { label: "HOME", href: "/" },
  { label: "HOTELS", href: "/hotels" },
  { label: "BLOGS", href: "/blog" },
  { label: "ABOUT", href: "/about-us" },
  { label: "CONTACT US", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const readAuth = () => {
    try {
      const raw = localStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
    setRole(localStorage.getItem("role"));
  };

  useEffect(() => {
    readAuth();
    window.addEventListener("auth-change", readAuth);
    window.addEventListener("storage", readAuth); // syncs across tabs
    return () => {
      window.removeEventListener("auth-change", readAuth);
      window.removeEventListener("storage", readAuth);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isLoggedIn = !!user;
  const dashboardHref = role === "admin" ? "/admin/dashboard" : "/dashboard";

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout request failed, signing out locally");
    }
    localStorage.clear();
    window.dispatchEvent(new Event("auth-change"));
    setMobileOpen(false);
    router.push("/");
  };

  return (
    <>
      <header
        className={`text-secondary flex justify-between items-center w-full px-container-padding-mobile md:px-container-padding-desktop z-50 fixed top-0 backdrop-blur-xl transition-all duration-500 ease-in-out shadow-[0px_20px_40px_rgba(0,0,0,0.4)] ${
          scrolled ? "bg-surface/95 py-2 h-16" : "bg-surface/80 h-20"
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden material-symbols-outlined cursor-pointer"
            aria-label="Open menu"
          >
            menu
          </button>
          <Link href="/" className="font-display-lg text-title-md tracking-widest text-secondary">
            CHAIN OF HOTELS
          </Link>
        </div>

        <nav className="hidden md:flex gap-8 items-center">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-label-caps transition-colors duration-300 ${
                pathname === link.href ? "text-secondary font-bold" : "text-on-surface-variant hover:text-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <span className="material-symbols-outlined cursor-pointer">search</span>

          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-4">
              <Link
                href={dashboardHref}
                className="font-label-caps text-on-surface-variant hover:text-secondary transition-colors duration-300"
              >
                DASHBOARD
              </Link>
              <button
                onClick={handleLogout}
                className="border border-secondary px-6 py-2 font-label-caps hover:bg-secondary hover:text-on-secondary transition-all duration-300"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className="font-label-caps text-on-surface-variant hover:text-secondary transition-colors duration-300"
              >
                LOGIN
              </Link>
              <Link
                href="/register"
                className="border border-secondary px-6 py-2 font-label-caps hover:bg-secondary hover:text-on-secondary transition-all duration-300"
              >
                REGISTER
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setMobileOpen(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-0 left-0 h-full w-72 bg-surface-container-high transform transition-transform duration-300 flex flex-col ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-secondary/10">
            <span className="font-display-lg text-title-md tracking-widest text-secondary">MENU</span>
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <span className="material-symbols-outlined text-secondary text-2xl">close</span>
            </button>
          </div>

          <nav className="flex flex-col px-6 py-6 gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`py-3 font-label-caps text-label-caps border-b border-secondary/5 ${
                  pathname === link.href ? "text-secondary" : "text-on-surface-variant"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto px-6 py-6 border-t border-secondary/10 flex flex-col gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href={dashboardHref}
                  className="text-center border border-secondary text-secondary py-3 font-label-caps text-label-caps hover:bg-secondary hover:text-on-secondary transition-all"
                >
                  DASHBOARD
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-center bg-secondary text-on-secondary py-3 font-label-caps text-label-caps hover:opacity-90 transition-all"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-center border border-secondary text-secondary py-3 font-label-caps text-label-caps hover:bg-secondary hover:text-on-secondary transition-all"
                >
                  LOGIN
                </Link>
                <Link
                  href="/register"
                  className="text-center bg-secondary text-on-secondary py-3 font-label-caps text-label-caps hover:opacity-90 transition-all"
                >
                  REGISTER
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}