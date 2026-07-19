"use client";

import { FormEvent, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  AiMatchCard,
  AiMatchEmpty,
  AiMatchLoading,
} from "@/components/public/ai-match-card";
import { parseBedrooms, parseBudgetToBdt, parsePropertyType } from "@/lib/budget";
import { publicMatchProperties } from "@/services/public.service";
import { PROPERTY_TYPES } from "@/types/property";
import type { MatchPropertiesResponse } from "@/types/ai";

const field =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm outline-none ring-[var(--accent)] placeholder:text-[var(--muted)] focus:ring-2";

type AiForm = {
  query: string;
  budget: string;
  location: string;
  bedrooms: string;
  propertyType: string;
};

const defaults: AiForm = {
  query: "",
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
      const query =
        form.query.trim() ||
        [
          form.bedrooms && `${form.bedrooms} bedroom`,
          form.propertyType,
          form.location && `in ${form.location}`,
          form.budget && `under ${form.budget}`,
        ]
          .filter(Boolean)
          .join(" ");

      const budgetMax = form.budget
        ? parseBudgetToBdt(form.budget)
        : undefined;
      const bedrooms = form.bedrooms
        ? parseBedrooms(form.bedrooms)
        : undefined;
      const propertyType = parsePropertyType(form.propertyType);

      const data = await publicMatchProperties({
        query: query || undefined,
        budgetMax,
        location: form.location.trim() || undefined,
        bedrooms,
        propertyType: propertyType || undefined,
        notes: query || undefined,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find matches");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const matches = result?.matches ?? [];
  const showResults = loading || result;

  return (
    <div className={compact ? "" : "mx-auto max-w-7xl px-4 py-10 lg:px-6"}>
      {!compact ? (
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[var(--accent)]">AI Property Finder</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Find your next home with AI
          </h1>
          <p className="mt-3 text-sm text-[var(--muted)] sm:text-base">
            Describe what you need in plain language. AI only understands your
            request — listings always come from our database.
          </p>
        </div>
      ) : null}

      <form
        onSubmit={onSubmit}
        className={`rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow)] sm:p-6 ${compact ? "" : "mt-8 max-w-3xl"}`}
      >
        <div className="mb-5 flex items-center gap-2 text-sm text-[var(--muted)]">
          <Sparkles size={16} className="text-[var(--accent)]" />
          Natural language search — filters are optional helpers
        </div>

        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">What are you looking for?</span>
            <textarea
              className={field}
              rows={3}
              placeholder='e.g. "I need a 3 bedroom apartment in Uttara under 80 lakh near a metro station."'
              value={form.query}
              onChange={(e) => setForm((f) => ({ ...f, query: e.target.value }))}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Budget (optional)</span>
              <input
                className={field}
                placeholder="80 Lakh"
                value={form.budget}
                onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Location (optional)</span>
              <input
                className={field}
                placeholder="Uttara"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Bedrooms (optional)</span>
              <input
                className={field}
                placeholder="3 Bedrooms"
                value={form.bedrooms}
                onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Property Type (optional)</span>
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
        </div>

        {error ? <p className="mt-4 text-sm text-[var(--danger)]">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
        >
          <Sparkles size={16} />
          {loading ? "Searching listings..." : "Find My Property"}
        </button>
      </form>

      <section className={compact ? "mt-6" : "mt-10"}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              {showResults ? "Matching properties" : "Recommendations"}
            </h2>
            {!loading && result?.summary && matches.length > 0 ? (
              <p className="mt-1 text-sm text-[var(--muted)]">{result.summary}</p>
            ) : null}
          </div>
          {!loading && matches.length > 0 ? (
            <p className="text-xs text-[var(--muted)]">
              {matches.length} result{matches.length === 1 ? "" : "s"}
              {result?.mode === "fallback" ? " · filter match" : ""}
            </p>
          ) : null}
        </div>

        {!loading && result?.notice ? (
          <p className="mb-4 rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] px-3 py-2 text-sm">
            {result.notice}
          </p>
        ) : null}

        {loading ? <AiMatchLoading count={compact ? 2 : 3} /> : null}

        {!loading && !result ? (
          <p className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--muted)]">
            Matching property cards from our database will appear here after you
            search.
          </p>
        ) : null}

        {!loading && result && matches.length === 0 ? (
          <AiMatchEmpty
            summary={result.summary}
            suggestions={result.suggestions}
          />
        ) : null}

        {!loading && matches.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {matches.map((item) => (
              <AiMatchCard
                key={item.propertyId}
                item={item}
                mode={result?.mode || "live"}
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
