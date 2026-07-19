"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CircleDollarSign, Handshake, Home, Users } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { fetchReportsSummary } from "@/services/reports.service";
import type { ReportsSummary } from "@/types/reports";

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function ReportsView() {
  const [data, setData] = useState<ReportsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchReportsSummary()
      .then((summary) => {
        if (!active) return;
        setData(summary);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load reports");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="h-80 animate-pulse rounded-2xl bg-[var(--border)]" />;
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-16 text-center text-sm text-[var(--muted)]">
        {error || "Reports unavailable"}
      </div>
    );
  }

  const empty = data.meta.dataMode === "empty";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Revenue, sales, lead sources, and agent performance.
        </p>
      </div>

      {empty ? (
        <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)]">
          No closed deals yet — charts will fill as leads and sales move forward.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Revenue"
          value={formatMoney(data.kpis.revenue, data.kpis.currency)}
          hint="Sold / rented inventory value"
          icon={CircleDollarSign}
        />
        <KpiCard
          label="Sales"
          value={String(data.kpis.sales)}
          hint={`${data.kpis.soldProperties} sold properties`}
          icon={Handshake}
        />
        <KpiCard
          label="Closed leads"
          value={String(data.kpis.closedLeads)}
          hint="Pipeline conversions"
          icon={Users}
        />
        <KpiCard
          label="Sold properties"
          value={String(data.kpis.soldProperties)}
          hint="Inventory marked sold"
          icon={Home}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Closed leads by month">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.charts.salesByMonth}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted)", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted)", fontSize: 12 }}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  color: "var(--foreground)",
                }}
              />
              <Bar dataKey="value" fill="var(--accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Lead sources">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.charts.leadSources}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="source"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted)", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted)", fontSize: 12 }}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  color: "var(--foreground)",
                }}
              />
              <Bar dataKey="count" fill="var(--accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold tracking-tight">Agent performance</h2>
        {data.agentPerformance.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            Assign agents on leads to see conversion rates here.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="pb-3 font-medium">Agent ID</th>
                  <th className="pb-3 font-medium">Leads</th>
                  <th className="pb-3 font-medium">Closed</th>
                  <th className="pb-3 font-medium">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {data.agentPerformance.map((row) => (
                  <tr key={row.agentId} className="border-t border-[var(--border)]">
                    <td className="py-3 font-mono text-xs">{row.agentId}</td>
                    <td className="py-3">{row.leads}</td>
                    <td className="py-3">{row.closed}</td>
                    <td className="py-3">{row.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h2 className="mb-4 text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
