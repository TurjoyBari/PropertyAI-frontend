import { z } from "zod";
import { PROPERTY_PURPOSES, PROPERTY_STATUSES, PROPERTY_TYPES } from "@/types/property";

export const propertyFormSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Add a longer description"),
  type: z.enum(PROPERTY_TYPES),
  status: z.enum(PROPERTY_STATUSES),
  purpose: z.enum(PROPERTY_PURPOSES),
  price: z.number().min(0, "Price must be 0 or more"),
  currency: z.string().min(1),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  areaSqFt: z.number().min(0).optional(),
  address: z.string().min(3, "Address is required"),
  city: z.string().min(2, "City is required"),
  area: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  images: z.string().optional(),
  amenities: z.string().optional(),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export function toPropertyInput(values: PropertyFormValues) {
  return {
    title: values.title,
    description: values.description,
    type: values.type,
    status: values.status,
    purpose: values.purpose,
    price: values.price,
    currency: values.currency || "BDT",
    bedrooms: values.bedrooms,
    bathrooms: values.bathrooms,
    areaSqFt: values.areaSqFt || undefined,
    location: {
      address: values.address,
      city: values.city,
      area: values.area || undefined,
      state: values.state || undefined,
      country: values.country || undefined,
      postalCode: values.postalCode || undefined,
    },
    images: (values.images || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    amenities: (values.amenities || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  };
}
