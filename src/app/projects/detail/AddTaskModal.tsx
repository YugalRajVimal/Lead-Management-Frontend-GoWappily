"use client";

import { useState } from "react";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import * as api from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { Priority, User } from "@/lib/types";
import { useToast } from "@/hooks/useToast";

export function AddTaskModal({
  projectId,
  team,
  onSuccess,
}: {
  projectId: string;
  team: Pick<User, "id" | "name" | "email" | "role">[];
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignees, setAssignees] = useState<string[]>([]);
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleAssignee = (id: string) => {
    setAssignees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const submit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await api.createTask({
        projectId,
        title: title.trim(),
        description: description || null,
        assignees,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
      toast("Task created");
      onSuccess();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to create task", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3.5">
      <div>
        <Label>Title *</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Priority</Label>
          <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </Select>
        </div>
        <div>
          <Label>Due date</Label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Assignees</Label>
        {team.length === 0 ? (
          <p className="text-xs text-slate-400">
            No team members on this project yet — add some from the Team tab first.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {team.map((u) => (
              <button
                key={u.id}
                onClick={() => toggleAssignee(u.id)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
                  assignees.includes(u.id)
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end pt-2">
        <Button onClick={submit} loading={submitting} disabled={!title.trim()}>
          Create Task
        </Button>
      </div>
    </div>
  );
}
