"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CalendarClock, UserPlus2, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import * as api from "@/lib/api-client";
import { Notification } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

function iconFor(type: Notification["type"]) {
  if (type === "follow_up_due") return CalendarClock;
  if (type === "new_lead") return UserPlus2;
  return AlertTriangle;
}

function linkFor(n: Notification) {
  if (n.leadId) return `/leads/detail/?id=${n.leadId}`;
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
