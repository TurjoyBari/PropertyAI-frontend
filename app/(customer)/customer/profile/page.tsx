"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { roleLabel } from "@/lib/roles";
import { CustomerPageHeader } from "@/components/customer/page-header";
import { PageTransition } from "@/components/customer/page-transition";
import { useThemeStore } from "@/store/theme-store";

function avatarInitials(name?: string | null) {
  if (!name?.trim()) return "U";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function CustomerProfilePage() {
  const { data: session, isPending } = useSession();
  const { theme, toggleTheme } = useThemeStore();
  const user = session?.user;
  const image = (user as { image?: string } | undefined)?.image;
  const role = (user as { role?: string } | undefined)?.role;

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-8">
        <CustomerPageHeader
          title="Profile"
          subtitle="Your account details and quick preferences."
        />

        <section className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] shadow-[0_8px_30px_rgba(20,32,28,0.04)]">
          <div className="bg-gradient-to-br from-[var(--accent)] to-[#134e4a] px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/30 bg-white/15">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-semibold">
                    {avatarInitials(user?.name)}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-white/75">Signed in as</p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {isPending ? "…" : user?.name || "Customer"}
                </h2>
                <p className="mt-1 text-sm text-white/80">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Name</p>
              <p className="mt-1 text-sm font-medium">{user?.name || "—"}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Email</p>
              <p className="mt-1 text-sm font-medium">{user?.email || "—"}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Role</p>
              <p className="mt-1 text-sm font-medium">{roleLabel(role)}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Theme</p>
              <button
                type="button"
                onClick={toggleTheme}
                className="mt-1 text-sm font-semibold text-[var(--accent)] hover:underline"
              >
                {theme === "dark" ? "Dark — switch to light" : "Light — switch to dark"}
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/customer/settings"
            className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Open settings
          </Link>
          <Link
            href="/customer/favorites"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium"
          >
            Saved properties
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
