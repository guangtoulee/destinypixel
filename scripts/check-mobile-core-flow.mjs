// NODE_PATH=<Playwright modules> CHROMIUM_PATH=<chromium> node scripts/check-mobile-core-flow.mjs <local base> [screenshots directory]
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
const {chromium,expect}=createRequire(import.meta.url)("playwright/test");
const base=process.argv[2]??"http://127.0.0.1:3007", output=process.argv[3];
if(output)await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true});
const locales=["en","zh","zh-TW","ru"], birthday="1990-05-12";
const handoff="destinypixel-birthday-handoff";
try {
 for(const width of [320,390,430,1280])for(const locale of locales){
  const context=await browser.newContext({viewport:{width,height:900},isMobile:width<700,hasTouch:width<700});
  const page=await context.newPage(),errors=[],requests=[];
  page.on("pageerror",e=>errors.push(e.message));
  await context.route("**/*",route=>{const r=route.request();requests.push({url:r.url(),method:r.method()});return r.method()==="GET"&&new URL(r.url()).origin===new URL(base).origin?route.continue():route.abort();});
  const suffix=locale==="en"?"":`?locale=${locale}`;
  await page.goto(`${base}/discover${suffix}`);
  await page.locator("#discovery-birthday").fill(birthday);
  await page.locator('button[type="submit"]').click();
  const card=page.locator("[data-card-artwork]");
  await expect(card).toBeVisible();
  await expect.poll(()=>card.locator("img").evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  const box=await card.boundingBox();assert.ok(box.width>=Math.min(240,width-72),`card too small: ${box.width}`);
  assert.equal(await page.evaluate(key=>sessionStorage.getItem(key),handoff),null,"no storage before explicit continue");
  const before=page.url();
  for(let i=0;i<3;i++){
   await card.focus(); await page.keyboard.press(i===0?"Enter":"Space");
   await expect(page.locator("dialog[open]")).toBeVisible();
   assert.equal(page.url(),before,"opening art must not add private or public URL params");
   assert.equal(await page.evaluate(()=>document.documentElement.style.overflow),"hidden");
   await page.keyboard.press("Tab");
   assert.ok(await page.evaluate(()=>document.querySelector("dialog[open]").contains(document.activeElement)),"focus stays inside modal");
   if(output&&width===390&&i===0){await expect.poll(()=>page.locator("dialog[open] img").evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);await page.screenshot({path:`${output}/card-dialog-${locale}.png`});}
   if(i===0)await page.keyboard.press("Escape");
   if(i===1){await page.goBack();await expect(page.locator("dialog")).not.toBeVisible();await page.goForward();await expect(page.locator("dialog[open]")).toBeVisible();await page.locator("dialog button").click();}
   if(i===2)await page.locator("dialog button").click();
   await expect(page.locator("dialog")).not.toBeVisible();
   assert.notEqual(await page.evaluate(()=>document.documentElement.style.overflow),"hidden");
   await expect(card).toBeFocused();
  }
  if(output&&width===390){await card.scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/card-result-${locale}.png`});}
  await page.locator(`a[href="/${suffix}#report"]`).click();
  await expect(page).toHaveURL(`${base}/${suffix}#report`);
  const form=page.locator('form[data-analytics-form="birth_report"]');
  await expect(form.locator('[name="birthDate"]')).toHaveValue(birthday);
  assert.equal(await page.evaluate(key=>sessionStorage.getItem(key),handoff),null,"handoff consumed");
  assert.ok(!page.url().includes(birthday));
  assert.ok(!requests.some(r=>decodeURIComponent(r.url).includes(birthday)),"birthday never enters request URLs");
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width} ${locale} page overflows`);
  const fields=await form.locator('input:not([type="hidden"]):not([type="radio"])').evaluateAll(inputs=>inputs.map(i=>{const r=i.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,fontSize:parseFloat(getComputedStyle(i).fontSize)};}));
  assert.ok(fields.every(f=>f.left>=0&&f.right<=width&&f.width>120&&f.fontSize>=16),JSON.stringify(fields));
  for(let i=1;i<fields.length;i++)if(width<700)assert.ok(Math.abs(fields[0].width-fields[i].width)<2,"mobile inputs align");
  assert.ok((await form.locator('[type="radio"]').evaluateAll(inputs=>inputs.map(i=>i.getBoundingClientRect().height))).every(h=>h<=1));
  await form.locator('[name="name"]').fill("Fixture");
  await form.locator('[name="birthTime"]').fill("09:30");
  const city=form.locator('[name="birthPlace"]');
  await city.fill("深圳"); await form.locator('[name="name"]').focus();
  await expect(page.locator("#report-city-error")).toBeVisible();
  // Invalid city is prevented in the browser. Never submit a valid report.
  const postsBefore=requests.filter(r=>r.method==="POST").length;
  await form.locator('button[type="submit"]').click();
  await expect(city).toBeFocused();
  assert.equal(requests.filter(r=>r.method==="POST").length,postsBefore);
  await city.fill("上海");await city.blur();
  await expect(page.locator("#report-city-error")).toHaveCount(0);
  await expect(city).toHaveValue("上海");
  if(width<700){await city.focus();assert.equal(await page.locator(".white-mobile-dock").evaluate(el=>getComputedStyle(el).visibility),"hidden");await city.blur();}
  if(output&&width===390){await page.locator(".white-form-panel").scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/report-form-${locale}.png`});}
  // Every collection image opens, including a horizontally scrolled card on mobile.
  const collection=page.locator(".editorial-collection-card [data-card-artwork]").last();
  await collection.click();await expect(page.locator("dialog[open]")).toBeVisible();
  await page.keyboard.press("Escape");await expect(page.locator("dialog[open]")).toHaveCount(0);
  await expect(collection).toBeFocused();
  await expect(page.locator(".editorial-more-art")).not.toHaveAttribute("open");
  await page.locator(".editorial-more-art > summary").click();await expect(page.locator(".editorial-more-art")).toHaveAttribute("open","");
  await page.locator(".editorial-more-art > summary").click();
  await page.locator(".editorial-more-practices > summary").click();await expect(page.locator("#insights")).toBeVisible();
  await page.locator(".editorial-more-practices > summary").click();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);
  console.log(`PASS ${width}px ${locale}: large card, modal/focus/scroll/reopen/history, private handoff, form, city validation, optional content`);
  await context.close();
 }
 // Verify the different city controls rather than conflating them.
 const page=await browser.newPage();await page.route("**/*",r=>r.request().method()==="GET"?r.continue():r.abort());
 await page.goto(`${base}/compatibility?locale=zh`);await expect(page.locator('select[name="city0"] option')).toHaveCount(13);
 await page.goto(`${base}/astrology?locale=zh`);await page.locator('select:has(option[value="custom"])').selectOption("custom");
 for(const name of ["latitude","longitude","timezone"])await expect(page.locator(`[name="${name}"]`)).toBeVisible();
 await page.close();console.log("PASS compatibility fixed list and astrology custom-coordinate controls remain available; no AI or account writes performed.");
}finally{await browser.close();}
