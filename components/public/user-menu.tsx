"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Heart,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Sun,
  UserRound,
  Users,
} from "lucide-react";
import clsx from "clsx";
import { signOut } from "@/lib/auth-client";
import {
  getRole,
  menuItemsForRole,
  roleLabel,
  type NavMenuItem,
} from "@/lib/roles";
import { useThemeStore } from "@/store/theme-store";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProfileAvatar } from "@/components/ui/profile-avatar";

export type AuthUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
};

const ICONS = {
  dashboard: LayoutDashboard,
  profile: UserRound,
  favorites: Heart,
  visits: CalendarDays,
  leads: Users,
  settings: Settings,
} as const;

export function UserAvatar({
  user,
  size = "md",
}: {
  user: AuthUser;
  size?: "sm" | "md";
}) {
  return (
    <ProfileAvatar
      src={user.image}
      name={user.name}
      email={user.email}
      sizeClassName={size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm"}
      className="ring-2 ring-[var(--border)]"
    />
  );
}

export function UserMenu({
  user,
  variant = "desktop",
  onNavigate,
}: {
  user: AuthUser;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const role = getRole(user);
  const items = menuItemsForRole(role);
  const { theme, toggleTheme, hydrate } = useThemeStore();
  const [open, setOpen] = useState(variant === "mobile");
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (variant === "mobile") return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [variant]);

  const close = () => {
    if (variant === "desktop") setOpen(false);
    onNavigate?.();
  };

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      setConfirmLogout(false);
      setOpen(false);
      onNavigate?.();
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const panel = (
    <div
      className={clsx(
        "overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_20px_50px_rgba(20,32,28,0.12)]",
        variant === "desktop" && "w-80",
        variant === "mobile" && "mt-2 w-full",
      )}
    >
      <div className="border-b border-[var(--border)] bg-gradient-to-br from-[color-mix(in_oklab,var(--accent)_12%,transparent)] to-transparent px-4 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {user.name || "User"}
            </p>
            <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
            <p className="mt-1 inline-flex rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">
              {roleLabel(role)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-1.5">
        {items.map((item: NavMenuItem) => {
          const Icon = ICONS[item.icon];
          const active = isActive(item.href);
          return (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              onClick={close}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--muted)] hover:bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] hover:text-[var(--foreground)]",
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] hover:text-[var(--foreground)]"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>

        <div className="my-1 border-t border-[var(--border)]" />

        <button
          type="button"
          onClick={() => setConfirmLogout(true)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] hover:text-[var(--danger)]"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={clsx("relative", variant === "mobile" && "w-full")}
    >
      {variant === "desktop" ? (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Open profile menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <UserAvatar user={user} />
        </button>
      ) : null}

      {variant === "desktop" ? (
        <AnimatePresence>
          {open ? (
            <motion.div
              className="absolute right-0 top-full z-50 mt-2"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
            >
              {panel}
            </motion.div>
          ) : null}
        </AnimatePresence>
      ) : (
        panel
      )}

      <ConfirmDialog
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        title="Logout"
        description="Are you sure you want to logout?"
        cancelLabel="Cancel"
        confirmLabel="Logout"
        confirmLoadingLabel="Logging out…"
        tone="danger"
        loading={loggingOut}
        onConfirm={onLogout}
      />
    </div>
  );
}
