
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users2, Database, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Logo palette
const COLOR_BLUE = "#2E93D6";
const COLOR_ORANGE = "#F2591C";
const COLOR_NAVY = "#0B2C5F";
const COLOR_GRAY = "#E8EEF4";

const NAV = [
  { href: "/", label: "Home", icon: LayoutDashboard, color: COLOR_BLUE },
  { href: "/leads/", label: "Leads", icon: Users2, color: COLOR_ORANGE },
  { href: "/sources/", label: "Sources", icon: Database, color: COLOR_NAVY },
  { href: "/users/", label: "Users", icon: User, color: COLOR_NAVY },
  { href: "/notifications/", label: "Alerts", icon: Bell, color: COLOR_ORANGE },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 flex border-t"
      style={{
        borderColor: COLOR_GRAY,
        background: `linear-gradient(90deg, ${COLOR_BLUE} 0%, ${COLOR_ORANGE} 100%)`,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {NAV.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors",
              active
                ? ""
                : "opacity-80"
            )}
            style={{
              color: active ? item.color : "#FFFFFF",
              background: active
                ? "rgba(255,255,255,0.15)"
                : "transparent",
            }}
          >
            <item.icon
              className="h-5 w-5 mb-0.5"
              style={{
                color: active ? item.color : "#FFFFFF",
                filter: !active ? "drop-shadow(0 1px 1px rgba(11,44,95,0.07))" : undefined,
              }}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}