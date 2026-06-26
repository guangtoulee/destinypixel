import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

export type EnglishMemberProgress = Record<string, unknown>;

export type EnglishMemberRecord = {
  id: string;
  username: string;
  username_normalized: string;
  password_salt: string;
  password_hash: string;
  session_token_hash: string | null;
  session_expires_at: string | null;
  progress: EnglishMemberProgress;
  created_at: string;
  updated_at: string;
};

const sessionDays = 45;

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase is not configured.");
  }

  if (!/^https?:\/\//.test(url) || !/^[\x21-\x7E]+$/.test(key)) {
    throw new Error("Supabase 环境变量还没有配置真实值。");
  }

  return { url, key };
}

async function supabaseRequest<T>({
  method,
  query = "",
  body,
}: {
  method: "GET" | "POST" | "PATCH";
  query?: string;
  body?: unknown;
}): Promise<T> {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/english_members${query}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`English member store failed: ${await response.text()}`);
  }

  return (await response.json()) as T;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function createPasswordHash(password: string, salt: string) {
  return pbkdf2Sync(password, salt, 210_000, 32, "sha256").toString("base64url");
}

function createSession() {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000).toISOString();

  return {
    token,
    tokenHash: hashToken(token),
    expires,
  };
}

function safeProgress(progress: unknown): EnglishMemberProgress {
  if (!progress || typeof progress !== "object" || Array.isArray(progress)) {
    return {};
  }

  return progress as EnglishMemberProgress;
}

export function validateCredentials({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  const cleanUsername = username.trim();

  if (cleanUsername.length < 2 || cleanUsername.length > 32) {
    return "用户名需要 2-32 个字符。";
  }

  if (password.length < 6 || password.length > 72) {
    return "密码需要 6-72 个字符。";
  }

  return "";
}

export async function findEnglishMemberByUsername(username: string) {
  const normalized = normalizeUsername(username);
  const rows = await supabaseRequest<EnglishMemberRecord[]>({
    method: "GET",
    query: `?username_normalized=eq.${encodeURIComponent(normalized)}&limit=1`,
  });

  return rows[0] ?? null;
}

export async function registerEnglishMember({
  username,
  password,
  progress,
}: {
  username: string;
  password: string;
  progress?: unknown;
}) {
  const message = validateCredentials({ username, password });
  if (message) throw new Error(message);

  const cleanUsername = username.trim();
  const normalized = normalizeUsername(username);
  const existing = await findEnglishMemberByUsername(username);
  if (existing) throw new Error("这个用户名已经有人用了。");

  const salt = randomBytes(16).toString("base64url");
  const session = createSession();
  const rows = await supabaseRequest<EnglishMemberRecord[]>({
    method: "POST",
    body: {
      username: cleanUsername,
      username_normalized: normalized,
      password_salt: salt,
      password_hash: createPasswordHash(password, salt),
      session_token_hash: session.tokenHash,
      session_expires_at: session.expires,
      progress: safeProgress(progress),
    },
  });
  const member = rows[0];

  if (!member) throw new Error("注册失败，请稍后再试。");

  return {
    token: session.token,
    member: {
      id: member.id,
      username: member.username,
    },
    progress: member.progress,
  };
}

export async function loginEnglishMember({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  const message = validateCredentials({ username, password });
  if (message) throw new Error(message);

  const member = await findEnglishMemberByUsername(username);
  if (!member) throw new Error("用户名或密码不对。");

  const expected = Buffer.from(member.password_hash);
  const actual = Buffer.from(createPasswordHash(password, member.password_salt));
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new Error("用户名或密码不对。");
  }

  const session = createSession();
  const rows = await supabaseRequest<EnglishMemberRecord[]>({
    method: "PATCH",
    query: `?id=eq.${member.id}`,
    body: {
      session_token_hash: session.tokenHash,
      session_expires_at: session.expires,
      updated_at: new Date().toISOString(),
    },
  });
  const updated = rows[0] ?? member;

  return {
    token: session.token,
    member: {
      id: updated.id,
      username: updated.username,
    },
    progress: updated.progress ?? {},
  };
}

export async function getEnglishMemberByToken(token: string) {
  const tokenHash = hashToken(token);
  const rows = await supabaseRequest<EnglishMemberRecord[]>({
    method: "GET",
    query: `?session_token_hash=eq.${tokenHash}&limit=1`,
  });
  const member = rows[0];

  if (!member || !member.session_expires_at) return null;
  if (new Date(member.session_expires_at).getTime() < Date.now()) return null;

  return member;
}

export async function saveEnglishMemberProgress({
  token,
  progress,
}: {
  token: string;
  progress: unknown;
}) {
  const member = await getEnglishMemberByToken(token);
  if (!member) throw new Error("登录已过期，请重新登录。");

  const rows = await supabaseRequest<EnglishMemberRecord[]>({
    method: "PATCH",
    query: `?id=eq.${member.id}`,
    body: {
      progress: safeProgress(progress),
      updated_at: new Date().toISOString(),
    },
  });
  const updated = rows[0] ?? member;

  return {
    member: {
      id: updated.id,
      username: updated.username,
    },
    progress: updated.progress ?? {},
  };
}
