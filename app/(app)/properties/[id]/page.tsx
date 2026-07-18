"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PropertyForm } from "@/components/properties/property-form";
import {
  deleteProperty,
  getProperty,
  updateProperty,
} from "@/services/properties.service";
import type { Property } from "@/types/property";

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getProperty(params.id)
      .then((data) => {
        if (!active) return;
        setProperty(data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load property");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params.id]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-[var(--border)]" />;
  }

  if (error || !property) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-12 text-center text-sm text-[var(--muted)]">
        {error || "Property not found"}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/properties" className="text-sm text-[var(--accent)] hover:underline">
            ← Back to properties
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{property.title}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {property.location.address}, {property.location.city}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing((value) => !value)}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium"
          >
            {editing ? "Cancel edit" : "Edit"}
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!confirm("Delete this property?")) return;
              await deleteProperty(property._id);
              router.push("/properties");
              router.refresh();
            }}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--danger)]"
          >
            Delete
          </button>
        </div>
      </div>

      {editing ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <PropertyForm
            initial={property}
            submitLabel="Save changes"
            onSubmit={async (values) => {
              const updated = await updateProperty(property._id, values);
              setProperty(updated);
              setEditing(false);
            }}
          />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <div className="aspect-[16/10] bg-[color-mix(in_oklab,var(--accent)_8%,transparent)]">
              {property.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                  No image
                </div>
              )}
            </div>
            <div className="space-y-4 p-5">
              <p className="text-sm leading-relaxed text-[var(--muted)]">{property.description}</p>
              {property.amenities?.length ? (
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg bg-[var(--accent-soft)] px-2 py-1 text-xs text-[var(--accent)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          <aside className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-3xl font-semibold">
              {formatMoney(property.price, property.currency || "BDT")}
            </p>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Type</dt>
                <dd className="capitalize">{property.type}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Status</dt>
                <dd className="capitalize">{property.status}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Beds / Baths</dt>
                <dd>
                  {property.bedrooms} / {property.bathrooms}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Area</dt>
                <dd>{property.areaSqFt ? `${property.areaSqFt} sqft` : "—"}</dd>
              </div>
            </dl>
          </aside>
        </div>
      )}
    </div>
  );
}
