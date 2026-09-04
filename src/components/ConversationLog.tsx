"use client";

// Shared component — Phase 4 Epic 1. Reused as-is on both the Lead detail
// page (Epic 2) and the Project detail page (Epic 3); nothing here is
// specific to either. Edit/delete are shown on every entry (not restricted
// to entries the current admin authored) to match the existing Notes/Task
// Comments components elsewhere in this app, since the contract doesn't
// scope PATCH/DELETE to the entry's author.

import { useState } from "react";
import { MessageSquareText, Pencil, Trash2, Check, X, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConversationEntry } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function ConversationLog({
  entries,
  authorName,
  onAdd,
  onEdit,
  onDelete,
  emptyMessage = "No conversations logged yet.",
}: {
  entries: ConversationEntry[];
  /** Resolve a createdBy userId to a display name. */
  authorName: (userId: string) => string;
  onAdd: (text: string) => Promise<void>;
  onEdit: (entryId: string, text: string) => Promise<void>;
  onDelete: (entryId: string) => Promise<void>;
  emptyMessage?: string;
}) {
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const submitAdd = async () => {
    if (!draft.trim()) return;
    setSubmitting(true);
    try {
      await onAdd(draft.trim());
      setDraft("");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (entry: ConversationEntry) => {
    setEditingId(entry._id);
    setEditText(entry.text);
  };

  const saveEdit = async (entryId: string) => {
    if (!editText.trim()) return;
    setSavingEdit(true);
    try {
      await onEdit(entryId, editText.trim());
      setEditingId(null);
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDelete = async (entryId: string) => {
    setDeleting(true);
    try {
      await onDelete(entryId);
      setConfirmDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Textarea
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Log a conversation with the client — a call, WhatsApp, email, in-person…"
        />
        <Button
          onClick={submitAdd}
          loading={submitting}
          disabled={!draft.trim()}
          className="self-end shrink-0"
        >
          <Send className="h-3.5 w-3.5" /> Log conversation
        </Button>
      </div>

      {entries.length === 0 ? (
        <EmptyState icon={MessageSquareText} title={emptyMessage} />
      ) : (
        <div className="space-y-2.5">
          {entries.map((entry) => (
            <div key={entry._id} className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2.5">
              {editingId === entry._id ? (
                <div className="space-y-2">
                  <Textarea
                    rows={2}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-end gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-3 w-3" /> Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveEdit(entry._id)}
                      loading={savingEdit}
                      disabled={!editText.trim()}
                    >
                      <Check className="h-3 w-3" /> Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{entry.text}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <p className="text-[11px] text-slate-400">
                      {authorName(entry.createdBy)} · {formatDateTime(entry.createdAt)}
                      {entry.edited && <span className="italic"> · (edited)</span>}
                    </p>
                    <div className="flex items-center gap-2">
                      {confirmDeleteId === entry._id ? (
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <span className="text-slate-500">Delete?</span>
                          <button
                            onClick={() => confirmDelete(entry._id)}
                            disabled={deleting}
                            className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            No
                          </button>
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(entry)}
                            className="text-slate-300 hover:text-slate-600"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(entry._id)}
                            className="text-slate-300 hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
