import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import revision from "@/content/two-pentacles-play-20261110/revisions.json";
import previousEn from "@/content/two-pentacles-play-20261110/previous/content/tarot/en/two-of-pentacles.json";
import previousZh from "@/content/two-pentacles-play-20261110/previous/content/tarot/zh/two-of-pentacles.json";
import en from "@/content/tarot/en/two-of-pentacles.json";
import zh from "@/content/tarot/zh/two-of-pentacles.json";
import { editorialUpdate } from "@/lib/editorial-updates";
import { journalLanguageTags, journalLocales } from "@/lib/journal-locales";
import type { TarotLearningArticle as Article } from "@/lib/tarot-learning/content";
import { loadTarotLearningArticle } from "@/lib/tarot-learning/content";
import { tarotLearningAlternates, tarotLearningCatalog, tarotLearningMetadata, tarotLearningModifiedAt, tarotLearningSitemap } from "@/lib/tarot-learning/metadata";
import { tarotLearningHref } from "@/lib/tarot-learning/paths";
import { absoluteUrl } from "@/lib/seo";

const cardId = "two-of-pentacles";
const slug = "tarot-two-of-pentacles";
const sectionId = "play-and-adaptation";
const authored = ["en", "zh"] as const;
type AuthoredLocale = (typeof authored)[number];
type Source = { sourceId?: string; type?: string; title: string; url: string | null; checkedOn?: string; sourceMetadata?: Record<string, unknown> };
type RecordArticle = Omit<Article, "sources"> & { sources: Source[]; [field: string]: unknown };
const current: Record<AuthoredLocale, RecordArticle> = { en, zh };
const previous: Record<AuthoredLocale, RecordArticle> = { en: previousEn, zh: previousZh };
const digest = (raw: string | Buffer) => createHash("sha256").update(raw).digest("hex");
// Independently obtained with git show at the fixed main base, not derived from
// today's files or by resetting the old depth manifest.
const previousHashes = {
  en: "7a245018d9549c1f61b2960c6357dee2e39455748e5e8cd012d1f5c16c91e5a0",
  zh: "74c36291e3d194a742656eb4e14a2274129391a56b9cc6e7a174d07936de804e",
};
const uneditedHashes = {
  ru: "44c62994ef3423062b4b53871a12c96f8e9ca97791b7b5690be44027ebab588c",
  "zh-TW": "04d9a759923ad99d1c83db89e94eb3fdcb74f0d5e673a865175207abc0cfabd8",
};

test("the Two of Pentacles addition retains the fixed predecessor, every old field and all twelve original sections", () => {
  assert.equal(revision.baseCommit, "1f2f41bfdb88e468ed5bdbc5b6d1244cf18bddd3");
  assert.equal(revision.updatedAt, "2026-11-10");
  assert.deepEqual(Object.keys(revision.articles), [slug]);
  assert.deepEqual(Object.keys(revision.articles[slug].notes), [...authored]);
  assert.deepEqual(Object.keys(revision.records).sort(), authored.map(locale => `content/tarot/${locale}/${cardId}.json`).sort());
  const records: Record<string, { previousFileSha256: string; previousArticleMarkdownSha256: string; fileSha256: string; articleMarkdownSha256: string }> = revision.records;
  const allowed = new Set(["sections", "sources", "articleMarkdown", "updatedAt", "editorialRevision"]);
  for (const locale of authored) {
    const path = `content/tarot/${locale}/${cardId}.json`, before = previous[locale], updated = current[locale], receipt = records[path];
    const rawBefore = readFileSync(`content/two-pentacles-play-20261110/previous/${path}`);
    assert.equal(digest(rawBefore), previousHashes[locale]);
    assert.equal(receipt.previousFileSha256, previousHashes[locale]);
    assert.equal(digest(before.articleMarkdown), receipt.previousArticleMarkdownSha256);
    assert.equal(digest(readFileSync(path)), receipt.fileSha256);
    assert.equal(digest(updated.articleMarkdown), receipt.articleMarkdownSha256);
    assert.deepEqual(Object.keys(updated).filter(field => !allowed.has(field)).sort(), Object.keys(before).filter(field => !allowed.has(field)).sort());
    for (const field of Object.keys(before).filter(field => !allowed.has(field))) assert.deepEqual(updated[field], before[field], `${locale}: retained ${field}`);
    assert.equal(before.sections.length, 12);
    assert.equal(updated.sections.length, 13);
    const insertion = before.sections.findIndex(section => section.id === "section-02") + 1;
    assert.ok(insertion > 0);
    assert.deepEqual(updated.sections.map(section => section.id), [...before.sections.slice(0, insertion).map(section => section.id), sectionId, ...before.sections.slice(insertion).map(section => section.id)]);
    assert.deepEqual(updated.sections.filter(section => section.id !== sectionId), before.sections, `${locale}: original prose, cases, order or anchors changed`);
    assert.deepEqual(updated.sources.slice(0, before.sources.length), before.sources, `${locale}: original citation/provenance records changed`);
    assert.equal(updated.sources.length, before.sources.length + 2);
    const added = updated.sections.find(section => section.id === sectionId)!;
    assert.equal(added.role, "practice");
    const newBlock = `## ${added.title}\n\n${added.bodyMarkdown}\n\n`;
    assert.equal(updated.articleMarkdown.split(newBlock).length, 2, `${locale}: added block is missing or duplicated`);
    assert.equal(updated.articleMarkdown.replace(newBlock, ""), before.articleMarkdown, `${locale}: complete earlier Markdown changed`);
    assert.equal(readFileSync(`content/two-pentacles-play-20261110/manuscript-${locale}.md`, "utf8"), updated.articleMarkdown + "\n");
  }
});

test("the play exercise distinguishes an invented upright-card context from author interpretations and three practical checks", () => {
  const shapes = [];
  for (const locale of authored) {
    const updated = current[locale], addition = updated.sections.find(section => section.id === sectionId)!;
    const body = addition.bodyMarkdown;
    assert.match(body, locale === "en" ? /invented case/ : /原创假设案例/);
    assert.match(body, locale === "en" ? /upright Two of Pentacles/ : /正位星币二/);
    assert.match(body, locale === "en" ? /rather than report a real draw/ : /并非报告一次真实抽牌/);
    assert.match(body, locale === "en" ? /not a way to establish someone's feelings/ : /不能用来确认别人此刻的感受/);
    assert.match(body, locale === "en" ? /not a test of predictive accuracy/ : /不是检验预测准确率/);
    assert.match(body, locale === "en" ? /Marseille or Thoth/ : /马赛或托特/);
    const steps = body.split("\n").filter(line => /^\d+\. /.test(line));
    assert.deepEqual(steps.map(line => line.match(/^(\d+)\. /)![1]), ["1", "2", "3"]);
    assert.ok(steps.every(line => line.replace(/^\d+\. /, "").trim()));
    assert.deepEqual([...body.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]), [
      "https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/two-of-pentacles", "#section-06", locale === "en" ? "/tarot" : "/tarot?locale=zh",
    ]);
    const [book, primary] = updated.sources.slice(-2);
    assert.equal(book.sourceId, "two-pentacles-pollack-2010");
    assert.equal(book.type, "modern_author_interpretation");
    assert.equal(book.url, null, "the local PDF must not be exposed through an invented download URL");
    assert.equal(book.checkedOn, "2026-11-10");
    const metadata = book.sourceMetadata;
    assert.ok(metadata);
    assert.equal(metadata.author, "Rachel Pollack");
    assert.equal(metadata.translator, "孙梅君");
    assert.equal(metadata.publisher, "商周出版");
    assert.equal(metadata.published, "2010-12");
    assert.deepEqual(metadata.pdfPages, [313, 314]);
    assert.deepEqual(metadata.printedPages, [314, 315]);
    assert.deepEqual(metadata.readScopePdf, [313, 314]);
    assert.equal(metadata.localScanOnly, true);
    assert.equal(primary.type, "original_text_crosscheck");
    assert.equal(primary.checkedOn, "2026-11-10");
    assert.equal(primary.url, "https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/two-of-pentacles");
    assert.ok(body.includes("313–314") && body.includes("314–315"));
    shapes.push(body.split("\n\n").map(paragraph => ({ steps: paragraph.split("\n").filter(line => /^\d+\. /.test(line)).length, links: [...paragraph.matchAll(/\]\(([^)]+)\)/g)].length })));
  }
  assert.deepEqual(shapes[0], shapes[1], "bilingual paragraph, step or link structure diverged");
});

test("the complete four-language loader and discovery retain every URL while only EN/ZH receive November 10 dates", async () => {
  const entries = tarotLearningSitemap();
  const expectedAlternates = Object.fromEntries([...journalLocales.map(locale => [journalLanguageTags[locale], absoluteUrl(tarotLearningHref(cardId, locale)!)]), ["x-default", absoluteUrl(tarotLearningHref(cardId, "en")!)]]);
  assert.deepEqual(tarotLearningAlternates(cardId), expectedAlternates);
  for (const locale of journalLocales) {
    const changed = authored.some(item => item === locale), date: string = changed ? "2026-11-10" : "2026-10-08";
    const article = await loadTarotLearningArticle(cardId, locale);
    assert.ok(article);
    assert.equal(article.cardId, cardId);
    assert.equal(article.locale, locale === "zh" ? "zh-CN" : locale);
    assert.equal(article.sections.length, changed ? 13 : 12);
    assert.equal(article.publishedAt, "2026-10-07");
    assert.equal(article.updatedAt, date);
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
    assert.equal(tarotLearningCatalog(locale).filter(item => item.cardId === cardId).length, 1);
    // The real Article component uses these loaded publication/update/source
    // fields. Its actual JSON-LD is checked by the built-server HTTP checker.
  }
  for (const locale of ["ru", "zh-TW"] as const) assert.equal(digest(readFileSync(`content/tarot/${locale}/${cardId}.json`)), uneditedHashes[locale], `${locale}: original edition bytes changed`);
  const revised = entries.filter(entry => entry.url.includes(`/journal/${slug}`) && entry.lastModified === "2026-11-10");
  assert.deepEqual(revised.map(entry => entry.url).sort(), authored.map(locale => absoluteUrl(tarotLearningHref(cardId, locale)!)).sort());
});
