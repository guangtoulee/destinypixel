import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import revision from "@/content/eight-swords-update-20261102/revisions.json";
import previousEn from "@/content/eight-swords-update-20261102/previous/content/tarot/en/eight-of-swords.json";
import previousZh from "@/content/eight-swords-update-20261102/previous/content/tarot/zh/eight-of-swords.json";
import en from "@/content/tarot/en/eight-of-swords.json";
import zh from "@/content/tarot/zh/eight-of-swords.json";
import { editorialUpdate } from "@/lib/editorial-updates";
import { journalLanguageTags, journalLocales } from "@/lib/journal-locales";
import type { TarotLearningArticle as Article } from "@/lib/tarot-learning/content";
import { loadTarotLearningArticle } from "@/lib/tarot-learning/content";
import { tarotLearningAlternates, tarotLearningMetadata, tarotLearningModifiedAt, tarotLearningSitemap } from "@/lib/tarot-learning/metadata";
import { tarotLearningHref } from "@/lib/tarot-learning/paths";
import { absoluteUrl } from "@/lib/seo";

const cardId = "eight-of-swords";
const slug = "tarot-eight-of-swords";
const sectionId = "number-and-image";
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
  en: "b6076b43ca6ab0a88bfacb4916c48ac4c153cf40d375d9e0044eed1529241d91",
  zh: "4ae055e43c274624bb3c996273a91beafb5c5cc2a6d3d7f602dddd7691867ffa",
};
const unchangedHashes = {
  ru: "3d27d93a77ff57d75517f797e07126daf5c62fe22ed08ff65eebe46f9ef3e28a",
  "zh-TW": "ed906e837ee53e31ce7b47d1bc6cb0d35673e9d80b60b318abeef02d79c1d806",
};

test("the Eight of Swords revision preserves the fixed two-language predecessor and every original section", async () => {
  assert.equal(revision.baseCommit, "7c162a22012d8909b8b8146df573c9d36e16d4b5");
  assert.equal(revision.updatedAt, "2026-11-02");
  assert.deepEqual(Object.keys(revision.articles), [slug]);
  assert.deepEqual(Object.keys(revision.articles[slug].notes), [...authored]);
  assert.deepEqual(Object.keys(revision.records).sort(), authored.map(locale => `content/tarot/${locale}/${cardId}.json`).sort());
  const records: Record<string, { previousFileSha256: string; previousArticleMarkdownSha256: string; fileSha256: string; articleMarkdownSha256: string }> = revision.records;
  const allowed = new Set(["sections", "sources", "articleMarkdown", "updatedAt", "editorialRevision"]);
  for (const locale of authored) {
    const path = `content/tarot/${locale}/${cardId}.json`;
    const receipt = records[path], old = previous[locale], updated = current[locale];
    const rawBefore = readFileSync(`content/eight-swords-update-20261102/previous/${path}`);
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
    assert.deepEqual(await loadTarotLearningArticle(cardId, locale), updated, `${locale}: loader is not serving the revised complete record`);
    const anchors = [...updated.sections.map(section => section.id), ...(updated.legacyIntroAnchors ?? []), ...(updated.legacyRelatedAnchors ?? []), ...updated.sections.flatMap(section => section.legacyAnchors ?? [])];
    assert.equal(new Set(anchors).size, anchors.length, `${locale}: duplicated old or new anchor`);
  }
});

test("the method retains historical sources and gives the locally read Pollack passage exact non-public page metadata", () => {
  const shapes = [];
  for (const locale of authored) {
    const updated = current[locale], old = previous[locale];
    assert.deepEqual(updated.sources.slice(0, old.sources.length), old.sources, `${locale}: historical source receipt changed`);
    assert.equal(updated.sources.length, old.sources.length + 2);
    const [book, comparison] = updated.sources.slice(old.sources.length);
    assert.equal(book.sourceId, "eight-swords-pollack-2010");
    assert.equal(book.url, null, "the local book must not gain an invented public download URL");
    assert.equal(book.checkedOn, "2026-11-02");
    assert.ok(book.title.trim());
    assert.ok(book.sourceMetadata);
    assert.equal(book.sourceMetadata.author, "Rachel Pollack");
    assert.equal(book.sourceMetadata.translator, "孙梅君");
    assert.equal(book.sourceMetadata.publisher, "商周出版");
    assert.equal(book.sourceMetadata.section, "Minor Arcana introduction");
    assert.deepEqual(book.sourceMetadata.pdfPages, [200, 201]);
    assert.deepEqual(book.sourceMetadata.printedPages, [201, 202]);
    assert.deepEqual(book.sourceMetadata.readScopePdf, [197, 198, 199, 200, 201, 202]);
    assert.equal(book.sourceMetadata.localScanOnly, true);
    assert.equal(comparison.url, "https://sacred-texts.com/tarot/pkt/pktwa08.htm");
    assert.equal(comparison.checkedOn, "2026-11-02");
    const section = updated.sections.find(item => item.id === sectionId);
    assert.ok(section);
    const hrefs = [...section.bodyMarkdown.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]);
    assert.deepEqual(hrefs, [
      "https://sacred-texts.com/tarot/pkt/pktwa08.htm", "https://sacred-texts.com/tarot/pkt/pktsw08.htm",
      tarotLearningHref("eight-of-wands", locale), `/tarot${locale === "en" ? "" : "?locale=zh"}`,
    ]);
    assert.equal(section.bodyMarkdown.split("\n").filter(line => line.startsWith("- ")).length, 2, "both separate alternatives need their own explanation");
    shapes.push(section.bodyMarkdown.split("\n\n").map(paragraph => ({ bulletItems: paragraph.split("\n").filter(line => line.startsWith("- ")).length, links: [...paragraph.matchAll(/\]\(([^)]+)\)/g)].length })));
  }
  assert.deepEqual(shapes[0], shapes[1], "the two authored editions lost a paragraph, alternative or linked reference");
});

test("all four established editions keep reciprocal URLs while only the authored pair acquires the new date", async () => {
  const entries = tarotLearningSitemap();
  const expectedAlternates = Object.fromEntries([...journalLocales.map(locale => [journalLanguageTags[locale], absoluteUrl(tarotLearningHref(cardId, locale)!)]), ["x-default", absoluteUrl(tarotLearningHref(cardId, "en")!)]]);
  assert.deepEqual(tarotLearningAlternates(cardId), expectedAlternates);
  for (const locale of journalLocales) {
    const changed = authored.some(item => item === locale), date = changed ? "2026-11-02" : "2026-10-08";
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
  const revised = entries.filter(entry => entry.url.includes(`/journal/${slug}`) && entry.lastModified === "2026-11-02");
  assert.deepEqual(revised.map(entry => entry.url).sort(), authored.map(locale => absoluteUrl(tarotLearningHref(cardId, locale)!)).sort());
});
