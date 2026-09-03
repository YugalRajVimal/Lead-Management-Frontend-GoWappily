"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, ListTodo, LayoutGrid, List as ListIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { TaskStatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { AddTaskModal } from "./AddTaskModal";
import { TaskDetailModal } from "./TaskDetailModal";
import * as api from "@/lib/api-client";
import { Project, Task, TaskStatus, User } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
  { key: "blocked", label: "Blocked" },
];

export function TasksSection({
  project,
  team,
}: {
  project: Project;
  team: Pick<User, "id" | "name" | "email" | "role">[];
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [statusFilter, setStatusFilter] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .getTasks({ projectId: project._id })
      .then((res) => setTasks(res.tasks))
      .finally(() => setLoading(false));
  }, [project._id]);

  useEffect(() => {
    load();
  }, [load]);

  const memberName = (id: string) => team.find((u) => u.id === id)?.name || "?";

  const visibleTasks = statusFilter
    ? tasks.filter((t) => t.status === statusFilter)
    : tasks;

  const TaskCard = ({ task }: { task: Task }) => (
    <button
      onClick={() => setActiveTask(task)}
      className="w-full text-left rounded-md border border-slate-200 bg-white p-3 hover:border-slate-300 hover:shadow-sm transition-all"
    >
      <p className="text-sm font-medium text-slate-800 line-clamp-2">{task.title}</p>
      <div className="mt-2 flex items-center justify-between">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className="text-[11px] text-slate-400">{formatDate(task.dueDate)}</span>
        )}
      </div>
      {task.assignees.length > 0 && (
        <div className="mt-2 flex -space-x-1.5">
          {task.assignees.map((a) => (
            <div
              key={a}
              title={memberName(a)}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-semibold text-indigo-700 ring-2 ring-white"
            >
              {memberName(a).charAt(0)}
            </div>
          ))}
        </div>
      )}
    </button>
  );

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-slate-200 p-0.5">
            <button
              onClick={() => setView("kanban")}
              className={`rounded px-2 py-1 ${
                view === "kanban" ? "bg-slate-900 text-white" : "text-slate-500"
              }`}
              title="Kanban view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`rounded px-2 py-1 ${
                view === "list" ? "bg-slate-900 text-white" : "text-slate-500"
              }`}
              title="List view"
            >
              <ListIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          {view === "list" && (
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-auto"
            >
              <option value="">All statuses</option>
              {COLUMNS.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </Select>
          )}
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Add Task
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks yet"
          description="Add the first task for this project."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Add Task
            </Button>
          }
        />
      ) : view === "kanban" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-600">{col.label}</p>
                  <span className="text-[11px] text-slate-400">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map((t) => (
                    <TaskCard key={t._id} task={t} />
                  ))}
                  {colTasks.length === 0 && (
                    <p className="text-[11px] text-slate-300 py-3 text-center border border-dashed border-slate-200 rounded-md">
                      —
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {visibleTasks.map((t) => (
            <button
              key={t._id}
              onClick={() => setActiveTask(t)}
              className="flex w-full items-center justify-between gap-3 rounded-md border border-slate-100 px-3 py-2.5 hover:border-slate-300 hover:bg-slate-50 text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                <p className="text-xs text-slate-400">
                  {t.assignees.length > 0
                    ? t.assignees.map(memberName).join(", ")
                    : "Unassigned"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <PriorityBadge priority={t.priority} />
                <TaskStatusBadge status={t.status} />
                {t.dueDate && (
                  <span className="text-[11px] text-slate-400 w-16 text-right">
                    {formatDate(t.dueDate)}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Task">
        <AddTaskModal
          projectId={project._id}
          team={team}
          onSuccess={() => {
            setAddOpen(false);
            load();
          }}
        />
      </Modal>

      {activeTask && (
        <TaskDetailModal
          task={activeTask}
          team={team}
          onClose={() => setActiveTask(null)}
          onChanged={(updated) =>
            setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))
          }
          onDeleted={(id) => setTasks((prev) => prev.filter((t) => t._id !== id))}
        />
      )}
    </div>
  );
}
