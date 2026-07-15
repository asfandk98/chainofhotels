"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { logoutUser } from "@/lib/auth";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: "dashboard" },
  { label: "My Bookings", href: "/dashboard/bookings", icon: "calendar_month" },
  { label: "Wishlist", href: "/dashboard/wishlist", icon: "favorite" },
  { label: "Profile", href: "/dashboard/profile", icon: "person" },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout request failed, signing out locally");
    }
    localStorage.clear();
    window.dispatchEvent(new Event("auth-change"));
    router.replace("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-60 fixed top-[140px] bottom-0 left-0 bg-surface-container border-r border-outline-variant/10 py-8 z-40">
      <nav className="flex-1">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-4 px-6 py-3 transition-colors duration-300 ${
                    active
                      ? "text-secondary border-r-2 border-secondary bg-surface-container-high"
                      : "text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="font-label-caps text-label-caps">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-6 pt-6 border-t border-outline-variant/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-on-surface-variant hover:text-error transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-label-caps text-label-caps">Logout</span>
        </button>
      </div>
    </aside>
  );
}