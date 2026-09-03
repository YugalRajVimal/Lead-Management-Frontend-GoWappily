"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { TaskStatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import * as api from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { Priority, Task, TaskStatus, User } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

const STATUSES: TaskStatus[] = ["todo", "in_progress", "review", "done", "blocked"];
const PRIORITIES: Priority[] = ["low", "medium", "high"];

export function TaskDetailModal({
  task: initialTask,
  team,
  onClose,
  onChanged,
  onDeleted,
}: {
  task: Task;
  team: Pick<User, "id" | "name" | "email" | "role">[];
  onClose: () => void;
  onChanged: (task: Task) => void;
  onDeleted: (taskId: string) => void;
}) {
  const { toast } = useToast();
  const [task, setTask] = useState(initialTask);
  const [description, setDescription] = useState(task.description || "");
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : "");
  const [savingField, setSavingField] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const patch = async (data: Partial<Task>, field: string) => {
    setSavingField(field);
    try {
      const updated = await api.updateTask(task._id, data);
      setTask(updated);
      onChanged(updated);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to save", "error");
    } finally {
      setSavingField(null);
    }
  };

  const toggleAssignee = (id: string) => {
    const next = task.assignees.includes(id)
      ? task.assignees.filter((a) => a !== id)
      : [...task.assignees, id];
    patch({ assignees: next }, "assignees");
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    setAddingComment(true);
    try {
      const comment = await api.addTaskComment(task._id, commentText.trim());
      const updated = { ...task, comments: [comment, ...task.comments] };
      setTask(updated);
      onChanged(updated);
      setCommentText("");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to add comment", "error");
    } finally {
      setAddingComment(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await api.deleteTaskComment(task._id, commentId);
      const updated = {
        ...task,
        comments: task.comments.filter((c) => c._id !== commentId),
      };
      setTask(updated);
      onChanged(updated);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to delete comment", "error");
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteTask(task._id);
      toast("Task deleted");
      onDeleted(task._id);
      onClose();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to delete task", "error");
      setDeleting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={task.title} size="lg">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Select
            value={task.status}
            disabled={savingField === "status"}
            onChange={(e) => patch({ status: e.target.value as TaskStatus }, "status")}
            className="w-auto"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </Select>
          <Select
            value={task.priority}
            disabled={savingField === "priority"}
            onChange={(e) => patch({ priority: e.target.value as Priority }, "priority")}
            className="w-auto"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
          <div className="flex items-center gap-1.5">
            <TaskStatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() =>
              description !== (task.description || "") &&
              patch({ description: description || null }, "description")
            }
          />
        </div>

        <div>
          <Label>Due date</Label>
          <Input
            type="date"
            className="w-44"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            onBlur={() =>
              patch({ dueDate: dueDate ? new Date(dueDate).toISOString() : null }, "dueDate")
            }
          />
        </div>

        <div>
          <Label>Assignees</Label>
          <div className="flex flex-wrap gap-1.5">
            {team.length === 0 && (
              <p className="text-xs text-slate-400">No team members on this project.</p>
            )}
            {team.map((u) => (
              <button
                key={u.id}
                onClick={() => toggleAssignee(u.id)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
                  task.assignees.includes(u.id)
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Comments</Label>
          <div className="flex gap-2 mb-3">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment…"
              onKeyDown={(e) => e.key === "Enter" && addComment()}
            />
            <Button onClick={addComment} loading={addingComment} disabled={!commentText.trim()}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          {task.comments.length === 0 ? (
            <p className="text-xs text-slate-400">No comments yet.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {task.comments.map((c) => (
                <div
                  key={c._id}
                  className="flex items-start justify-between gap-2 rounded-md bg-slate-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm text-slate-700">{c.text}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {formatDateTime(c.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteComment(c._id)}
                    className="text-slate-300 hover:text-red-500 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          {confirmDelete ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600">Delete this task?</span>
              <Button variant="danger" size="sm" onClick={doDelete} loading={deleting}>
                Confirm
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete Task
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
