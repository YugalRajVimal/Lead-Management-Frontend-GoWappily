"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, X, Users2 } from "lucide-react";
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
  "new", "contacted", "follow_up", "qualified", "converted", "lost", "junk",
];
const PRIORITIES: Priority[] = ["low", "medium", "high"];

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
  const limit = 20;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [sourceSheetId, setSourceSheetId] = useState("");
  const [tag, setTag] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
      })
      .finally(() => setLoading(false));
  }, [page, sortBy, sortOrder, search, status, priority, sourceSheetId, tag, assignedTo]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, status, priority, sourceSheetId, tag, assignedTo]);

  const userName = (id: string | null) =>
    id ? users.find((u) => u.id === id)?.name || "—" : "Unassigned";

  const toggleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    setStatus("");
    setPriority("");
    setSourceSheetId("");
    setTag("");
    setAssignedTo("");
  };

  const hasFilters = status || priority || sourceSheetId || tag || assignedTo || search;

  return (
    <AppShell title="Leads">
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search name, phone, email…"
              className="pl-8"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Lead
          </Button>
        </div>

        {/* Tag chips */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(tag === t ? "" : t)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
                  tag === t
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-auto min-w-[120px]"
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
            className="w-auto min-w-[110px]"
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
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          {loading ? (
            <TableSkeleton rows={10} cols={9} />
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                    {[
                      ["name", "Name"],
                      ["phone", "Phone"],
                      ["city", "City"],
                      ["sourceSheetName", "Source"],
                      ["tags", "Tags"],
                      ["status", "Status"],
                      ["priority", "Priority"],
                      ["assignedTo", "Assigned To"],
                      ["createdAt", "Created"],
                    ].map(([key, label]) => (
                      <th
                        key={key}
                        onClick={() => toggleSort(key)}
                        className="px-4 py-2.5 font-medium whitespace-nowrap cursor-pointer select-none hover:text-slate-800"
                      >
                        {label}
                        {sortBy === key && (sortOrder === "asc" ? " ↑" : " ↓")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr
                      key={l._id}
                      onClick={() => router.push(`/leads/detail/?id=${l._id}`)}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="px-4 py-2.5 font-medium text-slate-900 whitespace-nowrap">
                        {l.name}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                        {l.phone}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                        {l.city || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap max-w-[140px] truncate">
                        {l.sourceSheetName}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex gap-1">
                          {l.tags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <PriorityBadge priority={l.priority} />
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                        {userName(l.assignedTo)}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                        {formatDate(l.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && leads.length > 0 && (
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </span>
            <div className="flex gap-1">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
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
