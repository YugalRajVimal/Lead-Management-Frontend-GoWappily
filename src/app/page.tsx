

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users2,
  Sparkle,
  Clock,
  AlertCircle,
  TrendingUp,
  Target,
  AlertTriangle,
  ArrowRight,
  FolderKanban,
  CalendarClock,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import * as api from "@/lib/api-client";
import { DashboardFollowUp, DashboardOverview } from "@/lib/types";
import { titleCase } from "@/lib/utils";

// Updated status colors per request
const STATUS_COLORS: Record<string, string> = {
  new: "#2563eb",                // blue-600
  "not contacted": "#64748b",    // slate-500
  contacted: "#f59e0b",          // orange-400 (unchanged for backward compat)
  "call later": "#eab308",       // yellow-400
  "pitched": "#f472b6",          // pink-400
  "quotation send": "#38bdf8",   // sky-400
  "follow up": "#a855f7",        // purple-500
  follow_up: "#a855f7",          // support alt spelling/legacy
  qualified: "#14b8a6",          // teal-500 (unchanged for backward compat)
  converted: "#22c55e",          // green-500
  lost: "#f87171",               // red-400
  junk: "#949ba2",               // slate-400
};

const PROJECT_STATUS_COLORS: Record<string, string> = {
  active: "#6366f1",
  on_hold: "#f97316",
  completed: "#10b981",
  cancelled: "#f43f5e",
};

const TASK_STATUS_COLORS: Record<string, string> = {
  todo: "#cbd5e1",
  in_progress: "#22d3ee",
  review: "#a78bfa",
  done: "#34d399",
  blocked: "#f87171",
};

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <Icon className={`h-3.5 w-3.5 ${accent || "text-slate-400"}`} />
      </div>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [followUps, setFollowUps] = useState<DashboardFollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDashboardOverview(),
      api.getDashboardFollowUps("today"),
    ])
      .then(([ov, fu]) => {
        setOverview(ov);
        setFollowUps(fu.followUps);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell title="Dashboard">
      <div className="p-4 md:p-6 space-y-6 ">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {loading || !overview ? (
            Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <StatCard icon={Users2} label="Total Leads" value={overview.totalLeads} />
              <StatCard
                icon={Sparkle}
                label="New Today"
                value={overview.newLeadsToday}
                accent="text-blue-500"
              />
              <StatCard
                icon={Clock}
                label="Pending Leads"
                value={overview.pendingLeads}
                accent="text-amber-500"
              />
              <StatCard
                icon={AlertCircle}
                label="Missed Follow-ups"
                value={overview.missedFollowUps}
                accent="text-red-500"
              />
              <StatCard
                icon={Target}
                label="Upcoming (24h)"
                value={overview.upcomingFollowUps24h}
                accent="text-purple-500"
              />
              <StatCard
                icon={TrendingUp}
                label="Conversion Rate"
                value={`${overview.conversionRate}%`}
                accent="text-green-500"
              />
            </>
          )}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 lg:col-span-1">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Leads by Status
            </h3>
            {loading || !overview ? (
              <Skeleton className="h-56 w-full" />
            ) : overview.leadsByStatus.length === 0 ? (
              <p className="text-xs text-slate-400 py-16 text-center">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={overview.leadsByStatus}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {overview.leadsByStatus.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={STATUS_COLORS[entry.status] || "#cbd5e1"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [String(v), titleCase(String(n))]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    formatter={(v) => titleCase(v)}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 lg:col-span-1">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Leads by Tag
            </h3>
            {loading || !overview ? (
              <Skeleton className="h-56 w-full" />
            ) : overview.leadsByTag.length === 0 ? (
              <p className="text-xs text-slate-400 py-16 text-center">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={overview.leadsByTag} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="tag"
                    width={70}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0f172a" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 lg:col-span-1">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Leads by Source
            </h3>
            {loading || !overview ? (
              <Skeleton className="h-56 w-full" />
            ) : overview.leadsBySource.length === 0 ? (
              <p className="text-xs text-slate-400 py-16 text-center">No data yet</p>
            ) : (
              <div className="space-y-2.5 pt-1">
                {overview.leadsBySource.map((s) => {
                  const max = Math.max(...overview.leadsBySource.map((x) => x.count));
                  return (
                    <div key={s.sourceSheetName}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 truncate">
                          {s.sourceSheetName}
                        </span>
                        <span className="text-slate-400">{s.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100">
                        <div
                          className="h-1.5 rounded-full bg-slate-900"
                          style={{ width: `${(s.count / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Trend + attention */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              14-Day Leads Trend
            </h3>
            {loading || !overview ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={overview.leadsTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => v.slice(5)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#0f172a"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 lg:col-span-1">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Needs Attention
            </h3>
            {loading || !overview ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : followUps.length === 0 && overview.sourcesNeedingAttention.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                Nothing needs attention right now.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {followUps.map((f, i) => (
                  <Link
                    key={`fu-${i}`}
                    href={`/leads/detail/?id=${f.leadId}`}
                    className="flex items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-slate-50 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">
                        {f.leadName}
                      </p>
                      <p className="text-slate-400 truncate">{f.note}</p>
                    </div>
                    <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />
                  </Link>
                ))}
                {overview.sourcesNeedingAttention.map((s) => (
                  <Link
                    key={s.sourceId}
                    href={`/sources/detail/?id=${s.sourceId}`}
                    className="flex items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-red-50 text-xs"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">
                        {s.sourceName}
                      </span>
                    </div>
                    <span className="text-red-500 shrink-0">sync failed</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Phase 2 addendum — Projects & Tasks (additive; existing lead
            cards/charts/rows above are untouched). */}
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Projects & Tasks</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {loading || !overview ? (
              Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  icon={FolderKanban}
                  label="Total Projects"
                  value={overview.totalProjects}
                />
                <StatCard
                  icon={Sparkle}
                  label="Active Projects"
                  value={overview.activeProjects}
                  accent="text-indigo-500"
                />
                <StatCard
                  icon={CalendarClock}
                  label="Tasks Due Today"
                  value={overview.tasksDueToday}
                  accent="text-cyan-500"
                />
                <StatCard
                  icon={AlertCircle}
                  label="Overdue Tasks"
                  value={overview.overdueTasks}
                  accent="text-red-500"
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Projects by Status
              </h3>
              {loading || !overview ? (
                <Skeleton className="h-56 w-full" />
              ) : overview.projectsByStatus.length === 0 ? (
                <p className="text-xs text-slate-400 py-16 text-center">No projects yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={overview.projectsByStatus}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                    >
                      {overview.projectsByStatus.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={PROJECT_STATUS_COLORS[entry.status] || "#cbd5e1"}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [String(v), titleCase(String(n))]} />
                    <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => titleCase(v)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Tasks by Status
              </h3>
              {loading || !overview ? (
                <Skeleton className="h-56 w-full" />
              ) : overview.tasksByStatus.length === 0 ? (
                <p className="text-xs text-slate-400 py-16 text-center">No tasks yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={overview.tasksByStatus}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="status"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => titleCase(v)}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip formatter={(v, n) => [String(v), titleCase(String(n))]} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {overview.tasksByStatus.map((entry, idx) => (
                        <Cell key={idx} fill={TASK_STATUS_COLORS[entry.status] || "#cbd5e1"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {!loading && overview && overview.totalLeads === 0 && (
          <EmptyState
            icon={Users2}
            title="No leads yet"
            description='Add your first Google Sheet source to start importing leads.'
            action={
              <Link href="/sources/">
                <span className="text-sm font-medium text-slate-900 underline">
                  Go to Sources →
                </span>
              </Link>
            }
          />
        )}
      </div>
    </AppShell>
  );
}
