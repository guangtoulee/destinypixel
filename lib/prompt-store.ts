import fs from "node:fs/promises";
import path from "node:path";
import {
  dedupePromptItems,
  normalizePromptFeedItem,
  seedPromptItems,
  type PromptFeedItem,
  type PromptMetrics,
} from "@/lib/ai/prompt";

type PromptStoreShape = {
  updatedAt: string;
  items: PromptFeedItem[];
};

type PromptItemRow = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  negative_prompt: string;
  image_url: string | null;
  video_url: string | null;
  source_url: string | null;
  source_type: string;
  author_name: string | null;
  author_handle: string | null;
  created_at: string;
  imported_at: string;
  tags: string[];
  model_hints: string[];
  style: string;
  lighting: string;
  camera: string;
  palette: string;
  mood: string;
  composition: string;
  aspect_ratio: string;
  language: string;
  content_type: string;
  metrics: Partial<PromptMetrics>;
  compliance_note: string | null;
  raw_text: string | null;
};

const localPromptStorePath = path.join(process.cwd(), "work", "prompt-feed.json");

function shouldSkipLocalWrites() {
  return Boolean(process.env.VERCEL || process.env.NODE_ENV === "production");
}

function hasSupabaseConfig() {
  return Boolean(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function getMemoryStore() {
  const globalStore = globalThis as typeof globalThis & {
    __destinyPixelPromptStore?: PromptStoreShape;
  };

  globalStore.__destinyPixelPromptStore ??= {
    updatedAt: new Date().toISOString(),
    items: [],
  };

  return globalStore.__destinyPixelPromptStore;
}

function replaceMemoryStore(store: PromptStoreShape) {
  const memoryStore = getMemoryStore();

  memoryStore.updatedAt = store.updatedAt;
  memoryStore.items = store.items;

  return memoryStore;
}

async function readLocalPromptStore() {
  const memoryStore = getMemoryStore();

  if (memoryStore.items.length > 0) {
    return memoryStore;
  }

  try {
    const parsed = JSON.parse(
      await fs.readFile(localPromptStorePath, "utf8"),
    ) as PromptStoreShape;

    return replaceMemoryStore({
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      items: Array.isArray(parsed.items)
        ? parsed.items.map((item) => normalizePromptFeedItem(item))
        : [],
    });
  } catch {
    return memoryStore;
  }
}

async function writeLocalPromptStore(store: PromptStoreShape) {
  replaceMemoryStore(store);

  if (shouldSkipLocalWrites()) return;

  try {
    await fs.mkdir(path.dirname(localPromptStorePath), { recursive: true });
    await fs.writeFile(localPromptStorePath, JSON.stringify(store, null, 2));
  } catch {
    console.warn("Prompt feed local write skipped.");
  }
}

function toSupabaseRow(item: PromptFeedItem): PromptItemRow {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    prompt: item.prompt,
    negative_prompt: item.negativePrompt,
    image_url: item.imageUrl || null,
    video_url: item.videoUrl || null,
    source_url: item.sourceUrl || null,
    source_type: item.sourceType,
    author_name: item.authorName || null,
    author_handle: item.authorHandle || null,
    created_at: item.createdAt,
    imported_at: item.importedAt,
    tags: item.tags,
    model_hints: item.modelHints,
    style: item.style,
    lighting: item.lighting,
    camera: item.camera,
    palette: item.palette,
    mood: item.mood,
    composition: item.composition,
    aspect_ratio: item.aspectRatio,
    language: item.language,
    content_type: item.contentType,
    metrics: item.metrics,
    compliance_note: item.complianceNote || null,
    raw_text: item.rawText || null,
  };
}

function fromSupabaseRow(row: PromptItemRow) {
  return normalizePromptFeedItem({
    id: row.id,
    title: row.title,
    description: row.description,
    prompt: row.prompt,
    negativePrompt: row.negative_prompt,
    imageUrl: row.image_url || undefined,
    videoUrl: row.video_url || undefined,
    sourceUrl: row.source_url || undefined,
    sourceType: row.source_type as PromptFeedItem["sourceType"],
    authorName: row.author_name || undefined,
    authorHandle: row.author_handle || undefined,
    createdAt: row.created_at,
    importedAt: row.imported_at,
    tags: row.tags,
    modelHints: row.model_hints,
    style: row.style,
    lighting: row.lighting,
    camera: row.camera,
    palette: row.palette,
    mood: row.mood,
    composition: row.composition,
    aspectRatio: row.aspect_ratio,
    language: row.language as PromptFeedItem["language"],
    contentType: row.content_type as PromptFeedItem["contentType"],
    metrics: row.metrics,
    complianceNote: row.compliance_note || undefined,
    rawText: row.raw_text || undefined,
  });
}

async function supabasePromptRequest<T>({
  method,
  body,
  query = "",
  prefer,
}: {
  method: "GET" | "POST";
  body?: unknown;
  query?: string;
  prefer?: string;
}): Promise<T> {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase is not configured.");
  }

  const response = await fetch(`${url}/rest/v1/prompt_items${query}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: prefer || "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Supabase prompt_items ${method} failed: ${await response.text()}`);
  }

  return (await response.json()) as T;
}

async function readSupabasePromptItems(limit: number) {
  if (!hasSupabaseConfig()) return { items: [] as PromptFeedItem[], available: false };

  try {
    const rows = await supabasePromptRequest<PromptItemRow[]>({
      method: "GET",
      query: `?select=*&order=created_at.desc&limit=${limit}`,
    });

    return { items: rows.map(fromSupabaseRow), available: true };
  } catch (error) {
    console.warn(error instanceof Error ? error.message : "Supabase read failed.");
    return { items: [] as PromptFeedItem[], available: false };
  }
}

async function upsertSupabasePromptItems(items: PromptFeedItem[]) {
  if (!hasSupabaseConfig() || items.length === 0) return false;

  try {
    await supabasePromptRequest<PromptItemRow[]>({
      method: "POST",
      query: "?on_conflict=id",
      body: items.map(toSupabaseRow),
      prefer: "resolution=merge-duplicates,return=representation",
    });

    return true;
  } catch (error) {
    console.warn(error instanceof Error ? error.message : "Supabase upsert failed.");
    return false;
  }
}

export async function readPromptFeed(limit = 48) {
  const supabase = await readSupabasePromptItems(limit);
  const localStore = await readLocalPromptStore();
  const items = dedupePromptItems([
    ...supabase.items,
    ...localStore.items,
    ...seedPromptItems,
  ]).slice(0, limit);

  return {
    items,
    updatedAt: localStore.updatedAt,
    persistent: supabase.available || !shouldSkipLocalWrites(),
  };
}

export async function savePromptItems(items: PromptFeedItem[]) {
  const normalized = dedupePromptItems(
    items.map((item) => normalizePromptFeedItem(item)),
  );

  if (normalized.length === 0) {
    return { saved: 0, persistent: hasSupabaseConfig() };
  }

  const wroteSupabase = await upsertSupabasePromptItems(normalized);
  const localStore = await readLocalPromptStore();
  const merged = dedupePromptItems([...normalized, ...localStore.items]).slice(0, 400);
  const updatedAt = new Date().toISOString();

  await writeLocalPromptStore({
    updatedAt,
    items: merged,
  });

  return {
    saved: normalized.length,
    updatedAt,
    persistent: wroteSupabase || (!shouldSkipLocalWrites() && !process.env.VERCEL),
  };
}
