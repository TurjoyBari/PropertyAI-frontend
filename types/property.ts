export const PROPERTY_TYPES = [
  "apartment",
  "house",
  "villa",
  "land",
  "commercial",
  "studio",
] as const;

export const PROPERTY_STATUSES = [
  "draft",
  "available",
  "reserved",
  "sold",
  "rented",
] as const;

export const PROPERTY_PURPOSES = ["sale", "rent"] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];
export type PropertyPurpose = (typeof PROPERTY_PURPOSES)[number];

export type PropertyLocation = {
  address: string;
  city: string;
  area?: string;
  state?: string;
  country?: string;
  postalCode?: string;
};

export type Property = {
  _id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  purpose?: PropertyPurpose;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt?: number;
  location: PropertyLocation;
  images: string[];
  amenities: string[];
  listedBy?: string;
  parking?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PropertyListResponse = {
  items: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
};

export type PropertyInput = {
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  purpose: PropertyPurpose;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt?: number;
  location: PropertyLocation;
  images: string[];
  amenities: string[];
};

export type PropertyQuery = {
  search?: string;
  type?: PropertyType | "";
  status?: PropertyStatus | "";
  purpose?: PropertyPurpose | "";
  city?: string;
  area?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string | number;
  page?: number;
  limit?: number;
};

/** Map public nav intent to API purpose */
export function intentToPurpose(intent?: string | null): PropertyPurpose | undefined {
  if (intent === "rent") return "rent";
  if (intent === "buy" || intent === "sale") return "sale";
  return undefined;
}
