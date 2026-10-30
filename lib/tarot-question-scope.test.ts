import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import sitemap from "@/app/sitemap";
import previousEditions from "@/content/three-card-question-scope-20261030/previous-editions.json";
import questionScopeRevision from "@/content/three-card-question-scope-20261030/revisions.json";
import { celestialCopy, celestialHref } from "@/lib/celestial/copy";
import { spreadSizes } from "@/lib/celestial/tarot";
import { editorialUpdate } from "@/lib/editorial-updates";
import { getJournalArticle, journalArticleSchema, journalHref, journalLocales, journalMetadata, type JournalTranslation } from "@/lib/journal";
import { threeCardTarotArticle, threeCardTarotRussian } from "@/lib/journal-three-card-tarot";
import type { ReportLocale } from "@/lib/report-i18n";
import { absoluteUrl } from "@/lib/seo";

const slug = "how-to-read-three-card-tarot";
const previous: Record<ReportLocale, JournalTranslation> = previousEditions;
const editedLocales = ["en", "zh"] as const;
const without = (value: object, fields: readonly string[]) => Object.fromEntries(Object.entries(value).filter(([field]) => !fields.includes(field)));
const currentArticle = () => {
  const article = getJournalArticle(slug);
  assert.ok(article);
  return article;
};

test("the question-scope revision preserves all four editions' metadata and the complete unedited translations", () => {
  const article = currentArticle();
  const fileHash = (file: string) => createHash("sha256").update(readFileSync(new URL(file, import.meta.url))).digest("hex");
  assert.equal(fileHash("../content/three-card-question-scope-20261030/previous-editions.json"), questionScopeRevision.previousEditionsSha256);
  assert.equal(fileHash("./journal-three-card-tarot.ts"), questionScopeRevision.currentSourceSha256);
  assert.deepEqual(Object.keys(previous).sort(), [...journalLocales].sort());
  assert.deepEqual(without(threeCardTarotArticle, ["translations", "traditionalTranslation"]), {
    slug, relatedSlug: "how-to-ask-fortune-sticks", publishedAt: "2026-10-02", updatedAt: "2026-10-02",
  });
  for (const locale of journalLocales) {
    assert.deepEqual(without(article.translations[locale], ["sections"]), without(previous[locale], ["sections"]), `${locale}: existing title, opening, action or other metadata changed`);
    assert.deepEqual(article.translations[locale].sections.map(section => section.id), previous[locale].sections.map(section => section.id), `${locale}: section IDs/order changed`);
  }
  assert.deepEqual(article.translations.ru, previous.ru);
  assert.deepEqual(article.translations["zh-TW"], previous["zh-TW"]);
  assert.deepEqual(threeCardTarotRussian, previous.ru);
  assert.deepEqual(threeCardTarotArticle.traditionalTranslation, previous["zh-TW"], "Traditional Chinese must retain its explicit prior edition");
});

test("only the two authorized sections gain material, with every original paragraph, table and link retained", () => {
  const article = currentArticle();
  for (const locale of editedLocales) {
    const sections = article.translations[locale].sections;
    assert.equal(sections.length, 8);
    assert.equal(new Set(sections.map(section => section.id)).size, 8);
    for (const old of previous[locale].sections) {
      const section = sections.find(item => item.id === old.id);
      assert.ok(section);
      if (old.id !== "one-question" && old.id !== "positions") {
        assert.deepEqual(section, old, `${locale}/${old.id}: unrelated section changed`);
        continue;
      }
      const allowed = old.id === "one-question" ? ["paragraphs", "table"] : ["paragraphs", "links", "sources"];
      assert.deepEqual(without(section, allowed), without(old, allowed), `${locale}/${old.id}: existing fields changed`);
      assert.deepEqual(section.paragraphs.slice(0, old.paragraphs.length), old.paragraphs, `${locale}/${old.id}: original paragraphs must remain first`);
      assert.equal(section.paragraphs.length, old.paragraphs.length + (old.id === "one-question" ? 3 : 2));
      assert.ok(section.paragraphs.every(paragraph => paragraph.trim()));
      assert.deepEqual((section.links ?? []).slice(0, old.links?.length ?? 0), old.links ?? []);
      assert.deepEqual((section.sources ?? []).slice(0, old.sources?.length ?? 0), old.sources ?? []);
    }
    const question = sections.find(section => section.id === "one-question")!;
    assert.ok(question.table, `${locale}: task-matching table missing`);
    assert.equal(question.table.headings.length, 3);
    assert.equal(question.table.rows.length, 3);
    assert.equal(new Set(question.table.rows.map(row => row[0])).size, 3);
    assert.ok([...question.table.headings, ...question.table.rows.flat()].every(cell => cell.trim()));
    assert.ok(question.table.rows.every(row => row.length === 3));
    const positions = sections.find(section => section.id === "positions")!;
    assert.deepEqual(positions.table, previous[locale].sections.find(section => section.id === "positions")!.table);
    assert.equal(positions.links?.length, 1, `${locale}: only the planned choice-tool link should be added`);
    assert.equal(positions.sources?.length, 1, `${locale}: only the planned Waite section-seven source should be added`);
    assert.ok(new Set([
      "https://sacred-texts.com/tarot/pkt/pkt0307.htm",
      "https://original.sacred-texts.com/tarot/pkt/pkt0307.htm",
      "https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/section-7-an-ancient-celtic-method-of-divination",
    ]).has(positions.sources![0].href));
    assert.ok(positions.sources![0].label.trim());
  }
});

test("the tutorial keeps the real three-card positions and describes the five-position choice spread in tool order", () => {
  const article = currentArticle();
  for (const locale of editedLocales) {
    const copy = celestialCopy(locale);
    const positions = article.translations[locale].sections.find(section => section.id === "positions")!;
    const prior = previous[locale].sections.find(section => section.id === "positions")!;
    assert.equal(copy.positions.three.length, spreadSizes.three);
    assert.equal(copy.positions.choice.length, spreadSizes.choice);
    assert.equal(spreadSizes.three, 3);
    assert.equal(spreadSizes.choice, 5);
    assert.deepEqual(positions.table!.rows.map(row => row[0]), copy.positions.three);
    const addedText = positions.paragraphs.slice(prior.paragraphs.length).join("\n");
    let previousIndex = -1;
    for (const label of copy.positions.choice) {
      const index = addedText.indexOf(label);
      assert.ok(index > previousIndex, `${locale}: choice position missing or out of order: ${label}`);
      previousIndex = index;
    }
    const link = positions.links!.find(item => item.text.includes(copy.spreads.choice));
    assert.ok(link, `${locale}: choice link must name the actual tool option`);
    assert.equal(link.href, celestialHref("/tarot", locale), `${locale}: choice link must use the supported localized tool route`);
    assert.ok(positions.paragraphs.some(paragraph => paragraph.includes(link.text)), `${locale}: tool link text is absent from the rendered paragraphs`);
  }
});

test("only the authored question-scope editions acquire October 30 dates across metadata, schema and sitemap", () => {
  const article = currentArticle();
  assert.equal(article.publishedAt, "2026-10-02");
  assert.equal(article.updatedAt, "2026-10-02", "shared dates must not freshen unedited editions");
  const entries = sitemap().filter(entry => new URL(entry.url).pathname === `/journal/${slug}`);
  assert.equal(entries.length, 4);
  assert.equal(new Set(entries.map(entry => entry.url)).size, 4);
  for (const locale of journalLocales) {
    const edited = locale === "en" || locale === "zh";
    const date = edited ? "2026-10-30" : "2026-10-02";
    const update = editorialUpdate(slug, locale);
    if (edited) {
      assert.equal(update?.updatedAt, date);
      assert.ok(update?.note.trim());
    } else assert.equal(update, undefined, `${locale}: unedited translation gained a revision`);
    const metadata = journalMetadata(locale, article);
    const graph = metadata.openGraph;
    assert.equal(graph && "modifiedTime" in graph ? graph.modifiedTime : undefined, date, `${locale}: Open Graph date`);
    assert.equal(graph && "publishedTime" in graph ? graph.publishedTime : undefined, "2026-10-02");
    assert.equal(metadata.alternates?.canonical, journalHref(locale, slug));
    const schema = journalArticleSchema(article, locale)[0];
    assert.equal(schema.datePublished, "2026-10-02");
    assert.equal(schema.dateModified, date, `${locale}: Article schema date`);
    assert.equal(schema.headline, previous[locale].title);
    assert.equal(schema.description, previous[locale].description);
    assert.equal(entries.find(entry => entry.url === absoluteUrl(journalHref(locale, slug)))?.lastModified, date, `${locale}: sitemap date`);
  }
});
