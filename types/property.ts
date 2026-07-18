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

export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

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
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt?: number;
  location: PropertyLocation;
  images: string[];
  amenities: string[];
  listedBy?: string;
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
  };
};

export type PropertyInput = {
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
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
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: number;
  limit?: number;
};
