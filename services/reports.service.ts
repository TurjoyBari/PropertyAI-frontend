import type { ApiSuccess } from "@/types/dashboard";
import type { ReportsSummary } from "@/types/reports";

export async function fetchReportsSummary() {
  const response = await fetch("/api/reports/summary", {
    credentials: "include",
    cache: "no-store",
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load reports");
  }
  return (payload as ApiSuccess<ReportsSummary>).data;
}
