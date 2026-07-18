"use client";

import Link from "next/link";
import type { Property } from "@/types/property";

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function PropertyCard({ property }: { property: Property }) {
  const image = property.images?.[0];

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
      <div className="aspect-[16/10] bg-[color-mix(in_oklab,var(--accent)_8%,transparent)]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={property.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
            No image
          </div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold tracking-tight">{property.title}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {property.location.city}
              {property.location.area ? ` · ${property.location.area}` : ""}
            </p>
          </div>
          <span className="rounded-lg bg-[var(--accent-soft)] px-2 py-1 text-xs font-medium capitalize text-[var(--accent)]">
            {property.status}
          </span>
        </div>
        <p className="text-lg font-semibold">
          {formatMoney(property.price, property.currency || "BDT")}
        </p>
        <p className="text-sm text-[var(--muted)]">
          {property.bedrooms} bed · {property.bathrooms} bath · {property.type}
        </p>
        <Link
          href={`/properties/${property._id}`}
          className="inline-flex text-sm font-medium text-[var(--accent)] hover:underline"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
