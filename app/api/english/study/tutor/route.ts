import { createHash } from "node:crypto";
import { parseTutorRequest, requestTutor, TutorInputError, TutorUnavailableError } from "@/lib/english-study/tutor";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BODY_BYTES = 24000;
const BURST_WINDOW_MS = 60000;
const BURST_REQUESTS = 30;
// Best-effort per-process burst protection only. This is not a persistent user quota.
const buckets = new Map<string, { count: number; expiresAt: number }>();

function json(body: unknown, status = 200, retryAfter?: number) {
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (retryAfter !== undefined) headers["Retry-After"] = String(retryAfter);
  return Response.json(body, { status, headers });
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin || request.headers.get("sec-fetch-site")?.toLowerCase() === "cross-site") return false;
  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    if (originUrl.origin !== origin || !["http:", "https:"].includes(originUrl.protocol)) return false;
    if (origin === requestUrl.origin) return true;
    // Next's development server can canonicalise 127.0.0.1 to localhost in Request.url.
    // The browser's actual Host must still match Origin; this is not a wildcard origin exception.
    const loopback = new Set(["localhost", "127.0.0.1", "[::1]"]);
    return process.env.NODE_ENV === "development"
      && loopback.has(originUrl.hostname)
      && loopback.has(requestUrl.hostname)
      && originUrl.protocol === requestUrl.protocol
      && originUrl.port === requestUrl.port
      && request.headers.get("host")?.toLowerCase() === originUrl.host;
  } catch {
    return false;
  }
}

function retryAfterIfLimited(request: Request): number {
  const ip = (request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "local-anonymous").split(",")[0].trim().slice(0, 100);
  const key = createHash("sha256").update(ip).digest("hex");
  const now = Date.now();
  if (buckets.size >= 4096) {
    for (const [storedKey, bucket] of buckets) if (bucket.expiresAt <= now) buckets.delete(storedKey);
    if (buckets.size >= 4096) {
      const oldest = buckets.keys().next().value;
      if (oldest) buckets.delete(oldest);
    }
  }
  const bucket = buckets.get(key);
  if (!bucket || bucket.expiresAt <= now) {
    buckets.set(key, { count: 1, expiresAt: now + BURST_WINDOW_MS });
    return 0;
  }
  if (bucket.count >= BURST_REQUESTS) return Math.max(1, Math.ceil((bucket.expiresAt - now) / 1000));
  bucket.count += 1;
  return 0;
}

async function readBody(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new TutorInputError("请使用 JSON 格式提交问题。", 415);
  }
  const statedLength = request.headers.get("content-length");
  if (statedLength && Number(statedLength) > MAX_BODY_BYTES) throw new TutorInputError("内容太长，请把问题分开问。", 413);
  if (!request.body) throw new TutorInputError("请先输入问题。");
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let body = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new TutorInputError("内容太长，请把问题分开问。", 413);
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  try {
    return JSON.parse(body);
  } catch {
    throw new TutorInputError("请求内容不完整，请重试。");
  }
}

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return json({ error: "请从当前学习页面提交问题。", code: "ORIGIN_REJECTED", retryable: false }, 403);
    }
    const retryAfter = retryAfterIfLimited(request);
    if (retryAfter) return json({ error: "提问有些密集，稍等片刻再继续。", code: "TOO_MANY_REQUESTS", retryable: true }, 429, retryAfter);
    const input = parseTutorRequest(await readBody(request));
    return json(await requestTutor(input, request.signal));
  } catch (error) {
    if (error instanceof TutorInputError) return json({ error: error.message, code: "INVALID_INPUT", retryable: false }, error.status);
    // Never return raw provider errors, student prompts, environment values or credentials.
    return json({ error: new TutorUnavailableError().message, code: "TUTOR_UNAVAILABLE", retryable: true }, 503, 5);
  }
}
