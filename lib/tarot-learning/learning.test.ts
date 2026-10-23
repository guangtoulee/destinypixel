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
import editorialManifest from "@/content/tarot-editorial/provenance.json";
import depthManifest from "@/content/tarot-depth-20261008/revisions.json";
import sampleRevisions from "@/content/encyclopedia-samples-20261011/revisions.json";
import linkMaintenance from "@/content/tarot-link-maintenance-20261019.json";
import queenRevision from "@/content/queen-swords-update-20261023/revisions.json";

test("every real cast ID resolves to the complete correct-language article without aliases or fallback",async()=>{
 assert.deepEqual([...tarotLearningIds],tarotDeck.map(c=>c.id));
 const samplePaths=new Set(["content/tarot/en/sun.json","content/tarot/zh/sun.json","content/tarot/en/moon.json","content/tarot/zh/moon.json"]);
 const sampleRecords:Record<string,{fileSha256:string;articleMarkdownSha256:string;previousFileSha256:string}>=sampleRevisions.records;
 const linkPaths=new Set(journalLocales.map(locale=>`content/tarot/${locale}/death.json`));
 const linkRecords:Record<string,{previousArticleMarkdownSha256:string;articleMarkdownSha256:string}>=linkMaintenance.records;
 const queenRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=queenRevision.records;
 assert.deepEqual(Object.keys(queenRecords).sort(),journalLocales.map(locale=>`content/tarot/${locale}/queen-of-swords.json`).sort());
 assert.deepEqual(Object.keys(linkRecords).sort(),[...linkPaths].sort());
 const digest=(raw:string|Buffer)=>createHash("sha256").update(raw).digest("hex");
 for(const locale of journalLocales){
  const catalog=tarotLearningCatalog(locale);assert.equal(catalog.length,78);
  for(const [i,id] of tarotLearningIds.entries()){
   const article=await loadTarotLearningArticle(id,locale);assert.ok(article);assert.equal(article.cardId,id);assert.equal(article.locale,locale==="zh"?"zh-CN":locale);assert.equal(article.deckOrder,i);
   assert.equal(article.title,catalog[i].title);assert.equal(article.sections.length >= (id === "sun" ? 6 : 7),true);
   const key=`${locale}/${id}` as keyof typeof manifest.articleMarkdownSha256;
   const revisedHashes:Record<string,string>=depthManifest.articleMarkdownSha256;
   let approvedHash = id === "sun" ? editorialManifest.manuscripts[`${locale}/tarot-sun`].sha256 : revisedHashes[key]??manifest.articleMarkdownSha256[key];
   const path=`content/tarot/${locale}/${id}.json`;
   if(samplePaths.has(path)){
    assert.ok(Object.hasOwn(sampleRecords,path),`Missing explicit sample receipt: ${path}`);
    const record=sampleRecords[path],previous=readFileSync(`content/encyclopedia-samples-20261011/previous/${path}`);
    assert.equal(digest(previous),record.previousFileSha256);
    assert.equal(digest(JSON.parse(previous.toString()).articleMarkdown),approvedHash,`Historical approval changed: ${path}`);
    assert.equal(digest(readFileSync(path)),record.fileSha256);
    approvedHash=record.articleMarkdownSha256;
   }
   if(linkPaths.has(path)){
    const record=linkRecords[path];
    let previousMarkdown=article.articleMarkdown;
    for(const {from,to} of linkMaintenance.urlReplacements){
     assert.ok(previousMarkdown.includes(to),`Missing maintained URL: ${path}`);
     assert.ok(!previousMarkdown.includes(from),`Unreplaced source URL: ${path}`);
     previousMarkdown=previousMarkdown.replaceAll(to,from);
    }
    assert.equal(digest(previousMarkdown),approvedHash,`Only maintained source URLs may change: ${path}`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash,`Historical link receipt mismatch: ${path}`);
    approvedHash=record.articleMarkdownSha256;
   }
   if(id==="queen-of-swords"){
    const record=queenRecords[path],previous=readFileSync(`content/queen-swords-update-20261023/previous/${path}`);
    assert.equal(digest(previous),record.previousFileSha256);
    assert.equal(digest(JSON.parse(previous.toString()).articleMarkdown),approvedHash,`Historical approval changed: ${path}`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash);
    assert.equal(digest(readFileSync(path)),record.fileSha256);
    approvedHash=record.articleMarkdownSha256;
   }
   assert.equal(digest(article.articleMarkdown),approvedHash,path);
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
