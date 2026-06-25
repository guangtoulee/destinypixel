import fs from "node:fs/promises";
import path from "node:path";
import type { AIReportContent } from "@/lib/ai/report";
import type { AstroData } from "@/lib/engines/astrology";
import type { BaziData } from "@/lib/engines/bazi";
import type { BirthInput } from "@/lib/engines/time";

export type ReportRecord = {
  id: string;
  user_id: string;
  birth_record_id: string;
  status?: "ai_ready" | "ai_unavailable";
  created_at: string;
  bazi_data: BaziData;
  astro_data: AstroData;
  ai_content: AIReportContent;
  user: {
    id: string;
    name: string;
    email: string | null;
  };
  birth_record: {
    id: string;
    name: string;
    birth_date: string;
    birth_time: string;
    birth_place: string;
    latitude: number;
    longitude: number;
    timezone: string;
    true_solar_time: string;
  };
};

function getReportStatus(aiContent: AIReportContent): ReportRecord["status"] {
  return aiContent.meta.provider === "deepseek" ? "ai_ready" : "ai_unavailable";
}

type LocalStore = {
  users: Array<ReportRecord["user"] & { created_at: string }>;
  birth_records: Array<ReportRecord["birth_record"] & { user_id: string; created_at: string }>;
  reports: ReportRecord[];
};

const localDbPath = path.join(process.cwd(), "work", "local-db.json");

function createEmptyStore(): LocalStore {
  return { users: [], birth_records: [], reports: [] };
}

function getMemoryStore() {
  const globalStore = globalThis as typeof globalThis & {
    __destinyPixelLocalStore?: LocalStore;
  };

  globalStore.__destinyPixelLocalStore ??= createEmptyStore();
  return globalStore.__destinyPixelLocalStore;
}

function replaceMemoryStore(store: LocalStore) {
  const memoryStore = getMemoryStore();

  memoryStore.users = store.users;
  memoryStore.birth_records = store.birth_records;
  memoryStore.reports = store.reports;

  return memoryStore;
}

function shouldSkipLocalWrites() {
  return Boolean(process.env.VERCEL || process.env.NODE_ENV === "production");
}

function hasSupabaseConfig() {
  return Boolean(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

async function readLocalStore(): Promise<LocalStore> {
  const memoryStore = getMemoryStore();

  if (memoryStore.reports.length > 0) {
    return memoryStore;
  }

  try {
    return replaceMemoryStore(
      JSON.parse(await fs.readFile(localDbPath, "utf8")) as LocalStore,
    );
  } catch {
    return memoryStore;
  }
}

async function writeLocalStore(store: LocalStore) {
  replaceMemoryStore(store);

  if (shouldSkipLocalWrites()) {
    console.warn("Vercel 环境跳过本地写入");
    return;
  }

  try {
    await fs.mkdir(path.dirname(localDbPath), { recursive: true });
    await fs.writeFile(localDbPath, JSON.stringify(store, null, 2));
  } catch {
    console.warn("Vercel 环境跳过本地写入");
  }
}

async function supabaseRequest<T>(
  table: string,
  method: "GET" | "POST",
  body?: unknown,
  query = "",
): Promise<T> {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase is not configured.");
  }

  const response = await fetch(`${url}/rest/v1/${table}${query}`, {
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
    throw new Error(`Supabase ${table} ${method} failed: ${await response.text()}`);
  }

  return (await response.json()) as T;
}

export async function createReportRecord({
  input,
  bazi,
  astro,
  aiContent,
}: {
  input: BirthInput;
  bazi: BaziData;
  astro: AstroData;
  aiContent: AIReportContent;
}) {
  const now = new Date().toISOString();
  const userId = crypto.randomUUID();
  const birthRecordId = crypto.randomUUID();
  const reportId = crypto.randomUUID();
  const status = getReportStatus(aiContent);
  const user = {
    id: userId,
    name: input.name,
    email: null,
    created_at: now,
  };
  const birthRecord = {
    id: birthRecordId,
    user_id: userId,
    name: input.name,
    birth_date: input.birthDate,
    birth_time: input.birthTime,
    birth_place: input.city.label,
    latitude: input.city.latitude,
    longitude: input.city.longitude,
    timezone: input.city.timezone,
    true_solar_time: bazi.trueSolarTime.isoLike,
    created_at: now,
  };
  const report: ReportRecord = {
    id: reportId,
    user_id: userId,
    birth_record_id: birthRecordId,
    status,
    created_at: now,
    bazi_data: bazi,
    astro_data: astro,
    ai_content: aiContent,
    user: {
      id: userId,
      name: input.name,
      email: null,
    },
    birth_record: {
      id: birthRecordId,
      name: input.name,
      birth_date: input.birthDate,
      birth_time: input.birthTime,
      birth_place: input.city.label,
      latitude: input.city.latitude,
      longitude: input.city.longitude,
      timezone: input.city.timezone,
      true_solar_time: bazi.trueSolarTime.isoLike,
    },
  };

  if (hasSupabaseConfig()) {
    await supabaseRequest("users", "POST", user);
    await supabaseRequest("birth_records", "POST", birthRecord);
    await supabaseRequest("reports", "POST", {
      id: report.id,
      user_id: report.user_id,
      birth_record_id: report.birth_record_id,
      bazi_data: report.bazi_data,
      astro_data: report.astro_data,
      ai_content: report.ai_content,
      status: report.status,
      created_at: report.created_at,
    });
    return report.id;
  }

  const store = await readLocalStore();
  store.users.push(user);
  store.birth_records.push(birthRecord);
  store.reports.push(report);
  await writeLocalStore(store);

  return report.id;
}

export async function getReportRecord(id: string): Promise<ReportRecord | null> {
  if (hasSupabaseConfig()) {
    const reports = await supabaseRequest<
      Array<{
        id: string;
        user_id: string;
        birth_record_id: string;
        status?: ReportRecord["status"];
        created_at: string;
        bazi_data: BaziData;
        astro_data: AstroData;
        ai_content: AIReportContent;
      }>
    >("reports", "GET", undefined, `?id=eq.${id}&limit=1`);

    if (!reports[0]) return null;

    const [user] = await supabaseRequest<Array<ReportRecord["user"]>>(
      "users",
      "GET",
      undefined,
      `?id=eq.${reports[0].user_id}&limit=1`,
    );
    const [birthRecord] = await supabaseRequest<
      Array<ReportRecord["birth_record"]>
    >(
      "birth_records",
      "GET",
      undefined,
      `?id=eq.${reports[0].birth_record_id}&limit=1`,
    );

    return {
      ...reports[0],
      user,
      birth_record: birthRecord,
    };
  }

  const store = await readLocalStore();
  return store.reports.find((report) => report.id === id) ?? null;
}
