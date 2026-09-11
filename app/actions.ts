"use server";

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { createInitialAIReportContent, type Gender } from "@/lib/ai/report";
import {
  assertBaziEngineCalibration,
  calculateBaziEngine,
} from "@/lib/engines/bazi";
import { calculateAstrologyEngine } from "@/lib/engines/astrology";
import { resolveCity } from "@/lib/geo/cities";
import { pillarsDB, type PillarProfile } from "@/lib/pillars";
import { currentMember, newGuestToken, guestHash, guestCookieName } from "@/lib/commerce/access";
import { databaseRequest } from "@/lib/commerce/database";
import { limitCommerceAction } from "@/lib/commerce/rate-limit";
import { BirthTimeValidationError } from "@/lib/engines/time";
import { MemberAuthError } from "@/lib/member-auth-security";
import { normalizeReportLocale } from "@/lib/report-i18n";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createFusionReportAction(formData: FormData) {
  assertBaziEngineCalibration();

  const name = readString(formData, "name") || "Guest";
  const genderValue = readString(formData, "gender");
  const gender: Gender = genderValue === "male" ? "male" : "female";
  const locale = normalizeReportLocale(readString(formData, "locale"));
  const birthDate = readString(formData, "birthDate");
  const birthTime = readString(formData, "birthTime");
  const place = readString(formData, "birthPlace");
  const city = resolveCity(place);

  if (!birthDate || !birthTime || !city || name.length > 100 || birthDate.length > 10 || birthTime.length > 5) {
    redirect(`/?locale=${locale}&error=missing-birth-data#report`);
  }

  const input = {
    name,
    gender,
    locale,
    birthDate,
    birthTime,
    city,
  };
  let id: string;
  try {
    const bazi = calculateBaziEngine(input);
    const astro = calculateAstrologyEngine(input, bazi.trueSolarTime);
    const profile = (pillarsDB as Record<string, PillarProfile>)[bazi.pillars.day];
    const aiContent = createInitialAIReportContent({ bazi, astro, profile, gender, locale });
    const member = await currentMember();
    const headerStore = await headers();
    const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    await limitCommerceAction("create-report", member?.id || ip, 12);
    const guestToken = member ? null : newGuestToken();
    id = await databaseRequest<string>("rpc/destiny_create_private_report", { method: "POST", body: {
      p_member: member?.id ?? null, p_guest_hash: guestToken ? guestHash(guestToken) : null,
      p_payload: { birth: { name, gender, locale, birthDate, birthTime, birthPlace: city.label, latitude: city.latitude, longitude: city.longitude, timezone: city.timezone, trueSolarTime: bazi.trueSolarTime.isoLike }, bazi, astro, aiContent },
    } });
    if (guestToken) (await cookies()).set(guestCookieName(id), guestToken, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  } catch (error) {
    const code = error instanceof BirthTimeValidationError ? error.code : error instanceof MemberAuthError && error.status === 429 ? "rate-limited" : "report-storage-unavailable";
    redirect(`/?locale=${locale}&error=${code}#report`);
  }
  redirect(`/report/${id}?locale=${locale}`);
}
