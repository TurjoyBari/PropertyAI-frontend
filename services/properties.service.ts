import type {
  Property,
  PropertyInput,
  PropertyListResponse,
  PropertyQuery,
} from "@/types/property";
import type { ApiSuccess } from "@/types/dashboard";

function toQuery(params: PropertyQuery) {
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

export async function listProperties(params: PropertyQuery = {}) {
  const response = await fetch(`/api/properties${toQuery(params)}`, {
    credentials: "include",
    cache: "no-store",
  });
  return parse<PropertyListResponse>(response);
}

export async function getProperty(id: string) {
  const response = await fetch(`/api/properties/${id}`, {
    credentials: "include",
    cache: "no-store",
  });
  return parse<Property>(response);
}

export async function createProperty(input: PropertyInput) {
  const response = await fetch("/api/properties", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<Property>(response);
}

export async function updateProperty(id: string, input: Partial<PropertyInput>) {
  const response = await fetch(`/api/properties/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<Property>(response);
}

export async function deleteProperty(id: string) {
  const response = await fetch(`/api/properties/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return parse<{ id: string; deleted: boolean }>(response);
}
