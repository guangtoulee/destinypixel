import test from "node:test";
import assert from "node:assert/strict";
import { journeyCopy, sectionKeys, sectionGuides, sectionHref } from "./section-journeys";
import { journalArticles } from "./journal";
test("every section journey links to complete existing articles in all four languages",()=>{
 for(const locale of ["en","zh","zh-TW","ru"] as const){
  const copy=journeyCopy(locale);
  for(const section of sectionKeys){
   const href=new URL(sectionHref('/'+section,locale),'https://example.test');
   assert.equal(href.searchParams.get('locale'),locale==='en'?null:locale);
   assert.ok(copy.sections[section].action&&copy.sections[section].next);
   for(const slug of sectionGuides[section]){const a=journalArticles.find(a=>a.slug===slug);assert.ok(a,slug);assert.ok(a.translations[locale].sections.length,locale+'/'+slug);}
  }
 }
 assert.equal(journalArticles.filter(a=>a.pillar&&a.portraitDepth==='full').length,60);
});
