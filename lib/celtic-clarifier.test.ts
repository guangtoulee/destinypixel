import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import sitemap from "@/app/sitemap";
import previousContainers from "@/content/celtic-clarifier-20261104/previous-containers.json";
import revision from "@/content/celtic-clarifier-20261104/revision.json";
import en from "@/content/tarot-methods/en.json";
import zh from "@/content/tarot-methods/zh.json";
import { celestialCopy } from "@/lib/celestial/copy";
import { initialTable, spreadSizes, takeCard } from "@/lib/celestial/tarot";
import { getJournalArticle, journalAlternates, journalArticleLocale, journalArticleLocales, journalArticleSchema, journalHref, journalMetadata, type JournalTranslation } from "@/lib/journal";
import { journalLanguageTags } from "@/lib/journal-locales";
import { journalTopicEntries } from "@/lib/journal-topic-catalog";
import { absoluteUrl } from "@/lib/seo";

const slug = "how-to-read-celtic-cross";
const journalSlug = "how-to-keep-tarot-journal";
const sectionId = "clarifier-job";
const locales = ["en", "zh"] as const;
type AuthoredLocale = (typeof locales)[number];
const current: Record<AuthoredLocale, Record<string, JournalTranslation>> = { en, zh };
const previous: Record<AuthoredLocale, Record<string, JournalTranslation>> = previousContainers;
const digest = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
// Independently pinned to the fixed main base. Historical receipts are not
// replaced with hashes generated from today's edited files.
const previousHashes = {
  "content/tarot-methods/en.json": "49641390fa921d716549747e741c67f05f699f2046ef02c13977e29cf3b98345",
  "content/tarot-methods/zh.json": "f353dac32f61971bfbc2be9e0e265f7edca9171810947380d996a9619c881583",
  "lib/journal-tarot-methods.ts": "52ce813b6265bc1fcd188048434aa0da6e1cd3e6e3ab7d32e13c9577d7b7992f",
};

test("the clarifier addition preserves the exact nine-section Celtic predecessor and the whole neighboring journal", () => {
  assert.equal(revision.baseCommit, "3eff663caee2965c17139dc78f9e4b345eef1ff6");
  assert.equal(revision.articleSlug, slug);
  assert.equal(revision.newSectionId, sectionId);
  assert.equal(revision.updatedAt, "2026-11-04");
  assert.deepEqual(revision.authoredLocales, [...locales]);
  assert.deepEqual(revision.previousPublishedFileHashes, previousHashes);
  assert.equal(revision.previousContainersSha256, "fbf68964aced94cee4dc1686d64c1b0e30d10f4eac6a71b7c142c1966a736663");
  assert.equal(digest(readFileSync("content/celtic-clarifier-20261104/previous-containers.json")), revision.previousContainersSha256);
  const currentHashes: Record<string, string> = revision.currentPublishedFileHashes;
  assert.deepEqual(Object.keys(currentHashes).sort(), Object.keys(previousHashes).sort());
  for (const locale of locales) {
    const path = `content/tarot-methods/${locale}.json`;
    const old = previous[locale][slug], updated = current[locale][slug];
    assert.equal(digest(JSON.stringify(previous[locale], null, 2) + "\n"), previousHashes[path as keyof typeof previousHashes]);
    assert.equal(digest(readFileSync(path)), currentHashes[path]);
    assert.deepEqual(Object.keys(current[locale]).sort(), Object.keys(previous[locale]).sort());
    assert.deepEqual(current[locale][journalSlug], previous[locale][journalSlug]);
    assert.equal(old.sections.length, 9);
    assert.equal(updated.sections.length, 10);
    assert.equal(updated.sections.filter(section => section.id === sectionId).length, 1);
    const insertion = old.sections.findIndex(section => section.id === "checkable-answer");
    assert.ok(insertion > 0);
    assert.deepEqual(updated.sections.map(section => section.id), [...old.sections.slice(0, insertion).map(section => section.id), sectionId, ...old.sections.slice(insertion).map(section => section.id)]);
    assert.equal(new Set(updated.sections.map(section => section.id)).size, updated.sections.length);
    const projected = { ...current[locale], [slug]: { ...updated, sections: updated.sections.filter(section => section.id !== sectionId) } };
    assert.deepEqual(projected, previous[locale], `${locale}: something outside the one new section changed`);
    assert.equal(digest(JSON.stringify(projected, null, 2) + "\n"), previousHashes[path as keyof typeof previousHashes]);
    assert.deepEqual(getJournalArticle(slug)?.translations[locale], updated, `${locale}: the real loader lost current article content`);
  }
  const moduleSource = readFileSync("lib/journal-tarot-methods.ts", "utf8");
  assert.equal(digest(moduleSource), currentHashes["lib/journal-tarot-methods.ts"]);
  assert.equal((moduleSource.match(/2026-11-04/g) ?? []).length, 1);
  assert.equal(digest(moduleSource.replace("2026-11-04", "2026-11-01")), previousHashes["lib/journal-tarot-methods.ts"], "the module changed beyond the Celtic-only date");
});

test("the bilingual clarification keeps verified page scope, parallel decision rows and real practice destinations", () => {
  assert.deepEqual(revision.citedNewPages, { pdf: [348], printed: [350] });
  assert.deepEqual(revision.readPages.pdf, [347, 348, 349, 357, 358, 384, 385, 386, 387, 388, 389, 390]);
  assert.deepEqual(revision.readPages.printed, [349, 350, 351, 359, 360, 386, 387, 388, 389, 390, 391, 392]);
  const shapes = locales.map(locale => {
    const section = current[locale][slug].sections.find(item => item.id === sectionId);
    assert.ok(section);
    assert.equal(section.paragraphs.length, 6);
    assert.ok(section.title.trim() && section.paragraphs.every(paragraph => paragraph.trim()));
    assert.ok(section.table);
    assert.equal(section.table.headings.length, 3);
    assert.equal(section.table.rows.length, 3);
    assert.ok(section.table.rows.every(row => row.length === 3 && row.every(cell => cell.trim())));
    assert.deepEqual(section.sources?.map(source => source.href), ["https://sacred-texts.com/tarot/pkt/pkt0307.htm", "https://sacred-texts.com/tarot/pkt/pktpe08.htm"]);
    const suffix = locale === "en" ? "" : "?locale=zh";
    assert.deepEqual(section.links?.map(link => link.href), [`/journal/tarot-eight-of-pentacles${suffix}`, `/journal/how-to-keep-tarot-journal${suffix}`, `/tarot${suffix}`]);
    assert.ok(section.links?.every(link => section.paragraphs.some(paragraph => paragraph.includes(link.text))));
    const practice = current[locale][slug].sections.find(item => item.id === "practice-layout");
    assert.ok(practice?.table);
    assert.deepEqual(practice.table.rows.map(row => row[0].replace(/^\d+\s+/, "")), celestialCopy(locale).positions.celtic);
    assert.ok(!practice.table.rows.some(row => row[2] === section.links?.[0].text), "the hypothetical extra card was already present in the fixed original ten");
    return [section.paragraphs.length, section.table.headings.length, section.table.rows.map(row => row.length), section.links?.length, section.sources?.length];
  });
  assert.deepEqual(shapes[0], shapes[1]);
});

test("the real preset retains ten cards while only authored Celtic URLs receive the November 4 date", () => {
  assert.equal(spreadSizes.celtic, 10);
  let table = initialTable("spread", "celtic");
  for (let slot = 0; slot < 10; slot++) table = takeCard(table, 0, slot);
  assert.equal(table.cards.length, 10);
  assert.equal(table.deck.length, 68);
  assert.deepEqual(takeCard(table, 0, 10), table, "an extra card must not replace any of the recorded ten or enter an eleventh preset slot");
  const guide = getJournalArticle(slug);
  assert.ok(guide);
  assert.equal(guide.publishedAt, "2026-10-23");
  assert.equal(guide.updatedAt, "2026-11-04");
  assert.equal(getJournalArticle(journalSlug)?.updatedAt, "2026-10-23");
  assert.deepEqual(journalArticleLocales(guide), [...locales]);
  const alternates = { en: journalHref("en", slug), "zh-Hans": journalHref("zh", slug), "x-default": journalHref("en", slug) };
  assert.deepEqual(journalAlternates(slug), alternates);
  const entries = sitemap().filter(entry => new URL(entry.url).pathname === `/journal/${slug}`);
  assert.deepEqual(entries.map(entry => entry.url).sort(), locales.map(locale => absoluteUrl(journalHref(locale, slug))).sort());
  for (const locale of locales) {
    const metadata = journalMetadata(locale, guide);
    assert.equal(metadata.alternates?.canonical, journalHref(locale, slug));
    assert.deepEqual(metadata.alternates?.languages, alternates);
    const schema: ReturnType<typeof journalArticleSchema>[0] = journalArticleSchema(guide, locale)[0];
    assert.equal(schema.inLanguage, journalLanguageTags[locale]);
    assert.equal(schema.datePublished, "2026-10-23");
    assert.equal(schema.dateModified, "2026-11-04");
    assert.equal(entries.find(entry => entry.url === absoluteUrl(journalHref(locale, slug)))?.lastModified, "2026-11-04");
  }
  for (const locale of ["ru", "zh-TW"] as const) {
    assert.equal(journalArticleLocale(locale, guide), "en");
    assert.equal(journalMetadata(locale, guide).alternates?.canonical, journalHref("en", slug));
    assert.ok(!journalTopicEntries(locale).some(entry => entry.slug === slug));
  }
});
