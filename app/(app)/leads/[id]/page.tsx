"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { LeadForm } from "@/components/leads/lead-form";
import {
  addLeadNote,
  deleteLead,
  getLead,
  updateLead,
} from "@/services/leads.service";
import type { Lead } from "@/types/lead";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/store/toast-store";

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    getLead(params.id)
      .then((data) => {
        if (!active) return;
        setLead(data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load lead");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params.id]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-[var(--border)]" />;
  }

  if (error || !lead) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-12 text-center text-sm text-[var(--muted)]">
        {error || "Lead not found"}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/leads" className="text-sm text-[var(--accent)] hover:underline">
            ← Back to leads
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{lead.fullName}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {lead.email}
            {lead.phone ? ` · ${lead.phone}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing((value) => !value)}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium"
          >
            {editing ? "Cancel edit" : "Edit"}
          </button>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--danger)]"
          >
            Delete
          </button>
        </div>
      </div>

      {editing ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <LeadForm
            initial={lead}
            submitLabel="Save changes"
            onSubmit={async (values) => {
              const updated = await updateLead(lead._id, values);
              setLead(updated);
              setEditing(false);
            }}
          />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Lead details</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Status</dt>
                <dd className="capitalize">{lead.status.replaceAll("_", " ")}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Source</dt>
                <dd className="capitalize">{lead.source.replaceAll("_", " ")}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Temperature</dt>
                <dd className="capitalize">{lead.temperature}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Score</dt>
                <dd>{lead.score}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Budget</dt>
                <dd>
                  {lead.budgetMin || lead.budgetMax
                    ? `${lead.budgetMin ?? "—"} - ${lead.budgetMax ?? "—"}`
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Location</dt>
                <dd>{lead.preferredLocation || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Timeline</dt>
                <dd>{lead.buyingTimeline || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Assigned agent</dt>
                <dd className="truncate">{lead.assignedAgent || "Unassigned"}</dd>
              </div>
            </dl>
          </section>

          <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Notes</h2>
            {lead.notes?.length ? (
              <ul className="space-y-3">
                {lead.notes
                  .slice()
                  .reverse()
                  .map((item, index) => (
                    <li
                      key={`${item.createdAt}-${index}`}
                      className="rounded-xl border border-[var(--border)] px-3 py-3"
                    >
                      <p className="text-sm">{item.body}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : "Just now"}
                      </p>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--muted)]">No notes yet.</p>
            )}

            <form
              className="space-y-3"
              onSubmit={async (event) => {
                event.preventDefault();
                setNoteError(null);
                if (!note.trim()) {
                  setNoteError("Write a note first");
                  return;
                }
                try {
                  const updated = await addLeadNote(lead._id, note.trim());
                  setLead(updated);
                  setNote("");
                } catch (err) {
                  setNoteError(err instanceof Error ? err.message : "Failed to add note");
                }
              }}
            >
              {noteError ? (
                <p className="text-xs text-[var(--danger)]">{noteError}</p>
              ) : null}
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a follow-up note..."
                className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              />
              <button
                type="submit"
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Add note
              </button>
            </form>
          </section>
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Lead"
        description="Are you sure you want to delete this lead?"
        warning="This action cannot be undone."
        cancelLabel="Keep Lead"
        confirmLabel="Yes, Delete Lead"
        confirmLoadingLabel="Deleting…"
        loading={deleting}
        onConfirm={async () => {
          setDeleting(true);
          try {
            await deleteLead(lead._id);
            setDeleteOpen(false);
            toast("Lead deleted successfully.");
            router.push("/leads");
            router.refresh();
          } catch (err) {
            toast(err instanceof Error ? err.message : "Could not delete lead", "error");
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}
