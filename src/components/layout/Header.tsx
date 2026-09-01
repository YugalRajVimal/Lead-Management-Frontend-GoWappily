
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CalendarClock, UserPlus2, AlertTriangle } from "lucide-react";
import * as api from "@/lib/api-client";
import { Notification } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

// Logo Palette
const BLUE = "#2E93D6";
const ORANGE = "#F2591C";
const NAVY = "#0B2C5F";

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
    <header
      className="flex h-14 items-center justify-between border-b px-4 md:px-6 shrink-0"
      style={{
        background: "#fff",
        borderBottom: `2px solid ${BLUE}`,
        boxShadow: "0 2px 8px 0 rgba(44,106,181,0.11)",
      }}
    >
      <h1
        className="text-sm font-semibold truncate"
        style={{
          color: NAVY,
          letterSpacing: 0.2,
        }}
      >
        {title}
      </h1>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="relative rounded-md p-2 transition-colors"
          style={{
            color: unread > 0 ? ORANGE : BLUE,
            background: open ? "#EAF3FC" : "transparent",
            border: open ? `1.5px solid ${BLUE}` : `1.5px solid transparent`,
            boxShadow: open ? `0 2px 10px 0 ${BLUE}22` : undefined,
          }}
        >
          <Bell className="h-4.5 w-4.5" />
          {unread > 0 && (
            <span
              className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
              style={{
                background: ORANGE,
                color: "#fff",
                border: `1.5px solid #fff`,
                boxShadow: "0 1px 3px 0 #0B2C5F14",
              }}
            >
              {unread}
            </span>
          )}
        </button>
        {open && (
          <div
            className="absolute right-0 mt-2 w-80 rounded-lg z-20 shadow-lg border"
            style={{
              background: "#fff",
              borderColor: BLUE,
            }}
          >
            <div
              className="flex items-center justify-between px-3.5 py-2.5 border-b"
              style={{ borderColor: BLUE, background: `${BLUE}0C` }}
            >
              <span
                className="text-xs font-semibold"
                style={{ color: NAVY }}
              >
                Notifications
              </span>
              <Link
                href="/notifications/"
                onClick={() => setOpen(false)}
                className="text-xs"
                style={{
                  color: BLUE,
                  fontWeight: 500,
                  transition: "color 0.14s",
                }}
              >
                View all
              </Link>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 && (
                <p
                  className="px-3.5 py-6 text-center text-xs"
                  style={{ color: "#B0B8C5" }}
                >
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
                    className="flex items-start gap-2.5 px-3.5 py-2.5 text-xs border-b last:border-0 group"
                    style={{
                      borderColor: `${BLUE}16`,
                      background: !n.read
                        ? `${BLUE}15`
                        : "transparent",
                      transition: "background 0.14s",
                    }}
                  >
                    <Icon
                      className="h-3.5 w-3.5 mt-0.5 shrink-0"
                      style={{
                        color: n.read ? "#B0B8C5" : ORANGE,
                        transition: "color 0.13s",
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate"
                        style={{
                          color: n.read ? NAVY : BLUE,
                          fontWeight: n.read ? 400 : 600,
                        }}
                      >
                        {n.message}
                      </p>
                      <p
                        className="text-[10px] mt-0.5"
                        style={{ color: "#8392B6" }}
                      >
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <span
                        className="h-1.5 w-1.5 rounded-full mt-1 shrink-0"
                        style={{ background: ORANGE, display: "inline-block" }}
                      />
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