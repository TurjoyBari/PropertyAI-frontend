"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { VisitForm } from "@/components/visits/visit-form";
import { createVisit } from "@/services/visits.service";

export default function NewCustomerVisitPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/customer/visits" className="text-sm text-[var(--accent)] hover:underline">
        ← My visits
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">Book a site visit</h1>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <VisitForm
          submitLabel="Book visit"
          onSubmit={async (values) => {
            await createVisit(values);
            router.push("/customer/visits");
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
