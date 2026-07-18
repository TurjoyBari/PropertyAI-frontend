import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,color-mix(in_oklab,var(--accent)_12%,transparent)_45%,transparent_100%)]" />
      <div className="relative max-w-2xl text-center">
        <p className="text-sm font-medium tracking-[0.18em] text-[var(--accent)] uppercase">
          PropertyAI
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
          Real Estate AI OS
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          Manage properties, leads, and AI-assisted sales from one premium workspace.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-3 text-sm font-semibold transition hover:bg-[color-mix(in_oklab,var(--accent)_8%,transparent)]"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
