"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { listVisits } from "@/services/visits.service";
import {
  VISIT_STATUS_LABELS,
  type Visit,
  type VisitStatus,
  visitLeadName,
  visitPropertyTitle,
} from "@/types/visit";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_DOT: Record<VisitStatus, string> = {
  scheduled: "bg-[var(--accent)]",
  completed: "bg-emerald-500",
  cancelled: "bg-[var(--muted)]",
  no_show: "bg-[var(--danger)]",
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dayKey(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function buildCalendarDays(month: Date) {
  const first = startOfMonth(month);
  const startPad = first.getDay();
  const daysInMonth = endOfMonth(month).getDate();
  const cells: Array<{ date: Date; inMonth: boolean }> = [];

  for (let i = startPad - 1; i >= 0; i -= 1) {
    const date = new Date(first);
    date.setDate(first.getDate() - (i + 1));
    cells.push({ date, inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      date: new Date(month.getFullYear(), month.getMonth(), day),
      inMonth: true,
    });
  }

  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    cells.push({ date: next, inMonth: false });
  }

  return cells;
}

export function VisitsView() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    listVisits({
      from: startOfMonth(month).toISOString(),
      to: endOfMonth(month).toISOString(),
      limit: 200,
    })
      .then((data) => {
        if (!active) return;
        setVisits(data.items);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load visits");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [month]);

  const byDay = useMemo(() => {
    const map = new Map<string, Visit[]>();
    visits.forEach((visit) => {
      const key = dayKey(new Date(visit.scheduledAt));
      const list = map.get(key) ?? [];
      list.push(visit);
      map.set(key, list);
    });
    return map;
  }, [visits]);

  const selectedVisits = byDay.get(dayKey(selectedDay)) ?? [];
  const cells = buildCalendarDays(month);
  const today = new Date();

  const shiftMonth = (delta: number) => {
    const next = new Date(month.getFullYear(), month.getMonth() + delta, 1);
    setMonth(next);
    setSelectedDay(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Site Visits</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Schedule property tours and track them on a monthly calendar.
          </p>
        </div>
        <Link
          href="/visits/new"
          className="inline-flex rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Schedule visit
        </Link>
      </div>

      {error ? (
        <p className="rounded-xl bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] hover:text-[var(--foreground)]"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-semibold tracking-tight">
              {month.toLocaleString(undefined, { month: "long", year: "numeric" })}
            </h2>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] hover:text-[var(--foreground)]"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[var(--muted)]">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="mt-2 grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square animate-pulse rounded-xl bg-[var(--border)]"
                />
              ))}
            </div>
          ) : (
            <div className="mt-2 grid grid-cols-7 gap-1">
              {cells.map(({ date, inMonth }) => {
                const key = dayKey(date);
                const dayVisits = byDay.get(key) ?? [];
                const selected = sameDay(date, selectedDay);
                const isToday = sameDay(date, today);

                return (
                  <button
                    key={key + String(inMonth)}
                    type="button"
                    onClick={() => setSelectedDay(date)}
                    className={clsx(
                      "flex min-h-[4.5rem] flex-col rounded-xl border p-1.5 text-left transition sm:min-h-[5.5rem] sm:p-2",
                      selected
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-transparent hover:border-[var(--border)] hover:bg-[color-mix(in_oklab,var(--accent)_6%,transparent)]",
                      !inMonth && "opacity-40",
                    )}
                  >
                    <span
                      className={clsx(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                        isToday && "bg-[var(--accent)] text-white",
                      )}
                    >
                      {date.getDate()}
                    </span>
                    <div className="mt-auto flex flex-wrap gap-1">
                      {dayVisits.slice(0, 3).map((visit) => (
                        <span
                          key={visit._id}
                          className={clsx(
                            "h-1.5 w-1.5 rounded-full",
                            STATUS_DOT[visit.status],
                          )}
                          title={visitLeadName(visit)}
                        />
                      ))}
                      {dayVisits.length > 3 ? (
                        <span className="text-[10px] text-[var(--muted)]">
                          +{dayVisits.length - 3}
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
          <h2 className="text-lg font-semibold tracking-tight">
            {selectedDay.toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {selectedVisits.length} visit{selectedVisits.length === 1 ? "" : "s"}
          </p>

          <div className="mt-4 space-y-3">
            {selectedVisits.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--muted)]">
                No visits this day.{" "}
                <Link href="/visits/new" className="text-[var(--accent)] hover:underline">
                  Schedule one
                </Link>
              </div>
            ) : (
              selectedVisits
                .slice()
                .sort(
                  (a, b) =>
                    new Date(a.scheduledAt).getTime() -
                    new Date(b.scheduledAt).getTime(),
                )
                .map((visit) => (
                  <Link
                    key={visit._id}
                    href={`/visits/${visit._id}`}
                    className="block rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--accent)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{visitLeadName(visit)}</p>
                        <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                          {visitPropertyTitle(visit)}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--accent)]">
                        {VISIT_STATUS_LABELS[visit.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      {new Date(visit.scheduledAt).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      · {visit.durationMinutes} min
                    </p>
                  </Link>
                ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
