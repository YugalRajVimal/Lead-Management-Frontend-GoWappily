import { cn } from "@/lib/utils";
import { LeadStatus, Priority, SourceSyncStatus } from "@/lib/types";

const statusStyles: Record<LeadStatus, string> = {
  new: "bg-blue-50 text-blue-700 ring-blue-600/20",
  contacted: "bg-amber-50 text-amber-700 ring-amber-600/20",
  follow_up: "bg-purple-50 text-purple-700 ring-purple-600/20",
  qualified: "bg-teal-50 text-teal-700 ring-teal-600/20",
  converted: "bg-green-50 text-green-700 ring-green-600/20",
  lost: "bg-slate-100 text-slate-600 ring-slate-500/20",
  junk: "bg-slate-100 text-slate-500 ring-slate-500/20",
};

const priorityStyles: Record<Priority, string> = {
  low: "bg-slate-100 text-slate-600 ring-slate-500/20",
  medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  high: "bg-red-50 text-red-700 ring-red-600/20",
};

const syncStyles: Record<SourceSyncStatus, string> = {
  success: "bg-green-50 text-green-700 ring-green-600/20",
  partial: "bg-amber-50 text-amber-700 ring-amber-600/20",
  failed: "bg-red-50 text-red-700 ring-red-600/20",
  never_synced: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

function Base({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Base className={statusStyles[status]}>{status.replace("_", " ")}</Base>
  );
}

export function PriorityBadge({ priority }: { priority: Priority | null }) {
  if (!priority) return <span className="text-xs text-slate-400">—</span>;
  return <Base className={priorityStyles[priority]}>{priority}</Base>;
}

export function SyncBadge({ status }: { status: SourceSyncStatus }) {
  return (
    <Base className={syncStyles[status]}>{status.replace("_", " ")}</Base>
  );
}

export function SourceStatusBadge({ status }: { status: "active" | "paused" | "error" }) {
  const styles = {
    active: "bg-green-50 text-green-700 ring-green-600/20",
    paused: "bg-slate-100 text-slate-600 ring-slate-500/20",
    error: "bg-red-50 text-red-700 ring-red-600/20",
  };
  return <Base className={styles[status]}>{status}</Base>;
}
