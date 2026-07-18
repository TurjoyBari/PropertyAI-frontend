"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listVisits } from "@/services/visits.service";
import type { Visit } from "@/types/visit";
import { visitLeadName, visitPropertyTitle } from "@/types/visit";

export default function CustomerVisitsPage() {
  const [items, setItems] = useState<Visit[]>([]);

  useEffect(() => {
    listVisits({ limit: 50 })
      .then((data) => setItems(data.items))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">My visits</h1>
        <Link href="/customer/visits/new" className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">
          Book visit
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No visits scheduled.</p>
      ) : (
        <div className="space-y-3">
          {items.map((visit) => (
            <Link
              key={visit._id}
              href={`/visits/${visit._id}`}
              className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <p className="font-semibold">{visitPropertyTitle(visit)}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {new Date(visit.scheduledAt).toLocaleString()} · {visit.status}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">{visitLeadName(visit)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
