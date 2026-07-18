"use client";

import { useState } from "react";
import Link from "next/link";
import { publicMatchProperties } from "@/services/public.service";
import { PROPERTY_TYPES, type PropertyType } from "@/types/property";
import type { MatchPropertiesResponse } from "@/types/ai";

const field =
  "w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm";

export default function FinderPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchPropertiesResponse | null>(null);
  const [form, setForm] = useState({
    budgetMin: "",
    budgetMax: "",
    location: "",
    bedrooms: "",
    propertyType: "" as PropertyType | "",
    notes: "",
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">AI Property Finder</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Tell us what you need. Gemini ranks the best matching listings.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <form
          className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            try {
              setResult(
                await publicMatchProperties({
                  budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
                  budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
                  location: form.location || undefined,
                  bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
                  propertyType: form.propertyType || undefined,
                  notes: form.notes || undefined,
                }),
              );
            } catch (err) {
              setError(err instanceof Error ? err.message : "Matching failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={field} placeholder="Budget min" type="number" value={form.budgetMin} onChange={(e) => setForm((f) => ({ ...f, budgetMin: e.target.value }))} />
            <input className={field} placeholder="Budget max" type="number" value={form.budgetMax} onChange={(e) => setForm((f) => ({ ...f, budgetMax: e.target.value }))} />
            <input className={field} placeholder="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            <input className={field} placeholder="Bedrooms" type="number" value={form.bedrooms} onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))} />
            <select className={field} value={form.propertyType} onChange={(e) => setForm((f) => ({ ...f, propertyType: e.target.value as PropertyType | "" }))}>
              <option value="">Any type</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <textarea className={field} rows={3} placeholder="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
          <button type="submit" disabled={loading} className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? "Matching..." : "Find matches"}
          </button>
        </form>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-lg font-semibold">Recommendations</h2>
          {!result ? (
            <p className="mt-4 text-sm text-[var(--muted)]">Results appear here.</p>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-[var(--muted)]">{result.summary}</p>
              {result.matches.map((item) => (
                <Link
                  key={item.propertyId}
                  href={`/listings/${item.property._id}`}
                  className="block rounded-xl border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <div className="flex justify-between gap-2">
                    <p className="font-semibold">{item.property.title}</p>
                    <span className="text-xs font-semibold text-[var(--accent)]">{item.matchScore}%</span>
                  </div>
                  <p className="mt-1 text-sm">{item.reason}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
