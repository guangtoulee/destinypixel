import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import Markdown from "react-markdown";
const base=process.argv[2]??"http://127.0.0.1:3024",origin="https://www.destinypixel.com";
const locales=["en","zh","zh-TW","ru"] as const,tags={en:"en",zh:"zh-Hans","zh-TW":"zh-Hant",ru:"ru"};
const catalog=JSON.parse(readFileSync("lib/hexagram-learning/catalog.json","utf8"));
const sources=JSON.parse(readFileSync("content/hexagrams/sources.json","utf8"));
const href=(id:string|undefined,locale:string)=>`/journal/${id??"hexagrams"}${locale==="en"?"":`?locale=${locale}`}`;
const decode=(s:string)=>s.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">");
const text=(s:string)=>decode(s.replace(/<[^>]*>/g," ")).replace(/\s+/g," ").trim();
const attrs=(tag:string)=>Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
async function get(path:string){const r=await fetch(new URL(path,base),{signal:AbortSignal.timeout(30000)});assert.equal(r.status,200,path);return r.text();}
function metadata(page:string,id:string|undefined,locale:typeof locales[number],sitemap:string){
 const links=[...page.matchAll(/<link\b[^>]*>/g)].map(m=>attrs(m[0]));
 assert.equal(links.find(l=>l.rel==="canonical")?.href,origin+href(id,locale));
 for(const l of locales)assert.ok(links.some(a=>a.rel==="alternate"&&a.hrefLang===tags[l]&&a.href===origin+href(id,l)));
 assert.ok(links.some(a=>a.hrefLang==="x-default"&&a.href===origin+href(id,"en")));
 assert.ok(decode(sitemap).includes(`<loc>${origin+href(id,locale)}</loc>`));
 assert.equal((page.match(/<h1[ >]/g)??[]).length,1);
 const headline=text(page.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]??'');
 assert.equal(text(page.match(/<title>([\s\S]*?)<\/title>/)?.[1]??''),`${headline} | DestinyPixel`);
 assert.ok(!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(page));
 return [...page.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1]));
}
async function main(){
 const sitemap=await get('/sitemap.xml');let count=0;
 for(const locale of locales){
  const directory=await get(href(undefined,locale)),schema=metadata(directory,undefined,locale,sitemap).find(s=>s['@type']==='CollectionPage');assert.equal(schema.mainEntity.numberOfItems,64);
  for(const c of catalog[locale])assert.ok(decode(directory).includes(`href="${href(c.id,locale)}"`));
  assert.equal((directory.match(/<div[^>]*data-hexagram-diagram/g)??[]).length,64);
  console.log(`PASS ${locale} directory: 64 complete links, accessible diagrams, metadata and ItemList`);
  for(let start=0;start<64;start+=4)await Promise.all(catalog[locale].slice(start,start+4).map(async({id}:{id:string})=>{
   const a=JSON.parse(readFileSync(`content/hexagrams/${locale}/${id}.json`,'utf8')),page=await get(href(id,locale));
   const schema=metadata(page,id,locale,sitemap).find(s=>s['@type']==='Article');assert.equal(schema.headline,a.title);assert.equal(schema.inLanguage,tags[locale]);assert.deepEqual(schema.citation,sources.filter((s:{id:string})=>a.sourceIds.includes(s.id)).map((s:{url:string})=>s.url));
   const body=page.match(/<div[^>]*data-full-manuscript[^>]*>([\s\S]*?)<\/div>/)?.[1];assert.ok(body,`${id}: missing manuscript`);
   const opening=page.match(/<div[^>]*data-manuscript-opening[^>]*>([\s\S]*?)<\/div>/)?.[1];assert.ok(opening);assert.ok(page.indexOf('data-manuscript-opening')<page.indexOf('class="journal_contents'));
   const actual=text(`<h1>${a.title}</h1>`+opening+body),expected=text(renderToStaticMarkup(<Markdown>{a.articleMarkdown}</Markdown>));assert.equal(actual,expected,`${locale}/${id}: full manuscript differs`);
   for(const line of a.lineNotes){assert.ok(actual.includes(line.classical));assert.ok(actual.includes(line.label));for(const paragraph of line.paragraphs)assert.ok(actual.includes(text(renderToStaticMarkup(<p>{paragraph}</p>))));}
   const pre=body.match(/<pre\b([^>]*)>([\s\S]*?)<\/pre>/);assert.ok(pre);assert.equal(attrs(pre[1]).role,'img');assert.ok(attrs(pre[1])['aria-label']);
   const strokes=decode(pre[2].replace(/<[^>]*>/g,'')).trim().split('\n');assert.equal(strokes.length,6);
   for(const [i,line] of [...a.lineNotes].reverse().entries()){assert.ok(strokes[i].endsWith(line.label));assert.equal(strokes[i].slice(0,strokes[i].lastIndexOf(line.label)).trim().includes(' '),line.polarity==='yin');}
   const sections=[...body.matchAll(/<h2 id="(section-\d+)"/g)].map(m=>m[1]);assert.equal(new Set(sections).size,sections.length);for(const s of sections)assert.ok(page.includes(`href="#${s}"`));
   assert.ok(page.includes(`href="/oracle${locale==='en'?'':`?locale=${locale}`}"`));count++;
  }));
  console.log(`PASS ${locale}: 64 full manuscripts, all classical quotes/line explanations, six-line diagrams, metadata and sources`);
 }
 for(const missing of ['hexagram-00','hexagram-65','hexagram-1','hexagram-11-extra']){const r=await fetch(new URL('/journal/'+missing,base));assert.equal(r.status,404);}
 console.log(`PASS ${count}/256 complete article editions + 4 directories; invalid IDs return 404`);
}
main().catch(e=>{console.error(e);process.exitCode=1});
