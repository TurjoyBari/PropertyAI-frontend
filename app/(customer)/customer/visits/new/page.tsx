import { Suspense } from "react";
import { CustomerBookVisitView } from "@/components/visits/customer-book-visit-view";

export default function NewCustomerVisitPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="h-48 animate-pulse rounded-2xl bg-[var(--border)]" />
        </div>
      }
    >
      <CustomerBookVisitView />
    </Suspense>
  );
}
