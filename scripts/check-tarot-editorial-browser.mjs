import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,readFileSync} from 'node:fs';
const {chromium,expect}=createRequire(import.meta.url)('playwright/test');
const base=process.argv[2]??'http://127.0.0.1:3038',evidence=process.env.QA_EVIDENCE_DIR;
if(evidence)mkdirSync(evidence,{recursive:true});
const slugs=['tarot-sun','why-the-four-fours-differ','how-to-connect-three-tarot-cards','tarot-from-game-to-occult-traditions'];
const locales=['en','zh','zh-TW','ru'],tags={en:'en',zh:'zh-Hans','zh-TW':'zh-Hant',ru:'ru'};
const editions=Object.fromEntries(locales.map(l=>[l,JSON.parse(readFileSync(`content/tarot-editorial/${l}.json`,'utf8'))]));
const suffix=l=>l==='en'?'':`?locale=${l}`;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox']});
const context=await browser.newContext({reducedMotion:'reduce'}),errors=[];
context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
await context.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin&&r.request().method()==='GET'?r.continue():r.abort());
const page=await context.newPage();
async function assertEdition(slug,locale){
 await expect(page.locator('h1')).toHaveText(editions[locale][slug].title);
 await expect(page).toHaveTitle(editions[locale][slug].title+' | DestinyPixel');
 await expect(page.locator('main')).toHaveAttribute('lang',tags[locale]);
 await expect(page.locator('link[rel=canonical]')).toHaveCount(1);
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',`https://www.destinypixel.com/journal/${slug}${suffix(locale)}`);
 const description=slug==='tarot-sun'?editions[locale][slug].opening[2]:editions[locale][slug].opening[0];
 await expect(page.locator('meta[name=description]')).toHaveAttribute('content',description);
}
try{
 for(const locale of locales){
  for(const [width,height] of [[320,568],[390,844],[1440,900]]){
   await page.setViewportSize({width,height});
   for(const slug of ['journal',...slugs]){
    const response=await page.goto(`${base}/${slug==='journal'?'journal':`journal/${slug}`}${suffix(locale)}`);assert.equal(response.status(),200);
    await expect(page.locator('h1')).toBeVisible();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${slug}/${locale}/${width}: overflow`);
    if(slug==='journal'){
     await expect(page.locator('#tarot-education')).toBeVisible();
     assert.equal(await page.locator('#tarot-education article').count(),3);
    }else{
     await assertEdition(slug,locale);
     for(const image of await page.locator('article img').all()){
      await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(e=>e.complete&&e.naturalWidth>0)).toBe(true);
     }
     const sections=editions[locale][slug].sections;
     assert.equal(await page.locator('article section').count(),sections.length);
     await page.locator(`a[href="#${sections.at(-1).id}"]`).click();
     await expect(page.locator(`#${sections.at(-1).id}`)).toBeInViewport();
     await page.locator('[data-editorial-links] a').first().focus();
     assert.ok(await page.locator('[data-editorial-links] a').first().evaluate(e=>e===document.activeElement));
    }
    if(evidence&&((locale==='zh'&&width===390)||(locale==='ru'&&width===390&&slug==='tarot-from-game-to-occult-traditions')||(locale==='en'&&width===1440&&slug==='journal'))){
     await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${evidence}/${locale}-${slug}-${width}.png`,fullPage:true});
    }
   }
   console.log(`PASS ${locale}/${width}: journal + four full articles, images, anchors, focus and responsive fit`);
  }
 }
 await page.setViewportSize({width:390,height:844});
 for(const slug of slugs){
  await page.goto(`${base}/journal/${slug}`);await assertEdition(slug,'en');
  for(const locale of ['zh','zh-TW','ru']){await page.locator(`header a[hreflang="${tags[locale]}"]`).click();await page.waitForURL(u=>u.searchParams.get('locale')===locale);await assertEdition(slug,locale);}
  for(const locale of ['zh-TW','zh','en']){await page.goBack();await assertEdition(slug,locale);}
  for(const locale of ['zh','zh-TW','ru']){await page.goForward();await assertEdition(slug,locale);}
  const link=page.locator('[data-editorial-links] a').first(),href=await link.getAttribute('href');await link.focus();await page.keyboard.press('Enter');await page.waitForURL(new URL(href,base).href);
  await page.goBack();await assertEdition(slug,'ru');
  console.log(`PASS ${slug}: four-language navigation, Back/Forward, keyboard related link and return`);
 }
 assert.deepEqual(errors,[]);console.log('PASS 60 responsive views and 4 language/history/link workflows; no page errors');
}finally{await context.close();await browser.close();}
