import type { ApiSuccess } from "@/types/dashboard";
import type { Property, PropertyListResponse, PropertyQuery } from "@/types/property";
import type { MatchPropertiesResponse } from "@/types/ai";
import type { PropertyType } from "@/types/property";

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
    throw new Error(payload?.message || "Request failed");
  }
  return (payload as ApiSuccess<T>).data;
}

export async function publicListProperties(params: PropertyQuery = {}) {
  const response = await fetch(`/api/public/properties${toQuery(params)}`, {
    cache: "no-store",
  });
  return parse<PropertyListResponse>(response);
}

export async function publicGetProperty(id: string) {
  const response = await fetch(`/api/public/properties/${id}`, {
    cache: "no-store",
  });
  return parse<Property>(response);
}

export async function publicMatchProperties(input: {
  query?: string;
  budgetMin?: number;
  budgetMax?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: PropertyType | "";
  nearMetro?: boolean;
  notes?: string;
}) {
  const response = await fetch("/api/public/match-properties", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      propertyType: input.propertyType || undefined,
    }),
  });
  return parse<MatchPropertiesResponse>(response);
}

export async function publicCreateInquiry(input: {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  budgetMin?: number;
  budgetMax?: number;
  message?: string;
  propertyId?: string;
}) {
  const response = await fetch("/api/public/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<{ message: string; leadId: string }>(response);
}

export async function publicListAreas() {
  const response = await fetch("/api/public/areas", { cache: "no-store" });
  return parse<{ items: Array<{ name: string; count: number }> }>(response);
}

export async function publicFaq() {
  const response = await fetch("/api/public/faq", { cache: "force-cache" });
  return parse<{ items: Array<{ q: string; a: string }> }>(response);
}
