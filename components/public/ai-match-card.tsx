"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  Eye,
  Heart,
  MapPin,
  Maximize2,
} from "lucide-react";
import clsx from "clsx";
import type { MatchPropertiesResponse, MatchPropertyResult } from "@/types/ai";
import { propertyImage, HOME_IMAGES } from "@/lib/home-content";
import { useFavorite } from "@/hooks/use-favorite";

function formatMoney(price: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: currency || "BDT",
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency || "BDT"} ${price.toLocaleString()}`;
  }
}

export function AiMatchCard({
  item,
  mode = "live",
}: {
  item: MatchPropertyResult;
  mode?: MatchPropertiesResponse["mode"];
}) {
  const property = item.property;
  const src = propertyImage({ images: property.images }) || HOME_IMAGES.fallback;
  const location =
    [property.location?.area, property.location?.city]
      .filter(Boolean)
      .join(" · ") || "Bangladesh";
  const showScore = mode === "live" || mode === "cache";
  const { favorited, busy, toggle } = useFavorite(property._id);
  const detailsHref = `/listings/${property._id}`;
  const bookHref = `/customer/visits/new?property=${property._id}`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition hover:border-[var(--accent)]">
      <div className="relative aspect-[16/10] shrink-0 bg-[color-mix(in_oklab,var(--accent)_8%,transparent)]">
        <Image
          src={src}
          alt={property.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {showScore ? (
          <span className="absolute left-3 top-3 rounded-lg bg-[var(--accent)] px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            {Math.round(item.matchScore)}% Match
          </span>
        ) : (
          <span className="absolute left-3 top-3 rounded-lg bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
            Filter match
          </span>
        )}
        <button
          type="button"
          aria-label={favorited ? "Remove favorite" : "Add favorite"}
          disabled={busy}
          className="absolute right-3 top-3 rounded-full bg-black/45 p-2 text-white shadow-sm backdrop-blur transition hover:scale-105 disabled:opacity-60"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void toggle(`${detailsHref}?action=favorite`);
          }}
        >
          <Heart
            size={16}
            className={favorited ? "fill-red-500 text-red-500" : ""}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col space-y-3 p-4">
        <div>
          <p className="text-lg font-semibold tracking-tight text-[var(--accent)]">
            {formatMoney(property.price, property.currency)}
          </p>
          <h3 className="mt-1 line-clamp-2 font-semibold tracking-tight">
            {property.title}
          </h3>
          <p className="mt-1.5 flex items-start gap-1.5 text-xs text-[var(--muted)]">
            <MapPin size={14} className="mt-0.5 shrink-0" />
            <span>{location}</span>
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-1.5">
            <BedDouble size={14} className="shrink-0 text-[var(--accent)]" />
            <span>{property.bedrooms} Bedrooms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath size={14} className="shrink-0 text-[var(--accent)]" />
            <span>{property.bathrooms} Bathrooms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize2 size={14} className="shrink-0 text-[var(--accent)]" />
            <span>
              {property.areaSqFt ? `${property.areaSqFt} Sq Ft` : "Area —"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 capitalize">
            <Building2 size={14} className="shrink-0 text-[var(--accent)]" />
            <span>{property.type}</span>
          </div>
        </dl>

        {showScore ? (
          <div className="rounded-xl bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] px-3 py-2 text-xs">
            <p className="font-medium text-[var(--accent)]">Recommended because</p>
            <ul className="mt-1.5 space-y-1 text-[var(--muted)]">
              {(item.highlights?.length
                ? item.highlights.slice(0, 3)
                : [item.reason]
              ).map((line) => (
                <li key={line} className="flex gap-1.5">
                  <Check size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-xs text-[var(--muted)]">
            Matched based on your search filters.
          </p>
        )}

        <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
          <Link
            href={detailsHref}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-2.5 text-xs font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <Eye size={14} />
            View Details
          </Link>
          <Link
            href={bookHref}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] px-3 py-2.5 text-xs font-semibold text-white hover:opacity-90"
          >
            <CalendarDays size={14} />
            Book Visit
          </Link>
        </div>
      </div>
    </article>
  );
}

export function AiMatchLoading({ count = 3 }: { count?: number }) {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-[var(--border)]"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="aspect-[16/10] animate-pulse bg-[var(--border)]" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-1/2 animate-pulse rounded bg-[var(--border)]" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--border)]" />
              <div className="h-3 w-full animate-pulse rounded bg-[var(--border)]" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-9 animate-pulse rounded-xl bg-[var(--border)]" />
                <div className="h-9 animate-pulse rounded-xl bg-[var(--border)]" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        Finding your best property matches…
      </p>
    </div>
  );
}

export function AiMatchEmpty({
  summary,
  suggestions,
}: {
  summary?: string;
  suggestions?: string[];
}) {
  const tips =
    suggestions?.length
      ? suggestions
      : [
          "Increase your budget",
          "Change location",
          "Remove some filters",
        ];

  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-10 text-center">
      <p className="text-base font-semibold">No matching properties found.</p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {summary && !/no propert/i.test(summary)
          ? summary
          : "Try adjusting your search criteria."}
      </p>
      <ul className={clsx("mx-auto mt-4 max-w-sm space-y-1.5 text-left text-sm text-[var(--muted)]")}>
        <li className="font-medium text-[var(--foreground)]">Suggestions</li>
        {tips.map((tip) => (
          <li key={tip} className="flex gap-2">
            <span className="text-[var(--accent)]">•</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
