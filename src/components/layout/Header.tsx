"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CalendarClock, UserPlus2, AlertTriangle } from "lucide-react";
import * as api from "@/lib/api-client";
import { Notification } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

function iconFor(type: Notification["type"]) {
  if (type === "follow_up_due") return CalendarClock;
  if (type === "new_lead") return UserPlus2;
  return AlertTriangle;
}

function linkFor(n: Notification) {
  if (n.leadId) return `/leads/detail/?id=${n.leadId}`;
  if (n.sourceId) return `/sources/detail/?id=${n.sourceId}`;
  return "/notifications/";
}

export function Header({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const load = () => {
    api.getNotifications().then((res) => setNotifications(res.notifications));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const handleClick = async (n: Notification) => {
    if (!n.read) {
      await api.markNotificationRead(n._id);
      setNotifications((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, read: true } : x))
      );
    }
    setOpen(false);
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shrink-0">
      <h1 className="text-sm font-semibold text-slate-900">{title}</h1>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <Bell className="h-4.5 w-4.5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {unread}
            </span>
          )}
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg z-20">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-900">
                Notifications
              </span>
              <Link
                href="/notifications/"
                onClick={() => setOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                View all
              </Link>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 && (
                <p className="px-3.5 py-6 text-center text-xs text-slate-400">
                  No notifications
                </p>
              )}
              {notifications.slice(0, 8).map((n) => {
                const Icon = iconFor(n.type);
                return (
                  <Link
                    key={n._id}
                    href={linkFor(n)}
                    onClick={() => handleClick(n)}
                    className={`flex items-start gap-2.5 px-3.5 py-2.5 text-xs hover:bg-slate-50 border-b border-slate-50 last:border-0 ${
                      !n.read ? "bg-blue-50/40" : ""
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-700">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
