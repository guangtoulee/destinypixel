import { createHash, pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ReportLocale } from "@/lib/report-i18n";

export const destinyMemberSessionCookie = "dp_member_session";
export const destinyMemberSessionDays = 45;

export type DestinyMemberRecord = {
  id: string;
  email: string;
  email_normalized: string;
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
};

const localMemberStorePath =
  process.env.DESTINY_MEMBER_STORE_FILE ??
  (process.env.VERCEL
    ? "/tmp/destinypixel-members.json"
    : join(process.cwd(), "work", "destiny-members.json"));

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;
  if (!/^https?:\/\//.test(url) || !/^[\x21-\x7E]+$/.test(key)) return null;

  return { url, key };
}

async function supabaseRequest<T>({
  table,
  method,
  query = "",
  body,
  prefer = "return=representation",
}: {
  table: "destiny_members" | "saved_reports";
  method: "GET" | "POST" | "PATCH";
  query?: string;
  body?: unknown;
  prefer?: string;
}): Promise<T> {
  const config = getSupabaseConfig();
  if (!config) throw new Error("会员存储还没有配置。");

  const response = await fetch(`${config.url}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: prefer,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Member store ${table} ${method} failed: ${await response.text()}`);
  }

  return (await response.json()) as T;
}

async function readLocalStore(): Promise<LocalMemberStore> {
  try {
    const text = await readFile(localMemberStorePath, "utf8");
    const parsed = JSON.parse(text) as Partial<LocalMemberStore>;

    return {
      members: Array.isArray(parsed.members) ? parsed.members : [],
      saved_reports: Array.isArray(parsed.saved_reports) ? parsed.saved_reports : [],
    };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return { members: [], saved_reports: [] };
    }

    throw error;
  }
}

async function writeLocalStore(store: LocalMemberStore) {
  await mkdir(dirname(localMemberStorePath), { recursive: true });
  const temporaryPath = `${localMemberStorePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(store, null, 2), "utf8");
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

function createPasswordHash(password: string, salt: string) {
  return pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("base64url");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function assertEmail(email: string) {
  const normalized = normalizeEmail(email);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("请输入有效邮箱。");
  }

  return normalized;
}

function assertPassword(password: string) {
  if (password.length < 6) {
    throw new Error("密码至少需要 6 位。");
  }
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

async function updateLocalMember(id: string, updates: Partial<DestinyMemberRecord>) {
  const store = await readLocalStore();
  const index = store.members.findIndex((member) => member.id === id);
  if (index === -1) return null;

  store.members[index] = {
    ...store.members[index],
    ...updates,
    updated_at: updates.updated_at ?? new Date().toISOString(),
  };
  await writeLocalStore(store);

  return store.members[index];
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

export function validateDestinyCredentials({
  password,
  member,
}: {
  password: string;
  member: DestinyMemberRecord;
}) {
  const expected = Buffer.from(member.password_hash);
  const actual = Buffer.from(createPasswordHash(password, member.password_salt));

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
  const normalized = assertEmail(email);
  assertPassword(password);

  if (passwordConfirm !== undefined && password !== passwordConfirm) {
    throw new Error("两次密码不一致。");
  }

  const existing = await findDestinyMemberByEmail(normalized);
  if (existing) throw new Error("这个邮箱已经注册。");

  const salt = randomBytes(16).toString("base64url");
  const session = createSession();
  const now = new Date().toISOString();
  const baseMember = {
    email: normalized,
    email_normalized: normalized,
    name: name?.trim() || null,
    password_salt: salt,
    password_hash: createPasswordHash(password, salt),
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
  const normalized = assertEmail(email);
  const member = await findDestinyMemberByEmail(normalized);

  if (!member || !validateDestinyCredentials({ password, member })) {
    throw new Error("邮箱或密码不对。");
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
          query: `?id=eq.${member.id}`,
          body: updates,
        })
      )[0]
    : await updateLocalMember(member.id, updates);

  return {
    token: session.token,
    member: toMemberSummary(updated ?? member),
  };
}

export async function getDestinyMemberByToken(token: string) {
  if (!token) return null;

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
  if (new Date(member.session_expires_at).getTime() < Date.now()) return null;

  return member;
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
