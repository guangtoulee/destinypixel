import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const {chromium, expect} = createRequire(import.meta.url)('playwright/test');
const base = new URL(process.argv[2] ?? 'http://127.0.0.1:3042');
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(base.hostname));
const out = resolve(process.env.QA_EVIDENCE_DIR ?? 'docs/qa/tarot-tactile-20261008');
mkdirSync(out, {recursive:true});
const report = {base:base.origin, scope:'Local review only; no public deployment', cases:[], screenshots:[], errors:[]};
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH ?? '/usr/bin/chromium', args:['--no-sandbox']});
try {
  for (const locale of ['zh', 'zh-TW', 'en', 'ru']) {
    for (const [width,height] of [[360,800], [390,844], [430,932], [1440,1000]]) {
      const reducedMotion = width === 390 ? 'no-preference' : 'reduce';
      const context = await browser.newContext({viewport:{width,height}, hasTouch:width < 740, reducedMotion});
      await context.route('**/*', route => new URL(route.request().url()).origin === base.origin && route.request().method() === 'GET' ? route.continue() : route.abort());
      const page = await context.newPage();
      page.on('pageerror', e => report.errors.push(e.message));
      let accept = false;
      page.on('dialog', dialog => accept ? dialog.accept() : dialog.dismiss());
      const suffix = locale === 'en' ? '' : `?locale=${locale}`;
      async function fit(label) {
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${locale}/${width}/${label}: overflow`);
      }
      async function shot(name) {
        const file = `${locale}-${width}-${name}.png`;
        await page.screenshot({path:resolve(out,file)});
        report.screenshots.push(file);
      }
      await page.goto(new URL(`/tarot${suffix}`,base).href);
      await expect(page.locator('#table')).toHaveAttribute('aria-busy','false');
      await fit('initial');
      const shuffle = page.locator('.tarot-bottom-deck .cel-button');
      const draw = page.locator('.tarot-draw-action');
      const top = page.locator('.tarot-deck-top');
      const slots = page.locator('[data-drop-slot]');
      const flipped = page.locator('#tarot-board .is-revealed');
      for (const control of [shuffle, draw, page.locator('.tarot-select select')]) {
        assert.ok((await control.boundingBox()).height >= 44, 'primary target below 44px');
      }
      await expect(draw).toBeDisabled();
      if (locale === 'zh' || (locale === 'ru' && width === 360)) await shot('table');
      // The explicit action is keyboard and touch operable without hover or a drag.
      if (width < 740) await shuffle.tap(); else await shuffle.press('Enter');
      await expect(draw).toBeEnabled();
      await shuffle.focus();
      await page.keyboard.press('Tab');
      await expect(draw).toBeFocused();
      assert.ok(await draw.evaluate(e => e.matches(':focus-visible')));
      await draw.press('Enter');
      await expect(page.locator('#tarot-board .tarot-flipper')).toHaveCount(1);
      await draw.press('Enter'); await draw.press('Enter');
      await expect(page.locator('#tarot-board .tarot-flipper')).toHaveCount(3);
      await expect(page.locator('.tarot-deck-label span')).toContainText('75');
      for (let i=0;i<3;i++) await slots.nth(i).press('Enter');
      await expect(flipped).toHaveCount(3);
      const faces = await page.locator('#tarot-board img').evaluateAll(es => es.map(e => e.getAttribute('src')));
      assert.equal(new Set(faces).size,3);
      for (const face of await page.locator('#tarot-board img').all()) {
        await expect.poll(() => face.evaluate(e => e.complete && e.naturalWidth > 0)).toBe(true);
        await expect(face).toHaveCSS('object-fit','contain');
      }
      if (reducedMotion === 'reduce') await expect(page.locator('.tarot-flipper').first()).toHaveCSS('transition-duration','0s');
      await shuffle.press('Enter'); await expect(top).toBeEnabled();
      assert.deepEqual(await page.locator('#tarot-board img').evaluateAll(es => es.map(e => e.getAttribute('src'))),faces,'reshuffle changed results');
      await expect(page.locator('.tarot-deck-label span')).toContainText('75');
      await page.locator('#tarot-board').scrollIntoViewIfNeeded();
      if (locale === 'zh' || (locale === 'ru' && width === 360)) await shot('revealed');
      await slots.first().press('Enter');
      await expect(page.locator('dialog[open]')).toHaveCount(1);
      await fit('dialog');
      assert.ok((await page.locator('.tarot-dialog-close').boundingBox()).height >= 44);
      if (locale === 'zh' && width === 390) await shot('meaning');
      const articleLink = page.locator('.tarot-learning-link');
      const articleHref = await articleLink.getAttribute('href');
      assert.equal(new URL(articleHref,base).searchParams.get('locale'),locale === 'en' ? null : locale);
      const opened = context.waitForEvent('page');
      await articleLink.press('Enter');
      const article = await opened;
      await article.waitForLoadState('domcontentloaded');
      await expect(article.locator('article[data-tarot-learning]')).toHaveCount(1);
      await article.close();
      await page.goBack();
      await expect(page.locator('dialog[open]')).toHaveCount(0);
      await expect(flipped).toHaveCount(3);
      // Cancellation and confirmation both leave consistent deck/result state.
      await page.locator('.tarot-settings>.cel-button-text').click();
      await expect(flipped).toHaveCount(3);
      accept = true;
      await page.locator('.tarot-settings>.cel-button-text').click();
      await expect(page.locator('#tarot-board .tarot-flipper')).toHaveCount(0);
      await expect(draw).toBeDisabled();
      await expect(page.locator('.tarot-deck-label span')).toContainText('78');
      await page.locator('[data-tarot-navigation] a').nth(1).click();
      await page.waitForURL(u => u.pathname === '/journal/tarot-cards');
      await fit('atlas');
      await expect(page.locator('[data-tarot-navigation] a[aria-current=page]')).toHaveAttribute('href',`/journal/tarot-cards${suffix}`);
      if (locale === 'zh' && [390,1440].includes(width)) await shot('atlas');
      await page.locator(`a[href="/journal/tarot-fool${suffix}"]`).first().click();
      await page.waitForURL(u => u.pathname === '/journal/tarot-fool');
      await fit('article');
      if (locale === 'zh' && [390,1440].includes(width)) await shot('article');
      await page.goBack(); await page.waitForURL(u => u.pathname === '/journal/tarot-cards');
      await page.goForward(); await page.waitForURL(u => u.pathname === '/journal/tarot-fool');
      await page.locator('[data-tarot-navigation] a').last().click();
      await page.waitForURL(u => u.pathname === '/journal/how-to-connect-three-tarot-cards');
      await expect(page.locator('h1')).toBeVisible();
      assert.equal(new URL(page.url()).searchParams.get('locale'),locale === 'en' ? null : locale);
      report.cases.push({locale,width,height,reducedMotion,keyboard:true,touch:width<740,uniqueCards:true,reshufflePreserved:true,reset:true,dialogArticle:true,history:true,navigation:true});
      console.log(`PASS ${locale}/${width}: responsive, 44px actions, keyboard/touch, three unique cards, reshuffle/reset, meaning/article, atlas/guide, Back/Forward`);
      await context.close();
    }
  }
  assert.deepEqual(report.errors,[]);
  report.status='passed';
} catch (error) {report.status='failed'; report.failure=error.stack; throw error;}
finally {report.finishedAt=new Date().toISOString(); writeFileSync(resolve(out,'interaction-report.json'),JSON.stringify(report,null,2)+'\n'); await browser.close();}
