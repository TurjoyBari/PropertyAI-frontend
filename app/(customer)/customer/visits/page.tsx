"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { listVisits } from "@/services/visits.service";
import type { Visit } from "@/types/visit";
import {
  VISIT_STATUS_LABELS,
  visitPropertyAddress,
  visitPropertyTitle,
} from "@/types/visit";
import { propertyImage } from "@/lib/home-content";
import { CustomerPageHeader } from "@/components/customer/page-header";
import { PageTransition } from "@/components/customer/page-transition";
import { Skeleton } from "@/components/customer/skeleton";

export default function CustomerVisitsPage() {
  const [items, setItems] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listVisits({ limit: 50 })
      .then((data) => setItems(data.items))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <div className="space-y-8">
        <CustomerPageHeader
          title="My Visits"
          subtitle="Upcoming and past property tours in one timeline."
          action={
            <Link
              href="/customer/visits/new"
              className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Book visit
            </Link>
          }
        />

        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-14 text-center text-sm text-[var(--muted)]">
            No visits scheduled.{" "}
            <Link href="/listings" className="text-[var(--accent)] hover:underline">
              Browse homes
            </Link>{" "}
            and book a tour.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((visit) => {
              const property =
                typeof visit.property === "string" ? null : visit.property;
              const when = new Date(visit.scheduledAt);
              return (
                <Link
                  key={visit._id}
                  href={`/customer/visits/${visit._id}`}
                  className="flex overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_8px_30px_rgba(20,32,28,0.04)] transition hover:border-[var(--accent)]"
                >
                  <div className="relative hidden w-36 shrink-0 sm:block">
                    <Image
                      src={propertyImage(property ?? {})}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="144px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center gap-1 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold tracking-tight">
                        {visitPropertyTitle(visit)}
                      </p>
                      <span className="rounded-lg bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--accent)]">
                        {VISIT_STATUS_LABELS[visit.status]}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      {visitPropertyAddress(visit)}
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      {when.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      ·{" "}
                      {when.toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                    <span className="pt-1 text-sm font-semibold text-[var(--accent)]">
                      View details →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
