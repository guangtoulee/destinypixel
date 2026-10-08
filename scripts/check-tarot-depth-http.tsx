import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const base = process.argv[2] ?? "http://127.0.0.1:3038";
const revisions = JSON.parse(readFileSync("content/tarot-depth-20261008/revisions.json", "utf8"));
const manifest = JSON.parse(readFileSync("content/tarot-depth-20261008/manifest.json", "utf8"));
const locales = ["en", "zh", "zh-TW", "ru"] as const;
const href = (id: string, locale: string) => `/journal/tarot-${id}${locale === "en" ? "" : `?locale=${locale}`}`;
const text = (value: string) => value.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();

async function main() {
  let checked = 0;
  for (const id of Object.keys(revisions.cards)) {
    for (const locale of locales) {
      const article = JSON.parse(readFileSync(`content/tarot/${locale}/${id}.json`, "utf8"));
      const result = await fetch(new URL(href(id, locale), base), { signal: AbortSignal.timeout(30000) });
      assert.equal(result.status, 200);
      const page = await result.text();
      const html = page.match(/<article\b[^>]*>[\s\S]*?<\/article>/)?.[0] ?? "";
      const visible = text(html);
      for (const paragraph of [article.hook, ...article.openingParagraphs]) {
        assert.ok(visible.includes(text(renderToStaticMarkup(<p>{paragraph}</p>))), `${locale}/${id}: opening paragraph omitted`);
      }
      const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
      assert.equal(ids.length, new Set(ids).size, `${locale}/${id}: duplicate anchors`);
      for (const anchor of manifest.cards[id].legacyAnchors) assert.ok(ids.includes(anchor.id), `${locale}/${id}: broken old anchor ${anchor.id}`);
      const schema = [...page.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
        .flatMap(match => JSON.parse(match[1])).find(item => item["@type"] === "Article");
      assert.equal(schema.datePublished, article.publishedAt);
      assert.equal(schema.dateModified, article.updatedAt);
      assert.equal(schema.url, `https://www.destinypixel.com${href(id, locale)}`);
      assert.ok(page.includes(`property="article:modified_time" content="${article.updatedAt}"`), `${locale}/${id}: stale OpenGraph date`);
      for (const section of article.sections.filter((s: { role: string }) => s.role.startsWith("case-"))) {
        assert.ok(html.includes(`href="#${section.id}"`), `${locale}/${id}: case missing from contents`);
      }
      checked++;
    }
  }
  console.log(`PASS ${checked} revised editions: complete opening, old anchors, unique IDs, case contents and dates; run check-tarot-learning.tsx for every rendered section, canonical/hreflang and sitemap`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
