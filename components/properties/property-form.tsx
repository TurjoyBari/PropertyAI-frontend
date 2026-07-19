"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  propertyFormSchema,
  toPropertyInput,
  type PropertyFormValues,
} from "@/lib/property-schemas";
import { PROPERTY_PURPOSES, PROPERTY_STATUSES, PROPERTY_TYPES, type Property } from "@/types/property";
import { uploadPropertyImages } from "@/services/uploads.service";

const fieldClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2";

export function PropertyForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Property;
  submitLabel: string;
  onSubmit: (values: ReturnType<typeof toPropertyInput>) => Promise<void>;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      type: initial?.type ?? "apartment",
      status: initial?.status ?? "draft",
      purpose: initial?.purpose ?? "sale",
      price: initial?.price ?? 0,
      currency: initial?.currency ?? "BDT",
      bedrooms: initial?.bedrooms ?? 0,
      bathrooms: initial?.bathrooms ?? 0,
      areaSqFt: initial?.areaSqFt ?? undefined,
      address: initial?.location.address ?? "",
      city: initial?.location.city ?? "",
      area: initial?.location.area ?? "",
      state: initial?.location.state ?? "",
      country: initial?.location.country ?? "Bangladesh",
      postalCode: initial?.location.postalCode ?? "",
      images: initial?.images?.join("\n") ?? "",
      amenities: initial?.amenities?.join(", ") ?? "",
    },
  });

  const imagesValue = watch("images");

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await onSubmit(toPropertyInput(values));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Save failed");
    }
  });

  const onUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setUploading(true);
    setFormError(null);
    try {
      const urls = await uploadPropertyImages(fileList);
      const current = (imagesValue || "").trim();
      const next = [current, ...urls].filter(Boolean).join("\n");
      setValue("images", next, { shouldDirty: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {formError ? (
        <p className="rounded-lg bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] px-3 py-2 text-sm text-[var(--danger)]">
          {formError}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-medium">Title</label>
          <input className={fieldClass} {...register("title")} />
          {errors.title ? <p className="text-xs text-[var(--danger)]">{errors.title.message}</p> : null}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-medium">Description</label>
          <textarea rows={4} className={fieldClass} {...register("description")} />
          {errors.description ? (
            <p className="text-xs text-[var(--danger)]">{errors.description.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Type</label>
          <select className={fieldClass} {...register("type")}>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Purpose</label>
          <select className={fieldClass} {...register("purpose")}>
            {PROPERTY_PURPOSES.map((purpose) => (
              <option key={purpose} value={purpose}>
                {purpose === "sale" ? "Buy / Sale" : "Rent"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Status</label>
          <select className={fieldClass} {...register("status")}>
            {PROPERTY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Price</label>
          <input type="number" className={fieldClass} {...register("price", { valueAsNumber: true })} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Currency</label>
          <input className={fieldClass} {...register("currency")} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Bedrooms</label>
          <input type="number" className={fieldClass} {...register("bedrooms", { valueAsNumber: true })} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Bathrooms</label>
          <input type="number" className={fieldClass} {...register("bathrooms", { valueAsNumber: true })} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Area (sqft)</label>
          <input type="number" className={fieldClass} {...register("areaSqFt", { valueAsNumber: true })} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">City</label>
          <input className={fieldClass} {...register("city")} />
          {errors.city ? <p className="text-xs text-[var(--danger)]">{errors.city.message}</p> : null}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-medium">Address</label>
          <input className={fieldClass} {...register("address")} />
          {errors.address ? (
            <p className="text-xs text-[var(--danger)]">{errors.address.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Area / Neighborhood</label>
          <input className={fieldClass} {...register("area")} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">State</label>
          <input className={fieldClass} {...register("state")} />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-medium">Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="block w-full text-sm text-[var(--muted)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--accent-soft)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--accent)]"
            onChange={(event) => onUpload(event.target.files)}
            disabled={uploading}
          />
          <p className="mt-1 text-xs text-[var(--muted)]">
            {uploading ? "Uploading..." : "Upload images or paste URLs below (one per line)."}
          </p>
          <textarea
            rows={3}
            placeholder="/uploads/photo.jpg or https://..."
            className={`${fieldClass} mt-2`}
            {...register("images")}
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-medium">Amenities (comma separated)</label>
          <input
            placeholder="Parking, Generator, Gym"
            className={fieldClass}
            {...register("amenities")}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || uploading}
        className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
