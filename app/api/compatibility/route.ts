import { createHash } from "node:crypto";
import { assertMutation, readBody, privateJson } from "@/lib/commerce/http";
import { limitCommerceAction } from "@/lib/commerce/rate-limit";
import { MemberAuthError } from "@/lib/member-auth-security";
import { BirthTimeValidationError } from "@/lib/engines/time";
import { calculateCompatibility, parseCompatibilityInput } from "@/lib/compatibility/model";
import { generatePairReading, type PairReading } from "@/lib/compatibility/ai";
export const runtime = "nodejs";
export const maxDuration = 60;
// A short local CPU guard supplements durable Supabase limits for paid-provider calls.
const buckets = new Map<string, { count: number; expires: number }>();
const readings = new Map<string, { value: Promise<PairReading>; expires: number }>();
function guard(ip: string) {
  const now = Date.now();
  for (const [k, v] of buckets) if (v.expires <= now) buckets.delete(k);
  const old = buckets.get(ip);
  if (old && old.count >= 20) throw new MemberAuthError("RATE_LIMITED", "Please wait.", 429, 60);
  if (!old && buckets.size >= 5000) throw new MemberAuthError("RATE_LIMITED", "Please wait.", 429, 60);
  buckets.set(ip, { count: (old?.count || 0) + 1, expires: old?.expires || now + 60_000 });
}
export async function POST(request: Request) {
  try {
    assertMutation(request);
    const body = await readBody(request);
    const ip = (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown").slice(0, 100);
    guard(ip);
    const input = parseCompatibilityInput(body);
    const result = calculateCompatibility(input);
    if (input.mode === "calculate") return privateJson({ result });
    try {
      // Fail closed for provider spend if the shared rate-limit store is unavailable.
      await limitCommerceAction("compatibility-ai", ip, 6);
      const now = Date.now();
      for (const [k, v] of readings) if (v.expires <= now) readings.delete(k);
      const cacheKey = createHash("sha256").update(JSON.stringify([input.locale, result])).digest("hex");
      const cached = readings.get(cacheKey);
      if (cached) return privateJson({ reading: await cached.value, status: "ready" });
      await limitCommerceAction("compatibility-ai-global", "daily", 300, 86400);
      const value = generatePairReading(result, input.locale);
      if (readings.size >= 128) readings.delete(readings.keys().next().value!);
      readings.set(cacheKey, { value, expires: now + 15 * 60_000 });
      try { return privateJson({ reading: await value, status: "ready" }); }
      catch (error) { readings.delete(cacheKey); throw error; }
    } catch (error) {
      // No raw provider output, credentials or birth details in logs or responses.
      const limited = error instanceof MemberAuthError && error.status === 429;
      return privateJson({ status: limited ? "limited" : "unavailable", reading: null });
    }
  } catch (error) {
    if (error instanceof BirthTimeValidationError) return privateJson({ code: error.code, error: error.message }, 400);
    if (error instanceof MemberAuthError) return privateJson({ code: error.code }, error.status, error.status === 429 ? { "Retry-After": "60" } : {});
    return privateJson({ code: "INVALID_INPUT" }, 400);
  }
}
