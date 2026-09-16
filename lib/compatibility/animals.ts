import names from "./animal-names.json";
import { getLocalizedDayPillarInsight } from "@/lib/day-pillar-insights-localized";
import { toTraditional } from "@/lib/journal-locales";
import type { ReportLocale } from "@/lib/report-i18n";
// Chinese titles follow the 2026-09-14 artwork manifest; English titles were
// read from the actual new card artwork. No old tree/landscape aliases here.
export function animalPortrait(pillar: string, locale: ReportLocale) {
  const title = (names as Record<string, { en: string; zh: string; ru: string }>)[pillar];
  const insight = getLocalizedDayPillarInsight(pillar, locale);
  if (!title || !insight) throw new Error("Animal portrait unavailable");
  return { name: locale === "zh-TW" ? toTraditional(title.zh) : title[locale], headline: insight.headline, personality: insight.personality, love: insight.love };
}
