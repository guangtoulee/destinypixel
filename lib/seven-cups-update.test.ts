import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import revision from "@/content/seven-cups-update-20261103/revisions.json";
import previousEn from "@/content/seven-cups-update-20261103/previous/content/tarot/en/seven-of-cups.json";
import previousZh from "@/content/seven-cups-update-20261103/previous/content/tarot/zh/seven-of-cups.json";
import en from "@/content/tarot/en/seven-of-cups.json";
import zh from "@/content/tarot/zh/seven-of-cups.json";
import { editorialUpdate } from "@/lib/editorial-updates";
import { journalLanguageTags, journalLocales } from "@/lib/journal-locales";
import type { TarotLearningArticle as Article } from "@/lib/tarot-learning/content";
import { loadTarotLearningArticle } from "@/lib/tarot-learning/content";
import { tarotLearningAlternates, tarotLearningMetadata, tarotLearningModifiedAt, tarotLearningSitemap } from "@/lib/tarot-learning/metadata";
import { tarotLearningHref } from "@/lib/tarot-learning/paths";
import { absoluteUrl } from "@/lib/seo";

const cardId = "seven-of-cups";
const slug = "tarot-seven-of-cups";
const sectionId = "creative-resource-practice";
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
  en: "daeca1c267e5d029023322f6595e80ac08dfb7dde8863b8dbc835e8156bd6031",
  zh: "542ab27bc44855da860a034f3c632cd09bf155e3de964116ff8659266438a57f",
};
const unchangedHashes = {
  ru: "5cb200c15db7092dbed274f2e0ddee4eac0804777a852f707408f6fbd16104b0",
  "zh-TW": "b2623cac5d70338122f724e3044a5b156d4a635dd4fcaf128e219b144ee06475",
};

test("the Seven of Cups revision preserves the fixed two-language predecessor and every original section", async () => {
  assert.equal(revision.baseCommit, "8302ab6f9ac19cf0c8729c8f1bbec8b7368e4fe0");
  assert.equal(revision.updatedAt, "2026-11-03");
  assert.deepEqual(Object.keys(revision.articles), [slug]);
  assert.deepEqual(Object.keys(revision.articles[slug].notes), [...authored]);
  assert.deepEqual(Object.keys(revision.records).sort(), authored.map(locale => `content/tarot/${locale}/${cardId}.json`).sort());
  const records: Record<string, { previousFileSha256: string; previousArticleMarkdownSha256: string; fileSha256: string; articleMarkdownSha256: string }> = revision.records;
  const allowed = new Set(["sections", "sources", "articleMarkdown", "updatedAt", "editorialRevision"]);
  for (const locale of authored) {
    const path = `content/tarot/${locale}/${cardId}.json`;
    const receipt = records[path], old = previous[locale], updated = current[locale];
    const rawBefore = readFileSync(`content/seven-cups-update-20261103/previous/${path}`);
    assert.equal(digest(rawBefore), previousFileHashes[locale]);
    assert.equal(receipt.previousFileSha256, previousFileHashes[locale]);
    assert.equal(digest(old.articleMarkdown), receipt.previousArticleMarkdownSha256);
    assert.equal(digest(readFileSync(path)), receipt.fileSha256);
    assert.equal(digest(updated.articleMarkdown), receipt.articleMarkdownSha256);
    assert.deepEqual(Object.keys(updated).filter(field => !allowed.has(field)).sort(), Object.keys(old).filter(field => !allowed.has(field)).sort());
    for (const field of Object.keys(old).filter(field => !allowed.has(field))) assert.deepEqual(updated[field], old[field], `${locale}: original ${field} changed`);
    assert.equal(old.sections.length, 10);
    assert.equal(updated.sections.length, 11);
    assert.deepEqual(updated.sections.filter(section => section.id !== sectionId), old.sections, `${locale}: original section text, order or anchor changed`);
    assert.equal(updated.sections.filter(section => section.id === sectionId).length, 1);
    const insertion = old.sections.findIndex(section => section.id === "depth-positions") + 1;
    assert.deepEqual(updated.sections.map(section => section.id), [...old.sections.slice(0, insertion).map(section => section.id), sectionId, ...old.sections.slice(insertion).map(section => section.id)]);
    const added = updated.sections[insertion];
    assert.equal(added.role, "practice");
    const block = `## ${added.title}\n\n${added.bodyMarkdown}\n\n`;
    assert.equal(updated.articleMarkdown.split(block).length, 2);
    assert.equal(updated.articleMarkdown.replace(block, ""), old.articleMarkdown, `${locale}: full manuscript changed outside its single addition`);
    assert.deepEqual(await loadTarotLearningArticle(cardId, locale), updated, `${locale}: loader is not serving the revised complete record`);
    const anchors = [...updated.sections.map(section => section.id), ...(updated.legacyIntroAnchors ?? []), ...(updated.legacyRelatedAnchors ?? []), ...updated.sections.flatMap(section => section.legacyAnchors ?? [])];
    assert.equal(new Set(anchors).size, anchors.length, `${locale}: duplicated old or new anchor`);
  }
});

test("the creative practice retains historical sources and separates local-book evidence from its three original steps", () => {
  const shapes = [];
  for (const locale of authored) {
    const updated = current[locale], old = previous[locale];
    assert.deepEqual(updated.sources.slice(0, old.sources.length), old.sources, `${locale}: historical source receipt changed`);
    assert.equal(updated.sources.length, old.sources.length + 1);
    const book = updated.sources[old.sources.length];
    assert.equal(book.sourceId, "seven-cups-pollack-2010");
    assert.equal(book.url, null, "the local book must not gain an invented public download URL");
    assert.equal(book.checkedOn, "2026-11-03");
    assert.ok(book.title.trim());
    assert.ok(book.sourceMetadata);
    assert.equal(book.sourceMetadata.author, "Rachel Pollack");
    assert.equal(book.sourceMetadata.translator, "孙梅君");
    assert.equal(book.sourceMetadata.publisher, "商周出版");
    assert.equal(book.sourceMetadata.section, "Chapter 8, Seven of Cups");
    assert.deepEqual(book.sourceMetadata.pdfPages, [245, 246]);
    assert.deepEqual(book.sourceMetadata.printedPages, [246, 247]);
    assert.deepEqual(book.sourceMetadata.readScopePdf, [245, 246, 247]);
    assert.equal(book.sourceMetadata.localScanOnly, true);
    const section = updated.sections.find(item => item.id === sectionId);
    assert.ok(section);
    const hrefs = [...section.bodyMarkdown.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]);
    const suffix = locale === "en" ? "" : "?locale=zh";
    assert.deepEqual(hrefs, [
      "https://sacred-texts.com/tarot/pkt/pktcu07.htm", `/tarot${suffix}`,
      `/journal/how-to-keep-tarot-journal${suffix}`,
    ]);
    const steps = section.bodyMarkdown.split("\n").filter(line => /^\d+\. /.test(line));
    assert.deepEqual(steps.map(line => line.match(/^(\d+)\. /)![1]), ["1", "2", "3"], "observation, invention and attribution need all three distinct steps");
    assert.ok(steps.every(line => line.replace(/^\d+\. /, "").trim()));
    shapes.push(section.bodyMarkdown.split("\n\n").map(paragraph => ({ numberedSteps: paragraph.split("\n").filter(line => /^\d+\. /.test(line)).length, links: [...paragraph.matchAll(/\]\(([^)]+)\)/g)].length })));
    const manuscript = readFileSync(`content/seven-cups-update-20261103/manuscript-${locale}.md`, "utf8");
    assert.equal(manuscript, updated.articleMarkdown.trimEnd() + "\n", `${locale}: readable complete manuscript differs from the published source`);
  }
  assert.deepEqual(shapes[0], shapes[1], "the two authored editions lost a paragraph, numbered step or linked reference");
});

test("all four established editions keep reciprocal URLs while only the authored pair acquires the new date", async () => {
  const entries = tarotLearningSitemap();
  const expectedAlternates = Object.fromEntries([...journalLocales.map(locale => [journalLanguageTags[locale], absoluteUrl(tarotLearningHref(cardId, locale)!)]), ["x-default", absoluteUrl(tarotLearningHref(cardId, "en")!)]]);
  assert.deepEqual(tarotLearningAlternates(cardId), expectedAlternates);
  for (const locale of journalLocales) {
    const changed = authored.some(item => item === locale), date = changed ? "2026-11-03" : "2026-10-08";
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
    assert.equal(article.sections.length, 10);
    assert.ok(!article.sections.some(section => section.id === sectionId));
  }
  const revised = entries.filter(entry => entry.url.includes(`/journal/${slug}`) && entry.lastModified === "2026-11-03");
  assert.deepEqual(revised.map(entry => entry.url).sort(), authored.map(locale => absoluteUrl(tarotLearningHref(cardId, locale)!)).sort());
});
