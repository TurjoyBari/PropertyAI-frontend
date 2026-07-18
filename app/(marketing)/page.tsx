import Link from "next/link";

export default function HomePage() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,color-mix(in_oklab,var(--accent)_14%,transparent)_50%,transparent_100%)]" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
        <div>
          <p className="text-sm font-medium tracking-[0.18em] text-[var(--accent)] uppercase">
            PropertyAI
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Find your next home with AI.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Browse listings, match properties to your budget, and book site visits —
            or manage leads as an agent from one OS.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/listings"
              className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Browse listings
            </Link>
            <Link
              href="/finder"
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-3 text-sm font-semibold"
            >
              AI Property Finder
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <p className="text-sm font-semibold">What you can do</p>
          <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <li>Search & filter available properties</li>
            <li>Get Gemini-ranked matches with scores</li>
            <li>Contact agents and schedule visits</li>
            <li>Customers, agents, and admins each get their own workspace</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
