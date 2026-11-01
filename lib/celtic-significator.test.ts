import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import sitemap from "@/app/sitemap";
import previousContainers from "@/content/celtic-significator-20261101/previous-containers.json";
import revision from "@/content/celtic-significator-20261101/revision.json";
import en from "@/content/tarot-methods/en.json";
import zh from "@/content/tarot-methods/zh.json";
import { celestialCopy } from "@/lib/celestial/copy";
import { initialTable, spreadSizes, takeCard } from "@/lib/celestial/tarot";
import { getJournalArticle, journalAlternates, journalArticleLocale, journalArticleLocales, journalArticleSchema, journalHref, journalMetadata, type JournalTranslation } from "@/lib/journal";
import { journalLanguageTags } from "@/lib/journal-locales";
import { tarotMethodArticles, tarotMethodLocales, tarotMethodSlugs } from "@/lib/journal-tarot-methods";
import { journalTopicEntries } from "@/lib/journal-topic-catalog";
import { absoluteUrl } from "@/lib/seo";

const slug = "how-to-read-celtic-cross";
const journalSlug = "how-to-keep-tarot-journal";
const addedId = "significator-and-positions";
const locales = ["en", "zh"] as const;
type AuthoredLocale = (typeof locales)[number];
const current: Record<AuthoredLocale, Record<string, JournalTranslation>> = { en, zh };
const previous: Record<AuthoredLocale, Record<string, JournalTranslation>> = previousContainers;
const digest = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
const withoutSections = (copy: JournalTranslation) => Object.fromEntries(Object.entries(copy).filter(([key]) => key !== "sections"));

// Independently checked with git show at the fixed base, rather than derived
// from today's edited content or from a freshly computed replacement receipt.
const baselineHashes = {
  "content/tarot-methods/en.json": "95c6c6395f4badc862301c496104b95fbe18f8f553436582524d8854a9b196fc",
  "content/tarot-methods/zh.json": "788d8cb88bf0cdd5237f746c1ca23048551a024c07091aac095f1e03ee694e2d",
  "lib/journal-tarot-methods.ts": "e6a05aab9f0017f2b446d7552ac87ff8c30e275e2ddd254c72c7fb72e5a9504f",
};

test("the predecessor containers retain their independent base hashes and the method module changes only the intended date", () => {
  assert.equal(revision.baseCommit, "4da246597c28cde4c5bb37ac574d49b270324865");
  assert.equal(revision.articleSlug, slug);
  assert.equal(revision.updatedAt, "2026-11-01");
  assert.deepEqual(revision.authoredLocales, [...locales]);
  assert.deepEqual(revision.previousPublishedFileHashes, baselineHashes);
  assert.equal(revision.previousContainersSha256, "2b4c2a8cb47f3d0908b8bed6a4fb68966cb9359502818622311dec54de358424");
  assert.equal(digest(readFileSync("content/celtic-significator-20261101/previous-containers.json")), revision.previousContainersSha256);
  for (const locale of locales) {
    assert.equal(digest(JSON.stringify(previous[locale], null, 2) + "\n"), baselineHashes[`content/tarot-methods/${locale}.json`]);
  }
  const moduleSource = readFileSync("lib/journal-tarot-methods.ts", "utf8");
  assert.equal((moduleSource.match(/2026-11-01/g) ?? []).length, 1);
  assert.equal(digest(moduleSource.replace("2026-11-01", "2026-10-27")), baselineHashes["lib/journal-tarot-methods.ts"], "a module change outside the authorized Celtic update date occurred");
});

test("only the Celtic article gains one section while every prior section and the complete journal article remain intact", () => {
  assert.deepEqual(Object.keys(previous).sort(), [...locales]);
  for (const locale of locales) {
    assert.deepEqual(Object.keys(current[locale]).sort(), [journalSlug, slug].sort());
    assert.deepEqual(current[locale][journalSlug], previous[locale][journalSlug], `${locale}: the separate journal article changed`);
    const old = previous[locale][slug], updated = current[locale][slug];
    assert.deepEqual(withoutSections(updated), withoutSections(old), `${locale}: original title, introduction, action or other metadata changed`);
    // Both the fixed base and its snapshot contain eight original Celtic
    // sections; the new section makes nine, rather than replacing an old one.
    assert.equal(old.sections.length, 8);
    assert.equal(updated.sections.length, old.sections.length + 1);
    assert.equal(updated.sections.filter(section => section.id === addedId).length, 1);
    assert.deepEqual(updated.sections.filter(section => section.id !== addedId), old.sections, `${locale}: original prose, tables, links, sources or order changed`);
    const insertion = old.sections.findIndex(section => section.id === "which-celtic-cross") + 1;
    assert.ok(insertion > 0);
    assert.deepEqual(updated.sections.map(section => section.id), [
      ...old.sections.slice(0, insertion).map(section => section.id), addedId,
      ...old.sections.slice(insertion).map(section => section.id),
    ]);
    assert.equal(new Set(updated.sections.map(section => section.id)).size, updated.sections.length);
    const loaded = getJournalArticle(slug);
    assert.ok(loaded);
    assert.deepEqual(loaded.translations[locale], updated, `${locale}: the published registry is not using the updated container`);
  }
});

test("the significator comparison preserves the real first and seventh positions without introducing an eleventh slot", () => {
  assert.equal(spreadSizes.celtic, 10);
  const tableState = initialTable("spread", "celtic");
  assert.deepEqual(takeCard(tableState, 0, 10), tableState, "the Celtic preset must not accept an eleventh position");
  const shapes = locales.map(locale => {
    const section = current[locale][slug].sections.find(item => item.id === addedId);
    assert.ok(section);
    assert.equal(section.paragraphs.length, 4);
    assert.ok(section.title.trim() && section.paragraphs.every(paragraph => paragraph.trim()));
    assert.ok(section.table);
    assert.equal(section.table.headings.length, 3);
    assert.equal(section.table.rows.length, 3);
    assert.ok(section.table.headings.every(heading => heading.trim()));
    assert.ok(section.table.rows.every(row => row.length === 3 && row.every(cell => cell.trim())));
    const labels = celestialCopy(locale).positions.celtic;
    assert.equal(labels.length, spreadSizes.celtic);
    assert.deepEqual(section.table.rows.slice(1).map(row => row[0]), [`1 ${labels[0]}`, `7 ${labels[6]}`]);
    const practice = current[locale][slug].sections.find(item => item.id === "practice-layout");
    assert.ok(practice?.table);
    assert.deepEqual(practice.table.rows.map(row => row[0].replace(/^\d+\s+/, "")), labels);
    assert.deepEqual(section.sources?.map(source => source.href), ["https://sacred-texts.com/tarot/pkt/pkt0307.htm"]);
    assert.ok(section.sources?.every(source => source.label.trim()));
    return [section.paragraphs.length, section.table.headings.length, section.table.rows.map(row => row.length)];
  });
  assert.deepEqual(shapes[0], shapes[1]);
});

test("authored Celtic URLs retain October 23 publication and acquire November 1 updates while journal dates stay unchanged", () => {
  assert.deepEqual(tarotMethodSlugs, [slug, journalSlug]);
  assert.deepEqual(tarotMethodLocales, locales);
  assert.equal(tarotMethodArticles.length, 2);
  const entries = sitemap();
  for (const methodSlug of tarotMethodSlugs) {
    const method = getJournalArticle(methodSlug);
    assert.ok(method);
    const updatedAt = methodSlug === slug ? "2026-11-01" : "2026-10-23";
    assert.equal(method.publishedAt, "2026-10-23");
    assert.equal(method.updatedAt, updatedAt);
    assert.deepEqual(journalArticleLocales(method), locales);
    const alternates = { en: journalHref("en", methodSlug), "zh-Hans": journalHref("zh", methodSlug), "x-default": journalHref("en", methodSlug) };
    assert.deepEqual(journalAlternates(methodSlug), alternates);
    const methodEntries = entries.filter(entry => new URL(entry.url).pathname === `/journal/${methodSlug}`);
    assert.deepEqual(methodEntries.map(entry => entry.url).sort(), locales.map(locale => absoluteUrl(journalHref(locale, methodSlug))).sort());
    for (const locale of locales) {
      const metadata = journalMetadata(locale, method), graph = metadata.openGraph;
      assert.equal(metadata.alternates?.canonical, journalHref(locale, methodSlug));
      assert.deepEqual(metadata.alternates?.languages, alternates);
      assert.equal(graph && "publishedTime" in graph ? graph.publishedTime : undefined, "2026-10-23");
      assert.equal(graph && "modifiedTime" in graph ? graph.modifiedTime : undefined, updatedAt);
      const schema: ReturnType<typeof journalArticleSchema>[0] = journalArticleSchema(method, locale)[0];
      assert.equal(schema.inLanguage, journalLanguageTags[locale]);
      assert.equal(schema.datePublished, "2026-10-23");
      assert.equal(schema.dateModified, updatedAt);
      assert.equal(schema.mainEntityOfPage, absoluteUrl(journalHref(locale, methodSlug)));
      const entry = methodEntries.find(item => item.url === absoluteUrl(journalHref(locale, methodSlug)));
      assert.ok(entry);
      assert.equal(entry.lastModified, updatedAt);
      assert.deepEqual(entry.alternates?.languages, Object.fromEntries(Object.entries(alternates).map(([language, href]) => [language, absoluteUrl(href)])));
    }
  }
});

test("the methods still resolve unsupported languages to English without creating indexed fallback editions", () => {
  for (const methodSlug of tarotMethodSlugs) {
    const method = getJournalArticle(methodSlug);
    assert.ok(method);
    for (const locale of ["ru", "zh-TW"] as const) {
      assert.equal(journalArticleLocale(locale, method), "en");
      assert.equal(journalMetadata(locale, method).alternates?.canonical, journalHref("en", methodSlug));
      assert.ok(!journalTopicEntries(locale).some(entry => entry.slug === methodSlug));
      assert.ok(!sitemap().some(entry => new URL(entry.url).pathname === `/journal/${methodSlug}` && new URL(entry.url).searchParams.get("locale") === locale));
    }
  }
});
