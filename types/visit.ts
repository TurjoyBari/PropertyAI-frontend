export const VISIT_STATUSES = [
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
] as const;

export type VisitStatus = (typeof VISIT_STATUSES)[number];

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
};

export type VisitLeadSummary = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  status?: string;
};

export type VisitPropertySummary = {
  _id: string;
  title: string;
  price?: number;
  currency?: string;
  type?: string;
  images?: string[];
  location?: {
    address?: string;
    city?: string;
    area?: string;
  };
};

export type VisitAgentSummary = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
};

export type Visit = {
  _id: string;
  lead: VisitLeadSummary | string;
  property: VisitPropertySummary | string;
  assignedAgent?: VisitAgentSummary | string;
  scheduledAt: string;
  durationMinutes: number;
  status: VisitStatus;
  locationNote?: string;
  notes?: string;
  createdBy?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type VisitListResponse = {
  items: Visit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type VisitInput = {
  leadId: string;
  propertyId: string;
  scheduledAt: string;
  durationMinutes?: number;
  status?: VisitStatus;
  assignedAgent?: string;
  locationNote?: string;
  notes?: string;
};

export type VisitQuery = {
  from?: string;
  to?: string;
  status?: VisitStatus | "";
  leadId?: string;
  propertyId?: string;
  page?: number;
  limit?: number;
};

export function visitLeadName(visit: Visit) {
  return typeof visit.lead === "string" ? "Lead" : visit.lead.fullName;
}

export function visitPropertyTitle(visit: Visit) {
  return typeof visit.property === "string" ? "Property" : visit.property.title;
}

export function visitLeadId(visit: Visit) {
  return typeof visit.lead === "string" ? visit.lead : visit.lead._id;
}

export function visitPropertyId(visit: Visit) {
  return typeof visit.property === "string" ? visit.property : visit.property._id;
}

export function visitAgentName(visit: Visit) {
  if (!visit.assignedAgent) return "Pending assignment";
  if (typeof visit.assignedAgent === "string") return "Assigned agent";
  return visit.assignedAgent.name || "Assigned agent";
}

export function visitAgentId(visit: Visit) {
  if (!visit.assignedAgent) return "";
  return typeof visit.assignedAgent === "string"
    ? visit.assignedAgent
    : visit.assignedAgent._id;
}

export function visitPropertyAddress(visit: Visit) {
  if (typeof visit.property === "string") return "";
  const loc = visit.property.location;
  if (!loc) return "";
  return [loc.address, loc.area, loc.city].filter(Boolean).join(", ");
}
