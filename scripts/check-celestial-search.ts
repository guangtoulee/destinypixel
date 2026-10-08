import assert from "node:assert/strict";
import { celestialCopy, celestialHref, celestialLocales, celestialAlternates } from "../lib/celestial/copy";
import { celestialSearchContent, celestialContentUpdatedAt } from "../lib/celestial/search-content";
import { journalLanguageTags } from "../lib/journal-locales";
import { tarotWorkspaceCopy } from "../lib/tarot-workspace-copy";

const base = process.argv[2] || "http://localhost:3045";
const origin = "https://www.destinypixel.com";
const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const attrs = (s: string) => Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1].toLowerCase(), decode(m[2])]));
async function get(path: string) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(25000) });
  assert.equal(response.status, 200, `${path}: HTTP`);
  assert.doesNotMatch(response.headers.get("x-robots-tag") || "", /noindex/i);
  return response.text();
}
async function main() {
  const sitemap = decode(await get("/sitemap.xml"));
  for (const kind of ["astrology", "tarot"] as const) {
    for (const locale of celestialLocales) {
      const path = celestialHref(`/${kind}`, locale), c = celestialCopy(locale), guide = celestialSearchContent(kind, locale);
      const html = await get(path), decoded = decode(html);
      const rendered = decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "").replace(/<[^>]*>/g, ""));
      assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${path}: single H1`);
      assert.equal(decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] || ""), kind === "astrology" ? c.astroTitle : c.tarotTitle);
      assert.ok(rendered.includes(kind === "astrology" ? c.astroHeading : tarotWorkspaceCopy(locale).title), `${path}: localized H1`);
      for (const text of [guide.title, guide.intro, ...guide.steps, ...guide.sections.flatMap(s => [s.title, s.text]), ...guide.faqs.flatMap(f => [f.q, f.a])]) {
        assert.ok(rendered.includes(text), `${path}: missing SSR text ${text.slice(0, 45)}`);
      }
      assert.ok(html.includes(`lang="${journalLanguageTags[locale]}"`));
      const links = [...html.matchAll(/<link\b[^>]*>/g)].map(m => attrs(m[0]));
      assert.equal(links.find(l => l.rel === "canonical")?.href, origin + path);
      for (const [lang, href] of Object.entries(celestialAlternates(`/${kind}`))) {
        assert.ok(links.some(l => l.rel === "alternate" && l.hreflang === lang && l.href === origin + href), `${path}: ${lang}`);
      }
      const meta = [...html.matchAll(/<meta\b[^>]*>/g)].map(m => attrs(m[0]));
      assert.doesNotMatch(meta.filter(m => ["robots", "googlebot"].includes(m.name)).map(m => m.content).join(" "), /noindex/i);
      assert.equal(meta.find(m => m.name === "description")?.content, kind === "astrology" ? c.astroDescription : c.tarotDescription);
      const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m => { const s = JSON.parse(m[1]); return s["@graph"] || [s]; });
      const app = schemas.find(s => s["@type"] === "WebApplication"), page = schemas.find(s => s["@type"] === "WebPage" && s.url === origin + path);
      assert.equal(app?.inLanguage, journalLanguageTags[locale]);
      assert.equal(page?.dateModified, celestialContentUpdatedAt);
      assert.equal(schemas.find(s => s["@type"] === "BreadcrumbList")?.itemListElement.at(-1).item, origin + path);
      const entry = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].find(m => m[1].includes(`<loc>${origin + path}</loc>`))?.[1];
      assert.ok(entry?.includes(`<lastmod>${celestialContentUpdatedAt}`), `${path}: sitemap date`);
      for (const link of guide.related) {
        const href = celestialHref(link.path, locale);
        assert.ok(decoded.includes(`href="${href}"`), `${path}: related link ${href}`);
        await get(href);
      }
      console.log(`PASS ${path}: rendered guide, metadata, language cluster, schema, sitemap, links`);
    }
  }
  for (const locale of celestialLocales) {
    const home = decode(await get(celestialHref("/", locale)));
    for (const tool of ["astrology", "tarot"]) assert.ok(home.includes(`href="${celestialHref(`/${tool}`, locale)}"`));
  }
  assert.ok((await get("/insights/i-ching-vs-tarot")).includes('href="/tarot"'));
  assert.ok((await get("/learn/what-is-bazi-birth-chart")).includes('href="/astrology"'));
  const llms = await get("/llms.txt");
  assert.ok(llms.includes(origin + "/astrology") && llms.includes(origin + "/tarot"));
  console.log("Verified 8 tool editions and homepage/guide entry links. This does not establish search indexing or traffic.");
}
main().catch(e => { console.error(e); process.exitCode = 1; });
