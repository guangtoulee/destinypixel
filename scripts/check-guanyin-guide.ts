import assert from "node:assert/strict";
import { guanyinAlternates, guanyinGuideCopy, guanyinGuidePath, guanyinHref, guanyinPublishedAt, guanyinToolHref, guanyinUpdatedAt, guanyinSources } from "../lib/guanyin-guide";
import { journalLanguageTags, journalLocales } from "../lib/journal-locales";
import { absoluteUrl } from "../lib/seo";
const base = process.argv[2] ?? "http://127.0.0.1:3005";
const decode = (s: string) => s.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replace(/&#x27;|&#39;/g, "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
const attrs = (s: string) => Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1].toLowerCase(), decode(m[2])]));
async function get(path: string) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, path);
  assert.doesNotMatch(response.headers.get("x-robots-tag") ?? "", /noindex/i);
  return response.text();
}
async function main() {
  const sitemap = decode(await get("/sitemap.xml"));
  for (const locale of journalLocales) {
    const path = guanyinHref(locale), copy = guanyinGuideCopy[locale];
    const html = await get(path);
    const text = decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, ""));
    assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
    assert.ok(html.includes(`<main lang="${journalLanguageTags[locale]}"`));
    assert.equal(decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ""), copy.title);
    for (const value of [copy.h1, copy.intro, copy.scope, copy.ctaNote, copy.disclaimer, ...copy.sections.flatMap(s => [s.title, ...s.paragraphs, ...(s.steps ?? [])])]) assert.ok(text.includes(value), `${path}: missing text ${value.slice(0, 40)}`);
    const links = [...html.matchAll(/<link\b[^>]*>/g)].map(m => attrs(m[0]));
    assert.equal(links.find(l => l.rel === "canonical")?.href, absoluteUrl(path));
    for (const [language, url] of Object.entries(guanyinAlternates())) assert.ok(links.some(l => l.rel === "alternate" && l.hreflang === language && l.href === url));
    const meta = [...html.matchAll(/<meta\b[^>]*>/g)].map(m => attrs(m[0]));
    assert.equal(meta.find(m => m.name === "description")?.content, copy.description);
    assert.equal(meta.find(m => m.property === "article:published_time")?.content, guanyinPublishedAt);
    assert.equal(meta.find(m => m.property === "article:modified_time")?.content, guanyinUpdatedAt);
    assert.doesNotMatch(meta.filter(m => ["robots", "googlebot"].includes(m.name)).map(m => m.content).join(" "), /noindex/i);
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    const article = schemas.find(s => s["@type"] === "Article");
    assert.equal(article?.datePublished, guanyinPublishedAt);
    assert.equal(article?.dateModified, guanyinUpdatedAt);
    assert.equal(article?.inLanguage, journalLanguageTags[locale]);
    assert.equal(article?.url, absoluteUrl(path));
    assert.deepEqual(article?.citation, Object.values(guanyinSources));
    const entry = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].find(m => m[1].includes(`<loc>${absoluteUrl(path)}</loc>`))?.[1];
    assert.ok(entry?.includes(`<lastmod>${guanyinUpdatedAt}`));
    for (const href of [guanyinToolHref(locale), ...copy.related.map(item => `/journal/${item.slug}${locale === "en" ? "" : `?locale=${locale}`}`)]) {
      assert.ok(decode(html).includes(`href="${href}"`));
      await get(href);
    }
    for (const section of copy.sections) {
      assert.ok(html.includes(`id="${section.id}"`));
      if (section.source) assert.ok(decode(html).includes(`href="${guanyinSources[section.source.key]}"`));
    }
    console.log(`PASS ${locale}: SSR, metadata, languages, dates, sources, sitemap, tool and related links`);
  }
  for (const query of ["?locale=unknown", "?locale=zh&locale=ru"]) {
    const html = decode(await get(guanyinGuidePath + query));
    assert.ok(html.includes(`<title>${guanyinGuideCopy.en.title}</title>`));
  }
  // Other /learn entries retain their existing static route and metadata.
  assert.ok((await get("/learn/what-is-bazi-birth-chart")).includes("What is a BaZi birth chart?"));
  console.log("PASS locale fallbacks and neighboring guide; GET-only verification, no draw or AI request.");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
