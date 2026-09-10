import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { assertBootstrapCode, salesConfig, SalesStorageError } from "./config";
import {
  deleteSession,
  findUserBySessionTokenHash,
  findUserRowByEmail,
  getCompanySettings,
  getUserRowById,
  hasOwner,
  insertSession,
  insertUser,
  toSalesUser,
  updateUser,
  updateUserPassword,
  writeAudit,
} from "./store";
import type { SalesRole, SalesUser } from "./types";

export class SalesAuthError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = "AUTH_ERROR") {
    super(message);
    this.name = "SalesAuthError";
    this.status = status;
    this.code = code;
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("base64url");
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function verifyPassword(password: string, salt: string, expectedHash: string) {
  const actual = Buffer.from(hashPassword(password, salt));
  const expected = Buffer.from(expectedHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function createSessionToken() {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() + salesConfig.sessionDays * 24 * 60 * 60 * 1000,
  ).toISOString();
  return { token, tokenHash: hashToken(token), expiresAt };
}

export async function registerSalesUser(input: {
  email: string;
  name: string;
  phone: string;
  password: string;
  region: string;
  adminCode?: string;
}) {
  const email = normalizeEmail(input.email);
  const existing = await findUserRowByEmail(email);
  if (existing) {
    throw new SalesAuthError("该邮箱已注册，请直接登录。", 409, "EMAIL_EXISTS");
  }

  let role: SalesRole = "sales";
  let status: "pending" | "active" = "pending";
  const ownerExists = await hasOwner();

  if (ownerExists && !input.adminCode) {
    const settings = await getCompanySettings();
    if (!settings.registrationEnabled) {
      throw new SalesAuthError(
        "公司当前已关闭新成员注册，请联系管理员。",
        403,
        "REGISTRATION_DISABLED",
      );
    }
  }

  if (input.adminCode) {
    if (ownerExists) {
      throw new SalesAuthError(
        "公司管理员已建立，请使用销售人员注册并等待审批。",
        409,
        "OWNER_EXISTS",
      );
    }
    if (!assertBootstrapCode(input.adminCode)) {
      throw new SalesAuthError("公司激活码不正确。", 403, "INVALID_BOOTSTRAP_CODE");
    }
    role = "owner";
    status = "active";
  }

  const salt = randomBytes(16).toString("base64url");
  const user = await insertUser({
    email,
    name: input.name.trim(),
    phone: input.phone.trim(),
    passwordSalt: salt,
    passwordHash: hashPassword(input.password, salt),
    role,
    status,
    region: input.region.trim(),
  });
  const session = createSessionToken();
  await insertSession({
    tokenHash: session.tokenHash,
    userId: user.id,
    expiresAt: session.expiresAt,
  });
  await writeAudit({
    actor: user,
    action: role === "owner" ? "company.owner_bootstrapped" : "member.registered",
    targetType: "user",
    targetId: user.id,
  });

  return { user, token: session.token, expiresAt: session.expiresAt };
}

export async function loginSalesUser(input: { email: string; password: string }) {
  const row = await findUserRowByEmail(normalizeEmail(input.email));

  if (!row || !verifyPassword(input.password, row.password_salt, row.password_hash)) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    throw new SalesAuthError("邮箱或密码不正确。", 401, "INVALID_CREDENTIALS");
  }

  const user = toSalesUser(row);
  if (user.status === "suspended") {
    throw new SalesAuthError("该账户已停用，请联系公司管理员。", 403, "ACCOUNT_SUSPENDED");
  }

  const session = createSessionToken();
  await insertSession({
    tokenHash: session.tokenHash,
    userId: user.id,
    expiresAt: session.expiresAt,
  });
  const updated =
    (await updateUser(user.id, { lastLoginAt: new Date().toISOString() })) ?? user;

  return { user: updated, token: session.token, expiresAt: session.expiresAt };
}

function readCookie(request: Request, name: string) {
  const cookie = request.headers.get("cookie") ?? "";
  for (const part of cookie.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return "";
}

export async function getSessionUser(request: Request) {
  const token = readCookie(request, salesConfig.sessionCookie);
  if (!token) return null;
  return findUserBySessionTokenHash(hashToken(token));
}

export async function requireSessionUser(
  request: Request,
  options: { active?: boolean; roles?: SalesRole[] } = {},
) {
  const user = await getSessionUser(request);
  if (!user) {
    throw new SalesAuthError("请先登录。", 401, "AUTH_REQUIRED");
  }
  if (options.active !== false && user.status !== "active") {
    throw new SalesAuthError("账户正在等待公司审核。", 403, "ACCOUNT_PENDING");
  }
  if (options.roles && !options.roles.includes(user.role)) {
    throw new SalesAuthError("没有执行此操作的权限。", 403, "FORBIDDEN");
  }
  return user;
}

export async function logoutSalesUser(request: Request) {
  const token = readCookie(request, salesConfig.sessionCookie);
  if (!token) return;
  await deleteSession(hashToken(token));
}

export async function changeSalesPassword(
  actor: SalesUser,
  input: { currentPassword: string; newPassword: string },
) {
  const row = await getUserRowById(actor.id);
  if (!row || !verifyPassword(input.currentPassword, row.password_salt, row.password_hash)) {
    throw new SalesAuthError("当前密码不正确。", 401, "CURRENT_PASSWORD_INVALID");
  }
  const salt = randomBytes(16).toString("base64url");
  await updateUserPassword(actor.id, salt, hashPassword(input.newPassword, salt));
  await writeAudit({
    actor,
    action: "member.password_changed",
    targetType: "user",
    targetId: actor.id,
  });
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const expectedHost =
    request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  try {
    if (new URL(origin).host !== expectedHost) {
      throw new SalesAuthError("请求来源无效。", 403, "INVALID_ORIGIN");
    }
  } catch (error) {
    if (error instanceof SalesAuthError) throw error;
    throw new SalesAuthError("请求来源无效。", 403, "INVALID_ORIGIN");
  }
}

export function salesCookieOptions() {
  return {
    httpOnly: true,
    maxAge: salesConfig.sessionDays * 24 * 60 * 60,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function apiError(error: unknown) {
  if (error instanceof SalesAuthError || error instanceof SalesStorageError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }

  console.error("PACKOM Sales API error", error);
  return Response.json(
    { error: "系统暂时无法完成此操作，请稍后重试。", code: "INTERNAL_ERROR" },
    { status: 500 },
  );
}
