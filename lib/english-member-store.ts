import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

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
const localStorePath =
  process.env.ENGLISH_MEMBER_STORE_FILE ??
  (process.env.VERCEL
    ? "/tmp/destinypixel-english-members.json"
    : join(process.cwd(), "work", "english-members.json"));

function canUseLocalMemberStore() {
  return !process.env.VERCEL || Boolean(process.env.ENGLISH_MEMBER_STORE_FILE);
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  if (!/^https?:\/\//.test(url) || !/^[\x21-\x7E]+$/.test(key)) {
    return null;
  }

  return { url, key };
}

function shouldUseLocalMemberStore() {
  return !getSupabaseConfig() && canUseLocalMemberStore();
}

function assertMemberStoreConfigured() {
  if (!getSupabaseConfig() && !canUseLocalMemberStore()) {
    throw new Error("云端会员库还没有配置，暂时不能用账号注册/登录；请配置 Supabase 后再试。");
  }
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
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("会员存储还没有配置。");
  }

  const { url, key } = config;
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

type LocalEnglishMemberStore = {
  members: EnglishMemberRecord[];
};

async function readLocalStore(): Promise<LocalEnglishMemberStore> {
  try {
    const text = await readFile(localStorePath, "utf8");
    const parsed = JSON.parse(text) as Partial<LocalEnglishMemberStore>;

    return { members: Array.isArray(parsed.members) ? parsed.members : [] };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return { members: [] };
    }

    throw error;
  }
}

async function writeLocalStore(store: LocalEnglishMemberStore) {
  await mkdir(dirname(localStorePath), { recursive: true });
  const temporaryPath = `${localStorePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(store, null, 2), "utf8");
  await rename(temporaryPath, localStorePath);
}

async function findLocalMemberByUsername(username: string) {
  const normalized = normalizeUsername(username);
  const store = await readLocalStore();

  return store.members.find((member) => member.username_normalized === normalized) ?? null;
}

async function findLocalMemberByToken(token: string) {
  const tokenHash = hashToken(token);
  const store = await readLocalStore();

  return store.members.find((member) => member.session_token_hash === tokenHash) ?? null;
}

async function insertLocalMember(member: EnglishMemberRecord) {
  const store = await readLocalStore();
  store.members.push(member);
  await writeLocalStore(store);

  return member;
}

async function updateLocalMember(id: string, updates: Partial<EnglishMemberRecord>) {
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
  if (shouldUseLocalMemberStore()) {
    return findLocalMemberByUsername(username);
  }

  assertMemberStoreConfigured();
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
  assertMemberStoreConfigured();
  const message = validateCredentials({ username, password });
  if (message) throw new Error(message);

  const cleanUsername = username.trim();
  const normalized = normalizeUsername(username);
  const existing = await findEnglishMemberByUsername(username);
  if (existing) throw new Error("这个用户名已经有人用了。");

  const salt = randomBytes(16).toString("base64url");
  const session = createSession();
  const now = new Date().toISOString();

  if (shouldUseLocalMemberStore()) {
    const member = await insertLocalMember({
      id: randomBytes(16).toString("base64url"),
      username: cleanUsername,
      username_normalized: normalized,
      password_salt: salt,
      password_hash: createPasswordHash(password, salt),
      session_token_hash: session.tokenHash,
      session_expires_at: session.expires,
      progress: safeProgress(progress),
      created_at: now,
      updated_at: now,
    });

    return {
      token: session.token,
      member: {
        id: member.id,
        username: member.username,
      },
      progress: member.progress,
    };
  }

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
  assertMemberStoreConfigured();
  const message = validateCredentials({ username, password });
  if (message) throw new Error(message);

  const member = await findEnglishMemberByUsername(username);
  if (!member) throw new Error("没有这个用户名。");

  const expected = Buffer.from(member.password_hash);
  const actual = Buffer.from(createPasswordHash(password, member.password_salt));
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new Error("密码不对。");
  }

  const session = createSession();
  if (shouldUseLocalMemberStore()) {
    const updated = await updateLocalMember(member.id, {
      session_token_hash: session.tokenHash,
      session_expires_at: session.expires,
    });

    return {
      token: session.token,
      member: {
        id: updated?.id ?? member.id,
        username: updated?.username ?? member.username,
      },
      progress: updated?.progress ?? member.progress ?? {},
    };
  }

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
  if (shouldUseLocalMemberStore()) {
    const member = await findLocalMemberByToken(token);
    if (!member || !member.session_expires_at) return null;
    if (new Date(member.session_expires_at).getTime() < Date.now()) return null;

    return member;
  }

  assertMemberStoreConfigured();
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

  if (shouldUseLocalMemberStore()) {
    const updated = await updateLocalMember(member.id, {
      progress: safeProgress(progress),
    });

    return {
      member: {
        id: updated?.id ?? member.id,
        username: updated?.username ?? member.username,
      },
      progress: updated?.progress ?? member.progress ?? {},
    };
  }

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
