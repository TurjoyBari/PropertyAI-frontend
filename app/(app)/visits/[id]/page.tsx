"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { VisitForm } from "@/components/visits/visit-form";
import { deleteVisit, getVisit, updateVisit } from "@/services/visits.service";
import {
  VISIT_STATUS_LABELS,
  type Visit,
  visitLeadId,
  visitLeadName,
  visitPropertyId,
  visitPropertyTitle,
} from "@/types/visit";

export default function VisitDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getVisit(params.id)
      .then((data) => {
        if (!active) return;
        setVisit(data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load visit");
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

  if (error || !visit) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-12 text-center text-sm text-[var(--muted)]">
        {error || "Visit not found"}
      </div>
    );
  }

  const property =
    typeof visit.property === "string" ? null : visit.property;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/visits" className="text-sm text-[var(--accent)] hover:underline">
            ← Back to visits
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {visitLeadName(visit)}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {visitPropertyTitle(visit)}
            {property?.location?.city ? ` · ${property.location.city}` : ""}
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
            onClick={async () => {
              if (!confirm("Cancel and remove this visit?")) return;
              await deleteVisit(visit._id);
              router.push("/visits");
              router.refresh();
            }}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--danger)]"
          >
            Cancel visit
          </button>
        </div>
      </div>

      {editing ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <VisitForm
            initial={visit}
            submitLabel="Save changes"
            onSubmit={async (values) => {
              const updated = await updateVisit(visit._id, values);
              setVisit(updated);
              setEditing(false);
            }}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">When</p>
            <p className="mt-2 text-sm font-medium">
              {new Date(visit.scheduledAt).toLocaleString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {visit.durationMinutes} minutes
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Status</p>
            <p className="mt-2 text-sm font-medium">
              {VISIT_STATUS_LABELS[visit.status]}
            </p>
            {visit.locationNote ? (
              <p className="mt-1 text-sm text-[var(--muted)]">{visit.locationNote}</p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Lead</p>
            <Link
              href={`/leads/${visitLeadId(visit)}`}
              className="mt-2 inline-flex text-sm font-medium text-[var(--accent)] hover:underline"
            >
              {visitLeadName(visit)}
            </Link>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Property</p>
            <Link
              href={`/properties/${visitPropertyId(visit)}`}
              className="mt-2 inline-flex text-sm font-medium text-[var(--accent)] hover:underline"
            >
              {visitPropertyTitle(visit)}
            </Link>
          </div>

          {visit.notes ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Notes</p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{visit.notes}</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
