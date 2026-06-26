"use server";

import { redirect } from "next/navigation";
import { createInitialAIReportContent, type Gender } from "@/lib/ai/report";
import {
  assertBaziEngineCalibration,
  calculateBaziEngine,
} from "@/lib/engines/bazi";
import { calculateAstrologyEngine } from "@/lib/engines/astrology";
import { resolveCity } from "@/lib/geo/cities";
import { pillarsDB, type PillarProfile } from "@/lib/pillars";
import { createReportRecord } from "@/lib/db/repository";
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

  redirect(`/report/${id}?locale=${locale}`);
}
