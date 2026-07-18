export const LEAD_STATUSES = [
  "new_lead",
  "contacted",
  "interested",
  "visit_scheduled",
  "negotiation",
  "closed",
] as const;

export const LEAD_SOURCES = [
  "website",
  "referral",
  "whatsapp",
  "facebook",
  "google",
  "walk_in",
  "other",
] as const;

export const LEAD_TEMPERATURES = ["hot", "warm", "cold"] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type LeadSource = (typeof LEAD_SOURCES)[number];
export type LeadTemperature = (typeof LEAD_TEMPERATURES)[number];

export type LeadNote = {
  body: string;
  createdBy?: string;
  createdAt?: string;
};

export type Lead = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  status: LeadStatus;
  source: LeadSource;
  temperature: LeadTemperature;
  score: number;
  budgetMin?: number;
  budgetMax?: number;
  preferredLocation?: string;
  buyingTimeline?: string;
  assignedAgent?: string;
  interestedProperties: string[];
  notes: LeadNote[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type LeadListResponse = {
  items: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type LeadInput = {
  fullName: string;
  email: string;
  phone?: string;
  status: LeadStatus;
  source: LeadSource;
  temperature: LeadTemperature;
  score?: number;
  budgetMin?: number;
  budgetMax?: number;
  preferredLocation?: string;
  buyingTimeline?: string;
  assignedAgent?: string;
};

export type LeadQuery = {
  search?: string;
  status?: LeadStatus | "";
  source?: LeadSource | "";
  temperature?: LeadTemperature | "";
  preferredLocation?: string;
  page?: number;
  limit?: number;
};
