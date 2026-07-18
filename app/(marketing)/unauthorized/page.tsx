import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">403</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
        Unauthorized access
      </h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        You do not have permission to view that dashboard. Return home or open the workspace for
        your role.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Back to Home
        </Link>
        <Link
          href="/login"
          className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
