import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { loadTarotLearningArticle } from "./tarot-learning/content";
import { tarotLearningMetadata, tarotLearningSitemap } from "./tarot-learning/metadata";
import { editorialUpdate } from "./editorial-updates";

test("Four of Cups source practice preserves the earlier article and synchronized authored scope", async () => {
  for (const locale of ["en", "zh"] as const) {
    const path = `content/tarot/${locale}/four-of-cups.json`;
    const previous = JSON.parse(readFileSync(`content/four-cups-update-20261108/previous/${path}`, "utf8"));
    const current = await loadTarotLearningArticle("four-of-cups", locale);
    assert.ok(current);
    const additions = current.sections.filter(section => ["reversal-source-choice", "reversal-practice"].includes(section.id));
    assert.deepEqual(additions.map(section => [section.id, section.role]), [["reversal-source-choice", "tradition"], ["reversal-practice", "practice"]]);
    assert.deepEqual(current.sections.filter(section => !additions.includes(section)), previous.sections);
    const block = additions.map(section => `## ${section.title}\n\n${section.bodyMarkdown}\n\n`).join("");
    assert.equal(current.articleMarkdown.replace(block, ""), previous.articleMarkdown);
    const allowed = new Set(["sections", "sources", "articleMarkdown", "updatedAt", "editorialRevision"]);
    for (const field of Object.keys(previous).filter(field => !allowed.has(field))) {
      assert.deepEqual((current as unknown as Record<string, unknown>)[field], previous[field], `${locale}/${field}`);
    }
    assert.deepEqual(current.sources.slice(0, -2), previous.sources);
    assert.equal(current.updatedAt, "2026-11-08");
    assert.ok(editorialUpdate("tarot-four-of-cups", locale));
    assert.ok(additions[0].bodyMarkdown.includes("presage"));
    assert.ok(additions[0].bodyMarkdown.includes("Presentiment"));
    assert.equal(readFileSync(`content/four-cups-update-20261108/manuscript-${locale}.md`, "utf8"), current.articleMarkdown + "\n");
  }
});

test("Four of Cups metadata changes only English and Simplified Chinese dates", async () => {
  const entries = tarotLearningSitemap().filter(entry => new URL(entry.url).pathname === "/journal/tarot-four-of-cups");
  assert.equal(entries.length, 4);
  for (const locale of ["en", "zh", "zh-TW", "ru"] as const) {
    const authored = locale === "en" || locale === "zh";
    const expected = authored ? "2026-11-08" : "2026-10-08";
    const article = await loadTarotLearningArticle("four-of-cups", locale);
    assert.equal(article?.updatedAt, expected);
    const entry = entries.find(entry => (new URL(entry.url).searchParams.get("locale") ?? "en") === locale);
    assert.equal(entry?.lastModified, expected);
    const metadata = tarotLearningMetadata(locale, "four-of-cups");
    assert.equal(metadata.alternates?.canonical, `/journal/tarot-four-of-cups${locale === "en" ? "" : `?locale=${locale}`}`);
    assert.equal(editorialUpdate("tarot-four-of-cups", locale) !== undefined, authored);
  }
});
