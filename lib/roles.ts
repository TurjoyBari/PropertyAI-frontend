export type AppRole = "admin" | "agent" | "user";

export function getRole(user?: { role?: string | null } | null): AppRole {
  const role = user?.role;
  if (role === "admin" || role === "agent" || role === "user") return role;
  return "user";
}

export function roleLabel(role?: string | null) {
  if (role === "admin") return "Admin";
  if (role === "agent") return "Agent";
  return "Customer";
}

/** Canonical role home / dashboard entry points. */
export function homeForRole(role?: string | null) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "agent") return "/agent/dashboard";
  return "/customer/dashboard";
}

export function canAccessOps(role?: string | null) {
  return role === "admin" || role === "agent";
}

export function canAccessAdmin(role?: string | null) {
  return role === "admin";
}

/** Customer home dashboard — not the personal favorites/visits tools. */
export function canAccessCustomerHome(role?: string | null) {
  return getRole({ role }) === "user";
}

/** Agent-only dashboard area. */
export function canAccessAgentHome(role?: string | null) {
  return getRole({ role }) === "agent";
}

export type NavMenuItem = {
  href: string;
  label: string;
  icon:
    | "dashboard"
    | "profile"
    | "favorites"
    | "visits"
    | "leads"
    | "settings";
};

/** Role-scoped profile dropdown links (excludes theme + logout). */
export function menuItemsForRole(role: AppRole): NavMenuItem[] {
  if (role === "admin") {
    return [
      { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
      { href: "/account", label: "My Profile", icon: "profile" },
      { href: "/account", label: "Settings", icon: "settings" },
    ];
  }

  if (role === "agent") {
    return [
      { href: "/agent/dashboard", label: "Dashboard", icon: "dashboard" },
      { href: "/account", label: "My Profile", icon: "profile" },
      { href: "/leads", label: "Assigned Leads", icon: "leads" },
      { href: "/visits", label: "Site Visits", icon: "visits" },
      { href: "/account", label: "Settings", icon: "settings" },
    ];
  }

  return [
    { href: "/customer/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/customer/profile", label: "My Profile", icon: "profile" },
    { href: "/customer/favorites", label: "Saved Properties", icon: "favorites" },
    { href: "/customer/visits", label: "My Visits", icon: "visits" },
    { href: "/customer/settings", label: "Settings", icon: "settings" },
  ];
}
