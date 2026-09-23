import assert from "node:assert/strict";
import { dayPillarCycle, pillarArticleHref, pillarLibraryHref, pillarName, pillarLibraryCopy } from "../lib/day-pillar-library";
import { getPillarImagePath } from "../lib/archetype-assets";
import { journalLocales, journalLanguageTags } from "../lib/journal-locales";
import { absoluteUrl } from "../lib/seo";

const base = process.argv[2] ?? "http://localhost:3041";
const decode = (s: string) => s.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'");
async function get(path: string) {
  const response = await fetch(new URL(path,base),{signal:AbortSignal.timeout(30000)});
  assert.equal(response.status,200,path);
  return response;
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
      assert.ok(html.includes(`href="${pillarArticleHref(pillar,locale)}"`),`${locale}/${pillar}: directory link`);
      assert.ok(html.includes(pillarName(pillar,locale)));
      assert.ok(sitemap.includes(`<loc>${absoluteUrl(pillarArticleHref(pillar,locale))}</loc>`));
    }
    const discovery = decode(await (await get(`/discover${locale === "en" ? "" : `?locale=${locale}`}`)).text());
    assert.ok(discovery.includes(`href="${path}"`),`${locale}: calculator to library`);
  }
  for(let i=0;i<60;i+=4) await Promise.all(dayPillarCycle.slice(i,i+4).map(async pillar=>{
    const path = getPillarImagePath(pillar), response = await get(path);
    assert.match(response.headers.get("content-type")??"",/image\/jpeg/);
    assert.ok(sitemap.includes(absoluteUrl(path)),`${pillar}: sitemap image`);
  }));
  console.log("PASS: four localized collections, all 60 article links, calculator entry links, sitemap images and 60 live JPEG cards.");
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
