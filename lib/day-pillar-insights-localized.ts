import { getDayPillarInsight, type DayPillarInsight } from "./day-pillar-insights";
import { toTraditional } from "./journal-locales";
import { contentLocale, type ReportLocale } from "./report-i18n";

// Run localization before passing public readings to interactive components.
export function getLocalizedDayPillarInsight(pillar: string, locale: ReportLocale): DayPillarInsight | null {
  const reading = getDayPillarInsight(pillar, contentLocale(locale));
  if (!reading || locale !== "zh-TW") return reading;
  return Object.fromEntries(Object.entries(reading).map(([key, value]) => [key, toTraditional(value)])) as DayPillarInsight;
}
