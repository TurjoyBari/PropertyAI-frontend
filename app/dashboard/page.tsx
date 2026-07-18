"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const onSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--accent)]">PropertyAI</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[color-mix(in_oklab,var(--accent)_8%,transparent)]"
        >
          Sign out
        </button>
      </header>

      <section
        className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
        style={{ boxShadow: "var(--shadow)" }}
      >
        {isPending ? (
          <p className="text-sm text-[var(--muted)]">Loading session...</p>
        ) : (
          <>
            <p className="text-sm text-[var(--muted)]">Signed in as</p>
            <p className="mt-1 text-xl font-semibold">
              {session?.user?.name || "User"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">{session?.user?.email}</p>
            <p className="mt-4 inline-flex rounded-lg bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
              Role: {(session?.user as { role?: string } | undefined)?.role || "user"}
            </p>
          </>
        )}
      </section>

      <p className="mt-8 text-sm text-[var(--muted)]">
        This is a protected placeholder. Full analytics, properties, and leads arrive in the next
        milestones.{" "}
        <Link href="/" className="font-medium text-[var(--accent)] hover:underline">
          Back home
        </Link>
      </p>
    </main>
  );
}
