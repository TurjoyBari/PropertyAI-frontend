import type { ApiSuccess } from "@/types/dashboard";
import type { Visit, VisitInput, VisitListResponse, VisitQuery } from "@/types/visit";

function toQuery(params: VisitQuery) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

async function parse<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (!response.ok) {
    const message =
      payload?.message ||
      (Array.isArray(payload?.message) ? payload.message.join(", ") : null) ||
      "Request failed";
    throw new Error(typeof message === "string" ? message : "Request failed");
  }
  return (payload as ApiSuccess<T>).data;
}

export async function listVisits(params: VisitQuery = {}) {
  const response = await fetch(`/api/visits${toQuery(params)}`, {
    credentials: "include",
    cache: "no-store",
  });
  return parse<VisitListResponse>(response);
}

export async function getVisit(id: string) {
  const response = await fetch(`/api/visits/${id}`, {
    credentials: "include",
    cache: "no-store",
  });
  return parse<Visit>(response);
}

export async function createVisit(input: VisitInput) {
  const response = await fetch("/api/visits", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<Visit>(response);
}

export async function bookCustomerVisit(input: {
  propertyId: string;
  scheduledAt: string;
  durationMinutes?: number;
  locationNote?: string;
  notes?: string;
}) {
  const response = await fetch("/api/visits/book", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<Visit>(response);
}

export async function updateVisit(id: string, input: Partial<VisitInput>) {
  const response = await fetch(`/api/visits/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<Visit>(response);
}

export async function deleteVisit(id: string) {
  const response = await fetch(`/api/visits/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return parse<{ id: string; deleted: boolean }>(response);
}
