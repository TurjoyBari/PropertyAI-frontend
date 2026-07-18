export type DashboardKpis = {
  totalProperties: number;
  availableProperties: number;
  activeLeads: number;
  sales: number;
  revenue: number;
  currency: string;
};

export type DashboardTrendPoint = {
  month: string;
  value: number;
};

export type DashboardNotification = {
  id: string;
  title: string;
  body: string;
  type: "info" | "success" | "warning";
  createdAt: string;
};

export type DashboardStats = {
  kpis: DashboardKpis;
  charts: {
    salesTrend: DashboardTrendPoint[];
    leadTrend: DashboardTrendPoint[];
  };
  notifications: DashboardNotification[];
  meta: {
    generatedAt: string;
    dataMode: "empty" | "live";
  };
  viewer: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  timestamp: string;
};
