import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const {chromium,expect}=createRequire(import.meta.url)('playwright/test');
const base=new URL(process.argv[2]||'http://localhost:3052');
const out=process.env.QA_EVIDENCE_DIR||'/workspace/artifacts/tarot-interiors-20261009/interiors';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const report={base:base.origin,views:[],history:[],errors:[]};
const routes=['tarot-cards','tarot-sun','tarot-fool','why-the-four-fours-differ','how-to-connect-three-tarot-cards','tarot-from-game-to-occult-traditions','how-to-read-three-card-tarot','pamela-colman-smith-tarot-artist'];
const tags={en:'en',zh:'zh-Hans','zh-TW':'zh-Hant',ru:'ru'};
const context=await browser.newContext({reducedMotion:'reduce'});
await context.route('**/*',r=>r.request().method()==='GET'&&new URL(r.request().url()).origin===base.origin?r.continue():r.abort());
const page=await context.newPage();
page.on('pageerror',e=>report.errors.push(e.message));
try {
 for(const locale of ['zh','zh-TW','en','ru'])for(const [width,height] of [[360,800],[390,844],[430,932],[1440,900]]) {
  await page.setViewportSize({width,height});
  for(const slug of routes) {
   const path=`/journal/${slug}${locale==='en'?'':`?locale=${locale}`}`;
   assert.equal((await page.goto(new URL(path,base).href)).status(),200);
   await expect(page.locator('h1')).toBeVisible();
   await expect(page.locator('main')).toHaveAttribute('lang',tags[locale]);
   await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',`https://www.destinypixel.com${path}`);
   await expect(page.locator('link[rel=alternate][hreflang]')).toHaveCount(5);
   const background=await page.locator('main').evaluate(e=>{const s=getComputedStyle(e,'::before');return {image:s.backgroundImage,position:s.position,height:s.height,repeat:s.backgroundRepeat,animation:s.animationName};});
   assert.ok(background.image.includes(width<=650?'twilight-terrace-mobile.webp':'twilight-terrace.webp'));
   assert.equal(background.position,'fixed');assert.equal(background.height,`${height}px`);assert.equal(background.animation,'none');
   assert.equal(background.repeat.split(',').at(-1).trim(),'no-repeat','landscape artwork must not tile');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${locale}/${width}/${slug}: horizontal overflow`);
   for(const img of await page.locator('main img').all()) {
    // Exercise lazy-loaded images throughout the full directory/long article.
    await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate(e=>e.complete&&e.naturalWidth>0)).toBe(true);
   }
   if(slug==='tarot-cards')assert.equal(await page.locator('main article').count(),78);
   else {
    const color=await page.locator('main>article').evaluate(e=>getComputedStyle(e).backgroundColor);
    assert.match(color,/rgba?\(252, 249, 243(?:, 0\.98\d*)?\)/,'opaque light reading surface');
    const links=page.locator('aside nav a[href^="#"]');
    assert.ok(await links.count()>0);
    const anchor=await links.last().getAttribute('href');await links.last().click();
    await expect(page.locator(anchor)).toBeInViewport();
   }
   const capture=(locale==='zh'||locale==='ru')&&['tarot-cards','tarot-sun','how-to-connect-three-tarot-cards','pamela-colman-smith-tarot-artist'].includes(slug);
   if(capture) {
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:`${out}/${locale}-${width}-${slug}-top.png`});
    await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight*.5,behavior:'instant'}));await page.screenshot({path:`${out}/${locale}-${width}-${slug}-middle.png`});
   }
   await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
   await expect(page.locator('main>footer')).toBeInViewport();
   assert.equal(await page.locator('main').evaluate(e=>getComputedStyle(e,'::before').height),`${height}px`,'long-page backdrop stretched');
   report.views.push({locale,width,height,slug,background,fullImages:true,lastAnchor:true});
  }
  console.log(`PASS interiors ${locale}/${width}: 8 routes, full images, anchors, static backdrop, SEO`);
 }
 await page.setViewportSize({width:390,height:844});
 for(const slug of routes) {
  await page.goto(new URL(`/journal/${slug}`,base).href);
  for(const locale of ['zh','zh-TW','ru']) {
   await page.locator(`header a[hreflang="${tags[locale]}"]`).first().click();
   await expect(page.locator('main')).toHaveAttribute('lang',tags[locale]);
  }
  for(const locale of ['zh-TW','zh','en']) {await page.goBack();await expect(page.locator('main')).toHaveAttribute('lang',tags[locale]);}
  for(const locale of ['zh','zh-TW','ru']) {await page.goForward();await expect(page.locator('main')).toHaveAttribute('lang',tags[locale]);}
  report.history.push(slug);
 }
 for(const path of ['/journal','/journal/hexagram-01','/journal/fortune-stick-number-and-edition','/journal/what-is-a-day-pillar']) {
  const response=await page.goto(new URL(path,base).href);assert.equal(response.status(),200,path);
  assert.ok(!await page.locator('main').evaluate(e=>getComputedStyle(e,'::before').backgroundImage.includes('twilight-terrace')),`unrelated page themed: ${path}`);
 }
 assert.deepEqual(report.errors,[]);report.status='passed';
} catch(error) {report.status='failed';report.error=error.stack;throw error;}
finally {writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));await browser.close();}
