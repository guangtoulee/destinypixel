import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const {chromium,expect}=createRequire(import.meta.url)('playwright/test');
const base=new URL(process.argv[2]??'http://127.0.0.1:3040');
assert.ok(['127.0.0.1','localhost','[::1]'].includes(base.hostname),'QA is restricted to a loopback server');
const out=resolve(process.env.QA_EVIDENCE_DIR??'docs/qa/tarot-depth-20261008/browser-local');
mkdirSync(out,{recursive:true});
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const manifest=read('content/tarot-depth-20261008/manifest.json');
const cards=Object.keys(read('content/tarot-depth-20261008/revisions.json').cards).sort((a,b)=>manifest.cards[a].deckOrder-manifest.cards[b].deckOrder);
assert.equal(cards.length,77);assert.ok(!cards.includes('sun'));
const plain=s=>s.replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/\*\*|__/g,'').replace(/\s+/g,' ').trim();
const report={scope:'Local Chinese integration only; no public Preview or production verification',base:base.origin,startedAt:new Date().toISOString(),cards:cards.length,views:[],workflows:[],screenshots:[],pageErrors:[],blockedExternalRequests:0};
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const context=await browser.newContext({reducedMotion:'reduce'});
 await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin===base.origin&&route.request().method()==='GET')return route.continue();report.blockedExternalRequests++;return route.abort();});
 const page=await context.newPage();page.on('pageerror',error=>report.pageErrors.push(error.message));
 for(const [width,height] of [[390,844],[1440,900]]){
  await page.setViewportSize({width,height});
  for(const id of cards){
   const a=read(`content/tarot/zh/${id}.json`),tag=`${id}/${width}`;
   const response=await page.goto(new URL(`${manifest.cards[id].route}?locale=zh`,base).href);
   assert.equal(response.status(),200,tag);await expect(page.locator('h1')).toHaveText(a.title);await expect(page).toHaveTitle(`${a.title} | DestinyPixel`);
   await expect(page.locator('main')).toHaveAttribute('lang','zh-Hans');
   await expect(page.locator('article dl dd').nth(0)).toHaveText(a.quickTake.upright);await expect(page.locator('article dl dd').nth(1)).toHaveText(a.quickTake.reversed);
   await expect(page.locator('[data-learning-hook]')).toHaveText(a.hook);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${tag}: horizontal overflow`);
   const image=page.locator('article figure img');await expect.poll(()=>image.evaluate(e=>e.complete&&e.naturalWidth>0)).toBe(true);
   const sections=page.locator('[data-learning-section]');assert.equal(await sections.count(),a.sections.length,tag);
   for(const section of a.sections){
    const node=page.locator(`[data-learning-section="${section.id}"]`);await expect(node.locator('h2')).toHaveText(section.title);
    const text=plain(await node.innerText());
    for(const paragraph of section.bodyMarkdown.split(/\n\s*\n/).filter(p=>!p.startsWith('- '))){assert.ok(text.includes(plain(paragraph)),`${tag}/${section.id}: missing full paragraph`);}
   }
   const cases=a.sections.filter(s=>/^case-[12]$/.test(s.role));assert.equal(cases.length,2,tag);
   for(const section of cases){
    await page.locator(`aside nav a[href="#${section.id}"]`).click();
    await expect(page).toHaveURL(u=>u.hash===`#${section.id}`);
    await expect(page.locator(`#${section.id}-title`)).toBeInViewport();
    if(width===390&&id==='page-of-cups'&&section.role==='case-2'){const name='zh-page-of-cups-case-2-390.png';await page.screenshot({path:resolve(out,name)});report.screenshots.push(name);}
   }
   const anchors=manifest.cards[id].legacyAnchors.map(x=>x.id);
   const results=await page.evaluate(ids=>ids.map(id=>{const nodes=document.querySelectorAll(`[id="${id}"]`);const e=nodes[0];if(!e)return {id,count:0};e.scrollIntoView({block:'start',behavior:'instant'});const r=e.getBoundingClientRect();return {id,count:nodes.length,top:r.top,bottom:r.bottom,viewport:innerHeight};}),anchors);
   for(const anchor of results){assert.equal(anchor.count,1,`${tag}: legacy anchor ${anchor.id}`);assert.ok(anchor.top>=-1&&anchor.top<anchor.viewport,`${tag}: legacy anchor unreachable ${JSON.stringify(anchor)}`);}
   if(a.sourceAppendix){
    const appendix=page.locator('[data-learning-source-appendix]');await expect(appendix.locator('h2')).toHaveText(a.sourceAppendix.title);assert.equal(await appendix.locator('li').count(),a.sources.length);
    for(const source of a.sources){assert.ok((await appendix.innerText()).includes(source.title));if(source.url)await expect(appendix.locator(`a[href="${source.url}"]`)).toHaveCount(1);}
    if(width===1440&&id==='moon'){await appendix.scrollIntoViewIfNeeded();const name='zh-moon-source-appendix-1440.png';await page.screenshot({path:resolve(out,name)});report.screenshots.push(name);}
   }
   if((width===390&&['fool','page-of-cups','king-of-pentacles'].includes(id))||(width===1440&&['fool','king-of-swords'].includes(id))){
    await page.evaluate(()=>scrollTo(0,0));const name=`zh-${id}-${width}.png`;await page.screenshot({path:resolve(out,name)});report.screenshots.push(name);
   }
   report.views.push({cardId:id,width,height,sections:a.sections.length,cases:cases.length,legacyAnchors:anchors.length,sourceAppendix:Boolean(a.sourceAppendix)});
  }
  console.log(`PASS 77 Chinese articles at ${width}px: full paragraphs, quick takes, case navigation, old anchors, source appendices, image and overflow`);
 }
 for(const id of ['fool','four-of-cups','page-of-cups','king-of-pentacles']){
  const original=new URL(`${manifest.cards[id].route}?locale=zh`,base).href;await page.goto(original);
  const next=page.locator('article a[rel=next]'),previous=page.locator('article a[rel=prev]');const link=await next.count()?next:previous;const href=await link.getAttribute('href');
  assert.equal(new URL(href,base).searchParams.get('locale'),'zh');await link.click();await page.waitForURL(u=>u.pathname===new URL(href,base).pathname);await expect(page.locator('main')).toHaveAttribute('lang','zh-Hans');
  await page.goBack();await expect(page).toHaveURL(original);await expect(page.locator('h1')).toHaveText(read(`content/tarot/zh/${id}.json`).title);
  await page.goForward();await expect(page).toHaveURL(new URL(href,base).href);await expect(page.locator('main')).toHaveAttribute('lang','zh-Hans');
  await page.goBack();await page.locator('header a[hreflang="ru"]').first().click();await page.waitForURL(u=>u.searchParams.get('locale')==='ru');await expect(page.locator('main')).toHaveAttribute('lang','ru');
  await page.goBack();await expect(page).toHaveURL(original);await expect(page.locator('main')).toHaveAttribute('lang','zh-Hans');
  await page.goForward();await expect(page.locator('main')).toHaveAttribute('lang','ru');
  report.workflows.push({cardId:id,crossCardHref:href,backForwardChinese:true,languageSwitchBackForward:true});
 }
 assert.deepEqual(report.pageErrors,[]);report.status='passed';console.log('PASS four cross-card/language Back/Forward workflows; no page errors');
 await context.close();
}catch(error){report.status='failed';report.error=error.stack;throw error;}
finally{report.finishedAt=new Date().toISOString();writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
