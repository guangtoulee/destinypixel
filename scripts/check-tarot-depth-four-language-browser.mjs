import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import Markdown from 'react-markdown';

const {chromium,expect}=createRequire(import.meta.url)('playwright/test');
const base=new URL(process.argv[2]??'http://127.0.0.1:3041');
assert.ok(['127.0.0.1','localhost','[::1]'].includes(base.hostname),'QA is restricted to a loopback server');
const out=resolve(process.env.QA_EVIDENCE_DIR??'docs/qa/tarot-depth-20261008/browser-four-language');
mkdirSync(out,{recursive:true});
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const manifest=read('content/tarot-depth-20261008/manifest.json');
const revision=read('content/tarot-depth-20261008/revisions.json');
const cards=Object.keys(revision.cards).sort((a,b)=>manifest.cards[a].deckOrder-manifest.cards[b].deckOrder);
const locales=['zh','en','zh-TW','ru'];
const tags={zh:'zh-Hans',en:'en','zh-TW':'zh-Hant',ru:'ru'};
const suffix=locale=>locale==='en'?'':`?locale=${locale}`;
assert.equal(cards.length,77);assert.ok(!cards.includes('sun'));
for(const id of cards)for(const locale of locales)assert.ok(revision.cards[id].locales.includes(locale),`${id}/${locale} has not been integrated`);
const report={scope:'Local four-language integration; no external Preview or production verification',base:base.origin,startedAt:new Date().toISOString(),cards:cards.length,locales,views:[],workflows:[],screenshots:[],pageErrors:[],blockedExternalRequests:0};
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const context=await browser.newContext({reducedMotion:'reduce'});
 await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin===base.origin&&route.request().method()==='GET')return route.continue();report.blockedExternalRequests++;return route.abort();});
 const page=await context.newPage();page.on('pageerror',error=>report.pageErrors.push(error.message));
 for(const locale of locales){
  for(const [width,height] of [[390,844],[1440,900]]){
   await page.setViewportSize({width,height});
   for(const id of cards){
    const a=read(`content/tarot/${locale}/${id}.json`),tag=`${locale}/${id}/${width}`;
    const response=await page.goto(new URL(`${manifest.cards[id].route}${suffix(locale)}`,base).href);
    assert.equal(response.status(),200,tag);await expect(page.locator('h1')).toHaveText(a.title);await expect(page).toHaveTitle(`${a.title} | DestinyPixel`);
    await expect(page.locator('main')).toHaveAttribute('lang',tags[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`https://www.destinypixel.com${manifest.cards[id].route}${suffix(locale)}`);
    const takes=page.locator('article dl dd');assert.equal(await takes.count(),2,tag);await expect(takes.nth(0)).toHaveText(a.quickTake.upright);await expect(takes.nth(1)).toHaveText(a.quickTake.reversed);
    const hook=page.locator('[data-learning-hook]');await expect(hook).toHaveText(a.hook);
    const opening=await hook.locator('..').locator(':scope > p').allTextContents();
    assert.deepEqual(opening,[a.hook,...(a.openingParagraphs??[])],`${tag}: unexpected or duplicated introductory paragraphs`);
    for(const text of opening){assert.ok(![a.quickTake.upright,a.quickTake.reversed].some(t=>text.includes(t)),`${tag}: quick take repeated in introductory prose`);}
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${tag}: horizontal overflow`);
    const image=page.locator('article figure img');await expect.poll(()=>image.evaluate(e=>e.complete&&e.naturalWidth>0)).toBe(true);
    assert.equal(await page.locator('[data-learning-section]').count(),a.sections.length,tag);
    const expected=a.sections.map(s=>({id:s.id,title:s.title,html:renderToStaticMarkup(createElement(Markdown,{skipHtml:true},s.bodyMarkdown))}));
    const comparison=await page.evaluate(sections=>{
     const normalize=text=>text.replace(/\s+/g,' ').trim();
     return sections.map(section=>{
      const element=document.querySelector(`[data-learning-section="${section.id}"]`);
      if(!element)return {id:section.id,exists:false};
      const actual=element.cloneNode(true);const heading=actual.querySelector('h2');const title=heading?.textContent;heading?.remove();
      const expected=new DOMParser().parseFromString(section.html,'text/html');
      return {id:section.id,exists:true,titleMatches:title===section.title,textMatches:normalize(actual.textContent)===normalize(expected.body.textContent),linksMatch:JSON.stringify([...actual.querySelectorAll('a')].map(a=>a.getAttribute('href')))===JSON.stringify([...expected.querySelectorAll('a')].map(a=>a.getAttribute('href')))};
     });
    },expected);
    for(const section of comparison){assert.ok(section.exists&&section.titleMatches&&section.textMatches&&section.linksMatch,`${tag}: full section differs ${JSON.stringify(section)}`);}
    const cases=a.sections.filter(s=>/^case-[12]$/.test(s.role));assert.equal(cases.length,2,tag);
    for(const section of cases){
     await page.locator(`aside nav a[href="#${section.id}"]`).click();await expect(page).toHaveURL(u=>u.hash===`#${section.id}`);await expect(page.locator(`#${section.id}-title`)).toBeInViewport();
     if(width===390&&id==='page-of-cups'&&section.role==='case-2'&&locale!=='zh'){const name=`${locale}-page-of-cups-case-2-390.png`;await page.screenshot({path:resolve(out,name)});report.screenshots.push(name);}
    }
    const anchors=manifest.cards[id].legacyAnchors.map(x=>x.id);
    const results=await page.evaluate(ids=>ids.map(id=>{const nodes=document.querySelectorAll(`[id="${id}"]`);const e=nodes[0];if(!e)return {id,count:0};e.scrollIntoView({block:'start',behavior:'instant'});const r=e.getBoundingClientRect();return {id,count:nodes.length,top:r.top,viewport:innerHeight};}),anchors);
    for(const anchor of results){assert.equal(anchor.count,1,`${tag}: legacy anchor ${anchor.id}`);assert.ok(anchor.top>=-1&&anchor.top<anchor.viewport,`${tag}: unreachable legacy anchor ${JSON.stringify(anchor)}`);}
    if(a.sourceAppendix){
     const appendix=page.locator('[data-learning-source-appendix]');await expect(appendix.locator('h2')).toHaveText(a.sourceAppendix.title);assert.equal(await appendix.locator('li').count(),a.sources.length);
     const items=await appendix.locator('li').allTextContents();assert.deepEqual(items,a.sources.map(s=>s.title),`${tag}: source titles`);
     assert.deepEqual(await appendix.locator('a').evaluateAll(links=>links.map(a=>a.getAttribute('href'))),a.sources.filter(s=>s.url).map(s=>s.url),`${tag}: source links`);
     if(width===1440&&id==='moon'&&locale==='ru'){await appendix.scrollIntoViewIfNeeded();const name='ru-moon-source-appendix-1440.png';await page.screenshot({path:resolve(out,name)});report.screenshots.push(name);}
    }
    if((width===390&&id==='fool')||(width===1440&&id==='king-of-swords'&&locale!=='zh')){await page.evaluate(()=>scrollTo(0,0));const name=`${locale}-${id}-${width}.png`;await page.screenshot({path:resolve(out,name)});report.screenshots.push(name);}
    report.views.push({locale,cardId:id,width,height,sections:a.sections.length,cases:cases.length,legacyAnchors:anchors.length,sourceAppendix:Boolean(a.sourceAppendix)});
   }
   writeFileSync(resolve(out,'progress.json'),JSON.stringify({completedViews:report.views.length,lastLocale:locale,lastWidth:width},null,2)+'\n');
   console.log(`PASS ${locale}/77 articles/${width}px: exact sections, citations, quick takes, case navigation, old anchors, sources, image and fit`);
  }
 }
 for(const locale of locales){
  for(const id of ['fool','four-of-cups','page-of-cups','king-of-pentacles']){
   const original=new URL(`${manifest.cards[id].route}${suffix(locale)}`,base).href;await page.goto(original);
   const next=page.locator('article a[rel=next]'),previous=page.locator('article a[rel=prev]');const link=await next.count()?next:previous;const href=await link.getAttribute('href');
   assert.equal(new URL(href,base).searchParams.get('locale'),locale==='en'?null:locale);await link.click();await page.waitForURL(u=>u.pathname===new URL(href,base).pathname);await expect(page.locator('main')).toHaveAttribute('lang',tags[locale]);
   await page.goBack();await expect(page).toHaveURL(original);await expect(page.locator('h1')).toHaveText(read(`content/tarot/${locale}/${id}.json`).title);
   await page.goForward();await expect(page).toHaveURL(new URL(href,base).href);await expect(page.locator('main')).toHaveAttribute('lang',tags[locale]);
   const target=locales[(locales.indexOf(locale)+1)%locales.length];
   await page.goBack();await page.locator(`header a[hreflang="${tags[target]}"]`).first().click();await page.waitForURL(u=>(u.searchParams.get('locale')??'en')===target);await expect(page.locator('main')).toHaveAttribute('lang',tags[target]);
   await expect(page.locator('h1')).toHaveText(read(`content/tarot/${target}/${id}.json`).title);
   await page.goBack();await expect(page).toHaveURL(original);await expect(page.locator('main')).toHaveAttribute('lang',tags[locale]);
   await page.goForward();await expect(page.locator('main')).toHaveAttribute('lang',tags[target]);
   report.workflows.push({locale,cardId:id,crossCardHref:href,backForward:true,targetLanguage:target,languageSwitchBackForward:true});
  }
 }
 assert.equal(report.views.length,616);assert.deepEqual(report.pageErrors,[]);report.status='passed';console.log('PASS 616 article views and 16 cross-card/language Back/Forward workflows; no page errors');await context.close();
}catch(error){report.status='failed';report.error=error.stack;throw error;}
finally{report.totals={views:report.views.length,caseNavigations:report.views.reduce((n,v)=>n+v.cases,0),legacyAnchorChecks:report.views.reduce((n,v)=>n+v.legacyAnchors,0),sourceAppendixViews:report.views.filter(v=>v.sourceAppendix).length,historyWorkflows:report.workflows.length};report.finishedAt=new Date().toISOString();writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
