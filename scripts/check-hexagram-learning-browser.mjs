import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,mkdirSync} from 'node:fs';
const {chromium,expect}=createRequire(import.meta.url)('playwright/test');
const base=process.argv[2]??'http://127.0.0.1:3024',evidence=process.env.QA_EVIDENCE_DIR;
const identities=JSON.parse(readFileSync('content/hexagrams/identities.verified.json','utf8')).hexagrams;
const fixtures={11:'Hexagram learning 59',12:'Hexagram learning 77',63:'Hexagram learning 27',64:'Hexagram learning 40'};
if(evidence)mkdirSync(evidence,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const locale of ['en','zh','zh-TW','ru']){
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[],writes=[];
 context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
 await context.route('**/*',route=>{const r=route.request();if(r.method()!=='GET')writes.push(r.url());return new URL(r.url()).origin===new URL(base).origin&&r.method()==='GET'?route.continue():route.abort();});
 const page=await context.newPage(),suffix=locale==='en'?'':`?locale=${locale}`;
 for(const [width,height] of [[320,568],[390,844],[430,932],[1440,900]]){
  await page.setViewportSize({width,height});
  for(const slug of ['hexagrams','hexagram-01','hexagram-11','hexagram-12','hexagram-63','hexagram-64']){
   const response=await page.goto(`${base}/journal/${slug}${suffix}`);assert.equal(response.status(),200);
   await expect(page.locator('h1')).toBeVisible();await expect(page).toHaveTitle(`${await page.locator('h1').innerText()} | DestinyPixel`);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${locale}/${slug}/${width}: overflow`);
   if(slug==='hexagrams'){
    assert.ok(await page.locator('section article h2').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth+1)),`${locale}/${width}: card title overflow`);
    const diagrams=page.locator('[data-hexagram-diagram]');await expect(diagrams).toHaveCount(64);
    for(let i=0;i<64;i++){const bits=await diagrams.nth(i).locator('[data-position]').evaluateAll(es=>es.map(e=>Number(e.dataset.yang==='true')));assert.deepEqual(bits,[...identities[i].linesBottomUp].reverse());}
   }else{
    await expect(page.locator('[data-manuscript-opening]')).toHaveCount(1);
    const diagram=page.locator('pre[data-hexagram-diagram]');await expect(diagram).toHaveAttribute('role','img');assert.ok((await diagram.getAttribute('aria-label')).length>40);
    const size=await diagram.evaluate(e=>({scroll:e.scrollWidth,width:e.clientWidth}));assert.ok(size.scroll<=size.width+1,`${slug} diagram clipped`);
    await expect(page.locator('[data-full-manuscript] h2, [data-full-manuscript] h3').filter({hasText:/^(?:初|上)[六九]|^[六九][二三四五]/})).toHaveCount(6);
    const anchors=await page.locator('aside nav a').evaluateAll(es=>es.map(e=>e.hash));for(const anchor of anchors)await expect(page.locator(anchor)).toHaveCount(1);
   }
   if(evidence&&width===390&&['zh','ru'].includes(locale)&&['hexagrams','hexagram-11'].includes(slug))await page.screenshot({path:`${evidence}/${locale}-${slug}-390.png`});
  }
  console.log(`PASS ${locale}/${width}: directory + five articles, six-line diagrams, full headings, title and responsive fit`);
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto(`${base}/journal/hexagrams${suffix}`);
 const first=page.locator(`a[href="/journal/hexagram-11${suffix}"]`).first();await first.focus();await page.keyboard.press('Enter');await page.waitForURL(u=>u.pathname==='/journal/hexagram-11');await page.goBack();await page.waitForURL(u=>u.pathname==='/journal/hexagrams');
 await page.goto(`${base}/journal/hexagram-63${suffix}`);await page.locator(`header a[href="/oracle${suffix}"]`).click();await page.waitForURL(u=>u.pathname==='/oracle');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${locale}: mobile Oracle overflow`);
 await page.locator('input[type=datetime-local]').fill('2026-10-07T12:00');
 for(const [number,question] of Object.entries(fixtures)){
  await page.locator('.insight-oracle-grid textarea').fill(question);
  await expect(page.locator('.oracle-learning-link')).toHaveAttribute('href',`/journal/hexagram-${number}${suffix}`);
  const before=await page.locator('.oracle-hexagram-line').evaluateAll(es=>es.map(e=>({yang:e.dataset.yang,moving:e.dataset.moving})));
  assert.deepEqual(before.map(l=>Number(l.yang==='true')),[...identities[Number(number)-1].linesBottomUp].reverse());
  const link=page.locator('.oracle-learning-link');await link.focus();const opened=context.waitForEvent('page');await page.keyboard.press('Enter');const article=await opened;
  await article.waitForLoadState('domcontentloaded');await expect(article.locator('article')).toHaveAttribute('data-hexagram-learning',`hexagram-${number}`);await expect(article.locator('link[rel=canonical]')).toHaveAttribute('href',`https://www.destinypixel.com/journal/hexagram-${number}${suffix}`);await article.close();
  await expect(page.locator('.insight-oracle-grid textarea')).toHaveValue(question);assert.deepEqual(await page.locator('.oracle-hexagram-line').evaluateAll(es=>es.map(e=>({yang:e.dataset.yang,moving:e.dataset.moving}))),before);
 }
 await page.goBack();await page.waitForURL(u=>u.pathname==='/journal/hexagram-63');await expect(page.locator('article')).toHaveAttribute('data-hexagram-learning','hexagram-63');
 await page.locator('header a[hreflang="ru"]').click();await page.waitForURL(u=>u.searchParams.get('locale')==='ru');await expect(page.locator('main')).toHaveAttribute('lang','ru');await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://www.destinypixel.com/journal/hexagram-63?locale=ru');
 assert.deepEqual(writes,[],'Learning flow must not initiate API writes or AI calls');assert.deepEqual(errors,[]);
 console.log(`PASS ${locale}: keyboard/Back, article → Oracle → correct Tai/Pi/Jiji/Weiji articles in new tabs, cast preserved, language metadata, zero API writes`);await context.close();
}}finally{await browser.close();}
