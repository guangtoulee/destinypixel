export const salesCompanyId = "packom-china";

export type SalesRole = "owner" | "admin" | "manager" | "sales";
export type SalesUserStatus = "pending" | "active" | "suspended";
export type CustomerTier = "A" | "B" | "C";
export type CustomerStatus = "active" | "prospect" | "paused";
export type VisitStatus = "planned" | "in_progress" | "completed" | "cancelled";
export type OrderStatus = "pending" | "approved" | "fulfilled" | "cancelled";

export type SalesUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: SalesRole;
  status: SalesUserStatus;
  region: string;
  territory: string;
  jobTitle: string;
  monthlyTarget: number;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  id: string;
  code: string;
  name: string;
  shortName: string;
  channel: string;
  tier: CustomerTier;
  status: CustomerStatus;
  city: string;
  address: string;
  contact: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  assignedTo: string | null;
  assignedName: string | null;
  nextVisitAt: string | null;
  lastVisitAt: string | null;
  monthlySales: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type Visit = {
  id: string;
  customerId: string;
  customerName: string;
  salespersonId: string;
  salespersonName: string;
  scheduledAt: string;
  status: VisitStatus;
  purpose: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  checkInLatitude: number | null;
  checkInLongitude: number | null;
  notes: string;
  displayScore: number | null;
  stockStatus: string;
  nextAction: string;
  createdAt: string;
  updatedAt: string;
};

export type SalesProduct = {
  id: string;
  sku: string;
  nameZh: string;
  nameEn: string;
  specification: string;
  price: number;
  active: boolean;
  image: string;
  sortOrder: number;
};

export type OrderItem = {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type SalesOrder = {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  salespersonId: string;
  salespersonName: string;
  items: OrderItem[];
  amount: number;
  status: OrderStatus;
  notes: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CompanySettings = {
  companyName: string;
  companyNameEn: string;
  currency: "CNY";
  timezone: "Asia/Shanghai";
  visitRadiusMeters: number;
  requireVisitLocation: boolean;
  registrationEnabled: boolean;
  updatedAt: string;
};

export type DashboardMetric = {
  label: string;
  value: number;
  unit: "count" | "currency" | "percent";
  change?: number;
};

export type DashboardData = {
  scope: "company" | "personal";
  metrics: {
    todayVisits: number;
    completedVisits: number;
    monthOrders: number;
    monthRevenue: number;
    activeCustomers: number;
    activeSalespeople: number;
    pendingMembers: number;
    monthlyTarget: number;
  };
  nextVisits: Visit[];
  recentOrders: SalesOrder[];
  topSalespeople: Array<{
    id: string;
    name: string;
    revenue: number;
    visits: number;
    target: number;
  }>;
};

export type SessionPayload = {
  authenticated: boolean;
  user: SalesUser | null;
  capabilities: string[];
  company: {
    id: string;
    name: string;
    nameEn: string;
  };
};

export function canManageTeam(role: SalesRole) {
  return role === "owner" || role === "admin";
}

export function canViewCompany(role: SalesRole) {
  return role === "owner" || role === "admin" || role === "manager";
}

export function capabilitiesFor(user: SalesUser) {
  const base = ["profile:read"];

  if (user.status !== "active") return base;

  base.push(
    "customers:read",
    "customers:create",
    "visits:read",
    "visits:create",
    "orders:read",
    "orders:create",
  );

  if (canViewCompany(user.role)) {
    base.push("company:read", "team:read", "orders:review", "customers:assign");
  }

  if (canManageTeam(user.role)) {
    base.push("team:manage", "company:manage");
  }

  return base;
}
