import { Suspense } from "react";
import { PropertiesView } from "@/components/properties/properties-view";

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-16 animate-pulse rounded-2xl bg-[var(--border)]" />
          <div className="h-24 animate-pulse rounded-2xl bg-[var(--border)]" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-2xl bg-[var(--border)]"
              />
            ))}
          </div>
        </div>
      }
    >
      <PropertiesView />
    </Suspense>
  );
}
