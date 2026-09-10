import type {
  CompanySettings,
  Customer,
  DashboardData,
  SalesOrder,
  SalesProduct,
  SalesUser,
  SessionPayload,
  Visit,
} from "@/lib/xiaoshou/types";

export type SalesLanguage = "zh" | "en";
export type AppView = "dashboard" | "customers" | "visits" | "orders" | "team" | "profile";

export type TeamMember = SalesUser & {
  visits: number;
  completedVisits: number;
  orders: number;
  revenue: number;
};

export type HealthPayload = {
  ok: boolean;
  service: string;
  storage: "ready" | "not_configured" | "schema_required" | "unavailable";
  version: string;
};

export type ResourceMap = {
  session: SessionPayload;
  dashboard: { dashboard: DashboardData };
  customers: { customers: Customer[] };
  visits: { visits: Visit[] };
  orders: { orders: SalesOrder[] };
  products: { products: SalesProduct[] };
  team: { members: TeamMember[] };
  company: { settings: CompanySettings };
};

export class SalesApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code = "API_ERROR") {
    super(message);
    this.name = "SalesApiError";
    this.status = status;
    this.code = code;
  }
}

export async function salesApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/xiaoshou${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    credentials: "same-origin",
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
  } & T;

  if (!response.ok) {
    throw new SalesApiError(
      payload.error || "请求未能完成，请稍后重试。",
      response.status,
      payload.code,
    );
  }

  return payload;
}

export function tx(language: SalesLanguage, zh: string, en: string) {
  return language === "zh" ? zh : en;
}

export function formatMoney(value: number, language: SalesLanguage) {
  return new Intl.NumberFormat(language === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(
  value: string | null,
  language: SalesLanguage,
  options: Intl.DateTimeFormatOptions = {},
) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-US", {
    timeZone: "Asia/Shanghai",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(date);
}

export function initials(name: string) {
  const clean = name.trim();
  if (!clean) return "P";
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length > 1) return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
  return clean.slice(0, 2).toUpperCase();
}

export function roleLabel(role: SalesUser["role"], language: SalesLanguage) {
  const labels = {
    owner: ["公司负责人", "Owner"],
    admin: ["管理员", "Administrator"],
    manager: ["销售经理", "Sales manager"],
    sales: ["销售代表", "Sales representative"],
  } as const;
  return labels[role][language === "zh" ? 0 : 1];
}

export function statusLabel(status: string, language: SalesLanguage) {
  const labels: Record<string, [string, string]> = {
    pending: ["待审核", "Pending"],
    active: ["已启用", "Active"],
    suspended: ["已停用", "Suspended"],
    prospect: ["潜在客户", "Prospect"],
    paused: ["已暂停", "Paused"],
    planned: ["已计划", "Planned"],
    in_progress: ["进行中", "In progress"],
    completed: ["已完成", "Completed"],
    cancelled: ["已取消", "Cancelled"],
    approved: ["已审核", "Approved"],
    fulfilled: ["已发货", "Fulfilled"],
  };
  return labels[status]?.[language === "zh" ? 0 : 1] ?? status;
}
