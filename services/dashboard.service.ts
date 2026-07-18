import type { ApiSuccess, DashboardStats } from "@/types/dashboard";

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch("/api/dashboard/stats", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load dashboard stats");
  }

  const payload = (await response.json()) as ApiSuccess<DashboardStats>;
  return payload.data;
}
