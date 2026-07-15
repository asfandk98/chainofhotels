"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

interface NavLeaf {
  label: string;
  href: string;
}
interface NavItem {
  label: string;
  icon: string;
  href?: string;
  children?: NavLeaf[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "/admin/dashboard" },
  {
    label: "Hotels",
    icon: "hotel",
    children: [
      { label: "All Hotels", href: "/admin/hotels" },
      { label: "Add Hotel", href: "/admin/hotels/create" },
    ],
  },
  {
    label: "Rooms",
    icon: "meeting_room",
    children: [
      { label: "Add Room", href: "/admin/rooms/create" },
      { label: "Seasonal Prices", href: "/admin/rooms/seasonal-prices" },
      { label: "Availability", href: "/admin/rooms/availability" },
    ],
  },
  { label: "Bookings", icon: "calendar_month", href: "/admin/bookings" },
  {
    label: "Blog",
    icon: "article",
    children: [
      { label: "All Posts", href: "/admin/blog" },
      { label: "New Post", href: "/admin/blog/create" },
      { label: "Categories", href: "/admin/blog/categories" },
    ],
  },
  // NOTE: no /admin/users page exists in anything shown to me yet — placeholder link.
  { label: "Users", icon: "group", href: "/admin/users" },
];

export default function AdminSidebar({
  open,
  onNavigate,
}: {
  open: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV_ITEMS.forEach((item) => {
      if (item.children?.some((c) => pathname.startsWith(c.href))) {
        initial[item.label] = true;
      }
    });
    return initial;
  });

  const toggle = (label: string) => setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside
      className={`h-screen w-64 fixed left-0 top-0 bg-surface-container border-r border-outline-variant/10 shadow-sm flex flex-col py-8 z-50 overflow-y-auto transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="px-6 mb-12 flex flex-col items-start">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-secondary uppercase tracking-widest">
          Lumina
        </h1>
        <span className="font-label-caps text-label-caps text-on-surface-variant opacity-60">Admin Console</span>
      </div>

      <nav className="flex-grow">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href
              ? pathname === item.href
              : item.children?.some((c) => pathname.startsWith(c.href));

            if (item.children) {
              const isExpanded = !!expanded[item.label];
              return (
                <li key={item.label}>
                  <button
                    onClick={() => toggle(item.label)}
                    className={`w-full flex items-center justify-between gap-4 px-6 py-3 transition-colors duration-300 ${
                      isActive ? "text-secondary" : "text-on-surface-variant hover:bg-surface-container-highest"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined">{item.icon}</span>
                      <span className="font-label-caps text-label-caps">{item.label}</span>
                    </div>
                    <span
                      className={`material-symbols-outlined text-sm transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {isExpanded && (
                    <ul className="bg-surface-container-low/50">
                      {item.children.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={onNavigate}
                              className={`block pl-16 py-2.5 text-[11px] font-label-caps uppercase transition-colors ${
                                childActive ? "text-secondary" : "text-on-surface-variant/70 hover:text-secondary"
                              }`}
                            >
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href!}
                  onClick={onNavigate}
                  className={`flex items-center gap-4 px-6 py-3 transition-colors duration-300 ${
                    isActive
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
    </aside>
  );
}