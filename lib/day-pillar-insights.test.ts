import assert from "node:assert/strict";
import test from "node:test";
import { getDayPillarCards } from "./day-pillar-cards";
import { getDayPillarInsight } from "./day-pillar-insights";
import { calculateDateDayPillar } from "./day-pillar";
import { toTraditional } from "./journal-locales";

test("a complete calendar cycle has distinct public readings in all four editions", () => {
  for (const locale of ["en", "zh", "zh-TW", "ru"] as const) {
    const cards = getDayPillarCards(locale);
    assert.equal(cards.length, 60);
    assert.equal(new Set(cards.map(card => card.insight.headline)).size, 60);
    for (let day = 0; day < 60; day++) {
      const result = calculateDateDayPillar(new Date(Date.UTC(2000, 0, 1 + day)).toISOString().slice(0, 10));
      assert.ok(result.ok);
      const card = cards.find(card => card.pillar === result.pillar);
      assert.ok(card);
      assert.deepEqual(Object.keys(card.insight).sort(), ["career", "headline", "love", "personality"]);
      for (const value of Object.values(card.insight)) {
        assert.ok(value.trim(), `${locale}/${card.pillar}`);
        assert.doesNotMatch(value, /TODO|undefined|\*\*|家暴潜质|双重人格|强迫症|guaranteed wealth/i);
        if (locale === "en") assert.doesNotMatch(value, /[\u3400-\u9fff]|[\u0400-\u04ff]/);
        if (locale === "ru") { assert.match(value, /[\u0400-\u04ff]/); assert.doesNotMatch(value, /[\u3400-\u9fff]/); }
        if (locale === "zh-TW") assert.equal(value, toTraditional(value));
      }
      // Keep the public payload an explicit allowlist, independent of paid profile fields.
      assert.deepEqual(Object.keys(card).sort(), ["essence", "growth", "image", "insight", "name", "pillar", "slug"]);
    }
  }
});

test("workbook identities map by stem-branch, without renaming the established English brand", () => {
  const cards = getDayPillarCards("en");
  assert.equal(cards.find(card => card.pillar === "甲子")?.name, "The Oceanic Sequoia");
  assert.match(getDayPillarInsight("戊寅", "zh")!.headline, /扛事/);
  assert.match(getDayPillarInsight("癸卯", "en")!.headline, /Gentleness/);
  assert.equal(getDayPillarInsight("甲丑", "en"), null);
});
