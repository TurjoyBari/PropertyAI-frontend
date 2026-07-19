"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { listProperties } from "@/services/properties.service";
import { PropertyCard } from "@/components/properties/property-card";
import { Pagination } from "@/components/ui/pagination";
import {
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  type Property,
  type PropertyQuery,
} from "@/types/property";

const PAGE_SIZE = 12;

const fieldClass =
  "rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2";

function parseFilters(params: URLSearchParams): PropertyQuery {
  const pageRaw = Number(params.get("page") || "1");
  return {
    search: params.get("search") || "",
    type: (params.get("type") as PropertyQuery["type"]) || "",
    status: (params.get("status") as PropertyQuery["status"]) || "",
    city: params.get("city") || "",
    area: params.get("area") || "",
    minPrice: params.get("minPrice") || "",
    maxPrice: params.get("maxPrice") || "",
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
    limit: PAGE_SIZE,
  };
}

function toSearchParams(filters: PropertyQuery, page: number) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.type) params.set("type", filters.type);
  if (filters.status) params.set("status", filters.status);
  if (filters.city) params.set("city", filters.city);
  if (filters.area) params.set("area", filters.area);
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  params.set("page", String(page));
  return params;
}

export function PropertiesView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const listRef = useRef<HTMLDivElement>(null);

  const filters = useMemo(
    () => parseFilters(searchParams),
    [searchParams],
  );

  const [items, setItems] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(filters.page ?? 1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryKey = useMemo(() => searchParams.toString(), [searchParams]);

  function writeUrl(
    nextFilters: PropertyQuery,
    nextPage: number,
    mode: "push" | "replace",
  ) {
    const qs = toSearchParams(nextFilters, nextPage).toString();
    const href = qs ? `${pathname}?${qs}` : pathname;
    if (mode === "push") router.push(href);
    else router.replace(href);
  }

  function updateFilters(patch: Partial<PropertyQuery>) {
    const next = { ...filters, ...patch, page: 1, limit: PAGE_SIZE };
    writeUrl(next, 1, "replace");
  }

  function goToPage(nextPage: number) {
    writeUrl(filters, nextPage, "push");
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    listProperties(filters)
      .then((data) => {
        if (!active) return;
        const pagination = data.pagination;
        setItems(data.items);
        setTotal(pagination.total);
        setPage(pagination.page);
        setTotalPages(pagination.totalPages);
        setHasNextPage(
          pagination.hasNextPage ??
            pagination.page < pagination.totalPages,
        );
        setHasPreviousPage(
          pagination.hasPreviousPage ?? pagination.page > 1,
        );

        // Clamp out-of-range page after filter changes shrink the result set
        if (
          pagination.totalPages > 0 &&
          (filters.page ?? 1) > pagination.totalPages
        ) {
          writeUrl(filters, pagination.totalPages, "replace");
        }
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

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

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
          onChange={(e) => updateFilters({ search: e.target.value })}
        />
        <input
          className={fieldClass}
          placeholder="City"
          value={filters.city}
          onChange={(e) => updateFilters({ city: e.target.value })}
        />
        <select
          className={fieldClass}
          value={filters.type}
          onChange={(e) =>
            updateFilters({
              type: e.target.value as PropertyQuery["type"],
            })
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
            updateFilters({
              status: e.target.value as PropertyQuery["status"],
            })
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
          onChange={(e) => updateFilters({ minPrice: e.target.value })}
        />
        <input
          className={fieldClass}
          placeholder="Max price"
          value={filters.maxPrice}
          onChange={(e) => updateFilters({ maxPrice: e.target.value })}
        />
      </div>

      <div ref={listRef}>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-2xl bg-[var(--border)]"
              />
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
            <p className="mb-4 text-sm text-[var(--muted)]">
              Showing {from}–{to} of {total}{" "}
              {total === 1 ? "Property" : "Properties"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
            <Pagination
              className="mt-8"
              page={page}
              totalPages={totalPages}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              disabled={loading}
              onPageChange={goToPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
