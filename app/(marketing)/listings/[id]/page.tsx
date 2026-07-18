import { Suspense } from "react";
import { ListingDetailClient } from "./detail-client";

export default function ListingDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="h-72 animate-pulse rounded-2xl bg-[var(--border)]" />
        </div>
      }
    >
      <ListingDetailClient />
    </Suspense>
  );
}
