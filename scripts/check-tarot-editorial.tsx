import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import { tarotEditorialSlugs, relatedEditorialSlugs, editorialCardIds } from "../lib/tarot-editorial/navigation";

const base = process.argv[2] ?? "http://127.0.0.1:3038";
const origin = "https://www.destinypixel.com";
const tags = { en: "en", zh: "zh-Hans", "zh-TW": "zh-Hant", ru: "ru" };
const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const text = (s: string) => decode(s.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
const attrs = (s: string) => Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], decode(m[2])]));
async function get(path: string) { const r = await fetch(new URL(path, base)); assert.equal(r.status, 200, path); return r.text(); }

async function main() {
  const sitemap = decode(await get("/sitemap.xml"));
  const internal = new Set<string>();
  for (const locale of ["en", "zh", "zh-TW", "ru"] as const) {
    const suffix = locale === "en" ? "" : `?locale=${locale}`;
    const editions = JSON.parse(readFileSync(`content/tarot-editorial/${locale}.json`, "utf8"));
    const index = decode(await get(`/journal${suffix}`));
    assert.ok(index.includes('id="tarot-education"'));
    for (const slug of tarotEditorialSlugs) {
      const a = editions[slug], path = `/journal/${slug}${suffix}`, page = await get(path);
      assert.ok(index.includes(`href="${path}"`));
      assert.equal((page.match(/<h1[ >]/g) ?? []).length, 1);
      assert.equal(text(page.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)![1]), a.title);
      assert.equal(text(page.match(/<title>([\s\S]*?)<\/title>/)![1]), `${a.title} | DestinyPixel`);
      const links = [...page.matchAll(/<link\b[^>]*>/g)].map(m => attrs(m[0]));
      assert.equal(links.filter(l => l.rel === "canonical").length, 1);
      assert.equal(links.find(l => l.rel === "canonical")?.href, origin + path);
      for (const [l, tag] of Object.entries(tags)) assert.ok(links.some(link => link.hrefLang === tag && link.href === `${origin}/journal/${slug}${l === "en" ? "" : `?locale=${l}`}`));
      assert.ok(links.some(l => l.hrefLang === "x-default" && l.href === `${origin}/journal/${slug}`));
      const schema = [...page.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m => JSON.parse(m[1])).find(s => s["@type"] === "Article");
      assert.equal(schema.headline, a.title); assert.equal(schema.inLanguage, tags[locale]);
      assert.equal(schema.datePublished, slug === "tarot-sun" ? "2026-10-07" : "2026-10-08");
      assert.equal(schema.dateModified, "2026-10-08");
      assert.deepEqual(schema.citation, a.sections.flatMap((s: { sources: {href:string}[] }) => s.sources.map(x => x.href)));
      const entry = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].find(m => m[1].includes(`<loc>${origin + path}</loc>`))?.[1];
      assert.ok(entry?.includes("<lastmod>2026-10-08"));
      const body = page.match(/<article\b[^>]*>[\s\S]*?<\/article>/)![0];
      for (const opening of a.opening.slice(slug === "tarot-sun" ? 2 : 0)) assert.ok(text(body).includes(opening), `${path}: opening missing`);
      for (const s of a.sections) {
        const rendered = body.match(new RegExp(`<section[^>]*id="${s.id}"[^>]*>([\\s\\S]*?)<\\/section>`))?.[1];
        assert.ok(rendered, `${path}: ${s.id} missing`);
        const prose = rendered.replace(/<h2\b[^>]*>[\s\S]*?<\/h2>/, "");
        assert.equal(text(prose), text(renderToStaticMarkup(<Markdown>{s.bodyMarkdown}</Markdown>)), `${path}: ${s.id} full text`);
        assert.ok(page.includes(`href="#${s.id}"`));
      }
      for (const related of relatedEditorialSlugs(slug)) assert.ok(decode(body).includes(`href="/journal/${related}${suffix}"`));
      for (const id of editorialCardIds[slug] ?? []) assert.ok(decode(body).includes(`href="/journal/tarot-${id}${suffix}"`));
      assert.ok(decode(body).includes(`href="/tarot${suffix}"`));
      for (const match of body.matchAll(/href="(\/[^"#]*)"/g)) { const href = decode(match[1]); if (href.startsWith('/journal') || href.startsWith('/tarot')) internal.add(href); }
      if (slug === "tarot-from-game-to-occult-traditions") { assert.ok(text(body).includes("V&A")); assert.ok(!text(body).includes("V&amp;A")); }
      if (slug === "tarot-sun") for (let n = 1; n <= 8; n++) assert.ok(page.includes(`id="section-0${n}"`));
      console.log(`PASS ${path}: full prose, metadata, reciprocal languages, dates, sources, links`);
    }
    for (const legacy of ["how-to-read-three-card-tarot", "pamela-colman-smith-tarot-artist", ...new Set(Object.values(editorialCardIds).flat().map(id => `tarot-${id}`))]) {
      const page = decode(await get(`/journal/${legacy}${suffix}`));
      for (const slug of relatedEditorialSlugs(legacy)) assert.ok(page.includes(`href="/journal/${slug}${suffix}"`));
    }
  }
  for (const path of internal) await get(path);
  const wrong = await fetch(new URL("/journal/tarot-the-sun", base)); assert.equal(wrong.status, 404);
  console.log(`PASS 16 full editions and ${internal.size} internal link destinations; old/new backlinks; V&A; old Sun anchors`);
}
main().catch(e => { console.error(e); process.exitCode = 1; });
