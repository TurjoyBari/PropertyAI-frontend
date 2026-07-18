import { z } from "zod";
import { VISIT_STATUSES } from "@/types/visit";

export const visitFormSchema = z.object({
  leadId: z.string().min(1, "Select a lead"),
  propertyId: z.string().min(1, "Select a property"),
  scheduledAt: z.string().min(1, "Pick a date and time"),
  durationMinutes: z.number().min(15).max(480),
  status: z.enum(VISIT_STATUSES),
  assignedAgent: z.string().optional(),
  locationNote: z.string().optional(),
  notes: z.string().optional(),
});

export type VisitFormValues = z.infer<typeof visitFormSchema>;
