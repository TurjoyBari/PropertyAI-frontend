const KEY = "propertyai:recently-viewed";
const MAX = 8;

export type RecentProperty = {
  _id: string;
  title: string;
  price: number;
  currency: string;
  image?: string;
  city?: string;
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqFt?: number;
  viewedAt: number;
};

export function getRecentlyViewed(): RecentProperty[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentProperty[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function trackRecentlyViewed(item: Omit<RecentProperty, "viewedAt">) {
  if (typeof window === "undefined") return;
  const prev = getRecentlyViewed().filter((row) => row._id !== item._id);
  const next = [{ ...item, viewedAt: Date.now() }, ...prev].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(next));
}
