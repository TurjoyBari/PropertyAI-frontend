import { Suspense } from "react";
import ListingsPageClient from "./listings-client";

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="h-40 animate-pulse rounded-2xl bg-[var(--border)]" />
        </div>
      }
    >
      <ListingsPageClient />
    </Suspense>
  );
}
