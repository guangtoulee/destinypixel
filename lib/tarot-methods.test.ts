import assert from "node:assert/strict";
import test from "node:test";
import sitemap from "@/app/sitemap";
import { celestialCopy } from "@/lib/celestial/copy";
import { tarotMethodSlugs } from "@/lib/journal-tarot-methods";
import { getJournalArticle, journalAlternates, journalArticleLocale, journalArticleLocales, journalArticleSchema } from "@/lib/journal";

test("methods advertise only their authored en/zh editions and unsupported locales resolve to English", () => {
  const entries = sitemap();
  for (const slug of tarotMethodSlugs) {
    const article = getJournalArticle(slug)!;
    assert.deepEqual(journalArticleLocales(article), ["en", "zh"]);
    assert.deepEqual(Object.keys(journalAlternates(slug)), ["en", "zh-Hans", "x-default"]);
    assert.equal(journalArticleLocale("ru", article), "en");
    assert.equal(journalArticleLocale("zh-TW", article), "en");
    assert.deepEqual(entries.filter(entry => new URL(entry.url).pathname === `/journal/${slug}`).map(entry => new URL(entry.url).searchParams.get("locale") ?? "en").sort(), ["en", "zh"]);
    for (const locale of ["en", "zh"] as const) {
      assert.equal(journalArticleSchema(article, locale)[0].datePublished, "2026-10-23");
      assert.ok(article.translations[locale].sections.flatMap(section => section.sources ?? []).some(source => source.href === "https://sacred-texts.com/tarot/pkt/pkt0307.htm"));
    }
  }
});

test("the Celtic teaching table uses the tool's actual position order in both languages", () => {
  const article = getJournalArticle("how-to-read-celtic-cross")!;
  for (const locale of ["en", "zh"] as const) {
    const table = article.translations[locale].sections.find(section => section.id === "practice-layout")!.table!;
    assert.deepEqual(table.rows.map(row => row[0].replace(/^\d+\s+/, "")), celestialCopy(locale).positions.celtic);
    assert.equal(table.rows.length, 10);
  }
});

test("journal review preserves a three-way factual comparison and an eight-field template", () => {
  const article = getJournalArticle("how-to-keep-tarot-journal")!;
  for (const locale of ["en", "zh"] as const) {
    const sections = article.translations[locale].sections;
    const table = sections.find(section => section.id === "preserve-and-review")!.table!;
    assert.equal(table.rows.length, 3);
    assert.equal(table.headings.length, 3);
    assert.equal(sections.find(section => section.id === "journal-template")!.steps!.length, 8);
    assert.ok(sections.find(section => section.id === "alternatives"));
    assert.ok(sections.find(section => section.id === "rearrange-separately"));
  }
});
