const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const base = process.env.BASE_URL || 'http://127.0.0.1:3002';
assert.ok(['127.0.0.1', 'localhost', 'www.destinypixel.com'].includes(new URL(base).hostname));
const output = process.env.OUTPUT_DIR || '/tmp/day-pillar-lightbox-local';
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox'],
  });
  const results = [];
  const errors = [];
  try {
    for (const [view, viewport, mobile] of [
      ['desktop', { width: 1440, height: 1000 }, false],
      ['mobile', { width: 390, height: 844 }, true],
      ['landscape', { width: 844, height: 390 }, true],
    ]) {
      const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(String(error)));
      for (const pillar of ['ding-you', 'jia-zi', 'gui-hai']) {
        for (const locale of ['zh', 'en']) {
          const route = `/journal/${pillar}-day-pillar${locale === 'en' ? '' : '?locale=zh'}`;
          const response = await page.goto(base + route, { waitUntil: 'networkidle' });
          assert.equal(response.status(), 200, route);
          const trigger = page.locator('[data-pillar-image-trigger]');
          const modal = page.locator('dialog[open]');
          await trigger.scrollIntoViewIfNeeded();
          assert.match(await trigger.getAttribute('aria-label'), locale === 'zh' ? /点击放大卡图/ : /Enlarge card/);
          const before = await page.evaluate(() => ({ y: scrollY, body: document.body.style.overflow, root: document.documentElement.style.overflow }));
          if (mobile) await trigger.tap();
          else { await trigger.focus(); await page.keyboard.press('Enter'); }
          await modal.waitFor({ state: 'visible' });
          const image = modal.locator('img');
          await image.evaluate(image => image.decode());
          const dimensions = await image.evaluate(image => {
            const r = image.getBoundingClientRect();
            return { naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, width: r.width, height: r.height, top: r.top, bottom: r.bottom, left: r.left, right: r.right, src: image.currentSrc };
          });
          assert.equal(dimensions.naturalWidth, 1200);
          assert.equal(dimensions.naturalHeight, 1600);
          assert.ok(dimensions.src.includes(`/archetypes/${pillar.replace('-', '_')}.jpg?v=20260914-new`));
          assert.ok(!dimensions.src.includes('_next/image'), 'Full image uses original JPEG');
          assert.ok(Math.abs(dimensions.width / dimensions.height - 0.75) < 0.01, 'Image keeps complete original ratio');
          assert.ok(dimensions.top >= 0 && dimensions.bottom <= viewport.height + 1 && dimensions.left >= 0 && dimensions.right <= viewport.width + 1, 'Image fits viewport');
          const close = modal.getByRole('button', { name: locale === 'zh' ? '关闭放大卡图' : 'Close enlarged card', exact: true });
          const closeBox = await close.boundingBox();
          assert.ok(closeBox.width >= 44 && closeBox.height >= 44 && closeBox.y >= 0 && closeBox.y + closeBox.height <= viewport.height, 'Close target stays visible');
          assert.equal(await close.evaluate(button => button === document.activeElement), true, 'Focus enters close button');
          await page.evaluate(() => document.querySelector('h1').closest('main').querySelector('a').focus());
          assert.equal(await close.evaluate(button => button === document.activeElement), true, 'Background is inert');
          assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
          if (!mobile) {
            await page.keyboard.press('Tab');
            await page.keyboard.press('Shift+Tab');
            assert.equal(await modal.evaluate(dialog => dialog.contains(document.activeElement)), true, 'Keyboard returns within modal');
          }
          if (pillar === 'ding-you' && locale === 'zh') await page.screenshot({ path: path.join(output, `${view}-ding-you-zh.png`) });
          await image.click();
          assert.equal(await modal.count(), 1, 'Artwork click keeps modal open');
          await page.keyboard.press('Escape');
          await page.locator('dialog[open]').waitFor({ state: 'hidden' });
          assert.equal(await trigger.evaluate(button => button === document.activeElement), true, 'Focus returns to thumbnail');
          assert.deepEqual(await page.evaluate(() => ({ y: scrollY, body: document.body.style.overflow, root: document.documentElement.style.overflow })), before, 'Scroll and styles restored after Escape');
          if (mobile) await trigger.tap(); else await trigger.click();
          await close.click();
          await page.locator('dialog[open]').waitFor({ state: 'hidden' });
          assert.equal(await trigger.evaluate(button => button === document.activeElement), true, 'Close button restores focus');
          if (mobile) await trigger.tap(); else await trigger.click();
          await modal.waitFor({ state: 'visible' });
          if (mobile) await page.touchscreen.tap(3, viewport.height / 2);
          else await page.mouse.click(3, viewport.height / 2);
          await page.locator('dialog[open]').waitFor({ state: 'hidden' });
          assert.equal(await trigger.evaluate(button => button === document.activeElement), true, 'Backdrop restores focus');
          assert.deepEqual(await page.evaluate(() => ({ y: scrollY, body: document.body.style.overflow, root: document.documentElement.style.overflow })), before);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No horizontal page overflow');
          results.push({ view, route, dimensions, checks: 'open, original image, containment, close target, focus, inert background, scroll lock/restore, image click, Escape, close button, backdrop' });
          console.log(`PASS ${view} ${route}`);
        }
      }
      await context.close();
    }
    assert.deepEqual(errors, [], 'No browser page errors');
    const request = await browser.newContext();
    const library = await request.request.get(base + '/journal/day-pillars');
    assert.equal(library.status(), 200);
    const routes = [...new Set([...((await library.text()).matchAll(/href="(\/journal\/[a-z]+-[a-z]+-day-pillar)"/g))].map(match => match[1]))];
    assert.equal(routes.length, 60, 'All sixty article routes discovered from the public library');
    const coverage = [];
    for (let offset = 0; offset < routes.length; offset += 4) {
      await Promise.all(routes.slice(offset, offset + 4).map(async route => {
        for (const suffix of ['', '?locale=zh']) {
          const response = await request.request.get(base + route + suffix);
          assert.equal(response.status(), 200, route + suffix);
          assert.match(await response.text(), /<button[^>]*data-pillar-image-trigger/, route + suffix);
          coverage.push(route + suffix);
        }
      }));
    }
    await request.close();
    console.log(`PASS all ${coverage.length} English/Chinese article responses contain the image trigger`);
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ base, browser: browser.version(), results, coverage: coverage.sort(), errors }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
