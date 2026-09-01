// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { LayoutDashboard, Users2, Database, Bell } from "lucide-react";
// import { cn } from "@/lib/utils";

// const NAV = [
//   { href: "/", label: "Home", icon: LayoutDashboard },
//   { href: "/leads/", label: "Leads", icon: Users2 },
//   { href: "/sources/", label: "Sources", icon: Database },
//   { href: "/notifications/", label: "Alerts", icon: Bell },
// ];

// export function MobileNav() {
//   const pathname = usePathname();
//   return (
//     <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex border-t border-slate-200 bg-white">
//       {NAV.map((item) => {
//         const active =
//           item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
//         return (
//           <Link
//             key={item.href}
//             href={item.href}
//             className={cn(
//               "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
//               active ? "text-slate-900" : "text-slate-400"
//             )}
//           >
//             <item.icon className="h-4.5 w-4.5" />
//             {item.label}
//           </Link>
//         );
//       })}
//     </nav>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users2, Database, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/leads/", label: "Leads", icon: Users2 },
  { href: "/sources/", label: "Sources", icon: Database },
  { href: "/notifications/", label: "Alerts", icon: Bell },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
      {NAV.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
              active ? "text-[#1C6FC9]" : "text-slate-400"
            )}
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}