import assert from "node:assert/strict";
import { productFactsCopy, productFactsHref, productFactsLocales, productFactsAlternates } from "../lib/product-facts";
import { compatibilityTimeCopy } from "../lib/compatibility/time-copy";
import { journalLanguageTags } from "../lib/journal-locales";
const base = process.argv[2] ?? "http://localhost:3047";
const origin = "https://www.destinypixel.com";
const decode = (s:string) => s.replaceAll("&amp;","&").replaceAll("&quot;",'"').replace(/&#x27;|&#39;/g,"'");
async function get(path:string) {
  const response = await fetch(new URL(path,base),{signal:AbortSignal.timeout(30000)});
  assert.equal(response.status,200,path);
  return response;
}
async function main(){
  const catalog = await (await get("/api/products.json")).json();
  const robots = await (await get("/robots.txt")).text();
  assert.ok(robots.includes("Allow: /api/products.json$") && robots.includes("Allow: /api/ai-profile.json$") && robots.includes("Disallow: /api/"));
  const agent = await (await get("/.well-known/agent-products.json")).json();
  const profile = await (await get("/api/ai-profile.json")).json();
  assert.deepEqual(catalog,agent);
  assert.deepEqual(profile.productIds,catalog.products.map((p:{id:string})=>p.id));
  assert.equal(catalog.compatibility.missingTimeDefault,null);
  assert.equal(catalog.compatibility.dateScoreUsesPlanetaryAspects,false);
  assert.equal(catalog.products.length,11);
  const sitemap = decode(await (await get("/sitemap.xml")).text());
  const llms = await (await get("/llms.txt")).text();
  assert.ok(llms.includes(catalog.catalogUrl) && llms.includes("Unknown") && llms.includes("date-based"));
  for (const l of productFactsLocales) {
    const path=productFactsHref(l),html=decode(await (await get(path)).text());
    const visible=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<[^>]+>/g,"");
    const links=[...html.matchAll(/<link\b[^>]*>/g)].map(m=>Object.fromEntries([...m[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],a[2]])));
    assert.equal(links.find(a=>a.rel==="canonical")?.href,origin+path);
    assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
    assert.ok(visible.includes(productFactsCopy(l).title));
    for (const p of catalog.products) assert.ok(visible.includes(p.translations[l].inputs));
    for (const [lang,url] of Object.entries(productFactsAlternates())) assert.ok(links.some(a=>a.rel==="alternate" && a.hrefLang===lang && a.href===url));
    assert.ok(sitemap.includes(`<loc>${origin+path}</loc>`));
    const pair=decode(await (await get(`/compatibility${l==="en"?"":`?locale=${l}`}`)).text());
    assert.ok(pair.includes(compatibilityTimeCopy(l).unknown));
    assert.ok(pair.includes(`lang="${journalLanguageTags[l]}"`));
    console.log(`PASS ${l}: product facts, SSR, canonical, language links, sitemap and unknown-time form`);
  }
  // Three fictional fixtures, calculate only: never call an AI provider or save records.
  const people=[{birthDate:"1991-03-21",birthTime:"10:35",cityId:"new-york-us"},{birthDate:"1993-10-04",birthTime:"17:20",cityId:"shanghai-cn"}];
  for (const unknown of [[false,false],[true,false],[true,true]]) {
    const response=await fetch(new URL("/api/compatibility",base),{method:"POST",headers:{"Content-Type":"application/json",origin:new URL(base).origin},body:JSON.stringify({people:people.map((p,i)=>({...p,timeKnown:!unknown[i],birthTime:unknown[i]?"":p.birthTime})),mode:"calculate",locale:"en",consent:true}),signal:AbortSignal.timeout(30000)});
    assert.equal(response.status,200);
    assert.equal(response.headers.get("cache-control"),"private, no-store");
    const {result}=await response.json();
    assert.equal(result.mode,unknown.some(Boolean)?"date-only":"full");
    unknown.forEach((v,i)=>{if(v){assert.equal(result.people[i].pillars.hour,null);assert.equal(result.people[i].planets.length,0);}});
  }
  console.log("PASS public JSON and three private calculation modes. No indexing or traffic claim.");
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
