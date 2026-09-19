import assert from "node:assert/strict";
import test from "node:test";
import { getStickSign, stickTypeOrder, stickTypeTotals } from "./catalog";
import { classicStickSeeds } from "./classic-source";

test("every Russian sign uses Russian text, including generated and classic fallbacks", () => {
  for (const type of stickTypeOrder) {
    for (let number = 1; number <= stickTypeTotals[type]; number += 1) {
      const sign = getStickSign(type, number, "ru");
      for (const key of ["level", "title", "poem", "plain", "advice", "sourceNote"] as const) {
        const text = sign[key].replaceAll("DestinyPixel", "");
        assert.match(text, /\p{Script=Cyrillic}/u, `${type} ${number} ${key} has Russian text`);
        assert.doesNotMatch(text, /\p{Script=Latin}/u, `${type} ${number} ${key} has no English fragments`);
      }
    }
  }
});

test("Russian fallback localization preserves the corresponding Chinese classic verse", () => {
  const chinese = getStickSign("guandi", 1, "zh");
  assert.equal(chinese.poem, classicStickSeeds.guandi?.[1].poem);
  assert.equal(chinese.level, classicStickSeeds.guandi?.[1].level);
  const russian = getStickSign("guandi", 1, "ru");
  assert.equal(russian.number, chinese.number);
  assert.equal(russian.total, chinese.total);
  assert.equal(russian.isSeeded, chinese.isSeeded);
});
