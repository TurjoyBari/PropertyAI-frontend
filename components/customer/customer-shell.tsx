"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  CalendarDays,
  Heart,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import clsx from "clsx";
import { useSession } from "@/lib/auth-client";
import { SidebarFooter } from "@/components/layout/sidebar-footer";

const nav = [
  { href: "/customer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customer/favorites", label: "Favorites", icon: Heart },
  { href: "/customer/visits", label: "My visits", icon: CalendarDays },
  { href: "/customer/messages", label: "Messages", icon: MessageSquare },
  { href: "/customer/ai", label: "AI Finder", icon: Sparkles },
  { href: "/customer/notifications", label: "Notifications", icon: Bell },
  { href: "/customer/settings", label: "Settings", icon: Settings },
];

function CustomerSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[var(--border)] bg-[var(--card)] px-4 py-5">
      <div className="px-2">
        <p className="text-lg font-semibold tracking-tight">PropertyAI</p>
        <p className="mt-1 text-xs text-[var(--muted)]">Customer</p>
      </div>

      <nav className="mt-8 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {nav.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/customer" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--muted)] hover:bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] hover:text-[var(--foreground)]",
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 shrink-0 rounded-xl bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] px-3 py-3">
        <p className="truncate text-sm font-medium">{session?.user?.name || "User"}</p>
        <p className="truncate text-xs text-[var(--muted)]">{session?.user?.email}</p>
      </div>

      <SidebarFooter />
    </aside>
  );
}

export function CustomerShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <CustomerSidebar />
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
            <CustomerSidebar />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_88%,transparent)] px-4 py-3 backdrop-blur lg:px-8">
          <button
            type="button"
            className="rounded-lg border border-[var(--border)] p-2 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <p className="ml-3 text-sm text-[var(--muted)] lg:ml-0">Customer portal</p>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
