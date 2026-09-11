import "server-only";

export class StoreUnavailableError extends Error {
  constructor() { super("Account storage is temporarily unavailable. Please try again later."); }
}

export function databaseConfigured() {
  return Boolean((process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function databaseRequest<T>(resource: string, options: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown; prefer?: string } = {}): Promise<T> {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new StoreUnavailableError();
  try {
    const response = await fetch(`${url}/rest/v1/${resource}`, {
      method: options.method || "GET", cache: "no-store", signal: AbortSignal.timeout(12_000),
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: options.prefer || "return=representation" },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    if (!response.ok) throw new StoreUnavailableError();
    if (response.status === 204) return undefined as T;
    return await response.json() as T;
  } catch { throw new StoreUnavailableError(); }
}

export async function databaseCount(table: string, query = "") {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new StoreUnavailableError();
  try {
    const response = await fetch(`${url}/rest/v1/${table}?select=id${query}`, { method: "HEAD", cache: "no-store", signal: AbortSignal.timeout(12_000), headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact", Range: "0-0" } });
    if (!response.ok) throw new StoreUnavailableError();
    const count = Number(response.headers.get("content-range")?.split("/")[1]);
    if (!Number.isSafeInteger(count)) throw new StoreUnavailableError();
    return count;
  } catch { throw new StoreUnavailableError(); }
}
