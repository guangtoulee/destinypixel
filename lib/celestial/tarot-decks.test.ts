import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { defaultTarotDeck } from "./tarot-decks";
import { tarotCards } from "./tarot-meanings";

test("default artwork covers every stable card identity with an attributed existing file", () => {
  const cards = tarotCards("en");
  const sources = JSON.parse(readFileSync(`public${defaultTarotDeck.attribution}`, "utf8"));
  assert.equal(cards.length, 78);
  assert.equal(new Set(cards.map(c => c.id)).size, 78);
  for (const card of cards) {
    assert.ok(existsSync(`public${card.image}`), card.id);
    assert.ok(sources.some((source: { id: string; source: string }) => source.id === card.id && source.source.startsWith("https://commons.wikimedia.org/")), card.id);
  }
});
test("changing artwork leaves every localized meaning and stable identity intact", () => {
  for (const locale of ["en", "zh", "zh-TW", "ru"] as const) {
    const original = tarotCards(locale);
    const custom = tarotCards(locale, { id: "example", attribution: "/example.json", faces: {[original[0].id]: "/example.webp"} });
    assert.equal(custom[0].image, "/example.webp");
    assert.equal(custom[1].image, original[1].image);
    assert.deepEqual(custom.map(({image: _image, ...card}) => card), original.map(({image: _image, ...card}) => card));
  }
});

test("artwork comparison offers only actual faces and never substitutes another edition", async () => {
  const { artworkEditionsForCard, tarotArtworkEditions } = await import("./tarot-decks");
  const id = tarotCards("en")[0].id;
  assert.equal(tarotArtworkEditions.length, 1);
  assert.equal(artworkEditionsForCard(id)[0].id, defaultTarotDeck.id);
  assert.deepEqual(artworkEditionsForCard("unknown-card"), []);
  const alternate = {...tarotArtworkEditions[0], id: "test-art-only", faces: {[id]: "/fixture.webp"}};
  assert.equal(artworkEditionsForCard(id, [...tarotArtworkEditions, alternate]).length, 2);
  assert.equal(artworkEditionsForCard(tarotCards("en")[1].id, [...tarotArtworkEditions, alternate]).length, 1);
});
