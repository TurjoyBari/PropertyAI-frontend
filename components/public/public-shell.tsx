"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import { useSession } from "@/lib/auth-client";
import { UserMenu, type AuthUser } from "@/components/public/user-menu";

const links = [
  { href: "/listings?intent=buy", label: "Buy", match: "buy" as const },
  { href: "/listings?intent=rent", label: "Rent", match: "rent" as const },
  {
    href: "/listings?type=commercial",
    label: "Commercial",
    match: "commercial" as const,
  },
  { href: "/agents", label: "Agents", match: "path" as const },
  { href: "/about", label: "About", match: "path" as const },
  { href: "/contact", label: "Contact", match: "path" as const },
  { href: "/blog", label: "Blog", match: "path" as const },
];

function isLinkActive(
  link: (typeof links)[number],
  pathname: string,
  searchParams: URLSearchParams,
) {
  if (link.match === "buy") {
    return pathname.startsWith("/listings") && searchParams.get("intent") === "buy";
  }
  if (link.match === "rent") {
    return pathname.startsWith("/listings") && searchParams.get("intent") === "rent";
  }
  if (link.match === "commercial") {
    return pathname.startsWith("/listings") && searchParams.get("type") === "commercial";
  }

  const path = link.href.split("?")[0];
  return pathname === path || pathname.startsWith(`${path}/`);
}

function PublicShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const user = session?.user as AuthUser | undefined;
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_88%,transparent)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <Link href="/" className="font-display text-xl font-semibold tracking-tight">
            PropertyAI
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={clsx(
                  "rounded-lg px-3 py-2 text-sm font-medium transition",
                  isLinkActive(link, pathname, searchParams)
                    ? "text-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {!isPending && user ? (
              <UserMenu user={user} variant="desktop" />
            ) : !isPending ? (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium sm:inline-flex"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="h-9 w-9 animate-pulse rounded-full bg-[var(--border)]" />
            )}
            <button
              type="button"
              className="rounded-lg border border-[var(--border)] p-2 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {open ? (
          <div className="border-t border-[var(--border)] px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={clsx(
                    "rounded-lg px-3 py-2 text-sm",
                    isLinkActive(link, pathname, searchParams) && "text-[var(--accent)]",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-2 border-t border-[var(--border)]" />

              {!user ? (
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    href="/login"
                    className="rounded-xl border border-[var(--border)] px-3 py-2 text-center text-sm font-medium"
                    onClick={() => setOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-xl bg-[var(--accent)] px-3 py-2 text-center text-sm font-semibold text-white"
                    onClick={() => setOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </header>

      <main>{children}</main>

      <footer className="mt-20 border-t border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
          <div>
            <p className="font-display text-xl font-semibold">PropertyAI</p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              AI-powered real estate discovery for Bangladesh — search, match, book visits,
              and talk to trusted agents.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Explore</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)]">
              <Link href="/listings?intent=buy">Buy</Link>
              <Link href="/listings?intent=rent">Rent</Link>
              <Link href="/listings?type=commercial">Commercial</Link>
              <Link href="/finder">AI Property Finder</Link>
              <Link href="/agents">Agents</Link>
              <Link href="/blog">Blog</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Company</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)]">
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Newsletter</p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Weekly market picks and AI tips.
            </p>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <input
                type="email"
                required
                placeholder="Email"
                className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white"
              >
                Join
              </button>
            </form>
            <div className="mt-4 flex gap-3 text-sm text-[var(--muted)]">
              <a href="https://facebook.com" target="_blank" rel="noreferrer">
                Facebook
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                Instagram
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--border)] py-5 text-center text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} PropertyAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]">{children}</div>}>
      <PublicShellInner>{children}</PublicShellInner>
    </Suspense>
  );
}
