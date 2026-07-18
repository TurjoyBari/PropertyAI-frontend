"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { publicListProperties } from "@/services/public.service";
import { PROPERTY_TYPES, type Property } from "@/types/property";

export default function ListingsPage() {
  const [items, setItems] = useState<Property[]>([]);
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    publicListProperties({
      city: city || undefined,
      type: (type as Property["type"]) || undefined,
      limit: 24,
    })
      .then((data) => {
        if (!active) return;
        setItems(data.items);
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
  }, [city, type]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Property listings</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Browse available homes. No login required.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <input
          className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm"
          placeholder="Filter by city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <select
          className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="mt-4 text-sm text-[var(--danger)]">{error}</p> : null}

      {loading ? (
        <div className="mt-8 h-40 animate-pulse rounded-2xl bg-[var(--border)]" />
      ) : items.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--muted)]">No available listings yet.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((property) => (
            <Link
              key={property._id}
              href={`/listings/${property._id}`}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--accent)]"
            >
              <p className="font-semibold">{property.title}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {property.location.city}
                {property.location.area ? ` · ${property.location.area}` : ""}
              </p>
              <p className="mt-3 text-sm">
                {property.price.toLocaleString()} {property.currency} ·{" "}
                {property.bedrooms} bed
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
