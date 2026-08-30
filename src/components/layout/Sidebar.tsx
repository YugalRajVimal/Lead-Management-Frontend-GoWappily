"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users2,
  Database,
  Bell,
  UserCog,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads/", label: "Leads", icon: Users2 },
  { href: "/sources/", label: "Sources", icon: Database },
  { href: "/notifications/", label: "Notifications", icon: Bell },
  { href: "/users/", label: "Users", icon: UserCog, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-5 h-14 border-b border-slate-100">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-slate-900">GoWappily</span>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV.filter((item) => !item.adminOnly || user?.role === "admin").map(
          (item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          }
        )}
      </nav>
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-2 rounded-md px-2 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600 shrink-0">
            {user?.name?.charAt(0) || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-slate-900">
              {user?.name}
            </p>
            <p className="truncate text-[11px] text-slate-500">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="text-slate-400 hover:text-slate-700 p-1 rounded"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
