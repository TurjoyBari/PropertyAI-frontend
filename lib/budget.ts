import { PROPERTY_TYPES, type PropertyType } from "@/types/property";

/** Parse values like "80 Lakh", "1.2 Cr", or plain numbers into BDT. */
export function parseBudgetToBdt(input?: string): number | undefined {
  if (!input?.trim()) return undefined;
  const text = input.trim().toLowerCase().replace(/,/g, "");
  const match = text.match(/([\d.]+)\s*(lakh|lac|cr|crore)?/);
  if (!match) return undefined;
  const value = Number(match[1]);
  if (Number.isNaN(value)) return undefined;
  const unit = match[2];
  if (unit === "cr" || unit === "crore") return Math.round(value * 10_000_000);
  if (unit === "lakh" || unit === "lac") return Math.round(value * 100_000);
  return Math.round(value);
}

export function parseBedrooms(input?: string): number | undefined {
  if (!input?.trim()) return undefined;
  const match = input.match(/(\d+)/);
  if (!match) return undefined;
  return Number(match[1]);
}

export function parsePropertyType(input?: string): PropertyType | undefined {
  if (!input?.trim()) return undefined;
  const normalized = input.trim().toLowerCase();
  return PROPERTY_TYPES.find((t) => t === normalized || normalized.includes(t));
}
