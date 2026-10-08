import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tarotDeck } from "@/lib/oracle/cast";
import { tarotLearningHref,tarotLearningIds,tarotLearningId,tarotLearningSlug } from "./paths";
import { loadTarotLearningArticle } from "./content";
import { tarotLearningCatalog,tarotLearningMetadata,tarotLearningSitemap } from "./metadata";
import { journalLanguageTags,journalLocales } from "@/lib/journal-locales";
import manifest from "@/content/tarot/provenance.json";

test("every real cast ID resolves to the complete correct-language article without aliases or fallback",async()=>{
 assert.deepEqual([...tarotLearningIds],tarotDeck.map(c=>c.id));
 for(const locale of journalLocales){
  const catalog=tarotLearningCatalog(locale);assert.equal(catalog.length,78);
  for(const [i,id] of tarotLearningIds.entries()){
   const article=await loadTarotLearningArticle(id,locale);assert.ok(article);assert.equal(article.cardId,id);assert.equal(article.locale,locale==="zh"?"zh-CN":locale);assert.equal(article.deckOrder,i);
   assert.equal(article.title,catalog[i].title);assert.equal(article.sections.length>=7,true);
   const key=`${locale}/${id}` as keyof typeof manifest.articleMarkdownSha256;
   assert.equal(createHash("sha256").update(article.articleMarkdown).digest("hex"),manifest.articleMarkdownSha256[key]);
   assert.equal(tarotLearningId(tarotLearningSlug(id)),id);
  }
 }
 for(const id of ["wheel-of-fortune","judgment","__proto__","constructor","../fool","missing"]){assert.equal(await loadTarotLearningArticle(id,"en"),undefined);assert.equal(tarotLearningHref(id,"en"),undefined);assert.equal(tarotLearningId(`tarot-${id}`),undefined);}
 assert.equal(tarotDeck.find(c=>c.id==="strength")?.number,"VIII");assert.equal(tarotDeck.find(c=>c.id==="justice")?.number,"XI");
});
test("all complete articles and directory have unique reciprocal language URLs and metadata",()=>{
 const routes=tarotLearningSitemap();assert.equal(routes.length,316);assert.equal(new Set(routes.map(r=>r.url)).size,316);
 for(const id of [undefined,...tarotLearningIds])for(const locale of journalLocales){const metadata=tarotLearningMetadata(locale,id);assert.equal(metadata.alternates?.canonical,tarotLearningHref(id,locale));for(const other of journalLocales)assert.equal(metadata.alternates?.languages?.[journalLanguageTags[other]],`https://www.destinypixel.com${tarotLearningHref(id,other)}`);}
});
test("tool links cannot pull full learning articles into the client",()=>{
 for(const file of ["paths.ts","copy.ts"]){const source=readFileSync(`lib/tarot-learning/${file}`,"utf8");assert.doesNotMatch(source,/content\/tarot|loaders|catalog\.json|articleMarkdown/);}
});

test("learning links preserve released deterministic casts for English, Chinese and Russian questions",async()=>{
 const {castOracle}=await import("@/lib/oracle/cast");
 const fixtures=[
 {question:"How can I approach this?",seed:1596815601,lines:[7,8,7,8,6,7],tarot:[["tower","reversed"],["four-of-cups","upright"],["star","reversed"]]},
 {question:"我该如何准备？",seed:3515122148,lines:[8,7,7,8,7,7],tarot:[["two-of-swords","reversed"],["wheel","upright"],["two-of-cups","reversed"]]},
 {question:"Как подготовиться?",seed:822001832,lines:[7,8,7,8,7,7],tarot:[["wheel","reversed"],["star","reversed"],["knight-of-pentacles","upright"]]},
 ];
 for(const expected of fixtures){const result=castOracle({question:expected.question,questionTime:"2026-10-07T12:00:00Z",birthDate:"1990-01-15",domain:"work"});assert.equal(result.seed,expected.seed);assert.deepEqual(result.lines.map(l=>l.value),expected.lines);assert.deepEqual(result.tarot.map(c=>[c.id,c.orientation]),expected.tarot);for(const card of result.tarot)for(const locale of journalLocales)assert.ok(await loadTarotLearningArticle(card.id,locale));}
});
