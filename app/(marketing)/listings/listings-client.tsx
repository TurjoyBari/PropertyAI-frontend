"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Map as MapIcon, Search } from "lucide-react";
import clsx from "clsx";
import { PublicPropertyCard } from "@/components/public/public-property-card";
import { publicListAreas, publicListProperties } from "@/services/public.service";
import {
  PROPERTY_TYPES,
  intentToPurpose,
  type Property,
} from "@/types/property";

const field =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2";

type SortKey = "newest" | "price-asc" | "price-desc";

export default function ListingsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Property[]>([]);
  const [areas, setAreas] = useState<Array<{ name: string; count: number }>>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "map">("grid");
  const [sort, setSort] = useState<SortKey>("newest");

  const applied = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      city: searchParams.get("city") || "",
      area: searchParams.get("area") || "",
      type: searchParams.get("type") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      bedrooms: searchParams.get("bedrooms") || "",
      intent: searchParams.get("intent") || "",
      page: Number(searchParams.get("page") || "1"),
    }),
    [searchParams],
  );

  const [draft, setDraft] = useState(applied);

  useEffect(() => {
    setDraft(applied);
  }, [applied]);

  useEffect(() => {
    publicListAreas()
      .then((data) => setAreas(data.items))
      .catch(() => setAreas([]));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    publicListProperties({
      search: applied.search || undefined,
      city: applied.city || undefined,
      area: applied.area || undefined,
      type: (applied.type as Property["type"]) || undefined,
      purpose: intentToPurpose(applied.intent) || undefined,
      maxPrice: applied.maxPrice || undefined,
      bedrooms: applied.bedrooms || undefined,
      status: "available",
      page: applied.page,
      limit: 12,
    })
      .then((data) => {
        if (!active) return;
        setItems(data.items);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applied]);

  // Smooth-scroll to results when arriving with (or changing) an area filter.
  useEffect(() => {
    if (!applied.area || loading) return;
    const timer = window.setTimeout(() => {
      document.getElementById("listings-results")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [applied.area, loading]);

  const sorted = useMemo(() => {
    const copy = [...items];
    if (sort === "price-asc") copy.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") copy.sort((a, b) => b.price - a.price);
    return copy;
  }, [items, sort]);

  const locationChips = useMemo(() => {
    const map = new Map(areas.map((a) => [a.name.toLowerCase(), a]));
    if (applied.area && !map.has(applied.area.toLowerCase())) {
      map.set(applied.area.toLowerCase(), { name: applied.area, count: total });
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [areas, applied.area, total]);

  const applySearch = (overrides?: Partial<typeof draft>) => {
    const next = { ...draft, ...overrides };
    const params = new URLSearchParams();
    if (next.intent) params.set("intent", next.intent);
    if (next.search.trim()) params.set("search", next.search.trim());
    if (next.city.trim()) params.set("city", next.city.trim());
    if (next.area.trim()) params.set("area", next.area.trim());
    if (next.type) params.set("type", next.type);
    if (next.maxPrice) params.set("maxPrice", next.maxPrice);
    if (next.bedrooms) params.set("bedrooms", next.bedrooms);
    router.push(`/listings?${params.toString()}`);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    applySearch();
  };

  const setArea = (area: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!area) params.delete("area");
    else params.set("area", area);
    params.delete("page");
    router.push(`/listings?${params.toString()}`);
  };

  const mapQuery = encodeURIComponent(
    applied.area
      ? `${applied.area}, Dhaka, Bangladesh`
      : applied.city
        ? `${applied.city}, Bangladesh`
        : "Dhaka, Bangladesh",
  );

  const title = applied.area
    ? `Showing Properties in ${applied.area}`
    : applied.intent === "rent"
      ? "Rentals"
      : applied.intent === "buy"
        ? "Properties for sale"
        : applied.type === "commercial"
          ? "Commercial properties"
          : "Property Listings";

  const subtitle = applied.area
    ? `${loading ? "Loading" : total} verified listing${total === 1 ? "" : "s"} in ${applied.area}.`
    : applied.intent === "rent"
      ? "Homes and spaces available to rent across Dhaka."
      : applied.intent === "buy"
        ? "Verified properties available to buy — search, filter, and sort with confidence."
        : "Search, filter, and sort verified homes.";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-3xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)] sm:truncate sm:whitespace-nowrap sm:text-base">
            {subtitle}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={clsx(
              "rounded-xl border px-3 py-2 text-sm transition",
              view === "grid"
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            <LayoutGrid size={16} className="mr-1 inline" /> Grid
          </button>
          <button
            type="button"
            onClick={() => setView("map")}
            className={clsx(
              "rounded-xl border px-3 py-2 text-sm transition",
              view === "map"
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            <MapIcon size={16} className="mr-1 inline" /> Map
          </button>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]"
      >
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <select
            className={field}
            value={draft.intent}
            onChange={(e) => setDraft((d) => ({ ...d, intent: e.target.value }))}
          >
            <option value="">Buy or Rent</option>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
          </select>
          <input
            className={`${field} xl:col-span-2`}
            placeholder="Search title or keywords"
            value={draft.search}
            onChange={(e) => setDraft((d) => ({ ...d, search: e.target.value }))}
          />
          <input
            className={field}
            list="listing-areas"
            placeholder="Area"
            value={draft.area}
            onChange={(e) => setDraft((d) => ({ ...d, area: e.target.value }))}
          />
          <datalist id="listing-areas">
            {locationChips.map((area) => (
              <option key={area.name} value={area.name} />
            ))}
          </datalist>
          <select
            className={field}
            value={draft.type}
            onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
          >
            <option value="">All types</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            className={field}
            type="number"
            placeholder="Max budget"
            value={draft.maxPrice}
            onChange={(e) => setDraft((d) => ({ ...d, maxPrice: e.target.value }))}
          />
          <input
            className={field}
            type="number"
            min={0}
            placeholder="Beds"
            value={draft.bedrooms}
            onChange={(e) => setDraft((d) => ({ ...d, bedrooms: e.target.value }))}
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            <Search size={16} />
            {loading ? "Searching..." : "Search Properties"}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <select
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="newest">Sort: Newest</option>
            <option value="price-asc">Price: Low to high</option>
            <option value="price-desc">Price: High to low</option>
          </select>
          <p className="text-sm text-[var(--muted)]">
            {loading ? "Searching listings..." : `${total} properties found`}
          </p>
        </div>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setArea("")}
          className={clsx(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition",
            !applied.area
              ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
              : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]",
          )}
        >
          All Locations
        </button>
        {locationChips.map((loc) => (
          <button
            key={loc.name}
            type="button"
            onClick={() => setArea(loc.name)}
            className={clsx(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              applied.area.toLowerCase() === loc.name.toLowerCase()
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            {loc.name}
            <span className="ml-1 opacity-70">({loc.count})</span>
          </button>
        ))}
      </div>

      {error ? <p className="mt-4 text-sm text-[var(--danger)]">{error}</p> : null}

      <div id="listings-results" className="scroll-mt-24">
        {view === "map" ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
              {sorted.map((property) => (
                <PublicPropertyCard key={property._id} property={property} />
              ))}
            </div>
            <div className="min-h-[420px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <iframe
                title="Map view"
                className="h-full min-h-[420px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${mapQuery}&z=12&output=embed`}
              />
            </div>
          </div>
        ) : loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-[var(--border)]" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-16 text-center">
            <p className="font-display text-2xl font-semibold tracking-tight">No properties found</p>
            <p className="mx-auto mt-3 max-w-md text-sm text-[var(--muted)]">
              {applied.area
                ? `Nothing available in ${applied.area} with the current filters.`
                : "Try another location, increase your budget, or clear filters."}
            </p>
            <button
              type="button"
              className="mt-6 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white"
              onClick={() => router.push("/listings")}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((property) => (
              <PublicPropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 ? (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={applied.page <= 1 || loading}
            className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm disabled:opacity-40"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("page", String(applied.page - 1));
              router.push(`/listings?${params.toString()}`);
            }}
          >
            Previous
          </button>
          <span className="text-sm text-[var(--muted)]">
            Page {applied.page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={applied.page >= totalPages || loading}
            className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm disabled:opacity-40"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("page", String(applied.page + 1));
              router.push(`/listings?${params.toString()}`);
            }}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
