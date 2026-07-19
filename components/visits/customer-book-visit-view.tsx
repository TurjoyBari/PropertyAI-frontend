"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { propertyImage } from "@/lib/home-content";
import { publicGetProperty } from "@/services/public.service";
import { bookCustomerVisit } from "@/services/visits.service";
import { useSession } from "@/lib/auth-client";
import { toast } from "@/store/toast-store";
import type { Property } from "@/types/property";

const field =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2";

function toDatetimeLocal(date = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
}

export function CustomerBookVisitView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const propertyId =
    searchParams.get("property") ||
    searchParams.get("propertyId") ||
    "";

  const [property, setProperty] = useState<Property | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    scheduledAt: toDatetimeLocal(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    durationMinutes: 60,
    locationNote: "",
    notes: "",
  });

  const backHref = useMemo(
    () => (propertyId ? `/listings/${propertyId}` : "/listings"),
    [propertyId],
  );

  useEffect(() => {
    if (!propertyId) {
      setLoadError("No property selected. Open a listing and click Book Visit.");
      return;
    }
    publicGetProperty(propertyId)
      .then(setProperty)
      .catch((err) =>
        setLoadError(err instanceof Error ? err.message : "Property not found"),
      );
  }, [propertyId]);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user && propertyId) {
      router.replace(
        `/login?next=${encodeURIComponent(`/customer/visits/new?property=${propertyId}`)}`,
      );
    }
  }, [isPending, session?.user, propertyId, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!propertyId) return;
    setSubmitting(true);
    try {
      await bookCustomerVisit({
        propertyId,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        durationMinutes: form.durationMinutes,
        locationNote: form.locationNote || undefined,
        notes: form.notes || undefined,
      });
      setDone(true);
      toast("Visit booked successfully.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not book visit", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (done && property) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
            Confirmed
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
            Visit booked
          </h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Your site visit for <strong>{property.title}</strong> is scheduled.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/customer/visits"
              className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white"
            >
              View My Visits
            </Link>
            <Link
              href={backHref}
              className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium"
            >
              Back to Property Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
            return;
          }
          router.push(backHref);
        }}
        className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:underline"
      >
        <ArrowLeft size={16} />
        Back to property
      </button>

      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Book a site visit</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Confirm a time for this property — no need to search again.
        </p>
      </div>

      {loadError ? (
        <p className="rounded-xl border border-[var(--danger)] px-4 py-3 text-sm text-[var(--danger)]">
          {loadError}
        </p>
      ) : null}

      {property ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <div className="relative aspect-[16/9]">
            <Image
              src={propertyImage(property)}
              alt={property.title}
              fill
              className="object-cover"
              sizes="800px"
            />
          </div>
          <div className="space-y-1 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
              Selected property
            </p>
            <h2 className="text-xl font-semibold">{property.title}</h2>
            <p className="text-sm text-[var(--muted)]">
              {property.location.address}
              {property.location.area ? `, ${property.location.area}` : ""},{" "}
              {property.location.city}
            </p>
            <p className="text-lg font-semibold text-[var(--accent)]">
              {property.price.toLocaleString()} {property.currency}
            </p>
            <input type="hidden" value={property._id} readOnly />
          </div>
        </div>
      ) : !loadError ? (
        <div className="h-48 animate-pulse rounded-2xl bg-[var(--border)]" />
      ) : null}

      {property ? (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Date & time</span>
              <input
                type="datetime-local"
                required
                className={field}
                value={form.scheduledAt}
                onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Duration (minutes)</span>
              <input
                type="number"
                min={15}
                max={480}
                step={15}
                className={field}
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) || 60 }))
                }
              />
            </label>
          </div>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Meeting point</span>
            <input
              className={field}
              placeholder="Lobby, gate, office..."
              value={form.locationNote}
              onChange={(e) => setForm((f) => ({ ...f, locationNote: e.target.value }))}
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Notes</span>
            <textarea
              className={field}
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Booking..." : "Confirm visit"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
