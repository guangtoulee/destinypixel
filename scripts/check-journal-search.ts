import assert from "node:assert/strict";
import { journalArticles, journalHref, journalLocales, journalLanguageTags } from "../lib/journal";

// Read-only HTTP smoke check; accepts localhost for a production-build preview.
const base = process.argv[2] ?? "https://www.destinypixel.com";
const selected = process.argv[3] ? journalArticles.filter(a => a.publishedAt === process.argv[3]) : journalArticles;
assert.ok(selected.length, "No articles matched the requested publication date");
const origin = "https://www.destinypixel.com";
const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const attrs = (tag: string) => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], decode(m[2])]));
async function html(path: string) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200, `${path}: status ${response.status}`);
  return response.text();
}
async function main() {
  const sitemap = await html("/sitemap.xml");
  const checks = selected.flatMap(article => journalLocales.map(locale => ({article,locale})));
  for (let start = 0; start < checks.length; start += 4) {
    await Promise.all(checks.slice(start, start + 4).map(async ({article,locale}) => {
      const path = journalHref(locale, article.slug);
      const page = await html(path);
      assert.equal((page.match(/<h1[ >]/g) ?? []).length, 1, `${path}: expected one H1`);
      assert.ok(decode(page).includes(article.translations[locale].title), `${path}: translated title missing`);
      const links = [...page.matchAll(/<link\b[^>]*>/g)].map(m => attrs(m[0]));
      assert.equal(links.find(l => l.rel === "canonical")?.href, origin + path, `${path}: canonical`);
      const alternates = links.filter(l => l.rel === "alternate" && l.hrefLang);
      for (const other of journalLocales) {
        assert.ok(alternates.some(l => l.hrefLang === journalLanguageTags[other] && l.href === origin + journalHref(other,article.slug)), `${path}: missing language ${other}`);
      }
      assert.ok(decode(sitemap).includes(`<loc>${origin + path}</loc>`), `${path}: sitemap missing`);
      const schemas = [...page.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m => JSON.parse(m[1]));
      assert.ok(schemas.some(s => s["@type"] === "Article" && s.inLanguage === journalLanguageTags[locale]), `${path}: Article schema`);
      assert.doesNotMatch(page.match(/<meta name="robots"[^>]*>/)?.[0] ?? "", /noindex/, `${path}: noindex`);
      console.log(`PASS ${path}`);
    }));
  }
  for (const product of ["compatibility","sticks"]) {
    const target = selected.filter(a => product === "compatibility" ? /bazi-vs|without-birth/.test(a.slug) : /fortune/.test(a.slug));
    for (const locale of journalLocales) {
      const page = await html(`/${product}?locale=${locale}`);
      for (const article of target) assert.ok(decode(page).includes(`href="${journalHref(locale,article.slug)}"`), `${product}/${locale}: article link missing`);
    }
  }
  console.log(`Verified ${checks.length} article editions, sitemap/metadata and product links.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
