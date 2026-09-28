import "server-only";
import { createHash } from "node:crypto";
import { privateJson } from "@/lib/commerce/http";
import { limitCommerceAction } from "@/lib/commerce/rate-limit";
import { MemberAuthError } from "@/lib/member-auth-security";
import { generateCelestialReading, type CelestialReading } from "./ai";
import { generateNatalReading, type NatalReadingPayload } from "./natal-reading-ai";
import type { NatalReading } from "./natal-reading";
import type { ReportLocale } from "@/lib/report-i18n";
const buckets = new Map<string, { count: number; expires: number }>();
const readings = new Map<
  string,
  { value: Promise<CelestialReading | NatalReading>; expires: number }
>();
export function celestialGuard(request: Request) {
  const ip = (
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"
    ).slice(0, 100),
    now = Date.now();
  for (const [key, v] of buckets) if (v.expires < now) buckets.delete(key);
  const old = buckets.get(ip);
  if ((old && old.count >= 30) || (!old && buckets.size >= 5000))
    throw new MemberAuthError("RATE_LIMITED", "Please wait.", 429, 60);
  buckets.set(ip, {
    count: (old?.count || 0) + 1,
    expires: old?.expires || now + 60000,
  });
  return ip;
}
export async function celestialInterpret(
  kind: "astrology" | "tarot",
  data: unknown,
  locale: ReportLocale,
  ip: string,
) {
  try {
    await limitCommerceAction(`celestial-ai`, ip, 8);
    const now = Date.now();
    for (const [key, v] of readings) if (v.expires < now) readings.delete(key);
    const key = createHash("sha256")
      .update(JSON.stringify([kind, locale, data]))
      .digest("hex");
    let value = readings.get(key)?.value;
    if (!value) {
      await limitCommerceAction("celestial-ai-global", "daily", 300, 86400);
      value = kind === "astrology" ? generateNatalReading(data as NatalReadingPayload, locale) : generateCelestialReading(kind, data, locale);
      if (readings.size >= 128) readings.delete(readings.keys().next().value!);
      readings.set(key, { value, expires: now + 600000 });
    }
    try {
      return privateJson({ status: "ready", reading: await value });
    } catch (e) {
      readings.delete(key);
      throw e;
    }
  } catch (error) {
    return privateJson({
      reading: null,
      status:
        error instanceof MemberAuthError && error.status === 429
          ? "limited"
          : "unavailable",
    });
  }
}
export function celestialError(error: unknown) {
  return privateJson(
    { code: error instanceof MemberAuthError ? error.code : "INVALID_INPUT" },
    error instanceof MemberAuthError ? error.status : 400,
  );
}
