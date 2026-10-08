import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const base=process.argv[2]??"http://127.0.0.1:3026";
const origin="https://www.destinypixel.com";
const decode=(s:string)=>s.replace(/&amp;/g,"&");
async function get(path:string){const r=await fetch(new URL(path,base));assert.equal(r.status,200,path);return r.text();}
async function main(){
 const sitemap=await get('/sitemap.xml'),urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>decode(m[1]));
 assert.equal(new Set(urls).size,urls.length);
 for(const locale of ['en','zh','zh-TW','ru']){
  const suffix=locale==='en'?'':`?locale=${locale}`,html=await get('/journal'+suffix);
  const schema=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1])).find(s=>s['@type']==='CollectionPage');
  const items=schema.mainEntity.itemListElement;assert.equal(items.length,schema.mainEntity.numberOfItems);
  assert.deepEqual(items.map((x:{position:number})=>x.position),items.map((_:unknown,i:number)=>i+1));
  for(const slug of ['day-pillars','tarot-cards','hexagrams']){const path=`/journal/${slug}${suffix}`;assert.ok(decode(html).includes(`href="${path}"`));assert.ok(items.some((i:{url:string})=>i.url===origin+path));assert.ok(urls.includes(origin+path));}
  const cards=JSON.parse(readFileSync('lib/tarot-learning/catalog.json','utf8'))[locale];
  assert.equal(cards.length,78);for(const card of cards)assert.ok(urls.includes(`${origin}/journal/tarot-${card.cardId}${suffix}`));
  for(let n=1;n<=64;n++)assert.ok(urls.includes(`${origin}/journal/hexagram-${String(n).padStart(2,'0')}${suffix}`));
  const tarot=await get('/tarot'+suffix),oracle=await get('/oracle'+suffix);
  assert.ok(decode(tarot).includes(`href="/journal/tarot-cards${suffix}"`));assert.ok(decode(oracle).includes(`href="/journal/hexagrams${suffix}"`));
  console.log(`PASS ${locale}: all three journal libraries, contiguous schema positions, reciprocal sitemap and both tool entry links coexist`);
 }
 assert.equal(urls.filter(u=>new URL(u).pathname.startsWith('/journal')).length,872);
 console.log('PASS combined journal: 856 article editions + 16 index/directory editions, all unique');
}
main().catch(e=>{console.error(e);process.exitCode=1});
