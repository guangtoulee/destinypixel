import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import type { Metadata } from "next";
import sitemap from "@/app/sitemap";
import revisions from "@/content/encyclopedia-samples-20261011/revisions.json";
import tarotDepth from "@/content/tarot-depth-20261008/revisions.json";
import { editorialModifiedAt, editorialUpdate } from "./editorial-updates";
import { hexagramMetadata, hexagramModifiedAt } from "./hexagram-learning/metadata";
import { hexagramIds } from "./hexagram-learning/identity";
import { hexagramHref } from "./hexagram-learning/paths";
import { journalArticles, journalArticleSchema, journalHref, journalLocales, journalMetadata } from "./journal";
import type { ReportLocale } from "./report-i18n";
import { absoluteUrl } from "./seo";
import { loadTarotLearningArticle } from "./tarot-learning/content";
import { tarotLearningMetadata, tarotLearningModifiedAt } from "./tarot-learning/metadata";
import { tarotLearningIds, tarotLearningSlug } from "./tarot-learning/paths";

const revisedSlugs = ["ding-you-day-pillar", "hexagram-11", "tarot-moon", "tarot-sun"];
const revisedLocales: ReportLocale[] = ["en", "zh"];
const previousDates: Record<string, string> = {
  "ding-you-day-pillar": "2026-10-05",
  "hexagram-11": "2026-10-07",
  "tarot-sun": "2026-10-08",
  "tarot-moon": "2026-10-08",
};
const revisedUrls = new Map(revisedSlugs.flatMap(slug => revisedLocales.map(locale => [absoluteUrl(journalHref(locale, slug)), previousDates[slug]] as const)));
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const isRevised = (slug: string, locale: ReportLocale) => revisedSlugs.includes(slug) && revisedLocales.includes(locale);
const expectedDate = (slug: string, locale: ReportLocale, previous: string) => isRevised(slug, locale) ? "2026-10-11" : previous;
const modifiedTime = (metadata: Metadata) => metadata.openGraph && "modifiedTime" in metadata.openGraph ? metadata.openGraph.modifiedTime : undefined;

// Independently calculated from `git archive 179c14e1f6d5bf19a244adeaef84d13ba79ce4b1`.
// Hash inputs are sorted [url, lastModified ?? null] and [slug, publishedAt, updatedAt].
const baselineSitemapDateHash = "d1ea908353a4e4e5b8fe68467afb0782b68320ddd10b8a9b36ed604e19ed0587";
const baselineJournalDateHash = "597b98f8006544264a40b96da7b537db5f3e11289f2e8acb55194333ade2b0a5";

test("the revision registry and date utility apply only to the four edited zh/en editions", () => {
  assert.equal(revisions.updatedAt, "2026-10-11");
  assert.deepEqual(Object.keys(revisions.articles).sort(), revisedSlugs);
  for (const [slug, article] of Object.entries(revisions.articles)) {
    assert.deepEqual(Object.keys(article.notes).sort(), revisedLocales);
    for (const locale of revisedLocales) assert.ok(article.notes[locale as keyof typeof article.notes].trim(), `${slug}/${locale}: update note missing`);
  }
  const knownSlugs = new Set([...journalArticles.map(article => article.slug), ...hexagramIds, ...tarotLearningIds.map(tarotLearningSlug)]);
  for (const slug of [...knownSlugs, "missing", "__proto__", "constructor", "toString"]) {
    for (const locale of journalLocales) {
      const update = editorialUpdate(slug, locale);
      if (isRevised(slug, locale)) {
        assert.ok(update, `${slug}/${locale}`);
        assert.equal(update.updatedAt, "2026-10-11");
        assert.ok(update.note.trim());
      } else assert.equal(update, undefined, `${slug}/${locale}: unedited edition has an update`);
      assert.equal(editorialModifiedAt(slug, locale, "2026-01-02"), expectedDate(slug, locale, "2026-01-02"), `${slug}/${locale}`);
    }
  }
});

test("the full sitemap changes exactly eight dates and preserves every other baseline URL and date", () => {
  const entries = sitemap();
  assert.equal(entries.length, 982);
  assert.equal(new Set(entries.map(entry => entry.url)).size, entries.length);
  const updated = entries.filter(entry => revisedUrls.has(entry.url));
  assert.deepEqual(updated.map(entry => entry.url).sort(), [...revisedUrls.keys()].sort());
  for (const entry of updated) assert.equal(entry.lastModified, "2026-10-11", entry.url);
  const restoredBaseline = entries.map(entry => [entry.url, revisedUrls.get(entry.url) ?? entry.lastModified ?? null]).sort(([a], [b]) => String(a).localeCompare(String(b)));
  assert.equal(digest(restoredBaseline), baselineSitemapDateHash, "a URL or date outside the eight edited editions changed");
});

test("journal metadata and Article schema use per-language revisions without freshening base publication dates", () => {
  const baselineDates = journalArticles.map(article => [article.slug, article.publishedAt, article.updatedAt]).sort(([a], [b]) => a.localeCompare(b));
  assert.equal(journalArticles.length, 75);
  assert.equal(digest(baselineDates), baselineJournalDateHash, "shared article dates changed instead of applying an edition-specific revision");
  for (const article of journalArticles) {
    for (const locale of journalLocales) {
      const date = expectedDate(article.slug, locale, article.updatedAt);
      const metadata = journalMetadata(locale, article);
      assert.equal(modifiedTime(metadata), date, `${article.slug}/${locale}: Open Graph date`);
      const schema = journalArticleSchema(article, locale)[0];
      assert.equal(schema.dateModified, date, `${article.slug}/${locale}: Article schema date`);
      assert.equal(schema.datePublished, article.publishedAt);
      assert.equal(metadata.alternates?.canonical, journalHref(locale, article.slug));
    }
  }
});

test("all tarot metadata and loaded schema dates retain their previous scope except revised Sun and Moon editions", async () => {
  const depthCards: Record<string, { updatedAt: string; locales: string[] }> = tarotDepth.cards;
  for (const locale of journalLocales) {
    assert.equal(tarotLearningModifiedAt(undefined, locale), "2026-10-08");
    for (const id of tarotLearningIds) {
      const previous = id === "sun" ? "2026-10-08" : depthCards[id]?.locales.includes(locale) ? depthCards[id].updatedAt : "2026-10-07";
      const date = expectedDate(tarotLearningSlug(id), locale, previous);
      assert.equal(tarotLearningModifiedAt(id, locale), date, `${id}/${locale}: sitemap date`);
      const metadata = tarotLearningMetadata(locale, id);
      // Existing Open Graph article dates are emitted only for Sun and depth revisions.
      assert.equal(modifiedTime(metadata), id === "sun" || depthCards[id]?.locales.includes(locale) ? date : undefined, `${id}/${locale}: Open Graph date`);
      const article = await loadTarotLearningArticle(id, locale);
      assert.ok(article);
      // These loaded fields are the Article component's datePublished/dateModified inputs.
      assert.equal(article.updatedAt ?? "2026-10-07", date, `${id}/${locale}: loaded Article date`);
      assert.equal(article.publishedAt ?? "2026-10-07", "2026-10-07", `${id}/${locale}: publication date`);
    }
  }
});

test("hexagram dates revise only Tai zh/en and retain the existing metadata behavior", () => {
  for (const locale of journalLocales) {
    assert.equal(hexagramModifiedAt(undefined, locale), "2026-10-07");
    for (let number = 1; number <= 64; number++) {
      const slug = `hexagram-${String(number).padStart(2, "0")}`;
      assert.equal(hexagramModifiedAt(number, locale), expectedDate(slug, locale, "2026-10-07"), `${slug}/${locale}`);
      const metadata = hexagramMetadata(locale, number);
      assert.equal(metadata.alternates?.canonical, hexagramHref(number, locale));
      assert.equal(modifiedTime(metadata), undefined, `${slug}/${locale}: existing metadata has no article date`);
    }
  }
});

test("Ding You preserves the serialized published Traditional Chinese and Russian editions", () => {
  const article = journalArticles.find(item => item.slug === "ding-you-day-pillar");
  assert.ok(article);
  // Baseline hashes independently calculated from the saved, pre-edit article snapshot.
  // Serialization is exactly JSON.stringify(translation), including section order and links.
  const preservedHashes = {
    "zh-TW": "194703ddb56751eb099a681af28d3ce38da4e81e27fb81a04d7898604fc70417",
    ru: "3e96f2a4315f57e2a9aa0b748b030cb0e3b7de1803b958d8baa141b3a8a7b8ff",
  };
  for (const locale of ["zh-TW", "ru"] as const) {
    assert.equal(digest(article.translations[locale]), preservedHashes[locale], `${locale}: published edition changed`);
    assert.equal(editorialUpdate(article.slug, locale), undefined);
    assert.equal(journalArticleSchema(article, locale)[0].dateModified, "2026-10-05");
  }
});
