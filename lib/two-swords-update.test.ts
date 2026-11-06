import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import revision from "@/content/two-swords-update-20261106/revisions.json";
import previousEn from "@/content/two-swords-update-20261106/previous/content/tarot/en/two-of-swords.json";
import previousZh from "@/content/two-swords-update-20261106/previous/content/tarot/zh/two-of-swords.json";
import en from "@/content/tarot/en/two-of-swords.json";
import zh from "@/content/tarot/zh/two-of-swords.json";
import { editorialUpdate } from "@/lib/editorial-updates";
import { journalLanguageTags, journalLocales } from "@/lib/journal-locales";
import type { TarotLearningArticle as Article } from "@/lib/tarot-learning/content";
import { loadTarotLearningArticle } from "@/lib/tarot-learning/content";
import { tarotLearningAlternates, tarotLearningMetadata, tarotLearningModifiedAt, tarotLearningSitemap } from "@/lib/tarot-learning/metadata";
import { tarotLearningHref } from "@/lib/tarot-learning/paths";
import { absoluteUrl } from "@/lib/seo";

const cardId = "two-of-swords";
const slug = "tarot-two-of-swords";
const sectionId = "armed-truce";
const authored = ["en", "zh"] as const;
type AuthoredLocale = (typeof authored)[number];
type Source = { sourceId?: string; title: string; url: string | null; checkedOn?: string; sourceMetadata?: Record<string, unknown> };
type RecordArticle = Omit<Article, "sources"> & { sources: Source[]; [field: string]: unknown };
const current: Record<AuthoredLocale, RecordArticle> = { en, zh };
const previous: Record<AuthoredLocale, RecordArticle> = { en: previousEn, zh: previousZh };
const digest = (raw: string | Buffer) => createHash("sha256").update(raw).digest("hex");
// Independently calculated with git show at the fixed main base. These are not
// recomputed from today's files or accepted by replacing a historical receipt.
const previousFileHashes = {
  en: "ad6e1aace33cd39fa169fe640de50f422bed17a688a1ae11853e1bca35792feb",
  zh: "d436e9cca2c268f11bf153fc7ce96d76a878201ab837aa9f0e232c20ca5b2cdb",
};
const unchangedHashes = {
  ru: "d9a6d269ad880fc8c897c36b3c1cf037ac3b7ddc707777af54917a9ebfc6ff70",
  "zh-TW": "15e310097edff47e3d68e4b3aebc0d8f6199aaa62a0d17b2e048d44f2be2ad2a",
};

test("the Two of Swords revision preserves the fixed two-language predecessor and every original section", async () => {
  assert.equal(revision.baseCommit, "d8e059ed1a895e409c625865b64909126566dd82");
  assert.equal(revision.updatedAt, "2026-11-06");
  assert.deepEqual(Object.keys(revision.articles), [slug]);
  assert.deepEqual(Object.keys(revision.articles[slug].notes), [...authored]);
  assert.deepEqual(Object.keys(revision.records).sort(), authored.map(locale => `content/tarot/${locale}/${cardId}.json`).sort());
  const records: Record<string, { previousFileSha256: string; previousArticleMarkdownSha256: string; fileSha256: string; articleMarkdownSha256: string }> = revision.records;
  const allowed = new Set(["sections", "sources", "articleMarkdown", "updatedAt", "editorialRevision"]);
  for (const locale of authored) {
    const path = `content/tarot/${locale}/${cardId}.json`;
    const receipt = records[path], old = previous[locale], updated = current[locale];
    const rawBefore = readFileSync(`content/two-swords-update-20261106/previous/${path}`);
    assert.equal(digest(rawBefore), previousFileHashes[locale]);
    assert.equal(receipt.previousFileSha256, previousFileHashes[locale]);
    assert.equal(digest(old.articleMarkdown), receipt.previousArticleMarkdownSha256);
    assert.equal(digest(readFileSync(path)), receipt.fileSha256);
    assert.equal(digest(updated.articleMarkdown), receipt.articleMarkdownSha256);
    assert.deepEqual(Object.keys(updated).filter(field => !allowed.has(field)).sort(), Object.keys(old).filter(field => !allowed.has(field)).sort());
    for (const field of Object.keys(old).filter(field => !allowed.has(field))) assert.deepEqual(updated[field], old[field], `${locale}: original ${field} changed`);
    assert.equal(old.sections.length, 11);
    assert.equal(updated.sections.length, 12);
    assert.deepEqual(updated.sections.filter(section => section.id !== sectionId), old.sections, `${locale}: original section text, order or anchor changed`);
    assert.equal(updated.sections.filter(section => section.id === sectionId).length, 1);
    const insertion = old.sections.findIndex(section => section.id === "section-02") + 1;
    assert.deepEqual(updated.sections.map(section => section.id), [...old.sections.slice(0, insertion).map(section => section.id), sectionId, ...old.sections.slice(insertion).map(section => section.id)]);
    const added = updated.sections[insertion];
    assert.equal(added.role, "practice");
    const block = `## ${added.title}\n\n${added.bodyMarkdown}\n\n`;
    assert.equal(updated.articleMarkdown.split(block).length, 2);
    assert.equal(updated.articleMarkdown.replace(block, ""), old.articleMarkdown, `${locale}: full manuscript changed outside its single addition`);
    const projected: Record<string, unknown> = { ...updated, sections: old.sections, sources: old.sources, articleMarkdown: updated.articleMarkdown.replace(block, ""), updatedAt: old.updatedAt };
    delete projected.editorialRevision;
    assert.deepEqual(projected, old, `${locale}: inverse projection changed original metadata`);
    assert.equal(digest(JSON.stringify(projected, null, 2) + "\n"), previousFileHashes[locale]);
    assert.deepEqual(await loadTarotLearningArticle(cardId, locale), updated, `${locale}: loader is not serving the revised complete record`);
    const anchors = [...updated.sections.map(section => section.id), ...(updated.legacyIntroAnchors ?? []), ...(updated.legacyRelatedAnchors ?? []), ...updated.sections.flatMap(section => section.legacyAnchors ?? [])];
    assert.equal(new Set(anchors).size, anchors.length, `${locale}: duplicated old or new anchor`);
  }
});

test("the bilingual exercise preserves old source receipts and distinguishes the fresh online recheck from our application", () => {
  const shapes = [];
  for (const locale of authored) {
    const updated = current[locale], old = previous[locale];
    assert.deepEqual(updated.sources.slice(0, old.sources.length), old.sources, `${locale}: historical source receipt changed`);
    assert.equal(updated.sources.length, old.sources.length + 1);
    const source = updated.sources[old.sources.length];
    assert.equal(source.sourceId, "two-swords-waite-recheck-20261106");
    assert.equal(source.url, "https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/two-of-swords");
    assert.equal(source.checkedOn, "2026-11-06");
    assert.ok(source.title.trim());
    assert.ok(source.sourceMetadata);
    assert.equal(source.sourceMetadata.layer, "original_text_crosscheck");
    assert.equal(source.sourceMetadata.author, "A. E. Waite");
    assert.equal(source.sourceMetadata.readScope, "Complete online Two of Swords entry only");
    for (const field of ["pdfPages", "printedPages", "readScopePdf"]) assert.equal(Object.hasOwn(source.sourceMetadata, field), false, `${locale}: online recheck gained unverified print pages`);
    const section = updated.sections.find(item => item.id === sectionId);
    assert.ok(section);
    const hrefs = [...section.bodyMarkdown.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]);
    const suffix = locale === "en" ? "" : "?locale=zh";
    assert.deepEqual(hrefs, [source.url, `/journal/tarot-four-of-swords${suffix}`, `/journal/tarot-justice${suffix}`, `/tarot${suffix}`]);
    const steps = section.bodyMarkdown.split("\n").filter(line => /^\d+\. /.test(line));
    assert.deepEqual(steps.map(line => line.match(/^(\d+)\. /)![1]), ["1", "2", "3"]);
    assert.ok(steps.every(line => line.replace(/^\d+\. /, "").trim()));
    shapes.push(section.bodyMarkdown.split("\n\n").map(paragraph => ({ numberedSteps: paragraph.split("\n").filter(line => /^\d+\. /.test(line)).length, links: [...paragraph.matchAll(/\]\(([^)]+)\)/g)].length })));
    assert.equal(readFileSync(`content/two-swords-update-20261106/manuscript-${locale}.md`, "utf8"), updated.articleMarkdown.trimEnd() + "\n");
  }
  assert.deepEqual(shapes[0], shapes[1], "the authored editions lost a paragraph, step or source link");
});

test("all four established editions keep reciprocal URLs while only the authored pair acquires the new date", async () => {
  const entries = tarotLearningSitemap();
  const expectedAlternates = Object.fromEntries([...journalLocales.map(locale => [journalLanguageTags[locale], absoluteUrl(tarotLearningHref(cardId, locale)!)]), ["x-default", absoluteUrl(tarotLearningHref(cardId, "en")!)]]);
  assert.deepEqual(tarotLearningAlternates(cardId), expectedAlternates);
  for (const locale of journalLocales) {
    const changed = authored.some(item => item === locale), date = changed ? "2026-11-06" : "2026-10-08";
    const article = await loadTarotLearningArticle(cardId, locale);
    assert.ok(article);
    assert.equal(article.locale, locale === "zh" ? "zh-CN" : locale);
    assert.equal(article.updatedAt, date);
    assert.equal(article.publishedAt, "2026-10-07");
    const update = editorialUpdate(slug, locale);
    assert.equal(update?.updatedAt, changed ? date : undefined);
    if (update) assert.ok(update.note.trim());
    assert.equal(tarotLearningModifiedAt(cardId, locale), date);
    const metadata = tarotLearningMetadata(locale, cardId), graph = metadata.openGraph;
    assert.equal(metadata.alternates?.canonical, tarotLearningHref(cardId, locale));
    assert.deepEqual(metadata.alternates?.languages, expectedAlternates);
    assert.equal(graph && "publishedTime" in graph ? graph.publishedTime : undefined, "2026-10-07");
    assert.equal(graph && "modifiedTime" in graph ? graph.modifiedTime : undefined, date);
    const entry = entries.find(item => item.url === absoluteUrl(tarotLearningHref(cardId, locale)!));
    assert.ok(entry);
    assert.equal(entry.lastModified, date);
    assert.deepEqual(entry.alternates.languages, expectedAlternates);
    // These loaded publication/update fields are inputs to the actual Article
    // component. Its rendered JSON-LD is checked by the real-server HTTP test,
    // which can import the framework's styles and client boundary correctly.
  }
  for (const locale of ["ru", "zh-TW"] as const) {
    assert.equal(digest(readFileSync(`content/tarot/${locale}/${cardId}.json`)), unchangedHashes[locale], `${locale}: original edition bytes changed`);
    const article = await loadTarotLearningArticle(cardId, locale);
    assert.ok(article);
    assert.equal(article.sections.length, 11);
    assert.ok(!article.sections.some(section => section.id === sectionId));
  }
  const revised = entries.filter(entry => entry.url.includes(`/journal/${slug}`) && entry.lastModified === "2026-11-06");
  assert.deepEqual(revised.map(entry => entry.url).sort(), authored.map(locale => absoluteUrl(tarotLearningHref(cardId, locale)!)).sort());
});
