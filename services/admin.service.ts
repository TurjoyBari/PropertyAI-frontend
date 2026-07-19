import type { ApiSuccess } from "@/types/dashboard";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt?: string;
};

async function parse<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.message || "Request failed");
  return (payload as ApiSuccess<T>).data;
}

export async function listAdminUsers() {
  const response = await fetch("/api/admin/users", {
    credentials: "include",
    cache: "no-store",
  });
  return parse<{ items: AdminUser[] }>(response);
}

export async function updateUserRole(id: string, role: string) {
  const response = await fetch(`/api/admin/users/${id}/role`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  return parse(response);
}

export type AdminPropertyInsights = {
  property: {
    _id: string;
    title: string;
    type: string;
    status: string;
    purpose?: string;
    price: number;
    currency?: string;
    bedrooms?: number;
    bathrooms?: number;
    parking?: number;
    areaSqFt?: number;
    createdAt?: string;
    updatedAt?: string;
    featured?: boolean;
    isActive?: boolean;
  };
  listingAgent: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    phone: string | null;
    role: string;
    banned: boolean;
    createdAt?: string;
    updatedAt?: string;
    agency: string;
    officeAddress: string;
    rating: number;
    totalReviews: number;
    accountStatus: string;
    lastActive?: string;
  } | null;
  agentPerformance: {
    totalPropertiesListed: number;
    activeListings: number;
    pendingListings: number;
    soldProperties: number;
    rentedProperties: number;
    cancelledListings: number;
    averageResponseTime: string;
    leadConversionRate: number;
    customerRating: number | null;
  };
  analytics: {
    totalViews: number;
    uniqueVisitors: number;
    totalFavorites: number;
    totalVisitRequests: number;
    totalLeads: number;
    interestedCustomers: number;
    totalMessages: number;
    totalPhoneCalls: number;
    averageTimeOnListing: string;
    clickThroughRate: number;
    conversionRate: number;
    viewsAreEstimated?: boolean;
  };
  timeline: Array<{
    action: string;
    at: string;
    user: string;
    role: string;
  }>;
  activityLog: Array<{
    user: string;
    role: string;
    action: string;
    at: string;
    ip?: string;
  }>;
  documents: Array<{
    name: string;
    url?: string;
    uploadedAt?: string;
    verificationStatus: string;
  }>;
  visits: {
    upcoming: AdminVisitRow[];
    completed: AdminVisitRow[];
    cancelled: AdminVisitRow[];
  };
  interestedCustomers: Array<{
    id: string;
    fullName: string;
    phone?: string;
    email?: string;
    leadScore: number;
    budgetMin?: number;
    budgetMax?: number;
    preferredArea?: string;
    lastContact?: string;
    currentStage: string;
  }>;
  financial: {
    listingPrice: number;
    suggestedAiPrice: number;
    finalSellingPrice: number | null;
    currency: string;
    commissionPercent: number;
    commission: number;
    agentCommission: number;
    companyRevenue: number;
    profit: number;
  };
  aiInsights: {
    aiLeadScore: number;
    propertyDemandScore: number;
    popularityScore: number;
    priceRecommendation: number;
    marketTrend: string;
    estimatedSellingTime: string;
    investmentRating: string;
    riskLevel: string;
    recommendedImprovements: string[];
  };
  adminNotes: string;
  internalTags: string[];
  featured: boolean;
  audit: {
    createdBy: string | null;
    createdAt?: string;
    lastUpdatedBy: string | null;
    updatedAt?: string;
    approvedBy: string | null;
    approvedAt: string | null;
    deletedBy: string | null;
    deletedAt: string | null;
    isActive: boolean;
  };
  relatedProperties: Array<{
    _id: string;
    title: string;
    price: number;
    currency?: string;
    type: string;
    status: string;
    location?: { city?: string; area?: string };
    images?: string[];
    bedrooms?: number;
    bathrooms?: number;
    areaSqFt?: number;
  }>;
  map: {
    query: string;
    nearby: string[];
  };
};

export type AdminVisitRow = {
  id: string;
  visitorName: string;
  visitDate: string;
  visitTime: string;
  assignedAgent: string | null;
  status: string;
  email?: string;
  phone?: string;
};

export type AdminPropertyMetaInput = {
  adminNotes?: string;
  internalTags?: string[];
  featured?: boolean;
  suggestedPrice?: number;
  finalPrice?: number;
  commissionPercent?: number;
  parking?: number;
  status?: string;
  action?:
    | "approve"
    | "reject"
    | "suspend"
    | "feature"
    | "unfeature"
    | "archive"
    | "restore"
    | "delete";
};

export async function getAdminPropertyInsights(propertyId: string) {
  const response = await fetch(
    `/api/admin/properties/${propertyId}/insights`,
    {
      credentials: "include",
      cache: "no-store",
    },
  );
  return parse<AdminPropertyInsights>(response);
}

export async function updateAdminPropertyMeta(
  propertyId: string,
  body: AdminPropertyMetaInput,
) {
  const response = await fetch(`/api/admin/properties/${propertyId}/meta`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<AdminPropertyInsights>(response);
}

export async function suspendAdminUser(userId: string, banned: boolean) {
  const response = await fetch(`/api/admin/users/${userId}/suspend`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ banned }),
  });
  return parse<{ id: string; banned: boolean; name?: string; email?: string }>(
    response,
  );
}
