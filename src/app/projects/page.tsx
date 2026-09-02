"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, X, FolderKanban } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ProjectStatusBadge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { NewProjectModal } from "./NewProjectModal";
import * as api from "@/lib/api-client";
import { Project, ProjectStatus, ProjectsQuery, User } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const STATUSES: ProjectStatus[] = ["active", "on_hold", "completed", "cancelled"];

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
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
  const [tag, setTag] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    api.getUsers().then((r) => setUsers(r.users));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const query: ProjectsQuery = {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(status ? { status: status as ProjectStatus } : {}),
      ...(tag ? { tag } : {}),
    };
    api
      .getProjects(query)
      .then((res) => {
        setProjects(res.projects);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page, search, status, tag]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, status, tag]);

  const teamAvatars = (ids: string[]) =>
    ids
      .map((id) => users.find((u) => u.id === id))
      .filter((u): u is User => !!u)
      .slice(0, 4);

  const hasFilters = status || tag || search;
  const clearFilters = () => {
    setSearchInput("");
    setStatus("");
    setTag("");
  };

  return (
    <AppShell title="Projects">
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search project or client…"
              className="pl-8"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> New Project
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
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
          <Input
            placeholder="Filter by tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-auto min-w-[130px]"
          />
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          {loading ? (
            <TableSkeleton rows={8} cols={6} />
          ) : projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title={hasFilters ? "No projects match your filters" : "No projects yet"}
              description={
                hasFilters
                  ? "Try adjusting or clearing your filters."
                  : "Create a project manually, or convert one from an existing lead."
              }
              action={
                !hasFilters && (
                  <Button onClick={() => setAddOpen(true)}>
                    <Plus className="h-3.5 w-3.5" /> New Project
                  </Button>
                )
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                    <th className="px-4 py-2.5 font-medium">Name</th>
                    <th className="px-4 py-2.5 font-medium">Client</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium">Team</th>
                    <th className="px-4 py-2.5 font-medium">Due Date</th>
                    <th className="px-4 py-2.5 font-medium">Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr
                      key={p._id}
                      onClick={() => router.push(`/projects/detail/?id=${p._id}`)}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="px-4 py-2.5 font-medium text-slate-900 whitespace-nowrap">
                        {p.name}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                        {p.clientName}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <ProjectStatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex -space-x-1.5">
                          {teamAvatars(p.teamMembers).map((u) => (
                            <div
                              key={u.id}
                              title={u.name}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700 ring-2 ring-white"
                            >
                              {u.name.charAt(0)}
                            </div>
                          ))}
                          {p.teamMembers.length === 0 && (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                        {formatDate(p.dueDate)}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex gap-1">
                          {p.tags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && projects.length > 0 && (
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

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Project" size="lg">
        <NewProjectModal
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
