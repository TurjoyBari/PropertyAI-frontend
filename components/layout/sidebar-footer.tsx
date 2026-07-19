"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, LogOut, Moon, Sun } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useThemeStore } from "@/store/theme-store";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

/**
 * Shared dashboard sidebar footer for Customer, Agent, and Admin.
 * Order: Back to Home → Theme toggle → Logout
 */
export function SidebarFooter({
  homeLabel = "Back to Home",
  themeDarkLabel = "Dark mode",
  themeLightLabel = "Light mode",
}: {
  homeLabel?: string;
  themeDarkLabel?: string;
  themeLightLabel?: string;
}) {
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
          {homeLabel}
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] hover:text-[var(--foreground)]"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {theme === "dark" ? themeLightLabel : themeDarkLabel}
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

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Logout"
        description="Are you sure you want to logout?"
        cancelLabel="Cancel"
        confirmLabel="Logout"
        confirmLoadingLabel="Logging out…"
        tone="danger"
        loading={loggingOut}
        onConfirm={onLogout}
      />
    </>
  );
}
