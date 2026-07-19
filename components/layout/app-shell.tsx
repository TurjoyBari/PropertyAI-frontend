"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useSession } from "@/lib/auth-client";
import { getRole, homeForRole } from "@/lib/roles";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/agent/dashboard": "Dashboard",
  "/properties": "Properties",
  "/leads": "Leads",
  "/pipeline": "Pipeline",
  "/visits": "Visits",
  "/reports": "Reports",
  "/notifications": "Notifications",
  "/ai": "AI Studio",
  "/messages": "Messages",
  "/admin": "Users & roles",
  "/admin/dashboard": "Dashboard",
  "/admin/messages": "Messages",
};

function resolveTitle(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const match = Object.keys(PAGE_TITLES)
    .filter((key) => key !== "/" && pathname.startsWith(`${key}/`))
    .sort((a, b) => b.length - a.length)[0];
  if (match) {
    if (pathname.startsWith("/properties/")) return "Property details";
    if (pathname.startsWith("/leads/")) return "Lead details";
    if (pathname.startsWith("/visits/")) return "Visit details";
    return PAGE_TITLES[match];
  }
  return "Overview";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = getRole(session?.user as { role?: string });
  const pageTitle = useMemo(() => resolveTitle(pathname), [pathname]);
  const homeLabel = role === "admin" ? "Admin Dashboard" : "Agent Dashboard";
  const homeHref = homeForRole(role);

  return (
    <div className="min-h-screen lg:flex">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <AppSidebar />
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 shadow-xl">
            <AppSidebar />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_88%,transparent)] px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-[var(--border)] p-2 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
            <nav
              aria-label="Breadcrumb"
              className="flex min-w-0 items-center gap-2 text-sm text-[var(--muted)]"
            >
              <Link
                href={homeHref}
                className="shrink-0 font-medium hover:text-[var(--foreground)]"
              >
                {homeLabel}
              </Link>
              <span aria-hidden className="text-[var(--border)]">
                ›
              </span>
              <span className="truncate font-medium text-[var(--foreground)]">
                {pageTitle}
              </span>
            </nav>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
