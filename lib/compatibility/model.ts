import { calculateBaziEngine } from "@/lib/engines/bazi";
import { calculateAstrologyEngine } from "@/lib/engines/astrology";
import { stemElements } from "@/lib/core/mappings";
import { cities } from "@/lib/geo/cities";
import { BirthTimeValidationError, type BirthInput } from "@/lib/engines/time";
import { normalizeReportLocale, type ReportLocale } from "@/lib/report-i18n";

export const dimensionIds = ["personality", "communication", "affection", "rhythm"] as const;
export type Dimension = typeof dimensionIds[number];
export type PersonInput = { birthDate: string; birthTime: string; cityId: string };
export type CompatibilityInput = { people: [PersonInput, PersonInput]; locale: ReportLocale; consent: true; mode: "calculate" | "interpret" };
export type SkyElement = "fire" | "earth" | "air" | "water";
export type Placement = { body: string; sign: string; signCn: string; longitude: number; element: SkyElement };
export type Portrait = { pillars: { year: string; month: string; day: string; hour: string }; dayElement: string; elements: Record<string, number>; planets: Placement[] };
export type DimensionResult = { id: Dimension; score: number; tone: "flow" | "contrast" | "mixed"; bazi: number; sky: number };
export type CompatibilityResult = { version: "relationship-v1"; score: number; people: [Portrait, Portrait]; dimensions: DimensionResult[] };

export function parseCompatibilityInput(value: Record<string, unknown>): CompatibilityInput {
  const locale = normalizeReportLocale(typeof value.locale === "string" ? value.locale : "en");
  if (value.consent !== true || !Array.isArray(value.people) || value.people.length !== 2 || !["calculate", "interpret"].includes(String(value.mode))) throw new Error("INVALID_INPUT");
  const people = value.people.map((p: unknown) => {
    if (!p || typeof p !== "object") throw new Error("INVALID_INPUT");
    const { birthDate, birthTime, cityId } = p as Record<string, unknown>;
    if (typeof birthDate !== "string" || typeof birthTime !== "string" || typeof cityId !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || !/^\d{2}:\d{2}$/.test(birthTime) || !cities.some(c => c.id === cityId)) throw new Error("INVALID_INPUT");
    if (birthDate > new Date().toISOString().slice(0, 10)) throw new BirthTimeValidationError("invalid-date-time", locale);
    return { birthDate, birthTime, cityId };
  }) as [PersonInput, PersonInput];
  return { people, locale, consent: true, mode: value.mode as CompatibilityInput["mode"] };
}

const skyElements: SkyElement[] = ["fire", "earth", "air", "water"];
function portrait(person: PersonInput, locale: ReportLocale): Portrait {
  // Gender affects luck-cycle direction only. No luck-cycle or gender inference is used here.
  const input: BirthInput = { ...person, name: "", gender: "female", locale, city: cities.find(c => c.id === person.cityId)! };
  const bazi = calculateBaziEngine(input);
  const astro = calculateAstrologyEngine(input, bazi.trueSolarTime);
  return { pillars: bazi.pillars, dayElement: stemElements[bazi.dayMaster], elements: bazi.elementBalance,
    planets: astro.placements.filter(p => ["Sun", "Moon", "Mercury", "Venus", "Mars"].includes(p.body)).map(p => ({ body: p.body, sign: p.sign, signCn: p.signCn, longitude: p.longitude, element: skyElements[Math.floor(p.longitude / 30) % 4] })) };
}
export function planet(p: Portrait, body: string) { return p.planets.find(x => x.body === body)!; }
const cycle = ["Wood", "Fire", "Earth", "Metal", "Water"];
function elementAffinity(a: string, b: string) {
  const gap = Math.abs(cycle.indexOf(a) - cycle.indexOf(b));
  return gap === 0 ? .82 : gap === 1 || gap === 4 ? .95 : .35;
}
// Editorial weights for symbolic comparison, not an empirical relationship predictor.
// 60 + 40 * affinity deliberately expresses a positive 60–100 reference scale.
export function skyAffinity(a: Placement, b: Placement) {
  const difference = Math.abs(a.longitude - b.longitude);
  const angle = Math.min(difference, 360 - difference);
  const aspects = [{ angle: 0, value: .90 }, { angle: 60, value: .90 }, { angle: 90, value: .25 }, { angle: 120, value: .98 }, { angle: 180, value: .40 }];
  const closest = aspects.map(x => ({ ...x, orb: Math.abs(angle - x.angle) })).sort((x, y) => x.orb - y.orb)[0];
  const compatible = (a.element === "fire" && b.element === "air") || (a.element === "air" && b.element === "fire") || (a.element === "water" && b.element === "earth") || (a.element === "earth" && b.element === "water");
  const base = a.element === b.element ? .80 : compatible ? .78 : .45;
  return closest.orb <= 6 ? base + (closest.value - base) * (1 - closest.orb / 12) : base;
}
export function combinePortraits(a: Portrait, b: Portrait): CompatibilityResult {
  const day = elementAffinity(a.dayElement, b.dayElement);
  const keys = Object.keys(a.elements);
  const totalA = Object.values(a.elements).reduce((x, y) => x + y, 0);
  const totalB = Object.values(b.elements).reduce((x, y) => x + y, 0);
  const balance = 1 - keys.reduce((sum, k) => sum + Math.abs(a.elements[k] / totalA - b.elements[k] / totalB), 0) / 2;
  const same = (body: string) => skyAffinity(planet(a, body), planet(b, body));
  const cross = (x: string, y: string) => (skyAffinity(planet(a, x), planet(b, y)) + skyAffinity(planet(a, y), planet(b, x))) / 2;
  const signals = [same("Sun"), same("Mercury"), (same("Venus") + cross("Venus", "Moon")) / 2, (same("Moon") + same("Mars")) / 2];
  const dimensions = dimensionIds.map((id, i): DimensionResult => {
    const bazi = i === 3 ? balance : day;
    const affinity = .3 * bazi + .7 * signals[i];
    return { id, score: Math.max(60, Math.min(100, Math.round(60 + 40 * affinity))), tone: affinity >= .74 ? "flow" : affinity < .52 ? "contrast" : "mixed", bazi: Math.round(bazi * 100), sky: Math.round(signals[i] * 100) };
  });
  return { version: "relationship-v1", people: [a, b], score: Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / 4), dimensions };
}
export function calculateCompatibility(input: CompatibilityInput) { return combinePortraits(portrait(input.people[0], input.locale), portrait(input.people[1], input.locale)); }
