"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listFavorites, removeFavorite } from "@/services/favorites.service";
import type { FavoriteItem } from "@/services/favorites.service";
import { toast } from "@/store/toast-store";

export default function CustomerFavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

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
          No favorites yet.{" "}
          <Link href="/listings" className="text-[var(--accent)]">
            Browse listings
          </Link>
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div>
                <Link
                  href={`/listings/${item.property._id}`}
                  className="font-semibold hover:underline"
                >
                  {item.property.title}
                </Link>
                <p className="text-xs text-[var(--muted)]">
                  {item.property.location?.city}
                  {item.property.location?.area
                    ? ` · ${item.property.location.area}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                disabled={removingId === item.property._id}
                className="text-sm text-[var(--danger)] disabled:opacity-60"
                onClick={async () => {
                  setRemovingId(item.property._id);
                  try {
                    await removeFavorite(item.property._id);
                    setItems((prev) => prev.filter((row) => row._id !== item._id));
                    toast("Property removed from your favorites.");
                  } catch (err) {
                    toast(
                      err instanceof Error ? err.message : "Could not remove favorite",
                      "error",
                    );
                  } finally {
                    setRemovingId(null);
                  }
                }}
              >
                {removingId === item.property._id ? "Removing..." : "Remove"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
