import { Solar } from "lunar-javascript";

export type DayPillarDateError = "invalid-date" | "unsupported-year" | "future-date";
export type DayPillarResult = { ok: true; pillar: string } | { ok: false; error: DayPillarDateError };

/** Public Gregorian-date preview only. No birth time, location or inferred timezone. */
export function calculateDateDayPillar(value: string, today?: string): DayPillarResult {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { ok: false, error: "invalid-date" };
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1800 || year > 2100) return { ok: false, error: "unsupported-year" };
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) {
    return { ok: false, error: "invalid-date" };
  }
  if (today && value > today) return { ok: false, error: "future-date" };
  // Noon anchors the supplied calendar date; it is never presented as a birth time.
  // getDayInGanZhi changes at civil midnight. Full reports separately calibrate solar time.
  return { ok: true, pillar: Solar.fromYmdHms(year, month, day, 12, 0, 0).getLunar().getDayInGanZhi() };
}
