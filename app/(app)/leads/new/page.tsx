"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LeadForm } from "@/components/leads/lead-form";
import { createLead } from "@/services/leads.service";

export default function NewLeadPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/leads" className="text-sm text-[var(--accent)] hover:underline">
          ← Back to leads
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Add lead</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Capture prospect details and start them in the pipeline.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <LeadForm
          submitLabel="Create lead"
          onSubmit={async (values) => {
            const created = await createLead(values);
            router.push(`/leads/${created._id}`);
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
