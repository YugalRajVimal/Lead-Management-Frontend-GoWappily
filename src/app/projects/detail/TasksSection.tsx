"use client";

// Placeholder for Epic 3 (kanban/list of tasks scoped to this project).
// Kept as its own component so Epic 3 can replace the body without touching
// ProjectDetailContent.tsx.

import { ListTodo } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Project, User } from "@/lib/types";

export function TasksSection({
  project,
}: {
  project: Project;
  team: Pick<User, "id" | "name" | "email" | "role">[];
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <EmptyState
        icon={ListTodo}
        title="Tasks coming in Epic 3"
        description={`This will be a kanban/list view of tasks for "${project.name}", scoped to its team members.`}
      />
    </div>
  );
}
