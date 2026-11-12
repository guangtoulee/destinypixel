import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import additions from "@/content/tarot-fours-practice-20261112/sections.json";
import revision from "@/content/tarot-fours-practice-20261112/revisions.json";
import { getJournalArticle, journalArticleSchema, journalMetadata, type JournalSection } from "./journal";
import { editorialUpdate } from "./editorial-updates";
import sitemap from "@/app/sitemap";

const slug = "why-the-four-fours-differ";
const digest = (raw: string | Buffer) => createHash("sha256").update(raw).digest("hex");

test("Fours practice keeps all historical collections and appends only its authored EN/ZH section", () => {
  assert.equal(digest(readFileSync("content/tarot-fours-practice-20261112/sections.json")), revision.sectionsSha256);
  assert.equal(revision.updatedAt, "2026-11-12");
  const article = getJournalArticle(slug)!;
  for (const locale of ["en", "zh", "zh-TW", "ru"] as const) {
    const path = `content/tarot-editorial/${locale}.json`;
    assert.equal(digest(readFileSync(path)), (revision.historicalContainers as Record<string, string>)[path]);
    const old = JSON.parse(readFileSync(path, "utf8"))[slug];
    const copy = article.translations[locale];
    assert.equal(copy.title, old.title);
    assert.equal(copy.introduction, old.opening[0]);
    assert.deepEqual(copy.openingParagraphs, old.opening.slice(1));
    const authored = locale === "en" || locale === "zh";
    assert.deepEqual(copy.sections, authored ? [...old.sections, additions[locale]] : old.sections);
    if (authored) {
      const manuscript = old.articleMarkdown.trimEnd() + `\n\n## ${additions[locale].title}\n\n${additions[locale].bodyMarkdown}\n`;
      assert.equal(readFileSync(`content/tarot-fours-practice-20261112/manuscript-${locale}.md`, "utf8"), manuscript);
      const added: JournalSection = copy.sections.at(-1)!;
      assert.equal((added.bodyMarkdown!.match(/^\d\. /gm) ?? []).length, 3);
      assert.equal(added.sources?.length, 1);
      assert.ok(added.bodyMarkdown!.includes(added.sources![0].href));
      assert.ok(added.bodyMarkdown!.includes(`/tarot${locale === "en" ? "" : "?locale=zh"}`));
    }
  }
});

test("Fours practice dates and schema follow only the two edited language editions", () => {
  const article = getJournalArticle(slug)!;
  const entries = sitemap().filter(entry => new URL(entry.url).pathname === `/journal/${slug}`);
  assert.equal(entries.length, 4);
  assert.equal(article.publishedAt, "2026-10-08");
  assert.equal(article.updatedAt, "2026-10-08");
  for (const locale of ["en", "zh", "zh-TW", "ru"] as const) {
    const authored = locale === "en" || locale === "zh";
    const date = authored ? "2026-11-12" : "2026-10-08";
    assert.equal(editorialUpdate(slug, locale) !== undefined, authored);
    const schema = journalArticleSchema(article, locale)[0];
    assert.equal(schema.dateModified, date);
    assert.equal(schema.datePublished, "2026-10-08");
    const entry = entries.find(entry => (new URL(entry.url).searchParams.get("locale") ?? "en") === locale);
    assert.equal(entry?.lastModified, date);
    assert.equal(journalMetadata(locale, article).alternates?.canonical, `/journal/${slug}${locale === "en" ? "" : `?locale=${locale}`}`);
    assert.ok(schema.citation.includes("https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/section-5-the-recurrence-of-cards-in-dealing") === authored);
  }
});
