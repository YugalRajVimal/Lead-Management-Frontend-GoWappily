// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   LayoutDashboard,
//   Users2,
//   Database,
//   Bell,
//   UserCog,
//   LogOut,
//   Sparkles,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useAuth } from "@/hooks/useAuth";

// const NAV = [
//   { href: "/", label: "Dashboard", icon: LayoutDashboard },
//   { href: "/leads/", label: "Leads", icon: Users2 },
//   { href: "/sources/", label: "Sources", icon: Database },
//   { href: "/notifications/", label: "Notifications", icon: Bell },
//   { href: "/users/", label: "Users", icon: UserCog, adminOnly: true },
// ];

// export function Sidebar() {
//   const pathname = usePathname();
//   const { user, logout } = useAuth();

//   return (
//     <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
//       <div className="flex items-center gap-2 px-5 h-14 border-b border-slate-100">
//         <div className="flex h-16 w-16 items-center justify-center rounded-md overflow-hidden">
//           <img
//             src="/logo.png"
//             alt="GoWappily logo"
//             className="h-16 w-16 object-contain"
//           />
//         </div>
  
//         <span className="text-sm font-semibold text-slate-900">GoWappily</span>
//       </div>
//       <nav className="flex-1 space-y-0.5 px-3 py-4">
//         {NAV.filter((item) => !item.adminOnly || user?.role === "admin").map(
//           (item) => {
//             const active =
//               item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className={cn(
//                   "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
//                   active
//                     ? "bg-slate-100 text-slate-900"
//                     : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
//                 )}
//               >
//                 <item.icon className="h-4 w-4" />
//                 {item.label}
//               </Link>
//             );
//           }
//         )}
//       </nav>
//       <div className="border-t border-slate-100 p-3">
//         <div className="flex items-center gap-2 rounded-md px-2 py-2">
//           <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600 shrink-0">
//             {user?.name?.charAt(0) || "?"}
//           </div>
//           <div className="min-w-0 flex-1">
//             <p className="truncate text-xs font-medium text-slate-900">
//               {user?.name}
//             </p>
//             <p className="truncate text-[11px] text-slate-500">{user?.role}</p>
//           </div>
//           <button
//             onClick={logout}
//             title="Logout"
//             className="text-slate-400 hover:text-slate-700 p-1 rounded"
//           >
//             <LogOut className="h-3.5 w-3.5" />
//           </button>
//         </div>
//       </div>
//     </aside>
//   );
// }


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
        <div className="flex h-10 w-10 items-center justify-center rounded-md overflow-hidden shrink-0">
          <img
            src="/logo.png"
            alt="GoWappily logo"
            className="h-10 w-10 object-contain"
          />
        </div>
        <span className="text-sm font-semibold text-[#173F76] tracking-tight">
          GoWappily
        </span>
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
                    ? "bg-[#EAF3FC] text-[#1C6FC9]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#173F76]"
                )}
              >
                <item.icon
                  className={cn("h-4 w-4", active ? "text-[#1C6FC9]" : "text-slate-400")}
                />
                {item.label}
              </Link>
            );
          }
        )}
      </nav>
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-2 rounded-md px-2 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#F5871F] to-[#1C6FC9] text-xs font-semibold text-white shrink-0">
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
            className="text-slate-400 hover:text-[#F5871F] p-1 rounded transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}