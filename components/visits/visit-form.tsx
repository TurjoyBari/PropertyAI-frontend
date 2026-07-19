"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { visitFormSchema, type VisitFormValues } from "@/lib/visit-schemas";
import { listLeads } from "@/services/leads.service";
import { listProperties } from "@/services/properties.service";
import {
  VISIT_STATUSES,
  VISIT_STATUS_LABELS,
  type Visit,
  type VisitInput,
  visitAgentId,
  visitLeadId,
  visitPropertyId,
} from "@/types/visit";
import type { Lead } from "@/types/lead";
import type { Property } from "@/types/property";

const fieldClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2";

function toDatetimeLocal(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocal(value: string) {
  const date = new Date(value);
  return date.toISOString();
}

export function VisitForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Visit;
  submitLabel: string;
  onSubmit: (values: VisitInput) => Promise<void>;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VisitFormValues>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      leadId: initial ? visitLeadId(initial) : "",
      propertyId: initial ? visitPropertyId(initial) : "",
      scheduledAt: toDatetimeLocal(initial?.scheduledAt),
      durationMinutes: initial?.durationMinutes ?? 60,
      status: initial?.status ?? "scheduled",
      assignedAgent: initial ? visitAgentId(initial) : "",
      locationNote: initial?.locationNote ?? "",
      notes: initial?.notes ?? "",
    },
  });

  useEffect(() => {
    listLeads({ limit: 100 })
      .then((data) => setLeads(data.items))
      .catch(() => setLeads([]));
    listProperties({ limit: 100 })
      .then((data) => setProperties(data.items))
      .catch(() => setProperties([]));
  }, []);

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await onSubmit({
        leadId: values.leadId,
        propertyId: values.propertyId,
        scheduledAt: fromDatetimeLocal(values.scheduledAt),
        durationMinutes: values.durationMinutes,
        status: values.status,
        assignedAgent: values.assignedAgent || undefined,
        locationNote: values.locationNote || undefined,
        notes: values.notes || undefined,
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Save failed");
    }
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      {formError ? (
        <p className="rounded-lg bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] px-3 py-2 text-sm text-[var(--danger)]">
          {formError}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Lead</label>
          <select className={fieldClass} {...register("leadId")}>
            <option value="">Select lead</option>
            {leads.map((lead) => (
              <option key={lead._id} value={lead._id}>
                {lead.fullName} · {lead.email}
              </option>
            ))}
          </select>
          {errors.leadId ? (
            <p className="text-xs text-[var(--danger)]">{errors.leadId.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Property</label>
          <select className={fieldClass} {...register("propertyId")}>
            <option value="">Select property</option>
            {properties.map((property) => (
              <option key={property._id} value={property._id}>
                {property.title} · {property.location.city}
              </option>
            ))}
          </select>
          {errors.propertyId ? (
            <p className="text-xs text-[var(--danger)]">{errors.propertyId.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Date & time</label>
          <input
            type="datetime-local"
            className={fieldClass}
            {...register("scheduledAt")}
          />
          {errors.scheduledAt ? (
            <p className="text-xs text-[var(--danger)]">{errors.scheduledAt.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Duration (minutes)</label>
          <input
            type="number"
            min={15}
            max={480}
            step={15}
            className={fieldClass}
            {...register("durationMinutes", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Status</label>
          <select className={fieldClass} {...register("status")}>
            {VISIT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {VISIT_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Assigned agent ID (optional)</label>
          <input className={fieldClass} {...register("assignedAgent")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Meeting point</label>
        <input
          className={fieldClass}
          placeholder="Lobby, gate, office..."
          {...register("locationNote")}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Notes</label>
        <textarea className={fieldClass} rows={3} {...register("notes")} />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
