"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createInitialAIReportContent, type Gender } from "@/lib/ai/report";
import {
  assertBaziEngineCalibration,
  calculateBaziEngine,
} from "@/lib/engines/bazi";
import { calculateAstrologyEngine } from "@/lib/engines/astrology";
import { resolveCity } from "@/lib/geo/cities";
import { pillarsDB, type PillarProfile } from "@/lib/pillars";
import {
  createReportRecord,
  hasPersistentReportStore,
} from "@/lib/db/repository";
import {
  encodeReportDraft,
  getReportDraftCookieName,
} from "@/lib/report-draft";
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

  if (!birthDate || !birthTime || !city) {
    redirect(`/?locale=${locale}&error=missing-birth-data#birth`);
  }

  const input = {
    name,
    gender,
    locale,
    birthDate,
    birthTime,
    city,
  };
  const bazi = calculateBaziEngine(input);
  const astro = calculateAstrologyEngine(input, bazi.trueSolarTime);
  const profile = (pillarsDB as Record<string, PillarProfile>)[
    bazi.pillars.day
  ];
  const aiContent = createInitialAIReportContent({
    bazi,
    astro,
    profile,
    gender,
    locale,
  });
  const id = await createReportRecord({
    input,
    bazi,
    astro,
    aiContent,
  });
  const hasPersistentStore = hasPersistentReportStore();
  const encodedDraft = hasPersistentStore ? "" : encodeReportDraft(input);

  if (encodedDraft) {
    const cookieStore = await cookies();

    cookieStore.set(getReportDraftCookieName(id), encodedDraft, {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  const draftQuery = encodedDraft
    ? `&draft=${encodeURIComponent(encodedDraft)}`
    : "";

  redirect(`/report/${id}?locale=${locale}${draftQuery}`);
}
