"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { VisitForm } from "@/components/visits/visit-form";
import { createVisit } from "@/services/visits.service";

export default function NewVisitPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/visits" className="text-sm text-[var(--accent)] hover:underline">
          ← Back to visits
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Schedule visit</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Pick a lead, property, and time. The lead moves to Visit Scheduled.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <VisitForm
          submitLabel="Schedule visit"
          onSubmit={async (values) => {
            const visit = await createVisit(values);
            router.push(`/visits/${visit._id}`);
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
