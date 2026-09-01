"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Database, RefreshCw, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { SyncBadge, SourceStatusBadge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { AddSourceFlow } from "./AddSourceFlow";
import * as api from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { SheetSource } from "@/lib/types";
import { formatDateTime, timeAgo } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

// Palette colors
const PALETTE = {
  blue: "#2E93D6",
  orange: "#F2591C",
  navy: "#0B2C5F",
  lightBlue: "#F3F8FB", // subtle bg
  lightNavy: "#E9EFF6", // fallback bg
};

export default function SourcesPage() {
  const { toast } = useToast();
  const [sources, setSources] = useState<SheetSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .getSources({})
      .then((res) => setSources(res.sources))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const syncNow = async (id: string) => {
    setSyncing(id);
    try {
      await api.syncSourceNow(id);
      toast("Sync started");
      setTimeout(load, 1800);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to start sync", "error");
    } finally {
      setSyncing(null);
    }
  };

  return (
    <AppShell title="Lead Sources">
      <div
        className="p-4 md:p-6 space-y-4"
        style={{
          background:
            "linear-gradient(135deg, #F3F8FB 0%, #E9EFF6 100%)",
          minHeight: "100vh",
        }}
      >
        <div className="flex items-center justify-between">
          <p
            className="text-sm"
            style={{ color: PALETTE.navy, opacity: 0.85 }}
          >
            Google Sheets registered as lead sources. Leads are pulled in automatically.
          </p>
          <Button
            onClick={() => setAddOpen(true)}
            style={{
              background: `linear-gradient(90deg, ${PALETTE.blue} 60%, ${PALETTE.orange} 100%)`,
              color: "#fff",
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add Source
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : sources.length === 0 ? (
          <EmptyState
            icon={Database}
            title="No sources added yet"
            description="Add your first Google Sheet to start importing leads automatically."
            action={
              <Button
                onClick={() => setAddOpen(true)}
                style={{
                  background: `linear-gradient(90deg, ${PALETTE.blue} 60%, ${PALETTE.orange} 100%)`,
                  color: "#fff",
                }}
              >
                <Plus className="h-3.5 w-3.5" /> Add your first Google Sheet
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((s) => (
              <div
                key={s._id}
                className="rounded-lg border p-4 flex flex-col shadow"
                style={{
                  background: "#fff",
                  borderColor: PALETTE.blue + "33",
                  boxShadow: `0 4px 12px -2px ${PALETTE.blue}10`,
                  color: PALETTE.navy,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3
                      className="text-sm font-semibold truncate"
                      style={{ color: PALETTE.navy }}
                    >
                      {s.name}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {s.tags.map((t, idx) => (
                        <span
                          key={t}
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            background: idx % 2 === 1 ? PALETTE.orange + "12" : PALETTE.blue + "10",
                            color: idx % 2 === 1 ? PALETTE.orange : PALETTE.blue,
                            border: `1px solid ${idx % 2 === 1 ? PALETTE.orange + "22" : PALETTE.blue + "22"}`,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <SourceStatusBadge status={s.status} />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <SyncBadge status={s.lastSyncStatus} />
                  <span
                    className="text-[11px]"
                    style={{ color: PALETTE.navy, opacity: 0.54 }}
                  >
                    {s.lastSyncAt ? timeAgo(s.lastSyncAt) : "never synced"}
                  </span>
                </div>
                {s.lastSyncError && (
                  <p
                    className="mt-1.5 text-[11px] line-clamp-2"
                    style={{ color: PALETTE.orange }}
                  >
                    {s.lastSyncError}
                  </p>
                )}

                <p className="mt-3 text-xs" style={{ color: PALETTE.navy, opacity: 0.77 }}>
                  <span className="font-semibold" style={{ color: PALETTE.navy }}>
                    {s.rowsImported}
                  </span>{" "}
                  rows imported
                </p>
                <p
                  className="text-[11px]"
                  title={formatDateTime(s.lastSyncAt)}
                  style={{ color: PALETTE.navy, opacity: 0.54 }}
                >
                  Syncs every {s.syncIntervalMinutes}m
                </p>

                <div
                  className="mt-4 flex items-center gap-2 pt-3 border-t"
                  style={{ borderColor: PALETTE.blue + "18" }}
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => syncNow(s._id)}
                    loading={syncing === s._id}
                    style={{
                      border: `1px solid ${PALETTE.orange}55`,
                      background: "white",
                      color: PALETTE.orange,
                    }}
                  >
                    <RefreshCw className="h-3 w-3" /> Sync now
                  </Button>
                  <Link
                    href={`/sources/detail/?id=${s._id}`}
                    className="ml-auto flex items-center gap-1 text-xs font-medium transition-colors"
                    style={{
                      color: PALETTE.blue,
                    }}
                  >
                    Details
                    <ArrowRight className="h-3 w-3" style={{ color: PALETTE.navy }} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Google Sheet Source" size="lg">
        <AddSourceFlow
          onSuccess={() => {
            setAddOpen(false);
            load();
          }}
        />
      </Modal>
    </AppShell>
  );
}
