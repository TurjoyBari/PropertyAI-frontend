"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { roleLabel } from "@/lib/roles";
import { useThemeStore } from "@/store/theme-store";
import { CustomerPageHeader } from "@/components/customer/page-header";
import { PageTransition } from "@/components/customer/page-transition";

export default function CustomerSettingsPage() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useThemeStore();
  const role = (session?.user as { role?: string } | undefined)?.role;

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-8">
        <CustomerPageHeader
          title="Settings"
          subtitle="Preferences for your customer workspace."
        />

        <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_8px_30px_rgba(20,32,28,0.04)]">
          <h2 className="text-lg font-semibold tracking-tight">Account</h2>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] px-4 py-3">
              <p className="text-xs text-[var(--muted)]">Name</p>
              <p className="mt-1 font-medium">{session?.user?.name || "—"}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] px-4 py-3">
              <p className="text-xs text-[var(--muted)]">Email</p>
              <p className="mt-1 font-medium">{session?.user?.email || "—"}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] px-4 py-3">
              <p className="text-xs text-[var(--muted)]">Role</p>
              <p className="mt-1 font-medium">{roleLabel(role)}</p>
            </div>
          </div>
          <Link
            href="/customer/profile"
            className="inline-flex text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            View full profile →
          </Link>
        </section>

        <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_8px_30px_rgba(20,32,28,0.04)]">
          <h2 className="text-lg font-semibold tracking-tight">Appearance</h2>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] px-4 py-3">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-[var(--muted)]">
                Currently {theme === "dark" ? "dark" : "light"} mode
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Toggle theme
            </button>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_8px_30px_rgba(20,32,28,0.04)]">
          <h2 className="text-lg font-semibold tracking-tight">Shortcuts</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/customer/notifications"
              className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            >
              Notifications
            </Link>
            <Link
              href="/customer/messages"
              className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            >
              Messages
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            >
              Home website
            </Link>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
