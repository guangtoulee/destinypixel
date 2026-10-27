import assert from "node:assert/strict";
import test from "node:test";
import catalog from "./catalog.json";
import { normalizeTarotSearch, tarotCardMatches } from "./search";
import { searchTarotCardIds, tarotCardSearchEntries } from "./search-index";

const sorted = (values: readonly string[]) => [...values].sort();
const aces = ["ace-of-wands", "ace-of-cups", "ace-of-swords", "ace-of-pentacles"];

test("every published card name in all four languages resolves to its own guide", () => {
  assert.equal(tarotCardSearchEntries.length, 78);
  assert.equal(new Set(tarotCardSearchEntries.map(card => card.cardId)).size, 78);
  for (const cards of Object.values(catalog)) {
    for (const card of cards) assert.deepEqual(searchTarotCardIds(card.nameLocalized), [card.cardId], card.nameLocalized);
  }
});

test("practical English, simplified and traditional aliases find the same ace without other ranks", () => {
  for (const query of ["Ace of Pentacles", "ace pentacle", "one coin", "1 coins", "星币一", "钱币一", "星幣一", "錢幣王牌", "一星币", "钱币 Ace", "PENTACLES ACE", "ace-of-pentacles", "ＡＣＥ　ＯＦ　ＰＥＮＴＡＣＬＥＳ"]) {
    assert.deepEqual(searchTarotCardIds(query), ["ace-of-pentacles"], query);
  }
  for (const query of ["ace", "one", "1", "一", "王牌"]) assert.deepEqual(sorted(searchTarotCardIds(query)), sorted(aces), query);
  for (const query of ["coins", "coin", "pentacles", "pentacle", "钱币", "錢幣", "星幣", "星币"]) {
    assert.deepEqual(searchTarotCardIds(query), catalog.en.filter(card => card.suit === "pentacles").map(card => card.cardId), query);
  }
});

test("rank boundaries keep one and ten separate, while court names remain precise", () => {
  for (const [query, id] of [
    ["1 wands", "ace-of-wands"], ["10 wands", "ten-of-wands"], ["权杖一", "ace-of-wands"], ["权杖十", "ten-of-wands"],
    ["星币二", "two-of-pentacles"], ["2 coins", "two-of-pentacles"], ["queen swords", "queen-of-swords"], ["寶劍王后", "queen-of-swords"],
    ["judgment", "judgement"], ["wheel of fortune", "wheel"], ["吊人", "hanged-man"], ["倒懸者", "hanged-man"],
  ]) assert.deepEqual(searchTarotCardIds(query), [id], query);
  assert.deepEqual(searchTarotCardIds("0"), []);
  assert.deepEqual(searchTarotCardIds("11"), []);
});

test("whole Latin and Cyrillic words prevent misleading matches and search ignores meaning prose", () => {
  assert.deepEqual(searchTarotCardIds("Star"), ["star"]);
  assert.deepEqual(searchTarotCardIds("星星"), ["star"]);
  assert.deepEqual(searchTarotCardIds("ЗВЕЗДА"), ["star"]);
  assert.deepEqual(searchTarotCardIds("Шут"), ["fool"]);
  for (const query of ["space", "palace", "sunset", "someone", "working", "Звездочка", "不存在的牌名", "resources", "responsibility", "not-a-card"]) {
    assert.deepEqual(searchTarotCardIds(query), [], query);
  }
  assert.equal(tarotCardMatches(["The Sun"], "sunset"), false);
  assert.equal(tarotCardMatches(["Ten of Wands"], "1"), false);
  assert.equal(tarotCardMatches(["Ace of Pentacles"], "ace swords"), false);
});

test("empty and punctuation-only search restore all cards with consistent Unicode normalization", () => {
  for (const query of ["", "  \t\n", "...—、"]) assert.equal(searchTarotCardIds(query).length, 78, JSON.stringify(query));
  assert.equal(normalizeTarotSearch("  ＡＣＥ—of\nPentacles！ "), "ace of pentacles");
});
