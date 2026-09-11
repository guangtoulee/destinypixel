import { createHash, pbkdf2, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ReportLocale } from "@/lib/report-i18n";
import { destinySupportEmail } from "@/lib/support-contact";
import {
  assertMemberStoreAvailable, getMemberDatabaseConfig, MemberAuthError,
  memberAuthDatabaseRequest, normalizeMemberEmail, validateMemberName, validateMemberPassword,
} from "@/lib/member-auth-security";

export const destinyMemberSessionCookie = "dp_member_session";
export const destinyMemberSessionDays = 45;

export type DestinyMemberRecord = {
  id: string;
  email: string;
  email_normalized: string;
  email_verified_at?: string | null;
  name: string | null;
  password_salt: string;
  password_hash: string;
  session_token_hash: string | null;
  session_expires_at: string | null;
  plan: "free" | "vip";
  created_at: string;
  updated_at: string;
};

export type DestinyMemberSummary = {
  id: string;
  email: string;
  name: string | null;
  plan: DestinyMemberRecord["plan"];
};

export type SavedReportRecord = {
  id: string;
  member_id: string;
  report_id: string;
  title: string;
  locale: ReportLocale;
  report_snapshot: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type SavedReportSummary = {
  id: string;
  reportId: string;
  title: string;
  locale: ReportLocale;
  createdAt: string;
  updatedAt: string;
};

type LocalMemberStore = {
  members: DestinyMemberRecord[];
  saved_reports: SavedReportRecord[];
  password_resets?: PasswordResetRecord[];
};

type PasswordResetRecord = { member_id: string; token_hash: string; expires_at: string; used_at: string | null };
const hashPasswordAsync = promisify(pbkdf2);
let localAuthMutation: Promise<unknown> = Promise.resolve();

function mutateLocalAuthStore<T>(mutate: (store: LocalMemberStore) => T | Promise<T>): Promise<T> {
  const operation = localAuthMutation.then(async () => {
    const store = await readLocalStore();
    const result = await mutate(store);
    await writeLocalStore(store);
    return result;
  });
  localAuthMutation = operation.catch(() => undefined);
  return operation;
}

const localMemberStorePath =
  process.env.DESTINY_MEMBER_STORE_FILE ??
  (process.env.VERCEL
    ? "/tmp/destinypixel-members.json"
    : join(process.cwd(), "work", "destiny-members.json"));

function getSupabaseConfig() {
  return getMemberDatabaseConfig();
}

export function isMemberStorePersistent() { return Boolean(getSupabaseConfig()); }

async function supabaseRequest<T>({
  table,
  method,
  query = "",
  body,
  prefer = "return=representation",
}: {
  table: "destiny_members" | "saved_reports" | "destiny_member_password_resets";
  method: "GET" | "POST" | "PATCH";
  query?: string;
  body?: unknown;
  prefer?: string;
}): Promise<T> {
  return memberAuthDatabaseRequest<T>(`${table}${query}`, {
    method,
    headers: { Prefer: prefer },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function readLocalStore(): Promise<LocalMemberStore> {
  assertMemberStoreAvailable();
  try {
    const text = await readFile(localMemberStorePath, "utf8");
    const parsed = JSON.parse(text) as Partial<LocalMemberStore>;

    return {
      members: Array.isArray(parsed.members) ? parsed.members : [],
      saved_reports: Array.isArray(parsed.saved_reports) ? parsed.saved_reports : [],
      password_resets: Array.isArray(parsed.password_resets) ? parsed.password_resets : [],
    };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return { members: [], saved_reports: [] };
    }

    throw error;
  }
}

async function writeLocalStore(store: LocalMemberStore) {
  assertMemberStoreAvailable();
  await mkdir(dirname(localMemberStorePath), { recursive: true });
  const temporaryPath = `${localMemberStorePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(store, null, 2), { encoding: "utf8", mode: 0o600 });
  await rename(temporaryPath, localMemberStorePath);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createSession() {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(
    Date.now() + destinyMemberSessionDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  return {
    token,
    tokenHash: hashToken(token),
    expires,
  };
}

async function createPasswordHash(password: string, salt: string) {
  return (await hashPasswordAsync(password, salt, 120000, 32, "sha256")).toString("base64url");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function assertEmail(email: string) {
  return normalizeMemberEmail(email);
}

function assertPassword(password: string) {
  validateMemberPassword(password, true);
}

function toMemberSummary(member: DestinyMemberRecord): DestinyMemberSummary {
  return {
    id: member.id,
    email: member.email,
    name: member.name,
    plan: member.plan,
  };
}

function toSavedReportSummary(report: SavedReportRecord): SavedReportSummary {
  return {
    id: report.id,
    reportId: report.report_id,
    title: report.title,
    locale: report.locale,
    createdAt: report.created_at,
    updatedAt: report.updated_at,
  };
}

function safeSnapshot(snapshot: unknown): Record<string, unknown> {
  return snapshot && typeof snapshot === "object" && !Array.isArray(snapshot)
    ? (snapshot as Record<string, unknown>)
    : {};
}

async function findLocalMemberByEmail(email: string) {
  const normalized = normalizeEmail(email);
  const store = await readLocalStore();

  return store.members.find((member) => member.email_normalized === normalized) ?? null;
}

async function findLocalMemberByToken(token: string) {
  const tokenHash = hashToken(token);
  const store = await readLocalStore();

  return store.members.find((member) => member.session_token_hash === tokenHash) ?? null;
}

async function insertLocalMember(member: DestinyMemberRecord) {
  const store = await readLocalStore();
  store.members.push(member);
  await writeLocalStore(store);

  return member;
}

async function updateLocalMember(id: string, updates: Partial<DestinyMemberRecord>, expectedPasswordHash?: string) {
  return mutateLocalAuthStore((store) => {
    const index = store.members.findIndex((member) => member.id === id);
    if (index === -1 || (expectedPasswordHash && store.members[index].password_hash !== expectedPasswordHash)) return null;
    store.members[index] = { ...store.members[index], ...updates, updated_at: updates.updated_at ?? new Date().toISOString() };
    return store.members[index];
  });
}

async function upsertLocalSavedReport(report: Omit<SavedReportRecord, "id" | "created_at">) {
  const store = await readLocalStore();
  const now = new Date().toISOString();
  const index = store.saved_reports.findIndex(
    (item) => item.member_id === report.member_id && item.report_id === report.report_id,
  );

  if (index >= 0) {
    store.saved_reports[index] = {
      ...store.saved_reports[index],
      ...report,
      updated_at: report.updated_at,
    };
    await writeLocalStore(store);

    return store.saved_reports[index];
  }

  const nextReport: SavedReportRecord = {
    ...report,
    id: randomUUID(),
    created_at: now,
  };
  store.saved_reports.push(nextReport);
  await writeLocalStore(store);

  return nextReport;
}

export async function findDestinyMemberByEmail(email: string) {
  assertMemberStoreAvailable();
  const normalized = normalizeEmail(email);

  if (!getSupabaseConfig()) {
    return findLocalMemberByEmail(normalized);
  }

  const rows = await supabaseRequest<DestinyMemberRecord[]>({
    table: "destiny_members",
    method: "GET",
    query: `?email_normalized=eq.${encodeURIComponent(normalized)}&limit=1`,
  });

  return rows[0] ?? null;
}

export async function validateDestinyCredentials({
  password,
  member,
}: {
  password: string;
  member: DestinyMemberRecord;
}) {
  validateMemberPassword(password);
  const expected = Buffer.from(member.password_hash);
  const actual = Buffer.from(await createPasswordHash(password, member.password_salt));

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function registerDestinyMember({
  email,
  password,
  passwordConfirm,
  name,
}: {
  email: string;
  password: string;
  passwordConfirm?: string;
  name?: string;
}) {
  assertMemberStoreAvailable();
  const normalized = assertEmail(email);
  assertPassword(password);
  const safeName = validateMemberName(name);

  if (passwordConfirm !== undefined && password !== passwordConfirm) {
    throw new MemberAuthError("PASSWORD_MISMATCH", "两次密码不一致。");
  }

  const existing = await findDestinyMemberByEmail(normalized);
  if (existing) throw new MemberAuthError("EMAIL_EXISTS", "这个邮箱无法注册，请尝试登录或找回密码。", 409);

  const salt = randomBytes(16).toString("base64url");
  const session = createSession();
  const now = new Date().toISOString();
  const baseMember = {
    email: normalized,
    email_normalized: normalized,
    name: safeName || null,
    password_salt: salt,
    password_hash: await createPasswordHash(password, salt),
    session_token_hash: session.tokenHash,
    session_expires_at: session.expires,
    plan: "free" as const,
    created_at: now,
    updated_at: now,
  };

  const member = getSupabaseConfig()
    ? (
        await supabaseRequest<DestinyMemberRecord[]>({
          table: "destiny_members",
          method: "POST",
          body: baseMember,
        })
      )[0]
    : await insertLocalMember({ ...baseMember, id: randomUUID() });

  if (!member) throw new Error("注册失败，请稍后再试。");

  return {
    token: session.token,
    member: toMemberSummary(member),
  };
}

export async function loginDestinyMember({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  assertMemberStoreAvailable();
  validateMemberPassword(password);
  const normalized = assertEmail(email);
  const member = await findDestinyMemberByEmail(normalized);

  const valid = member
    ? await validateDestinyCredentials({ password, member })
    : (await createPasswordHash(password, "destinypixel-dummy-salt"), false);
  if (!member || !valid) {
    throw new MemberAuthError("LOGIN_INVALID", "邮箱或密码不对。", 401);
  }

  const session = createSession();
  const updates = {
    session_token_hash: session.tokenHash,
    session_expires_at: session.expires,
    updated_at: new Date().toISOString(),
  };
  const updated = getSupabaseConfig()
    ? (
        await supabaseRequest<DestinyMemberRecord[]>({
          table: "destiny_members",
          method: "PATCH",
          query: `?id=eq.${member.id}&password_hash=eq.${encodeURIComponent(member.password_hash)}`,
          body: updates,
        })
      )[0]
    : await updateLocalMember(member.id, updates, member.password_hash);

  if (!updated) throw new MemberAuthError("AUTH_STORE_UNAVAILABLE", "登录未完成，请重试。", 503);
  return {
    token: session.token,
    member: toMemberSummary(updated ?? member),
  };
}

export async function getDestinyMemberByToken(token: string) {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  assertMemberStoreAvailable();

  const member = getSupabaseConfig()
    ? (
        await supabaseRequest<DestinyMemberRecord[]>({
          table: "destiny_members",
          method: "GET",
          query: `?session_token_hash=eq.${hashToken(token)}&limit=1`,
        })
      )[0]
    : await findLocalMemberByToken(token);

  if (!member || !member.session_expires_at) return null;
  const expires = new Date(member.session_expires_at).getTime();
  if (!Number.isFinite(expires) || expires <= Date.now()) return null;

  return member;
}

export async function revokeDestinyMemberSession(token: string) {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return;
  assertMemberStoreAvailable();
  const tokenHash = hashToken(token);
  const updates = { session_token_hash: null, session_expires_at: null, updated_at: new Date().toISOString() };
  if (getSupabaseConfig()) {
    await supabaseRequest({ table: "destiny_members", method: "PATCH", query: `?session_token_hash=eq.${tokenHash}`, body: updates });
  } else {
    await mutateLocalAuthStore((store) => {
      const member = store.members.find((candidate) => candidate.session_token_hash === tokenHash);
      if (member) Object.assign(member, updates);
    });
  }
}

function passwordResetMailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.DESTINY_AUTH_EMAIL_FROM;
  if (!apiKey || !from || !/^[\x21-\x7E]+$/.test(apiKey) || from.length > 200 || /[\r\n]/.test(from)) return null;
  try {
    const site = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.destinypixel.com");
    if (site.protocol !== "https:" && process.env.NODE_ENV === "production") return null;
    if (site.protocol !== "https:" && site.protocol !== "http:") return null;
    return { apiKey, from, origin: site.origin };
  } catch {
    return null;
  }
}

export function getMemberAuthReadiness() {
  let storeReady = true;
  try { assertMemberStoreAvailable(); } catch { storeReady = false; }
  return { persistent: isMemberStorePersistent(), passwordResetAvailable: storeReady && Boolean(passwordResetMailConfig()) };
}

export async function requestDestinyPasswordReset(email: string) {
  const normalized = assertEmail(email);
  const config = passwordResetMailConfig();
  if (!config || !getMemberAuthReadiness().passwordResetAvailable) {
    throw new MemberAuthError("PASSWORD_RESET_UNAVAILABLE", "密码找回邮件服务暂未配置。", 503);
  }
  const accepted = { ok: true as const, message: "If this email belongs to an account and delivery is available, a reset link will arrive shortly." };
  // Same response for missing accounts and delivery errors; never say an email was sent.
  try {
    const member = await findDestinyMemberByEmail(normalized);
    if (!member) return accepted;
    const token = randomBytes(32).toString("base64url");
    const record: PasswordResetRecord = {
      member_id: member.id, token_hash: hashToken(token),
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), used_at: null,
    };
    if (getSupabaseConfig()) {
      await supabaseRequest({ table: "destiny_member_password_resets", method: "POST", body: record });
    } else {
      await mutateLocalAuthStore((store) => { (store.password_resets ??= []).push(record); });
    }
    const resetUrl = new URL("/account", config.origin);
    resetUrl.searchParams.set("reset", token);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `member-reset-${record.token_hash}` },
      body: JSON.stringify({
        from: config.from, reply_to: destinySupportEmail, to: [member.email], subject: "Reset your DestinyPixel password / 重置密码",
        text: `Use this link within 30 minutes to reset your password:\n${resetUrl.toString()}\n\n此链接 30 分钟内有效，且只能使用一次。若不是你本人操作，请忽略此邮件。\n\nNeed help? Reply to this email or contact ${destinySupportEmail}. Do not send your password.\n需要帮助可直接回复此邮件，或联系 ${destinySupportEmail}，请勿发送密码。`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) console.warn("Member password-reset delivery did not complete.");
  } catch {
    console.warn("Member password-reset request could not be delivered.");
  }
  return accepted;
}

export async function resetDestinyMemberPassword({ token, password, passwordConfirm }: { token: string; password: string; passwordConfirm?: string }) {
  assertMemberStoreAvailable();
  validateMemberPassword(password, true);
  if (passwordConfirm !== undefined && passwordConfirm !== password) throw new MemberAuthError("PASSWORD_MISMATCH", "两次密码不一致。");
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) throw new MemberAuthError("INVALID_RESET_TOKEN", "重置链接无效或已过期，请重新申请。");
  const tokenHash = hashToken(token);
  const salt = randomBytes(16).toString("base64url");
  const passwordHash = await createPasswordHash(password, salt);
  let changed = false;
  if (getSupabaseConfig()) {
    changed = await memberAuthDatabaseRequest<boolean>("rpc/destiny_auth_reset_password", {
      method: "POST", body: JSON.stringify({ p_token_hash: tokenHash, p_password_salt: salt, p_password_hash: passwordHash }),
    });
  } else {
    changed = await mutateLocalAuthStore((store) => {
      const reset = store.password_resets?.find((candidate) => candidate.token_hash === tokenHash && !candidate.used_at && new Date(candidate.expires_at).getTime() > Date.now());
      const member = reset && store.members.find((candidate) => candidate.id === reset.member_id);
      if (!reset || !member) return false;
      const now = new Date().toISOString();
      Object.assign(member, { password_salt: salt, password_hash: passwordHash, session_token_hash: null, session_expires_at: null, email_verified_at: now, updated_at: now });
      for (const candidate of store.password_resets ?? []) if (candidate.member_id === member.id && !candidate.used_at) candidate.used_at = now;
      return true;
    });
  }
  if (!changed) throw new MemberAuthError("INVALID_RESET_TOKEN", "重置链接无效或已过期，请重新申请。");
  return { ok: true as const };
}

export async function saveDestinyReportForToken({
  token,
  reportId,
  title,
  locale,
  snapshot,
}: {
  token: string;
  reportId: string;
  title: string;
  locale: ReportLocale;
  snapshot: unknown;
}) {
  const member = await getDestinyMemberByToken(token);
  if (!member) throw new Error("请先登录后再保存报告。");

  const now = new Date().toISOString();
  const reportSnapshot = {
    ...safeSnapshot(snapshot),
    reportId,
    title,
    locale,
    savedAt: now,
  };
  const baseReport = {
    member_id: member.id,
    report_id: reportId,
    title: title.trim() || "DestinyPixel Report",
    locale,
    report_snapshot: reportSnapshot,
    updated_at: now,
  };
  const report = getSupabaseConfig()
    ? await upsertSupabaseSavedReport(baseReport)
    : await upsertLocalSavedReport(baseReport);

  return {
    member: toMemberSummary(member),
    report: toSavedReportSummary(report),
  };
}

async function upsertSupabaseSavedReport(
  report: Omit<SavedReportRecord, "id" | "created_at">,
) {
  const existing = await supabaseRequest<SavedReportRecord[]>({
    table: "saved_reports",
    method: "GET",
    query: `?member_id=eq.${report.member_id}&report_id=eq.${encodeURIComponent(
      report.report_id,
    )}&limit=1`,
  });

  if (existing[0]) {
    const rows = await supabaseRequest<SavedReportRecord[]>({
      table: "saved_reports",
      method: "PATCH",
      query: `?id=eq.${existing[0].id}`,
      body: report,
    });

    return rows[0] ?? existing[0];
  }

  const rows = await supabaseRequest<SavedReportRecord[]>({
    table: "saved_reports",
    method: "POST",
    body: report,
  });

  if (!rows[0]) throw new Error("保存报告失败。");

  return rows[0];
}

export async function listSavedReportsForToken(token: string) {
  const member = await getDestinyMemberByToken(token);
  if (!member) throw new Error("请先登录。");

  const reports = getSupabaseConfig()
    ? await supabaseRequest<SavedReportRecord[]>({
        table: "saved_reports",
        method: "GET",
        query: `?member_id=eq.${member.id}&order=updated_at.desc&limit=50`,
      })
    : (await readLocalStore()).saved_reports
        .filter((report) => report.member_id === member.id)
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
        .slice(0, 50);

  return {
    member: toMemberSummary(member),
    reports: reports.map(toSavedReportSummary),
  };
}
