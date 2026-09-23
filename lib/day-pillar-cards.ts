import { getPillarImagePath, getPillarSlug } from "@/lib/archetype-assets";
import { dayPillarCycle, pillarName } from "./day-pillar-library";
import { pillarPractices } from "./day-pillar-practices";
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
  const language = locale === "zh" || locale === "zh-TW" ? 1 : locale === "ru" ? 2 : 0;
  const localize = (text: string) => locale === "zh-TW" ? toTraditional(text) : text;
  return dayPillarCycle.map((pillar) => {
    const insight = getLocalizedDayPillarInsight(pillar, locale);
    if (!insight) throw new Error(`Missing public day-pillar reading: ${pillar}`);
    return {
    pillar, slug: getPillarSlug(pillar), image: getPillarImagePath(pillar),
    name: pillarName(pillar, locale), essence: insight.personality, growth: localize(pillarPractices[pillar][language]), insight,
    };
  });
}
