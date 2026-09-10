import { randomUUID } from "node:crypto";
import { getSalesStorageConfig, SalesStorageError, salesConfig } from "./config";
import type {
  CompanySettings,
  Customer,
  OrderItem,
  SalesOrder,
  SalesProduct,
  SalesRole,
  SalesUser,
  SalesUserStatus,
  Visit,
} from "./types";
import { canViewCompany } from "./types";

type RequestMethod = "GET" | "POST" | "PATCH" | "DELETE";

type UserRow = {
  id: string;
  company_id: string;
  email: string;
  email_normalized: string;
  name: string;
  phone: string;
  password_salt: string;
  password_hash: string;
  role: SalesRole;
  status: SalesUserStatus;
  region: string;
  territory: string;
  job_title: string;
  monthly_target: number | string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

type SessionRow = {
  token_hash: string;
  user_id: string;
  expires_at: string;
  created_at: string;
  last_seen_at: string;
};

type CustomerRow = {
  id: string;
  company_id: string;
  code: string;
  name: string;
  short_name: string;
  channel: string;
  tier: "A" | "B" | "C";
  status: "active" | "prospect" | "paused";
  city: string;
  address: string;
  contact: string;
  phone: string;
  latitude: number | string | null;
  longitude: number | string | null;
  assigned_to: string | null;
  next_visit_at: string | null;
  last_visit_at: string | null;
  monthly_sales: number | string;
  notes: string;
  created_at: string;
  updated_at: string;
  xs_users?: { name?: string } | Array<{ name?: string }> | null;
};

type VisitRow = {
  id: string;
  company_id: string;
  customer_id: string;
  salesperson_id: string;
  scheduled_at: string;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  purpose: string;
  check_in_at: string | null;
  check_out_at: string | null;
  check_in_latitude: number | string | null;
  check_in_longitude: number | string | null;
  notes: string;
  display_score: number | null;
  stock_status: string;
  next_action: string;
  created_at: string;
  updated_at: string;
  xs_customers?: { name?: string } | Array<{ name?: string }> | null;
  xs_users?: { name?: string } | Array<{ name?: string }> | null;
};

type ProductRow = {
  id: string;
  company_id: string;
  sku: string;
  name_zh: string;
  name_en: string;
  specification: string;
  price: number | string;
  active: boolean;
  image: string;
  sort_order: number;
};

type OrderRow = {
  id: string;
  company_id: string;
  order_no: string;
  customer_id: string;
  salesperson_id: string;
  items: OrderItem[] | string;
  amount: number | string;
  status: "pending" | "approved" | "fulfilled" | "cancelled";
  notes: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  xs_customers?: { name?: string } | Array<{ name?: string }> | null;
  xs_users?: { name?: string } | Array<{ name?: string }> | null;
};

type SettingsRow = {
  company_id: string;
  settings: Partial<CompanySettings> | string;
  updated_at: string;
};

function filterValue(value: string) {
  return encodeURIComponent(value);
}

async function supabaseRequest<T>(
  table: string,
  {
    method = "GET",
    query = "",
    body,
    prefer,
  }: {
    method?: RequestMethod;
    query?: string;
    body?: unknown;
    prefer?: string;
  } = {},
): Promise<T> {
  const config = getSalesStorageConfig();

  if (!config) {
    throw new SalesStorageError(
      "销售系统云数据库尚未配置，请联系公司管理员。",
      503,
      "STORAGE_NOT_CONFIGURED",
    );
  }

  const response = await fetch(`${config.url}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Profile": "public",
      "Content-Profile": "public",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    const schemaMissing = response.status === 404 || response.status === 406;
    throw new SalesStorageError(
      schemaMissing
        ? "销售系统数据库结构尚未初始化，请联系公司管理员。"
        : "销售系统数据服务暂时不可用，请稍后再试。",
      schemaMissing ? 503 : response.status,
      schemaMissing ? "SCHEMA_REQUIRED" : "STORAGE_REQUEST_FAILED",
    );
  }

  if (!text) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new SalesStorageError("数据服务返回了无法识别的内容。", 502, "INVALID_STORAGE_RESPONSE");
  }
}

function relationName(
  relation: { name?: string } | Array<{ name?: string }> | null | undefined,
) {
  if (Array.isArray(relation)) return relation[0]?.name ?? null;
  return relation?.name ?? null;
}

function numberValue(value: number | string | null | undefined) {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function toSalesUser(row: UserRow): SalesUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    role: row.role,
    status: row.status,
    region: row.region,
    territory: row.territory,
    jobTitle: row.job_title,
    monthlyTarget: numberValue(row.monthly_target),
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    shortName: row.short_name,
    channel: row.channel,
    tier: row.tier,
    status: row.status,
    city: row.city,
    address: row.address,
    contact: row.contact,
    phone: row.phone,
    latitude: row.latitude === null ? null : numberValue(row.latitude),
    longitude: row.longitude === null ? null : numberValue(row.longitude),
    assignedTo: row.assigned_to,
    assignedName: relationName(row.xs_users),
    nextVisitAt: row.next_visit_at,
    lastVisitAt: row.last_visit_at,
    monthlySales: numberValue(row.monthly_sales),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toVisit(row: VisitRow): Visit {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: relationName(row.xs_customers) ?? "",
    salespersonId: row.salesperson_id,
    salespersonName: relationName(row.xs_users) ?? "",
    scheduledAt: row.scheduled_at,
    status: row.status,
    purpose: row.purpose,
    checkInAt: row.check_in_at,
    checkOutAt: row.check_out_at,
    checkInLatitude:
      row.check_in_latitude === null ? null : numberValue(row.check_in_latitude),
    checkInLongitude:
      row.check_in_longitude === null ? null : numberValue(row.check_in_longitude),
    notes: row.notes,
    displayScore: row.display_score,
    stockStatus: row.stock_status,
    nextAction: row.next_action,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toProduct(row: ProductRow): SalesProduct {
  return {
    id: row.id,
    sku: row.sku,
    nameZh: row.name_zh,
    nameEn: row.name_en,
    specification: row.specification,
    price: numberValue(row.price),
    active: row.active,
    image: row.image,
    sortOrder: row.sort_order,
  };
}

function toOrder(row: OrderRow): SalesOrder {
  const items =
    typeof row.items === "string" ? (JSON.parse(row.items) as OrderItem[]) : row.items;

  return {
    id: row.id,
    orderNo: row.order_no,
    customerId: row.customer_id,
    customerName: relationName(row.xs_customers) ?? "",
    salespersonId: row.salesperson_id,
    salespersonName: relationName(row.xs_users) ?? "",
    items: Array.isArray(items) ? items : [],
    amount: numberValue(row.amount),
    status: row.status,
    notes: row.notes,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function storageHealth() {
  const config = getSalesStorageConfig();
  if (!config) return { ok: false, state: "not_configured" as const };

  try {
    const rows = await supabaseRequest<Array<{ id: string }>>("xs_users", {
      query: "?select=id&limit=1",
    });
    return { ok: true, state: "ready" as const, records: rows.length };
  } catch (error) {
    return {
      ok: false,
      state:
        error instanceof SalesStorageError && error.code === "SCHEMA_REQUIRED"
          ? ("schema_required" as const)
          : ("unavailable" as const),
    };
  }
}

export async function findUserRowByEmail(email: string) {
  const rows = await supabaseRequest<UserRow[]>("xs_users", {
    query: `?company_id=eq.${filterValue(salesConfig.companyId)}&email_normalized=eq.${filterValue(email.trim().toLowerCase())}&limit=1`,
  });
  return rows[0] ?? null;
}

export async function getUserRowById(id: string) {
  const rows = await supabaseRequest<UserRow[]>("xs_users", {
    query: `?company_id=eq.${filterValue(salesConfig.companyId)}&id=eq.${filterValue(id)}&limit=1`,
  });
  return rows[0] ?? null;
}

export async function listUsers() {
  const rows = await supabaseRequest<UserRow[]>("xs_users", {
    query: `?company_id=eq.${filterValue(salesConfig.companyId)}&order=created_at.desc&limit=500`,
  });
  return rows.map(toSalesUser);
}

export async function hasOwner() {
  const rows = await supabaseRequest<Array<{ id: string }>>("xs_users", {
    query: `?company_id=eq.${filterValue(salesConfig.companyId)}&role=eq.owner&limit=1&select=id`,
  });
  return rows.length > 0;
}

export async function insertUser(input: {
  email: string;
  name: string;
  phone: string;
  passwordSalt: string;
  passwordHash: string;
  role: SalesRole;
  status: SalesUserStatus;
  region: string;
}) {
  const now = new Date().toISOString();
  const rows = await supabaseRequest<UserRow[]>("xs_users", {
    method: "POST",
    prefer: "return=representation",
    body: {
      id: randomUUID(),
      company_id: salesConfig.companyId,
      email: input.email,
      email_normalized: input.email.trim().toLowerCase(),
      name: input.name,
      phone: input.phone,
      password_salt: input.passwordSalt,
      password_hash: input.passwordHash,
      role: input.role,
      status: input.status,
      region: input.region,
      territory: input.region,
      job_title: input.role === "owner" ? "公司负责人" : "销售代表",
      monthly_target: 0,
      created_at: now,
      updated_at: now,
    },
  });
  return toSalesUser(rows[0]);
}

export async function updateUser(
  id: string,
  updates: Partial<{
    role: SalesRole;
    status: SalesUserStatus;
    region: string;
    territory: string;
    jobTitle: string;
    monthlyTarget: number;
    lastLoginAt: string;
    name: string;
    phone: string;
  }>,
) {
  const body: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.role !== undefined) body.role = updates.role;
  if (updates.status !== undefined) body.status = updates.status;
  if (updates.region !== undefined) body.region = updates.region;
  if (updates.territory !== undefined) body.territory = updates.territory;
  if (updates.jobTitle !== undefined) body.job_title = updates.jobTitle;
  if (updates.monthlyTarget !== undefined) body.monthly_target = updates.monthlyTarget;
  if (updates.lastLoginAt !== undefined) body.last_login_at = updates.lastLoginAt;
  if (updates.name !== undefined) body.name = updates.name;
  if (updates.phone !== undefined) body.phone = updates.phone;

  const rows = await supabaseRequest<UserRow[]>("xs_users", {
    method: "PATCH",
    query: `?company_id=eq.${filterValue(salesConfig.companyId)}&id=eq.${filterValue(id)}`,
    body,
    prefer: "return=representation",
  });
  return rows[0] ? toSalesUser(rows[0]) : null;
}

export async function updateUserPassword(
  id: string,
  passwordSalt: string,
  passwordHash: string,
) {
  const rows = await supabaseRequest<UserRow[]>("xs_users", {
    method: "PATCH",
    query: `?company_id=eq.${filterValue(salesConfig.companyId)}&id=eq.${filterValue(id)}`,
    body: {
      password_salt: passwordSalt,
      password_hash: passwordHash,
      updated_at: new Date().toISOString(),
    },
    prefer: "return=representation",
  });
  return rows[0] ? toSalesUser(rows[0]) : null;
}

export async function insertSession(input: {
  tokenHash: string;
  userId: string;
  expiresAt: string;
}) {
  const now = new Date().toISOString();
  await supabaseRequest<SessionRow[]>("xs_sessions", {
    method: "POST",
    prefer: "return=minimal",
    body: {
      token_hash: input.tokenHash,
      user_id: input.userId,
      expires_at: input.expiresAt,
      created_at: now,
      last_seen_at: now,
    },
  });
}

export async function findUserBySessionTokenHash(tokenHash: string) {
  const rows = await supabaseRequest<
    Array<SessionRow & { xs_users?: UserRow | UserRow[] | null }>
  >("xs_sessions", {
    query: `?token_hash=eq.${filterValue(tokenHash)}&expires_at=gt.${filterValue(new Date().toISOString())}&select=*,xs_users(*)&limit=1`,
  });
  const relation = rows[0]?.xs_users;
  const userRow = Array.isArray(relation) ? relation[0] : relation;
  return userRow ? toSalesUser(userRow) : null;
}

export async function deleteSession(tokenHash: string) {
  await supabaseRequest<void>("xs_sessions", {
    method: "DELETE",
    query: `?token_hash=eq.${filterValue(tokenHash)}`,
    prefer: "return=minimal",
  });
}

export async function listCustomersFor(user: SalesUser) {
  const ownership = canViewCompany(user.role)
    ? ""
    : `&assigned_to=eq.${filterValue(user.id)}`;
  const rows = await supabaseRequest<CustomerRow[]>("xs_customers", {
    query: `?company_id=eq.${filterValue(salesConfig.companyId)}${ownership}&select=*,xs_users(name)&order=updated_at.desc&limit=1000`,
  });
  return rows.map(toCustomer);
}

export async function getCustomerFor(user: SalesUser, id: string) {
  const rows = await supabaseRequest<CustomerRow[]>("xs_customers", {
    query: `?company_id=eq.${filterValue(salesConfig.companyId)}&id=eq.${filterValue(id)}&select=*,xs_users(name)&limit=1`,
  });
  const customer = rows[0] ? toCustomer(rows[0]) : null;
  if (!customer) return null;
  if (!canViewCompany(user.role) && customer.assignedTo !== user.id) return null;
  return customer;
}

export async function insertCustomer(
  actor: SalesUser,
  input: {
    name: string;
    shortName: string;
    channel: string;
    tier: "A" | "B" | "C";
    status: "active" | "prospect" | "paused";
    city: string;
    address: string;
    contact: string;
    phone: string;
    latitude?: number | null;
    longitude?: number | null;
    assignedTo?: string | null;
    nextVisitAt?: string | null;
    notes?: string;
  },
) {
  const now = new Date().toISOString();
  const id = randomUUID();
  const code = `CUS-${now.slice(2, 10).replaceAll("-", "")}-${id.slice(0, 5).toUpperCase()}`;
  const assignedTo = canViewCompany(actor.role)
    ? input.assignedTo ?? null
    : actor.id;
  const rows = await supabaseRequest<CustomerRow[]>("xs_customers", {
    method: "POST",
    prefer: "return=representation",
    body: {
      id,
      company_id: salesConfig.companyId,
      code,
      name: input.name,
      short_name: input.shortName,
      channel: input.channel,
      tier: input.tier,
      status: input.status,
      city: input.city,
      address: input.address,
      contact: input.contact,
      phone: input.phone,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      assigned_to: assignedTo,
      next_visit_at: input.nextVisitAt ?? null,
      last_visit_at: null,
      monthly_sales: 0,
      notes: input.notes ?? "",
      created_at: now,
      updated_at: now,
    },
  });
  return toCustomer(rows[0]);
}

export async function patchCustomer(
  actor: SalesUser,
  current: Customer,
  updates: Partial<{
    name: string;
    shortName: string;
    channel: string;
    tier: "A" | "B" | "C";
    status: "active" | "prospect" | "paused";
    city: string;
    address: string;
    contact: string;
    phone: string;
    latitude: number | null;
    longitude: number | null;
    assignedTo: string | null;
    nextVisitAt: string | null;
    notes: string;
    lastVisitAt: string | null;
    monthlySales: number;
  }>,
) {
  const body: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const mapping: Record<string, string> = {
    name: "name",
    shortName: "short_name",
    channel: "channel",
    tier: "tier",
    status: "status",
    city: "city",
    address: "address",
    contact: "contact",
    phone: "phone",
    latitude: "latitude",
    longitude: "longitude",
    nextVisitAt: "next_visit_at",
    notes: "notes",
    lastVisitAt: "last_visit_at",
    monthlySales: "monthly_sales",
  };
  for (const [key, column] of Object.entries(mapping)) {
    if (key in updates) body[column] = updates[key as keyof typeof updates];
  }
  if (canViewCompany(actor.role) && "assignedTo" in updates) {
    body.assigned_to = updates.assignedTo ?? null;
  }

  const rows = await supabaseRequest<CustomerRow[]>("xs_customers", {
    method: "PATCH",
    query: `?company_id=eq.${filterValue(salesConfig.companyId)}&id=eq.${filterValue(current.id)}&select=*,xs_users(name)`,
    body,
    prefer: "return=representation",
  });
  return rows[0] ? toCustomer(rows[0]) : null;
}

export async function listVisitsFor(user: SalesUser) {
  const ownership = canViewCompany(user.role)
    ? ""
    : `&salesperson_id=eq.${filterValue(user.id)}`;
  const rows = await supabaseRequest<VisitRow[]>("xs_visits", {
    query: `?company_id=eq.${filterValue(salesConfig.companyId)}${ownership}&select=*,xs_customers(name),xs_users(name)&order=scheduled_at.desc&limit=1000`,
  });
  return rows.map(toVisit);
}

export async function getVisitFor(user: SalesUser, id: string) {
  const rows = await supabaseRequest<VisitRow[]>("xs_visits", {
    query: `?company_id=eq.${filterValue(salesConfig.companyId)}&id=eq.${filterValue(id)}&select=*,xs_customers(name),xs_users(name)&limit=1`,
  });
  const visit = rows[0] ? toVisit(rows[0]) : null;
  if (!visit) return null;
  if (!canViewCompany(user.role) && visit.salespersonId !== user.id) return null;
  return visit;
}

export async function insertVisit(
  actor: SalesUser,
  input: {
    customerId: string;
    salespersonId?: string;
    scheduledAt: string;
    purpose: string;
  },
) {
  const now = new Date().toISOString();
  const salespersonId = canViewCompany(actor.role)
    ? input.salespersonId || actor.id
    : actor.id;
  const rows = await supabaseRequest<VisitRow[]>("xs_visits", {
    method: "POST",
    prefer: "return=representation",
    body: {
      id: randomUUID(),
      company_id: salesConfig.companyId,
      customer_id: input.customerId,
      salesperson_id: salespersonId,
      scheduled_at: input.scheduledAt,
      status: "planned",
      purpose: input.purpose,
      notes: "",
      stock_status: "",
      next_action: "",
      created_at: now,
      updated_at: now,
    },
  });
  return toVisit(rows[0]);
}

export async function patchVisit(
  visit: Visit,
  updates: Partial<{
    scheduledAt: string;
    status: "planned" | "in_progress" | "completed" | "cancelled";
    purpose: string;
    checkInAt: string | null;
    checkOutAt: string | null;
    checkInLatitude: number | null;
    checkInLongitude: number | null;
    notes: string;
    displayScore: number | null;
    stockStatus: string;
    nextAction: string;
  }>,
) {
  const body: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const mapping: Record<string, string> = {
    scheduledAt: "scheduled_at",
    status: "status",
    purpose: "purpose",
    checkInAt: "check_in_at",
    checkOutAt: "check_out_at",
    checkInLatitude: "check_in_latitude",
    checkInLongitude: "check_in_longitude",
    notes: "notes",
    displayScore: "display_score",
    stockStatus: "stock_status",
    nextAction: "next_action",
  };
  for (const [key, column] of Object.entries(mapping)) {
    if (key in updates) body[column] = updates[key as keyof typeof updates];
  }

  const rows = await supabaseRequest<VisitRow[]>("xs_visits", {
    method: "PATCH",
    query: `?company_id=eq.${filterValue(salesConfig.companyId)}&id=eq.${filterValue(visit.id)}&select=*,xs_customers(name),xs_users(name)`,
    body,
    prefer: "return=representation",
  });
  return rows[0] ? toVisit(rows[0]) : null;
}

export async function listProducts() {
  const rows = await supabaseRequest<ProductRow[]>("xs_products", {
    query: `?company_id=eq.${filterValue(salesConfig.companyId)}&active=eq.true&order=sort_order.asc`,
  });
  return rows.map(toProduct);
}

export async function listOrdersFor(user: SalesUser) {
  const ownership = canViewCompany(user.role)
    ? ""
    : `&salesperson_id=eq.${filterValue(user.id)}`;
  const rows = await supabaseRequest<OrderRow[]>("xs_orders", {
    query: `?company_id=eq.${filterValue(salesConfig.companyId)}${ownership}&select=*,xs_customers(name),xs_users!xs_orders_salesperson_id_fkey(name)&order=created_at.desc&limit=1000`,
  });
  return rows.map(toOrder);
}

export async function getOrderFor(user: SalesUser, id: string) {
  const rows = await supabaseRequest<OrderRow[]>("xs_orders", {
    query: `?company_id=eq.${filterValue(salesConfig.companyId)}&id=eq.${filterValue(id)}&select=*,xs_customers(name),xs_users!xs_orders_salesperson_id_fkey(name)&limit=1`,
  });
  const order = rows[0] ? toOrder(rows[0]) : null;
  if (!order) return null;
  if (!canViewCompany(user.role) && order.salespersonId !== user.id) return null;
  return order;
}

export async function insertOrder(
  actor: SalesUser,
  input: { customerId: string; items: OrderItem[]; notes: string },
) {
  const now = new Date();
  const id = randomUUID();
  const stamp = now.toISOString().replace(/[-:TZ.]/g, "").slice(2, 14);
  const orderNo = `SO${stamp}${id.slice(0, 4).toUpperCase()}`;
  const amount = input.items.reduce((sum, item) => sum + item.subtotal, 0);
  const rows = await supabaseRequest<OrderRow[]>("xs_orders", {
    method: "POST",
    prefer: "return=representation",
    body: {
      id,
      company_id: salesConfig.companyId,
      order_no: orderNo,
      customer_id: input.customerId,
      salesperson_id: actor.id,
      items: input.items,
      amount,
      status: "pending",
      notes: input.notes,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
  });
  return toOrder(rows[0]);
}

export async function patchOrder(
  order: SalesOrder,
  updates: Partial<{
    status: "pending" | "approved" | "fulfilled" | "cancelled";
    notes: string;
    reviewedBy: string | null;
    reviewedAt: string | null;
  }>,
) {
  const body: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.status !== undefined) body.status = updates.status;
  if (updates.notes !== undefined) body.notes = updates.notes;
  if (updates.reviewedBy !== undefined) body.reviewed_by = updates.reviewedBy;
  if (updates.reviewedAt !== undefined) body.reviewed_at = updates.reviewedAt;
  const rows = await supabaseRequest<OrderRow[]>("xs_orders", {
    method: "PATCH",
    query: `?company_id=eq.${filterValue(salesConfig.companyId)}&id=eq.${filterValue(order.id)}&select=*,xs_customers(name),xs_users!xs_orders_salesperson_id_fkey(name)`,
    body,
    prefer: "return=representation",
  });
  return rows[0] ? toOrder(rows[0]) : null;
}

const defaultSettings: CompanySettings = {
  companyName: salesConfig.companyName,
  companyNameEn: salesConfig.companyNameEn,
  currency: "CNY",
  timezone: "Asia/Shanghai",
  visitRadiusMeters: 500,
  requireVisitLocation: true,
  registrationEnabled: true,
  updatedAt: new Date(0).toISOString(),
};

export async function getCompanySettings() {
  const rows = await supabaseRequest<SettingsRow[]>("xs_company_settings", {
    query: `?company_id=eq.${filterValue(salesConfig.companyId)}&limit=1`,
  });
  const raw = rows[0]?.settings;
  const settings = typeof raw === "string" ? JSON.parse(raw) : raw;
  return {
    ...defaultSettings,
    ...(settings && typeof settings === "object" ? settings : {}),
    updatedAt: rows[0]?.updated_at ?? defaultSettings.updatedAt,
  } as CompanySettings;
}

export async function updateCompanySettings(input: Partial<CompanySettings>) {
  const current = await getCompanySettings();
  const now = new Date().toISOString();
  const settings: CompanySettings = { ...current, ...input, updatedAt: now };
  const rows = await supabaseRequest<SettingsRow[]>("xs_company_settings", {
    method: "POST",
    query: "?on_conflict=company_id",
    prefer: "resolution=merge-duplicates,return=representation",
    body: {
      company_id: salesConfig.companyId,
      settings,
      updated_at: now,
    },
  });
  const raw = rows[0]?.settings;
  return (typeof raw === "string" ? JSON.parse(raw) : raw) as CompanySettings;
}

export async function writeAudit(input: {
  actor: SalesUser;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  await supabaseRequest<void>("xs_audit_logs", {
    method: "POST",
    prefer: "return=minimal",
    body: {
      id: randomUUID(),
      company_id: salesConfig.companyId,
      actor_id: input.actor.id,
      action: input.action,
      target_type: input.targetType,
      target_id: input.targetId,
      metadata: input.metadata ?? {},
      created_at: new Date().toISOString(),
    },
  });
}
