import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import sitemap from "@/app/sitemap";
import sourceReview from "@/content/tarot-suit-patterns-20261031/source-review.json";
import { celestialCopy } from "@/lib/celestial/copy";
import { getJournalArticle, journalAlternates, journalArticleLocale, journalArticleLocales, journalArticleSchema, journalArticles, journalHref, journalLocales, journalMetadata, type JournalTranslation } from "@/lib/journal";
import { journalLanguageTags } from "@/lib/journal-locales";
import { tarotSuitSlug } from "@/lib/journal-tarot-suits";
import { journalTopicEntries } from "@/lib/journal-topic-catalog";
import { journalArticleTopics, journalTopicHref } from "@/lib/journal-topics";
import { absoluteUrl } from "@/lib/seo";
import { tarotLearningHref, tarotLearningId } from "@/lib/tarot-learning/paths";

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

test("the new guide leaves the recorded pre-existing methods and all three example cards byte-for-byte intact", () => {
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
  const receipts = sourceReview.previousPublishedFilesSha256;
  assert.deepEqual(Object.keys(receipts).sort(), expectedPaths.sort(), "the preserved-file receipt scope changed");
  for (const [path, expected] of Object.entries(receipts)) {
    assert.match(expected, /^[a-f0-9]{64}$/);
    assert.equal(createHash("sha256").update(readFileSync(path)).digest("hex"), expected, `${path}: previously published file changed`);
  }
});
