import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";

const base = process.argv[2] ?? "http://127.0.0.1:3038";
const revisions = JSON.parse(readFileSync("content/tarot-depth-20261008/revisions.json", "utf8"));
const manifest = JSON.parse(readFileSync("content/tarot-depth-20261008/manifest.json", "utf8"));
const locales = ["en", "zh", "zh-TW", "ru"] as const;
const languageTags = { en: "en", zh: "zh-Hans", "zh-TW": "zh-Hant", ru: "ru" };
const origin = "https://www.destinypixel.com";
const href = (id: string, locale: string) => `/journal/tarot-${id}${locale === "en" ? "" : `?locale=${locale}`}`;
const decode = (value: string) => value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const text = (value: string) => decode(value.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
const attributes = (tag: string) => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(match => [match[1], decode(match[2])]));
const plainText = (value: string) => text(renderToStaticMarkup(<p>{value}</p>));
const markdownText = (value: string) => text(renderToStaticMarkup(<Markdown skipHtml>{value}</Markdown>));
const escapePattern = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
type Section = { id: string; role: string; title: string; bodyMarkdown: string };
type Source = { title: string; url: string | null };

async function get(path: string) {
  const result = await fetch(new URL(path, base), { signal: AbortSignal.timeout(30000) });
  assert.equal(result.status, 200, path);
  return result.text();
}

async function main() {
  const editionKeys = Object.keys(revisions.editions).sort();
  const expectedKeys = Object.entries(revisions.cards).flatMap(([id, value]) => {
    const declared = (value as { locales: string[] }).locales;
    assert.ok(declared.length && declared.every(locale => locales.includes(locale as typeof locales[number])), `${id}: invalid declared locales`);
    return declared.map(locale => `${locale}/${id}`);
  }).sort();
  assert.deepEqual(editionKeys, expectedKeys, "Edition manifest differs from per-card locale declarations");
  assert.deepEqual(editionKeys, Object.keys(revisions.articleMarkdownSha256).sort());
  const sitemap = editionKeys.length ? decode(await get("/sitemap.xml")) : "";
  let checked = 0;
  for (const key of editionKeys) {
    const [locale, id] = key.split("/");
    const article = JSON.parse(readFileSync(`content/tarot/${locale}/${id}.json`, "utf8"));
    const page = await get(href(id, locale));
    const html = page.match(/<article\b[^>]*>[\s\S]*?<\/article>/)?.[0] ?? "";
    assert.ok(html, `${key}: missing article`);
    const visible = text(html);
    for (const paragraph of [article.quickTake.upright, article.quickTake.reversed, article.hook, ...article.openingParagraphs]) {
      assert.ok(visible.includes(plainText(paragraph)), `${key}: quick take or opening paragraph omitted`);
    }
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids.length, new Set(ids).size, `${key}: duplicate anchors`);
    for (const anchor of manifest.cards[id].legacyAnchors) assert.ok(ids.includes(anchor.id), `${key}: broken old anchor ${anchor.id}`);
    const sections: Section[] = article.sections;
    assert.equal((html.match(/data-learning-section=/g) ?? []).length, sections.length, `${key}: wrong section count`);
    for (const section of sections) {
      const rendered = html.match(new RegExp(`<section[^>]*data-learning-section="${escapePattern(section.id)}"[^>]*>([\\s\\S]*?)<\\/section>`))?.[1];
      assert.ok(rendered, `${key}/${section.id}: missing section`);
      assert.equal(text(rendered.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1] ?? ""), plainText(section.title));
      assert.equal(text(rendered.replace(/<h2\b[^>]*>[\s\S]*?<\/h2>/, "")), markdownText(section.bodyMarkdown), `${key}/${section.id}: complete section differs`);
    }
    const cases = sections.filter(section => section.role === "case-1" || section.role === "case-2");
    assert.equal(cases.length, 2, `${key}: expected two complete cases`);
    assert.notEqual(cases[0].bodyMarkdown, cases[1].bodyMarkdown, `${key}: duplicated cases`);
    for (const section of cases) {
      assert.ok(section.bodyMarkdown.split("\n\n").length >= 3, `${key}: truncated case`);
      assert.ok(html.includes(`href="#${section.id}"`), `${key}: case missing from contents`);
    }
    assert.deepEqual(cases.map(section => section.id), revisions.editions[key].caseSections);
    if (article.sourceAppendix) {
      const appendix = article.sourceAppendix;
      const rendered = html.match(new RegExp(`<section[^>]*data-learning-source-appendix="${escapePattern(appendix.id)}"[^>]*>([\\s\\S]*?)<\\/section>`))?.[1];
      assert.ok(rendered, `${key}: missing sources appendix`);
      assert.ok(ids.includes(appendix.id), `${key}: missing appendix legacy anchor`);
      assert.ok(html.includes(`href="#${appendix.id}"`), `${key}: source appendix missing from contents`);
      assert.equal(text(rendered.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1] ?? ""), plainText(appendix.title));
      const items = [...rendered.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(match => match[1]);
      assert.equal(items.length, article.sources.length, `${key}: incomplete source appendix`);
      article.sources.forEach((source: Source, index: number) => {
        assert.equal(text(items[index]), plainText(source.title), `${key}: source title missing or reordered`);
        const links = [...items[index].matchAll(/<a\b[^>]*>/g)].map(match => attributes(match[0]));
        assert.deepEqual(links.map(link => link.href), source.url === null ? [] : [source.url], `${key}: source URL mismatch or null URL linked`);
      });
    }
    const schema = [...page.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .flatMap(match => JSON.parse(match[1])).find(item => item["@type"] === "Article");
    assert.ok(schema, `${key}: missing Article schema`);
    assert.equal(schema.headline, article.title);
    assert.equal(schema.datePublished, article.publishedAt);
    assert.equal(schema.dateModified, article.updatedAt);
    assert.equal(schema.url, origin + href(id, locale));
    assert.equal(schema.inLanguage, languageTags[locale as keyof typeof languageTags]);
    assert.deepEqual(schema.citation, article.sources.map((source: Source) => source.url ?? source.title));
    assert.ok(page.includes(`property="article:modified_time" content="${article.updatedAt}"`), `${key}: stale OpenGraph date`);
    const links = [...page.matchAll(/<link\b[^>]*>/g)].map(match => attributes(match[0]));
    assert.equal(links.find(link => link.rel === "canonical")?.href, origin + href(id, locale));
    for (const alternate of locales) assert.ok(links.some(link => link.rel === "alternate" && link.hrefLang === languageTags[alternate] && link.href === origin + href(id, alternate)), `${key}: missing ${alternate} hreflang`);
    assert.ok(links.some(link => link.hrefLang === "x-default" && link.href === origin + href(id, "en")));
    assert.ok(sitemap.includes(`<loc>${origin + href(id, locale)}</loc>`), `${key}: missing sitemap URL`);
    checked++;
  }
  console.log(`PASS ${checked} revised editions (${editionKeys.filter(key => key.startsWith("zh/")).length} Chinese): full sections, openings, quick takes, two cases, complete source appendices, old anchors, dates, citations, canonical/hreflang and sitemap`);
  console.log("Only declared revised editions were checked; run the full learning-library regression separately for unchanged languages and cards.");
}

main().catch(error => { console.error(error); process.exitCode = 1; });
