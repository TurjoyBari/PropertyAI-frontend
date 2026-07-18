import Link from "next/link";

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Customer dashboard</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Saved homes, visits, messages, and AI recommendations.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/customer/favorites", title: "Favorites", body: "Homes you saved" },
          { href: "/customer/visits", title: "Visits", body: "Upcoming site tours" },
          { href: "/customer/ai", title: "AI Finder", body: "Match by budget & location" },
          { href: "/listings", title: "Browse listings", body: "Public property catalog" },
          { href: "/customer/messages", title: "Messages", body: "Chat with agents" },
          { href: "/customer/settings", title: "Settings", body: "Profile & preferences" },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-[var(--accent)]"
          >
            <p className="font-semibold">{card.title}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{card.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
