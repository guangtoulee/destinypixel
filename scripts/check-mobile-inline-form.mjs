// NODE_PATH=<Playwright modules> CHROMIUM_PATH=<chromium> node scripts/check-mobile-inline-form.mjs <local base> [screenshots directory]
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const {chromium,expect}=createRequire(import.meta.url)('playwright/test');
const base=process.argv[2]??'http://127.0.0.1:3010',output=process.argv[3];
if(output)await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined});
try {for(const width of [320,390,430])for(const locale of ['en','zh','zh-TW','ru']){
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[];let posts=0;
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{if(r.request().method()!=='GET'){posts++;return r.abort();}return new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort();});
 const suffix=locale==='en'?'':`?locale=${locale}`;
 await page.goto(`${base}/${suffix}`);
 const hero=page.locator('.editorial-display-card--2');const heroWidth=(await hero.boundingBox()).width;
 assert.ok(heroWidth>=width-48,`hero ${heroWidth}`);
 const collection=page.locator('.editorial-collection-card [data-card-artwork]').first();const collectionWidth=(await collection.boundingBox()).width;
 assert.ok(collectionWidth>=width-64,`collection ${collectionWidth}`);
 if(output&&width===390&&locale==='zh'){await hero.evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));await page.screenshot({path:`${output}/home-inline.png`});await collection.scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/collection-inline.png`});}
 await page.goto(`${base}/discover${suffix}`);await page.locator('#discovery-birthday').fill('1990-01-01');await page.locator('button[type=submit]').click();
 const card=page.locator('[data-card-artwork]');await expect(card).toBeVisible();
 await expect.poll(()=>card.locator('img').evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);
 const artwork=await card.boundingBox();assert.ok(artwork.width>=width-48,`discovery ${artwork.width}`);
 const below=await page.locator('[data-card-artwork]').evaluate(el=>{let node=el.nextElementSibling;while(node&&node.tagName==='DIALOG')node=node.nextElementSibling;return node?.getBoundingClientRect().top>=el.getBoundingClientRect().bottom;});assert.ok(below,'card copy stacks beneath artwork');
 if(output&&width===390){await card.scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/birthday-inline-${locale}.png`});}
 await page.locator(`a[href="/${suffix}#report"]`).click();
 const form=page.locator('form[data-analytics-form="birth_report"]');
 await expect(form.locator('[name=birthDate]')).toHaveValue('1990-01-01');await expect(page.locator('#report-form-error')).toHaveCount(0);assert.equal(posts,0,'navigation must not submit');
 const submit=form.locator('button[type=submit]');
 const error=page.locator('#report-form-error');
 await submit.click();await expect(form.locator('[name=name]')).toBeFocused();await expect(error).toBeVisible();
 const errorBox=await error.boundingBox(),formBox=await form.boundingBox();assert.ok(Math.abs(errorBox.width-formBox.width)<2,'error spans the form');
 await form.locator('[name=name]').fill('Fixture');await submit.click();await expect(form.locator('[name=birthTime]')).toBeFocused();
 await form.locator('[name=birthDate]').fill('');await submit.click();await expect(form.locator('[name=birthDate]')).toBeFocused();
 await form.locator('[name=birthDate]').fill('1990-01-01');await form.locator('[name=birthTime]').fill('09:30');await form.locator('[name=birthPlace]').fill('深圳');await submit.click();await expect(form.locator('[name=birthPlace]')).toBeFocused();
 const fields=await form.locator('input:not([type=radio]):not([type=hidden])').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,font:parseFloat(getComputedStyle(el).fontSize)};}));
 assert.ok(fields.every(f=>f.left>=0&&f.right<=width&&f.font>=16&&Math.abs(f.width-fields[0].width)<2));assert.equal(posts,0,'invalid fields prevented before network');
 assert.equal(await page.locator('.telegram-contact').evaluate(el=>getComputedStyle(el).visibility),'hidden');
 if(output&&width===390){await form.screenshot({path:`${output}/form-validation-${locale}.png`});}
 await form.locator('[name=birthPlace]').fill('上海');
 // Capture a valid browser submit without executing a server action. The real action is tested separately with mocked services.
 await form.evaluate(el=>el.addEventListener('submit',event=>{event.preventDefault();window.__mockedReportForm=Object.fromEntries(new FormData(el));},{capture:true,once:true}));
 await submit.click();await expect.poll(()=>page.evaluate(()=>window.__mockedReportForm?.birthDate)).toBe('1990-01-01');
 assert.equal(await page.evaluate(()=>window.__mockedReportForm.birthPlace),'上海');assert.equal(posts,0);
 await page.goto(`${base}/?locale=${locale}&error=report-storage-unavailable#report`);await expect(page.locator('#report-form-error')).toBeVisible();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
 console.log(JSON.stringify({width,locale,heroWidth,collectionWidth,discoveryWidth:artwork.width,status:'PASS',flow:'birthday retained; no submission on navigation; first invalid field focused; full-width error; mocked valid submit; storage-error layout'}));await context.close();
}}finally{await browser.close();}
