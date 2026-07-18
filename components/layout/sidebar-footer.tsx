"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, LogOut, Moon, Sun } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useThemeStore } from "@/store/theme-store";

/**
 * Shared dashboard sidebar footer for Customer, Agent, and Admin.
 * Order: Back to Home → Theme toggle → Logout
 */
export function SidebarFooter() {
  const router = useRouter();
  const { theme, toggleTheme, hydrate } = useThemeStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      setConfirmOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <div className="mt-auto shrink-0 space-y-1 border-t border-[var(--border)] pt-4">
        <Link
          href="/"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] hover:text-[var(--foreground)]"
        >
          <Home size={18} />
          Back to Home
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] hover:text-[var(--foreground)]"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>

        <div className="my-2 border-t border-[var(--border)]" />

        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] hover:text-[var(--danger)]"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow)]">
            <h2 id="logout-title" className="text-lg font-semibold tracking-tight">
              Log out?
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              You will be signed out and returned to the home page. Your theme preference is kept.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium"
                onClick={() => setConfirmOpen(false)}
                disabled={loggingOut}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-[var(--danger)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                onClick={onLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
