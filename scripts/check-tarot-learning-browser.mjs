import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const {chromium,expect}=createRequire(import.meta.url)('playwright/test');
const base=process.argv[2]??'http://127.0.0.1:3022',evidence=process.env.QA_EVIDENCE_DIR;
if(evidence)mkdirSync(evidence,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const locale of ['en','zh','zh-TW','ru']){
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const errors=[];
 context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
 await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin&&route.request().method()==='GET'?route.continue():route.abort());
 const page=await context.newPage(),suffix=locale==='en'?'':`?locale=${locale}`;
 for(const [width,height] of [[320,568],[390,844],[430,932],[1440,900]]){
  await page.setViewportSize({width,height});
  for(const slug of ['tarot-cards','tarot-fool','tarot-king-of-pentacles']){
   const response=await page.goto(`${base}/journal/${slug}${suffix}`);assert.equal(response.status(),200);
   await expect(page.locator('h1')).toBeVisible();await expect(page).toHaveTitle(`${await page.locator('h1').innerText()} | DestinyPixel`);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${locale}/${slug}/${width}: overflow`);
   if(slug!=='tarot-cards'){
    const image=page.locator('article figure img');await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(e=>e.complete&&e.naturalWidth>0)).toBe(true);
    const sizing=await image.evaluate(e=>({width:e.getBoundingClientRect().width,selected:Number(new URL(e.currentSrc).searchParams.get('w')),dpr:devicePixelRatio}));
    assert.equal(sizing.width,width<=650?220:280);assert.ok(sizing.selected<=sizing.width*sizing.dpr*1.5,`oversized selected image: ${JSON.stringify(sizing)}`);
    const labels=await page.locator('article dl dt').allTextContents();assert.equal(labels.length,2);
    const order=await page.locator('article dl, [data-learning-hook]').evaluateAll(es=>es.map(e=>e.tagName));assert.deepEqual(order,['DL','P']);
    assert.ok(await page.locator('[data-learning-section]').count()>=7);
   }
   if(evidence&&width===390&&['zh','ru'].includes(locale)){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${evidence}/${locale}-${slug}-390.png`});}
  }
  console.log(`PASS ${locale}/${width}: directory + two full articles, image/quick-take order and responsive fit`);
 }
 await page.goto(`${base}/journal/tarot-cards${suffix}`);
 const cardLink=page.locator(`a[href="/journal/tarot-fool${suffix}"]`).first();await cardLink.focus();await page.keyboard.press('Enter');await page.waitForURL(u=>u.pathname==='/journal/tarot-fool');await page.goBack();await page.waitForURL(u=>u.pathname==='/journal/tarot-cards');
 // Document language navigation updates both content and canonical.
 await page.locator('header a[hreflang="ru"]').click();await page.waitForURL(u=>u.searchParams.get('locale')==='ru');await expect(page.locator('main')).toHaveAttribute('lang','ru');await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://www.destinypixel.com/journal/tarot-cards?locale=ru');
 await page.goto(`${base}/tarot?locale=${locale}`);await expect(page.locator('#table')).toHaveAttribute('aria-busy','false');await page.locator('.tarot-controls [role=tab]').last().click();await page.locator('.tarot-bottom-deck .cel-button').click();await expect(page.locator('.tarot-deck-top')).toBeEnabled();await page.locator('.tarot-deck-top').click();const placed=page.locator('.tarot-free-card');await placed.press('Enter');await placed.press('Enter');
 const id=await placed.getAttribute('data-card-id'),before=await placed.getAttribute('style'),count=await page.locator('.tarot-deck-label span').innerText();
 const link=page.locator('.tarot-learning-link');await expect(link).toHaveAttribute('href',`/journal/tarot-${id}${suffix}`);await link.focus();
 const opened=context.waitForEvent('page');await page.keyboard.press('Enter');const article=await opened;await article.waitForLoadState('domcontentloaded');await expect(article.locator('article')).toHaveAttribute('data-tarot-learning',id);await article.close();
 await expect(page.locator('dialog[open]')).toHaveCount(1);await page.goBack();await expect(page.locator('dialog[open]')).toHaveCount(0);await expect(placed).toHaveAttribute('data-card-id',id);assert.equal(await placed.getAttribute('style'),before);assert.equal(await page.locator('.tarot-deck-label span').innerText(),count);
 await page.locator('.tarot-deck-top').press('ArrowDown');await expect(placed).toHaveAttribute('data-card-id',id);
 assert.deepEqual(errors,[]);console.log(`PASS ${locale}: directory keyboard/Back, language metadata, tool → full article new tab, original spread/dialog history preserved`);await context.close();
}}finally{await browser.close();}
