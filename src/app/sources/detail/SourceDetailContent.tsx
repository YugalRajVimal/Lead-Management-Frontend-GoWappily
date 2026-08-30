"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Trash2, Pause, Play, X, AlertCircle } from "lucide-react";
import { SyncBadge, SourceStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import * as api from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { ColumnMapping, SheetSource } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { Database } from "lucide-react";

const FIELD_LABELS: { key: keyof ColumnMapping; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "phone", label: "Phone" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "city", label: "City" },
  { key: "date", label: "Date" },
  { key: "priority", label: "Priority" },
  { key: "source", label: "Source" },
  { key: "campaign", label: "Campaign" },
  { key: "serviceInterested", label: "Service Interested" },
  { key: "requirement", label: "Requirement" },
  { key: "leadStatus", label: "Lead Status" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "followUpDate", label: "Follow-up Date" },
  { key: "lastFollowUp", label: "Last Follow-up" },
  { key: "nextAction", label: "Next Action" },
  { key: "expectedValue", label: "Expected Value" },
  { key: "remarks", label: "Remarks" },
];

export function SourceDetailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.get("id");

  const [source, setSource] = useState<SheetSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [syncInterval, setSyncInterval] = useState(30);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    setLoading(true);
    api
      .getSource(id)
      .then((s) => {
        setSource(s);
        setName(s.name);
        setTags(s.tags);
        setSyncInterval(s.syncIntervalMinutes);
        setMapping(s.columnMapping);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const syncNow = async () => {
    if (!source) return;
    setSyncing(true);
    try {
      await api.syncSourceNow(source._id);
      toast("Sync started");
      setTimeout(load, 1800);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to sync", "error");
    } finally {
      setSyncing(false);
    }
  };

  const togglePause = async () => {
    if (!source) return;
    try {
      const updated = await api.updateSource(source._id, {
        status: source.status === "paused" ? "active" : "paused",
      });
      setSource(updated);
      toast(updated.status === "paused" ? "Source paused" : "Source resumed");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to update", "error");
    }
  };

  const saveSettings = async () => {
    if (!source || !mapping) return;
    setSaving(true);
    try {
      const updated = await api.updateSource(source._id, {
        name,
        tags,
        columnMapping: mapping,
        syncIntervalMinutes: syncInterval,
      });
      setSource(updated);
      toast("Source updated");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to update", "error");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!source) return;
    setDeleting(true);
    try {
      await api.deleteSource(source._id);
      toast("Source deleted");
      router.push("/sources/");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to delete", "error");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3 max-w-3xl">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (notFound || !source) {
    return (
      <div className="p-6 max-w-3xl">
        <EmptyState
          icon={Database}
          title="Source not found"
          description="This source may have been deleted, or the link is invalid."
          action={
            <Link href="/sources/">
              <Button variant="secondary">Back to Sources</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl space-y-5">
      <button
        onClick={() => router.push("/sources/")}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Sources
      </button>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{source.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5 break-all">{source.sheetUrl}</p>
          </div>
          <div className="flex items-center gap-2">
            <SourceStatusBadge status={source.status} />
            <SyncBadge status={source.lastSyncStatus} />
          </div>
        </div>

        {source.lastSyncError && (
          <p className="mt-3 flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {source.lastSyncError}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <p className="text-slate-400">Last synced</p>
            <p className="text-slate-700 font-medium">{formatDateTime(source.lastSyncAt)}</p>
          </div>
          <div>
            <p className="text-slate-400">Rows imported</p>
            <p className="text-slate-700 font-medium">{source.rowsImported}</p>
          </div>
          <div>
            <p className="text-slate-400">Sync interval</p>
            <p className="text-slate-700 font-medium">{source.syncIntervalMinutes}m</p>
          </div>
          <div>
            <p className="text-slate-400">Created</p>
            <p className="text-slate-700 font-medium">{formatDateTime(source.createdAt)}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={syncNow} loading={syncing}>
            <RefreshCw className="h-3.5 w-3.5" /> Sync now
          </Button>
          <Button variant="secondary" size="sm" onClick={togglePause}>
            {source.status === "paused" ? (
              <>
                <Play className="h-3.5 w-3.5" /> Resume
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5" /> Pause
              </>
            )}
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="ml-auto"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete Source
          </Button>
        </div>
      </div>

      {/* Editable settings */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">Settings</h3>
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Tags</Label>
          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
              >
                {t}
                <button
                  onClick={() => setTags(tags.filter((x) => x !== t))}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const t = tagInput.trim();
                  if (t && !tags.includes(t)) setTags([...tags, t]);
                  setTagInput("");
                }
              }}
              placeholder="+ add tag, press Enter"
              className="w-40"
            />
          </div>
        </div>
        <div>
          <Label>Sync interval (minutes)</Label>
          <Input
            type="number"
            min={5}
            value={syncInterval}
            onChange={(e) => setSyncInterval(Number(e.target.value))}
            className="w-32"
          />
        </div>

        <div>
          <Label>Column mapping</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            {mapping &&
              FIELD_LABELS.map(({ key, label }) => (
                <div key={key}>
                  <label className="mb-1 block text-[11px] text-slate-500">{label}</label>
                  <Input
                    value={mapping[key] || ""}
                    onChange={(e) =>
                      setMapping((m) => (m ? { ...m, [key]: e.target.value || null } : m))
                    }
                    placeholder="sheet column header"
                  />
                </div>
              ))}
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button onClick={saveSettings} loading={saving}>
            Save Changes
          </Button>
        </div>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Source" size="sm">
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong>{source.name}</strong>? Future
          syncing will stop, but leads already imported from this source will{" "}
          <strong>not</strong> be deleted.
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
