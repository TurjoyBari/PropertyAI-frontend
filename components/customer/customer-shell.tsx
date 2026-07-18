"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import { signOut, useSession } from "@/lib/auth-client";

const nav = [
  { href: "/customer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customer/favorites", label: "Favorites", icon: Heart },
  { href: "/customer/visits", label: "My visits", icon: CalendarDays },
  { href: "/customer/messages", label: "Messages", icon: MessageSquare },
  { href: "/customer/ai", label: "AI Finder", icon: Sparkles },
  { href: "/customer/notifications", label: "Notifications", icon: Bell },
  { href: "/customer/settings", label: "Settings", icon: Settings },
];

export function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-64 flex-col border-r border-[var(--border)] bg-[var(--card)] px-4 py-5 lg:flex">
        <p className="px-2 text-lg font-semibold">PropertyAI</p>
        <p className="mt-1 px-2 text-xs text-[var(--muted)]">Customer</p>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
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
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]",
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)]"
          onClick={async () => {
            await signOut();
            router.push("/login");
          }}
        >
          <LogOut size={18} />
          Sign out ({session?.user?.name || "User"})
        </button>
      </aside>
      <div className="flex-1 px-4 py-6 lg:px-8">{children}</div>
    </div>
  );
}
