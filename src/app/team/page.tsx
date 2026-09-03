"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UsersRound, FolderKanban } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TableSkeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProjectStatusBadge } from "@/components/ui/Badge";
import * as api from "@/lib/api-client";
import { Project, Task, TaskStatus, User } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "review", "done", "blocked"];
const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-slate-300",
  in_progress: "bg-cyan-400",
  review: "bg-violet-400",
  done: "bg-emerald-400",
  blocked: "bg-red-400",
};

export default function TeamPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"members" | "clients">("members");

  useEffect(() => {
    if (!me || me.role !== "admin") return;
    setLoading(true);
    Promise.all([
      api.getUsers(),
      api.getProjects({ limit: 500 }),
      api.getTasks({ limit: 1000 }),
    ])
      .then(([u, p, t]) => {
        console.log("[TeamPage] getUsers: ", u);
        console.log("[TeamPage] getProjects: ", p);
        console.log("[TeamPage] getTasks: ", t);

        setUsers(u.users);
        setProjects(p.projects);
        setTasks(t.tasks);
      })
      .catch((err) => {
        console.error("[TeamPage] Error fetching data:", err);
      })
      .finally(() => setLoading(false));
  }, [me]);

  if (me && me.role !== "admin") {
    return (
      <AppShell title="Team">
        <div className="p-6">
          <EmptyState
            icon={UsersRound}
            title="Admins only"
            description="You need admin access to view team workload."
          />
        </div>
      </AppShell>
    );
  }

  const teamMembers = users.filter((u) => u.role === "team_member");
  const clients = users.filter((u) => u.role === "client");

  const memberStats = (userId: string) => {
    const memberProjects = projects.filter((p) => p.teamMembers.includes(userId));
    const activeProjects = memberProjects.filter(
      (p) => p.status === "active" || p.status === "on_hold"
    );
    const memberTasks = tasks.filter((t) => t.assignees.includes(userId));
    const activeTasks = memberTasks.filter((t) => t.status !== "done");
    const byStatus = TASK_STATUSES.map((s) => ({
      status: s,
      count: memberTasks.filter((t) => t.status === s).length,
    }));
    return {
      activeProjectCount: activeProjects.length,
      activeTaskCount: activeTasks.length,
      totalTasks: memberTasks.length,
      byStatus,
    };
  };

  const clientProjects = (userId: string) => projects.filter((p) => p.clientId === userId);

  return (
    <AppShell title="Team">
      <div className="p-4 md:p-6 space-y-4 ">
        <div className="flex items-center gap-1 border-b border-slate-200">
          {(
            [
              ["members", `Team Members (${teamMembers.length})`],
              ["clients", `Clients (${clients.length})`],
            ] as [typeof tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
                tab === key
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "members" &&
          (loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : teamMembers.length === 0 ? (
            <EmptyState
              icon={UsersRound}
              title="No team members yet"
              description='Create users with the "team_member" role from the Users page.'
            />
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                    <th className="px-4 py-2.5 font-medium">Name</th>
                    <th className="px-4 py-2.5 font-medium">Email</th>
                    <th className="px-4 py-2.5 font-medium">Active Projects</th>
                    <th className="px-4 py-2.5 font-medium">Active Tasks</th>
                    <th className="px-4 py-2.5 font-medium">Workload</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((u) => {
                    const stats = memberStats(u.id);
                    return (
                      <tr key={u.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-4 py-2.5 font-medium text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700">
                              {u.name.charAt(0)}
                            </div>
                            {u.name}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                          {u.email}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <Link
                            href={`/projects/?teamMember=${u.id}`}
                            className="flex items-center gap-1 text-slate-700 hover:text-slate-900 hover:underline"
                          >
                            <FolderKanban className="h-3 w-3 text-slate-400" />
                            {stats.activeProjectCount}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                          {stats.activeTaskCount}
                        </td>
                        <td className="px-4 py-2.5 min-w-[160px]">
                          {stats.totalTasks === 0 ? (
                            <span className="text-xs text-slate-300">No tasks</span>
                          ) : (
                            <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                              {stats.byStatus.map(
                                ({ status, count }) =>
                                  count > 0 && (
                                    <div
                                      key={status}
                                      title={`${status.replace("_", " ")}: ${count}`}
                                      className={TASK_STATUS_COLORS[status]}
                                      style={{
                                        width: `${(count / stats.totalTasks) * 100}%`,
                                      }}
                                    />
                                  )
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}

        {tab === "clients" &&
          (loading ? (
            <TableSkeleton rows={4} cols={3} />
          ) : clients.length === 0 ? (
            <EmptyState
              icon={UsersRound}
              title="No client users yet"
              description='Create users with the "client" role from the Users page.'
            />
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                    <th className="px-4 py-2.5 font-medium">Name</th>
                    <th className="px-4 py-2.5 font-medium">Email</th>
                    <th className="px-4 py-2.5 font-medium">Linked Projects</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((u) => {
                    const linked = clientProjects(u.id);
                    return (
                      <tr key={u.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-4 py-2.5 font-medium text-slate-900 whitespace-nowrap">
                          {u.name}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                          {u.email}
                        </td>
                        <td className="px-4 py-2.5">
                          {linked.length === 0 ? (
                            <span className="text-xs text-slate-300">No linked projects</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {linked.map((p) => (
                                <Link
                                  key={p._id}
                                  href={`/projects/detail/?id=${p._id}`}
                                  className="flex items-center gap-1.5 rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-600 hover:border-slate-400"
                                >
                                  {p.name}
                                  <ProjectStatusBadge status={p.status} />
                                </Link>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </AppShell>
  );
}
