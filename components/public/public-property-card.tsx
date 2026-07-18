"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import clsx from "clsx";
import type { Property } from "@/types/property";
import { propertyImage } from "@/lib/home-content";
import { useFavorite } from "@/hooks/use-favorite";

export function PublicPropertyCard({
  property,
  badge,
}: {
  property: Property;
  badge?: string;
}) {
  const { favorited, loading, busy, toggle } = useFavorite(property._id);
  const src = propertyImage(property);

  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition hover:border-[var(--accent)]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={src}
          alt={property.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {badge ? (
          <span className="absolute left-3 top-3 rounded-lg bg-[var(--accent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            {badge}
          </span>
        ) : null}
        <button
          type="button"
          aria-label={favorited ? "Remove favorite" : "Save favorite"}
          disabled={busy}
          className={clsx(
            "absolute right-3 top-3 rounded-full bg-black/45 p-2 text-white backdrop-blur disabled:opacity-60",
            favorited && "ring-1 ring-red-400",
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void toggle(`/listings/${property._id}?action=favorite`);
          }}
        >
          <Heart
            size={16}
            className={favorited ? "fill-red-500 text-red-500" : ""}
          />
        </button>
      </div>
      <div className="space-y-2 p-4">
        <p className="text-lg font-semibold text-[var(--accent)]">
          {property.price.toLocaleString()} {property.currency}
          {property.purpose === "rent" ? (
            <span className="text-sm font-medium text-[var(--muted)]"> /mo</span>
          ) : null}
        </p>
        <h3 className="line-clamp-1 font-semibold tracking-tight">{property.title}</h3>
        <p className="text-xs text-[var(--muted)]">
          {property.purpose === "rent" ? "For rent" : "For sale"}
          {" · "}
          {property.location.city}
          {property.location.area ? ` · ${property.location.area}` : ""}
        </p>
        <p className="text-xs text-[var(--muted)]">
          {property.bedrooms} bed · {property.bathrooms} bath
          {property.areaSqFt ? ` · ${property.areaSqFt} sqft` : ""}
        </p>
        <Link
          href={`/listings/${property._id}`}
          className="inline-flex pt-1 text-sm font-medium text-[var(--accent)] hover:underline"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
