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
import hangedManRevision from "@/content/hanged-man-update-20261024/revisions.json";
import hangedManPollackRevision from "@/content/hanged-man-update-20261108/revisions.json";
import starRevision from "@/content/star-update-20261025/revisions.json";
import eightSwordsRevision from "@/content/eight-swords-update-20261102/revisions.json";
import sevenCupsRevision from "@/content/seven-cups-update-20261103/revisions.json";
import kingPentaclesRevision from "@/content/king-pentacles-update-20261105/revisions.json";
import judgementRevision from "@/content/judgement-update-20261103/revisions.json";
import moonRevision from "@/content/moon-update-20261103/revisions.json";
import sunRevision from "@/content/sun-update-20261103/revisions.json";
import towerRevision from "@/content/tower-update-20261104/revisions.json";
import devilRevision from "@/content/devil-update-20261104/revisions.json";
import temperanceRevision from "@/content/temperance-update-20261105/revisions.json";
import twoSwordsRevision from "@/content/two-swords-update-20261106/revisions.json";
import worldRevision from "@/content/world-update-20261106/revisions.json";
import deathRevision from "@/content/death-update-20261107/revisions.json";
import justiceRevision from "@/content/justice-update-20261109/revisions.json";
import twoPentaclesPlayRevision from "@/content/two-pentacles-play-20261110/revisions.json";
import wheelRevision from "@/content/wheel-update-20261110/revisions.json";
import hermitRevision from "@/content/hermit-update-20261111/revisions.json";

test("every real cast ID resolves to the complete correct-language article without aliases or fallback",async()=>{
 assert.deepEqual([...tarotLearningIds],tarotDeck.map(c=>c.id));
 const samplePaths=new Set(["content/tarot/en/sun.json","content/tarot/zh/sun.json","content/tarot/en/moon.json","content/tarot/zh/moon.json"]);
 const sampleRecords:Record<string,{fileSha256:string;articleMarkdownSha256:string;previousFileSha256:string}>=sampleRevisions.records;
 const linkPaths=new Set(journalLocales.map(locale=>`content/tarot/${locale}/death.json`));
 const linkRecords:Record<string,{previousArticleMarkdownSha256:string;articleMarkdownSha256:string}>=linkMaintenance.records;
 const queenRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=queenRevision.records;
 const hangedManRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=hangedManRevision.records;
 const hangedManPollackRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=hangedManPollackRevision.records;
 const starRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=starRevision.records;
 const eightSwordsRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=eightSwordsRevision.records;
 const sevenCupsRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=sevenCupsRevision.records;
 const kingPentaclesRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=kingPentaclesRevision.records;
 const twoSwordsRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=twoSwordsRevision.records;
 const judgementRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=judgementRevision.records;
 const moonRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=moonRevision.records;
 const sunRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=sunRevision.records;
 const towerRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=towerRevision.records;
 const devilRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=devilRevision.records;
 const temperanceRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=temperanceRevision.records;
 const worldRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=worldRevision.records;
 const deathRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=deathRevision.records;
 const justiceRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=justiceRevision.records;
 const twoPentaclesPlayRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=twoPentaclesPlayRevision.records;
 const wheelRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=wheelRevision.records;
 const hermitRecords:Record<string,{previousFileSha256:string;previousArticleMarkdownSha256:string;fileSha256:string;articleMarkdownSha256:string}>=hermitRevision.records;
 const depthRecords:Record<string,{recordSha256:string}>=depthManifest.editions;
 assert.deepEqual(Object.keys(queenRecords).sort(),journalLocales.map(locale=>`content/tarot/${locale}/queen-of-swords.json`).sort());
 assert.deepEqual(Object.keys(hangedManRecords).sort(),["en","zh"].map(locale=>`content/tarot/${locale}/hanged-man.json`));
 assert.deepEqual(Object.keys(hangedManPollackRecords),["content/tarot/zh/hanged-man.json"]);
 assert.deepEqual(Object.keys(starRecords).sort(),["en","zh"].map(locale=>`content/tarot/${locale}/star.json`));
 assert.deepEqual(Object.keys(eightSwordsRecords).sort(),["en","zh"].map(locale=>`content/tarot/${locale}/eight-of-swords.json`));
 assert.deepEqual(Object.keys(sevenCupsRecords).sort(),["en","zh"].map(locale=>`content/tarot/${locale}/seven-of-cups.json`));
 assert.deepEqual(Object.keys(kingPentaclesRecords).sort(),["en","zh"].map(locale=>`content/tarot/${locale}/king-of-pentacles.json`));
 assert.deepEqual(Object.keys(twoSwordsRecords).sort(),["en","zh"].map(locale=>`content/tarot/${locale}/two-of-swords.json`));
 assert.deepEqual(Object.keys(judgementRecords),["content/tarot/zh/judgement.json"]);
 assert.deepEqual(Object.keys(moonRecords),["content/tarot/zh/moon.json"]);
 assert.deepEqual(Object.keys(sunRecords),["content/tarot/zh/sun.json"]);
 assert.deepEqual(Object.keys(towerRecords),["content/tarot/zh/tower.json"]);
 assert.deepEqual(Object.keys(devilRecords),["content/tarot/zh/devil.json"]);
 assert.deepEqual(Object.keys(temperanceRecords),["content/tarot/zh/temperance.json"]);
 assert.deepEqual(Object.keys(worldRecords),["content/tarot/zh/world.json"]);
 assert.deepEqual(Object.keys(deathRecords),["content/tarot/zh/death.json"]);
 assert.deepEqual(Object.keys(justiceRecords),["content/tarot/zh/justice.json"]);
 assert.deepEqual(Object.keys(twoPentaclesPlayRecords).sort(),["en","zh"].map(locale=>`content/tarot/${locale}/two-of-pentacles.json`));
 assert.deepEqual(Object.keys(wheelRecords),["content/tarot/zh/wheel.json"]);
 assert.deepEqual(Object.keys(hermitRecords),["content/tarot/zh/hermit.json"]);
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
    const receiptRaw=path==="content/tarot/zh/moon.json"?readFileSync(`content/moon-update-20261103/previous/${path}`):path==="content/tarot/zh/sun.json"?readFileSync(`content/sun-update-20261103/previous/${path}`):readFileSync(path);
    assert.equal(digest(receiptRaw),record.fileSha256);
    approvedHash=record.articleMarkdownSha256;
   }
   if(linkPaths.has(path)){
    const record=linkRecords[path];
    let previousMarkdown=Object.hasOwn(deathRecords,path)?JSON.parse(readFileSync(`content/death-update-20261107/previous/${path}`,"utf8")).articleMarkdown:article.articleMarkdown;
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
   if(Object.hasOwn(hangedManRecords,path)){
    const record=hangedManRecords[path],previousRaw=readFileSync(`content/hanged-man-update-20261024/previous/${path}`);
    const previous=JSON.parse(previousRaw.toString());
    const receiptPath=Object.hasOwn(hangedManPollackRecords,path)?`content/hanged-man-update-20261108/previous/${path}`:path;
    const receiptRaw=readFileSync(receiptPath);
    const current=JSON.parse(receiptRaw.toString());
    assert.equal(digest(previousRaw),record.previousFileSha256);
    assert.equal(digest(previous.articleMarkdown),approvedHash,`Historical approval changed: ${path}`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash);
    assert.equal(digest(receiptRaw),record.fileSha256);
    for(const field of ["cardId","locale","deckOrder","number","title","hook","quickTake","keywords","relatedCards","image","contentProvenance","review","publicationStatus","publishedAt","legacyIntroAnchors","legacyRelatedAnchors"]){
     assert.deepEqual(current[field],previous[field],`${path}: retained ${field}`);
    }
    assert.equal(current.updatedAt,"2026-10-24");
    assert.ok(current.shortAnswer?.title && current.shortAnswer?.body,`${path}: direct answer missing`);
    assert.ok(current.articleMarkdown.includes(current.shortAnswer.body),`${path}: direct answer absent from complete Markdown`);
    const retainedIds=new Set(previous.sections.map((section:{id:string})=>section.id));
    assert.deepEqual(current.sections.filter((section:{id:string})=>retainedIds.has(section.id)),previous.sections,`${path}: original section text, order or anchors changed`);
    assert.ok(current.sections.length>previous.sections.length,`${path}: no substantive section added`);
    assert.deepEqual(current.sources.slice(0,previous.sources.length),previous.sources,`${path}: original source receipts changed`);
    assert.ok(current.sources.length>previous.sources.length,`${path}: no additional sources`);
    approvedHash=record.articleMarkdownSha256;
   }
   if(Object.hasOwn(hangedManPollackRecords,path)){
    const record=hangedManPollackRecords[path],previousRaw=readFileSync(`content/hanged-man-update-20261108/previous/${path}`);
    const previous=JSON.parse(previousRaw.toString()),current=JSON.parse(readFileSync(path,"utf8"));
    assert.equal(digest(previousRaw),record.previousFileSha256);
    assert.equal(digest(previous.articleMarkdown),approvedHash,`${path}: historical text approval changed`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash);
    assert.equal(digest(readFileSync(path)),record.fileSha256);
    const changedFields=new Set(["sections","sources","articleMarkdown","updatedAt","editorialRevision"]);
    for(const field of Object.keys(previous).filter(field=>!changedFields.has(field)))assert.deepEqual(current[field],previous[field],`${path}: retained ${field}`);
    const previousIds=previous.sections.map((section:{id:string})=>section.id);
    assert.deepEqual(current.sections.filter((section:{id:string})=>previousIds.includes(section.id)).map((section:{id:string})=>section.id),previousIds,`${path}: original section order changed`);
    assert.deepEqual(current.sections.filter((section:{id:string})=>!previousIds.includes(section.id)).map((section:{id:string;role:string;title:string})=>[section.id,section.role,section.title]),[["depth-sequence","comparison","为什么倒吊人连着世界，又为死神做准备"]]);
    assert.equal(current.sections.findIndex((section:{id:string})=>section.id==="depth-sequence"),previous.sections.findIndex((section:{id:string})=>section.id==="depth-comparison")+1);
    for(const sectionId of ["section-01","section-04"]){
     const oldSection=previous.sections.find((section:{id:string})=>section.id===sectionId);
     const newSection=current.sections.find((section:{id:string})=>section.id===sectionId);
     assert.ok(newSection.bodyMarkdown.startsWith(oldSection.bodyMarkdown+"\n\n"));
     const addedText=newSection.bodyMarkdown.slice(oldSection.bodyMarkdown.length).trim();
     assert.equal(addedText.split("\n\n").length,1);
    }
    assert.deepEqual(current.sections.find((section:{id:string})=>section.id==="depth-comparison"),previous.sections.find((section:{id:string})=>section.id==="depth-comparison"));
    assert.deepEqual(current.sections.find((section:{id:string})=>section.id==="orientation-and-position"),previous.sections.find((section:{id:string})=>section.id==="orientation-and-position"));
    assert.equal(current.articleMarkdown.includes("接受生命的节律"),true);
    assert.equal(current.articleMarkdown.includes("主动加入"),true);
    assert.equal(current.articleMarkdown.includes("态度与经验的逆转"),true);
    assert.equal(current.articleMarkdown.includes("倒挂身体"),true);
    assert.equal(current.articleMarkdown.includes("不能保证等待必有回报"),true);
    assert.equal(current.articleMarkdown.includes("为什么倒吊人连着世界，又为死神做准备"),true);
    assert.equal(current.articleMarkdown.includes("世界的舞者"),true);
    assert.equal(current.articleMarkdown.includes("不能改写已经记下的正逆位"),true);
    assert.equal(current.articleMarkdown.includes("不能拿来覆盖 Waite"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-world?locale=zh#depth-sequence"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-death?locale=zh#depth-sequence"),true);
    assert.equal(current.articleMarkdown.includes("社会压力"),true);
    assert.equal(current.articleMarkdown.includes("他人期望"),true);
    assert.equal(current.articleMarkdown.includes("等太久了"),true);
    assert.equal(current.articleMarkdown.includes("诊断"),true);
    assert.equal(current.articleMarkdown.includes("支持系统"),true);
    assert.equal(current.articleMarkdown.includes("臣服"),false);
    assert.equal(current.articleMarkdown.includes("世界之树"),false);
    assert.equal(current.articleMarkdown.includes("松开口径"),false);
    assert.equal(current.articleMarkdown.includes("小我"),false);
    assert.equal(current.articleMarkdown.includes("二手"),false);
    assert.equal(current.articleMarkdown.includes("现稿已"),false);
    assert.equal(current.articleMarkdown.includes("死神页已写"),false);
    assert.equal(current.articleMarkdown.includes("12 是 21"),false);
    assert.equal(current.articleMarkdown.includes("中点"),false);
    assert.equal(current.articleMarkdown.includes("数秘"),false);
    assert.deepEqual(current.sources.slice(0,previous.sources.length),previous.sources,`${path}: original source receipts changed`);
    assert.equal(current.sources.length,previous.sources.length+2);
    assert.equal(current.sources.at(-2).sourceId,"hanged-man-pollack-2010");
    assert.equal(current.sources.at(-1).sourceId,"hanged-man-pollack-death-chapter-2010");
    assert.equal(current.sources.at(-2).url,null);
    assert.equal(current.sources.at(-1).url,null);
    assert.deepEqual(current.sources.at(-2).sourceMetadata.pdfPages,[128,129,130,131,132]);
    assert.deepEqual(current.sources.at(-1).sourceMetadata.pdfPages,[135]);
    assert.equal(current.updatedAt,"2026-11-08");
    assert.equal(current.publishedAt,"2026-10-07");
    approvedHash=record.articleMarkdownSha256;
   }else if(id==="hanged-man" && locale!=="en"){
    assert.equal(article.articleMarkdown.includes("Pollack"),false,`${path}: unedited Hanged Man edition gained the Pollack supplement`);
    assert.equal(article.updatedAt,"2026-10-08");
   }
   if(Object.hasOwn(starRecords,path)){
    const record=starRecords[path],previousRaw=readFileSync(`content/star-update-20261025/previous/${path}`);
    const previous=JSON.parse(previousRaw.toString()),current=JSON.parse(readFileSync(path,"utf8"));
    assert.equal(digest(previousRaw),record.previousFileSha256);
    assert.equal(record.previousFileSha256,depthRecords[key].recordSha256,`${path}: original file approval changed`);
    assert.equal(digest(previous.articleMarkdown),approvedHash,`Historical approval changed: ${path}`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash);
    assert.equal(digest(readFileSync(path)),record.fileSha256);
    const changedFields=new Set(["shortAnswer","sections","sources","sourceAppendix","articleMarkdown","updatedAt","editorialRevision"]);
    for(const field of Object.keys(previous).filter(field=>!changedFields.has(field)))assert.deepEqual(current[field],previous[field],`${path}: retained ${field}`);
    assert.equal(current.updatedAt,"2026-10-25");
    assert.ok(current.shortAnswer?.title && current.shortAnswer?.body);
    assert.ok(current.articleMarkdown.includes(current.shortAnswer.body));
    const retainedIds=new Set(previous.sections.map((section:{id:string})=>section.id));
    const retained=current.sections.filter((section:{id:string})=>retainedIds.has(section.id));
    assert.equal(previous.sections.length,8);
    assert.deepEqual(retained.map((section:{id:string})=>section.id),previous.sections.map((section:{id:string})=>section.id),`${path}: original section order/IDs changed`);
    for(const section of previous.sections){
     const replacement=retained.find((item:{id:string})=>item.id===section.id);
     if(section.id==="section-02"){
      assert.deepEqual({...replacement,bodyMarkdown:section.bodyMarkdown},section,`${path}: original tradition metadata changed`);
      assert.equal(replacement.bodyMarkdown.split("\n\n")[0],section.bodyMarkdown.split("\n\n")[0],`${path}: original Part II paragraph changed`);
     }else assert.deepEqual(replacement,section,`${path}: original section text changed: ${section.id}`);
    }
    assert.deepEqual(current.sections.filter((section:{id:string})=>!retainedIds.has(section.id)).map((section:{id:string;role:string})=>[section.id,section.role]),[["pollack-and-hope","tradition"],["facts-support-and-outcomes","practice"]]);
    assert.deepEqual(current.sources.slice(0,previous.sources.length),previous.sources,`${path}: original source receipts changed`);
    assert.ok(current.sources.length>previous.sources.length);
    for(const [field,value] of Object.entries(previous.sourceAppendix))assert.deepEqual(current.sourceAppendix[field],value,`${path}: original source anchor changed`);
    const anchors=[...current.sections.map((section:{id:string})=>section.id),...(current.legacyIntroAnchors??[]),...(current.legacyRelatedAnchors??[]),...current.sections.flatMap((section:{legacyAnchors?:string[]})=>section.legacyAnchors??[]),current.sourceAppendix.id];
    assert.equal(new Set(anchors).size,anchors.length,`${path}: duplicate anchors`);
    for(const section of current.sections)assert.ok(current.articleMarkdown.includes(`## ${section.title}\n\n${section.bodyMarkdown}`),`${path}: section absent from complete Markdown: ${section.id}`);
    const book=current.sources.find((source:{sourceId?:string})=>source.sourceId==="star-pollack-2010");
    assert.ok(book,`${path}: attributed book reference missing`);
    assert.equal(book.url,null,`${path}: local book must not acquire an invented public URL`);
    assert.deepEqual(book.sourceMetadata.pdfPages,[158,159,160,161]);
    assert.deepEqual(book.sourceMetadata.printedPages,[158,159,160,161]);
    approvedHash=record.articleMarkdownSha256;
   }else if(id==="star"){
    assert.equal(digest(readFileSync(path)),depthRecords[key].recordSha256,`${path}: unedited Star file changed`);
   }
   if(Object.hasOwn(eightSwordsRecords,path)){
    const record=eightSwordsRecords[path],previousRaw=readFileSync(`content/eight-swords-update-20261102/previous/${path}`);
    const previous=JSON.parse(previousRaw.toString()),current=JSON.parse(readFileSync(path,"utf8"));
    assert.equal(digest(previousRaw),record.previousFileSha256);
    assert.equal(record.previousFileSha256,depthRecords[key].recordSha256,`${path}: original file approval changed`);
    assert.equal(digest(previous.articleMarkdown),approvedHash,`${path}: historical text approval changed`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash);
    assert.equal(digest(readFileSync(path)),record.fileSha256);
    const changedFields=new Set(["sections","sources","articleMarkdown","updatedAt","editorialRevision"]);
    assert.deepEqual(Object.keys(current).filter(field=>!changedFields.has(field)).sort(),Object.keys(previous).filter(field=>!changedFields.has(field)).sort());
    for(const field of Object.keys(previous).filter(field=>!changedFields.has(field)))assert.deepEqual(current[field],previous[field],`${path}: retained ${field}`);
    const added=current.sections.filter((section:{id:string})=>!previous.sections.some((old:{id:string})=>old.id===section.id));
    assert.equal(previous.sections.length,11);
    assert.deepEqual(added.map((section:{id:string;role:string})=>[section.id,section.role]),[["number-and-image","practice"]]);
    assert.equal(current.sections.length,previous.sections.length+1);
    assert.deepEqual(current.sections.filter((section:{id:string})=>section.id!=="number-and-image"),previous.sections,`${path}: original section content/order/anchors changed`);
    assert.equal(current.sections.findIndex((section:{id:string})=>section.id==="number-and-image"),previous.sections.findIndex((section:{id:string})=>section.id==="section-02")+1);
    assert.deepEqual(current.sources.slice(0,previous.sources.length),previous.sources,`${path}: original source receipts changed`);
    assert.equal(current.sources.length,previous.sources.length+2);
    assert.equal(current.updatedAt,"2026-11-02");
    const newBlock=`## ${added[0].title}\n\n${added[0].bodyMarkdown}\n\n`;
    assert.equal(current.articleMarkdown.split(newBlock).length,2,`${path}: new section missing or duplicated in complete Markdown`);
    assert.equal(current.articleMarkdown.replace(newBlock,""),previous.articleMarkdown,`${path}: complete historical Markdown changed outside the addition`);
    approvedHash=record.articleMarkdownSha256;
   }else if(id==="eight-of-swords"){
    assert.equal(digest(readFileSync(path)),depthRecords[key].recordSha256,`${path}: unedited Eight of Swords edition changed`);
   }
   if(Object.hasOwn(sevenCupsRecords,path)){
    const record=sevenCupsRecords[path],previousRaw=readFileSync(`content/seven-cups-update-20261103/previous/${path}`);
    const previous=JSON.parse(previousRaw.toString()),current=JSON.parse(readFileSync(path,"utf8"));
    assert.equal(digest(previousRaw),record.previousFileSha256);
    assert.equal(record.previousFileSha256,depthRecords[key].recordSha256,`${path}: original file approval changed`);
    assert.equal(digest(previous.articleMarkdown),approvedHash,`${path}: historical text approval changed`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash);
    assert.equal(digest(readFileSync(path)),record.fileSha256);
    const changedFields=new Set(["sections","sources","articleMarkdown","updatedAt","editorialRevision"]);
    assert.deepEqual(Object.keys(current).filter(field=>!changedFields.has(field)).sort(),Object.keys(previous).filter(field=>!changedFields.has(field)).sort());
    for(const field of Object.keys(previous).filter(field=>!changedFields.has(field)))assert.deepEqual(current[field],previous[field],`${path}: retained ${field}`);
    const added=current.sections.filter((section:{id:string})=>!previous.sections.some((old:{id:string})=>old.id===section.id));
    assert.equal(previous.sections.length,10);
    assert.deepEqual(added.map((section:{id:string;role:string})=>[section.id,section.role]),[["creative-resource-practice","practice"]]);
    assert.equal(current.sections.length,previous.sections.length+1);
    assert.deepEqual(current.sections.filter((section:{id:string})=>section.id!=="creative-resource-practice"),previous.sections,`${path}: original section content/order/anchors changed`);
    assert.equal(current.sections.findIndex((section:{id:string})=>section.id==="creative-resource-practice"),previous.sections.findIndex((section:{id:string})=>section.id==="depth-positions")+1);
    assert.deepEqual(current.sources.slice(0,previous.sources.length),previous.sources,`${path}: original source receipts changed`);
    assert.equal(current.sources.length,previous.sources.length+1);
    assert.equal(current.updatedAt,"2026-11-03");
    const newBlock=`## ${added[0].title}\n\n${added[0].bodyMarkdown}\n\n`;
    assert.equal(current.articleMarkdown.split(newBlock).length,2,`${path}: new section missing or duplicated in complete Markdown`);
    assert.equal(current.articleMarkdown.replace(newBlock,""),previous.articleMarkdown,`${path}: complete historical Markdown changed outside the addition`);
    approvedHash=record.articleMarkdownSha256;
   }else if(id==="seven-of-cups"){
    assert.equal(digest(readFileSync(path)),depthRecords[key].recordSha256,`${path}: unedited Seven of Cups edition changed`);
   }
   if(Object.hasOwn(kingPentaclesRecords,path)){
    const record=kingPentaclesRecords[path],previousRaw=readFileSync(`content/king-pentacles-update-20261105/previous/${path}`);
    const previous=JSON.parse(previousRaw.toString()),current=JSON.parse(readFileSync(path,"utf8"));
    assert.equal(digest(previousRaw),record.previousFileSha256);
    assert.equal(record.previousFileSha256,depthRecords[key].recordSha256,`${path}: original file approval changed`);
    assert.equal(digest(previous.articleMarkdown),approvedHash,`${path}: historical text approval changed`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash);
    assert.equal(digest(readFileSync(path)),record.fileSha256);
    const changedFields=new Set(["sections","sources","articleMarkdown","updatedAt","editorialRevision"]);
    assert.deepEqual(Object.keys(current).filter(field=>!changedFields.has(field)).sort(),Object.keys(previous).filter(field=>!changedFields.has(field)).sort());
    for(const field of Object.keys(previous).filter(field=>!changedFields.has(field)))assert.deepEqual(current[field],previous[field],`${path}: retained ${field}`);
    const added=current.sections.filter((section:{id:string})=>!previous.sections.some((old:{id:string})=>old.id===section.id));
    assert.equal(previous.sections.length,12);
    assert.deepEqual(added.map((section:{id:string;role:string})=>[section.id,section.role]),[["resources-and-freedom","practice"]]);
    assert.equal(current.sections.length,previous.sections.length+1);
    assert.deepEqual(current.sections.filter((section:{id:string})=>section.id!=="resources-and-freedom"),previous.sections,`${path}: original section content/order/anchors changed`);
    assert.equal(current.sections.findIndex((section:{id:string})=>section.id==="resources-and-freedom"),previous.sections.findIndex((section:{id:string})=>section.id==="depth-image-reasoning")+1);
    assert.deepEqual(current.sources.slice(0,previous.sources.length),previous.sources,`${path}: original source receipts changed`);
    assert.equal(current.sources.length,previous.sources.length+1);
    assert.equal(current.updatedAt,"2026-11-05");
    const newBlock=`## ${added[0].title}\n\n${added[0].bodyMarkdown}\n\n`;
    assert.equal(current.articleMarkdown.split(newBlock).length,2,`${path}: new section missing or duplicated in complete Markdown`);
    assert.equal(current.articleMarkdown.replace(newBlock,""),previous.articleMarkdown,`${path}: complete historical Markdown changed outside the addition`);
    approvedHash=record.articleMarkdownSha256;
   }else if(id==="king-of-pentacles"){
    assert.equal(digest(readFileSync(path)),depthRecords[key].recordSha256,`${path}: unedited King of Pentacles edition changed`);
   }
   if(Object.hasOwn(twoPentaclesPlayRecords,path)){
    const record=twoPentaclesPlayRecords[path],previousRaw=readFileSync(`content/two-pentacles-play-20261110/previous/${path}`);
    assert.equal(digest(previousRaw),record.previousFileSha256);
    assert.equal(record.previousFileSha256,depthRecords[key].recordSha256,`${path}: original file approval changed`);
    assert.equal(digest(JSON.parse(previousRaw.toString()).articleMarkdown),approvedHash,`${path}: historical text approval changed`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash);
    assert.equal(digest(readFileSync(path)),record.fileSha256);
    approvedHash=record.articleMarkdownSha256;
   }else if(id==="two-of-pentacles"){
    assert.equal(digest(readFileSync(path)),depthRecords[key].recordSha256,`${path}: unedited Two of Pentacles edition changed`);
   }
   if(Object.hasOwn(twoSwordsRecords,path)){
    const record=twoSwordsRecords[path],previousRaw=readFileSync(`content/two-swords-update-20261106/previous/${path}`);
    const previous=JSON.parse(previousRaw.toString()),current=JSON.parse(readFileSync(path,"utf8"));
    assert.equal(digest(previousRaw),record.previousFileSha256);
    assert.equal(record.previousFileSha256,depthRecords[key].recordSha256,`${path}: original file approval changed`);
    assert.equal(digest(previous.articleMarkdown),approvedHash,`${path}: historical text approval changed`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash);
    assert.equal(digest(readFileSync(path)),record.fileSha256);
    const changedFields=new Set(["sections","sources","articleMarkdown","updatedAt","editorialRevision"]);
    assert.deepEqual(Object.keys(current).filter(field=>!changedFields.has(field)).sort(),Object.keys(previous).filter(field=>!changedFields.has(field)).sort());
    for(const field of Object.keys(previous).filter(field=>!changedFields.has(field)))assert.deepEqual(current[field],previous[field],`${path}: retained ${field}`);
    const added=current.sections.filter((section:{id:string})=>!previous.sections.some((old:{id:string})=>old.id===section.id));
    assert.equal(previous.sections.length,11);
    assert.deepEqual(added.map((section:{id:string;role:string})=>[section.id,section.role]),[["armed-truce","practice"]]);
    assert.equal(current.sections.length,previous.sections.length+1);
    assert.deepEqual(current.sections.filter((section:{id:string})=>section.id!=="armed-truce"),previous.sections,`${path}: original section content/order/anchors changed`);
    assert.equal(current.sections.findIndex((section:{id:string})=>section.id==="armed-truce"),previous.sections.findIndex((section:{id:string})=>section.id==="section-02")+1);
    assert.deepEqual(current.sources.slice(0,previous.sources.length),previous.sources,`${path}: original source receipts changed`);
    assert.equal(current.sources.length,previous.sources.length+1);
    assert.equal(current.updatedAt,"2026-11-06");
    const newBlock=`## ${added[0].title}\n\n${added[0].bodyMarkdown}\n\n`;
    assert.equal(current.articleMarkdown.split(newBlock).length,2,`${path}: new section missing or duplicated in complete Markdown`);
    assert.equal(current.articleMarkdown.replace(newBlock,""),previous.articleMarkdown,`${path}: complete historical Markdown changed outside the addition`);
    approvedHash=record.articleMarkdownSha256;
   }else if(id==="two-of-swords"){
    assert.equal(digest(readFileSync(path)),depthRecords[key].recordSha256,`${path}: unedited Two of Swords edition changed`);
   }
   if(Object.hasOwn(judgementRecords,path)){
    const record=judgementRecords[path],previousRaw=readFileSync(`content/judgement-update-20261103/previous/${path}`);
    const previous=JSON.parse(previousRaw.toString()),current=JSON.parse(readFileSync(path,"utf8"));
    assert.equal(digest(previousRaw),record.previousFileSha256);
    assert.equal(record.previousFileSha256,depthRecords[key].recordSha256,`${path}: original file approval changed`);
    assert.equal(digest(previous.articleMarkdown),approvedHash,`${path}: historical text approval changed`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash);
    assert.equal(digest(readFileSync(path)),record.fileSha256);
    const changedFields=new Set(["sections","sources","articleMarkdown","updatedAt","editorialRevision"]);
    for(const field of Object.keys(previous).filter(field=>!changedFields.has(field)))assert.deepEqual(current[field],previous[field],`${path}: retained ${field}`);
    assert.deepEqual(current.sections.map((section:{id:string})=>section.id),previous.sections.map((section:{id:string})=>section.id),`${path}: section order changed`);
    const edited=current.sections.filter((section:{bodyMarkdown:string},index:number)=>section.bodyMarkdown!==previous.sections[index].bodyMarkdown);
    assert.deepEqual(edited.map((section:{id:string})=>section.id),["section-01","depth-comparison"]);
    assert.ok(current.sections[0].bodyMarkdown.startsWith(previous.sections[0].bodyMarkdown+"\n\n"));
    assert.equal(current.articleMarkdown.includes("回应会改写共同处境"),true);
    assert.equal(current.articleMarkdown.includes("太阳之后"),true);
    assert.equal(current.articleMarkdown.includes("背对观者的孩子"),true);
    assert.equal(current.articleMarkdown.includes("无人真正单独解脱"),false);
    assert.deepEqual(current.sources.slice(0,previous.sources.length),previous.sources,`${path}: original source receipts changed`);
    assert.equal(current.sources.length,previous.sources.length+1);
    assert.equal(current.sources.at(-1).sourceId,"judgement-pollack-2010");
    assert.equal(current.sources.at(-1).url,null);
    assert.deepEqual(current.sources.at(-1).sourceMetadata.pdfPages,[173,174,175,176]);
    assert.equal(current.updatedAt,"2026-11-03");
    assert.equal(current.publishedAt,"2026-10-07");
    approvedHash=record.articleMarkdownSha256;
   }else if(id==="judgement"){
    assert.equal(digest(readFileSync(path)),depthRecords[key].recordSha256,`${path}: unedited Judgement edition changed`);
   }
   if(Object.hasOwn(moonRecords,path)){
    const record=moonRecords[path],previousRaw=readFileSync(`content/moon-update-20261103/previous/${path}`);
    const previous=JSON.parse(previousRaw.toString()),current=JSON.parse(readFileSync(path,"utf8"));
    assert.equal(digest(previousRaw),record.previousFileSha256);
    assert.equal(record.previousFileSha256,sampleRecords[path].fileSha256,`${path}: October 11 sample receipt changed`);
    assert.equal(digest(previous.articleMarkdown),approvedHash,`${path}: historical sample text changed`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash);
    assert.equal(digest(readFileSync(path)),record.fileSha256);
    const changedFields=new Set(["sections","sources","articleMarkdown","updatedAt","editorialRevision"]);
    for(const field of Object.keys(previous).filter(field=>!changedFields.has(field)))assert.deepEqual(current[field],previous[field],`${path}: retained ${field}`);
    assert.deepEqual(current.sections.map((section:{id:string})=>section.id),previous.sections.map((section:{id:string})=>section.id),`${path}: section order changed`);
    const edited=current.sections.filter((section:{bodyMarkdown:string},index:number)=>section.bodyMarkdown!==previous.sections[index].bodyMarkdown);
    assert.deepEqual(edited.map((section:{id:string})=>section.id),["section-01","section-02"]);
    assert.ok(current.sections[0].bodyMarkdown.startsWith(previous.sections[0].bodyMarkdown+"\n\n"));
    assert.equal(current.articleMarkdown.includes("比野兽更深"),true);
    assert.equal(current.articleMarkdown.includes("还没完全成形"),true);
    assert.equal(current.articleMarkdown.includes("星星池边"),true);
    assert.equal(current.articleMarkdown.includes("那条路还在"),true);
    assert.equal(current.articleMarkdown.includes("相对力量：月亮阶段狂野更满"),true);
    assert.equal(current.articleMarkdown.includes("皇帝"),false);
    assert.equal(current.articleMarkdown.includes("超我"),false);
    assert.equal(current.articleMarkdown.includes("原我"),false);
    assert.equal(current.articleMarkdown.includes("动物自我"),false);
    assert.deepEqual(current.sources.slice(0,previous.sources.length),previous.sources,`${path}: original source receipts changed`);
    assert.equal(current.sources.length,previous.sources.length+1);
    assert.equal(current.sources.at(-1).sourceId,"moon-pollack-2010");
    assert.equal(current.sources.at(-1).url,null);
    assert.deepEqual(current.sources.at(-1).sourceMetadata.pdfPages,[160,162,163,164,165]);
    assert.equal(current.updatedAt,"2026-11-03");
    assert.equal(current.publishedAt,"2026-10-07");
    approvedHash=record.articleMarkdownSha256;
   }else if(id==="moon"&&locale!=="en"){
    assert.equal(digest(readFileSync(path)),depthRecords[key].recordSha256,`${path}: unedited Moon edition changed`);
   }
   if(Object.hasOwn(sunRecords,path)){
    const record=sunRecords[path],previousRaw=readFileSync(`content/sun-update-20261103/previous/${path}`);
    const previous=JSON.parse(previousRaw.toString()),current=JSON.parse(readFileSync(path,"utf8"));
    assert.equal(digest(previousRaw),record.previousFileSha256);
    assert.equal(record.previousFileSha256,sampleRecords[path].fileSha256,`${path}: October 11 sample receipt changed`);
    assert.equal(digest(previous.articleMarkdown),approvedHash,`${path}: historical sample text changed`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash);
    assert.equal(digest(readFileSync(path)),record.fileSha256);
    const changedFields=new Set(["sections","sources","articleMarkdown","updatedAt","editorialRevision","relatedCards"]);
    for(const field of Object.keys(previous).filter(field=>!changedFields.has(field)))assert.deepEqual(current[field],previous[field],`${path}: retained ${field}`);
    assert.deepEqual(current.sections.map((section:{id:string})=>section.id),previous.sections.map((section:{id:string})=>section.id),`${path}: section order changed`);
    const edited=current.sections.filter((section:{bodyMarkdown:string},index:number)=>section.bodyMarkdown!==previous.sections[index].bodyMarkdown);
    assert.deepEqual(edited.map((section:{id:string})=>section.id),["sun-section-2"]);
    assert.ok(current.sections.find((section:{id:string})=>section.id==="sun-section-2").bodyMarkdown.startsWith(previous.sections.find((section:{id:string})=>section.id==="sun-section-2").bodyMarkdown+"\n\n"));
    assert.equal(current.articleMarkdown.includes("有根的光"),true);
    assert.equal(current.articleMarkdown.includes("放下硬控"),true);
    assert.equal(current.articleMarkdown.includes("死而复生"),true);
    assert.equal(current.articleMarkdown.includes("落成"),true);
    assert.equal(current.articleMarkdown.includes("阿波罗"),false);
    assert.equal(current.articleMarkdown.includes("卡巴拉"),false);
    assert.deepEqual(current.relatedCards.map((card:{cardId:string})=>card.cardId),["moon","star","world","judgement"]);
    assert.equal(current.relatedCards[0].reason,previous.relatedCards[0].reason);
    assert.equal(current.relatedCards[1].reason,previous.relatedCards[1].reason);
    assert.ok(current.relatedCards[2].reason.startsWith(previous.relatedCards[2].reason));
    assert.equal(current.relatedCards[3].reason.includes("死而复生"),true);
    assert.deepEqual(current.sources.slice(0,previous.sources.length),previous.sources,`${path}: original source receipts changed`);
    assert.equal(current.sources.length,previous.sources.length+1);
    assert.equal(current.sources.at(-1).sourceId,"sun-pollack-2010");
    assert.equal(current.sources.at(-1).url,null);
    assert.deepEqual(current.sources.at(-1).sourceMetadata.pdfPages,[168,169,170]);
    assert.equal(current.updatedAt,"2026-11-03");
    assert.equal(current.publishedAt,"2026-10-07");
    approvedHash=record.articleMarkdownSha256;
   }else if(id==="sun"&&locale!=="en"){
    assert.equal(digest(readFileSync(path)),editorialManifest.sunRecordSha256[locale],`${path}: unedited Sun edition changed`);
   }
   if(Object.hasOwn(towerRecords,path)){
    const record=towerRecords[path],previousRaw=readFileSync(`content/tower-update-20261104/previous/${path}`);
    const previous=JSON.parse(previousRaw.toString()),current=JSON.parse(readFileSync(path,"utf8"));
    assert.equal(digest(previousRaw),record.previousFileSha256);
    assert.equal(record.previousFileSha256,depthRecords[key].recordSha256,`${path}: original file approval changed`);
    assert.equal(digest(previous.articleMarkdown),approvedHash,`${path}: historical text approval changed`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash);
    assert.equal(digest(readFileSync(path)),record.fileSha256);
    const changedFields=new Set(["sections","sources","articleMarkdown","updatedAt","editorialRevision"]);
    for(const field of Object.keys(previous).filter(field=>!changedFields.has(field)))assert.deepEqual(current[field],previous[field],`${path}: retained ${field}`);
    const previousIds=previous.sections.map((section:{id:string})=>section.id);
    assert.deepEqual(current.sections.filter((section:{id:string})=>previousIds.includes(section.id)).map((section:{id:string})=>section.id),previousIds,`${path}: original section order changed`);
    assert.deepEqual(current.sections.filter((section:{id:string})=>!previousIds.includes(section.id)).map((section:{id:string;role:string;title:string})=>[section.id,section.role,section.title]),[["depth-sequence","comparison","为什么高塔排在恶魔与节制后面"]]);
    assert.equal(current.sections.findIndex((section:{id:string})=>section.id==="depth-sequence"),previous.sections.findIndex((section:{id:string})=>section.id==="depth-comparison")+1);
    for(const sectionId of ["section-01","section-03"]){
     const oldSection=previous.sections.find((section:{id:string})=>section.id===sectionId);
     const newSection=current.sections.find((section:{id:string})=>section.id===sectionId);
     assert.ok(newSection.bodyMarkdown.startsWith(oldSection.bodyMarkdown+"\n\n"));
     assert.equal(newSection.bodyMarkdown.slice(oldSection.bodyMarkdown.length).trim().includes("\n\n"),false);
    }
    assert.deepEqual(current.sections.find((section:{id:string})=>section.id==="depth-comparison"),previous.sections.find((section:{id:string})=>section.id==="depth-comparison"));
    assert.equal(current.articleMarkdown.includes("yod"),true);
    assert.equal(current.articleMarkdown.includes("恩典"),true);
    assert.equal(current.articleMarkdown.includes("二十二"),true);
    assert.equal(current.articleMarkdown.includes("depth-sequence"),false);
    assert.equal(current.articleMarkdown.includes("为什么高塔排在恶魔与节制后面"),true);
    assert.equal(current.articleMarkdown.includes("水坝"),true);
    assert.equal(current.articleMarkdown.includes("不能都归到一个人身上"),true);
    assert.equal(current.articleMarkdown.includes("第三种读法"),true);
    assert.equal(current.articleMarkdown.includes("默认\"压抑\""),true);
    assert.equal(current.articleMarkdown.includes("巴别"),false);
    assert.equal(current.articleMarkdown.includes("战车"),false);
    assert.equal(current.articleMarkdown.includes("沃尔夫"),false);
    assert.deepEqual(current.sources.slice(0,previous.sources.length),previous.sources,`${path}: original source receipts changed`);
    assert.equal(current.sources.length,previous.sources.length+1);
    assert.equal(current.sources.at(-1).sourceId,"tower-pollack-2010");
    assert.equal(current.sources.at(-1).url,null);
    assert.deepEqual(current.sources.at(-1).sourceMetadata.pdfPages,[153,154,155,156,157]);
    assert.equal(current.updatedAt,"2026-11-04");
    assert.equal(current.publishedAt,"2026-10-07");
    approvedHash=record.articleMarkdownSha256;
   }else if(id==="tower"){
    assert.equal(digest(readFileSync(path)),depthRecords[key].recordSha256,`${path}: unedited Tower edition changed`);
   }
   if(Object.hasOwn(devilRecords,path)){
    const record=devilRecords[path],previousRaw=readFileSync(`content/devil-update-20261104/previous/${path}`);
    const previous=JSON.parse(previousRaw.toString()),current=JSON.parse(readFileSync(path,"utf8"));
    assert.equal(digest(previousRaw),record.previousFileSha256);
    assert.equal(record.previousFileSha256,depthRecords[key].recordSha256,`${path}: original file approval changed`);
    assert.equal(digest(previous.articleMarkdown),approvedHash,`${path}: historical text approval changed`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash);
    assert.equal(digest(readFileSync(path)),record.fileSha256);
    const changedFields=new Set(["sections","sources","articleMarkdown","updatedAt","editorialRevision"]);
    for(const field of Object.keys(previous).filter(field=>!changedFields.has(field)))assert.deepEqual(current[field],previous[field],`${path}: retained ${field}`);
    const previousIds=previous.sections.map((section:{id:string})=>section.id);
    assert.deepEqual(current.sections.filter((section:{id:string})=>previousIds.includes(section.id)).map((section:{id:string})=>section.id),previousIds,`${path}: original section order changed`);
    assert.deepEqual(current.sections.filter((section:{id:string})=>!previousIds.includes(section.id)).map((section:{id:string;role:string;title:string})=>[section.id,section.role,section.title]),[["depth-sequence","comparison","为什么恶魔紧接在节制之后"]]);
    assert.equal(current.sections.findIndex((section:{id:string})=>section.id==="depth-sequence"),previous.sections.findIndex((section:{id:string})=>section.id==="depth-comparison")+1);
    for(const sectionId of ["section-01","section-03"]){
     const oldSection=previous.sections.find((section:{id:string})=>section.id===sectionId);
     const newSection=current.sections.find((section:{id:string})=>section.id===sectionId);
     assert.ok(newSection.bodyMarkdown.startsWith(oldSection.bodyMarkdown+"\n\n"));
     assert.equal(newSection.bodyMarkdown.slice(oldSection.bodyMarkdown.length).trim().includes("\n\n"),false);
    }
    assert.deepEqual(current.sections.find((section:{id:string})=>section.id==="depth-comparison"),previous.sections.find((section:{id:string})=>section.id==="depth-comparison"));
    assert.equal(current.articleMarkdown.includes("半个立方体"),true);
    assert.equal(current.articleMarkdown.includes("不完整的知识"),true);
    assert.equal(current.articleMarkdown.includes("土星"),true);
    assert.equal(current.articleMarkdown.split("土星").length-1,1);
    assert.equal(current.articleMarkdown.includes("为什么恶魔紧接在节制之后"),true);
    assert.equal(current.articleMarkdown.includes("化约为 6"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-tower?locale=zh#depth-sequence"),true);
    assert.equal(current.articleMarkdown.includes("冲破旧结构"),true);
    assert.equal(current.articleMarkdown.includes("改错了方向"),true);
    assert.equal(current.articleMarkdown.includes("选择是否在变多"),true);
    assert.equal(current.articleMarkdown.includes("148"),false);
    assert.equal(current.articleMarkdown.includes("布莱克"),false);
    assert.equal(current.articleMarkdown.includes("失乐园"),false);
    assert.equal(current.articleMarkdown.includes("密宗"),false);
    assert.equal(current.articleMarkdown.includes("集体无意识"),false);
    assert.equal(current.articleMarkdown.includes("赐福"),false);
    assert.deepEqual(current.sources.slice(0,previous.sources.length),previous.sources,`${path}: original source receipts changed`);
    assert.equal(current.sources.length,previous.sources.length+1);
    assert.equal(current.sources.at(-1).sourceId,"devil-pollack-2010");
    assert.equal(current.sources.at(-1).url,null);
    assert.deepEqual(current.sources.at(-1).sourceMetadata.pdfPages,[146,147,148,149,150,151,152]);
    assert.equal(current.updatedAt,"2026-11-04");
    assert.equal(current.publishedAt,"2026-10-07");
    approvedHash=record.articleMarkdownSha256;
   }else if(id==="devil"){
    assert.equal(digest(readFileSync(path)),depthRecords[key].recordSha256,`${path}: unedited Devil edition changed`);
   }
   if(Object.hasOwn(temperanceRecords,path)){
    const record=temperanceRecords[path],previousRaw=readFileSync(`content/temperance-update-20261105/previous/${path}`);
    const previous=JSON.parse(previousRaw.toString()),current=JSON.parse(readFileSync(path,"utf8"));
    assert.equal(digest(previousRaw),record.previousFileSha256);
    assert.equal(record.previousFileSha256,depthRecords[key].recordSha256,`${path}: original file approval changed`);
    assert.equal(digest(previous.articleMarkdown),approvedHash,`${path}: historical text approval changed`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash);
    assert.equal(digest(readFileSync(path)),record.fileSha256);
    const changedFields=new Set(["sections","sources","articleMarkdown","updatedAt","editorialRevision"]);
    for(const field of Object.keys(previous).filter(field=>!changedFields.has(field)))assert.deepEqual(current[field],previous[field],`${path}: retained ${field}`);
    const previousIds=previous.sections.map((section:{id:string})=>section.id);
    assert.deepEqual(current.sections.filter((section:{id:string})=>previousIds.includes(section.id)).map((section:{id:string})=>section.id),previousIds,`${path}: original section order changed`);
    assert.deepEqual(current.sections.filter((section:{id:string})=>!previousIds.includes(section.id)).map((section:{id:string;role:string;title:string})=>[section.id,section.role,section.title]),[["depth-sequence","comparison","为什么节制夹在死神与恶魔、高塔之间"]]);
    assert.equal(current.sections.findIndex((section:{id:string})=>section.id==="depth-sequence"),previous.sections.findIndex((section:{id:string})=>section.id==="depth-comparison")+1);
    for(const sectionId of ["section-01","section-04"]){
     const oldSection=previous.sections.find((section:{id:string})=>section.id===sectionId);
     const newSection=current.sections.find((section:{id:string})=>section.id===sectionId);
     assert.ok(newSection.bodyMarkdown.startsWith(oldSection.bodyMarkdown+"\n\n"));
     const addedText=newSection.bodyMarkdown.slice(oldSection.bodyMarkdown.length).trim();
     assert.equal(addedText.split("\n\n").length,sectionId==="section-01"?1:2);
    }
    assert.deepEqual(current.sections.find((section:{id:string})=>section.id==="depth-comparison"),previous.sections.find((section:{id:string})=>section.id==="depth-comparison"));
    assert.equal(current.articleMarkdown.includes("temperare"),true);
    assert.equal(current.articleMarkdown.includes("物理上不可能的安排"),true);
    assert.equal(current.articleMarkdown.includes("尚未成形的可能"),true);
    assert.equal(current.articleMarkdown.includes("为什么节制夹在死神与恶魔、高塔之间"),true);
    assert.equal(current.articleMarkdown.includes("Iris"),true);
    assert.equal(current.articleMarkdown.includes("鸢尾"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-devil?locale=zh#depth-sequence"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-tower?locale=zh#depth-sequence"),true);
    assert.equal(current.articleMarkdown.includes("走极端"),true);
    assert.equal(current.articleMarkdown.includes("更失衡"),true);
    assert.equal(current.articleMarkdown.includes("柱子"),false);
    assert.equal(current.articleMarkdown.includes("送回力量"),false);
    assert.equal(current.articleMarkdown.includes("狮鹰"),false);
    assert.equal(current.articleMarkdown.includes("Wirth"),false);
    assert.equal(current.articleMarkdown.includes("冥河"),false);
    assert.equal(current.articleMarkdown.includes("战车"),false);
    assert.deepEqual(current.sources.slice(0,previous.sources.length),previous.sources,`${path}: original source receipts changed`);
    assert.equal(current.sources.length,previous.sources.length+1);
    assert.equal(current.sources.at(-1).sourceId,"temperance-pollack-2010");
    assert.equal(current.sources.at(-1).url,null);
    assert.deepEqual(current.sources.at(-1).sourceMetadata.pdfPages,[139,140,141,142,143]);
    assert.equal(current.updatedAt,"2026-11-05");
    assert.equal(current.publishedAt,"2026-10-07");
    approvedHash=record.articleMarkdownSha256;
   }else if(id==="temperance"){
    assert.equal(digest(readFileSync(path)),depthRecords[key].recordSha256,`${path}: unedited Temperance edition changed`);
   }
   if(Object.hasOwn(worldRecords,path)){
    const record=worldRecords[path],previousRaw=readFileSync(`content/world-update-20261106/previous/${path}`);
    const previous=JSON.parse(previousRaw.toString()),current=JSON.parse(readFileSync(path,"utf8"));
    assert.equal(digest(previousRaw),record.previousFileSha256);
    assert.equal(record.previousFileSha256,depthRecords[key].recordSha256,`${path}: original file approval changed`);
    assert.equal(digest(previous.articleMarkdown),approvedHash,`${path}: historical text approval changed`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash);
    assert.equal(digest(readFileSync(path)),record.fileSha256);
    const changedFields=new Set(["sections","sources","articleMarkdown","updatedAt","editorialRevision"]);
    for(const field of Object.keys(previous).filter(field=>!changedFields.has(field)))assert.deepEqual(current[field],previous[field],`${path}: retained ${field}`);
    const previousIds=previous.sections.map((section:{id:string})=>section.id);
    assert.deepEqual(current.sections.filter((section:{id:string})=>previousIds.includes(section.id)).map((section:{id:string})=>section.id),previousIds,`${path}: original section order changed`);
    assert.deepEqual(current.sections.filter((section:{id:string})=>!previousIds.includes(section.id)).map((section:{id:string;role:string;title:string})=>[section.id,section.role,section.title]),[["depth-sequence","comparison","为什么完成之后还要往下走"]]);
    assert.equal(current.sections.findIndex((section:{id:string})=>section.id==="depth-sequence"),previous.sections.findIndex((section:{id:string})=>section.id==="depth-comparison")+1);
    for(const sectionId of ["section-01","section-03"]){
     const oldSection=previous.sections.find((section:{id:string})=>section.id===sectionId);
     const newSection=current.sections.find((section:{id:string})=>section.id===sectionId);
     assert.ok(newSection.bodyMarkdown.startsWith(oldSection.bodyMarkdown+"\n\n"));
     const addedText=newSection.bodyMarkdown.slice(oldSection.bodyMarkdown.length).trim();
     assert.equal(addedText.split("\n\n").length,sectionId==="section-01"?1:2);
    }
    assert.deepEqual(current.sections.find((section:{id:string})=>section.id==="depth-comparison"),previous.sections.find((section:{id:string})=>section.id==="depth-comparison"));
    assert.equal(current.articleMarkdown.includes("活着的整合"),true);
    assert.equal(current.articleMarkdown.includes("从外部看见流转"),true);
    assert.equal(current.articleMarkdown.includes("不是 Waite 原文"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-wheel?locale=zh"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-magician?locale=zh"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-high-priestess?locale=zh"),true);
    assert.equal(current.articleMarkdown.includes("为什么完成之后还要往下走"),true);
    assert.equal(current.articleMarkdown.includes("合一与生意"),true);
    assert.equal(current.articleMarkdown.includes("愚者的 0"),true);
    assert.equal(current.articleMarkdown.includes("∞"),true);
    assert.equal(current.articleMarkdown.includes("下一程从哪一小步开始"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-fool?locale=zh"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-judgement?locale=zh"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-sun?locale=zh"),true);
    assert.equal(current.articleMarkdown.includes("潜伏潜能"),true);
    assert.equal(current.articleMarkdown.includes("潜能还在"),true);
    assert.equal(current.articleMarkdown.includes("拖延必须落地的收尾"),true);
    assert.equal(current.articleMarkdown.includes("物质被提升"),false);
    assert.equal(current.articleMarkdown.includes("神圣不要求离开"),false);
    assert.equal(current.articleMarkdown.includes("现稿已"),false);
    assert.equal(current.articleMarkdown.includes("太阳页已写"),false);
    assert.equal(current.articleMarkdown.includes("湿婆"),false);
    assert.equal(current.articleMarkdown.includes("生命之树"),false);
    assert.equal(current.articleMarkdown.includes("脉轮"),false);
    assert.deepEqual(current.sources.slice(0,previous.sources.length),previous.sources,`${path}: original source receipts changed`);
    assert.equal(current.sources.length,previous.sources.length+1);
    assert.equal(current.sources.at(-1).sourceId,"world-pollack-2010");
    assert.equal(current.sources.at(-1).url,null);
    assert.deepEqual(current.sources.at(-1).sourceMetadata.pdfPages,[178,179,180,181,182]);
    assert.equal(current.updatedAt,"2026-11-06");
    assert.equal(current.publishedAt,"2026-10-07");
    approvedHash=record.articleMarkdownSha256;
   }else if(id==="world"){
    assert.equal(digest(readFileSync(path)),depthRecords[key].recordSha256,`${path}: unedited World edition changed`);
   }
   if(Object.hasOwn(deathRecords,path)){
    const record=deathRecords[path],previousRaw=readFileSync(`content/death-update-20261107/previous/${path}`);
    const previous=JSON.parse(previousRaw.toString()),current=JSON.parse(readFileSync(path,"utf8"));
    assert.equal(digest(previousRaw),record.previousFileSha256);
    assert.equal(digest(previous.articleMarkdown),approvedHash,`${path}: historical text approval changed`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash);
    assert.equal(digest(readFileSync(path)),record.fileSha256);
    const changedFields=new Set(["sections","sources","articleMarkdown","updatedAt","editorialRevision"]);
    for(const field of Object.keys(previous).filter(field=>!changedFields.has(field)))assert.deepEqual(current[field],previous[field],`${path}: retained ${field}`);
    const previousIds=previous.sections.map((section:{id:string})=>section.id);
    assert.deepEqual(current.sections.filter((section:{id:string})=>previousIds.includes(section.id)).map((section:{id:string})=>section.id),previousIds,`${path}: original section order changed`);
    assert.deepEqual(current.sections.filter((section:{id:string})=>!previousIds.includes(section.id)).map((section:{id:string;role:string;title:string})=>[section.id,section.role,section.title]),[["depth-sequence","comparison","为什么死神夹在吊人与节制之间"]]);
    assert.equal(current.sections.findIndex((section:{id:string})=>section.id==="depth-sequence"),previous.sections.findIndex((section:{id:string})=>section.id==="depth-comparison")+1);
    for(const sectionId of ["section-01","section-04"]){
     const oldSection=previous.sections.find((section:{id:string})=>section.id===sectionId);
     const newSection=current.sections.find((section:{id:string})=>section.id===sectionId);
     assert.ok(newSection.bodyMarkdown.startsWith(oldSection.bodyMarkdown+"\n\n"));
     const addedText=newSection.bodyMarkdown.slice(oldSection.bodyMarkdown.length).trim();
     assert.equal(addedText.split("\n\n").length,sectionId==="section-01"?1:2);
    }
    assert.deepEqual(current.sections.find((section:{id:string})=>section.id==="depth-comparison"),previous.sections.find((section:{id:string})=>section.id==="depth-comparison"));
    assert.equal(current.articleMarkdown.includes("四种态度"),true);
    assert.equal(current.articleMarkdown.includes("白玫瑰"),true);
    assert.equal(current.articleMarkdown.includes("欲望被净化"),true);
    assert.equal(current.articleMarkdown.includes("神秘玫瑰＝生命"),true);
    assert.equal(current.articleMarkdown.includes("不是把画中人物写成客观事实"),true);
    assert.equal(current.articleMarkdown.includes("为什么死神夹在吊人与节制之间"),true);
    assert.equal(current.articleMarkdown.includes("阶段叙事"),true);
    assert.equal(current.articleMarkdown.includes("不等于「转化」本身"),true);
    assert.equal(current.articleMarkdown.includes("放下旧面具"),true);
    assert.equal(current.articleMarkdown.includes("容许转化"),true);
    assert.equal(current.articleMarkdown.includes("不能拿来覆盖 Waite"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-hanged-man?locale=zh"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-temperance?locale=zh#depth-sequence"),true);
    assert.equal(current.articleMarkdown.includes("恐惧"),true);
    assert.equal(current.articleMarkdown.includes("证据"),true);
    assert.equal(current.articleMarkdown.includes("立刻结束"),true);
    assert.equal(current.articleMarkdown.includes("低落"),true);
    assert.equal(current.articleMarkdown.includes("诊断"),true);
    assert.equal(current.articleMarkdown.includes("寿命"),true);
    assert.equal(current.articleMarkdown.includes("支持系统"),true);
    assert.equal(current.articleMarkdown.includes("献花"),false);
    assert.equal(current.articleMarkdown.includes("干净的花"),false);
    assert.equal(current.articleMarkdown.includes("现稿已"),false);
    assert.equal(current.articleMarkdown.includes("节制页已写"),false);
    assert.equal(current.articleMarkdown.includes("入门仪式"),false);
    assert.equal(current.articleMarkdown.includes("迷幻"),false);
    assert.equal(current.articleMarkdown.includes("数秘"),false);
    assert.equal(current.articleMarkdown.includes("性隐喻"),false);
    assert.deepEqual(current.sources.slice(0,previous.sources.length),previous.sources,`${path}: original source receipts changed`);
    assert.equal(current.sources.length,previous.sources.length+1);
    assert.equal(current.sources.at(-1).sourceId,"death-pollack-2010");
    assert.equal(current.sources.at(-1).url,null);
    assert.deepEqual(current.sources.at(-1).sourceMetadata.pdfPages,[133,134,135,136,137,138]);
    assert.equal(current.updatedAt,"2026-11-07");
    assert.equal(current.publishedAt,"2026-10-07");
    approvedHash=record.articleMarkdownSha256;
   }else if(id==="death"){
    assert.equal(article.articleMarkdown.includes("Pollack"),false,`${path}: unedited Death edition gained the Pollack supplement`);
    assert.equal(article.updatedAt,"2026-10-08");
   }
   if(Object.hasOwn(wheelRecords,path)){
    const record=wheelRecords[path],previousRaw=readFileSync(`content/wheel-update-20261110/previous/${path}`);
    const previous=JSON.parse(previousRaw.toString()),current=JSON.parse(readFileSync(path,"utf8"));
    assert.equal(digest(previousRaw),record.previousFileSha256);
    assert.equal(digest(previous.articleMarkdown),approvedHash,`${path}: historical text approval changed`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash);
    assert.equal(digest(readFileSync(path)),record.fileSha256);
    const changedFields=new Set(["sections","sources","articleMarkdown","updatedAt","editorialRevision"]);
    for(const field of Object.keys(previous).filter(field=>!changedFields.has(field)))assert.deepEqual(current[field],previous[field],`${path}: retained ${field}`);
    const previousIds=previous.sections.map((section:{id:string})=>section.id);
    assert.deepEqual(current.sections.filter((section:{id:string})=>previousIds.includes(section.id)).map((section:{id:string})=>section.id),previousIds,`${path}: original section order changed`);
    assert.deepEqual(current.sections.filter((section:{id:string})=>!previousIds.includes(section.id)).map((section:{id:string;role:string;title:string})=>[section.id,section.role,section.title]),[["depth-sequence","comparison","从隐士的退后一步，到世界的整合"]]);
    assert.equal(current.sections.findIndex((section:{id:string})=>section.id==="depth-sequence"),previous.sections.findIndex((section:{id:string})=>section.id==="depth-comparison")+1);
    for(const sectionId of ["section-01","section-04"]){
     const oldSection=previous.sections.find((section:{id:string})=>section.id===sectionId);
     const newSection=current.sections.find((section:{id:string})=>section.id===sectionId);
     assert.ok(newSection.bodyMarkdown.startsWith(oldSection.bodyMarkdown+"\n\n"));
    }
    assert.deepEqual(current.sections.find((section:{id:string})=>section.id==="depth-comparison"),previous.sections.find((section:{id:string})=>section.id==="depth-comparison"));
    const waiteReversed="他的逆位词条反而列了增加、丰盛与过量。";
    const externalDelay="先看现实变化发生在哪儿。是排期被外部条件推迟，还是每次遇到反馈都重复旧做法？前者需要缓冲和备选安排，后者可能需要改方法。两者并不是同一种「运气差」。";
    assert.equal(current.sections.find((section:{id:string;bodyMarkdown:string})=>section.id==="section-04").bodyMarkdown.includes(waiteReversed),true);
    assert.equal(current.sections.find((section:{id:string;bodyMarkdown:string})=>section.id==="section-04").bodyMarkdown.includes(externalDelay),true);
    assert.equal(current.articleMarkdown.includes("死亡与新生同时存在"),true);
    assert.equal(current.articleMarkdown.includes("不是已定论的埃及学事实"),true);
    assert.equal(current.articleMarkdown.includes("不能用来预测疾病、死亡、成功或失败"),true);
    assert.equal(current.articleMarkdown.includes("从隐士的退后一步，到世界的整合"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-hermit?locale=zh"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-hermit?locale=zh#depth-sequence"),false);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-world?locale=zh"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-justice?locale=zh#depth-sequence"),true);
    assert.equal(current.articleMarkdown.includes("只是举例，不是预测"),true);
    assert.equal(current.articleMarkdown.includes("不保证改变「一定有意义」"),true);
    assert.equal(current.articleMarkdown.includes(waiteReversed),true);
    assert.equal(current.articleMarkdown.includes(externalDelay),true);
    assert.equal(current.articleMarkdown.includes("业力"),false);
    assert.equal(current.articleMarkdown.includes("数秘"),false);
    assert.equal(current.articleMarkdown.includes("TARO"),false);
    assert.equal(current.articleMarkdown.includes("现稿已"),false);
    assert.equal(current.articleMarkdown.includes("该页还没有"),false);
    assert.deepEqual(current.sources.slice(0,previous.sources.length),previous.sources,`${path}: original source receipts changed`);
    assert.equal(current.sources.length,previous.sources.length+1);
    assert.equal(current.sources.at(-1).sourceId,"wheel-pollack-2010");
    assert.equal(current.sources.at(-1).url,null);
    assert.deepEqual(current.sources.at(-1).sourceMetadata.pdfPages,[112,113,114,115,116,117,118,119,120]);
    assert.equal(current.updatedAt,"2026-11-10");
    assert.equal(current.publishedAt,"2026-10-07");
    approvedHash=record.articleMarkdownSha256;
   }else if(id==="wheel"){
    const priorDate=depthManifest.cards.wheel.updatedAt;
    assert.equal(article.articleMarkdown.includes("Pollack"),false,`${path}: unedited Wheel edition gained the Pollack supplement`);
    assert.equal(article.updatedAt,priorDate);
    assert.equal(digest(readFileSync(path)),depthRecords[key].recordSha256,`${path}: unedited Wheel edition changed`);
   }
   if(Object.hasOwn(justiceRecords,path)){
    const record=justiceRecords[path],previousRaw=readFileSync(`content/justice-update-20261109/previous/${path}`);
    const previous=JSON.parse(previousRaw.toString()),current=JSON.parse(readFileSync(path,"utf8"));
    assert.equal(digest(previousRaw),record.previousFileSha256);
    assert.equal(digest(previous.articleMarkdown),approvedHash,`${path}: historical text approval changed`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash);
    assert.equal(digest(readFileSync(path)),record.fileSha256);
    const changedFields=new Set(["sections","sources","articleMarkdown","updatedAt","editorialRevision"]);
    for(const field of Object.keys(previous).filter(field=>!changedFields.has(field)))assert.deepEqual(current[field],previous[field],`${path}: retained ${field}`);
    const previousIds=previous.sections.map((section:{id:string})=>section.id);
    assert.deepEqual(current.sections.filter((section:{id:string})=>previousIds.includes(section.id)).map((section:{id:string})=>section.id),previousIds,`${path}: original section order changed`);
    assert.deepEqual(current.sections.filter((section:{id:string})=>!previousIds.includes(section.id)).map((section:{id:string;role:string;title:string})=>[section.id,section.role,section.title]),[["depth-sequence","comparison","为什么正义夹在命运之轮与倒吊人之间"]]);
    assert.equal(current.sections.findIndex((section:{id:string})=>section.id==="depth-sequence"),previous.sections.findIndex((section:{id:string})=>section.id==="depth-comparison")+1);
    for(const sectionId of ["section-01","section-04"]){
     const oldSection=previous.sections.find((section:{id:string})=>section.id===sectionId);
     const newSection=current.sections.find((section:{id:string})=>section.id===sectionId);
     assert.ok(newSection.bodyMarkdown.startsWith(oldSection.bodyMarkdown+"\n\n"));
     const addedText=newSection.bodyMarkdown.slice(oldSection.bodyMarkdown.length).trim();
     assert.equal(addedText.split("\n\n").length,1);
    }
    assert.deepEqual(current.sections.find((section:{id:string})=>section.id==="depth-comparison"),previous.sections.find((section:{id:string})=>section.id==="depth-comparison"));
    const ending="抽到逆位不能证明你做错了，也不能证明别人不公。若你正反复自责，可先分开自己实际做过的事、能够补救的部分与根本不由你决定的结果。";
    assert.equal(current.sections.find((section:{id:string;bodyMarkdown:string})=>section.id==="section-04").bodyMarkdown.includes(ending),true);
    assert.equal(current.articleMarkdown.includes("心灵的正义律法"),true);
    assert.equal(current.articleMarkdown.includes("向上的剑"),true);
    assert.equal(current.articleMarkdown.includes("不能用来预测案件结果"),true);
    assert.equal(current.articleMarkdown.includes("不等同于 Waite 的原文"),true);
    assert.equal(current.articleMarkdown.includes("现实法庭的规则"),true);
    assert.equal(current.articleMarkdown.includes("社会法庭规则"),false);
    assert.equal(current.articleMarkdown.includes("为什么正义夹在命运之轮与倒吊人之间"),true);
    assert.equal(current.articleMarkdown.includes("地震"),true);
    assert.equal(current.articleMarkdown.includes("责任没有道德指控"),true);
    assert.equal(current.articleMarkdown.includes("并不等于这件事由这个人造成"),true);
    assert.equal(current.articleMarkdown.includes("不能拿来覆盖 Waite"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-wheel?locale=zh"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-hanged-man?locale=zh#depth-sequence"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-wheel?locale=zh#depth-sequence"),false);
    assert.equal(current.articleMarkdown.includes("可能不愿面对某些事实，也可能确实遭遇不公"),true);
    assert.equal(current.articleMarkdown.includes(ending),true);
    assert.equal(current.articleMarkdown.includes("面对不公时，你仍可申诉、求助并保护自己的权益。"),true);
    assert.equal(current.articleMarkdown.includes("应得"),false);
    assert.equal(current.articleMarkdown.includes("应该发生"),false);
    assert.equal(current.articleMarkdown.includes("席米斯"),false);
    assert.equal(current.articleMarkdown.includes("贾丝提昔亚"),false);
    assert.equal(current.articleMarkdown.includes("Themis"),false);
    assert.equal(current.articleMarkdown.includes("Justitia"),false);
    assert.equal(current.articleMarkdown.includes("无法撤回"),false);
    assert.equal(current.articleMarkdown.includes("中点"),false);
    assert.equal(current.articleMarkdown.includes("数秘"),false);
    assert.equal(current.articleMarkdown.includes("现稿已"),false);
    assert.deepEqual(current.sources.slice(0,previous.sources.length),previous.sources,`${path}: original source receipts changed`);
    assert.equal(current.sources.length,previous.sources.length+2);
    assert.equal(current.sources.at(-2).sourceId,"justice-pollack-2010");
    assert.equal(current.sources.at(-1).sourceId,"justice-pollack-hanged-man-chapter-2010");
    assert.equal(current.sources.at(-2).url,null);
    assert.equal(current.sources.at(-1).url,null);
    assert.deepEqual(current.sources.at(-2).sourceMetadata.pdfPages,[121,122,123,124,125,126,127]);
    assert.deepEqual(current.sources.at(-1).sourceMetadata.pdfPages,[128,129]);
    assert.equal(current.updatedAt,"2026-11-09");
    assert.equal(current.publishedAt,"2026-10-07");
    approvedHash=record.articleMarkdownSha256;
   }else if(id==="justice"){
    const priorDate=depthManifest.cards.justice.updatedAt;
    assert.equal(article.articleMarkdown.includes("Pollack"),false,`${path}: unedited Justice edition gained the Pollack supplement`);
    assert.equal(article.updatedAt,priorDate);
    assert.equal(digest(readFileSync(path)),depthRecords[key].recordSha256,`${path}: unedited Justice edition changed`);
   }
   if(Object.hasOwn(hermitRecords,path)){
    const record=hermitRecords[path],previousRaw=readFileSync(`content/hermit-update-20261111/previous/${path}`);
    const previous=JSON.parse(previousRaw.toString()),current=JSON.parse(readFileSync(path,"utf8"));
    assert.equal(digest(previousRaw),record.previousFileSha256);
    assert.equal(digest(previous.articleMarkdown),approvedHash,`${path}: historical text approval changed`);
    assert.equal(record.previousArticleMarkdownSha256,approvedHash);
    assert.equal(digest(readFileSync(path)),record.fileSha256);
    const changedFields=new Set(["sections","sources","articleMarkdown","updatedAt","editorialRevision"]);
    for(const field of Object.keys(previous).filter(field=>!changedFields.has(field)))assert.deepEqual(current[field],previous[field],`${path}: retained ${field}`);
    const previousIds=previous.sections.map((section:{id:string})=>section.id);
    assert.deepEqual(current.sections.filter((section:{id:string})=>previousIds.includes(section.id)).map((section:{id:string})=>section.id),previousIds,`${path}: original section order changed`);
    assert.deepEqual(current.sections.filter((section:{id:string})=>!previousIds.includes(section.id)).map((section:{id:string;role:string;title:string})=>[section.id,section.role,section.title]),[["depth-sequence","comparison","为什么隐士要先退后，下一张才是命运之轮"]]);
    assert.equal(current.sections.findIndex((section:{id:string})=>section.id==="depth-sequence"),previous.sections.findIndex((section:{id:string})=>section.id==="depth-comparison")+1);
    for(const sectionId of ["section-01","section-03","section-04"]){
     const oldSection=previous.sections.find((section:{id:string})=>section.id===sectionId);
     const newSection=current.sections.find((section:{id:string})=>section.id===sectionId);
     assert.ok(newSection.bodyMarkdown.startsWith(oldSection.bodyMarkdown+"\n\n"));
     const addedText=newSection.bodyMarkdown.slice(oldSection.bodyMarkdown.length).trim();
     assert.equal(addedText.split("\n\n").length,1);
    }
    assert.deepEqual(current.sections.find((section:{id:string})=>section.id==="depth-comparison"),previous.sections.find((section:{id:string})=>section.id==="depth-comparison"));
    const solitude="逆位可用来检查独处的效果：一段安静后，你更清楚了，还是反复绕着同一个念头？你暂时不想解释，还是已经很难接受任何反馈？也有另一种情况：别人意见挤满生活，你根本没留下自己的思考空间。";
    const waiteConcealment="Waite 的占辞表含有隐瞒、恐惧与无根据的谨慎，甚至其他很负面的旧式归类；本站并不照此指认谁在欺骗你，而把可观察的行为和沟通放在前面。";
    assert.equal(current.sections.find((section:{id:string;bodyMarkdown:string})=>section.id==="section-04").bodyMarkdown.includes(solitude),true);
    assert.equal(current.sections.find((section:{id:string;bodyMarkdown:string})=>section.id==="section-04").bodyMarkdown.includes(waiteConcealment),true);
    assert.equal(current.articleMarkdown.includes("同时指向内与外"),true);
    assert.equal(current.articleMarkdown.includes("不是建议开始或停止治疗"),true);
    assert.equal(current.articleMarkdown.includes("不能把梦当成诊断"),true);
    assert.equal(current.articleMarkdown.includes("为什么隐士要先退后，下一张才是命运之轮"),true);
    assert.equal(current.articleMarkdown.includes("退后看见整轮"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-strength?locale=zh"),true);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-strength?locale=zh#depth-sequence"),false);
    assert.equal(current.articleMarkdown.includes("/journal/tarot-wheel?locale=zh#depth-sequence"),true);
    assert.equal(current.articleMarkdown.includes("作者隐喻"),true);
    assert.equal(current.articleMarkdown.includes(solitude),true);
    assert.equal(current.articleMarkdown.includes(waiteConcealment),true);
    assert.equal(current.articleMarkdown.includes("愿意指引"),false);
    assert.equal(current.articleMarkdown.includes("业力"),false);
    assert.equal(current.articleMarkdown.includes("佛陀"),false);
    assert.equal(current.articleMarkdown.includes("偏执"),false);
    assert.equal(current.articleMarkdown.includes("现稿已"),false);
    assert.equal(current.articleMarkdown.includes("该页还没有"),false);
    assert.deepEqual(current.sources.slice(0,previous.sources.length),previous.sources,`${path}: original source receipts changed`);
    assert.equal(current.sources.length,previous.sources.length+2);
    assert.equal(current.sources.at(-2).sourceId,"hermit-pollack-2010");
    assert.equal(current.sources.at(-1).sourceId,"hermit-pollack-wheel-chapter-2010");
    assert.equal(current.sources.at(-2).url,null);
    assert.equal(current.sources.at(-1).url,null);
    assert.deepEqual(current.sources.at(-2).sourceMetadata.pdfPages,[106,107,108,109,110,111]);
    assert.deepEqual(current.sources.at(-1).sourceMetadata.pdfPages,[115]);
    assert.equal(current.updatedAt,"2026-11-11");
    assert.equal(current.publishedAt,"2026-10-07");
    approvedHash=record.articleMarkdownSha256;
   }else if(id==="hermit"){
    const priorDate=depthManifest.cards.hermit.updatedAt;
    assert.equal(article.articleMarkdown.includes("Pollack"),false,`${path}: unedited Hermit edition gained the Pollack supplement`);
    assert.equal(article.updatedAt,priorDate);
    assert.equal(digest(readFileSync(path)),depthRecords[key].recordSha256,`${path}: unedited Hermit edition changed`);
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
