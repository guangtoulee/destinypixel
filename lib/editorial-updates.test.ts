import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import type { Metadata } from "next";
import sitemap from "@/app/sitemap";
import revisions from "@/content/encyclopedia-samples-20261011/revisions.json";
import peopleRevisions from "@/content/day-pillar-people/revisions.json";
import previousEditions from "@/content/day-pillar-people/previous-editions.json";
import secondBatchRevisions from "@/content/day-pillar-people/second-batch-revisions.json";
import secondBatchPreviousEditions from "@/content/day-pillar-people/second-batch-previous-editions.json";
import tarotDepth from "@/content/tarot-depth-20261008/revisions.json";
import queenSwordsRevision from "@/content/queen-swords-update-20261023/revisions.json";
import hangedManRevision from "@/content/hanged-man-update-20261024/revisions.json";
import starRevision from "@/content/star-update-20261025/revisions.json";
import { editorialModifiedAt, editorialUpdate } from "./editorial-updates";
import { hexagramMetadata, hexagramModifiedAt } from "./hexagram-learning/metadata";
import { hexagramIds } from "./hexagram-learning/identity";
import { hexagramHref } from "./hexagram-learning/paths";
import { journalArticles, journalArticleLocales, journalArticleSchema, journalHref, journalLocales, journalMetadata } from "./journal";
import type { ReportLocale } from "./report-i18n";
import { absoluteUrl } from "./seo";
import { loadTarotLearningArticle } from "./tarot-learning/content";
import { tarotLearningMetadata, tarotLearningModifiedAt } from "./tarot-learning/metadata";
import { tarotLearningIds, tarotLearningSlug } from "./tarot-learning/paths";

const sampleSlugs = ["ding-you-day-pillar", "hexagram-11", "tarot-moon", "tarot-sun"];
const peopleSlugs = ["bing-chen", "bing-shen", "bing-yin", "bing-zi", "ding-chou", "ding-hai", "ding-mao", "ding-si", "ding-wei", "ding-you", "geng-shen", "jia-chen", "jia-wu", "jia-xu", "jia-yin", "ren-xu", "xin-mao", "xin-you", "yi-mao", "yi-si"].map(slug => `${slug}-day-pillar`);
const peopleRevisionSlugs = [...peopleSlugs, "day-pillars"].sort();
const firstRevisedSlugs = [...new Set([...sampleSlugs, ...peopleRevisionSlugs])].sort();
const secondPeopleSlugs = ["bing-wu", "bing-xu", "geng-chen", "geng-wu", "geng-xu", "geng-yin", "geng-zi", "gui-chou", "gui-hai", "gui-mao", "gui-si", "gui-wei", "gui-you", "ji-chou", "ji-hai", "ji-mao", "ji-si", "ji-wei", "ji-you", "jia-shen", "ren-chen", "ren-shen", "ren-wu", "ren-yin", "ren-zi", "wu-chen", "wu-shen", "wu-wu", "wu-xu", "wu-yin", "wu-zi", "xin-chou", "xin-hai", "xin-si", "xin-wei", "yi-hai", "yi-wei", "yi-you"].map(slug => `${slug}-day-pillar`);
const secondRevisionSlugs = [...secondPeopleSlugs, "day-pillars"].sort();
const revisedSlugs = [...new Set([...firstRevisedSlugs, ...secondRevisionSlugs])].sort();
const revisedLocales: ReportLocale[] = ["en", "zh"];
const previousDates: Record<string, string> = {
  ...Object.fromEntries(journalArticles.filter(article => peopleSlugs.includes(article.slug)).map(article => [article.slug, article.updatedAt])),
  "day-pillars": "2026-09-23",
  "ding-you-day-pillar": "2026-10-05",
  "hexagram-11": "2026-10-07",
  "tarot-sun": "2026-10-08",
  "tarot-moon": "2026-10-08",
};
const revisedUrls = new Map(firstRevisedSlugs.flatMap(slug => revisedLocales.map(locale => [absoluteUrl(journalHref(locale, slug)), previousDates[slug]] as const)));
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const isRevised = (slug: string, locale: ReportLocale) => slug === "tarot-queen-of-swords" || (slug === "tarot-star" || slug === "tarot-hanged-man" || revisedSlugs.includes(slug)) && revisedLocales.includes(locale);
const expectedDate = (slug: string, locale: ReportLocale, previous: string) => slug === "tarot-queen-of-swords" ? "2026-10-23" : !isRevised(slug, locale) ? previous : slug === "tarot-star" ? "2026-10-25" : slug === "tarot-hanged-man" ? "2026-10-24" : secondRevisionSlugs.includes(slug) ? "2026-10-12" : "2026-10-11";
const modifiedTime = (metadata: Metadata) => metadata.openGraph && "modifiedTime" in metadata.openGraph ? metadata.openGraph.modifiedTime : undefined;

// Membership independently checked against `git archive 179c14e1f6d5bf19a244adeaef84d13ba79ce4b1`:
// 60 day-pillar articles and these 15 other articles. New articles must never be
// counted as part of the old 75-article/982-URL receipts.
const historicalJournalSlugs = new Set([
  ...peopleSlugs, ...secondPeopleSlugs, "jia-zi-day-pillar", "yi-chou-day-pillar",
  "bazi-vs-chinese-zodiac-compatibility", "compatibility-without-birth-time", "crystal-bracelet-care",
  "five-element-bracelet-design", "five-elements-relationship-compatibility", "fortune-stick-number-and-edition",
  "how-to-ask-fortune-sticks", "how-to-connect-three-tarot-cards", "how-to-read-three-card-tarot",
  "pamela-colman-smith-tarot-artist", "prepare-birth-date-time-place", "tarot-from-game-to-occult-traditions",
  "what-is-a-day-pillar", "why-the-four-fours-differ", "yuelao-love-fortune-conversation",
]);
const historicalArticles = journalArticles.filter(article => historicalJournalSlugs.has(article.slug));
const laterArticles = journalArticles.filter(article => !historicalJournalSlugs.has(article.slug));
// These two existing articles received later shared-date revisions. Restore only
// their old updatedAt for the historical hash; assert their real current dates below.
const laterSharedJournalDates: Record<string, { previous: string; current: string }> = {
  "bazi-vs-chinese-zodiac-compatibility": { previous: "2026-09-20", current: "2026-10-13" },
  "five-elements-relationship-compatibility": { previous: "2026-09-23", current: "2026-10-20" },
};
const laterPublicEntries = new Map([
  [absoluteUrl("/2027"), null], [absoluteUrl("/2027?locale=zh"), null],
  [absoluteUrl("/taisui"), "2026-10-21"], [absoluteUrl("/taisui?locale=zh"), "2026-10-21"],
]);
const laterJournalUrls = new Set(laterArticles.flatMap(article => journalArticleLocales(article).map(locale => absoluteUrl(journalHref(locale, article.slug)))));
const afterFirstDates = new Map([
  ...journalLocales.map(locale => [absoluteUrl(journalHref(locale)), "2026-10-09"] as const),
  ...Object.entries(laterSharedJournalDates).flatMap(([slug, dates]) => journalLocales.map(locale => [absoluteUrl(journalHref(locale, slug)), dates.previous] as const)),
  ...journalLocales.map(locale => [absoluteUrl(journalHref(locale, "tarot-queen-of-swords")), "2026-10-08"] as const),
  ...revisedLocales.map(locale => [absoluteUrl(journalHref(locale, "tarot-hanged-man")), "2026-10-08"] as const),
  ...revisedLocales.map(locale => [absoluteUrl(journalHref(locale, "tarot-star")), "2026-10-08"] as const),
]);

// Project today's sitemap onto the independently captured first-rollout scope.
// Only named later additions/revisions and second-batch dates are removed; every
// other URL/date still participates in the original, unchanged receipt hashes.
const secondBaselineArticles: Record<string, Record<ReportLocale, { dateModified: string }>> = secondBatchPreviousEditions.articles;
const beforeSecondDates = new Map(secondRevisionSlugs.flatMap(slug => revisedLocales.map(locale => [absoluteUrl(journalHref(locale, slug)), slug === "day-pillars" ? "2026-10-11" : secondBaselineArticles[slug][locale].dateModified] as const)));
const firstBatchSitemap = () => sitemap()
  .filter(entry => !laterPublicEntries.has(entry.url) && !laterJournalUrls.has(entry.url))
  .map(entry => {
    const previous = beforeSecondDates.get(entry.url) ?? afterFirstDates.get(entry.url);
    return previous ? { ...entry, lastModified: previous } : entry;
  });

// Independently calculated from `git archive 179c14e1f6d5bf19a244adeaef84d13ba79ce4b1`.
// Hash inputs are sorted [url, lastModified ?? null] and [slug, publishedAt, updatedAt].
const baselineSitemapDateHash = "d1ea908353a4e4e5b8fe68467afb0782b68320ddd10b8a9b36ed604e19ed0587";
const baselineJournalDateHash = "597b98f8006544264a40b96da7b537db5f3e11289f2e8acb55194333ade2b0a5";

test("revision registries apply only to their actually edited language editions", () => {
  assert.equal(revisions.updatedAt, "2026-10-11");
  assert.deepEqual(Object.keys(revisions.articles).sort(), sampleSlugs);
  assert.equal(peopleRevisions.baseCommit, "f54c97098cfed468d7e3145bd730c41c0b27fdb7");
  assert.equal(peopleRevisions.updatedAt, "2026-10-11");
  assert.deepEqual(Object.keys(peopleRevisions.articles).sort(), peopleRevisionSlugs);
  assert.equal(firstRevisedSlugs.length, 24);
  assert.equal(secondBatchRevisions.baseCommit, "05c507ce378351b3248168daa900396bddd8458a");
  assert.equal(secondBatchRevisions.updatedAt, "2026-10-12");
  assert.deepEqual(Object.keys(secondBatchRevisions.articles).sort(), secondRevisionSlugs);
  assert.equal(secondPeopleSlugs.length, 38);
  assert.equal(revisedSlugs.length, 62);
  for (const registry of [revisions, peopleRevisions, secondBatchRevisions]) {
    for (const [slug, article] of Object.entries(registry.articles)) {
      assert.deepEqual(Object.keys(article.notes).sort(), revisedLocales);
      for (const locale of revisedLocales) assert.ok(article.notes[locale as keyof typeof article.notes].trim(), `${slug}/${locale}: update note missing`);
    }
  }
  assert.equal(queenSwordsRevision.baseCommit, "d22c4bfcce43e8ee9fe6358c1d347e00af1a1c5e");
  assert.equal(queenSwordsRevision.updatedAt, "2026-10-23");
  assert.deepEqual(Object.keys(queenSwordsRevision.articles), ["tarot-queen-of-swords"]);
  assert.deepEqual(Object.keys(queenSwordsRevision.articles["tarot-queen-of-swords"].notes).sort(), [...journalLocales].sort());
  for (const locale of journalLocales) assert.ok(queenSwordsRevision.articles["tarot-queen-of-swords"].notes[locale].trim());
  assert.equal(hangedManRevision.updatedAt, "2026-10-24");
  assert.deepEqual(Object.keys(hangedManRevision.articles), ["tarot-hanged-man"]);
  assert.deepEqual(Object.keys(hangedManRevision.articles["tarot-hanged-man"].notes).sort(), revisedLocales);
  for (const locale of revisedLocales) assert.ok(hangedManRevision.articles["tarot-hanged-man"].notes[locale as keyof typeof hangedManRevision.articles["tarot-hanged-man"]["notes"]].trim());
  assert.equal(starRevision.baseCommit, "892ecef8aa32f0c97bb4200548a943db5fffa81b");
  assert.equal(starRevision.updatedAt, "2026-10-25");
  assert.deepEqual(Object.keys(starRevision.articles), ["tarot-star"]);
  assert.deepEqual(Object.keys(starRevision.articles["tarot-star"].notes).sort(), revisedLocales);
  for (const locale of revisedLocales) assert.ok(starRevision.articles["tarot-star"].notes[locale as keyof typeof starRevision.articles["tarot-star"]["notes"]].trim());
  const knownSlugs = new Set([...journalArticles.map(article => article.slug), "day-pillars", ...hexagramIds, ...tarotLearningIds.map(tarotLearningSlug)]);
  for (const slug of [...knownSlugs, "missing", "__proto__", "constructor", "toString"]) {
    for (const locale of journalLocales) {
      const update = editorialUpdate(slug, locale);
      if (isRevised(slug, locale)) {
        assert.ok(update, `${slug}/${locale}`);
        assert.equal(update.updatedAt, expectedDate(slug, locale, "2026-01-02"));
        assert.ok(update.note.trim());
      } else assert.equal(update, undefined, `${slug}/${locale}: unedited edition has an update`);
      assert.equal(editorialModifiedAt(slug, locale, "2026-01-02"), expectedDate(slug, locale, "2026-01-02"), `${slug}/${locale}`);
    }
  }
});

test("the historical first-rollout projection still changes exactly 48 of its original 982 URL dates", () => {
  const entries = firstBatchSitemap();
  assert.equal(entries.length, 982);
  assert.equal(new Set(entries.map(entry => entry.url)).size, entries.length);
  const updated = entries.filter(entry => revisedUrls.has(entry.url));
  assert.equal(updated.length, 48);
  assert.deepEqual(updated.map(entry => entry.url).sort(), [...revisedUrls.keys()].sort());
  for (const entry of updated) assert.equal(entry.lastModified, "2026-10-11", entry.url);
  const restoredBaseline = entries.map(entry => [entry.url, revisedUrls.get(entry.url) ?? entry.lastModified ?? null]).sort(([a], [b]) => String(a).localeCompare(String(b)));
  assert.equal(digest(restoredBaseline), baselineSitemapDateHash, "a URL or date outside the edited editions changed");
});

test("the historical first birthday rollout still changes exactly 40 sitemap dates", () => {
  const baselineArticles: Record<string, Record<ReportLocale, { dateModified: string }>> = previousEditions.articles;
  const priorDates = new Map(peopleRevisionSlugs.flatMap(slug => revisedLocales.map(locale => [absoluteUrl(journalHref(locale, slug)), slug === "day-pillars" ? "2026-09-23" : baselineArticles[slug][locale].dateModified] as const)));
  const entries = firstBatchSitemap();
  const changes = entries.filter(entry => priorDates.has(entry.url) && entry.lastModified !== priorDates.get(entry.url));
  assert.equal(changes.length, 40);
  assert.ok(changes.every(entry => !new URL(entry.url).pathname.endsWith("ding-you-day-pillar")), "Ding You was already updated on the same date");
  const restored = entries.map(entry => [entry.url, priorDates.get(entry.url) ?? entry.lastModified ?? null]).sort(([a], [b]) => String(a).localeCompare(String(b)));
  assert.equal(digest(restored), previousEditions.sitemapDateHash, "a URL or date outside this birthday rollout changed");
});

test("the original 75 journal date receipt stays intact while current editions use their actual dates", () => {
  assert.equal(historicalJournalSlugs.size, 75);
  assert.deepEqual(historicalArticles.map(article => article.slug).sort(), [...historicalJournalSlugs].sort());
  const baselineDates = historicalArticles.map(article => [article.slug, article.publishedAt, laterSharedJournalDates[article.slug]?.previous ?? article.updatedAt]).sort(([a], [b]) => a.localeCompare(b));
  assert.equal(digest(baselineDates), baselineJournalDateHash, "shared article dates changed instead of applying an edition-specific revision");
  const entries = new Map(sitemap().map(entry => [entry.url, entry.lastModified ?? null]));
  for (const [url, date] of laterPublicEntries) assert.equal(entries.get(url), date, `${url}: current later route`);
  for (const [slug, dates] of Object.entries(laterSharedJournalDates)) {
    assert.equal(journalArticles.find(article => article.slug === slug)?.updatedAt, dates.current, `${slug}: current shared revision`);
  }
  for (const article of laterArticles) assert.ok(article.publishedAt > "2026-10-09", `${article.slug}: later article misclassified as historical`);
  const currentDirectoryDate = journalArticles.map(article => article.updatedAt).sort().at(-1);
  for (const locale of journalLocales) assert.equal(entries.get(absoluteUrl(journalHref(locale))), currentDirectoryDate, `${locale}: current journal directory date`);
  for (const article of journalArticles) {
    for (const locale of journalArticleLocales(article)) {
      const date = expectedDate(article.slug, locale, article.updatedAt);
      assert.equal(entries.get(absoluteUrl(journalHref(locale, article.slug))), date, `${article.slug}/${locale}: current sitemap date`);
      const metadata = journalMetadata(locale, article);
      assert.equal(modifiedTime(metadata), date, `${article.slug}/${locale}: Open Graph date`);
      const schema = journalArticleSchema(article, locale)[0];
      assert.equal(schema.dateModified, date, `${article.slug}/${locale}: Article schema date`);
      assert.equal(schema.datePublished, article.publishedAt);
      assert.equal(metadata.alternates?.canonical, journalHref(locale, article.slug));
    }
  }
});

test("all tarot metadata and loaded schema dates retain each revision's actual language scope", async () => {
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
