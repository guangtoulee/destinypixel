const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium, expect } = require('/opt/codex/cua_node/lib/node_modules/playwright/test');
const base = process.argv[2] || 'http://127.0.0.1:3041';
const out = process.argv[3] || '/tmp/tarot-onboarding-qa';
const scenes = ['en', 'zh', 'zh-TW', 'ru'].flatMap(locale => [[320,740], [390,844], [1440,900]].map(viewport => ({locale, viewport})));
scenes.push({locale:'en',viewport:[1280,720]}, {locale:'zh',viewport:[1280,720]});
const freeText = {en:/Free cards & meanings.*no sign-up/,zh:/免费抽牌与牌义.*无需注册/,'zh-TW':/免費抽牌與牌義.*無需註冊/,ru:/Карты и значения бесплатно.*без регистрации/};
const revealText = {en:/reveal.*meaning/,zh:/翻开.*牌义/,'zh-TW':/翻開.*牌義/,ru:/открыть.*значение/};
const meaningText = {en:/revealed card.*meaning/,zh:/已翻开的牌.*牌义/,'zh-TW':/已翻開的牌.*牌義/,ru:/открытую карту.*значение/};
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  const results=[];
  try { for (const {locale,viewport:[width,height]} of scenes) {
    const context=await browser.newContext({viewport:{width,height},isMobile:width<740,hasTouch:width<740,reducedMotion:width===390?'reduce':'no-preference'});
    const page=await context.newPage(),errors=[],blocked=[];
    page.on('pageerror',e=>errors.push(e.message));
    await context.route('**/*',route=>{
      const request=route.request(),url=new URL(request.url());
      if (['GET','HEAD'].includes(request.method()) && url.origin===new URL(base).origin && !/\/_vercel\/|analytics|speed-insights/.test(url.pathname)) return route.continue();
      blocked.push({method:request.method(),path:url.origin+url.pathname});return route.abort();
    });
    const id=`${locale}-${width}x${height}`;
    await page.goto(`${base}/tarot?locale=${locale}`);
    await expect(page.locator('#table')).toHaveAttribute('aria-busy','false');
    await page.waitForTimeout(950);
    const shuffle=page.locator('.tarot-bottom-deck .cel-button'),draw=page.locator('.tarot-draw-action'),reset=page.locator('.tarot-complete-reset');
    await expect(page.locator('.cel-hero .cel-kicker')).toHaveText(freeText[locale]);
    await expect(reset).toHaveCount(0);
    const initialBox=await shuffle.boundingBox();assert.ok(initialBox.y>=0 && initialBox.y+initialBox.height<=height,`${id}: start not fully visible ${JSON.stringify(initialBox)}`);
    await expect(page.locator('.tarot-fan-choice')).toHaveCount(6);
    const scene=await page.locator('.tarot-scene-landscape').evaluate(async e=>{
      const url=getComputedStyle(e).backgroundImage.slice(5,-2);const img=new Image();img.src=url;await img.decode();return {url,width:img.naturalWidth,height:img.naturalHeight};
    });assert.ok(scene.width>0);
    await expect(page.locator('[data-tarot-navigation] a')).toHaveCount(3);
    await page.screenshot({path:`${out}/${id}-initial.png`});
    await shuffle.click();await expect(draw).toBeEnabled();
    await draw.click();await expect(page.locator('#tarot-board .tarot-flipper')).toHaveCount(1);
    await expect(page.locator('.tarot-deck-actions p')).toHaveText(revealText[locale]);
    for(let i=1;i<3;i++){await draw.click();await expect(page.locator('#tarot-board .tarot-flipper')).toHaveCount(i+1);}
    for(let i=0;i<3;i++){await page.locator(`[data-drop-slot="${i}"]`).press('Enter');await expect(page.locator('#tarot-board img')).toHaveCount(i+1);}
    await expect(reset).toBeVisible();await expect(page.locator('.tarot-deck-actions p')).toHaveText(meaningText[locale]);
    const identities=await page.locator('#tarot-board img').evaluateAll(es=>es.map(e=>e.getAttribute('src')));assert.equal(new Set(identities).size,3);
    assert.match(await page.locator('.tarot-deck-label span').innerText(),/75/);
    await page.locator('#tarot-board').scrollIntoViewIfNeeded();await page.waitForTimeout(650);
    await page.screenshot({path:`${out}/${id}-completed.png`});
    await page.locator('[data-drop-slot="0"]').press('Enter');await expect(page.locator('dialog[open]')).toHaveCount(1);
    const learning=page.locator('dialog[open] .tarot-learning-link');await expect(learning).toBeVisible();const href=await learning.getAttribute('href');assert.match(href,/\/journal\/tarot-/);if(locale!=='en')assert.match(href,new RegExp(`locale=${locale}`));
    const article=await context.request.get(new URL(href,base).href);assert.equal(article.status(),200);
    await page.goBack();await expect(page.locator('dialog[open]')).toHaveCount(0);await expect(page.locator('#tarot-board img')).toHaveCount(3);
    let confirm='';page.once('dialog',async dialog=>{confirm=dialog.message();await dialog.dismiss();});await reset.click();
    assert.ok(confirm.length>0);assert.deepEqual(await page.locator('#tarot-board img').evaluateAll(es=>es.map(e=>e.getAttribute('src'))),identities);
    page.once('dialog',dialog=>dialog.accept());await reset.click();
    await expect(page.locator('.tarot-workbench')).toHaveAttribute('data-has-cards','false');await expect(page.locator('#tarot-board .tarot-flipper')).toHaveCount(0);await expect(draw).toBeDisabled();await expect(reset).toHaveCount(0);assert.match(await page.locator('.tarot-deck-label span').innerText(),/78/);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.ok(overflow<=1);assert.deepEqual(errors,[]);
    results.push({id,initialBox,scene,href,completedUnique:3,cancelPreserves:true,confirmedReset:true,overflow,errors,blocked});
    fs.writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));console.log(`PASS ${id}: visible start/free scope, reveal guidance, card article/back, confirmed restart`);
    await context.close();
  }} finally {await browser.close();}
  console.log(`PASS ${results.length}/${scenes.length} production browser cases`);
})().catch(error=>{console.error(error);process.exitCode=1;});
