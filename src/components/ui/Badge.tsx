// // import { cn } from "@/lib/utils";
// // import { LeadStatus, Priority, SourceSyncStatus } from "@/lib/types";

// // const statusStyles: Record<LeadStatus, string> = {
// //   new: "bg-blue-50 text-blue-700 ring-blue-600/20",
// //   contacted: "bg-amber-50 text-amber-700 ring-amber-600/20",
// //   follow_up: "bg-purple-50 text-purple-700 ring-purple-600/20",
// //   qualified: "bg-teal-50 text-teal-700 ring-teal-600/20",
// //   converted: "bg-green-50 text-green-700 ring-green-600/20",
// //   lost: "bg-slate-100 text-slate-600 ring-slate-500/20",
// //   junk: "bg-slate-100 text-slate-500 ring-slate-500/20",
// // };

// // const priorityStyles: Record<Priority, string> = {
// //   low: "bg-slate-100 text-slate-600 ring-slate-500/20",
// //   medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
// //   high: "bg-red-50 text-red-700 ring-red-600/20",
// // };

// // const syncStyles: Record<SourceSyncStatus, string> = {
// //   success: "bg-green-50 text-green-700 ring-green-600/20",
// //   partial: "bg-amber-50 text-amber-700 ring-amber-600/20",
// //   failed: "bg-red-50 text-red-700 ring-red-600/20",
// //   never_synced: "bg-slate-100 text-slate-600 ring-slate-500/20",
// // };

// // function Base({ className, children }: { className: string; children: React.ReactNode }) {
// //   return (
// //     <span
// //       className={cn(
// //         "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
// //         className
// //       )}
// //     >
// //       {children}
// //     </span>
// //   );
// // }

// // export function StatusBadge({ status }: { status: LeadStatus }) {
// //   return (
// //     <Base className={statusStyles[status]}>{status.replace("_", " ")}</Base>
// //   );
// // }

// // export function PriorityBadge({ priority }: { priority: Priority | null }) {
// //   if (!priority) return <span className="text-xs text-slate-400">—</span>;
// //   return <Base className={priorityStyles[priority]}>{priority}</Base>;
// // }

// // export function SyncBadge({ status }: { status: SourceSyncStatus }) {
// //   return (
// //     <Base className={syncStyles[status]}>{status.replace("_", " ")}</Base>
// //   );
// // }

// // export function SourceStatusBadge({ status }: { status: "active" | "paused" | "error" }) {
// //   const styles = {
// //     active: "bg-green-50 text-green-700 ring-green-600/20",
// //     paused: "bg-slate-100 text-slate-600 ring-slate-500/20",
// //     error: "bg-red-50 text-red-700 ring-red-600/20",
// //   };
// //   return <Base className={styles[status]}>{status}</Base>;
// // }


// import { cn } from "@/lib/utils";
// import { ArrowUp, ArrowUpRight, ArrowDown } from "lucide-react";
// import { LeadStatus, Priority, SourceSyncStatus } from "@/lib/types";

// const statusStyles: Record<LeadStatus, string> = {
//   new: "bg-[#2E93D6]/10 text-[#1D6FA8] ring-[#2E93D6]/25",
//   contacted: "bg-amber-50 text-amber-700 ring-amber-600/20",
//   follow_up: "bg-purple-50 text-purple-700 ring-purple-600/20",
//   qualified: "bg-teal-50 text-teal-700 ring-teal-600/20",
//   converted: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
//   lost: "bg-slate-100 text-slate-600 ring-slate-500/20",
//   junk: "bg-slate-100 text-slate-500 ring-slate-500/20",
// };

// const priorityStyles: Record<Priority, { text: string; icon: typeof ArrowUp }> = {
//   high: { text: "text-red-600", icon: ArrowUp },
//   medium: { text: "text-[#F2591C]", icon: ArrowUpRight },
//   low: { text: "text-emerald-600", icon: ArrowDown },
// };

// const syncStyles: Record<SourceSyncStatus, string> = {
//   success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
//   partial: "bg-amber-50 text-amber-700 ring-amber-600/20",
//   failed: "bg-red-50 text-red-700 ring-red-600/20",
//   never_synced: "bg-slate-100 text-slate-600 ring-slate-500/20",
// };

// function Base({ className, children }: { className: string; children: React.ReactNode }) {
//   return (
//     <span
//       className={cn(
//         "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
//         className
//       )}
//     >
//       {children}
//     </span>
//   );
// }

// export function StatusBadge({ status }: { status: LeadStatus }) {
//   return (
//     <Base className={statusStyles[status]}>{status.replace("_", " ")}</Base>
//   );
// }

// // Matches the reference design: a small up/down arrow + colored label, no pill background.
// export function PriorityBadge({ priority }: { priority: Priority | null }) {
//   if (!priority) return <span className="text-xs text-slate-400">—</span>;
//   const { text, icon: Icon } = priorityStyles[priority];
//   return (
//     <span className={cn("inline-flex items-center gap-1 text-xs font-medium capitalize", text)}>
//       <Icon className="h-3 w-3" />
//       {priority}
//     </span>
//   );
// }

// export function SyncBadge({ status }: { status: SourceSyncStatus }) {
//   return (
//     <Base className={syncStyles[status]}>{status.replace("_", " ")}</Base>
//   );
// }

// export function SourceStatusBadge({ status }: { status: "active" | "paused" | "error" }) {
//   const styles = {
//     active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
//     paused: "bg-slate-100 text-slate-600 ring-slate-500/20",
//     error: "bg-red-50 text-red-700 ring-red-600/20",
//   };
//   return <Base className={styles[status]}>{status}</Base>;
// }

import { cn } from "@/lib/utils";
import { LeadStatus, Priority, SourceSyncStatus, ProjectStatus } from "@/lib/types";

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

// Phase 2 — Project/Task badges use a distinct palette (indigo/cyan/orange/rose)
// from the Lead badges above (blue/amber/purple/teal/green/gray) so the two
// modules stay visually distinguishable at a glance.

const projectStatusStyles: Record<ProjectStatus, string> = {
  active: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  on_hold: "bg-orange-50 text-orange-700 ring-orange-600/20",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Base className={projectStatusStyles[status]}>{status.replace("_", " ")}</Base>;
}
