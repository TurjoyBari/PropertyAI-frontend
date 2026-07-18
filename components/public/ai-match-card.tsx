"use client";

import Image from "next/image";
import Link from "next/link";
import type { MatchPropertyResult } from "@/types/ai";
import { propertyImage } from "@/lib/home-content";

export function AiMatchCard({ item }: { item: MatchPropertyResult }) {
  const property = item.property;
  const src = propertyImage({ images: property.images });
  const location = [property.location?.area, property.location?.city]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] transition hover:border-[var(--accent)]">
      <div className="relative aspect-[16/10]">
        <Image src={src} alt={property.title} fill className="object-cover" sizes="400px" />
        <span className="absolute left-3 top-3 rounded-lg bg-[var(--accent)] px-2.5 py-1 text-xs font-semibold text-white">
          {item.matchScore}% Match
        </span>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="font-semibold tracking-tight">{property.title}</h3>
        <p className="text-lg font-semibold text-[var(--accent)]">
          {property.price.toLocaleString()} {property.currency}
        </p>
        <p className="text-xs text-[var(--muted)]">{location || "Dhaka"}</p>
        <p className="text-xs text-[var(--muted)]">
          {property.bedrooms} bed · {property.bathrooms} bath
          {property.areaSqFt ? ` · ${property.areaSqFt} sqft` : ""}
        </p>
        <p className="text-sm leading-relaxed text-[var(--muted)]">{item.reason}</p>
        <Link
          href={`/listings/${property._id}`}
          className="inline-flex pt-1 text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}

export function AiMatchLoading() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-2xl bg-[var(--border)]"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
      <p className="text-center text-sm text-[var(--muted)]">
        Finding your best property matches...
      </p>
    </div>
  );
}
