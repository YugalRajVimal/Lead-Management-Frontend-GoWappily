
"use client";

import { useCallback, useEffect, useState, useRef, useLayoutEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Trash2,
  Plus,
  Check,
  X as XIcon,
  Tag as TagIcon,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { EditLeadForm } from "../EditLeadForm";
import * as api from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { Lead, LeadStatus, Priority, User } from "@/lib/types";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

/**
 * Remove prefix "p:" from phone number if present
 */
function formatLeadPhone(phone: string = ""): string {
  if (!phone) return "";
  return phone.startsWith("p:") ? phone.slice(2) : phone;
}

const STATUSES: LeadStatus[] = [
  "new",
  "not contacted",
  "call later",
  "pitched",
  "quotation send",
  "follow up",
  "converted",
  "lost",
  "junk",
];
const PRIORITIES: Priority[] = ["low", "medium", "high"];

function getLongestText(options: string[]) {
  return options.reduce((a, b) => (a.length > b.length ? a : b), "");
}

// Deterministic avatar color from the GoWappily brand palette, hashed by name (matches Leads table).
const AVATAR_COLORS = [
  "bg-[#2E93D6]",
  "bg-[#F2591C]",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
];
function avatarColor(name: string) {
  const hash = (name || "?").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

const FOLLOWUP_STATUS_STYLES: Record<string, string> = {
  done: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  missed: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
};

// Formatting helpers for date and time
function formatOriginalDate(dateString?: string) {
  if (!dateString) return "";
  // Use browser locale for natural display
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}
function formatOriginalTime(dateString?: string) {
  if (!dateString) return "";
  // Use browser locale for natural display
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  // Display in short time format, e.g. 2:30 PM
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function LeadDetailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.get("id");

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const [fuDate, setFuDate] = useState("");
  const [fuNote, setFuNote] = useState("");
  const [addingFu, setAddingFu] = useState(false);

  const [remarks, setRemarks] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [projectName, setProjectName] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [savingField, setSavingField] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    api.getUsers().then((r) => setUsers(r.users ?? [])).catch(() => setUsers([]));
  }, []);

  // Refs for measuring status/prio select min widths
  const statusSelectRef = useRef<HTMLSelectElement>(null);
  const prioSelectRef = useRef<HTMLSelectElement>(null);

  // State for dynamic widths (default)
  const [statusWidth, setStatusWidth] = useState<string | undefined>();
  const [priorityWidth, setPriorityWidth] = useState<string | undefined>();

  // Calculate dropdown widths based on largest option and label
  useLayoutEffect(() => {
    // Helper to create a dummy offscreen select and measure max option width.
    function measureSelectWidth(optionLabels: string[], font: string) {
      const select = document.createElement("select");
      select.style.position = "absolute";
      select.style.visibility = "hidden";
      select.style.height = "auto";
      select.style.width = "auto";
      select.style.font = font;
      optionLabels.forEach(lab => {
        const opt = document.createElement("option");
        opt.text = lab;
        select.add(opt);
      });
      document.body.appendChild(select);
      // Add a character buffer for button/arrow
      const width = select.offsetWidth + 28;
      document.body.removeChild(select);
      return width;
    }

    if (statusSelectRef.current) {
      const font = getComputedStyle(statusSelectRef.current).font;
      // Rendered options for status
      const statusLabels: string[] = STATUSES.map(s => s.replace("_", " "));
      setStatusWidth(measureSelectWidth(statusLabels, font) + "px");
    }
    if (prioSelectRef.current) {
      const font = getComputedStyle(prioSelectRef.current).font;
      const prioLabels = ["No priority", ...PRIORITIES];
      setPriorityWidth(measureSelectWidth(prioLabels, font) + "px");
    }
  }, []);

  const load = useCallback(() => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    setLoading(true);
    api
      .getLead(id)
      .then((l) => {
        setLead(l);
        setRemarks(l.remarks || "");
        setNextAction(l.nextAction || "");
        setProjectName(l.projectName || "");
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (data: Partial<Lead>, field: string) => {
    if (!lead) return;
    setSavingField(field);
    try {
      const updated = await api.updateLead(lead._id, data);
      setLead(updated);
      toast("Saved");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to save", "error");
    } finally {
      setSavingField(null);
    }
  };

  const addNote = async () => {
    if (!lead || !noteText.trim()) return;
    setAddingNote(true);
    try {
      const note = await api.addNote(lead._id, noteText.trim());
      setLead({ ...lead, notes: [note, ...lead.notes] });
      setNoteText("");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to add note", "error");
    } finally {
      setAddingNote(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!lead) return;
    try {
      await api.deleteNote(lead._id, noteId);
      setLead({ ...lead, notes: lead.notes.filter((n) => n._id !== noteId) });
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to delete note", "error");
    }
  };

  const addFollowUp = async () => {
    if (!lead || !fuDate) return;
    setAddingFu(true);
    try {
      const fu = await api.addFollowUp(lead._id, {
        dueDate: new Date(fuDate).toISOString(),
        note: fuNote,
      });
      setLead({ ...lead, followUps: [fu, ...lead.followUps] });
      setFuDate("");
      setFuNote("");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to add follow-up", "error");
    } finally {
      setAddingFu(false);
    }
  };

  const updateFollowUp = async (
    fuId: string,
    data: Partial<{ status: "pending" | "done" | "missed"; dueDate: string; note: string }>
  ) => {
    if (!lead) return;
    try {
      const updated = await api.updateFollowUp(lead._id, fuId, data);
      setLead({
        ...lead,
        followUps: lead.followUps.map((f) => (f._id === fuId ? updated : f)),
      });
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to update follow-up", "error");
    }
  };

  const deleteFollowUp = async (fuId: string) => {
    if (!lead) return;
    try {
      await api.deleteFollowUp(lead._id, fuId);
      setLead({ ...lead, followUps: lead.followUps.filter((f) => f._id !== fuId) });
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to delete follow-up", "error");
    }
  };

  const addTag = () => {
    if (!lead || !tagInput.trim()) return;
    const tag = tagInput.trim();
    if (lead.tags.includes(tag)) {
      setTagInput("");
      return;
    }
    patch({ tags: [...lead.tags, tag] }, "tags");
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    if (!lead) return;
    patch({ tags: lead.tags.filter((t) => t !== tag) }, "tags");
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4 ">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (notFound || !lead) {
    return (
      <div className="p-6 ">
        <EmptyState
          icon={Phone}
          title="Lead not found"
          description="This lead may have been deleted, or the link is invalid."
          action={
            <Link href="/leads/">
              <Button variant="secondary">Back to Leads</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const initial = (lead.name || "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="p-4 md:p-6  space-y-5">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/leads/")}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#0B2C5F] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Leads
        </button>
        <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="h-3.5 w-3.5" /> Edit Lead
        </Button>
      </div>

      {/* Header */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {/* Brand gradient accent strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#2E93D6] to-[#F2591C]" />

        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`h-11 w-11 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold text-white ${avatarColor(
                  lead.name || "?"
                )}`}
              >
                {initial}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-semibold text-[#0B2C5F] truncate">{lead.name}</h2>
                  <StatusBadge status={lead.status} />
                  <PriorityBadge priority={lead.priority} />
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 whitespace-nowrap">
                    <Phone className="h-3.5 w-3.5 text-[#2E93D6]" /> {formatLeadPhone(lead.phone)}
                  </span>
                  {lead.whatsapp && (
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-500" /> {lead.whatsapp}
                    </span>
                  )}
                  {lead.email && (
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <Mail className="h-3.5 w-3.5 text-[#F2591C]" /> {lead.email}
                    </span>
                  )}
                  {lead.city && (
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" /> {lead.city}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex w-full md:w-auto md:flex-row flex-col gap-2">
              <Select
                value={lead.status}
                disabled={savingField === "status"}
                onChange={(e) => patch({ status: e.target.value as LeadStatus }, "status")}
                ref={statusSelectRef}
                // Dynamically set minWidth from the widest status option
                style={{
                  minWidth: statusWidth,
                }}
                className=" w-1/2 md:w-auto"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </Select>
              <Select
                value={lead.priority || ""}
                disabled={savingField === "priority"}
                onChange={(e) =>
                  patch(
                    { priority: (e.target.value || null) as Priority | null },
                    "priority"
                  )
                }
                ref={prioSelectRef}
                style={{
                  minWidth: priorityWidth,

                }}
                className="w-1/2 md:w-auto"
              >
                <option value="">No priority</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Show original date/time if present */}
          {lead.originalDate && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t border-slate-100 pt-4">
              <div>
                <p className="text-slate-400 mb-1">Lead Date</p>
                <div className="text-[#0B2C5F] font-medium flex flex-col">
                  <span>{formatOriginalDate(lead.originalDate)}</span>
                  <span className="text-xs text-slate-500">{formatOriginalTime(lead.originalDate)}</span>
                </div>
              </div>

              {/* The rest of the default grid fields follow */}
              <div>
                <p className="text-slate-400 mb-1">Project Name</p>
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onBlur={() =>
                    projectName !== (lead.projectName || "") &&
                    patch({ projectName: projectName || null }, "projectName")
                  }
                  placeholder="—"
                  className="w-full rounded border-0 bg-transparent p-0 text-[#0B2C5F] font-medium text-xs outline-none focus:ring-1 focus:ring-[#2E93D6]/40 focus:bg-slate-50 focus:px-1.5 focus:py-1 focus:rounded transition-all"
                />
              </div>
              <div>
                <p className="text-slate-400 mb-1">Service Interested</p>
                <p className="text-[#0B2C5F] font-medium">{lead.serviceInterested || "—"}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Expected Value</p>
                <p className="font-semibold text-emerald-600">{formatCurrency(lead.expectedValue)}</p>
              </div>
            </div>
          )}

          {/* If no originalDate, keep previous layout */}
          {!lead.originalDate && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t border-slate-100 pt-4">
              {/* <div>
                <p className="text-slate-400">Source</p>
                <p className="text-slate-700 font-medium">{lead.sourceSheetName || "Manual"}</p>
              </div>
              <div>
                <p className="text-slate-400">Campaign</p>
                <p className="text-slate-700 font-medium">{lead.campaign || "—"}</p>
              </div> */}
              <div>
                <p className="text-slate-400 mb-1">Project Name</p>
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onBlur={() =>
                    projectName !== (lead.projectName || "") &&
                    patch({ projectName: projectName || null }, "projectName")
                  }
                  placeholder="—"
                  className="w-full rounded border-0 bg-transparent p-0 text-[#0B2C5F] font-medium text-xs outline-none focus:ring-1 focus:ring-[#2E93D6]/40 focus:bg-slate-50 focus:px-1.5 focus:py-1 focus:rounded transition-all"
                />
              </div>
              <div>
                <p className="text-slate-400 mb-1">Service Interested</p>
                <p className="text-[#0B2C5F] font-medium">{lead.serviceInterested || "—"}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Expected Value</p>
                <p className="font-semibold text-emerald-600">{formatCurrency(lead.expectedValue)}</p>
              </div>
            </div>
          )}

          {lead.requirement && (
            <div className="mt-3 text-xs border-t border-slate-100 pt-3">
              <p className="text-slate-400 mb-1">Requirement</p>
              <p className="text-slate-600">{lead.requirement}</p>
            </div>
          )}

          {/* Tags */}
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400 mb-1.5 flex items-center gap-1">
              <TagIcon className="h-3 w-3" /> Tags
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              {lead.tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 rounded-full bg-[#2E93D6]/10 px-2.5 py-1 text-xs font-medium text-[#2E93D6]"
                >
                  #{t}
                  <button onClick={() => removeTag(t)} className="text-[#2E93D6]/60 hover:text-[#2E93D6]">
                    <XIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="+ add tag"
                className="w-24 rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-xs outline-none focus:border-[#2E93D6]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Remarks & Next action */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-100 bg-white shadow-sm p-4">
          <Label>Remarks</Label>
          <Textarea
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            onBlur={() => remarks !== (lead.remarks || "") && patch({ remarks }, "remarks")}
          />
        </div>
        <div className="rounded-xl border border-slate-100 bg-white shadow-sm p-4">
          <Label>Next Action</Label>
          <Textarea
            rows={3}
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            onBlur={() =>
              nextAction !== (lead.nextAction || "") && patch({ nextAction }, "nextAction")
            }
          />
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm p-4">
        <h3 className="text-sm font-semibold text-[#0B2C5F] mb-3">Project Details</h3>
        <div className="flex gap-2 mb-3">
          <Input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add project details…"
            onKeyDown={(e) => e.key === "Enter" && addNote()}
          />
          <Button onClick={addNote} loading={addingNote} disabled={!noteText.trim()}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        {lead.notes.length === 0 ? (
          <p className="text-xs text-slate-400">No project details yet.</p>
        ) : (
          <div className="space-y-2.5">
            {lead.notes.map((n) => (
              <div
                key={n._id}
                className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 border-l-2 border-[#2E93D6]/40 px-3 py-2"
              >
                <div>
                  <p className="text-sm text-slate-700">{n.text}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {formatDateTime(n.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => deleteNote(n._id)}
                  className="text-slate-300 hover:text-rose-500 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Follow-ups */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm p-4">
        <h3 className="text-sm font-semibold text-[#0B2C5F] mb-3">Follow-ups</h3>
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <Input
            type="datetime-local"
            value={fuDate}
            onChange={(e) => setFuDate(e.target.value)}
            className="sm:w-56"
          />
          <Input
            value={fuNote}
            onChange={(e) => setFuNote(e.target.value)}
            placeholder="Follow-up note"
          />
          <Button onClick={addFollowUp} loading={addingFu} disabled={!fuDate}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
        {lead.followUps.length === 0 ? (
          <p className="text-xs text-slate-400">No follow-ups scheduled.</p>
        ) : (
          <div className="space-y-2">
            {lead.followUps.map((f) => (
              <div
                key={f._id}
                className={`flex items-center justify-between gap-2 rounded-lg bg-slate-50 border-l-2 px-3 py-2 ${
                  f.status === "done"
                    ? "border-emerald-400"
                    : f.status === "missed"
                    ? "border-rose-400"
                    : "border-amber-400"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#0B2C5F]">
                      {formatDateTime(f.dueDate)}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${FOLLOWUP_STATUS_STYLES[f.status]}`}
                    >
                      {f.status}
                    </span>
                  </div>
                  {f.note && <p className="text-xs text-slate-500 mt-0.5">{f.note}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {f.status !== "done" && (
                    <button
                      onClick={() => updateFollowUp(f._id, { status: "done" })}
                      title="Mark done"
                      className="text-slate-400 hover:text-emerald-600 p-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteFollowUp(f._id)}
                    title="Delete"
                    className="text-slate-300 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Lead">
        <EditLeadForm
          lead={lead}
          users={users}
          onCancel={() => setEditOpen(false)}
          onSuccess={(updated) => {
            setLead(updated);
            setRemarks(updated.remarks || "");
            setNextAction(updated.nextAction || "");
            setProjectName((updated as any).projectName || "");
            setEditOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}