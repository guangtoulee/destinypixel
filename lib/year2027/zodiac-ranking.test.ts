import assert from "node:assert/strict";
import test from "node:test";
import { rankedZodiacEntries, zodiacRankingCategories, zodiacRankingEntries } from "./zodiac-ranking";

test("the guide includes every year branch once, with bilingual prompts and 1–5 accessible values", () => {
  assert.equal(zodiacRankingEntries.length, 12);
  assert.equal(new Set(zodiacRankingEntries.map(entry => entry.id)).size, 12);
  assert.equal(zodiacRankingEntries.map(entry => entry.branch).join(""), "子丑寅卯辰巳午未申酉戌亥");
  for (const entry of zodiacRankingEntries) {
    for (const locale of ["en", "zh"] as const) {
      assert.ok(entry.name[locale] && entry.relation[locale] && entry.basis[locale]);
      for (const category of zodiacRankingCategories) {
        assert.ok(Number.isInteger(entry.ratings[category].stars));
        assert.ok(entry.ratings[category].stars >= 1 && entry.ratings[category].stars <= 5);
        assert.ok(entry.ratings[category].note[locale]);
      }
    }
  }
});

test("sorting preserves all animals, shared competition ranks, and original cycle order within each tie", () => {
  for (const category of zodiacRankingCategories) {
    const sorted = rankedZodiacEntries(category);
    assert.equal(new Set(sorted.map(entry => entry.id)).size, 12);
    sorted.forEach((entry, index) => {
      assert.equal(entry.rank, sorted.filter(other => other.ratings[category].stars > entry.ratings[category].stars).length + 1);
      assert.equal(entry.tied, sorted.filter(other => other.ratings[category].stars === entry.ratings[category].stars).length > 1);
      if (index) assert.ok(sorted[index - 1].ratings[category].stars >= entry.ratings[category].stars);
      if (index && sorted[index - 1].ratings[category].stars === entry.ratings[category].stars) {
        assert.ok(zodiacRankingEntries.findIndex(other => other.id === sorted[index - 1].id) < zodiacRankingEntries.findIndex(other => other.id === entry.id));
      }
    });
  }
  assert.deepEqual(rankedZodiacEntries("overall").slice(0, 3).map(entry => [entry.id, entry.rank]), [["rabbit", 1], ["horse", 1], ["pig", 1]]);
});

test("a Goat birth-animal year is never penalized and branch labels do not become a bad-luck total", () => {
  const goat = zodiacRankingEntries.find(entry => entry.id === "goat")!;
  for (const category of zodiacRankingCategories) assert.equal(goat.ratings[category].stars, 3);
  for (const id of ["rat", "ox", "dog"]) {
    const entry = zodiacRankingEntries.find(item => item.id === id)!;
    assert.equal(entry.ratings.overall.stars, 3);
    assert.ok(Object.values(entry.ratings).some(rating => rating.stars === 2));
  }
});
