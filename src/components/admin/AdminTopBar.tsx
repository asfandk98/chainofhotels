"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";
import { logoutUser } from "@/lib/auth";

interface AdminUser {
  name?: string;
  email?: string;
}

function titleFromPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "Dashboard";
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
}

export default function AdminTopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore malformed cache
    }
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
      toast.success("Logged out successfully");
    } catch {
      // Even if the server call fails, clear local state so the user isn't stuck.
      toast.error("Logout request failed, signing out locally");
    }
    localStorage.clear();
    window.dispatchEvent(new Event("auth-change"));
    router.replace("/login");
  };

  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm flex justify-between items-center px-gutter py-4 transition-all duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="text-secondary p-1 hover:bg-surface-container-highest rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">menu_open</span>
        </button>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-secondary">{titleFromPath(pathname)}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:block">
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-on-surface-variant">{user.name}</span>
            <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs uppercase">
              {user.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? "AD"}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-on-surface-variant hover:text-secondary transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined">{loggingOut ? "hourglass_top" : "logout"}</span>
        </button>
      </div>
    </header>
  );
}