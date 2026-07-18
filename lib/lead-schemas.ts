import { z } from "zod";
import { LEAD_SOURCES, LEAD_STATUSES, LEAD_TEMPERATURES } from "@/types/lead";

export const leadFormSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  status: z.enum(LEAD_STATUSES),
  source: z.enum(LEAD_SOURCES),
  temperature: z.enum(LEAD_TEMPERATURES),
  score: z.number().min(0).max(100).optional(),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  preferredLocation: z.string().optional(),
  buyingTimeline: z.string().optional(),
  assignedAgent: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;
