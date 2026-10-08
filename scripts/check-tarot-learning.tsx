import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import Markdown from "react-markdown";
const base=process.argv[2]??"http://127.0.0.1:3022";
const origin="https://www.destinypixel.com",locales=["en","zh","zh-TW","ru"] as const,tags={en:"en",zh:"zh-Hans","zh-TW":"zh-Hant",ru:"ru"};
const catalog=JSON.parse(readFileSync("lib/tarot-learning/catalog.json","utf8"));
const href=(id:string|undefined,locale:string)=>`/journal/${id?`tarot-${id}`:"tarot-cards"}${locale==="en"?"":`?locale=${locale}`}`;
const text=(s:string)=>s.replace(/<[^>]*>/g,"").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g," ").trim();
const decode=(s:string)=>s.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'");
const attributes=(tag:string)=>Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
async function get(path:string){const r=await fetch(new URL(path,base),{signal:AbortSignal.timeout(30000)});assert.equal(r.status,200,path);return r.text();}
function metadata(page:string,id:string|undefined,locale:typeof locales[number],sitemap:string){
 const links=[...page.matchAll(/<link\b[^>]*>/g)].map(m=>attributes(m[0]));
 assert.equal(links.find(l=>l.rel==="canonical")?.href,origin+href(id,locale));
 for(const l of locales)assert.ok(links.some(a=>a.rel==="alternate"&&a.hrefLang===tags[l]&&a.href===origin+href(id,l)));
 assert.ok(links.some(a=>a.hrefLang==="x-default"&&a.href===origin+href(id,"en")));
 assert.ok(decode(sitemap).includes(`<loc>${origin+href(id,locale)}</loc>`));
 assert.equal((page.match(/<h1[ >]/g)??[]).length,1);
 const headline=text(page.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]??'');
 assert.equal(text(page.match(/<title>([\s\S]*?)<\/title>/)?.[1]??''),`${headline} | DestinyPixel`);
 return [...page.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1]));
}
async function main(){
 const sitemap=await get('/sitemap.xml');let count=0;
 for(const locale of locales){
  const directory=await get(href(undefined,locale)),schema=metadata(directory,undefined,locale,sitemap).find(s=>s['@type']==='CollectionPage');assert.equal(schema.mainEntity.numberOfItems,78);
  for(const c of catalog[locale])assert.ok(decode(directory).includes(`href="${href(c.cardId,locale)}"`));
  console.log(`PASS ${locale} directory: 78 complete links, metadata and ItemList`);
  for(let start=0;start<78;start+=4)await Promise.all(catalog[locale].slice(start,start+4).map(async({cardId:id}:{cardId:string})=>{
   const a=JSON.parse(readFileSync(`content/tarot/${locale}/${id}.json`,'utf8')),page=await get(href(id,locale));
   const schema=metadata(page,id,locale,sitemap).find(s=>s['@type']==='Article');assert.equal(schema.headline,a.title);assert.equal(schema.inLanguage,tags[locale]);assert.deepEqual(schema.citation,a.sources.map((s:{url:string|null;title:string})=>s.url??s.title));
   assert.ok(page.includes(`data-tarot-learning="${id}"`));
   const article=page.match(/<article\b[^>]*>[\s\S]*?<\/article>/)?.[0]??'';
   const articleText=text(article);for(const prose of [a.quickTake.upright,a.quickTake.reversed,a.hook,...a.plainLanguageSummary?[a.plainLanguageSummary]:[]])assert.ok(articleText.includes(text(renderToStaticMarkup(<p>{prose}</p>))),`${locale}/${id}: opening text missing`);
   assert.ok(article.indexOf(a.quickTake.upright.replaceAll('&','&amp;'))<article.indexOf('data-learning-hook'),`${id} quick take after hook`);
   for(const section of a.sections){const rendered=article.match(new RegExp(`<section[^>]*data-learning-section="${section.id}"[^>]*>([\\s\\S]*?)<\\/section>`))?.[1];assert.ok(rendered,`${locale}/${id}/${section.id}: missing section`);const expected=text(renderToStaticMarkup(<Markdown>{section.bodyMarkdown}</Markdown>));assert.equal(text(rendered.replace(/<h2\b[^>]*>[\s\S]*?<\/h2>/,'')),expected,`${locale}/${id}/${section.id}: full text differs`);}
   assert.equal((article.match(/data-learning-section=/g)??[]).length,a.sections.length);assert.ok(page.includes('/tarot/attribution.json'));count++;
  }));
  console.log(`PASS ${locale}: 78 full articles; every section text, opening, metadata, sources and sitemap`);
 }
 for(const missing of ['tarot-judgment','tarot-wheel-of-fortune','tarot-not-a-card']){const r=await fetch(new URL('/journal/'+missing,base));assert.equal(r.status,404);}
 console.log(`PASS ${count}/312 complete article editions + 4 directories; unknown card routes return 404`);
}
main().catch(e=>{console.error(e);process.exitCode=1});
