"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  Plus,
  X,
  ExternalLink,
  FolderKanban,
  Mail,
  Phone,
} from "lucide-react";
import { ProjectStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import * as api from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { Project, ProjectStatus, User } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { TasksSection } from "./TasksSection";

const STATUSES: ProjectStatus[] = ["active", "on_hold", "completed", "cancelled"];
type Tab = "overview" | "doclinks" | "team" | "tasks";

export function ProjectDetailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.get("id");

  const [project, setProject] = useState<Project | null>(null);
  const [team, setTeam] = useState<Pick<User, "id" | "name" | "email" | "role">[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [savingField, setSavingField] = useState<string | null>(null);

  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [addingLink, setAddingLink] = useState(false);

  const [memberToAdd, setMemberToAdd] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    setLoading(true);
    Promise.all([api.getProject(id), api.getProjectTeam(id), api.getUsers()])
      .then(([p, t, u]) => {
        setProject(p);
        setTeam(t.team);
        setAllUsers(u.users);
        setName(p.name);
        setClientName(p.clientName);
        setClientEmail(p.clientEmail || "");
        setClientPhone(p.clientPhone || "");
        setDescription(p.description || "");
        setStartDate(p.startDate ? p.startDate.slice(0, 10) : "");
        setDueDate(p.dueDate ? p.dueDate.slice(0, 10) : "");
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (data: Partial<Project>, field: string) => {
    if (!project) return;
    setSavingField(field);
    try {
      const updated = await api.updateProject(project._id, data);
      setProject(updated);
      toast("Saved");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to save", "error");
    } finally {
      setSavingField(null);
    }
  };

  const addLink = async () => {
    if (!project || !linkLabel.trim() || !linkUrl.trim()) return;
    setAddingLink(true);
    try {
      const link = await api.addDocLink(project._id, {
        label: linkLabel.trim(),
        url: linkUrl.trim(),
      });
      setProject({ ...project, docLinks: [...project.docLinks, link] });
      setLinkLabel("");
      setLinkUrl("");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to add link", "error");
    } finally {
      setAddingLink(false);
    }
  };

  const removeLink = async (linkId: string) => {
    if (!project) return;
    try {
      await api.deleteDocLink(project._id, linkId);
      setProject({
        ...project,
        docLinks: project.docLinks.filter((d) => d._id !== linkId),
      });
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to remove link", "error");
    }
  };

  const addMember = async () => {
    if (!project || !memberToAdd) return;
    setAddingMember(true);
    try {
      const updated = await api.addProjectTeamMember(project._id, memberToAdd);
      setProject(updated);
      const t = await api.getProjectTeam(project._id);
      setTeam(t.team);
      setMemberToAdd("");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to add member", "error");
    } finally {
      setAddingMember(false);
    }
  };

  const removeMember = async (userId: string) => {
    if (!project) return;
    try {
      await api.removeProjectTeamMember(project._id, userId);
      setProject({
        ...project,
        teamMembers: project.teamMembers.filter((u) => u !== userId),
      });
      setTeam((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to remove member", "error");
    }
  };

  const doDelete = async () => {
    if (!project) return;
    setDeleting(true);
    try {
      const res = await api.deleteProject(project._id);
      toast(
        res.tasksDeleted
          ? `Project deleted — ${res.tasksDeleted} task(s) removed with it`
          : "Project deleted"
      );
      router.push("/projects/");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to delete project", "error");
      setDeleting(false);
    }
  };

  const memberOptions = allUsers.filter(
    (u) =>
      (u.role === "team_member" || u.role === "admin") &&
      !project?.teamMembers.includes(u.id)
  );

  if (loading) {
    return (
      <div className="p-6 space-y-3 max-w-4xl">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="p-6 max-w-4xl">
        <EmptyState
          icon={FolderKanban}
          title="Project not found"
          description="This project may have been deleted, or the link is invalid."
          action={
            <Link href="/projects/">
              <Button variant="secondary">Back to Projects</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl space-y-5">
      <button
        onClick={() => router.push("/projects/")}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
      </button>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => name !== project.name && name.trim() && patch({ name }, "name")}
              className="text-lg font-semibold border-transparent px-0 hover:border-slate-200 focus:border-slate-300"
            />
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
              {project.clientEmail && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {project.clientEmail}
                </span>
              )}
              {project.clientPhone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {project.clientPhone}
                </span>
              )}
              {project.sourceLeadId && (
                <Link
                  href={`/leads/detail/?id=${project.sourceLeadId}`}
                  className="text-slate-400 underline hover:text-slate-700"
                >
                  View source lead
                </Link>
              )}
            </div>
          </div>
          <Select
            value={project.status}
            disabled={savingField === "status"}
            onChange={(e) => patch({ status: e.target.value as ProjectStatus }, "status")}
            className="w-auto"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <p className="text-slate-400 mb-1">Client name</p>
            <Input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              onBlur={() =>
                clientName !== project.clientName &&
                clientName.trim() &&
                patch({ clientName }, "clientName")
              }
              className="h-8 text-xs"
            />
          </div>
          <div>
            <p className="text-slate-400 mb-1">Client email</p>
            <Input
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              onBlur={() =>
                clientEmail !== (project.clientEmail || "") &&
                patch({ clientEmail: clientEmail || null }, "clientEmail")
              }
              className="h-8 text-xs"
            />
          </div>
          <div>
            <p className="text-slate-400 mb-1">Start date</p>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onBlur={() =>
                patch(
                  { startDate: startDate ? new Date(startDate).toISOString() : null },
                  "startDate"
                )
              }
              className="h-8 text-xs"
            />
          </div>
          <div>
            <p className="text-slate-400 mb-1">Due date</p>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              onBlur={() =>
                patch({ dueDate: dueDate ? new Date(dueDate).toISOString() : null }, "dueDate")
              }
              className="h-8 text-xs"
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs text-slate-400 mb-1">Description</p>
          <Textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() =>
              description !== (project.description || "") &&
              patch({ description: description || null }, "description")
            }
          />
        </div>

        {project.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {(
          [
            ["overview", "Overview"],
            ["doclinks", `Doc Links (${project.docLinks.length})`],
            ["team", `Team (${project.teamMembers.length})`],
            ["tasks", "Tasks"],
          ] as [Tab, string][]
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

      {tab === "overview" && (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Created {formatDate(project.createdAt)} · last updated{" "}
            {formatDate(project.updatedAt)}
          </p>
          <div className="mt-4">
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete Project
            </Button>
          </div>
        </div>
      )}

      {tab === "doclinks" && (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Input
              placeholder="Label (e.g. Notion Workspace)"
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              className="sm:w-56"
            />
            <Input
              placeholder="https://…"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <Button
              onClick={addLink}
              loading={addingLink}
              disabled={!linkLabel.trim() || !linkUrl.trim()}
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
          {project.docLinks.length === 0 ? (
            <p className="text-xs text-slate-400">No doc links yet.</p>
          ) : (
            <div className="space-y-2">
              {project.docLinks.map((d) => (
                <div
                  key={d._id}
                  className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2"
                >
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-sm text-slate-700 hover:text-slate-900 hover:underline"
                  >
                    {d.label} <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    onClick={() => removeLink(d._id)}
                    className="text-slate-300 hover:text-red-500 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "team" && (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Select
              value={memberToAdd}
              onChange={(e) => setMemberToAdd(e.target.value)}
              className="sm:w-64"
            >
              <option value="">Select a team member or admin…</option>
              {memberOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.replace("_", " ")})
                </option>
              ))}
            </Select>
            <Button onClick={addMember} loading={addingMember} disabled={!memberToAdd}>
              <Plus className="h-3.5 w-3.5" /> Add to team
            </Button>
          </div>
          {team.length === 0 ? (
            <p className="text-xs text-slate-400">No team members assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {team.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{m.name}</p>
                      <p className="text-xs text-slate-400">
                        {m.email} · {m.role.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMember(m.id)}
                    className="text-slate-300 hover:text-red-500 shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "tasks" && <TasksSection project={project} team={team} />}

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Project" size="sm">
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong>{project.name}</strong>? All tasks
          under this project will also be removed.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={doDelete} loading={deleting}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
