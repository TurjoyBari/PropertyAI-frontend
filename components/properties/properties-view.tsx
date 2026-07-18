"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listProperties } from "@/services/properties.service";
import { PropertyCard } from "@/components/properties/property-card";
import {
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  type Property,
  type PropertyQuery,
} from "@/types/property";

const fieldClass =
  "rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2";

export function PropertiesView() {
  const [items, setItems] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PropertyQuery>({
    search: "",
    type: "",
    status: "",
    city: "",
    minPrice: "",
    maxPrice: "",
    page: 1,
  });

  const queryKey = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    listProperties(filters)
      .then((data) => {
        if (!active) return;
        setItems(data.items);
        setTotal(data.pagination.total);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load properties");
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
          <h1 className="text-3xl font-semibold tracking-tight">Properties</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Search, filter, and manage listings.
          </p>
        </div>
        <Link
          href="/properties/new"
          className="inline-flex rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Add property
        </Link>
      </div>

      <div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 md:grid-cols-3 xl:grid-cols-6">
        <input
          className={fieldClass}
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
        />
        <input
          className={fieldClass}
          placeholder="City"
          value={filters.city}
          onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value, page: 1 }))}
        />
        <select
          className={fieldClass}
          value={filters.type}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              type: e.target.value as PropertyQuery["type"],
              page: 1,
            }))
          }
        >
          <option value="">All types</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          className={fieldClass}
          value={filters.status}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              status: e.target.value as PropertyQuery["status"],
              page: 1,
            }))
          }
        >
          <option value="">All statuses</option>
          {PROPERTY_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <input
          className={fieldClass}
          placeholder="Min price"
          value={filters.minPrice}
          onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value, page: 1 }))}
        />
        <input
          className={fieldClass}
          placeholder="Max price"
          value={filters.maxPrice}
          onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value, page: 1 }))}
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-2xl bg-[var(--border)]" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-12 text-center text-sm text-[var(--muted)]">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-16 text-center">
          <p className="text-lg font-semibold">No properties found</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Add your first listing to populate the dashboard KPIs.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-[var(--muted)]">{total} result(s)</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
