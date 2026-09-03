// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { Bell, CalendarClock, UserPlus2, AlertTriangle } from "lucide-react";
// import { AppShell } from "@/components/layout/AppShell";
// import { TableSkeleton } from "@/components/ui/Skeleton";
// import { EmptyState } from "@/components/ui/EmptyState";
// import * as api from "@/lib/api-client";
// import { Notification } from "@/lib/types";
// import { formatDateTime } from "@/lib/utils";

// // Palette variables
// const LOGO_COLORS = {
//   blue: "#2E93D6",
//   orange: "#F2591C",
//   navy: "#0B2C5F",
//   blueBg: "#F3F8FB",
//   navyLight: "#E9EFF6"
// };

// function iconFor(type: Notification["type"]) {
//   if (type === "follow_up_due") return CalendarClock;
//   if (type === "new_lead") return UserPlus2;
//   return AlertTriangle;
// }

// function linkFor(n: Notification) {
//   if (n.leadId) return `/leads/detail/?id=${n.leadId}`;
//   if (n.sourceId) return `/sources/detail/?id=${n.sourceId}`;
//   return "#";
// }

// export default function NotificationsPage() {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     api
//       .getNotifications()
//       .then((res) => setNotifications(res.notifications))
//       .finally(() => setLoading(false));
//   }, []);

//   const markRead = async (n: Notification) => {
//     if (n.read) return;
//     await api.markNotificationRead(n._id);
//     setNotifications((prev) =>
//       prev.map((x) => (x._id === n._id ? { ...x, read: true } : x))
//     );
//   };

//   return (
//     <AppShell title="Notifications">
//       <div
//         className="p-4 md:p-6"
//         style={{
//           // Light, smooth diagonal gradient background using palette
//           background: `linear-gradient(135deg, ${LOGO_COLORS.blueBg} 0%, ${LOGO_COLORS.navyLight} 100%)`,
//           minHeight: "100vh"
//         }}
//       >
//         <div
//           className="rounded-xl border overflow-hidden"
//           style={{
//             background: "#fff",
//             border: `2px solid ${LOGO_COLORS.blue}`,
//             boxShadow:
//               "0 4px 24px 0 rgba(46,147,214,0.10), 0 1.5px 8px 0 #F2591C38"
//           }}
//         >
//           {loading ? (
//             <TableSkeleton rows={6} cols={1} />
//           ) : notifications.length === 0 ? (
//             <EmptyState
//               icon={Bell}
//               title="No notifications"
//               description="You're all caught up."
//             />
//           ) : (
//             notifications.map((n) => {
//               const Icon = iconFor(n.type);
//               return (
//                 <Link
//                   key={n._id}
//                   href={linkFor(n)}
//                   onClick={() => markRead(n)}
//                   className={`flex items-start gap-3 border-b last:border-0 px-4 py-3.5 transition-colors ${
//                     !n.read
//                       ? ""
//                       : ""
//                   }`}
//                   style={{
//                     background: !n.read
//                       ? `linear-gradient(90deg, ${LOGO_COLORS.blue}10 0%, ${LOGO_COLORS.orange}10 100%)`
//                       : "transparent",
//                     borderBottom: `1.4px solid ${LOGO_COLORS.blue}18`
//                   }}
//                 >
//                   <div
//                     className="rounded-full shrink-0 flex items-center justify-center"
//                     style={{
//                       background: n.type === "follow_up_due"
//                         ? `${LOGO_COLORS.blue}14`
//                         : n.type === "new_lead"
//                         ? `${LOGO_COLORS.orange}18`
//                         : `${LOGO_COLORS.navy}08`,
//                       padding: 10
//                     }}
//                   >
//                     <Icon
//                       className="h-4 w-4"
//                       style={{
//                         color:
//                           n.type === "follow_up_due"
//                             ? LOGO_COLORS.blue
//                             : n.type === "new_lead"
//                             ? LOGO_COLORS.orange
//                             : LOGO_COLORS.navy
//                       }}
//                     />
//                   </div>
//                   <div className="min-w-0 flex-1">
//                     <p
//                       className="text-sm font-medium truncate"
//                       style={{ color: LOGO_COLORS.navy }}
//                     >
//                       {n.message}
//                     </p>
//                     <p
//                       className="text-xs mt-0.5"
//                       style={{
//                         color: LOGO_COLORS.blue,
//                         letterSpacing: "0.02em",
//                         fontWeight: 500
//                       }}
//                     >
//                       {formatDateTime(n.createdAt)}
//                     </p>
//                   </div>
//                   {!n.read && (
//                     <span
//                       className="rounded-full mt-1.5 shrink-0"
//                       style={{
//                         height: 8,
//                         width: 8,
//                         background: `linear-gradient(135deg, ${LOGO_COLORS.blue} 0%, ${LOGO_COLORS.orange} 100%)`,
//                         boxShadow: `0 0 6px 0 ${LOGO_COLORS.orange}66`
//                       }}
//                     />
//                   )}
//                 </Link>
//               );
//             })
//           )}
//         </div>
//       </div>
//     </AppShell>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CalendarClock, UserPlus2, AlertTriangle, ClipboardList, AlarmClock, RefreshCcwDot } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import * as api from "@/lib/api-client";
import { Notification } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

function iconFor(type: Notification["type"]) {
  if (type === "follow_up_due") return CalendarClock;
  if (type === "new_lead") return UserPlus2;
  if (type === "task_assigned") return ClipboardList;
  if (type === "task_due") return AlarmClock;
  if (type === "project_status_changed") return RefreshCcwDot;
  return AlertTriangle;
}

function linkFor(n: Notification) {
  if (n.leadId) return `/leads/detail/?id=${n.leadId}`;
  if (n.projectId) return `/projects/detail/?id=${n.projectId}`;
  if (n.sourceId) return `/sources/detail/?id=${n.sourceId}`;
  return "#";
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getNotifications()
      .then((res) => setNotifications(res.notifications))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (n: Notification) => {
    if (n.read) return;
    await api.markNotificationRead(n._id);
    setNotifications((prev) =>
      prev.map((x) => (x._id === n._id ? { ...x, read: true } : x))
    );
  };

  return (
    <AppShell title="Notifications">
      <div className="p-4 md:p-6 max-w-2xl">
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          {loading ? (
            <TableSkeleton rows={6} cols={1} />
          ) : notifications.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
          ) : (
            notifications.map((n) => {
              const Icon = iconFor(n.type);
              return (
                <Link
                  key={n._id}
                  href={linkFor(n)}
                  onClick={() => markRead(n)}
                  className={`flex items-start gap-3 border-b border-slate-50 last:border-0 px-4 py-3.5 hover:bg-slate-50 ${
                    !n.read ? "bg-blue-50/40" : ""
                  }`}
                >
                  <div className="rounded-full bg-slate-100 p-2 shrink-0">
                    <Icon className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-800">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                </Link>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
