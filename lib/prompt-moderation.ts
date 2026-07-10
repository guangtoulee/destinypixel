import fs from "node:fs/promises";
import path from "node:path";
import type { PromptFeedItem } from "@/lib/ai/prompt";

export type PromptModerationAction = "pin" | "unpin" | "delete" | "restore";

export type PromptModerationState = {
  pinnedIds: string[];
  deletedIds: string[];
  updatedAt: string;
};

const bucketId = "prompt-admin";
const objectPath = "moderation.json";
const localPath = path.join(process.cwd(), "work", "prompt-moderation.json");
const cacheLifetimeMs = 0;

function emptyState(): PromptModerationState {
  return { pinnedIds: [], deletedIds: [], updatedAt: new Date(0).toISOString() };
}

function normalizeState(value: unknown): PromptModerationState {
  const candidate = value as Partial<PromptModerationState> | null;
  const cleanIds = (ids: unknown) =>
    Array.from(
      new Set(
        (Array.isArray(ids) ? ids : [])
          .filter((id): id is string => typeof id === "string")
          .map((id) => id.trim())
          .filter(Boolean),
      ),
    ).slice(0, 1000);

  return {
    pinnedIds: cleanIds(candidate?.pinnedIds),
    deletedIds: cleanIds(candidate?.deletedIds),
    updatedAt:
      typeof candidate?.updatedAt === "string"
        ? candidate.updatedAt
        : new Date(0).toISOString(),
  };
}

function storageConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

function globalCache() {
  const target = globalThis as typeof globalThis & {
    __destinyPixelPromptModeration?: {
      value: PromptModerationState;
      expiresAt: number;
      bucketReady: boolean;
    };
  };
  target.__destinyPixelPromptModeration ??= {
    value: emptyState(),
    expiresAt: 0,
    bucketReady: false,
  };
  return target.__destinyPixelPromptModeration;
}

function storageHeaders(key: string) {
  return { apikey: key, Authorization: `Bearer ${key}` };
}

async function ensureBucket(url: string, key: string) {
  const cache = globalCache();
  if (cache.bucketReady) return;

  const existing = await fetch(`${url}/storage/v1/bucket/${bucketId}`, {
    headers: storageHeaders(key),
    cache: "no-store",
  });
  if (existing.ok) {
    cache.bucketReady = true;
    return;
  }
  if (existing.status !== 404 && existing.status !== 400) {
    throw new Error(`Moderation bucket check failed (${existing.status}).`);
  }

  const created = await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...storageHeaders(key), "Content-Type": "application/json" },
    body: JSON.stringify({
      id: bucketId,
      name: bucketId,
      public: false,
      file_size_limit: 100_000,
      allowed_mime_types: ["application/json"],
    }),
    cache: "no-store",
  });
  if (!created.ok && created.status !== 409) {
    throw new Error(`Moderation bucket create failed (${created.status}).`);
  }
  cache.bucketReady = true;
}

async function readRemoteState(url: string, key: string) {
  const response = await fetch(
    `${url}/storage/v1/object/authenticated/${bucketId}/${objectPath}`,
    { headers: storageHeaders(key), cache: "no-store" },
  );
  if (response.status === 404 || response.status === 400) return emptyState();
  if (!response.ok) {
    throw new Error(`Moderation state read failed (${response.status}).`);
  }
  return normalizeState(await response.json());
}

async function writeRemoteState(
  url: string,
  key: string,
  state: PromptModerationState,
) {
  await ensureBucket(url, key);
  const response = await fetch(
    `${url}/storage/v1/object/${bucketId}/${objectPath}`,
    {
      method: "POST",
      headers: {
        ...storageHeaders(key),
        "Content-Type": "application/json",
        "x-upsert": "true",
      },
      body: JSON.stringify(state),
      cache: "no-store",
    },
  );
  if (!response.ok) {
    throw new Error(`Moderation state write failed (${response.status}).`);
  }
}

async function readLocalState() {
  try {
    return normalizeState(JSON.parse(await fs.readFile(localPath, "utf8")));
  } catch {
    return emptyState();
  }
}

async function writeLocalState(state: PromptModerationState) {
  await fs.mkdir(path.dirname(localPath), { recursive: true });
  await fs.writeFile(localPath, `${JSON.stringify(state, null, 2)}\n`);
}

export async function readPromptModeration(force = false) {
  const cache = globalCache();
  if (!force && cache.expiresAt > Date.now()) return cache.value;

  const config = storageConfig();
  try {
    cache.value = config
      ? await readRemoteState(config.url, config.key)
      : await readLocalState();
  } catch (error) {
    console.warn(error instanceof Error ? error.message : "Moderation read failed.");
  }
  cache.expiresAt = Date.now() + cacheLifetimeMs;
  return cache.value;
}

export async function moderatePromptItem(
  id: string,
  action: PromptModerationAction,
) {
  const cleanId = id.trim();
  if (!cleanId || cleanId.length > 180) throw new Error("Invalid prompt item id.");

  const current = await readPromptModeration(true);
  const pinned = current.pinnedIds.filter((itemId) => itemId !== cleanId);
  const deleted = current.deletedIds.filter((itemId) => itemId !== cleanId);

  if (action === "pin") pinned.unshift(cleanId);
  if (action === "delete") deleted.unshift(cleanId);

  const next = normalizeState({
    pinnedIds: pinned,
    deletedIds: deleted,
    updatedAt: new Date().toISOString(),
  });
  if (action === "delete") next.pinnedIds = next.pinnedIds.filter((itemId) => itemId !== cleanId);

  const config = storageConfig();
  if (config) {
    await writeRemoteState(config.url, config.key, next);
  } else {
    if (process.env.VERCEL) {
      throw new Error("Persistent moderation storage is not configured.");
    }
    await writeLocalState(next);
  }

  const cache = globalCache();
  cache.value = next;
  cache.expiresAt = Date.now() + cacheLifetimeMs;
  return next;
}

export function applyPromptModeration(
  items: PromptFeedItem[],
  state: PromptModerationState,
) {
  const deleted = new Set(state.deletedIds);
  const pinOrder = new Map(state.pinnedIds.map((id, index) => [id, index]));

  return items
    .filter((item) => !deleted.has(item.id))
    .map((item) => ({ ...item, isPinned: pinOrder.has(item.id) }))
    .sort((left, right) => {
      const leftRank = pinOrder.get(left.id);
      const rightRank = pinOrder.get(right.id);
      if (leftRank !== undefined || rightRank !== undefined) {
        if (leftRank === undefined) return 1;
        if (rightRank === undefined) return -1;
        return leftRank - rightRank;
      }
      return 0;
    });
}
