import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import path from "node:path";
import { calculateDateDayPillar } from "./day-pillar";
import { getDayPillarCards } from "./day-pillar-cards";
import { dayPillarSharePath } from "./day-pillar-share";
import { calculateBaziEngine } from "./engines/bazi";
import { resolveCity } from "./geo/cities";

test("invalid formats and impossible dates are rejected instead of silently normalized", () => {
  for (const date of ["", "2000-1-01", "2000/01/01", "2024-00-01", "2024-13-01", "2024-04-31", "2024-01-00", "2023-02-29", "1900-02-29", "2100-02-29", "2000-01-01T00:00:00Z"]) {
    assert.deepEqual(calculateDateDayPillar(date), { ok: false, error: "invalid-date" }, date);
  }
});

test("Gregorian leap years and the supported birth range are explicit", () => {
  for (const date of ["2000-02-29", "2024-02-29", "1800-01-01", "2100-12-31"]) assert.equal(calculateDateDayPillar(date).ok, true, date);
  for (const date of ["1799-12-31", "2101-01-01"]) assert.deepEqual(calculateDateDayPillar(date), { ok: false, error: "unsupported-year" });
  assert.deepEqual(calculateDateDayPillar("2026-09-12", "2026-09-11"), { ok: false, error: "future-date" });
  assert.equal(calculateDateDayPillar("2026-09-11", "2026-09-11").ok, true);
});

test("known day pillars match the calendar library's published fixtures, including previously missing Ding Hai", () => {
  // lunar-javascript __tests__/Lunar.test.js test22/test23 and EightChar.test.js test4.
  for (const [date, pillar] of [["2012-12-27", "壬戌"], ["2012-12-20", "乙卯"], ["1988-02-02", "丁亥"], ["1982-03-21", "癸卯"]]) {
    assert.deepEqual(calculateDateDayPillar(date), { ok: true, pillar });
  }
});

test("midnight advances the civil-date card and a calibrated report may use the previous solar day", () => {
  assert.deepEqual(calculateDateDayPillar("1988-02-15"), { ok: true, pillar: "庚子" });
  assert.deepEqual(calculateDateDayPillar("1988-02-16"), { ok: true, pillar: "辛丑" });
  assert.deepEqual(calculateDateDayPillar("1982-03-21"), { ok: true, pillar: "癸卯" });
  const full = calculateBaziEngine({ name: "Boundary fixture", birthDate: "1982-03-21", birthTime: "00:10", gender: "female", locale: "en", city: resolveCity("Shijiazhuang")! });
  assert.equal(full.trueSolarTime.date, "1982-03-20");
  assert.equal(full.pillars.day, "壬寅");
});

test("a complete cycle resolves to all sixty available bilingual cards and existing images", () => {
  const observed = new Set<string>();
  for (let day = 0; day < 60; day += 1) {
    const date = new Date(Date.UTC(2000, 0, 1 + day)).toISOString().slice(0, 10);
    const result = calculateDateDayPillar(date);
    assert.ok(result.ok);
    observed.add(result.pillar);
  }
  assert.equal(observed.size, 60);
  for (const locale of ["en", "zh"] as const) {
    const cards = getDayPillarCards(locale);
    assert.equal(cards.length, 60);
    assert.equal(new Set(cards.map((card) => card.slug)).size, 60);
    assert.deepEqual(new Set(cards.map((card) => card.pillar)), observed);
    for (const card of cards) {
      assert.ok(card.name && card.essence && card.growth);
      assert.ok(existsSync(path.join(process.cwd(), "public", card.image)), card.image);
      assert.deepEqual(Object.keys(card).sort(), ["essence", "growth", "image", "name", "pillar", "slug"]);
    }
  }
});

test("share paths allow only a controlled public archetype and locale", () => {
  assert.equal(dayPillarSharePath("en", "gui_mao"), "/day-pillar?pillar=gui_mao");
  assert.equal(dayPillarSharePath("zh", "ding_hai"), "/day-pillar?locale=zh&pillar=ding_hai");
  for (const input of ["1982-03-21", "gui_mao&birthDate=1982-03-21", "https://example.com", "gui_zi", "unknown"]) assert.equal(dayPillarSharePath("zh", input), "/day-pillar?locale=zh");
  for (const card of getDayPillarCards("en")) {
    const url = new URL(dayPillarSharePath("en", card.slug), "https://example.com");
    assert.deepEqual([...url.searchParams.keys()], ["pillar"]);
    assert.equal(url.searchParams.get("pillar"), card.slug);
  }
});
