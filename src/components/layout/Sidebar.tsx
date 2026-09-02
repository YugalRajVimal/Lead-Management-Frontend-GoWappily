
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
//   FolderKanban,
//   UsersRound,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useAuth } from "@/hooks/useAuth";

// // Logo Palette
// const BLUE = "#2E93D6";
// const ORANGE = "#F2591C";
// const NAVY = "#0B2C5F";
// // For backgrounds, faded, etc.
// const LIGHT_BLUE_BG = "#EAF3FC";
// const SIDEBAR_BG = "#FFFFFF";
// const NAVY_TEXT = NAVY;
// const GRADIENT = `linear-gradient(90deg, ${BLUE} 0%, ${ORANGE} 100%)`;


// const NAV = [
//   { href: "/", label: "Dashboard", icon: LayoutDashboard },
//   { href: "/leads/", label: "Leads", icon: Users2 },
//   { href: "/sources/", label: "Sources", icon: Database },
//   { href: "/projects/", label: "Projects", icon: FolderKanban },
//   { href: "/team/", label: "Team", icon: UsersRound, adminOnly: true },
//   { href: "/notifications/", label: "Notifications", icon: Bell },
//   { href: "/users/", label: "Users", icon: UserCog, adminOnly: true },
// ];

// export function Sidebar() {
//   const pathname = usePathname();
//   const { user, logout } = useAuth();

//   return (
//     <aside
//       className="hidden md:flex w-56 shrink-0 flex-col border-r"
//       style={{
//         borderColor: `${BLUE}30`,
//         background: SIDEBAR_BG,
//       }}
//     >
//       <div
//         className="flex items-center gap-2 px-5 h-14 border-b"
//         style={{
//           borderColor: `${BLUE}18`,
//           background: `${BLUE}05`,
//         }}
//       >
//         <div className="flex h-10 w-10 items-center justify-center rounded-md overflow-hidden shrink-0 border"
//           style={{
//             borderColor: `${BLUE}13`,
//             background: "#fff",
//           }}
//         >
//           <img
//             src="/logo.png"
//             alt="GoWappily logo"
//             className="h-10 w-10 object-contain"
//           />
//         </div>
//         <span
//           className="text-sm font-semibold tracking-tight"
//           style={{
//             color: NAVY_TEXT,
//             letterSpacing: 0.2,
//           }}
//         >
//           GoWappily
//         </span>
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
//                   "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors group",
//                   active
//                     ? ""
//                     : ""
//                 )}
//                 style={{
//                   background: active ? LIGHT_BLUE_BG : "transparent",
//                   color: active ? BLUE : NAVY,
//                   boxShadow: active ? `0 2px 8px 0 ${BLUE}11` : undefined,
//                   fontWeight: active ? 650 : 500,
//                   transition: "background 0.17s, color 0.14s"
//                 }}
//               >
//                 <item.icon
//                   className={cn("h-4 w-4 transition-colors")}
//                   style={{
//                     color: active ? ORANGE : BLUE,
//                     opacity: active ? 1 : 0.75,
//                     transition: "color 0.14s, opacity 0.14s",
//                   }}
//                 />
//                 <span
//                   style={{
//                     color: active ? NAVY : "#244269",
//                   }}
//                 >
//                   {item.label}
//                 </span>
//               </Link>
//             );
//           }
//         )}
//       </nav>
//       <div
//         className="border-t p-3"
//         style={{
//           borderColor: `${BLUE}18`,
//           background: `${BLUE}03`,
//         }}
//       >
//         <div className="flex items-center gap-2 rounded-md px-2 py-2">
//           <div
//             className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white shrink-0"
//             style={{
//               background: GRADIENT,
//               boxShadow: `0 2px 6px 0 ${ORANGE}18`,
//               border: `2px solid ${BLUE}22`,
//             }}
//           >
//             {user?.name?.charAt(0) || "?"}
//           </div>
//           <div className="min-w-0 flex-1">
//             <p
//               className="truncate text-xs font-medium"
//               style={{
//                 color: NAVY_TEXT,
//               }}
//             >
//               {user?.name}
//             </p>
//             <p
//               className="truncate text-[11px]"
//               style={{
//                 color: ORANGE,
//                 fontWeight: 500,
//                 letterSpacing: 0.1,
//                 opacity: 0.82,
//               }}
//             >
//               {user?.role}
//             </p>
//           </div>
//           <button
//             onClick={logout}
//             title="Logout"
//             className="p-1 rounded transition-colors"
//             style={{
//               color: BLUE,
//               background: "none",
//             }}
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
  Sparkles,
  FolderKanban,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads/", label: "Leads", icon: Users2 },
  { href: "/sources/", label: "Sources", icon: Database },
  { href: "/projects/", label: "Projects", icon: FolderKanban },
  { href: "/team/", label: "Team", icon: UsersRound, adminOnly: true },
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
