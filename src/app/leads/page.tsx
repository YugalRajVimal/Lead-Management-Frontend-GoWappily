
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  X,
  Users2,
  Sparkles,
  PhoneCall,
  Trophy,
  UserX,
  Mail,
  MapPin,
  MessageCircle,
  Globe2,
  UserCircle2,
  MoreVertical,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { AddLeadForm } from "./AddLeadForm";
import * as api from "@/lib/api-client";
import { Lead, LeadsQuery, LeadStatus, Priority, SheetSource, User } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const STATUSES: LeadStatus[] = [
  "new",
  "not contacted",
  "call later",
  "pitched",
  "quotation send",
  "follow up",
  "converted",
  "lost",
  "junk",
];
const PRIORITIES: Priority[] = ["low", "medium", "high"];

// Helper to normalize phone number: remove any leading 'p:' and any spaces
function formatPhoneNumber(phone: string) {
  let normalized = phone?.trim() || "";
  if (normalized.startsWith("p:")) {
    normalized = normalized.substring(2);
  }
  return normalized;
}

// Pick the soonest pending/missed follow-up for a lead, if any, to show in the table.
function getNextFollowUp(lead: Lead) {
  if (!lead.followUps || lead.followUps.length === 0) return null;
  const open = lead.followUps.filter((f) => f.status !== "done");
  if (open.length === 0) return null;
  return open.sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )[0];
}

// Deterministic avatar color from the GoWappily brand palette, hashed by name.
const AVATAR_COLORS = [
  "bg-[#2E93D6]",
  "bg-[#F2591C]",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
];
function avatarColor(name: string) {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function StatCard({
  icon: Icon,
  iconClass,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  iconClass: string;
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 flex items-center gap-3 shadow-sm">
      <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center ${iconClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-semibold text-[#0B2C5F] leading-tight">{value}</p>
        <p className="text-xs text-slate-500 truncate">{label}</p>
        {hint && <p className="text-[11px] text-slate-400 truncate">{hint}</p>}
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sources, setSources] = useState<SheetSource[]>([]);
  // Initialize users to empty array if undefined or null just in case
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [sourceSheetId, setSourceSheetId] = useState("");
  const [tag, setTag] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [sortBy, setSortBy] = useState("originalDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Headline counts for the stat cards. These are fetched separately (limit: 1,
  // reading only pagination.total) so the cards reflect all-time totals rather
  // than the current filtered/paginated view.
  const [stats, setStats] = useState<{
    total: number;
    new: number;
    contacted: number;
    converted: number;
    unassigned: number;
  } | null>(null);

  const allTags = useMemo(
    () => Array.from(new Set(sources.flatMap((s) => s.tags))),
    [sources]
  );

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    api.getSources({}).then((r) => setSources(r.sources));
    api.getUsers().then((r) => setUsers(r.users ?? []));
  }, []);

  // NOTE: assumes the leads API accepts these as valid filters and returns
  // pagination.total. Adjust the query shape here if your api-client differs.
  useEffect(() => {
    Promise.all([
      api.getLeads({ page: 1, limit: 1 }),
      api.getLeads({ page: 1, limit: 1, status: "new" as LeadStatus }),
      api.getLeads({ page: 1, limit: 1, status: "contacted" as LeadStatus }),
      api.getLeads({ page: 1, limit: 1, status: "converted" as LeadStatus }),
    ])
      .then(([all, n, c, conv]) => {
        const assignedCount = users.length ? undefined : undefined; // placeholder, see below
        setStats({
          total: all.pagination.total,
          new: n.pagination.total,
          contacted: c.pagination.total,
          converted: conv.pagination.total,
          // Unassigned isn't guaranteed to be filterable server-side without
          // knowing the exact api-client contract, so it's derived from the
          // currently loaded page as a best-effort estimate until a dedicated
          // filter/count is wired up.
          unassigned: assignedCount ?? 0,
        });
      })
      .catch(() => setStats(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const query: LeadsQuery = {
      page,
      limit,
      sortBy,
      sortOrder,
      ...(search ? { search } : {}),
      ...(status ? { status: status as LeadStatus } : {}),
      ...(priority ? { priority: priority as Priority } : {}),
      ...(sourceSheetId ? { sourceSheetId } : {}),
      ...(tag ? { tag } : {}),
      ...(assignedTo ? { assignedTo } : {}),
    };
    api
      .getLeads(query)
      .then((res) => {
        setLeads(res.leads);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
        setStats((prev) =>
          prev
            ? { ...prev, unassigned: res.leads.filter((l) => !l.assignedTo).length }
            : prev
        );
      })
      .finally(() => setLoading(false));
  }, [page, limit, sortBy, sortOrder, search, status, priority, sourceSheetId, tag, assignedTo]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, status, priority, sourceSheetId, tag, assignedTo, limit]);

  const userName = (id: string | null) =>
    id ? users.find((u) => u.id === id)?.name || "—" : "Unassigned";

  const clearFilters = () => {
    setSearchInput("");
    setStatus("");
    setPriority("");
    setSourceSheetId("");
    setTag("");
    setAssignedTo("");
  };

  const hasFilters = status || priority || sourceSheetId || tag || assignedTo || search;

  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  // Windowed page numbers for the pager (current ± 1, plus first/last, with ellipses).
  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    const add = (p: number) => pages.push(p);
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) add(i);
      return pages;
    }
    add(1);
    if (page > 3) pages.push("ellipsis");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) add(i);
    if (page < totalPages - 2) pages.push("ellipsis");
    add(totalPages);
    return pages;
  }, [page, totalPages]);

  return (
    <AppShell title="Leads">
      <div className="p-4 md:p-6 space-y-4">
        {/* Header row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#0B2C5F]">Leads</h1>
            <p className="text-sm text-slate-500">Manage and track all your leads in one place.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search leads by name, phone, email…"
              className="pl-8"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            icon={Users2}
            iconClass="bg-[#2E93D6]/10 text-[#2E93D6]"
            label="Total Leads"
            value={stats ? stats.total : total || "—"}
            hint="All time leads"
          />
          <StatCard
            icon={Sparkles}
            iconClass="bg-[#F2591C]/10 text-[#F2591C]"
            label="New Leads"
            value={stats ? stats.new : "—"}
            hint="Awaiting first contact"
          />
          <StatCard
            icon={PhoneCall}
            iconClass="bg-teal-50 text-teal-600"
            label="Contacted"
            value={stats ? stats.contacted : "—"}
            hint="In progress"
          />
          <StatCard
            icon={Trophy}
            iconClass="bg-amber-50 text-amber-600"
            label="Converted"
            value={stats ? stats.converted : "—"}
            hint="Won leads"
          />
          <StatCard
            icon={UserX}
            iconClass="bg-rose-50 text-rose-600"
            label="Unassigned"
            value={stats ? stats.unassigned : "—"}
            hint="Need attention"
          />
        </div>

        {/* Filter bar */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between rounded-xl border border-slate-100 bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:flex-1 md:gap-2">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-auto min-w-[130px]"
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </Select>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-auto min-w-[120px]"
            >
              <option value="">All priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
            <Select
              value={sourceSheetId}
              onChange={(e) => setSourceSheetId(e.target.value)}
              className="w-auto min-w-[140px]"
            >
              <option value="">All sources</option>
              {sources && Array.isArray(sources) && sources.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </Select>
            <Select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-auto min-w-[130px]"
            >
              <option value="">All agents</option>
              {(users && Array.isArray(users) && users.length > 0) ? (
                users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))
              ) : null}
            </Select>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[#F2591C]"
              >
                <X className="h-3 w-3" /> Reset
              </button>
            )}
            {allTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 md:ml-2">
                {allTags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTag(tag === t ? "" : t)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
                      tag === t
                        ? "bg-gradient-to-r from-[#2E93D6] to-[#F2591C] text-white border-transparent"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#2E93D6]/40"
                    }`}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button onClick={() => setAddOpen(true)} className="shrink-0">
            <Plus className="h-3.5 w-3.5" /> Add Lead
          </Button>
        </div>

        {/* Leads table */}
        {loading ? (
          <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
            <TableSkeleton rows={8} cols={6} />
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            icon={Users2}
            title={hasFilters ? "No leads match your filters" : "No leads yet"}
            description={
              hasFilters
                ? "Try adjusting or clearing your filters."
                : "Add a Google Sheet source, or create a lead manually."
            }
            action={
              !hasFilters && (
                <Button onClick={() => setAddOpen(true)}>
                  <Plus className="h-3.5 w-3.5" /> Add Lead
                </Button>
              )
            }
          />
        ) : (
          <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-4 py-3 text-left font-medium text-slate-500 w-64">Lead</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Contact</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Location / Source</th>
                    {/* <th className="px-4 py-3 text-left font-medium text-slate-500 w-32">Priority</th> */}
                    <th className="px-4 py-3 text-left font-medium text-slate-500 w-36">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500 w-40">Assigned To</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500 w-28">Date</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-500 w-32">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => {
                    const nextFu = getNextFollowUp(l);
                    const initial = l.name?.[0]?.toUpperCase() || "?";
                    return (
                      <tr
                        key={l._id}
                        onClick={() => router.push(`/leads/detail/?id=${l._id}`)}
                        className={`group cursor-pointer border-b border-slate-50 last:border-b-0 hover:bg-slate-50/70 transition-colors border-l-4 ${avatarColor(
                          l.name || "?"
                        ).replace("bg-", "border-l-")}`}
                      >
                        {/* Lead identity */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-semibold ${avatarColor(
                                l.name || "?"
                              )}`}
                            >
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-[#0B2C5F] truncate">{l.name}</p>
                              {nextFu && (
                                <p className="text-[11px] text-slate-400 truncate">
                                  Next follow-up: {formatDate(nextFu.dueDate)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5 whitespace-nowrap">
                              <PhoneCall className="h-3.5 w-3.5 text-slate-400" />
                              {formatPhoneNumber(l.phone)}
                            </span>
                            {l.email && (
                              <span className="flex items-center gap-1.5 whitespace-nowrap truncate">
                                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{l.email}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Location / Source */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-1 text-xs text-slate-500">
                            {l.city && (
                              <span className="flex items-center gap-1.5 whitespace-nowrap">
                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                {l.city}
                              </span>
                            )}
                            {l.sourceSheetName && (
                              <span className="flex items-center gap-1.5 whitespace-nowrap">
                                <Globe2 className="h-3.5 w-3.5 text-[#2E93D6]" />
                                {l.sourceSheetName}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Priority */}
                        {/* <td className="px-4 py-3.5">
                          <PriorityBadge priority={l.priority} />
                        </td> */}

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status={l.status} />
                        </td>

                        {/* Assigned */}
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
                            <UserCircle2 className="h-3.5 w-3.5 text-slate-400" />
                            {userName(l.assignedTo)}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5">
                          <span className="flex flex-col text-xs text-slate-400 whitespace-nowrap">
                            <span>{formatDate(l.originalDate)}</span>
                            {l.originalDate && (
                              <span className="text-[11px] text-slate-400">
                                {new Date(l.originalDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </span>
                        </td>
                   

                        {/* Quick actions */}
                        <td className="px-4 py-3.5">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a
                              href={`tel:${formatPhoneNumber(l.phone)}`}
                              className="rounded-full bg-[#2E93D6]/10 p-2 text-[#2E93D6] hover:bg-[#2E93D6]/20"
                              title="Call"
                            >
                              <PhoneCall className="h-3.5 w-3.5" />
                            </a>
                            {l.whatsapp && (
                              <a
                                href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100"
                                title="WhatsApp"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                            )}
                            {l.email && (
                              <a
                                href={`mailto:${l.email}`}
                                className="rounded-full bg-[#F2591C]/10 p-2 text-[#F2591C] hover:bg-[#F2591C]/20"
                                title="Email"
                              >
                                <Mail className="h-3.5 w-3.5" />
                              </a>
                            )}
                            <button
                              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              title="More"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && leads.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row items-center justify-between text-xs text-slate-500">
            <span>
              Showing {rangeStart} to {rangeEnd} of {total} leads
            </span>
            <div className="flex items-center gap-3">
              <Select
                value={String(limit)}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-auto min-w-[110px]"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </Select>
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ‹
                </Button>
                {pageNumbers.map((p, idx) =>
                  p === "ellipsis" ? (
                    <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                        p === page
                          ? "bg-gradient-to-r from-[#2E93D6] to-[#F2591C] text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  ›
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Lead">
        <AddLeadForm
          users={users}
          onSuccess={() => {
            setAddOpen(false);
            load();
          }}
        />
      </Modal>
    </AppShell>
  );
}