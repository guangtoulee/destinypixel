// NODE_PATH=<Playwright modules> CHROMIUM_PATH=<chromium> node scripts/check-birthday-locale.mjs <local base>
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium,expect}=createRequire(import.meta.url)('playwright/test');
const base=process.argv[2]??'http://127.0.0.1:3008';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined});
const draftKey='destinypixel-report-birthday-draft',handoffKey='destinypixel-birthday-handoff';
try {
 const page=await browser.newPage({viewport:{width:390,height:850},isMobile:true,hasTouch:true});
 const requests=[];await page.route('**/*',r=>{requests.push(r.request().url());return r.request().method()==='GET'&&new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort();});
 await page.goto(`${base}/discover`);await page.locator('#discovery-birthday').fill('1990-01-01');await page.locator('button[type=submit]').click();
 await page.locator('a[href="/#report"]').click();
 const date=()=>page.locator('[name=birthDate]');
 await expect(date()).toHaveValue('1990-01-01');
 assert.equal(await page.evaluate(k=>sessionStorage.getItem(k),handoffKey),null);
 const original=await page.evaluate(k=>JSON.parse(sessionStorage.getItem(k)),draftKey);
 for(const [label,locale] of [['简','zh'],['繁','zh-TW'],['RU','ru'],['EN','en']]){
  await page.getByRole('button',{name:label,exact:true}).click();
  await expect(page).toHaveURL(`${base}/${locale==='en'?'':`?locale=${locale}`}#report`);
  await expect(date()).toHaveValue('1990-01-01');
  assert.ok(!(await page.evaluate(()=>JSON.stringify(history.state))).includes("1990-01-01"));
  assert.deepEqual(await page.evaluate(k=>JSON.parse(sessionStorage.getItem(k)),draftKey),original);
 }
 await page.goBack();await expect(date()).toHaveValue('1990-01-01');
 await page.goForward();await expect(date()).toHaveValue('1990-01-01');
 await date().fill('1991-02-03');
 await page.getByRole('button',{name:'简',exact:true}).click();await expect(date()).toHaveValue('1991-02-03');
 assert.equal((await page.evaluate(k=>JSON.parse(sessionStorage.getItem(k)),draftKey)).expiresAt,original.expiresAt);
 await page.goBack();await expect(date()).toHaveValue('1991-02-03');
 await date().fill('');assert.equal(await page.evaluate(k=>sessionStorage.getItem(k),draftKey),null);
 await page.goForward();await expect(date()).toHaveValue('');
 await page.evaluate(k=>sessionStorage.setItem(k,JSON.stringify({birthDate:'1990-01-01',expiresAt:Date.now()-1})),draftKey);
 await page.getByRole('button',{name:'RU',exact:true}).click();
 await expect(page).toHaveURL(`${base}/?locale=ru#report`);
 await expect.poll(()=>page.evaluate(k=>sessionStorage.getItem(k),draftKey)).toBe(null);
 await expect(date()).toHaveValue('');
 assert.ok(!requests.some(url=>url.includes('1990-01-01')||url.includes('1991-02-03')));
 assert.equal(await page.evaluate(()=>localStorage.getItem('destinypixel-report-birthday-draft')),null);
 console.log('PASS: four locales, Back/Forward, edited birthday, fixed expiry, clearing, expired draft removal, no birthday in URLs/localStorage; no report submitted');
}finally{await browser.close();}
