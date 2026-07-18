import type { ApiSuccess } from "@/types/dashboard";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt?: string;
};

async function parse<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.message || "Request failed");
  return (payload as ApiSuccess<T>).data;
}

export async function listAdminUsers() {
  const response = await fetch("/api/admin/users", {
    credentials: "include",
    cache: "no-store",
  });
  return parse<{ items: AdminUser[] }>(response);
}

export async function updateUserRole(id: string, role: string) {
  const response = await fetch(`/api/admin/users/${id}/role`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  return parse(response);
}
