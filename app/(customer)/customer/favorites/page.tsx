"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listFavorites, removeFavorite } from "@/services/favorites.service";
import type { FavoriteItem } from "@/services/favorites.service";
import { CustomerPropertyCard } from "@/components/customer/customer-property-card";
import { CustomerPageHeader } from "@/components/customer/page-header";
import { PageTransition } from "@/components/customer/page-transition";
import { PropertyCardSkeleton } from "@/components/customer/skeleton";
import { toast } from "@/store/toast-store";

export default function CustomerFavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listFavorites()
      .then((data) => setItems(data.items))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <div className="space-y-8">
        <CustomerPageHeader
          title="Saved Properties"
          subtitle="Homes you liked — revisit anytime and book a tour when you’re ready."
          action={
            <Link
              href="/listings"
              className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Browse listings
            </Link>
          }
        />

        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-14 text-center">
            <p className="text-sm text-[var(--muted)]">
              No favorites yet.{" "}
              <Link href="/listings" className="font-medium text-[var(--accent)] hover:underline">
                Explore listings
              </Link>{" "}
              and tap the heart to save homes here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <div key={item._id} className="relative">
                <CustomerPropertyCard property={item.property} />
                <button
                  type="button"
                  className="absolute bottom-4 right-4 rounded-lg bg-[var(--card)]/95 px-2.5 py-1 text-xs font-medium text-[var(--danger)] shadow-sm backdrop-blur"
                  onClick={async () => {
                    try {
                      await removeFavorite(item.property._id);
                      setItems((prev) => prev.filter((row) => row._id !== item._id));
                      toast("Property removed from your favorites.");
                    } catch (err) {
                      toast(
                        err instanceof Error ? err.message : "Could not remove",
                        "error",
                      );
                    }
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
