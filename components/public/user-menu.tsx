"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Heart,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Sun,
  UserRound,
} from "lucide-react";
import clsx from "clsx";
import { signOut } from "@/lib/auth-client";
import { getRole, homeForRole, roleLabel, type AppRole } from "@/lib/roles";
import { useThemeStore } from "@/store/theme-store";

export type AuthUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
};

function initialsFromName(name?: string | null, email?: string | null) {
  const source = (name || email || "U").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function UserAvatar({
  user,
  size = "md",
}: {
  user: AuthUser;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm";
  if (user.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt={user.name || "Profile"}
        className={clsx(dim, "rounded-full object-cover ring-2 ring-[var(--border)]")}
      />
    );
  }
  return (
    <span
      className={clsx(
        dim,
        "inline-flex items-center justify-center rounded-full bg-[var(--accent-soft)] font-semibold text-[var(--accent)] ring-2 ring-[var(--border)]",
      )}
      aria-hidden
    >
      {initialsFromName(user.name, user.email)}
    </span>
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
  const role = getRole(user);
  const dashboardHref = homeForRole(role);
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

  const menuItems: Array<{
    href: string;
    label: string;
    icon: typeof UserRound;
  }> = [
    {
      href: profileHref(role),
      label: "My Profile",
      icon: UserRound,
    },
    {
      href: dashboardHref,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/customer/favorites",
      label: "Saved Properties",
      icon: Heart,
    },
    {
      href: "/customer/visits",
      label: "My Visits",
      icon: CalendarDays,
    },
    {
      href: settingsHref(role),
      label: "Settings",
      icon: Settings,
    },
  ];

  const panel = (
    <div
      className={clsx(
        "overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)]",
        variant === "desktop" && "absolute right-0 top-full z-50 mt-2 w-72",
        variant === "mobile" && "mt-2",
      )}
    >
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
        <UserAvatar user={user} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user.name || "User"}</p>
          <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">
            {roleLabel(role)}
          </p>
        </div>
      </div>

      <div className="p-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={close}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] hover:text-[var(--foreground)]"
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
    <div ref={rootRef} className={clsx("relative", variant === "mobile" && "w-full")}>
      {variant === "desktop" ? (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="rounded-full transition hover:opacity-90"
        >
          <UserAvatar user={user} />
        </button>
      ) : null}

      {variant === "desktop" ? (open ? panel : null) : panel}

      {confirmLogout ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nav-logout-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow)]">
            <h2 id="nav-logout-title" className="text-lg font-semibold">
              Log out?
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              You will be signed out and returned to the home page.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium"
                onClick={() => setConfirmLogout(false)}
                disabled={loggingOut}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-[var(--danger)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                onClick={onLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function profileHref(role: AppRole) {
  if (role === "user") return "/customer/settings";
  return "/account";
}

function settingsHref(role: AppRole) {
  if (role === "user") return "/customer/settings";
  return "/account";
}
