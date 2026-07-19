"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listLeads } from "@/services/leads.service";
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_TEMPERATURES,
  type Lead,
  type LeadQuery,
} from "@/types/lead";

const fieldClass =
  "rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2";

export function LeadsView() {
  const [items, setItems] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeadQuery>({
    search: "",
    status: "",
    source: "",
    temperature: "",
    preferredLocation: "",
    page: 1,
  });

  const queryKey = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    listLeads(filters)
      .then((data) => {
        if (!active) return;
        setItems(data.items);
        setTotal(data.pagination.total);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load leads");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Leads</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Track prospects, status, and follow-up notes.
          </p>
        </div>
        <Link
          href="/leads/new"
          className="inline-flex rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Add lead
        </Link>
      </div>

      <div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 md:grid-cols-2 xl:grid-cols-5">
        <input
          className={fieldClass}
          placeholder="Search name/email/phone"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
        />
        <select
          className={fieldClass}
          value={filters.status}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              status: e.target.value as LeadQuery["status"],
              page: 1,
            }))
          }
        >
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <select
          className={fieldClass}
          value={filters.source}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              source: e.target.value as LeadQuery["source"],
              page: 1,
            }))
          }
        >
          <option value="">All sources</option>
          {LEAD_SOURCES.map((source) => (
            <option key={source} value={source}>
              {source.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <select
          className={fieldClass}
          value={filters.temperature}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              temperature: e.target.value as LeadQuery["temperature"],
              page: 1,
            }))
          }
        >
          <option value="">All temperatures</option>
          {LEAD_TEMPERATURES.map((temperature) => (
            <option key={temperature} value={temperature}>
              {temperature}
            </option>
          ))}
        </select>
        <input
          className={fieldClass}
          placeholder="Preferred location"
          value={filters.preferredLocation}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              preferredLocation: e.target.value,
              page: 1,
            }))
          }
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-2xl bg-[var(--border)]" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-12 text-center text-sm text-[var(--muted)]">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-16 text-center">
          <p className="text-lg font-semibold">No leads yet</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Add your first lead to start the sales pipeline.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-[var(--muted)]">{total} result(s)</p>
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Temp</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                </tr>
              </thead>
              <tbody>
                {items.map((lead) => (
                  <tr key={lead._id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/leads/${lead._id}`}
                        className="font-medium text-[var(--accent)] hover:underline"
                      >
                        {lead.fullName}
                      </Link>
                      <p className="text-xs text-[var(--muted)]">{lead.email}</p>
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {lead.status.replaceAll("_", " ")}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {lead.source.replaceAll("_", " ")}
                    </td>
                    <td className="px-4 py-3 capitalize">{lead.temperature}</td>
                    <td className="px-4 py-3">{lead.preferredLocation || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
