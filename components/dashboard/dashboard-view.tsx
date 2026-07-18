"use client";

import { useEffect, useState } from "react";
import { Building2, CircleDollarSign, Handshake, Users } from "lucide-react";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { fetchDashboardStats } from "@/services/dashboard.service";
import type { DashboardStats } from "@/types/dashboard";

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetchDashboardStats()
      .then((data) => {
        if (!active) return;
        setStats(data);
      })
      .catch(() => {
        if (!active) return;
        setError("Could not load dashboard stats. Is the backend running?");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-16 text-center">
        <p className="text-lg font-semibold">Dashboard unavailable</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {error || "Something went wrong while loading stats."}
        </p>
      </div>
    );
  }

  const empty = stats.meta.dataMode === "empty";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Welcome back, {stats.viewer.name}. Here&apos;s your PropertyAI overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Properties"
          value={String(stats.kpis.totalProperties)}
          hint={`${stats.kpis.availableProperties} available`}
          icon={Building2}
        />
        <KpiCard
          label="Active Leads"
          value={String(stats.kpis.activeLeads)}
          hint="Open pipeline"
          icon={Users}
        />
        <KpiCard
          label="Sales"
          value={String(stats.kpis.sales)}
          hint="Closed deals"
          icon={Handshake}
        />
        <KpiCard
          label="Revenue"
          value={formatMoney(stats.kpis.revenue, stats.kpis.currency)}
          hint="Estimated closed value"
          icon={CircleDollarSign}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TrendChart
            title="Sales trend"
            subtitle="Monthly closed-deal activity"
            data={stats.charts.salesTrend}
            empty={empty}
          />
        </div>
        <NotificationsPanel items={stats.notifications} />
      </div>

      <TrendChart
        title="Lead momentum"
        subtitle="Active lead volume across recent months"
        data={stats.charts.leadTrend}
        empty={empty}
      />
    </div>
  );
}
