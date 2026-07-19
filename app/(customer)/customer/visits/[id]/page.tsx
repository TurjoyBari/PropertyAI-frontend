"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { propertyImage } from "@/lib/home-content";
import { deleteVisit, getVisit, updateVisit } from "@/services/visits.service";
import { toast } from "@/store/toast-store";
import {
  VISIT_STATUS_LABELS,
  type Visit,
  visitAgentName,
  visitPropertyAddress,
  visitPropertyId,
  visitPropertyTitle,
} from "@/types/visit";
import { PageTransition } from "@/components/customer/page-transition";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

function toDatetimeLocal(iso: string) {
  const date = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
}

export default function CustomerVisitDetailPage() {
  const params = useParams<{ id: string }>();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  useEffect(() => {
    let active = true;
    getVisit(params.id)
      .then((data) => {
        if (!active) return;
        setVisit(data);
        setScheduledAt(toDatetimeLocal(data.scheduledAt));
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
      <div className="space-y-4">
        <Link
          href="/customer/visits"
          className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:underline"
        >
          <ArrowLeft size={16} /> Back to My Visits
        </Link>
        <div className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-12 text-center text-sm text-[var(--muted)]">
          {error || "Visit not found"}
        </div>
      </div>
    );
  }

  const property = typeof visit.property === "string" ? null : visit.property;
  const canModify = visit.status === "scheduled";
  const isCancelled = visit.status === "cancelled";
  const when = new Date(visit.scheduledAt);
  const dateLabel = when.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeLabel = when.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  const onReschedule = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateVisit(visit._id, {
        scheduledAt: new Date(scheduledAt).toISOString(),
      });
      setVisit(updated);
      setRescheduling(false);
      toast("Visit rescheduled.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not reschedule", "error");
    } finally {
      setSaving(false);
    }
  };

  const onConfirmCancel = async () => {
    setCancelling(true);
    try {
      await deleteVisit(visit._id);
      setVisit((prev) =>
        prev
          ? { ...prev, status: "cancelled", isActive: false }
          : prev,
      );
      setRescheduling(false);
      setCancelOpen(false);
      toast("Visit cancelled successfully.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not cancel visit", "error");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/customer/visits"
          className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:underline"
        >
          <ArrowLeft size={16} /> Back to My Visits
        </Link>

        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <div className="relative aspect-[16/9]">
            <Image
              src={propertyImage(property ?? {})}
              alt={visitPropertyTitle(visit)}
              fill
              className="object-cover"
              sizes="800px"
            />
          </div>
          <div className="space-y-1 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
              Visit details
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {visitPropertyTitle(visit)}
            </h1>
            <p className="text-sm text-[var(--muted)]">{visitPropertyAddress(visit)}</p>
            {property?.price != null ? (
              <p className="text-lg font-semibold text-[var(--accent)]">
                {property.price.toLocaleString()} {property.currency || "BDT"}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Date</p>
            <p className="mt-2 text-sm font-medium">{dateLabel}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Time</p>
            <p className="mt-2 text-sm font-medium">
              {timeLabel}
              <span className="text-[var(--muted)]"> · {visit.durationMinutes} min</span>
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Status</p>
            <p
              className={`mt-2 text-sm font-medium ${
                isCancelled ? "text-[var(--danger)]" : ""
              }`}
            >
              {VISIT_STATUS_LABELS[visit.status]}
            </p>
            {visit.locationNote ? (
              <p className="mt-1 text-sm text-[var(--muted)]">{visit.locationNote}</p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
              Assigned agent
            </p>
            <p className="mt-2 text-sm font-medium">{visitAgentName(visit)}</p>
          </div>
          {visit.notes ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Notes</p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{visit.notes}</p>
            </div>
          ) : null}
        </div>

        {isCancelled ? (
          <div className="rounded-2xl border border-[color-mix(in_oklab,var(--danger)_35%,var(--border))] bg-[color-mix(in_oklab,var(--danger)_8%,var(--card))] px-5 py-4">
            <p className="text-sm font-semibold text-[var(--danger)]">Visit Cancelled</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              This visit is no longer scheduled. You can book a new one anytime.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/customer/visits/new"
                className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Book another visit
              </Link>
              <Link
                href={`/listings/${visitPropertyId(visit)}`}
                className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium"
              >
                View property
              </Link>
            </div>
          </div>
        ) : rescheduling ? (
          <form
            onSubmit={onReschedule}
            className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
          >
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">New date & time</span>
              <input
                type="datetime-local"
                required
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save new time"}
              </button>
              <button
                type="button"
                onClick={() => setRescheduling(false)}
                className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap gap-2">
            {canModify ? (
              <>
                <button
                  type="button"
                  onClick={() => setRescheduling(true)}
                  className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Reschedule Visit
                </button>
                <button
                  type="button"
                  onClick={() => setCancelOpen(true)}
                  className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--danger)]"
                >
                  Cancel Visit
                </button>
              </>
            ) : null}
            <Link
              href="/contact"
              className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium"
            >
              Contact Agent
            </Link>
            <Link
              href={`/listings/${visitPropertyId(visit)}`}
              className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium"
            >
              View property
            </Link>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel Visit"
        description="Are you sure you want to cancel this scheduled visit?"
        warning="This action cannot be undone."
        cancelLabel="Keep Visit"
        confirmLabel="Yes, Cancel Visit"
        confirmLoadingLabel="Cancelling…"
        tone="danger"
        loading={cancelling}
        onConfirm={onConfirmCancel}
      />
    </PageTransition>
  );
}
