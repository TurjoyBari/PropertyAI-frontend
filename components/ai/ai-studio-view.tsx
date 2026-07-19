"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  generatePropertyDescription,
  getAiStatus,
  matchProperties,
  summarizeLead,
} from "@/services/ai.service";
import { PropertyAiChat } from "@/components/ai/property-ai-chat";
import { listLeads } from "@/services/leads.service";
import { PROPERTY_TYPES, type PropertyType } from "@/types/property";
import type { Lead } from "@/types/lead";
import type {
  AiStatus,
  GenerateDescriptionResponse,
  LeadSummaryResponse,
  MatchPropertiesResponse,
} from "@/types/ai";

const fieldClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2";

type Tab = "match" | "describe" | "summary" | "agent";

function AiNotice({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p className="rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] px-3 py-2 text-sm">
      {text}
    </p>
  );
}

export function AiStudioView() {
  const [tab, setTab] = useState<Tab>("match");
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAiStatus()
      .then(setStatus)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load AI status"),
      );
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">AI Studio</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          AI enhances search and writing. Listings always come from MongoDB —
          the app works even when AI is offline.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm">
        {status ? (
          <p>
            Provider: <span className="font-medium">{status.provider || "gemini"}</span>
            {" · "}
            Model: <span className="font-medium">{status.model}</span>
            {" · "}
            {status.configured ? (
              <span className="text-[var(--accent)]">AI configured</span>
            ) : (
              <span className="text-[var(--muted)]">
                AI offline — standard search & templates still work
              </span>
            )}
          </p>
        ) : (
          <p className="text-[var(--muted)]">Checking AI status...</p>
        )}
      </div>

      {error ? (
        <p className="rounded-xl bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["match", "Property Finder"],
            ["describe", "Description Generator"],
            ["summary", "Lead Summary"],
            ["agent", "Chat Assistant"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              setError(null);
            }}
            className={clsx(
              "rounded-xl px-4 py-2 text-sm font-medium transition",
              tab === id
                ? "bg-[var(--accent)] text-white"
                : "border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "match" ? <MatchPanel onError={setError} /> : null}
      {tab === "describe" ? <DescribePanel onError={setError} /> : null}
      {tab === "summary" ? <SummaryPanel onError={setError} /> : null}
      {tab === "agent" ? (
        <div className="h-[36rem] rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <PropertyAiChat variant="studio" onError={setError} />
        </div>
      ) : null}
    </div>
  );
}

function MatchPanel({ onError }: { onError: (value: string | null) => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchPropertiesResponse | null>(null);
  const [form, setForm] = useState({
    query: "",
    budgetMin: "",
    budgetMax: "",
    location: "",
    bedrooms: "",
    propertyType: "" as PropertyType | "",
    notes: "",
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form
        className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          onError(null);
          try {
            const data = await matchProperties({
              query: form.query || undefined,
              budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
              budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
              location: form.location || undefined,
              bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
              propertyType: form.propertyType || undefined,
              notes: form.notes || undefined,
            });
            setResult(data);
          } catch (err) {
            onError(err instanceof Error ? err.message : "Matching failed");
          } finally {
            setLoading(false);
          }
        }}
      >
        <h2 className="text-lg font-semibold">Natural language + filters</h2>
        <textarea
          className={fieldClass}
          rows={3}
          placeholder='e.g. "3 bedroom apartment in Uttara under 80 lakh near metro"'
          value={form.query}
          onChange={(e) => setForm((f) => ({ ...f, query: e.target.value }))}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={fieldClass}
            placeholder="Budget min"
            type="number"
            value={form.budgetMin}
            onChange={(e) => setForm((f) => ({ ...f, budgetMin: e.target.value }))}
          />
          <input
            className={fieldClass}
            placeholder="Budget max"
            type="number"
            value={form.budgetMax}
            onChange={(e) => setForm((f) => ({ ...f, budgetMax: e.target.value }))}
          />
          <input
            className={fieldClass}
            placeholder="Location (city/area)"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
          <input
            className={fieldClass}
            placeholder="Bedrooms"
            type="number"
            value={form.bedrooms}
            onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))}
          />
          <select
            className={fieldClass}
            value={form.propertyType}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                propertyType: e.target.value as PropertyType | "",
              }))
            }
          >
            <option value="">Any type</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <textarea
          className={fieldClass}
          rows={2}
          placeholder="Extra notes (optional)"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Searching MongoDB..." : "Find matches"}
        </button>
      </form>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">Database results</h2>
        {!result ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            AI extracts filters when needed; results always come from MongoDB.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <AiNotice text={result.notice} />
            <p className="text-sm text-[var(--muted)]">{result.summary}</p>
            {result.matches.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No matches found.</p>
            ) : (
              result.matches.map((item) => (
                <article
                  key={item.propertyId}
                  className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.property.title}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {item.property.location?.city}
                        {item.property.location?.area
                          ? ` · ${item.property.location.area}`
                          : ""}{" "}
                        · {item.property.bedrooms} bed ·{" "}
                        {item.property.price.toLocaleString()} {item.property.currency}
                      </p>
                    </div>
                    <span className="rounded-lg bg-[var(--accent-soft)] px-2 py-1 text-xs font-semibold text-[var(--accent)]">
                      {item.matchScore}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{item.reason}</p>
                  <Link
                    href={`/properties/${item.property._id}`}
                    className="mt-2 inline-flex text-xs font-medium text-[var(--accent)] hover:underline"
                  >
                    Open property
                  </Link>
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function DescribePanel({ onError }: { onError: (value: string | null) => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateDescriptionResponse | null>(null);
  const [form, setForm] = useState({
    title: "",
    location: "",
    features: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    price: "",
  });

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <form
        className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          onError(null);
          try {
            setResult(
              await generatePropertyDescription({
                title: form.title,
                location: form.location,
                features: form.features || undefined,
                area: form.area || undefined,
                bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
                bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
                price: form.price ? Number(form.price) : undefined,
              }),
            );
          } catch (err) {
            onError(err instanceof Error ? err.message : "Generation failed");
          } finally {
            setLoading(false);
          }
        }}
      >
        <h2 className="text-lg font-semibold">Listing inputs</h2>
        <input
          className={fieldClass}
          placeholder="Title"
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <input
          className={fieldClass}
          placeholder="Location"
          required
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
        />
        <textarea
          className={fieldClass}
          rows={3}
          placeholder="Features"
          value={form.features}
          onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={fieldClass}
            placeholder="Area / size"
            value={form.area}
            onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
          />
          <input
            className={fieldClass}
            placeholder="Price"
            type="number"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
          <input
            className={fieldClass}
            placeholder="Bedrooms"
            type="number"
            value={form.bedrooms}
            onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))}
          />
          <input
            className={fieldClass}
            placeholder="Bathrooms"
            type="number"
            value={form.bathrooms}
            onChange={(e) => setForm((f) => ({ ...f, bathrooms: e.target.value }))}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate description"}
        </button>
      </form>

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">Generated copy</h2>
        {!result ? (
          <p className="text-sm text-[var(--muted)]">
            AI writes description, SEO text, and marketing caption from your facts.
          </p>
        ) : (
          <>
            <AiNotice text={result.notice} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Description
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{result.description}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                SEO
              </p>
              <p className="mt-1 text-sm">{result.seoDescription}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Caption
              </p>
              <p className="mt-1 text-sm">{result.marketingCaption}</p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function SummaryPanel({ onError }: { onError: (value: string | null) => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadId, setLeadId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LeadSummaryResponse | null>(null);

  useEffect(() => {
    listLeads({ limit: 100 })
      .then((data) => setLeads(data.items))
      .catch(() => setLeads([]));
  }, []);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <form
        className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!leadId) return;
          setLoading(true);
          onError(null);
          try {
            setResult(await summarizeLead(leadId));
          } catch (err) {
            onError(err instanceof Error ? err.message : "Summary failed");
          } finally {
            setLoading(false);
          }
        }}
      >
        <h2 className="text-lg font-semibold">Summarize a lead</h2>
        <select
          className={fieldClass}
          value={leadId}
          onChange={(e) => setLeadId(e.target.value)}
          required
        >
          <option value="">Select lead</option>
          {leads.map((lead) => (
            <option key={lead._id} value={lead._id}>
              {lead.fullName} · {lead.status} · score {lead.score}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading || !leadId}
          className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Summarizing..." : "Generate AI summary"}
        </button>
      </form>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">Lead summary</h2>
        {!result ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            Interest, budget, location, conversation summary, and next action.
          </p>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            <AiNotice text={result.notice} />
            <p>
              Score: <strong>{result.score}</strong> · Temperature:{" "}
              <strong className="capitalize">{result.temperature}</strong>
            </p>
            <p>
              <span className="text-[var(--muted)]">Interest:</span>{" "}
              {result.customerInterest}
            </p>
            <p>
              <span className="text-[var(--muted)]">Budget:</span> {result.budget}
            </p>
            <p>
              <span className="text-[var(--muted)]">Preferred location:</span>{" "}
              {result.preferredLocation}
            </p>
            <p>
              <span className="text-[var(--muted)]">Conversation:</span>{" "}
              {result.conversationSummary}
            </p>
            <p>
              Next action: <strong>{result.recommendedNextAction}</strong>
            </p>
            <Link
              href={`/leads/${result.leadId}`}
              className="inline-flex text-xs font-medium text-[var(--accent)] hover:underline"
            >
              Open lead
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
