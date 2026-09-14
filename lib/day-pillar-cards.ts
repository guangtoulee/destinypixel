import { getPillarImagePath, getPillarSlug } from "@/lib/archetype-assets";
import { pillarsDB } from "@/lib/pillars";
import { getLocalizedDayPillarInsight } from "./day-pillar-insights-localized";
import type { DayPillarInsight } from "./day-pillar-insights";
import type { ReportLocale } from "./report-i18n";
import { toTraditional } from "./journal-locales";

export type DayPillarLocale = "en" | "zh";
export type DayPillarCard = {
  pillar: string;
  slug: string;
  image: string;
  name: string;
  essence: string;
  growth: string;
  insight: DayPillarInsight;
};

/** Public editorial fields only. Purchased/generated report data never enters this projection. */
export function getDayPillarCards(locale: ReportLocale): DayPillarCard[] {
  const language = locale === "zh" || locale === "zh-TW" ? "cn" : "en";
  const localize = (text: string) => locale === "zh-TW" ? toTraditional(text) : text;
  return Object.entries(pillarsDB).map(([pillar, profile]) => {
    const insight = getLocalizedDayPillarInsight(pillar, locale);
    if (!insight) throw new Error(`Missing public day-pillar reading: ${pillar}`);
    return {
    pillar, slug: getPillarSlug(pillar), image: getPillarImagePath(pillar),
    name: localize(profile.name[language]), essence: locale === "ru" ? insight.personality : localize(profile.essence[language]), growth: locale === "ru" ? "" : localize(profile.growth[language]), insight,
    };
  });
}
