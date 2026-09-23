import assert from "node:assert/strict";
import { discoveryLocales, discoveryHref, getDiscoveryCopy } from "../lib/discovery";
import { getProductSearchContent } from "../lib/product-search-content";
import { journalLanguageTags } from "../lib/journal-locales";
import { journalArticles, journalHref } from "../lib/journal";

// HTTP only: verifies published content/discovery, never submits birth details or claims indexing.
const base = process.argv[2] ?? "https://www.destinypixel.com";
const origin = "https://www.destinypixel.com";
const decode = (s: string) => s.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replace(/&#x27;|&#39;/g, "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
const attrs = (tag: string) => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], decode(m[2])]));

async function html(path: string) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, `${path}: HTTP status`);
  assert.doesNotMatch(response.headers.get("x-robots-tag") ?? "", /noindex/i, path);
  return response.text();
}

async function main() {
  const sitemap = decode(await html("/sitemap.xml"));
  await Promise.all(discoveryLocales.map(async locale => {
    const copy = getDiscoveryCopy(locale);
    const path = discoveryHref(locale);
    const page = await html(path);
    const visible = decode(page.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " "));
    assert.equal((page.match(/<h1[ >]/g) ?? []).length, 1, `${path}: single H1`);
    assert.ok(decode(page).includes(`<title>${copy.title}</title>`), `${path}: localized title`);
    assert.ok(visible.includes(getProductSearchContent("discovery", locale).title), `${path}: guide must exist outside JS`);
    assert.ok(visible.includes("1990") && visible.includes("丙寅"), `${path}: worked example`);
    assert.ok(page.includes('href="https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm"'), `${path}: calendar source`);
    const links = [...page.matchAll(/<link\b[^>]*>/g)].map(m => attrs(m[0]));
    assert.equal(links.find(l => l.rel === "canonical")?.href, origin + path, `${path}: canonical`);
    for (const other of discoveryLocales) {
      assert.ok(links.some(l => l.rel === "alternate" && l.hrefLang === journalLanguageTags[other] && l.href === origin + discoveryHref(other)), `${path}: alternate ${other}`);
    }
    assert.ok(sitemap.includes(`<loc>${origin + path}</loc>`), `${path}: sitemap`);
    const schemas = [...page.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m => JSON.parse(m[1]));
    assert.ok(schemas.some(s => s["@type"] === "WebApplication" && s.inLanguage === journalLanguageTags[locale]), `${path}: application language`);
    for (const slug of ["what-is-a-day-pillar", "prepare-birth-date-time-place", "jia-zi-day-pillar"]) {
      assert.ok(journalArticles.some(article => article.slug === slug), `Unknown guide ${slug}`);
      assert.ok(decode(page).includes(`href="${journalHref(locale, slug)}"`), `${path}: guide link ${slug}`);
    }
    for (const product of ["sticks", "compatibility"] as const) {
      const productPath = `/${product}${locale === "en" ? "" : `?locale=${locale}`}`;
      const productHtml = decode(await html(productPath));
      assert.ok(productHtml.includes(`href="${path}"`), `${productPath}: calculator link must preserve language`);
      assert.ok(decode(page).includes(`href="${productPath}"`), `${path}: reciprocal tool link`);
    }
    console.log(`PASS ${path}: initial HTML, metadata, languages, sources, sitemap and contextual links`);
  }));
  console.log("Verified four calculator editions and eight localized tool entrypoints. Indexing is not tested.");
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
