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

// Logo palette
const PALETTE = {
  blue: "#2E93D6",
  orange: "#F2591C",
  navy: "#0B2C5F"
};

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

// Mapping rules: columnMappingKey -> Array of preferred sheet column names (in priority order)
const AUTO_MAP_RULES: Record<keyof ColumnMapping, string[]> = {
  name: ["full_name"],
  phone: ["phone_number"],
  whatsapp: ["phone_number"],
  email: ["email"],
  city: ["city"],
  date: ["created_time"],
  priority: [],
  source: ["platform"],
  campaign: ["campaign_name"],
  serviceInterested: ["what_type_of_website_do_you_need?"],
  requirement: ["what_type_of_website_do_you_need?"],
  leadStatus: ["lead_status"],
  assignedTo: [],
  followUpDate: [],
  lastFollowUp: [],
  nextAction: [],
  expectedValue: ["what_is_your_approximate_budget_for_the_website?"],
  remarks: [],
};

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

  // Utility: auto-map based on rules and available headers
  function getAutoMappedColumnMapping(res: SourcePreviewResponse): Partial<ColumnMapping> {
    const detected = { ...(res.detectedMapping || {}) };
    const headers = res.headers || [];
    const mapping: Partial<ColumnMapping> = { ...detected };

    (Object.keys(AUTO_MAP_RULES) as (keyof ColumnMapping)[]).forEach((key) => {
      // Only map if not already mapped by API (res.detectedMapping)
      if (!mapping[key]) {
        // Find, in order, the first header present for this key
        for (const candidate of AUTO_MAP_RULES[key]) {
          // comparison should be case-insensitive and ignore extra whitespace
          const found = headers.find(
            (hdr) => hdr.trim().toLowerCase() === candidate.trim().toLowerCase()
          );
          if (found) {
            mapping[key] = found;
            break;
          }
        }
      }
    });

    return mapping;
  }

  useEffect(() => {
    if (!sheetUrl || step !== 1) return;
    const t = setTimeout(() => {
      setPreviewLoading(true);
      setPreviewError(null);
      api
        .previewSource(sheetUrl)
        .then((res) => {
          setPreview(res);
          // Use auto mapping after detectedMapping
          setMapping(getAutoMappedColumnMapping(res));
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
      <div
        className="space-y-5 rounded-xl shadow-lg p-6"
        style={{
          background: `linear-gradient(135deg, #F3F8FB 55%, #E9EFF6 100%)`, // Match app shell
          border: `1.5px solid ${PALETTE.blue}`,
        }}
      >
        <div>
          <Label className="text-[13px] text-[#0B2C5F] font-bold tracking-wide">Sheet name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. August FB Sheet"
            className="border-[#2E93D6] focus:border-[#F2591C] focus:ring-[#2E93D6]/20 bg-white text-[#0B2C5F] font-medium"
          />
        </div>
        <div>
          <Label className="text-[13px] text-[#0B2C5F] font-bold tracking-wide">Google Sheets URL</Label>
          <Input
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/…"
            className="border-[#2E93D6] focus:border-[#F2591C] focus:ring-[#2E93D6]/20 bg-white text-[#0B2C5F] font-medium"
          />
          {previewLoading && (
            <p className="mt-1.5 text-xs text-[#2E93D6]/70 font-semibold">
              Checking sheet…
            </p>
          )}
          {previewError && (
            <p className="mt-1.5 flex items-center gap-1 text-xs" style={{ color: PALETTE.orange }}>
              <AlertCircle className="h-3.5 w-3.5" /> {previewError}
            </p>
          )}
          {preview && !previewError && (
            <p className="mt-1.5 text-xs font-semibold" style={{ color: PALETTE.blue }}>
              Found {preview.headers.length} columns — ready to map.
            </p>
          )}
        </div>
        <div>
          <Label className="text-[13px] text-[#0B2C5F] font-bold tracking-wide">Tags</Label>
          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
                style={{
                  background: `${PALETTE.blue}14`,
                  color: PALETTE.navy,
                  border: `1px solid ${PALETTE.blue}44`,
                }}
              >
                {t}
                <button
                  onClick={() => setTags(tags.filter((x) => x !== t))}
                  className="text-[#2E93D6] hover:text-[#F2591C]"
                  style={{ marginLeft: "2px" }}
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
              className="w-40 border-[#2E93D6] focus:border-[#F2591C] text-[#0B2C5F]"
              style={{ background: "#F3F8FB" }}
            />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button
            onClick={() => setStep(2)}
            disabled={!canProceed}
            className="bg-[#2E93D6] hover:bg-[#0B2C5F] border-0 text-white font-semibold"
            style={{
              boxShadow: "0 1.5px 7px 0 #2e93d61a",
            }}
          >
            Next: Map Columns
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-5 rounded-xl shadow-lg p-6"
      style={{
        background: `linear-gradient(135deg, #F3F8FB 55%, #E9EFF6 100%)`,
        border: `1.5px solid ${PALETTE.blue}`,
      }}
    >
      <p className="text-sm" style={{ color: PALETTE.navy }}>
        We detected these column mappings automatically. Review and adjust, then
        check the sample rows below to sanity-check.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FIELD_LABELS.map(({ key, label, required }) => {
          const isUnmapped = !mapping[key];
          return (
            <div key={key}>
              <Label className="text-[#0B2C5F] font-bold">
                {label} {required && <span className="text-[#F2591C]">*</span>}
                {isUnmapped && !required && (
                  <span className="ml-1.5 text-[10px] font-normal" style={{ color: PALETTE.orange }}>
                    unmapped
                  </span>
                )}
              </Label>
              <Select
                value={mapping[key] || ""}
                onChange={(e) =>
                  setMapping((m) => ({ ...m, [key]: e.target.value || null }))
                }
                className={isUnmapped ? "" : ""}
                style={{
                  borderColor: isUnmapped ? PALETTE.orange : PALETTE.blue,
                  background: "#fff",
                  color: PALETTE.navy,
                  fontWeight: 500,
                }}
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
        <Label className="text-[#0B2C5F] font-bold">Sync interval (minutes)</Label>
        <Input
          type="number"
          min={5}
          value={syncInterval}
          onChange={(e) => setSyncInterval(Number(e.target.value))}
          className="w-32 border-[#2E93D6] focus:border-[#F2591C] text-[#0B2C5F] font-bold"
          style={{ background: "#F3F8FB" }}
        />
      </div>

      {preview?.sampleRows && preview.sampleRows.length > 0 && (
        <div>
          <Label className="text-[#0B2C5F] font-bold">Sample rows preview</Label>
          <div
            className="overflow-x-auto rounded-md"
            style={{
              border: `1px solid ${PALETTE.blue}33`,
              boxShadow: "0 1px 2px 0 #2e93d617",
            }}
          >
            <table className="text-xs w-full" style={{ background: "#fff", color: PALETTE.navy }}>
              <thead>
                <tr style={{ background: "#E9EFF6" }}>
                  {preview.headers.map((h) => (
                    <th
                      key={h}
                      className="px-2.5 py-1.5 text-left font-bold whitespace-nowrap"
                      style={{ color: PALETTE.blue }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.sampleRows.map((row, i) => (
                  <tr key={i}>
                    {preview.headers.map((h) => (
                      <td
                        key={h}
                        className="px-2.5 py-1.5 whitespace-nowrap"
                        style={{ color: PALETTE.navy, background: i % 2 === 0 ? "#F3F8FB" : "#fff" }}
                      >
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
        <Button
          variant="secondary"
          onClick={() => setStep(1)}
          className="border-0 font-semibold text-[#2E93D6] hover:bg-[#2E93D6]/10 hover:text-[#0B2C5F]"
        >
          Back
        </Button>
        <Button
          onClick={submit}
          loading={submitting}
          disabled={!mapping.name || !mapping.phone}
          className="bg-[#2E93D6] hover:bg-[#0B2C5F] border-0 text-white font-semibold flex items-center gap-2"
          style={{
            boxShadow: "0 1.5px 7px 0 #2e93d61a"
          }}
        >
          <Plus className="h-3.5 w-3.5" /> Add Source
        </Button>
      </div>
    </div>
  );
}
