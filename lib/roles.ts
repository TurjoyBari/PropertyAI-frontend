export type AppRole = "admin" | "agent" | "user";

export function getRole(user?: { role?: string | null } | null): AppRole {
  const role = user?.role;
  if (role === "admin" || role === "agent" || role === "user") return role;
  return "user";
}

export function homeForRole(role?: string | null) {
  if (role === "admin") return "/admin";
  if (role === "agent") return "/dashboard";
  return "/customer";
}

export function canAccessOps(role?: string | null) {
  return role === "admin" || role === "agent";
}

export function canAccessAdmin(role?: string | null) {
  return role === "admin";
}
