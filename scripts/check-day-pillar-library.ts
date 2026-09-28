import assert from "node:assert/strict";
import { dayPillarCycle, pillarArticleHref, pillarLibraryHref, pillarName, pillarLibraryCopy } from "../lib/day-pillar-library";
import { getPillarImagePath } from "../lib/archetype-assets";
import { journalArticleIndexable, journalArticles, journalHref } from "../lib/journal";
import { journalLocales, journalLanguageTags } from "../lib/journal-locales";
import { absoluteUrl } from "../lib/seo";

const base = process.argv[2] ?? "http://localhost:3041";
const decode = (s: string) => s.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'");
const attrs = (tag: string) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m => [m[1], decode(m[2])]));
async function get(path: string) {
  const response = await fetch(new URL(path,base),{signal:AbortSignal.timeout(30000)});
  assert.equal(response.status,200,path);
  return response;
}
function robotsTags(html: string) {
  return [...html.matchAll(/<meta\b[^>]*>/g)].map(m => attrs(m[0])).filter(tag => tag.name === "robots" || tag.name === "googlebot");
}
async function main() {
  const sitemap = decode(await (await get("/sitemap.xml")).text());
  for (const locale of journalLocales) {
    const path = pillarLibraryHref(locale), html = decode(await (await get(path)).text());
    assert.equal((html.match(/<h1[ >]/g)??[]).length,1);
    assert.ok(html.includes(pillarLibraryCopy(locale).title));
    assert.ok(html.includes(`rel="canonical" href="${absoluteUrl(path)}"`));
    assert.ok(sitemap.includes(`<loc>${absoluteUrl(path)}</loc>`));
    const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1]));
    const collection = schemas.find(s=>s["@type"]==="CollectionPage");
    assert.equal(collection.inLanguage,journalLanguageTags[locale]);
    assert.equal(collection.mainEntity.numberOfItems,60);
    assert.equal(new Set(collection.mainEntity.itemListElement.map((item:{url:string})=>item.url)).size,60);
    for (const pillar of dayPillarCycle) {
      const article = journalArticles.find(item => item.pillar === pillar);
      assert.ok(article, pillar);
      assert.ok(html.includes(`href="${pillarArticleHref(pillar,locale)}"`),`${locale}/${pillar}: directory link`);
      assert.ok(html.includes(pillarName(pillar,locale)));
      const listed = sitemap.includes(`<loc>${absoluteUrl(pillarArticleHref(pillar,locale))}</loc>`);
      assert.equal(listed, journalArticleIndexable(article), `${locale}/${pillar}: sitemap`);
    }
    const discovery = decode(await (await get(`/discover${locale === "en" ? "" : `?locale=${locale}`}`)).text());
    assert.ok(discovery.includes(`href="${path}"`),`${locale}: calculator to library`);
  }
  for(let i=0;i<60;i+=4) await Promise.all(dayPillarCycle.slice(i,i+4).map(async pillar=>{
    const path = getPillarImagePath(pillar), response = await get(path);
    assert.match(response.headers.get("content-type")??"",/image\/jpeg/);
    const article = journalArticles.find(item => item.pillar === pillar);
    assert.equal(sitemap.includes(absoluteUrl(path)), journalArticleIndexable(article), `${pillar}: sitemap image`);
  }));
  const portraits = journalArticles.filter(article => article.pillar);
  const checks = portraits.flatMap(article => journalLocales.map(locale => ({ article, locale })));
  for (let start = 0; start < checks.length; start += 4) {
    await Promise.all(checks.slice(start, start + 4).map(async ({ article, locale }) => {
      const path = journalHref(locale, article.slug);
      const page = decode(await (await get(path)).text());
      const tags = robotsTags(page);
      assert.ok(tags.some(tag => tag.name === "robots"), `${path}: robots meta`);
      const indexable = journalArticleIndexable(article);
      for (const tag of tags) {
        if (indexable) assert.doesNotMatch(tag.content ?? "", /noindex/i, `${path}: ${tag.name}`);
        else {
          assert.match(tag.content ?? "", /noindex/i, `${path}: ${tag.name}`);
          assert.match(tag.content ?? "", /(?<!no)follow/i, `${path}: ${tag.name} should follow`);
        }
      }
    }));
  }
  const nonFull = portraits.filter(article => !journalArticleIndexable(article));
  console.log(`PASS: four localized collections, all 60 article links, calculator entry links, ${portraits.length - nonFull.length} full portraits indexable, ${nonFull.length} non-full portraits × ${journalLocales.length} locales noindex,follow and out of the sitemap, 60 live JPEG cards.`);
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
