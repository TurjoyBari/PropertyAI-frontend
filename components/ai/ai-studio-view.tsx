"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  chatWithAgent,
  getAiStatus,
  matchProperties,
  scoreLead,
} from "@/services/ai.service";
import { listLeads } from "@/services/leads.service";
import { listProperties } from "@/services/properties.service";
import { PROPERTY_TYPES, type PropertyType } from "@/types/property";
import type { Lead } from "@/types/lead";
import type { Property } from "@/types/property";
import type {
  AiStatus,
  MatchPropertiesResponse,
  ScoreLeadResponse,
} from "@/types/ai";

const fieldClass =
  "w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2";

type Tab = "match" | "score" | "agent";

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
          Property matching, lead scoring, and sales agent powered by Gemini.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm">
        {status ? (
          <p>
            Model: <span className="font-medium">{status.model}</span>
            {" · "}
            {status.configured ? (
              <span className="text-[var(--accent)]">Gemini configured</span>
            ) : (
              <span className="text-[var(--danger)]">
                GEMINI_API_KEY missing in backend .env
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
            ["match", "Property Matching"],
            ["score", "Lead Scoring"],
            ["agent", "Sales Agent"],
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
      {tab === "score" ? <ScorePanel onError={setError} /> : null}
      {tab === "agent" ? <AgentPanel onError={setError} /> : null}
    </div>
  );
}

function MatchPanel({ onError }: { onError: (value: string | null) => void }) {
  const [loading, setLoading] = useState(false);
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
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form
        className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          onError(null);
          try {
            const data = await matchProperties({
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
        <h2 className="text-lg font-semibold">Buyer criteria</h2>
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
          rows={3}
          placeholder="Extra notes (schools nearby, parking...)"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Matching..." : "Find matches"}
        </button>
      </form>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">Results</h2>
        {!result ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            Enter criteria to get ranked property recommendations.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
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

function ScorePanel({ onError }: { onError: (value: string | null) => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadId, setLeadId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreLeadResponse | null>(null);

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
            setResult(await scoreLead(leadId));
          } catch (err) {
            onError(err instanceof Error ? err.message : "Scoring failed");
          } finally {
            setLoading(false);
          }
        }}
      >
        <h2 className="text-lg font-semibold">Score a lead</h2>
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
          {loading ? "Scoring..." : "Run AI score"}
        </button>
      </form>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">Score result</h2>
        {!result ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            Pick a lead to generate score, temperature, and next action.
          </p>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            <p>
              Score: <strong>{result.score}</strong> · Temperature:{" "}
              <strong className="capitalize">{result.temperature}</strong>
            </p>
            <p>Conversion probability: {result.conversionProbability}%</p>
            <p>
              Next action: <strong>{result.recommendedNextAction}</strong>
            </p>
            <p className="text-[var(--muted)]">{result.rationale}</p>
            {result.factors?.length ? (
              <ul className="list-disc space-y-1 pl-5 text-[var(--muted)]">
                {result.factors.map((factor) => (
                  <li key={factor}>{factor}</li>
                ))}
              </ul>
            ) : null}
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

function AgentPanel({ onError }: { onError: (value: string | null) => void }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);

  useEffect(() => {
    listProperties({ limit: 50 })
      .then((data) => setProperties(data.items))
      .catch(() => setProperties([]));
  }, []);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium">Focus property (optional)</label>
          <select
            className={fieldClass}
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
          >
            <option value="">General inventory</option>
            {properties.map((property) => (
              <option key={property._id} value={property._id}>
                {property.title} · {property.location.city}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
          onClick={() => setHistory([])}
        >
          Clear chat
        </button>
      </div>

      <div className="mb-4 max-h-[22rem] space-y-3 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
        {history.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Ask about pricing, amenities, or how to book a visit.
          </p>
        ) : (
          history.map((item, index) => (
            <div
              key={`${item.role}-${index}`}
              className={clsx(
                "rounded-xl px-3 py-2 text-sm",
                item.role === "user"
                  ? "ml-8 bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "mr-8 bg-[var(--card)]",
              )}
            >
              <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                {item.role === "user" ? "You" : "Agent"}
              </p>
              <p className="whitespace-pre-wrap">{item.content}</p>
            </div>
          ))
        )}
      </div>

      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!message.trim()) return;
          const nextHistory = [...history, { role: "user" as const, content: message.trim() }];
          setHistory(nextHistory);
          setMessage("");
          setLoading(true);
          onError(null);
          try {
            const data = await chatWithAgent({
              message: nextHistory[nextHistory.length - 1].content,
              propertyId: propertyId || undefined,
              history: nextHistory.slice(0, -1),
            });
            setHistory((prev) => [
              ...prev,
              { role: "assistant", content: data.reply },
            ]);
          } catch (err) {
            onError(err instanceof Error ? err.message : "Chat failed");
          } finally {
            setLoading(false);
          }
        }}
      >
        <input
          className={fieldClass}
          placeholder="Ask the sales agent..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>
    </div>
  );
}
