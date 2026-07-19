"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  Heart,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { SidebarFooter } from "@/components/layout/sidebar-footer";
import { listNotifications } from "@/services/notifications.service";
import { ProfileAvatar } from "@/components/ui/profile-avatar";

const nav = [
  { href: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customer/favorites", label: "Saved Properties", icon: Heart },
  { href: "/customer/visits", label: "My Visits", icon: CalendarDays },
  { href: "/customer/ai", label: "AI Property Finder", icon: Sparkles },
  { href: "/customer/messages", label: "Messages", icon: MessageSquare },
  { href: "/customer/notifications", label: "Notifications", icon: Bell },
  { href: "/customer/profile", label: "Profile", icon: UserRound },
  { href: "/customer/settings", label: "Settings", icon: Settings },
];

function CustomerSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="flex h-full w-[17.5rem] flex-col border-r border-[var(--border)] bg-[color-mix(in_oklab,var(--card)_92%,transparent)] px-4 py-5 backdrop-blur-xl">
      <div className="rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[#134e4a] px-4 py-4 text-white shadow-sm">
        <p className="text-lg font-semibold tracking-tight">PropertyAI</p>
        <p className="mt-1 text-xs text-white/75">Customer workspace</p>
      </div>

      <nav className="mt-6 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/customer/dashboard"
              ? pathname === "/customer/dashboard" || pathname === "/customer"
              : pathname === item.href ||
                (item.href !== "/customer" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={clsx(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                  : "text-[var(--muted)] hover:bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] hover:text-[var(--foreground)]",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="customer-nav-pill"
                  className="absolute inset-0 rounded-xl bg-[var(--accent-soft)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : null}
              <span className="relative z-10 inline-flex items-center gap-3">
                <Icon size={18} />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 py-3">
        <p className="truncate text-sm font-medium">
          {session?.user?.name || "User"}
        </p>
        <p className="truncate text-xs text-[var(--muted)]">
          {session?.user?.email}
        </p>
      </div>

      <SidebarFooter
        homeLabel="Home Website"
        themeDarkLabel="Dark Mode"
        themeLightLabel="Light Mode"
      />
    </aside>
  );
}

export function CustomerShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    listNotifications()
      .then((items) =>
        setUnread(items.filter((n) => n.status !== "read").length),
      )
      .catch(() => setUnread(0));
  }, []);

  const image = useMemo(
    () => (session?.user as { image?: string } | undefined)?.image,
    [session?.user],
  );

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/listings?search=${encodeURIComponent(q)}` : "/listings");
  };

  return (
    <div className="min-h-screen lg:flex">
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-[17.5rem]">
        <CustomerSidebar />
      </div>

      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              className="absolute inset-0 bg-black/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 left-0 shadow-2xl"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 360, damping: 32 }}
            >
              <CustomerSidebar onNavigate={() => setOpen(false)} />
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-[17.5rem]">
        <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_78%,transparent)] backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3 lg:px-8">
            <button
              type="button"
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>

            <form onSubmit={onSearch} className="relative min-w-0 flex-1 max-w-xl">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search properties, areas, or keywords…"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-2.5 pl-9 pr-3 text-sm outline-none ring-[var(--accent)] placeholder:text-[var(--muted)] focus:ring-2"
              />
            </form>

            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/customer/notifications"
                className="relative rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5 transition hover:border-[var(--accent)]"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unread > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-semibold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                ) : null}
              </Link>

              <Link
                href="/customer/profile"
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] py-1.5 pl-1.5 pr-3 transition hover:border-[var(--accent)]"
              >
                <ProfileAvatar
                  src={image}
                  name={session?.user?.name}
                  email={session?.user?.email}
                  sizeClassName="h-8 w-8 text-xs"
                  roundedClassName="rounded-lg"
                />
                <span className="hidden max-w-[8rem] truncate text-sm font-medium sm:inline">
                  {session?.user?.name || "Profile"}
                </span>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
