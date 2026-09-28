import { fullAspects, type NatalChart, planetSymbols } from "./astrology";
import { parseCelestialReading, type CelestialReading } from "./ai";
import { parseNatalReading } from "./natal-reading-ai";
import { natalReadingTargets, type NatalReading } from "./natal-reading";
import { celestialCopy } from "./copy";
import { initialTable, parseTarotInput, spreadSizes, type TableState } from "./tarot";
import type { ReportLocale } from "@/lib/report-i18n";

export const recordPrefix = "celestial-v1:";
export const recordLimitBytes = 256_000;
export const validRecordId = (id: unknown): id is string => typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
export type CelestialSnapshot = { version: 1; locale: ReportLocale } & (
  { kind: "astrology"; chart: NatalChart; reading: NatalReading | null } |
  { kind: "tarot"; table: TableState; question: string; reading: CelestialReading | null }
);
export type CelestialRecordSummary = { id: string; kind: "astrology" | "tarot"; locale: ReportLocale; createdAt: string; updatedAt: string; hasReading: boolean; memberId?: string };
function invalid(): never { throw new Error("INVALID_RECORD"); }
function obj(v: unknown): Record<string, unknown> { if (!v || typeof v !== "object" || Array.isArray(v)) return invalid(); return v as Record<string, unknown>; }
function num(v: unknown, min: number, max: number): number { if (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max) return invalid(); return v; }
function bool(v: unknown): boolean { if (typeof v !== "boolean") return invalid(); return v; }
function str(v: unknown, max: number): string { if (typeof v !== "string" || v.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v)) return invalid(); return v; }
function integer(v: unknown, max: number) { const n = num(v, 0, max); if (!Number.isInteger(n)) return invalid(); return n; }
// Reconstruct a bounded, typed snapshot; never spread browser data into database rows.
export function parseCelestialSnapshot(raw: unknown): CelestialSnapshot {
  const s = obj(raw);
  if (s.version !== 1 || !["en", "zh", "zh-TW", "ru"].includes(String(s.locale))) return invalid();
  const locale = s.locale as ReportLocale;
  if (s.kind === "astrology") {
    const v = obj(s.chart), names = Object.keys(planetSymbols);
    if (!Array.isArray(v.placements) || v.placements.length !== 10 || !Array.isArray(v.houses) || v.houses.length !== 12 || v.houseSystem !== "whole-sign") return invalid();
    const placements = v.placements.map((p, i) => {
      const q = obj(p); if (q.body !== names[i]) return invalid();
      return { body: names[i], bodyCn: str(q.bodyCn, 30), longitude: num(q.longitude, 0, 359.999999999), sign: str(q.sign, 30), signCn: str(q.signCn, 30), degreeInSign: num(q.degreeInSign, 0, 30), house: integer(q.house, 12) || invalid(), retrograde: bool(q.retrograde), speed: num(q.speed, -100, 100) };
    });
    const ascendant = num(v.ascendant, 0, 359.999999999), first = Math.floor(ascendant / 30) * 30;
    const houses = v.houses.map((h, i) => { if (h !== (first + i * 30) % 360) return invalid(); return Number(h); });
    const elements = [0, 0, 0, 0];
    for (const p of placements) {
      if (p.house !== ((Math.floor(p.longitude / 30) - Math.floor(first / 30) + 12) % 12) + 1) return invalid();
      elements[Math.floor(p.longitude / 30) % 4]++;
    }
    const utc = str(v.utc, 40), timezone = str(v.timezone, 80);
    if (!Number.isFinite(Date.parse(utc))) return invalid();
    const chart: NatalChart = { placements, ascendant, midheaven: num(v.midheaven, 0, 359.999999999), houses, aspects: fullAspects(placements), elements, utc, timezone, latitude: num(v.latitude, -90, 90), longitude: num(v.longitude, -180, 180), houseSystem: "whole-sign" };
    const reading = s.reading === null ? null : parseNatalReading(JSON.stringify(s.reading), natalReadingTargets(chart, celestialCopy(locale), locale).map(t => t.id), locale);
    return { version: 1, kind: "astrology", locale, chart, reading };
  }
  if (s.kind !== "tarot") return invalid();
  const v = obj(s.table);
  if (!["free", "spread"].includes(String(v.mode)) || !Object.hasOwn(spreadSizes, String(v.spread)) || !Array.isArray(v.deck) || !Array.isArray(v.cards) || !v.cards.length || v.cards.length + v.deck.length !== 78) return invalid();
  const spread = v.spread as TableState["spread"], mode = v.mode as TableState["mode"], ids = new Set(initialTable().deck.map(c => c.id)), seen = new Set<string>(), slots = new Set<number>();
  const card = (raw: unknown) => { const c = obj(raw), id = str(c.id, 40); if (!ids.has(id) || seen.has(id)) return invalid(); seen.add(id); return { id, reversed: bool(c.reversed) }; };
  const deck = v.deck.map(card), cards = v.cards.map(raw => { const c = obj(raw), base = card(c), slot = integer(c.slot, mode === "free" ? 77 : spreadSizes[spread] - 1); if (slots.has(slot)) return invalid(); slots.add(slot); return { ...base, slot, revealed: bool(c.revealed), x: num(c.x, 0, 100), y: num(c.y, 0, 100), rotation: num(c.rotation, -360, 360) }; }).sort((a,b)=>a.slot-b.slot);
  const table: TableState = { mode, spread, deck, cards }, question = str(s.question, 500);
  const reading = s.reading === null ? null : parseCelestialReading(JSON.stringify(s.reading));
  if (reading) { if (cards.some(c => !c.revealed)) return invalid(); parseTarotInput({ mode, spread, cards, question }); }
  return { version: 1, kind: "tarot", locale, table, question, reading };
}
export async function readRecordBody(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) return invalid();
  if (Number(request.headers.get("content-length") || 0) > recordLimitBytes) throw new Error("RECORD_TOO_LARGE");
  const reader = request.body?.getReader(); if (!reader) return invalid();
  const chunks: Uint8Array[] = []; let size = 0;
  try { while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > recordLimitBytes) { await reader.cancel(); throw new Error("RECORD_TOO_LARGE"); } chunks.push(value); } } finally { reader.releaseLock(); }
  const buffer = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
  return obj(JSON.parse(new TextDecoder().decode(buffer)));
}
