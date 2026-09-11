import { createHmac } from "node:crypto";

export class MemberAuthError extends Error {
  constructor(public code: string, message: string, public status = 400, public retryAfter?: number) {
    super(message);
    this.name = "MemberAuthError";
  }
}

export function getMemberDatabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !/^[\x21-\x7E]+$/.test(key)) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && process.env.NODE_ENV !== "production" && !process.env.VERCEL)) return null;
    return { url: parsed.origin, key };
  } catch {
    return null;
  }
}

export function isLocalMemberStoreEnabled() {
  return process.env.NODE_ENV !== "production" && !process.env.VERCEL && process.env.DESTINY_MEMBER_LOCAL_STORE_ENABLED === "true";
}

export function assertMemberStoreAvailable() {
  if (!getMemberDatabaseConfig() && !isLocalMemberStoreEnabled()) {
    throw new MemberAuthError("AUTH_STORE_UNAVAILABLE", "账户服务暂未配置，请稍后再试。", 503);
  }
}

/** Credentials and database response bodies never leave this server-side adapter. */
export async function memberAuthDatabaseRequest<T>(resource: string, init: RequestInit = {}): Promise<T> {
  const config = getMemberDatabaseConfig();
  if (!config) throw new MemberAuthError("AUTH_STORE_UNAVAILABLE", "账户服务暂未配置，请稍后再试。", 503);
  try {
    const response = await fetch(`${config.url}/rest/v1/${resource}`, {
      ...init,
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...init.headers,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      if (response.status === 409) throw new MemberAuthError("ACCOUNT_CONFLICT", "操作未完成，请刷新后重试。", 409);
      throw new MemberAuthError("AUTH_STORE_UNAVAILABLE", "账户服务暂时不可用，请稍后再试。", 503);
    }
    return response.status === 204 ? undefined as T : await response.json() as T;
  } catch (error) {
    if (error instanceof MemberAuthError) throw error;
    throw new MemberAuthError("AUTH_STORE_UNAVAILABLE", "账户服务暂时不可用，请稍后再试。", 503);
  }
}

export function normalizeMemberEmail(value: unknown) {
  if (typeof value !== "string" || value.length > 254) throw new MemberAuthError("INVALID_EMAIL", "请输入有效邮箱。");
  const email = value.trim().toLowerCase();
  const parts = email.split("@");
  const local = parts[0];
  const domain = parts[1];
  if (parts.length !== 2 || !local || local.length > 64 || local.startsWith(".") || local.endsWith(".") || local.includes("..") ||
      !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local) || !domain || domain.length > 253 ||
      !domain.includes(".") || domain.split(".").some((part) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(part))) {
    throw new MemberAuthError("INVALID_EMAIL", "请输入有效邮箱。");
  }
  return email;
}

export function validateMemberPassword(value: unknown, requireNewStrength = false): string {
  if (typeof value !== "string" || !value.length) throw new MemberAuthError("PASSWORD_REQUIRED", "请输入密码。");
  if (value.length > 128) throw new MemberAuthError("PASSWORD_TOO_LONG", "密码不能超过 128 位。");
  if (requireNewStrength && value.length < 8) throw new MemberAuthError("PASSWORD_TOO_SHORT", "密码至少需要 8 位。");
  return value;
}

export function validateMemberName(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" || value.length > 100 || /[\x00-\x1f\x7f]/.test(value)) throw new MemberAuthError("INVALID_NAME", "姓名不能超过 100 位，且不能包含控制字符。");
  return value.trim() || undefined;
}

export function assertSameOriginMemberMutation(request: Request) {
  const origin = request.headers.get("origin");
  if (request.headers.get("sec-fetch-site") === "cross-site" || !origin) {
    throw new MemberAuthError("INVALID_ORIGIN", "请从本站页面重试此操作。", 403);
  }
  try {
    if (new URL(origin).origin !== new URL(request.url).origin) throw new Error();
  } catch {
    throw new MemberAuthError("INVALID_ORIGIN", "请从本站页面重试此操作。", 403);
  }
}

export async function readMemberAuthBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new MemberAuthError("INVALID_REQUEST", "请求格式无效。", 415);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new MemberAuthError("INVALID_REQUEST", "请求格式无效。");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    size += next.value.byteLength;
    if (size > 8192) {
      await reader.cancel();
      throw new MemberAuthError("REQUEST_TOO_LARGE", "请求内容过长。", 413);
    }
    chunks.push(next.value);
  }
  try {
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body;
  } catch {
    throw new MemberAuthError("INVALID_REQUEST", "请求格式无效。");
  }
}

type AuthAction = "login" | "register" | "request_reset" | "reset";
const localRateBuckets = new Map<string, { count: number; expires: number }>();

async function consumeRateBucket(key: string, limit: number, windowSeconds: number) {
  if (getMemberDatabaseConfig()) {
    const rows = await memberAuthDatabaseRequest<Array<{ allowed: boolean; retry_after: number }>>("rpc/destiny_auth_consume_rate_limit", {
      method: "POST", body: JSON.stringify({ p_key: key, p_limit: limit, p_window_seconds: windowSeconds }),
    });
    if (!rows[0]) throw new MemberAuthError("AUTH_STORE_UNAVAILABLE", "账户服务暂时不可用，请稍后再试。", 503);
    if (!rows[0].allowed) throw new MemberAuthError("RATE_LIMITED", "尝试次数过多，请稍后再试。", 429, rows[0].retry_after);
    return;
  }
  assertMemberStoreAvailable();
  const now = Date.now();
  if (localRateBuckets.size > 2000) for (const [bucketKey, bucket] of localRateBuckets) if (bucket.expires <= now) localRateBuckets.delete(bucketKey);
  const previous = localRateBuckets.get(key);
  const bucket = previous && previous.expires > now ? previous : { count: 0, expires: now + windowSeconds * 1000 };
  bucket.count++;
  localRateBuckets.set(key, bucket);
  if (bucket.count > limit) throw new MemberAuthError("RATE_LIMITED", "尝试次数过多，请稍后再试。", 429, Math.ceil((bucket.expires - now) / 1000));
}

export async function enforceMemberAuthRateLimit(request: Request, action: AuthAction, email?: string) {
  assertMemberStoreAvailable();
  const config = getMemberDatabaseConfig();
  const salt = process.env.DESTINY_AUTH_RATE_LIMIT_SECRET || config?.key || "explicit-local-development";
  const hash = (value: string) => createHmac("sha256", salt).update(value).digest("hex");
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim().slice(0, 100) || request.headers.get("x-real-ip")?.slice(0, 100) || "unknown";
  const resetRequest = action === "request_reset";
  await consumeRateBucket(hash(`${action}:ip:${ip}`), action === "login" ? 30 : 10, resetRequest ? 3600 : 900);
  if (email) await consumeRateBucket(hash(`${action}:email:${email}`), resetRequest ? 3 : 10, resetRequest ? 3600 : 900);
}

export function memberAuthJson(data: unknown, status = 200, extraHeaders?: Record<string, string>) {
  return Response.json(data, { status, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", ...extraHeaders } });
}

export function memberAuthErrorResponse(error: unknown) {
  const safe = error instanceof MemberAuthError ? error : new MemberAuthError("AUTH_UNAVAILABLE", "账户服务暂时不可用，请稍后再试。", 503);
  return memberAuthJson({ error: safe.message, code: safe.code }, safe.status, safe.retryAfter ? { "Retry-After": String(safe.retryAfter) } : undefined);
}
