import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import sitemap from "@/app/sitemap";
import previousEditions from "@/content/three-card-interpretation-fit-20261107/previous-editions.json";
import revision from "@/content/three-card-interpretation-fit-20261107/revisions.json";
import questionScopeRevision from "@/content/three-card-question-scope-20261030/revisions.json";
import { celestialCopy, celestialHref } from "@/lib/celestial/copy";
import { editorialUpdate } from "@/lib/editorial-updates";
import { getJournalArticle, journalAlternates, journalArticleLocales, journalArticleSchema, journalHref, journalLocales, journalMetadata, type JournalTranslation } from "@/lib/journal";
import { journalTopicEntries } from "@/lib/journal-topic-catalog";
import { absoluteUrl } from "@/lib/seo";
import { beforeInterpretationFit, sourceBeforeInterpretationFit } from "@/lib/tarot-interpretation-fit.test-helpers";
import { tarotLearningHref } from "@/lib/tarot-learning/paths";
import type { ReportLocale } from "@/lib/report-i18n";

const slug = "how-to-read-three-card-tarot";
const sectionId = "interpretation-fit";
const authored = ["en", "zh"] as const;
const previous: Record<ReportLocale, JournalTranslation> = previousEditions;
const article = () => {
  const result = getJournalArticle(slug);
  assert.ok(result);
  return result;
};
const digest = (raw: string | Buffer) => createHash("sha256").update(raw).digest("hex");

test("the interpretation-fit addition restores the fixed predecessor bytes and all earlier content in every edition", () => {
  assert.equal(revision.baseCommit, "52b457f7bf7c6a7e6f7e753407ab26f7b695a08f");
  assert.equal(revision.updatedAt, "2026-11-07");
  assert.equal(revision.newSectionId, sectionId);
  assert.deepEqual(Object.keys(revision.articles), [slug]);
  assert.deepEqual(Object.keys(revision.articles[slug].notes), [...authored]);
  assert.equal(revision.previousSourceSha256, questionScopeRevision.currentSourceSha256);
  assert.equal(digest(readFileSync("content/three-card-interpretation-fit-20261107/previous-editions.json")), revision.previousEditionsSha256);
  assert.equal(revision.previousEditionsSha256, "4933cb367aaef6a654a848ebec87f56073c866d397c5ee4033a3ba6b5ed94d7e");
  assert.equal(digest(sourceBeforeInterpretationFit()), revision.previousSourceSha256);
  const guide = article();
  assert.deepEqual(journalArticleLocales(guide), [...journalLocales]);
  assert.equal(guide.publishedAt, "2026-10-02");
  assert.equal(guide.updatedAt, "2026-10-02", "the shared date must not freshen unedited editions");
  for (const locale of journalLocales) {
    assert.deepEqual(beforeInterpretationFit(guide.translations[locale], locale), previous[locale]);
    assert.equal(guide.translations[locale].sections.length, locale === "en" || locale === "zh" ? 9 : 8);
  }
  // The inverse projection must fail on unrelated edits rather than hide them.
  const changedParagraph = structuredClone(guide.translations.en);
  changedParagraph.sections[0].paragraphs[0] += " Unrecorded change.";
  assert.throws(() => beforeInterpretationFit(changedParagraph, "en"));
  const duplicatedAddition = structuredClone(guide.translations.en);
  duplicatedAddition.sections.push(duplicatedAddition.sections.find(section => section.id === sectionId)!);
  assert.throws(() => beforeInterpretationFit(duplicatedAddition, "en"));
  const changedUneditedEdition = structuredClone(guide.translations.ru);
  changedUneditedEdition.title += " Unrecorded change.";
  assert.throws(() => beforeInterpretationFit(changedUneditedEdition, "ru"));
});

test("the fixed-card exercise keeps real position labels, distinct candidate checks and separately identified sources", () => {
  assert.deepEqual(revision.readPages, { pdf: [386, 387, 388], printed: [388, 389, 390] });
  assert.deepEqual(revision.citedPages, { pdf: [387, 388], printed: [389, 390] });
  const guide = article();
  const shapes = [];
  for (const locale of authored) {
    const section = guide.translations[locale].sections.find(item => item.id === sectionId)!;
    assert.ok(section);
    assert.equal(section.paragraphs.length, 7);
    assert.ok(section.paragraphs.every(paragraph => paragraph.trim()));
    const setup = section.paragraphs[2];
    let lastIndex = -1;
    for (const position of celestialCopy(locale).positions.three) {
      const index = setup.indexOf(position);
      assert.ok(index > lastIndex, `${locale}: actual tool position is missing or out of order: ${position}`);
      lastIndex = index;
    }
    const cards = locale === "en" ? ["Three of Pentacles", "Ten of Wands", "Page of Wands"] : ["星币三", "权杖十", "权杖侍从"];
    let cardIndex = -1;
    for (const card of cards) {
      const index = setup.indexOf(card);
      assert.ok(index > cardIndex, `${locale}: the stated fictional cards changed or changed order`);
      cardIndex = index;
    }
    assert.match(setup, locale === "en" ? /three upright cards/ : /三张正位牌/);
    assert.match(section.paragraphs[1], locale === "en" ? /invented teaching example/ : /原创假设练习/);
    assert.match(section.paragraphs[1], locale === "en" ? /two hours.*one-page club newsletter/ : /两小时.*一页社团简讯/);
    assert.ok(section.table);
    assert.equal(section.table.headings.length, 3);
    assert.equal(section.table.rows.length, 3);
    assert.ok(section.table.rows.every(row => row.length === 3 && row.every(cell => cell.trim())));
    assert.equal(new Set(section.table.rows.map(row => row[0])).size, 3, "the exercise must retain three different candidate interpretations");
    assert.match(section.table.rows[0][2], locale === "en" ? /Decline/ : /不采纳/);
    assert.match(section.table.rows[1][2], locale === "en" ? /Decline/ : /不采纳/);
    assert.match(section.table.rows[2][2], locale === "en" ? /provisional/ : /暂作/);
    const attribution = section.paragraphs[5];
    for (const label of ["Rachel Pollack", "2010", "387–388", "389–390"]) assert.ok(attribution.includes(label), `${locale}: source attribution missing ${label}`);
    assert.match(attribution, locale === "en" ? /our original teaching exercise/ : /本站原创教学练习/);
    assert.match(attribution, locale === "en" ? /not evidence/ : /不能证明/);
    assert.match(section.paragraphs[6], locale === "en" ? /Waite.*several meanings/ : /韦特.*多种意义/);
    assert.match(section.paragraphs[6], locale === "en" ? /our modern interpretation/ : /现代读法/);
    assert.match(section.paragraphs[6], locale === "en" ? /Marseille or Thoth/ : /马赛或托特/);
    assert.deepEqual(section.sources?.map(source => source.href), [
      "https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/ten-of-wands",
      "https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/page-of-wands",
    ], "the local PDF must not be represented by an invented public download link");
    assert.ok(section.sources!.every(source => source.label.trim()));
    assert.deepEqual(section.links?.map(link => link.href), [tarotLearningHref("ten-of-wands", locale), tarotLearningHref("page-of-wands", locale), celestialHref("/tarot", locale)]);
    for (const link of section.links!) assert.ok(section.paragraphs.some(paragraph => paragraph.includes(link.text)), `${locale}: declared link text will not render in prose`);
    shapes.push([section.paragraphs.length, section.table.headings.length, section.table.rows.map(row => row.length), section.links!.length, section.sources!.length]);
  }
  assert.deepEqual(shapes[0], shapes[1], "the two authored editions lost a paragraph, table cell or link");
});

test("only the authored pair gains November 7 dates while every established URL and discovery entry remains available", () => {
  const guide = article();
  const entries = sitemap().filter(entry => new URL(entry.url).pathname === `/journal/${slug}`);
  assert.equal(entries.length, 4);
  assert.equal(new Set(entries.map(entry => entry.url)).size, 4);
  for (const locale of journalLocales) {
    const changed = locale === "en" || locale === "zh", date = changed ? "2026-11-07" : "2026-10-02";
    assert.equal(editorialUpdate(slug, locale)?.updatedAt, changed ? date : undefined);
    if (changed) assert.ok(editorialUpdate(slug, locale)?.note.trim());
    const metadata = journalMetadata(locale, guide), graph = metadata.openGraph;
    assert.equal(metadata.alternates?.canonical, journalHref(locale, slug));
    assert.deepEqual(metadata.alternates?.languages, journalAlternates(slug));
    assert.equal(graph && "publishedTime" in graph ? graph.publishedTime : undefined, "2026-10-02");
    assert.equal(graph && "modifiedTime" in graph ? graph.modifiedTime : undefined, date);
    const schema = journalArticleSchema(guide, locale)[0];
    assert.equal(schema.datePublished, "2026-10-02");
    assert.equal(schema.dateModified, date);
    assert.equal(schema.isAccessibleForFree, true);
    assert.equal(entries.find(entry => entry.url === absoluteUrl(journalHref(locale, slug)))?.lastModified, date);
    const discovered = journalTopicEntries(locale).filter(entry => entry.slug === slug);
    assert.equal(discovered.length, 1);
    assert.ok(discovered[0].topics.includes("tarot-reading"));
    assert.equal(discovered[0].href, journalHref(locale, slug));
    assert.equal(discovered[0].title, previous[locale].title);
  }
});
