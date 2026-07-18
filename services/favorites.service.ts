import type { ApiSuccess } from "@/types/dashboard";
import type { Property } from "@/types/property";

export type FavoriteItem = {
  _id: string;
  property: Property;
  createdAt?: string;
};

async function parse<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.message || "Request failed");
  return (payload as ApiSuccess<T>).data;
}

export async function listFavorites() {
  const response = await fetch("/api/favorites", {
    credentials: "include",
    cache: "no-store",
  });
  return parse<{ items: FavoriteItem[] }>(response);
}

export async function addFavorite(propertyId: string) {
  const response = await fetch("/api/favorites", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ propertyId }),
  });
  return parse(response);
}

export async function removeFavorite(propertyId: string) {
  const response = await fetch(`/api/favorites/${propertyId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return parse(response);
}
