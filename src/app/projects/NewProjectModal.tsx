"use client";

import { useEffect, useState } from "react";
import { Search, ArrowRight, ArrowLeft } from "lucide-react";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import * as api from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { Lead, User } from "@/lib/types";
import { useToast } from "@/hooks/useToast";

type Mode = "choose" | "manual" | "convert";

export function NewProjectModal({
  users,
  onSuccess,
}: {
  users: User[];
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("choose");

  // Manual entry state
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Convert-from-lead state
  const [leadSearch, setLeadSearch] = useState("");
  const [leadResults, setLeadResults] = useState<Lead[]>([]);
  const [leadLoading, setLeadLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [projectNameOverride, setProjectNameOverride] = useState("");

  const teamOptions = users.filter((u) => u.role === "team_member" || u.role === "admin");

  useEffect(() => {
    if (mode !== "convert" || selectedLead) return;
    setLeadLoading(true);
    const t = setTimeout(() => {
      api
        .getLeads({ search: leadSearch, limit: 8 })
        .then((res) => setLeadResults(res.leads))
        .finally(() => setLeadLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [leadSearch, mode, selectedLead]);

  const toggleTeamMember = (id: string) => {
    setTeamMembers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const submitManual = async () => {
    setSubmitting(true);
    try {
      await api.createProject({
        name,
        clientName,
        clientEmail: clientEmail || null,
        clientPhone: clientPhone || null,
        description: description || null,
        teamMembers,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      toast("Project created");
      onSuccess();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to create project", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const submitConvert = async () => {
    if (!selectedLead) return;
    setSubmitting(true);
    try {
      await api.createProjectFromLead(selectedLead._id, {
        name: projectNameOverride || undefined,
        teamMembers,
      });
      toast("Project created from lead");
      onSuccess();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to convert lead", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === "choose") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => setMode("manual")}
          className="rounded-lg border border-slate-200 p-4 text-left hover:border-slate-400 hover:bg-slate-50"
        >
          <p className="text-sm font-semibold text-slate-900">Manual entry</p>
          <p className="mt-1 text-xs text-slate-500">
            Start a project from scratch with client details you type in.
          </p>
        </button>
        <button
          onClick={() => setMode("convert")}
          className="rounded-lg border border-slate-200 p-4 text-left hover:border-slate-400 hover:bg-slate-50"
        >
          <p className="text-sm font-semibold text-slate-900">Convert from Lead</p>
          <p className="mt-1 text-xs text-slate-500">
            Pick an existing lead — client name/email/phone are pre-filled.
          </p>
        </button>
      </div>
    );
  }

  if (mode === "manual") {
    return (
      <div className="space-y-3.5">
        <button
          onClick={() => setMode("choose")}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3 w-3" /> Back
        </button>
        <div>
          <Label>Project name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label>Client name *</Label>
            <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div>
            <Label>Client email</Label>
            <Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
          </div>
          <div>
            <Label>Client phone</Label>
            <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Start date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label>Due date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Tags (comma separated)</Label>
          <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="website, priority" />
        </div>
        <div>
          <Label>Team members</Label>
          <div className="flex flex-wrap gap-1.5">
            {teamOptions.map((u) => (
              <button
                key={u.id}
                onClick={() => toggleTeamMember(u.id)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
                  teamMembers.includes(u.id)
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={submitManual} loading={submitting} disabled={!name || !clientName}>
            Create Project
          </Button>
        </div>
      </div>
    );
  }

  // mode === "convert"
  return (
    <div className="space-y-3.5">
      <button
        onClick={() => {
          setMode("choose");
          setSelectedLead(null);
        }}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3 w-3" /> Back
      </button>

      {!selectedLead ? (
        <>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search leads by name, phone, email…"
              className="pl-8"
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
            />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {leadLoading && <p className="text-xs text-slate-400 py-4 text-center">Searching…</p>}
            {!leadLoading && leadResults.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center">No leads found.</p>
            )}
            {leadResults.map((l) => (
              <button
                key={l._id}
                onClick={() => {
                  setSelectedLead(l);
                  setProjectNameOverride(`${l.name} Project`);
                }}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-slate-50 border border-transparent hover:border-slate-200"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{l.name}</p>
                  <p className="text-xs text-slate-400">
                    {l.phone} {l.email ? `· ${l.email}` : ""}
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="rounded-md bg-slate-50 px-3 py-2.5 text-sm">
            <p className="font-medium text-slate-800">{selectedLead.name}</p>
            <p className="text-xs text-slate-500">
              {selectedLead.phone} {selectedLead.email ? `· ${selectedLead.email}` : ""}
            </p>
            <button
              onClick={() => setSelectedLead(null)}
              className="mt-1 text-xs text-slate-400 hover:text-slate-700 underline"
            >
              Choose a different lead
            </button>
          </div>
          <div>
            <Label>Project name</Label>
            <Input
              value={projectNameOverride}
              onChange={(e) => setProjectNameOverride(e.target.value)}
            />
          </div>
          <div>
            <Label>Team members</Label>
            <div className="flex flex-wrap gap-1.5">
              {teamOptions.map((u) => (
                <button
                  key={u.id}
                  onClick={() => toggleTeamMember(u.id)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
                    teamMembers.includes(u.id)
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {u.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={submitConvert} loading={submitting}>
              Create Project from Lead
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
