"use client";

import { useSession } from "@/lib/auth-client";

export default function CustomerSettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-sm">
        <p>
          <span className="text-[var(--muted)]">Name:</span> {session?.user?.name}
        </p>
        <p className="mt-2">
          <span className="text-[var(--muted)]">Email:</span> {session?.user?.email}
        </p>
        <p className="mt-2">
          <span className="text-[var(--muted)]">Role:</span>{" "}
          {(session?.user as { role?: string } | undefined)?.role || "user"}
        </p>
      </div>
    </div>
  );
}
