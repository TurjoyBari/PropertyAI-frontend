"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Building2,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  Users,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { useThemeStore } from "@/store/theme-store";
import { useEffect } from "react";
import clsx from "clsx";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/dashboard#leads", label: "Leads", icon: Users, soon: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, toggleTheme, hydrate } = useThemeStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const onSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[var(--border)] bg-[var(--card)] px-4 py-5">
      <div className="px-2">
        <p className="text-lg font-semibold tracking-tight">PropertyAI</p>
        <p className="mt-1 text-xs text-[var(--muted)]">Real Estate OS</p>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.label}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--muted)] hover:bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] hover:text-[var(--foreground)]",
              )}
            >
              <Icon size={18} />
              <span className="flex-1">{item.label}</span>
              {item.soon ? (
                <span className="text-[10px] uppercase tracking-wide opacity-70">Soon</span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-[var(--border)] pt-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] hover:bg-[color-mix(in_oklab,var(--accent)_8%,transparent)]"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>

        <div className="rounded-xl bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] px-3 py-3">
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <Bell size={14} />
            Signed in
          </div>
          <p className="mt-1 truncate text-sm font-medium">
            {session?.user?.name || "User"}
          </p>
          <p className="truncate text-xs text-[var(--muted)]">{session?.user?.email}</p>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] hover:bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] hover:text-[var(--danger)]"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
