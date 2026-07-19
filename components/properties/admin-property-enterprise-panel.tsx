"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getAdminPropertyInsights,
  suspendAdminUser,
  updateAdminPropertyMeta,
  type AdminPropertyInsights,
  type AdminPropertyMetaInput,
} from "@/services/admin.service";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/store/toast-store";

const TAG_OPTIONS = [
  "Hot Property",
  "Featured",
  "VIP",
  "Premium",
  "Urgent Sale",
  "Verified",
] as const;

function formatMoney(value: number, currency = "BDT") {
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString()}`;
  }
}

function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value?: string | Date | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide text-[var(--foreground)]">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatGrid({
  items,
}: {
  items: Array<{ label: string; value: React.ReactNode }>;
}) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_70%,transparent)] px-3 py-2.5"
        >
          <dt className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
            {item.label}
          </dt>
          <dd className="mt-1 text-sm font-medium capitalize">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function VisitTable({
  rows,
  empty,
}: {
  rows: AdminPropertyInsights["visits"]["upcoming"];
  empty: string;
}) {
  if (!rows.length) {
    return <p className="text-sm text-[var(--muted)]">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
          <tr>
            <th className="pb-2 pr-3 font-medium">Visitor</th>
            <th className="pb-2 pr-3 font-medium">Date</th>
            <th className="pb-2 pr-3 font-medium">Time</th>
            <th className="pb-2 pr-3 font-medium">Agent</th>
            <th className="pb-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-[var(--border)]">
              <td className="py-2.5 pr-3">{row.visitorName}</td>
              <td className="py-2.5 pr-3">{formatDate(row.visitDate)}</td>
              <td className="py-2.5 pr-3">{formatTime(row.visitTime)}</td>
              <td className="py-2.5 pr-3 font-mono text-xs">
                {row.assignedAgent
                  ? `${row.assignedAgent.slice(0, 8)}…`
                  : "—"}
              </td>
              <td className="py-2.5 capitalize">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type Props = {
  propertyId: string;
  onPropertyChanged?: () => void;
};

export function AdminPropertyEnterprisePanel({
  propertyId,
  onPropertyChanged,
}: Props) {
  const [data, setData] = useState<AdminPropertyInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [savingNotes, setSavingNotes] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    title: string;
    description: string;
    warning?: string;
    tone?: "danger" | "accent";
    confirmLabel: string;
    run: () => Promise<void>;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const insights = await getAdminPropertyInsights(propertyId);
      setData(insights);
      setNotes(insights.adminNotes || "");
      setTags(insights.internalTags || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load admin insights",
      );
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const currency = data?.financial.currency || "BDT";

  const mapSrc = useMemo(() => {
    if (!data?.map.query) return null;
    return `https://www.google.com/maps?q=${encodeURIComponent(data.map.query)}&output=embed`;
  }, [data?.map.query]);

  async function runMeta(body: AdminPropertyMetaInput, label: string) {
    setActionLoading(label);
    try {
      const next = await updateAdminPropertyMeta(propertyId, body);
      setData(next);
      setNotes(next.adminNotes || "");
      setTags(next.internalTags || []);
      toast("Updated successfully.");
      onPropertyChanged?.();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Update failed", "error");
    } finally {
      setActionLoading(null);
    }
  }

  function askConfirm(
    opts: NonNullable<typeof confirm>,
  ) {
    setConfirm(opts);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--border)]" />
        <div className="h-40 animate-pulse rounded-2xl bg-[var(--border)]" />
        <div className="h-56 animate-pulse rounded-2xl bg-[var(--border)]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-10 text-center text-sm text-[var(--muted)]">
        {error || "Admin insights unavailable"}
      </div>
    );
  }

  const p = data.property;
  const agent = data.listingAgent;

  return (
    <div className="space-y-6 border-t border-[var(--border)] pt-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          Admin only
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          Enterprise property details
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Operational intelligence for this listing. Not visible to agents or
          customers.
        </p>
      </div>

      <Section title="Property overview">
        <StatGrid
          items={[
            { label: "Property ID", value: p._id },
            { label: "Title", value: p.title },
            { label: "Type", value: p.type },
            { label: "Status", value: p.status },
            {
              label: "Price",
              value: formatMoney(p.price, p.currency || currency),
            },
            {
              label: "Area",
              value: p.areaSqFt ? `${p.areaSqFt} sqft` : "—",
            },
            { label: "Bedrooms", value: p.bedrooms ?? "—" },
            { label: "Bathrooms", value: p.bathrooms ?? "—" },
            { label: "Parking", value: p.parking ?? "—" },
            {
              label: "Category",
              value: p.purpose || "sale",
            },
            { label: "Created", value: formatDate(p.createdAt) },
            { label: "Last updated", value: formatDate(p.updatedAt) },
          ]}
        />
      </Section>

      <Section title="Listing agent">
        {agent ? (
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="shrink-0">
              {agent.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={agent.image}
                  alt={agent.name}
                  className="h-20 w-20 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-2xl font-semibold text-[var(--accent)]">
                  {agent.name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <StatGrid
                items={[
                  { label: "Full name", value: agent.name },
                  { label: "Agent ID", value: agent.id },
                  { label: "Email", value: agent.email || "—" },
                  { label: "Phone", value: agent.phone || "—" },
                  { label: "Office address", value: agent.officeAddress },
                  { label: "Agency", value: agent.agency },
                  { label: "Role", value: agent.role },
                  {
                    label: "Rating",
                    value: `${agent.rating.toFixed(1)} / 5`,
                  },
                  { label: "Total reviews", value: agent.totalReviews },
                  { label: "Account status", value: agent.accountStatus },
                  { label: "Joined", value: formatDate(agent.createdAt) },
                  {
                    label: "Last active",
                    value: formatDate(agent.lastActive),
                  },
                ]}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            No listing agent linked to this property.
          </p>
        )}
      </Section>

      <Section title="Agent performance">
        <StatGrid
          items={[
            {
              label: "Total properties listed",
              value: data.agentPerformance.totalPropertiesListed,
            },
            {
              label: "Active listings",
              value: data.agentPerformance.activeListings,
            },
            {
              label: "Pending listings",
              value: data.agentPerformance.pendingListings,
            },
            {
              label: "Sold properties",
              value: data.agentPerformance.soldProperties,
            },
            {
              label: "Rented properties",
              value: data.agentPerformance.rentedProperties,
            },
            {
              label: "Cancelled listings",
              value: data.agentPerformance.cancelledListings,
            },
            {
              label: "Average response time",
              value: data.agentPerformance.averageResponseTime,
            },
            {
              label: "Lead conversion rate",
              value: `${data.agentPerformance.leadConversionRate}%`,
            },
            {
              label: "Customer rating",
              value:
                data.agentPerformance.customerRating != null
                  ? `${data.agentPerformance.customerRating.toFixed(1)} / 5`
                  : "—",
            },
          ]}
        />
      </Section>

      <Section title="Quick actions">
        <div className="flex flex-wrap gap-2">
          {agent ? (
            <>
              <Link
                href={`/admin?user=${agent.id}`}
                className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--accent-soft)]"
              >
                View agent profile
              </Link>
              <Link
                href={`/properties?listedBy=${agent.id}`}
                className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--accent-soft)]"
              >
                View all properties
              </Link>
              <a
                href={`/admin/messages`}
                className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--accent-soft)]"
              >
                Send message
              </a>
              {agent.phone ? (
                <a
                  href={`tel:${agent.phone}`}
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--accent-soft)]"
                >
                  Call agent
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] opacity-60"
                >
                  Call agent
                </button>
              )}
              {agent.email ? (
                <a
                  href={`mailto:${agent.email}`}
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--accent-soft)]"
                >
                  Email agent
                </a>
              ) : null}
              <button
                type="button"
                disabled={actionLoading !== null}
                onClick={() =>
                  askConfirm({
                    title: agent.banned
                      ? "Restore agent account"
                      : "Suspend agent",
                    description: agent.banned
                      ? `Unban ${agent.name} and restore access?`
                      : `Suspend ${agent.name}? They will not be able to sign in.`,
                    warning: agent.banned
                      ? undefined
                      : "This affects the agent across the platform.",
                    tone: agent.banned ? "accent" : "danger",
                    confirmLabel: agent.banned ? "Restore" : "Suspend agent",
                    run: async () => {
                      await suspendAdminUser(agent.id, !agent.banned);
                      toast(
                        agent.banned
                          ? "Agent account restored."
                          : "Agent suspended.",
                      );
                      await load();
                    },
                  })
                }
                className="rounded-xl border border-[var(--danger)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {agent.banned ? "Restore agent" : "Suspend agent"}
              </button>
            </>
          ) : (
            <p className="text-sm text-[var(--muted)]">No agent to act on.</p>
          )}
        </div>
      </Section>

      <Section
        title="Property analytics"
        action={
          data.analytics.viewsAreEstimated ? (
            <span className="text-xs text-[var(--muted)]">
              Views estimated from engagement
            </span>
          ) : null
        }
      >
        <StatGrid
          items={[
            { label: "Total views", value: data.analytics.totalViews },
            {
              label: "Unique visitors",
              value: data.analytics.uniqueVisitors,
            },
            {
              label: "Total favorites",
              value: data.analytics.totalFavorites,
            },
            {
              label: "Visit requests",
              value: data.analytics.totalVisitRequests,
            },
            { label: "Total leads", value: data.analytics.totalLeads },
            {
              label: "Interested customers",
              value: data.analytics.interestedCustomers,
            },
            {
              label: "Total messages",
              value: data.analytics.totalMessages,
            },
            {
              label: "Phone calls",
              value: data.analytics.totalPhoneCalls,
            },
            {
              label: "Avg. time on listing",
              value: data.analytics.averageTimeOnListing,
            },
            {
              label: "Click-through rate",
              value: `${data.analytics.clickThroughRate}%`,
            },
            {
              label: "Conversion rate",
              value: `${data.analytics.conversionRate}%`,
            },
          ]}
        />
      </Section>

      <Section title="Property timeline">
        {data.timeline.length ? (
          <ol className="space-y-0">
            {data.timeline.map((event, index) => (
              <li key={`${event.action}-${index}`} className="flex gap-3">
                <div className="flex w-4 flex-col items-center">
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                  {index < data.timeline.length - 1 ? (
                    <span className="mt-1 w-px flex-1 bg-[var(--border)]" />
                  ) : null}
                </div>
                <div className="pb-5">
                  <p className="text-sm font-medium">{event.action}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {formatDate(event.at)} · {formatTime(event.at)} ·{" "}
                    {event.user} ({event.role})
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-[var(--muted)]">No timeline events yet.</p>
        )}
      </Section>

      <Section title="Activity log">
        {data.activityLog.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="pb-2 pr-3 font-medium">User</th>
                  <th className="pb-2 pr-3 font-medium">Role</th>
                  <th className="pb-2 pr-3 font-medium">Action</th>
                  <th className="pb-2 pr-3 font-medium">Date</th>
                  <th className="pb-2 pr-3 font-medium">Time</th>
                  <th className="pb-2 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {data.activityLog.map((row, i) => (
                  <tr
                    key={`${row.action}-${i}`}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="py-2.5 pr-3">{row.user}</td>
                    <td className="py-2.5 pr-3 capitalize">{row.role}</td>
                    <td className="py-2.5 pr-3">{row.action}</td>
                    <td className="py-2.5 pr-3">{formatDate(row.at)}</td>
                    <td className="py-2.5 pr-3">{formatTime(row.at)}</td>
                    <td className="py-2.5 font-mono text-xs">
                      {row.ip || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">No activity logged yet.</p>
        )}
      </Section>

      <Section title="Property documents">
        {data.documents.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="pb-2 pr-3 font-medium">Document</th>
                  <th className="pb-2 pr-3 font-medium">Uploaded</th>
                  <th className="pb-2 font-medium">Verification</th>
                </tr>
              </thead>
              <tbody>
                {data.documents.map((doc, i) => (
                  <tr key={`${doc.name}-${i}`} className="border-t border-[var(--border)]">
                    <td className="py-2.5 pr-3">
                      {doc.url ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--accent)] hover:underline"
                        >
                          {doc.name}
                        </a>
                      ) : (
                        doc.name
                      )}
                    </td>
                    <td className="py-2.5 pr-3">
                      {formatDate(doc.uploadedAt)}
                    </td>
                    <td className="py-2.5">{doc.verificationStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-2 text-sm text-[var(--muted)]">
            <p>No documents uploaded yet. Expected types:</p>
            <p>
              Ownership Document · Tax Document · NID Verification · Floor Plan
              · Agreement
            </p>
          </div>
        )}
      </Section>

      <Section title="Visit requests">
        <div className="space-y-5">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Upcoming ({data.visits.upcoming.length})
            </h3>
            <VisitTable
              rows={data.visits.upcoming}
              empty="No upcoming visits."
            />
          </div>
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Completed ({data.visits.completed.length})
            </h3>
            <VisitTable
              rows={data.visits.completed}
              empty="No completed visits."
            />
          </div>
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Cancelled ({data.visits.cancelled.length})
            </h3>
            <VisitTable
              rows={data.visits.cancelled}
              empty="No cancelled visits."
            />
          </div>
        </div>
      </Section>

      <Section title="Interested customers">
        {data.interestedCustomers.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="pb-2 pr-3 font-medium">Customer</th>
                  <th className="pb-2 pr-3 font-medium">Phone</th>
                  <th className="pb-2 pr-3 font-medium">Email</th>
                  <th className="pb-2 pr-3 font-medium">Score</th>
                  <th className="pb-2 pr-3 font-medium">Budget</th>
                  <th className="pb-2 pr-3 font-medium">Area</th>
                  <th className="pb-2 pr-3 font-medium">Last contact</th>
                  <th className="pb-2 pr-3 font-medium">Stage</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.interestedCustomers.map((c) => (
                  <tr key={c.id} className="border-t border-[var(--border)]">
                    <td className="py-2.5 pr-3">{c.fullName}</td>
                    <td className="py-2.5 pr-3">{c.phone || "—"}</td>
                    <td className="py-2.5 pr-3">{c.email || "—"}</td>
                    <td className="py-2.5 pr-3">{c.leadScore}</td>
                    <td className="py-2.5 pr-3">
                      {c.budgetMin != null || c.budgetMax != null
                        ? `${c.budgetMin ?? "—"} – ${c.budgetMax ?? "—"}`
                        : "—"}
                    </td>
                    <td className="py-2.5 pr-3">{c.preferredArea || "—"}</td>
                    <td className="py-2.5 pr-3">
                      {formatDate(c.lastContact)}
                    </td>
                    <td className="py-2.5 pr-3 capitalize">
                      {c.currentStage}
                    </td>
                    <td className="py-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        <Link
                          href={`/leads/${c.id}`}
                          className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs hover:bg-[var(--accent-soft)]"
                        >
                          Open
                        </Link>
                        {c.phone ? (
                          <a
                            href={`tel:${c.phone}`}
                            className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs hover:bg-[var(--accent-soft)]"
                          >
                            Call
                          </a>
                        ) : null}
                        <Link
                          href="/admin/messages"
                          className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs hover:bg-[var(--accent-soft)]"
                        >
                          Message
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            No interested customers yet.
          </p>
        )}
      </Section>

      <Section title="Financial information">
        <StatGrid
          items={[
            {
              label: "Listing price",
              value: formatMoney(data.financial.listingPrice, currency),
            },
            {
              label: "Suggested AI price",
              value: formatMoney(data.financial.suggestedAiPrice, currency),
            },
            {
              label: "Final selling price",
              value:
                data.financial.finalSellingPrice != null
                  ? formatMoney(data.financial.finalSellingPrice, currency)
                  : "—",
            },
            {
              label: "Commission",
              value: `${formatMoney(data.financial.commission, currency)} (${data.financial.commissionPercent}%)`,
            },
            {
              label: "Agent commission",
              value: formatMoney(data.financial.agentCommission, currency),
            },
            {
              label: "Company revenue",
              value: formatMoney(data.financial.companyRevenue, currency),
            },
            {
              label: "Profit",
              value: formatMoney(data.financial.profit, currency),
            },
          ]}
        />
      </Section>

      <Section title="AI insights">
        <StatGrid
          items={[
            {
              label: "AI lead score",
              value: data.aiInsights.aiLeadScore,
            },
            {
              label: "Demand score",
              value: data.aiInsights.propertyDemandScore,
            },
            {
              label: "Popularity score",
              value: data.aiInsights.popularityScore,
            },
            {
              label: "Price recommendation",
              value: formatMoney(
                data.aiInsights.priceRecommendation,
                currency,
              ),
            },
            {
              label: "Market trend",
              value: data.aiInsights.marketTrend,
            },
            {
              label: "Estimated selling time",
              value: data.aiInsights.estimatedSellingTime,
            },
            {
              label: "Investment rating",
              value: data.aiInsights.investmentRating,
            },
            { label: "Risk level", value: data.aiInsights.riskLevel },
          ]}
        />
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Recommended improvements
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-[var(--muted)]">
            {data.aiInsights.recommendedImprovements.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title="Admin notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Private notes visible only to admins…"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />
        <button
          type="button"
          disabled={savingNotes}
          onClick={async () => {
            setSavingNotes(true);
            try {
              await runMeta({ adminNotes: notes }, "notes");
            } finally {
              setSavingNotes(false);
            }
          }}
          className="mt-3 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {savingNotes ? "Saving…" : "Save notes"}
        </button>
      </Section>

      <Section title="Internal tags">
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((tag) => {
            const active = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  setTags((prev) =>
                    active ? prev.filter((t) => t !== tag) : [...prev, tag],
                  )
                }
                className={
                  active
                    ? "rounded-xl bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white"
                    : "rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-medium"
                }
              >
                {tag}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          disabled={actionLoading !== null}
          onClick={() => void runMeta({ internalTags: tags }, "tags")}
          className="mt-3 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium"
        >
          Save tags
        </button>
      </Section>

      <Section title="Audit information">
        <StatGrid
          items={[
            {
              label: "Created by",
              value: data.audit.createdBy || "—",
            },
            {
              label: "Created at",
              value: formatDate(data.audit.createdAt),
            },
            {
              label: "Last updated by",
              value: data.audit.lastUpdatedBy || "—",
            },
            {
              label: "Updated at",
              value: formatDate(data.audit.updatedAt),
            },
            {
              label: "Approved by",
              value: data.audit.approvedBy || "—",
            },
            {
              label: "Approved at",
              value: formatDate(data.audit.approvedAt),
            },
            {
              label: "Deleted by",
              value: data.audit.deletedBy || "—",
            },
            {
              label: "Deleted at",
              value: formatDate(data.audit.deletedAt),
            },
          ]}
        />
      </Section>

      <Section title="Related properties">
        {data.relatedProperties.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.relatedProperties.map((rel) => (
              <Link
                key={rel._id}
                href={`/properties/${rel._id}`}
                className="rounded-xl border border-[var(--border)] p-3 transition hover:border-[var(--accent)]"
              >
                <p className="line-clamp-2 text-sm font-medium">{rel.title}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {formatMoney(rel.price, rel.currency || currency)} ·{" "}
                  {rel.location?.area || rel.location?.city || rel.type}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">No similar listings.</p>
        )}
      </Section>

      <Section title="Map & nearby">
        {mapSrc ? (
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <iframe
              title="Property map"
              src={mapSrc}
              className="h-64 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">Location unavailable.</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {data.map.nearby.map((place) => (
            <a
              key={place}
              href={`https://www.google.com/maps/search/${encodeURIComponent(`${place} near ${data.map.query}`)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--accent-soft)]"
            >
              {place}
            </a>
          ))}
        </div>
      </Section>

      <Section title="Admin actions">
        <div className="flex flex-wrap gap-2">
          {(
            [
              {
                key: "approve",
                label: "Approve property",
                action: "approve" as const,
                tone: "accent" as const,
              },
              {
                key: "reject",
                label: "Reject property",
                action: "reject" as const,
                tone: "danger" as const,
              },
              {
                key: "suspend",
                label: "Suspend listing",
                action: "suspend" as const,
                tone: "danger" as const,
              },
              {
                key: "feature",
                label: data.featured ? "Unmark featured" : "Mark as featured",
                action: (data.featured ? "unfeature" : "feature") as
                  | "feature"
                  | "unfeature",
                tone: "accent" as const,
              },
              {
                key: "archive",
                label: "Archive",
                action: "archive" as const,
                tone: "danger" as const,
              },
              {
                key: "restore",
                label: "Restore",
                action: "restore" as const,
                tone: "accent" as const,
              },
              {
                key: "delete",
                label: "Delete",
                action: "delete" as const,
                tone: "danger" as const,
              },
            ] as const
          ).map((btn) => (
            <button
              key={btn.key}
              type="button"
              disabled={actionLoading !== null}
              onClick={() =>
                askConfirm({
                  title: btn.label,
                  description: `Confirm “${btn.label}” for this property?`,
                  tone: btn.tone,
                  confirmLabel: btn.label,
                  run: async () => {
                    await runMeta({ action: btn.action }, btn.key);
                  },
                })
              }
              className={
                btn.tone === "danger"
                  ? "rounded-xl border border-[var(--danger)] px-3 py-2 text-sm font-medium text-[var(--danger)] disabled:opacity-60"
                  : "rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-60"
              }
            >
              {actionLoading === btn.key ? "Working…" : btn.label}
            </button>
          ))}
        </div>
      </Section>

      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        title={confirm?.title || ""}
        description={confirm?.description}
        warning={confirm?.warning}
        tone={confirm?.tone || "danger"}
        confirmLabel={confirm?.confirmLabel || "Confirm"}
        loading={actionLoading !== null}
        onConfirm={async () => {
          if (!confirm) return;
          await confirm.run();
          setConfirm(null);
        }}
      />
    </div>
  );
}
