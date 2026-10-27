import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const { chromium, expect } = createRequire(import.meta.url)('playwright/test');
const base = (process.argv[2] ?? 'http://127.0.0.1:3047').replace(/\/$/, '');
const output = process.env.QA_EVIDENCE_DIR ?? '/tmp/celtic-cross-20261027/browser';
mkdirSync(output, { recursive: true });
const slug = 'how-to-read-celtic-cross';
const editions = Object.fromEntries(['en', 'zh'].map(locale => [locale, JSON.parse(readFileSync(`content/tarot-methods/${locale}.json`, 'utf8'))[slug]]));
const suffix = locale => locale === 'en' ? '' : '?locale=zh';
const tags = { en: 'en', zh: 'zh-Hans' };
const report = { base, responsive: [], links: [], tool: [], pageErrors: [] };
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium', args: ['--no-sandbox'] });
report.browser = browser.version();
const context = await browser.newContext({ reducedMotion: 'reduce' });
await context.route('**/*', route => route.request().method() === 'GET' && new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
context.on('page', page => page.on('pageerror', error => report.pageErrors.push(error.message)));
const page = await context.newPage();
async function metadata(locale) {
  const copy = editions[locale];
  await expect(page.locator('h1')).toHaveText(copy.title);
  await expect(page).toHaveTitle(`${copy.title} | DestinyPixel`);
  await expect(page.locator('main')).toHaveAttribute('lang', tags[locale]);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', copy.description);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.destinypixel.com/journal/${slug}${suffix(locale)}`);
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(3);
  for (const other of ['en', 'zh']) await expect(page.locator(`link[rel="alternate"][hreflang="${tags[other]}"]`)).toHaveAttribute('href', `https://www.destinypixel.com/journal/${slug}${suffix(other)}`);
}
try {
  for (const locale of ['en', 'zh']) {
    for (const [width, height] of [[320, 568], [390, 844], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      assert.equal((await page.goto(`${base}/journal/${slug}${suffix(locale)}`)).status(), 200);
      await metadata(locale);
      for (const section of editions[locale].sections) await expect(page.locator(`article section#${section.id}`)).toHaveCount(1);
      for (const image of await page.locator('article img').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
      }
      for (const id of ['crossing-and-reversals', 'one-card-variation']) {
        await page.locator(`a[href="#${id}"]`).click();
        await expect(page.locator(`#${id}`)).toBeInViewport();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${locale}/${width}/${id}: document overflow`);
      }
      await expect(page.locator('#crossing-and-reversals tbody tr')).toHaveCount(2);
      await expect(page.locator('#crossing-and-reversals a[href^="https://sacred-texts.com/"]')).toHaveCount(3);
      if (width === 390) {
        await page.locator('#crossing-and-reversals table').scrollIntoViewIfNeeded();
        await page.screenshot({ path: `${output}/${locale}-390-variation.png` });
      } else if (width === 1440) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: `${output}/${locale}-1440-article.png` });
      }
      report.responsive.push({ locale, width, height, metadata: true, sections: editions[locale].sections.length, newAnchors: true, imagesLoaded: true, horizontalOverflow: false });
    }
    const internal = [...new Set(await page.locator('article a[href^="/"]').evaluateAll(elements => elements.map(element => element.getAttribute('href'))))];
    for (const href of internal) {
      const response = await context.request.get(base + href);
      assert.equal(response.status(), 200, href);
      report.links.push({ href, status: response.status() });
    }
    const topic = page.locator('[data-article-topics] a[href*="topic=tarot-reading"]');
    await topic.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator(`[data-topic-result="${slug}"]`)).toHaveCount(1);
    await page.goBack();
    await metadata(locale);
  }
  await page.goto(`${base}/journal/${slug}`);
  await page.locator('header a[hreflang="zh-Hans"]').click();
  await metadata('zh');
  await page.goBack();
  await metadata('en');
  await page.goForward();
  await metadata('zh');
  report.languageAndHistory = true;
  for (const [locale, width, height] of [['en', 1440, 900], ['zh', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto(`${base}/journal/${slug}${suffix(locale)}`);
    await page.locator(`article a[href="/tarot${suffix(locale)}"]`).first().click();
    await expect(page.locator('#table')).toHaveAttribute('aria-busy', 'false');
    const disclosure = page.locator('.tarot-settings-disclosure');
    if (await disclosure.getAttribute('open') === null) await disclosure.locator(':scope > summary').click();
    await page.locator('[role="tab"]').first().click();
    if (await disclosure.getAttribute('open') === null) await disclosure.locator(':scope > summary').click();
    await page.locator('.tarot-select select').selectOption('celtic');
    await page.locator('.tarot-check input').uncheck();
    await expect(page.locator('.tarot-slot-label')).toHaveCount(10);
    const labels = await page.locator('.tarot-slot-label').allTextContents();
    assert.deepEqual(labels.map(label => label.replace(/^\d+/, '').trim()), editions[locale].sections.find(section => section.id === 'practice-layout').table.rows.map(row => row[0].replace(/^\d+\s+/, '')));
    const crossing = page.locator('.tarot-slot-1 .tarot-slot-card');
    await crossing.click();
    await page.locator('.tarot-bottom-deck .cel-button').click();
    await expect(page.locator('.tarot-draw-action')).toBeEnabled();
    await page.locator('.tarot-draw-action').press('Enter');
    await expect(crossing.locator('.tarot-flipper')).toHaveCount(1);
    const transform = await crossing.evaluate(element => getComputedStyle(element).transform);
    if (width === 1440) assert.match(transform, /^matrix\(0, 0\.82, -0\.82, 0,/);
    else assert.equal(transform, 'none');
    await crossing.click();
    await crossing.click();
    await expect(page.locator('dialog[open] .tarot-orientation')).toHaveText(locale === 'en' ? 'Upright' : '正位');
    await expect.poll(() => page.locator('dialog[open] .tarot-dialog-head img').evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
    await expect(page.locator('dialog[open] .tarot-dialog-head img')).not.toHaveAttribute('style', /rotate/);
    await page.screenshot({ path: `${output}/${locale}-${width}-crossing-upright.png` });
    report.tool.push({ locale, width, height, fromArticle: true, tenLabelsMatch: true, reversalsDisabledBeforeShuffle: true, crossingTransform: transform, displayedOrientation: 'upright' });
    await page.locator('.tarot-dialog-close').click();
  }
  assert.deepEqual(report.pageErrors, []);
  report.status = 'passed';
  console.log('PASS: 6 article viewport states, EN/ZH language/history/topic/links, 2 article-to-Celtic flows, sideways upright crossing card.');
} catch (error) {
  report.status = 'failed';
  report.error = error.stack;
  throw error;
} finally {
  await browser.close();
  writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
}
