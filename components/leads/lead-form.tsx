"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadFormSchema, type LeadFormValues } from "@/lib/lead-schemas";
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_TEMPERATURES,
  type Lead,
  type LeadInput,
} from "@/types/lead";

const fieldClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2";

export function LeadForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Lead;
  submitLabel: string;
  onSubmit: (values: LeadInput) => Promise<void>;
}) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      fullName: initial?.fullName ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
      status: initial?.status ?? "new_lead",
      source: initial?.source ?? "website",
      temperature: initial?.temperature ?? "cold",
      score: initial?.score ?? 0,
      budgetMin: initial?.budgetMin,
      budgetMax: initial?.budgetMax,
      preferredLocation: initial?.preferredLocation ?? "",
      buyingTimeline: initial?.buyingTimeline ?? "",
      assignedAgent: initial?.assignedAgent ?? "",
    },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await onSubmit({
        ...values,
        phone: values.phone || undefined,
        preferredLocation: values.preferredLocation || undefined,
        buyingTimeline: values.buyingTimeline || undefined,
        assignedAgent: values.assignedAgent || undefined,
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
          <label className="text-sm font-medium">Full name</label>
          <input className={fieldClass} {...register("fullName")} />
          {errors.fullName ? (
            <p className="text-xs text-[var(--danger)]">{errors.fullName.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email</label>
          <input type="email" className={fieldClass} {...register("email")} />
          {errors.email ? (
            <p className="text-xs text-[var(--danger)]">{errors.email.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Phone</label>
          <input className={fieldClass} {...register("phone")} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Preferred location</label>
          <input className={fieldClass} {...register("preferredLocation")} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Status</label>
          <select className={fieldClass} {...register("status")}>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Source</label>
          <select className={fieldClass} {...register("source")}>
            {LEAD_SOURCES.map((source) => (
              <option key={source} value={source}>
                {source.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Temperature</label>
          <select className={fieldClass} {...register("temperature")}>
            {LEAD_TEMPERATURES.map((temperature) => (
              <option key={temperature} value={temperature}>
                {temperature}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Score (0-100)</label>
          <input
            type="number"
            className={fieldClass}
            {...register("score", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Budget min</label>
          <input
            type="number"
            className={fieldClass}
            {...register("budgetMin", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Budget max</label>
          <input
            type="number"
            className={fieldClass}
            {...register("budgetMax", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-medium">Buying timeline</label>
          <input
            placeholder="e.g. 1-3 months"
            className={fieldClass}
            {...register("buyingTimeline")}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-medium">Assigned agent ID (optional)</label>
          <input
            placeholder="Better Auth user id"
            className={fieldClass}
            {...register("assignedAgent")}
          />
        </div>
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
