import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import sitemap from "@/app/sitemap";
import celticPreviousContainers from "@/content/celtic-significator-20261101/previous-containers.json";
import celticRevision from "@/content/celtic-significator-20261101/revision.json";
import clarifierRevision from "@/content/celtic-clarifier-20261104/revision.json";
import eightSwordsRevision from "@/content/eight-swords-update-20261102/revisions.json";
import sourceReview from "@/content/tarot-suit-patterns-20261031/source-review.json";
import { sourceBeforeInterpretationFit } from "@/lib/tarot-interpretation-fit.test-helpers";
import { celestialCopy } from "@/lib/celestial/copy";
import { getJournalArticle, journalAlternates, journalArticleLocale, journalArticleLocales, journalArticleSchema, journalArticles, journalHref, journalLocales, journalMetadata, type JournalTranslation } from "@/lib/journal";
import { journalLanguageTags } from "@/lib/journal-locales";
import { tarotSuitSlug } from "@/lib/journal-tarot-suits";
import { journalTopicEntries } from "@/lib/journal-topic-catalog";
import { journalArticleTopics, journalTopicHref } from "@/lib/journal-topics";
import { absoluteUrl } from "@/lib/seo";
import { tarotLearningHref, tarotLearningId } from "@/lib/tarot-learning/paths";
import type { TarotLearningArticle } from "@/lib/tarot-learning/content";

const slug = "when-one-tarot-suit-dominates";
const authoredLocales = ["en", "zh"] as const;
const caseCards = ["eight-of-swords", "six-of-swords", "page-of-swords"] as const;
const article = () => {
  const result = getJournalArticle(slug);
  assert.ok(result);
  return result;
};

test("the suit-pattern guide publishes exactly two reciprocal editions with truthful dates and schema", () => {
  const guide = article();
  assert.equal(tarotSuitSlug, slug);
  assert.equal(journalArticles.filter(item => item.slug === slug).length, 1);
  assert.deepEqual(journalArticleLocales(guide), [...authoredLocales]);
  assert.equal(guide.publishedAt, "2026-10-31");
  assert.equal(guide.updatedAt, "2026-10-31");
  const alternates = {
    en: journalHref("en", slug), "zh-Hans": journalHref("zh", slug), "x-default": journalHref("en", slug),
  };
  assert.deepEqual(journalAlternates(slug), alternates);
  const entries = sitemap().filter(entry => new URL(entry.url).pathname === `/journal/${slug}`);
  assert.deepEqual(entries.map(entry => entry.url).sort(), authoredLocales.map(locale => absoluteUrl(journalHref(locale, slug))).sort());
  for (const locale of authoredLocales) {
    const metadata = journalMetadata(locale, guide), graph = metadata.openGraph;
    assert.equal(metadata.alternates?.canonical, journalHref(locale, slug));
    assert.deepEqual(metadata.alternates?.languages, alternates);
    assert.equal(graph && "publishedTime" in graph ? graph.publishedTime : undefined, "2026-10-31");
    assert.equal(graph && "modifiedTime" in graph ? graph.modifiedTime : undefined, "2026-10-31");
    const schema = journalArticleSchema(guide, locale)[0];
    assert.equal(schema.inLanguage, journalLanguageTags[locale]);
    assert.equal(schema.datePublished, "2026-10-31");
    assert.equal(schema.dateModified, "2026-10-31");
    assert.equal(schema.headline, guide.translations[locale].title);
    assert.equal(schema.mainEntityOfPage, absoluteUrl(journalHref(locale, slug)));
    assert.equal(schema.isAccessibleForFree, true);
    const entry = entries.find(item => item.url === absoluteUrl(journalHref(locale, slug)));
    assert.ok(entry);
    assert.equal(entry.lastModified, "2026-10-31");
    assert.deepEqual(entry.alternates?.languages, Object.fromEntries(Object.entries(alternates).map(([language, href]) => [language, absoluteUrl(href)])));
  }
  for (const locale of ["ru", "zh-TW"] as const) {
    assert.equal(journalArticleLocale(locale, guide), "en");
    assert.equal(journalMetadata(locale, guide).alternates?.canonical, journalHref("en", slug));
    assert.ok(!entries.some(entry => new URL(entry.url).searchParams.get("locale") === locale));
  }
});

test("both authored suit guides retain complete parallel paragraph, section, table and step structures", () => {
  const guide = article();
  const structure = (copy: JournalTranslation) => copy.sections.map(section => ({
    id: section.id,
    paragraphs: section.paragraphs.length,
    markdownParagraphs: section.bodyMarkdown?.split("\n\n").length,
    steps: section.steps?.length,
    table: section.table && [section.table.headings.length, section.table.rows.map(row => row.length)],
    links: section.links?.length,
    sources: section.sources?.length,
  }));
  assert.deepEqual(structure(guide.translations.en), structure(guide.translations.zh));
  for (const locale of authoredLocales) {
    const copy = guide.translations[locale];
    assert.ok(copy.title.trim() && copy.description.trim() && copy.introduction.trim());
    assert.ok(copy.sections.length > 0);
    assert.equal(new Set(copy.sections.map(section => section.id)).size, copy.sections.length);
    for (const section of copy.sections) {
      assert.ok(section.id.trim() && section.title.trim());
      assert.ok(section.paragraphs.length > 0 || section.bodyMarkdown?.trim());
      assert.ok(section.paragraphs.every(paragraph => paragraph.trim()));
      assert.ok((section.steps ?? []).every(step => step.trim()));
      if (section.table) {
        assert.ok(section.table.headings.length > 0 && section.table.rows.length > 0);
        assert.ok(section.table.headings.every(heading => heading.trim()));
        assert.ok(section.table.rows.every(row => row.length === section.table!.headings.length && row.every(cell => cell.trim())));
      }
    }
  }
});

test("the Swords example uses real card destinations and the tool's actual three-position sequence", () => {
  const guide = article();
  for (const locale of authoredLocales) {
    const sections = guide.translations[locale].sections;
    const expected = celestialCopy(locale).positions.three;
    const caseSection = sections.find(section => caseCards.every(card => section.links?.some(link => link.href === tarotLearningHref(card, locale))));
    assert.ok(caseSection, `${locale}: the worked example must link all three existing card guides`);
    const positionSequence = caseSection.paragraphs.find(paragraph => expected.every(label => paragraph.includes(label)));
    assert.ok(positionSequence, `${locale}: case does not name all actual three-card positions`);
    assert.equal(expected.length, 3);
    let previousIndex = -1;
    for (const label of expected) {
      const index = positionSequence.indexOf(label);
      assert.ok(index > previousIndex, `${locale}: case position missing or out of order: ${label}`);
      previousIndex = index;
    }
    for (const card of caseCards) {
      const href = tarotLearningHref(card, locale);
      assert.ok(href);
      assert.equal(tarotLearningId(new URL(href, "https://www.destinypixel.com").pathname.split("/").at(-1)!), card);
      const link = caseSection.links!.find(item => item.href === href)!;
      assert.ok(caseSection.paragraphs.some(paragraph => paragraph.includes(link.text)), `${locale}/${card}: link text is not rendered in its paragraph`);
    }
  }
});

test("the existing tarot-reading topic discovers only the authored suit-guide editions", () => {
  const guide = article();
  assert.deepEqual(journalArticleTopics(guide), ["tarot-reading"]);
  for (const locale of authoredLocales) {
    const entries = journalTopicEntries(locale).filter(entry => entry.topics.includes("tarot-reading") && entry.slug === slug);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].href, journalHref(locale, slug));
    assert.equal(entries[0].title, guide.translations[locale].title);
    assert.equal(entries[0].description, guide.translations[locale].description);
    const topicUrl = new URL(journalTopicHref(locale, "tarot-reading"), "https://www.destinypixel.com");
    assert.equal(topicUrl.pathname, "/journal");
    assert.equal(topicUrl.searchParams.get("locale"), locale === "en" ? null : locale);
    assert.equal(topicUrl.searchParams.get("topic"), "tarot-reading");
    assert.equal(topicUrl.hash, "#topic-results");
  }
  for (const locale of ["ru", "zh-TW"] as const) assert.ok(!journalTopicEntries(locale).some(entry => entry.slug === slug), `${locale}: fallback copy appeared as an authored topic entry`);
});

test("the suit guide retains its immutable historical receipts while validating the later Celtic and Eight of Swords revisions", () => {
  const digest = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
  assert.equal(digest(readFileSync("content/tarot-suit-patterns-20261031/source-review.json")), "da29b7a1f477b9c581b0db160c68643f01ed43c73681c0ad865273a2d3f5c2a1", "the original suit-guide receipt changed");
  assert.equal(sourceReview.baseCommit, "f9eead1d7df1089e18a35bd74a3e155d1b8c8fe2");
  assert.equal(sourceReview.articleSlug, slug);
  assert.deepEqual(sourceReview.authoredLocales, [...authoredLocales]);
  assert.deepEqual(sourceReview.pdfPages, [193, 194, 195, 196]);
  assert.deepEqual(sourceReview.printedPages, [194, 195, 196, 197]);
  const expectedPaths = [
    "content/tarot-methods/en.json", "content/tarot-methods/zh.json",
    "content/tarot-editorial/en.json", "content/tarot-editorial/zh.json",
    "lib/journal-three-card-tarot.ts", "lib/journal-tarot-methods.ts",
    ...journalLocales.flatMap(locale => caseCards.map(card => `content/tarot/${locale}/${card}.json`)),
  ];
  const receipts: Record<string, string> = sourceReview.previousPublishedFilesSha256;
  assert.deepEqual(Object.keys(receipts).sort(), expectedPaths.sort(), "the preserved-file receipt scope changed");
  const laterPaths = ["content/tarot-methods/en.json", "content/tarot-methods/zh.json", "lib/journal-tarot-methods.ts"];
  const eightSwordsPaths = ["content/tarot/en/eight-of-swords.json", "content/tarot/zh/eight-of-swords.json"];
  const eightSwordsRecords: Record<string, { previousFileSha256: string; previousArticleMarkdownSha256: string; fileSha256: string; articleMarkdownSha256: string }> = eightSwordsRevision.records;
  assert.equal(eightSwordsRevision.baseCommit, "7c162a22012d8909b8b8146df573c9d36e16d4b5");
  assert.equal(eightSwordsRevision.updatedAt, "2026-11-02");
  assert.deepEqual(Object.keys(eightSwordsRevision.articles), ["tarot-eight-of-swords"]);
  assert.deepEqual(Object.keys(eightSwordsRecords).sort(), [...eightSwordsPaths].sort());
  type RevisedCard = Omit<TarotLearningArticle, "sources"> & { sources: unknown[]; updatedAt: string; editorialRevision?: unknown };
  const currentHashes: Record<string, string> = celticRevision.currentPublishedFileHashes;
  assert.equal(celticRevision.baseCommit, "4da246597c28cde4c5bb37ac574d49b270324865");
  assert.equal(celticRevision.articleSlug, "how-to-read-celtic-cross");
  assert.equal(celticRevision.newSectionId, "significator-and-positions");
  assert.deepEqual(celticRevision.authoredLocales, [...authoredLocales]);
  assert.deepEqual(celticRevision.previousPublishedFileHashes, Object.fromEntries(laterPaths.map(path => [path, receipts[path]])), "the later revision does not start from the original suit-guide receipts");
  assert.deepEqual(Object.keys(currentHashes).sort(), [...laterPaths].sort());
  assert.equal(digest(readFileSync("content/celtic-significator-20261101/previous-containers.json")), celticRevision.previousContainersSha256);
  for (const [path, expected] of Object.entries(receipts)) {
    assert.match(expected, /^[a-f0-9]{64}$/);
    const raw = readFileSync(path);
    if (eightSwordsPaths.includes(path)) {
      const record = eightSwordsRecords[path], previousRaw = readFileSync(`content/eight-swords-update-20261102/previous/${path}`);
      const previous: RevisedCard = JSON.parse(previousRaw.toString());
      const current: RevisedCard = JSON.parse(raw.toString());
      assert.equal(record.previousFileSha256, expected, `${path}: the later card revision does not start from the original suit-guide receipt`);
      assert.equal(digest(previousRaw), expected, `${path}: the historical card snapshot changed`);
      assert.equal(digest(previous.articleMarkdown), record.previousArticleMarkdownSha256);
      assert.equal(digest(raw), record.fileSha256, `${path}: current card file differs from its independent revision receipt`);
      assert.equal(digest(current.articleMarkdown), record.articleMarkdownSha256);
      assert.equal(previous.sections.length, 11);
      assert.equal(current.sections.length, previous.sections.length + 1);
      const added = current.sections.filter(section => section.id === "number-and-image");
      assert.equal(added.length, 1);
      assert.equal(current.sections.findIndex(section => section.id === "number-and-image"), previous.sections.findIndex(section => section.id === "section-02") + 1);
      assert.equal(current.sources.length, previous.sources.length + 2);
      assert.deepEqual(current.sources.slice(0, previous.sources.length), previous.sources, `${path}: historical source metadata changed`);
      assert.equal(previous.updatedAt, "2026-10-08");
      assert.equal(current.updatedAt, "2026-11-02");
      const block = `## ${added[0].title}\n\n${added[0].bodyMarkdown}\n\n`;
      assert.equal(current.articleMarkdown.split(block).length, 2, `${path}: the new manuscript section is missing or duplicated`);
      const projected: RevisedCard = {
        ...current,
        sections: current.sections.filter(section => section.id !== "number-and-image"),
        sources: current.sources.slice(0, previous.sources.length),
        articleMarkdown: current.articleMarkdown.replace(block, ""),
        updatedAt: previous.updatedAt,
      };
      delete projected.editorialRevision;
      assert.deepEqual(projected, previous, `${path}: the later card revision changed original fields beyond its recorded addition`);
      assert.equal(digest(JSON.stringify(projected, null, 2) + "\n"), expected, `${path}: the historical projection does not restore the original bytes`);
      continue;
    }
    if (path === "lib/journal-three-card-tarot.ts") {
      assert.equal(digest(sourceBeforeInterpretationFit()), expected, `${path}: the later addition does not reproduce the immutable suit-guide receipt`);
      continue;
    }
    if (!laterPaths.includes(path)) {
      assert.equal(digest(raw), expected, `${path}: previously published file changed`);
      continue;
    }
    // First strictly undo only the November 4 addition/date. Then keep the
    // original November 1 -> October 31 projection and immutable receipts.
    const clarifierBeforeHashes: Record<string, string> = clarifierRevision.previousPublishedFileHashes;
    const clarifierCurrentHashes: Record<string, string> = clarifierRevision.currentPublishedFileHashes;
    assert.equal(clarifierRevision.baseCommit, "3eff663caee2965c17139dc78f9e4b345eef1ff6");
    assert.equal(clarifierRevision.articleSlug, celticRevision.articleSlug);
    assert.equal(clarifierRevision.newSectionId, "clarifier-job");
    assert.equal(clarifierBeforeHashes[path], currentHashes[path], `${path}: the later clarifier must begin at the original Celtic receipt`);
    assert.equal(digest(raw), clarifierCurrentHashes[path], `${path}: current file differs from its separately recorded clarifier receipt`);
    let beforeClarifier: string;
    if (path === "lib/journal-tarot-methods.ts") {
      assert.equal((raw.toString().match(/2026-11-04/g) ?? []).length, 1);
      beforeClarifier = raw.toString().replace("2026-11-04", "2026-11-01");
    } else {
      const live: Record<string, JournalTranslation> = JSON.parse(raw.toString());
      const target: JournalTranslation = live[celticRevision.articleSlug];
      assert.equal(target.sections.filter(section => section.id === "clarifier-job").length, 1);
      assert.equal(target.sections.length, 10);
      beforeClarifier = JSON.stringify({ ...live, [celticRevision.articleSlug]: { ...target, sections: target.sections.filter(section => section.id !== "clarifier-job") } }, null, 2) + "\n";
    }
    assert.match(currentHashes[path], /^[a-f0-9]{64}$/);
    assert.equal(digest(beforeClarifier), currentHashes[path], `${path}: removing only the clarifier addition/date must reproduce the exact original Celtic revision`);
    if (path === "lib/journal-tarot-methods.ts") {
      const moduleSource = beforeClarifier;
      assert.equal((moduleSource.match(/2026-11-01/g) ?? []).length, 1);
      assert.equal(digest(moduleSource.replace("2026-11-01", "2026-10-27")), expected, "the method module differs beyond the authorized Celtic update date");
      continue;
    }
    const locale = path === "content/tarot-methods/en.json" ? "en" : "zh";
    const previous: Record<string, JournalTranslation> = celticPreviousContainers[locale];
    const current: Record<string, JournalTranslation> = JSON.parse(beforeClarifier);
    const target: JournalTranslation = current[celticRevision.articleSlug];
    const oldTarget: JournalTranslation = previous[celticRevision.articleSlug];
    assert.ok(target && oldTarget);
    assert.equal(oldTarget.sections.length, 8);
    assert.equal(target.sections.length, oldTarget.sections.length + 1);
    assert.equal(target.sections.filter(section => section.id === celticRevision.newSectionId).length, 1);
    assert.equal(target.sections.findIndex(section => section.id === celticRevision.newSectionId), oldTarget.sections.findIndex(section => section.id === "which-celtic-cross") + 1);
    const projected: Record<string, JournalTranslation> = { ...current, [celticRevision.articleSlug]: { ...target, sections: target.sections.filter(section => section.id !== celticRevision.newSectionId) } };
    assert.deepEqual(projected, previous, `${locale}: later revision changed original metadata, section objects/order or the other article`);
    assert.equal(digest(JSON.stringify(previous, null, 2) + "\n"), expected, `${path}: historical projection no longer reproduces the original file approval`);
  }
});
