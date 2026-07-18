import type { ApiSuccess } from "@/types/dashboard";
import type { Lead, LeadInput, LeadListResponse, LeadQuery } from "@/types/lead";

function toQuery(params: LeadQuery) {
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

export async function listLeads(params: LeadQuery = {}) {
  const response = await fetch(`/api/leads${toQuery(params)}`, {
    credentials: "include",
    cache: "no-store",
  });
  return parse<LeadListResponse>(response);
}

export async function getLead(id: string) {
  const response = await fetch(`/api/leads/${id}`, {
    credentials: "include",
    cache: "no-store",
  });
  return parse<Lead>(response);
}

export async function createLead(input: LeadInput) {
  const response = await fetch("/api/leads", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<Lead>(response);
}

export async function updateLead(id: string, input: Partial<LeadInput>) {
  const response = await fetch(`/api/leads/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<Lead>(response);
}

export async function deleteLead(id: string) {
  const response = await fetch(`/api/leads/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return parse<{ id: string; deleted: boolean }>(response);
}

export async function addLeadNote(id: string, body: string) {
  const response = await fetch(`/api/leads/${id}/notes`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  return parse<Lead>(response);
}
