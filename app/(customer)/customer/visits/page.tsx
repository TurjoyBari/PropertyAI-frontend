"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listVisits } from "@/services/visits.service";
import type { Visit } from "@/types/visit";
import {
  VISIT_STATUS_LABELS,
  visitPropertyAddress,
  visitPropertyTitle,
} from "@/types/visit";

export default function CustomerVisitsPage() {
  const [items, setItems] = useState<Visit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listVisits({ limit: 50 })
      .then((data) => {
        if (!active) return;
        setItems(data.items);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load visits");
        setItems([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">My visits</h1>
        <Link
          href="/customer/visits/new"
          className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          Book visit
        </Link>
      </div>

      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

      {loading ? (
        <div className="h-32 animate-pulse rounded-2xl bg-[var(--border)]" />
      ) : items.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No visits scheduled.</p>
      ) : (
        <div className="space-y-3">
          {items.map((visit) => (
            <Link
              key={visit._id}
              href={`/customer/visits/${visit._id}`}
              className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--accent)]"
            >
              <p className="font-semibold">{visitPropertyTitle(visit)}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {visitPropertyAddress(visit)}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {new Date(visit.scheduledAt).toLocaleString()} ·{" "}
                {VISIT_STATUS_LABELS[visit.status]}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
