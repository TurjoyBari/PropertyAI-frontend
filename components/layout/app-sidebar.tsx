"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  CalendarDays,
  KanbanSquare,
  LayoutDashboard,
  Users,
  BarChart3,
  Sparkles,
  Shield,
  MessageSquare,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useMemo } from "react";
import clsx from "clsx";
import { getRole } from "@/lib/roles";
import { SidebarFooter } from "@/components/layout/sidebar-footer";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = getRole(session?.user as { role?: string });

  const navItems = useMemo(() => {
    const messagesHref =
      role === "admin" ? "/admin/messages" : "/messages";

    const items = [
      {
        href: role === "admin" ? "/admin/dashboard" : "/agent/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      { href: "/properties", label: "Properties", icon: Building2 },
      { href: "/leads", label: "Leads", icon: Users },
      { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
      { href: "/visits", label: "Visits", icon: CalendarDays },
      { href: "/reports", label: "Reports", icon: BarChart3 },
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/ai", label: "AI Studio", icon: Sparkles },
      { href: messagesHref, label: "Messages", icon: MessageSquare },
    ];

    if (role === "admin") {
      items.splice(1, 0, { href: "/admin", label: "Users & roles", icon: Shield });
    }

    return items;
  }, [role]);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[var(--border)] bg-[var(--card)] px-4 py-5">
      <div className="px-2">
        <p className="text-lg font-semibold tracking-tight">PropertyAI</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {role === "admin" ? "Admin" : "Agent"} · Real Estate OS
        </p>
      </div>

      <nav className="mt-8 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : item.href === "/customer/dashboard" ||
                  item.href === "/admin/dashboard" ||
                  item.href === "/agent/dashboard"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={`${item.label}-${item.href}`}
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
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 shrink-0 rounded-xl bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] px-3 py-3">
        <p className="truncate text-sm font-medium">
          {session?.user?.name || "User"}
        </p>
        <p className="truncate text-xs text-[var(--muted)]">
          {session?.user?.email}
        </p>
      </div>

      <SidebarFooter />
    </aside>
  );
}
