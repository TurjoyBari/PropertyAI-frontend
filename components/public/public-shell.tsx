"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useSession } from "@/lib/auth-client";
import { homeForRole, getRole } from "@/lib/roles";

const links = [
  { href: "/listings", label: "Listings" },
  { href: "/finder", label: "AI Finder" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = getRole(session?.user as { role?: string });
  const appHome = homeForRole(role);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_90%,transparent)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            PropertyAI
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "rounded-lg px-3 py-2 text-sm font-medium",
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "text-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {session?.user ? (
              <Link
                href={appHome}
                className="rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white"
              >
                Open app
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--muted)]">
        PropertyAI — Real Estate AI OS
      </footer>
    </div>
  );
}
