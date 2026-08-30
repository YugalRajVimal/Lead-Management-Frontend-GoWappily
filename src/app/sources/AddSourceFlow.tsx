"use client";

import { useEffect, useState } from "react";
import { AlertCircle, X, Plus } from "lucide-react";
import { Input, Label } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import * as api from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { ColumnMapping, SourcePreviewResponse } from "@/lib/types";
import { useToast } from "@/hooks/useToast";

const FIELD_LABELS: { key: keyof ColumnMapping; label: string; required?: boolean }[] = [
  { key: "name", label: "Name", required: true },
  { key: "phone", label: "Phone", required: true },
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

export function AddSourceFlow({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [sheetUrl, setSheetUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [preview, setPreview] = useState<SourcePreviewResponse | null>(null);
  const [mapping, setMapping] = useState<Partial<ColumnMapping>>({});
  const [syncInterval, setSyncInterval] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!sheetUrl || step !== 1) return;
    const t = setTimeout(() => {
      setPreviewLoading(true);
      setPreviewError(null);
      api
        .previewSource(sheetUrl)
        .then((res) => {
          setPreview(res);
          setMapping(res.detectedMapping);
        })
        .catch((err) => {
          setPreview(null);
          setPreviewError(
            err instanceof ApiError ? err.message : "Failed to preview sheet"
          );
        })
        .finally(() => setPreviewLoading(false));
    }, 500);
    return () => clearTimeout(t);
  }, [sheetUrl, step]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const canProceed = name.trim() && preview && !previewError;

  const submit = async () => {
    if (!preview) return;
    setSubmitting(true);
    try {
      await api.createSource({
        name: name.trim(),
        sheetUrl,
        tags,
        columnMapping: mapping as ColumnMapping,
        syncIntervalMinutes: syncInterval,
      });
      toast("Source added — initial sync started");
      onSuccess();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to add source", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 1) {
    return (
      <div className="space-y-4">
        <div>
          <Label>Sheet name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. August FB Sheet"
          />
        </div>
        <div>
          <Label>Google Sheets URL</Label>
          <Input
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/…"
          />
          {previewLoading && (
            <p className="mt-1.5 text-xs text-slate-400">Checking sheet…</p>
          )}
          {previewError && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5" /> {previewError}
            </p>
          )}
          {preview && !previewError && (
            <p className="mt-1.5 text-xs text-green-600">
              Found {preview.headers.length} columns — ready to map.
            </p>
          )}
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
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              placeholder="+ add tag, press Enter"
              className="w-40"
            />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={() => setStep(2)} disabled={!canProceed}>
            Next: Map Columns
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        We detected these column mappings automatically. Review and adjust, then
        check the sample rows below to sanity-check.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FIELD_LABELS.map(({ key, label, required }) => {
          const isUnmapped = !mapping[key];
          return (
            <div key={key}>
              <Label>
                {label} {required && <span className="text-red-500">*</span>}
                {isUnmapped && !required && (
                  <span className="ml-1.5 text-[10px] font-normal text-amber-600">
                    unmapped
                  </span>
                )}
              </Label>
              <Select
                value={mapping[key] || ""}
                onChange={(e) =>
                  setMapping((m) => ({ ...m, [key]: e.target.value || null }))
                }
                className={isUnmapped ? "border-amber-300" : ""}
              >
                <option value="">— not mapped —</option>
                {preview?.headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </Select>
            </div>
          );
        })}
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

      {preview?.sampleRows && preview.sampleRows.length > 0 && (
        <div>
          <Label>Sample rows preview</Label>
          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="text-xs w-full">
              <thead>
                <tr className="bg-slate-50">
                  {preview.headers.map((h) => (
                    <th key={h} className="px-2.5 py-1.5 text-left font-medium text-slate-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.sampleRows.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {preview.headers.map((h) => (
                      <td key={h} className="px-2.5 py-1.5 whitespace-nowrap text-slate-600">
                        {row[h] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="secondary" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button
          onClick={submit}
          loading={submitting}
          disabled={!mapping.name || !mapping.phone}
        >
          <Plus className="h-3.5 w-3.5" /> Add Source
        </Button>
      </div>
    </div>
  );
}
