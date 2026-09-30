import { Temporal } from "@js-temporal/polyfill";
import { Solar } from "lunar-javascript";
import { planetaryPositionsAt } from "@/lib/engines/astrology";
import { BirthTimeValidationError } from "@/lib/engines/time";
import { cities } from "@/lib/geo/cities";
import { branchElements, stemElements, type ElementName } from "@/lib/core/mappings";
import type { ReportLocale } from "@/lib/report-i18n";

export type DateSky = { body: string; signs: { sign: string; signCn: string }[] };

export function civilDateWindow(birthDate: string, cityId: string, locale: ReportLocale) {
  try {
    const date = Temporal.PlainDate.from(birthDate);
    if (date.year < 1800 || date.year > 2100) throw new Error();
    const zone = cities.find(c => c.id === cityId)?.timezone;
    if (!zone) throw new Error();
    // Temporal selects the first real instant of a civil day, including midnight
    // transitions. A wholly skipped date must not become the following date.
    const start = date.toZonedDateTime(zone);
    const end = date.add({ days: 1 }).toZonedDateTime(zone);
    if (!start.toPlainDate().equals(date) || end.epochMilliseconds <= start.epochMilliseconds) throw new Error();
    return { date, start: start.epochMilliseconds, end: end.epochMilliseconds };
  } catch { throw new BirthTimeValidationError("invalid-date-time", locale); }
}

function termPillars(ms: number) {
  // Same fixed UTC+08 ephemeris clock as the full BaZi engine, not a local noon.
  const t = new Date(ms + 8 * 3600_000);
  const lunar = Solar.fromYmdHms(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate(), t.getUTCHours(), t.getUTCMinutes(), t.getUTCSeconds()).getLunar();
  return { year: lunar.getYearInGanZhiExact(), month: lunar.getMonthInGanZhiExact() };
}

export function dateOnlyChart(birthDate: string, cityId: string, locale: ReportLocale) {
  const { date, start, end } = civilDateWindow(birthDate, cityId, locale);
  const first = termPillars(start), last = termPillars(end - 1);
  // Civil-date portrait only. No claim to know the person's corrected solar day.
  const ec = Solar.fromYmdHms(date.year, date.month, date.day, 0, 0, 0).getLunar().getEightChar();
  ec.setSect(2);
  const pillars = { year: first.year === last.year ? first.year : null, month: first.month === last.month ? first.month : null, day: ec.getDay(), hour: null };
  const elements: Record<ElementName, number> = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  for (const pillar of Object.values(pillars)) if (pillar) {
    elements[stemElements[pillar[0] as keyof typeof stemElements]]++;
    elements[branchElements[pillar[1] as keyof typeof branchElements]]++;
  }
  const bodies = ["Sun", "Moon", "Mercury", "Venus", "Mars"];
  const sky = new Map<string, Map<string, { sign: string; signCn: string }>>(bodies.map(body => [body, new Map()]));
  // Hourly samples plus both boundaries cover 23/24/25-hour civil days. These
  // are explicitly approximate possibilities, never precise natal placements or
  // aspect inputs; brief retrograde boundary excursions may fall between samples.
  for (let ms = start; ; ms = Math.min(ms + 3600_000, end - 1)) {
    for (const p of planetaryPositionsAt(new Date(ms), bodies)) sky.get(p.body)!.set(p.sign, { sign: p.sign, signCn: p.signCn });
    if (ms === end - 1) break;
  }
  const dateSky: DateSky[] = bodies.map(body => ({ body, signs: [...sky.get(body)!.values()] }));
  return { pillars, elements, dateSky, dayElement: stemElements[pillars.day[0] as keyof typeof stemElements] };
}
