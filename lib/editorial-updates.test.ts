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
import questionScopeRevision from "@/content/three-card-question-scope-20261030/revisions.json";
import interpretationFitRevision from "@/content/three-card-interpretation-fit-20261107/revisions.json";
import eightSwordsRevision from "@/content/eight-swords-update-20261102/revisions.json";
import sevenCupsRevision from "@/content/seven-cups-update-20261103/revisions.json";
import twoSwordsRevision from "@/content/two-swords-update-20261106/revisions.json";
import kingPentaclesRevision from "@/content/king-pentacles-update-20261105/revisions.json";
import judgementRevision from "@/content/judgement-update-20261103/revisions.json";
import moonRevision from "@/content/moon-update-20261103/revisions.json";
import sunRevision from "@/content/sun-update-20261103/revisions.json";
import towerRevision from "@/content/tower-update-20261104/revisions.json";
import devilRevision from "@/content/devil-update-20261104/revisions.json";
import temperanceRevision from "@/content/temperance-update-20261105/revisions.json";
import worldRevision from "@/content/world-update-20261106/revisions.json";
import deathRevision from "@/content/death-update-20261107/revisions.json";
import hangedManPollackRevision from "@/content/hanged-man-update-20261108/revisions.json";
import justiceRevision from "@/content/justice-update-20261109/revisions.json";
import twoPentaclesPlayRevision from "@/content/two-pentacles-play-20261110/revisions.json";
import wheelRevision from "@/content/wheel-update-20261110/revisions.json";
import hermitRevision from "@/content/hermit-update-20261111/revisions.json";
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
const isHermitZh = (slug: string, locale: ReportLocale) => slug === "tarot-hermit" && locale === "zh";
const isWheelZh = (slug: string, locale: ReportLocale) => slug === "tarot-wheel" && locale === "zh";
const isJusticeZh = (slug: string, locale: ReportLocale) => slug === "tarot-justice" && locale === "zh";
const isHangedManPollackZh = (slug: string, locale: ReportLocale) => slug === "tarot-hanged-man" && locale === "zh";
const isDeathZh = (slug: string, locale: ReportLocale) => slug === "tarot-death" && locale === "zh";
const isWorldZh = (slug: string, locale: ReportLocale) => slug === "tarot-world" && locale === "zh";
const isTemperanceZh = (slug: string, locale: ReportLocale) => slug === "tarot-temperance" && locale === "zh";
const isDevilZh = (slug: string, locale: ReportLocale) => slug === "tarot-devil" && locale === "zh";
const isTowerZh = (slug: string, locale: ReportLocale) => slug === "tarot-tower" && locale === "zh";
const isJudgementZh = (slug: string, locale: ReportLocale) => slug === "tarot-judgement" && locale === "zh";
const isMoonZh = (slug: string, locale: ReportLocale) => slug === "tarot-moon" && locale === "zh";
const isSunZh = (slug: string, locale: ReportLocale) => slug === "tarot-sun" && locale === "zh";
const isRevised = (slug: string, locale: ReportLocale) => isHermitZh(slug, locale) || isWheelZh(slug, locale) || isJusticeZh(slug, locale) || isDeathZh(slug, locale) || isWorldZh(slug, locale) || isTemperanceZh(slug, locale) || isDevilZh(slug, locale) || isTowerZh(slug, locale) || isJudgementZh(slug, locale) || slug === "tarot-queen-of-swords" || (slug === "tarot-two-of-pentacles" || slug === "tarot-two-of-swords" || slug === "tarot-king-of-pentacles" || slug === "tarot-seven-of-cups" || slug === "tarot-eight-of-swords" || slug === "how-to-read-three-card-tarot" || slug === "tarot-star" || slug === "tarot-hanged-man" || revisedSlugs.includes(slug)) && revisedLocales.includes(locale);
const expectedDate = (slug: string, locale: ReportLocale, previous: string) => isHermitZh(slug, locale) ? "2026-11-11" : slug === "tarot-two-of-pentacles" && revisedLocales.includes(locale) ? "2026-11-10" : isWheelZh(slug, locale) ? "2026-11-10" : isJusticeZh(slug, locale) ? "2026-11-09" : isHangedManPollackZh(slug, locale) ? "2026-11-08" : isDeathZh(slug, locale) ? "2026-11-07" : isWorldZh(slug, locale) ? "2026-11-06" : isTemperanceZh(slug, locale) ? "2026-11-05" : isDevilZh(slug, locale) || isTowerZh(slug, locale) ? "2026-11-04" : isJudgementZh(slug, locale) || isMoonZh(slug, locale) || isSunZh(slug, locale) ? "2026-11-03" : slug === "tarot-queen-of-swords" ? "2026-10-23" : !isRevised(slug, locale) ? previous : slug === "tarot-two-of-swords" ? "2026-11-06" : slug === "tarot-king-of-pentacles" ? "2026-11-05" : slug === "tarot-seven-of-cups" ? "2026-11-03" : slug === "tarot-eight-of-swords" ? "2026-11-02" : slug === "how-to-read-three-card-tarot" ? "2026-11-07" : slug === "tarot-star" ? "2026-10-25" : slug === "tarot-hanged-man" ? "2026-10-24" : secondRevisionSlugs.includes(slug) ? "2026-10-12" : "2026-10-11";
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
  ...revisedLocales.map(locale => [absoluteUrl(journalHref(locale, "how-to-read-three-card-tarot")), "2026-10-02"] as const),
  ...revisedLocales.map(locale => [absoluteUrl(journalHref(locale, "tarot-eight-of-swords")), "2026-10-08"] as const),
  ...revisedLocales.map(locale => [absoluteUrl(journalHref(locale, "tarot-seven-of-cups")), "2026-10-08"] as const),
  ...revisedLocales.map(locale => [absoluteUrl(journalHref(locale, "tarot-king-of-pentacles")), "2026-10-08"] as const),
  ...revisedLocales.map(locale => [absoluteUrl(journalHref(locale, "tarot-two-of-swords")), "2026-10-08"] as const),
  ...revisedLocales.map(locale => [absoluteUrl(journalHref(locale, "tarot-two-of-pentacles")), "2026-10-08"] as const),
  [absoluteUrl(journalHref("zh", "tarot-judgement")), "2026-10-08"] as const,
  [absoluteUrl(journalHref("zh", "tarot-tower")), "2026-10-08"] as const,
  [absoluteUrl(journalHref("zh", "tarot-devil")), "2026-10-08"] as const,
  [absoluteUrl(journalHref("zh", "tarot-temperance")), "2026-10-08"] as const,
  [absoluteUrl(journalHref("zh", "tarot-world")), "2026-10-08"] as const,
  [absoluteUrl(journalHref("zh", "tarot-death")), "2026-10-08"] as const,
  [absoluteUrl(journalHref("zh", "tarot-justice")), "2026-10-08"] as const,
  [absoluteUrl(journalHref("zh", "tarot-wheel")), "2026-10-08"] as const,
  [absoluteUrl(journalHref("zh", "tarot-hermit")), "2026-10-08"] as const,
  [absoluteUrl(journalHref("zh", "tarot-moon")), "2026-10-11"] as const,
  [absoluteUrl(journalHref("zh", "tarot-sun")), "2026-10-11"] as const,
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
  assert.equal(questionScopeRevision.baseCommit, "d969aedab73a5764525a7234a1fe2e9bd20aa6c8");
  assert.equal(questionScopeRevision.updatedAt, "2026-10-30");
  assert.deepEqual(Object.keys(questionScopeRevision.articles), ["how-to-read-three-card-tarot"]);
  assert.deepEqual(Object.keys(questionScopeRevision.articles["how-to-read-three-card-tarot"].notes).sort(), revisedLocales);
  assert.equal(interpretationFitRevision.baseCommit, "52b457f7bf7c6a7e6f7e753407ab26f7b695a08f");
  assert.equal(interpretationFitRevision.updatedAt, "2026-11-07");
  assert.deepEqual(Object.keys(interpretationFitRevision.articles), ["how-to-read-three-card-tarot"]);
  assert.deepEqual(Object.keys(interpretationFitRevision.articles["how-to-read-three-card-tarot"].notes).sort(), revisedLocales);
  assert.equal(eightSwordsRevision.baseCommit, "7c162a22012d8909b8b8146df573c9d36e16d4b5");
  assert.equal(eightSwordsRevision.updatedAt, "2026-11-02");
  assert.deepEqual(Object.keys(eightSwordsRevision.articles), ["tarot-eight-of-swords"]);
  assert.deepEqual(Object.keys(eightSwordsRevision.articles["tarot-eight-of-swords"].notes).sort(), revisedLocales);
  for (const locale of revisedLocales) assert.ok(eightSwordsRevision.articles["tarot-eight-of-swords"].notes[locale as "en" | "zh"].trim());
  assert.equal(sevenCupsRevision.baseCommit, "8302ab6f9ac19cf0c8729c8f1bbec8b7368e4fe0");
  assert.equal(sevenCupsRevision.updatedAt, "2026-11-03");
  assert.deepEqual(Object.keys(sevenCupsRevision.articles), ["tarot-seven-of-cups"]);
  assert.deepEqual(Object.keys(sevenCupsRevision.articles["tarot-seven-of-cups"].notes).sort(), revisedLocales);
  for (const locale of revisedLocales) assert.ok(sevenCupsRevision.articles["tarot-seven-of-cups"].notes[locale as "en" | "zh"].trim());
  assert.equal(twoSwordsRevision.baseCommit, "d8e059ed1a895e409c625865b64909126566dd82");
  assert.equal(twoSwordsRevision.updatedAt, "2026-11-06");
  assert.deepEqual(Object.keys(twoSwordsRevision.articles), ["tarot-two-of-swords"]);
  assert.deepEqual(Object.keys(twoSwordsRevision.articles["tarot-two-of-swords"].notes).sort(), revisedLocales);
  for (const locale of revisedLocales) assert.ok(twoSwordsRevision.articles["tarot-two-of-swords"].notes[locale as "en" | "zh"].trim());
  assert.equal(twoPentaclesPlayRevision.baseCommit, "1f2f41bfdb88e468ed5bdbc5b6d1244cf18bddd3");
  assert.equal(twoPentaclesPlayRevision.updatedAt, "2026-11-10");
  assert.deepEqual(Object.keys(twoPentaclesPlayRevision.articles), ["tarot-two-of-pentacles"]);
  assert.deepEqual(Object.keys(twoPentaclesPlayRevision.articles["tarot-two-of-pentacles"].notes).sort(), revisedLocales);
  for (const locale of revisedLocales) assert.ok(twoPentaclesPlayRevision.articles["tarot-two-of-pentacles"].notes[locale as "en" | "zh"].trim());
  assert.equal(kingPentaclesRevision.baseCommit, "c06f5d96327a59ad65f441fa4d012e209839fc54");
  assert.equal(kingPentaclesRevision.updatedAt, "2026-11-05");
  assert.deepEqual(Object.keys(kingPentaclesRevision.articles), ["tarot-king-of-pentacles"]);
  assert.deepEqual(Object.keys(kingPentaclesRevision.articles["tarot-king-of-pentacles"].notes).sort(), revisedLocales);
  for (const locale of revisedLocales) assert.ok(kingPentaclesRevision.articles["tarot-king-of-pentacles"].notes[locale as "en" | "zh"].trim());
  assert.equal(judgementRevision.baseCommit, "f888b6a68e64425cfd68840a7c22cd746e142d5a");
  assert.equal(judgementRevision.updatedAt, "2026-11-03");
  assert.deepEqual(Object.keys(judgementRevision.articles), ["tarot-judgement"]);
  assert.deepEqual(Object.keys(judgementRevision.articles["tarot-judgement"].notes), ["zh"]);
  assert.ok(judgementRevision.articles["tarot-judgement"].notes.zh.trim());
  assert.equal(moonRevision.baseCommit, "48a44065c0a58e016cc2be7291fe21c46f01ea63");
  assert.equal(moonRevision.updatedAt, "2026-11-03");
  assert.deepEqual(Object.keys(moonRevision.articles), ["tarot-moon"]);
  assert.deepEqual(Object.keys(moonRevision.articles["tarot-moon"].notes), ["zh"]);
  assert.ok(moonRevision.articles["tarot-moon"].notes.zh.trim());
  assert.equal(sunRevision.baseCommit, "6b87283f6e66995dc8f4e19089bc9af1b6c15290");
  assert.equal(sunRevision.updatedAt, "2026-11-03");
  assert.deepEqual(Object.keys(sunRevision.articles), ["tarot-sun"]);
  assert.deepEqual(Object.keys(sunRevision.articles["tarot-sun"].notes), ["zh"]);
  assert.ok(sunRevision.articles["tarot-sun"].notes.zh.trim());
  assert.equal(towerRevision.baseCommit, "0fedeffce0c2d85e876d03ebd154325751a6837b");
  assert.equal(towerRevision.updatedAt, "2026-11-04");
  assert.deepEqual(Object.keys(towerRevision.articles), ["tarot-tower"]);
  assert.deepEqual(Object.keys(towerRevision.articles["tarot-tower"].notes), ["zh"]);
  assert.ok(towerRevision.articles["tarot-tower"].notes.zh.trim());
  assert.equal(devilRevision.baseCommit, "de587308cb06df26730be9c8286408d5f1ba73d1");
  assert.equal(devilRevision.updatedAt, "2026-11-04");
  assert.deepEqual(Object.keys(devilRevision.articles), ["tarot-devil"]);
  assert.deepEqual(Object.keys(devilRevision.articles["tarot-devil"].notes), ["zh"]);
  assert.ok(devilRevision.articles["tarot-devil"].notes.zh.trim());
  assert.equal(temperanceRevision.baseCommit, "4f360e1f1b3c786e1a6c4d5ce2cf68c288e8b933");
  assert.equal(temperanceRevision.updatedAt, "2026-11-05");
  assert.deepEqual(Object.keys(temperanceRevision.articles), ["tarot-temperance"]);
  assert.deepEqual(Object.keys(temperanceRevision.articles["tarot-temperance"].notes), ["zh"]);
  assert.ok(temperanceRevision.articles["tarot-temperance"].notes.zh.trim());
  assert.equal(worldRevision.baseCommit, "92ac728529b86b7177defb3dcb7996a69aa3648d");
  assert.equal(worldRevision.updatedAt, "2026-11-06");
  assert.deepEqual(Object.keys(worldRevision.articles), ["tarot-world"]);
  assert.deepEqual(Object.keys(worldRevision.articles["tarot-world"].notes), ["zh"]);
  assert.ok(worldRevision.articles["tarot-world"].notes.zh.trim());
  assert.equal(deathRevision.baseCommit, "dcae0eafabed42afde80a1dcea86832704815f4d");
  assert.equal(deathRevision.updatedAt, "2026-11-07");
  assert.deepEqual(Object.keys(deathRevision.articles), ["tarot-death"]);
  assert.deepEqual(Object.keys(deathRevision.articles["tarot-death"].notes), ["zh"]);
  assert.ok(deathRevision.articles["tarot-death"].notes.zh.trim());
  assert.equal(hangedManPollackRevision.baseCommit, "73fcb222086507386d275dd306ba8614c275d89a");
  assert.equal(hangedManPollackRevision.updatedAt, "2026-11-08");
  assert.deepEqual(Object.keys(hangedManPollackRevision.articles), ["tarot-hanged-man"]);
  assert.deepEqual(Object.keys(hangedManPollackRevision.articles["tarot-hanged-man"].notes), ["zh"]);
  assert.ok(hangedManPollackRevision.articles["tarot-hanged-man"].notes.zh.trim());
  assert.equal(justiceRevision.baseCommit, "eb98b14175d3805d4d4cbfedef045c8ffe1188c9");
  assert.equal(justiceRevision.updatedAt, "2026-11-09");
  assert.deepEqual(Object.keys(justiceRevision.articles), ["tarot-justice"]);
  assert.deepEqual(Object.keys(justiceRevision.articles["tarot-justice"].notes), ["zh"]);
  assert.ok(justiceRevision.articles["tarot-justice"].notes.zh.trim());
  assert.equal(wheelRevision.baseCommit, "ff2898e2b0015efa6995f4e3d830627f36c6fed5");
  assert.equal(wheelRevision.updatedAt, "2026-11-10");
  assert.deepEqual(Object.keys(wheelRevision.articles), ["tarot-wheel"]);
  assert.deepEqual(Object.keys(wheelRevision.articles["tarot-wheel"].notes), ["zh"]);
  assert.ok(wheelRevision.articles["tarot-wheel"].notes.zh.trim());
  assert.equal(hermitRevision.baseCommit, "4705df3298af79ef62732002884c62d6b560bf5d");
  assert.equal(hermitRevision.updatedAt, "2026-11-11");
  assert.deepEqual(Object.keys(hermitRevision.articles), ["tarot-hermit"]);
  assert.deepEqual(Object.keys(hermitRevision.articles["tarot-hermit"].notes), ["zh"]);
  assert.ok(hermitRevision.articles["tarot-hermit"].notes.zh.trim());
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
