"use client";

import { FormEvent, useState } from "react";
import { Sparkles } from "lucide-react";
import { AiMatchCard, AiMatchLoading } from "@/components/public/ai-match-card";
import { parseBedrooms, parseBudgetToBdt, parsePropertyType } from "@/lib/budget";
import { publicMatchProperties } from "@/services/public.service";
import { PROPERTY_TYPES } from "@/types/property";
import type { MatchPropertiesResponse } from "@/types/ai";

const field =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm outline-none ring-[var(--accent)] placeholder:text-[var(--muted)] focus:ring-2";

type AiForm = {
  budget: string;
  location: string;
  bedrooms: string;
  propertyType: string;
};

const defaults: AiForm = {
  budget: "",
  location: "",
  bedrooms: "",
  propertyType: "",
};

export function AiPropertyFinder({ compact = false }: { compact?: boolean }) {
  const [form, setForm] = useState<AiForm>(defaults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchPropertiesResponse | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const budgetMax = parseBudgetToBdt(form.budget || "80 Lakh");
      const bedrooms = parseBedrooms(form.bedrooms || "3");
      const propertyType = parsePropertyType(form.propertyType);
      const data = await publicMatchProperties({
        budgetMax,
        location: (form.location || "Uttara").trim(),
        bedrooms,
        propertyType: propertyType || undefined,
        notes: `Budget: ${form.budget || "80 Lakh"}; Location: ${form.location || "Uttara"}; Bedrooms: ${form.bedrooms || "3"}; Type: ${form.propertyType || "Apartment"}`,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find matches");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={compact ? "" : "mx-auto max-w-7xl px-4 py-10 lg:px-6"}>
      {!compact ? (
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[var(--accent)]">AI Property Finder</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Find your next home with AI
          </h1>
          <p className="mt-3 text-sm text-[var(--muted)] sm:text-base">
            Describe your budget and neighborhood — we rank verified listings for you.
          </p>
        </div>
      ) : null}

      <div className={`grid gap-6 ${compact ? "lg:grid-cols-[1.05fr_0.95fr]" : "mt-8 lg:grid-cols-2"}`}>
        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow)] sm:p-6"
        >
          <div className="mb-5 flex items-center gap-2 text-sm text-[var(--muted)]">
            <Sparkles size={16} className="text-[var(--accent)]" />
            Chat-style search — placeholders show example criteria
          </div>

          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Budget</span>
              <input
                className={field}
                placeholder="80 Lakh"
                value={form.budget}
                onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Location</span>
              <input
                className={field}
                placeholder="Uttara"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Bedrooms</span>
              <input
                className={field}
                placeholder="3 Bedrooms"
                value={form.bedrooms}
                onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Property Type</span>
              <input
                className={field}
                list="ai-property-types"
                placeholder="Apartment"
                value={form.propertyType}
                onChange={(e) => setForm((f) => ({ ...f, propertyType: e.target.value }))}
              />
              <datalist id="ai-property-types">
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </label>
          </div>

          {error ? <p className="mt-4 text-sm text-[var(--danger)]">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            <Sparkles size={16} />
            {loading ? "Finding matches..." : "Find My Property"}
          </button>
        </form>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold tracking-tight">Recommendations</h2>
          <div className="mt-4 space-y-4">
            {loading ? <AiMatchLoading /> : null}
            {!loading && !result ? (
              <p className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--muted)]">
                Your AI matches will appear here with scores, photos, and reasons.
              </p>
            ) : null}
            {!loading && result && result.matches.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--muted)]">
                {result.summary || "No matches found. Try a wider budget or another area."}
              </p>
            ) : null}
            {!loading && result?.matches.length
              ? result.matches.slice(0, 3).map((item) => (
                  <AiMatchCard key={item.propertyId} item={item} />
                ))
              : null}
            {!loading && result?.summary && result.matches.length > 0 ? (
              <p className="text-xs text-[var(--muted)]">{result.summary}</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
