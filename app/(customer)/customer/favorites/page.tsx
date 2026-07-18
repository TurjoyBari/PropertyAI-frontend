"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listFavorites, removeFavorite } from "@/services/favorites.service";
import type { FavoriteItem } from "@/services/favorites.service";

export default function CustomerFavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = () =>
    listFavorites()
      .then((data) => setItems(data.items))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"));

  useEffect(() => {
    reload();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Saved properties</h1>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No favorites yet. <Link href="/listings" className="text-[var(--accent)]">Browse listings</Link>
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div>
                <Link href={`/listings/${item.property._id}`} className="font-semibold hover:underline">
                  {item.property.title}
                </Link>
                <p className="text-xs text-[var(--muted)]">{item.property.location?.city}</p>
              </div>
              <button
                type="button"
                className="text-sm text-[var(--danger)]"
                onClick={async () => {
                  await removeFavorite(item.property._id);
                  await reload();
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
