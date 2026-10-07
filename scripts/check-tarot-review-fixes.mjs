import assert from "node:assert/strict";
import {createRequire} from "node:module";
const {chromium,expect}=createRequire(import.meta.url)("playwright/test");
const base=process.argv[2] || "http://127.0.0.1:3015";
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || "/usr/bin/chromium",args:["--no-sandbox"]});
try {
 await Promise.all(["en","zh","zh-TW","ru"].map(async locale=>{
  const page=await browser.newPage({viewport:{width:1165,height:747},reducedMotion:"reduce"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.route("**/*",r=>new URL(r.request().url()).origin===new URL(base).origin && r.request().method()==="GET"?r.continue():r.abort());
  await page.goto(`${base}/tarot?locale=${locale}`);
  await expect(page.locator("#table")).toHaveAttribute("aria-busy","false");
  await page.locator(".tarot-controls [role=tab]").last().click();
  await page.locator(".tarot-check input").uncheck();
  await page.locator(".tarot-bottom-deck .cel-button").click();
  await expect(page.locator(".tarot-deck-top")).toBeEnabled();
  await page.locator(".tarot-deck-top").click();
  const card=page.locator(".tarot-free-card"),board=page.locator(".tarot-free");
  await card.press("Enter");
  async function contained(label){
   const r=await card.boundingBox(),b=await board.boundingBox();
   assert.ok(r.x>=b.x+5 && r.y>=b.y+5 && r.x+r.width<=b.x+b.width-5 && r.y+r.height<=b.y+b.height-5,`${locale}/${label}: rotated corners outside table`);
  }
  for(const [width,height] of [[1165,747],[320,568],[390,844],[430,932],[844,390]]){
   await page.setViewportSize({width,height});
   await page.locator(".tarot-workbench").evaluate(e=>e.scrollIntoView({block:"start",behavior:"instant"}));
   await page.waitForTimeout(100);
   const boxes=await page.locator(".tarot-controls,.tarot-free,.tarot-bottom-deck").evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {y:r.y,bottom:r.bottom}}));
   for(const box of boxes)assert.ok(box.y>=-1 && box.bottom<=height+1,`${locale}/${width} workspace offscreen: ${JSON.stringify(boxes)}`);
   for(let step=0;step<24;step++){
    await page.locator(".tarot-table-toolbar button").nth(1).click();
    await contained(`${width}/angle-${(step+1)*15}`);
   }
   // Keyboard and pointer movement use the same rotation-aware bounds.
   await page.locator(".tarot-table-toolbar button").nth(1).click();
   await card.focus();
   for(let i=0;i<12;i++){await card.press("ArrowRight");await card.press("ArrowDown");}
   await contained(`${width}/keyboard`);
   const r=await card.boundingBox(),b=await board.boundingBox();
   await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();
   await page.mouse.move(b.x+b.width+35,b.y+b.height+35,{steps:8});await page.mouse.up();
   await contained(`${width}/drag`);
   const image=card.locator("img");
   await expect(image).not.toHaveAttribute("style",/180deg/);
   const stableId=await card.getAttribute("data-card-id");
   await page.locator(".tarot-orientation-toggle").click();
   await expect(image).toHaveAttribute("style",/180deg/);
   assert.equal(await card.getAttribute("data-card-id"),stableId);
   await page.locator(".tarot-orientation-toggle").click();
   await expect(image).not.toHaveAttribute("style",/180deg/);
  }
  const before=await card.getAttribute("style"),id=await card.getAttribute("data-card-id"),remaining=await page.locator(".tarot-deck-label span").innerText();
  await card.press("Enter");
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await page.locator(".tarot-art-versions summary").click();
  await expect(page.locator(".tarot-only-edition")).toBeVisible();
  await expect(page.locator(".tarot-art-version-options button")).toHaveCount(0);
  await expect(page.locator(".tarot-art-versions a")).toHaveAttribute("href","/tarot/attribution.json");
  await page.locator(".tarot-dialog-tabs button").last().click();
  const src=await page.locator(".tarot-dialog-art").getAttribute("src");assert.ok(src.endsWith(`${id}.webp`));
  await page.keyboard.press("Escape");await expect(page.locator("dialog[open]")).toHaveCount(0);
  assert.equal(await card.getAttribute("style"),before);assert.equal(await card.getAttribute("data-card-id"),id);
  assert.equal(await page.locator(".tarot-deck-label span").innerText(),remaining);
  const expected=locale==="en"?"/account":`/account?locale=${locale}`;
  const links=await page.locator('a[href^="/account"]').evaluateAll(es=>es.map(e=>e.getAttribute("href")));
  assert.ok(links.length>=2);assert.ok(links.every(href=>href===expected),JSON.stringify(links));
  assert.deepEqual(errors,[]);
  console.log(`PASS ${locale}: five viewport fits, 120 rotation steps, keyboard/drag bounds, explicit reversal, current-edition viewer preserves reading, account locale`);
  await page.close();
 }));
} finally {await browser.close();}
