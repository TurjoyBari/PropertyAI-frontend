export type ReportKpis = {
  revenue: number;
  sales: number;
  closedLeads: number;
  soldProperties: number;
  currency: string;
};

export type NamedCount = {
  source?: string;
  status?: string;
  count: number;
};

export type MonthValue = {
  month: string;
  value: number;
};

export type AgentPerformanceRow = {
  agentId: string;
  leads: number;
  closed: number;
  conversionRate: number;
};

export type ReportsSummary = {
  kpis: ReportKpis;
  charts: {
    salesByMonth: MonthValue[];
    leadSources: Array<{ source: string; count: number }>;
    leadStatuses: Array<{ status: string; count: number }>;
    visitsByStatus: Array<{ status: string; count: number }>;
  };
  agentPerformance: AgentPerformanceRow[];
  meta: {
    generatedAt: string;
    dataMode: "empty" | "live";
  };
};
