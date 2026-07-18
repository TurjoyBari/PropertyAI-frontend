"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PropertyForm } from "@/components/properties/property-form";
import { createProperty } from "@/services/properties.service";

export default function NewPropertyPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/properties" className="text-sm text-[var(--accent)] hover:underline">
          ← Back to properties
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Add property</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Create a new listing. Image upload service comes later — use image URLs for now.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <PropertyForm
          submitLabel="Create property"
          onSubmit={async (values) => {
            const created = await createProperty(values);
            router.push(`/properties/${created._id}`);
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
