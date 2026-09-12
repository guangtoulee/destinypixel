import assert from "node:assert/strict";
import test from "node:test";
import sitemap from "@/app/sitemap";
import { absoluteUrl } from "@/lib/seo";
import { journalArticles, journalHref, journalMetadata, journalArticleSchema, normalizeJournalLocale } from "@/lib/journal";
import { birthFormFeedback } from "@/lib/birth-form-feedback";

test("journal advertises exactly its real English and Chinese hub/article URLs", () => {
  const entries = sitemap().filter((entry) => new URL(entry.url).pathname.startsWith("/journal"));
  assert.equal(entries.length, (journalArticles.length + 1) * 2);
  const urls = new Set(entries.map((entry) => entry.url));
  for (const article of [undefined, ...journalArticles]) {
    for (const locale of ["en", "zh"] as const) {
      const metadata = journalMetadata(locale, article);
      assert.equal(metadata.alternates?.canonical, journalHref(locale, article?.slug));
      assert.ok(urls.has(absoluteUrl(String(metadata.alternates?.canonical))));
      for (const href of Object.values(metadata.alternates?.languages ?? {})) assert.ok(urls.has(absoluteUrl(String(href))));
    }
  }
  assert.equal(normalizeJournalLocale("ru"), "en");
  assert.equal(normalizeJournalLocale("zh-TW"), "en");
});

test("articles have translated sections, truthful free Article schema and useful original length", () => {
  assert.equal(new Set(journalArticles.map((article) => article.slug)).size, journalArticles.length);
  for (const article of journalArticles) {
    assert.deepEqual(article.translations.en.sections.map((section) => section.id), article.translations.zh.sections.map((section) => section.id));
    for (const locale of ["en", "zh"] as const) {
      const schema = journalArticleSchema(article, locale)[0];
      assert.equal(schema["@type"], "Article");
      assert.equal(schema.isAccessibleForFree, true);
      assert.equal(schema.author?.["@type"], "Organization");
      assert.equal(schema.datePublished, article.publishedAt);
      assert.equal(schema.dateModified, article.updatedAt);
      assert.ok(article.translations[locale].sections.some((section) => section.sources?.length));
      assert.ok(!/\/(prompt|juben|daoyan|image|english|danci)(?:\?|\/|$)/.test(article.translations[locale].action.href));
    }
    const copy = article.translations.en;
    const body = [copy.introduction, copy.takeaway, ...copy.sections.flatMap((section) => [section.title, ...section.paragraphs, ...(section.steps ?? []), ...(section.table ? [...section.table.headings, ...section.table.rows.flat()] : [])])].join(" ");
    const words = body.trim().split(/\s+/).length;
    assert.ok(words >= 600 && words <= 900, `${article.slug}: ${words} words`);
  }
});

test("birth form feedback renders only known localized errors", () => {
  assert.match(birthFormFeedback("ambiguous-local-time", "en") ?? "", /twice/);
  assert.match(birthFormFeedback("unsupported-year", "zh") ?? "", /1800.*2100/);
  assert.match(birthFormFeedback("report-storage-unavailable", "zh") ?? "", /无法安全保存/);
  assert.match(birthFormFeedback("rate-limited", "en") ?? "", /wait/);
  assert.equal(birthFormFeedback("unknown-query-string", "en"), undefined);
  assert.equal(birthFormFeedback("__proto__", "en"), undefined);
});
