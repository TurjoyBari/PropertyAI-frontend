"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { propertyImage } from "@/lib/home-content";
import { useFavorite } from "@/hooks/use-favorite";
import { cardHover } from "@/components/customer/page-transition";
import type { Property } from "@/types/property";

type CardProperty = Pick<
  Property,
  "_id" | "title" | "price" | "currency" | "bedrooms" | "bathrooms" | "images"
> & {
  areaSqFt?: number;
  purpose?: string;
  location?: {
    address?: string;
    city?: string;
    area?: string;
  };
};

export function CustomerPropertyCard({
  property,
  compact = false,
}: {
  property: CardProperty;
  compact?: boolean;
}) {
  const { favorited, busy, toggle } = useFavorite(property._id);
  const src = propertyImage(property);
  const address = [
    property.location?.address,
    property.location?.area,
    property.location?.city,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <motion.article
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardHover}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_8px_30px_rgba(20,32,28,0.04)]"
    >
      <div className={clsx("relative overflow-hidden", compact ? "aspect-[16/10]" : "aspect-[4/3]")}>
        <Image
          src={src}
          alt={property.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <button
          type="button"
          aria-label={favorited ? "Remove favorite" : "Save favorite"}
          disabled={busy}
          className="absolute right-3 top-3 rounded-full bg-black/45 p-2 text-white shadow-sm backdrop-blur transition hover:scale-105 disabled:opacity-60"
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
        <p className="text-lg font-semibold tracking-tight text-[var(--accent)]">
          {property.price.toLocaleString()} {property.currency || "BDT"}
          {property.purpose === "rent" ? (
            <span className="text-sm font-medium text-[var(--muted)]"> /mo</span>
          ) : null}
        </p>
        <h3 className="line-clamp-1 font-semibold tracking-tight">{property.title}</h3>
        <p className="line-clamp-1 text-xs text-[var(--muted)]">{address || "Dhaka"}</p>
        <p className="text-xs text-[var(--muted)]">
          {property.bedrooms ?? "—"} bed · {property.bathrooms ?? "—"} bath
          {property.areaSqFt ? ` · ${property.areaSqFt.toLocaleString()} sqft` : ""}
        </p>
        <Link
          href={`/listings/${property._id}`}
          className="inline-flex pt-1 text-sm font-semibold text-[var(--accent)] transition hover:underline"
        >
          View details
        </Link>
      </div>
    </motion.article>
  );
}
