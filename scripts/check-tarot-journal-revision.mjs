import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { openTarotSettings } from './tarot-browser-helpers.mjs';

const { chromium, expect } = createRequire(import.meta.url)('playwright/test');
const base = (process.argv[2] ?? 'http://127.0.0.1:3047').replace(/\/$/, '');
const output = process.env.QA_EVIDENCE_DIR ?? '/tmp/tarot-journal-20261028/browser';
const slug = 'how-to-keep-tarot-journal';
const revision = '2026-10-28';
const editions = Object.fromEntries(['en', 'zh'].map(locale => [locale, JSON.parse(readFileSync(`content/tarot-methods/${locale}.json`, 'utf8'))[slug]]));
const suffix = locale => locale === 'en' ? '' : '?locale=zh';
const tags = { en: 'en', zh: 'zh-Hans' };
const report = { base, revision, responsive: [], links: [], tool: [], pageErrors: [] };
mkdirSync(output, { recursive: true });
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
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', `https://www.destinypixel.com/journal/${slug}`);
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute('content', /noindex/);
  await expect(page.locator(`article header time[datetime="${revision}"]`)).toHaveText(revision);
  const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll(elements => elements.flatMap(element => JSON.parse(element.textContent)));
  const article = schemas.find(item => item['@type'] === 'Article' && item.inLanguage === tags[locale]);
  assert.ok(article, `${locale}: Article schema missing`);
  assert.equal(article.datePublished, '2026-10-23');
  assert.equal(article.dateModified, revision);
}

try {
  for (const locale of ['en', 'zh']) {
    for (const [width, height] of [[320, 568], [390, 844], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      assert.equal((await page.goto(`${base}/journal/${slug}${suffix(locale)}`)).status(), 200);
      await metadata(locale);
      for (const section of editions[locale].sections) {
        const element = page.locator(`article section#${section.id}`);
        await expect(element).toHaveCount(1);
        if (section.table) {
          await expect(element.locator('thead th')).toHaveText(section.table.headings);
          await expect(element.locator('tbody tr')).toHaveCount(section.table.rows.length);
          for (const [index, row] of section.table.rows.entries()) await expect(element.locator('tbody tr').nth(index).locator('th,td')).toHaveText(row);
          await expect(element.locator('[role="region"]')).toHaveAttribute('tabindex', '0');
        }
        for (const source of section.sources ?? []) await expect(element.locator(`a[href="${source.href}"]`)).toHaveCount(1);
      }
      const images = await page.locator('article img').all();
      for (const image of images) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
      }
      for (const id of ['source-to-claim', 'review-gaps']) {
        await page.locator(`a[href="#${id}"]`).click();
        await expect(page.locator(`#${id}`)).toBeInViewport();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${locale}/${width}/${id}: document overflow`);
        if (width === 390) {
          const table = page.locator(`#${id} table`);
          if (await table.count()) await table.scrollIntoViewIfNeeded();
          await page.screenshot({ path: `${output}/${locale}-390-${id}.png` });
        }
      }
      if (width === 1440) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: `${output}/${locale}-1440-article.png` });
      }
      report.responsive.push({ locale, width, height, metadata: true, sections: editions[locale].sections.length, tables: editions[locale].sections.filter(section => section.table).length, images: images.length, newAnchors: true, horizontalOverflow: false });
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
  await page.locator('header a[hreflang="en"]').click();
  await metadata('en');
  report.languageAndHistory = true;

  for (const [locale, width, height] of [['en', 1440, 900], ['zh', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto(`${base}/journal/${slug}${suffix(locale)}`);
    await page.locator(`article a[href="/tarot${suffix(locale)}"]`).first().click();
    await expect(page.locator('#table')).toHaveAttribute('aria-busy', 'false');
    await openTarotSettings(page);
    await page.locator('.tarot-controls [role="tab"]').last().click();
    await expect(page.locator('.tarot-controls [role="tab"]').last()).toHaveAttribute('aria-selected', 'true');
    await page.locator('.tarot-check input').uncheck();
    await expect(page.locator('.tarot-check input')).not.toBeChecked();
    await page.locator('.tarot-bottom-deck .cel-button').click();
    const top = page.locator('.tarot-deck-top');
    await expect(top).toBeEnabled();
    await top.click();
    const card = page.locator('.tarot-free-card');
    await expect(card).toHaveCount(1);
    const cardId = await card.getAttribute('data-card-id');
    await card.press('Enter');
    await expect(card.locator('.is-revealed')).toHaveCount(1);
    await card.press('Enter');
    await expect(page.locator('dialog[open]')).toHaveCount(1);
    const title = page.locator('dialog[open] .tarot-dialog-head h2');
    await expect(title).not.toHaveText('');
    const name = await title.innerText();
    const orientation = locale === 'en' ? 'Upright' : '正位';
    await expect(page.locator('dialog[open] .tarot-orientation')).toHaveText(orientation);
    const meaning = page.locator('dialog[open] .tarot-dialog-meaning p');
    await expect(meaning).toBeVisible();
    await expect(meaning).not.toHaveText('');
    await expect.poll(() => page.locator('dialog[open] .tarot-dialog-head img').evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
    await expect(page.locator('dialog[open] .tarot-dialog-head img')).not.toHaveAttribute('style', /rotate/);
    await expect(page.locator('dialog[open] .tarot-learning-link')).toHaveAttribute('href', `/journal/tarot-${cardId}${suffix(locale)}`);
    await page.screenshot({ path: `${output}/${locale}-${width}-free-card.png` });
    report.tool.push({ locale, width, height, fromArticle: true, mode: 'free', reversalsDisabledBeforeShuffle: true, cardId, name, orientation, meaningVisible: true, cardLibraryLink: true });
    await page.locator('.tarot-dialog-close').click();
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${locale}/${width}/tool: document overflow`);
  }
  assert.deepEqual(report.pageErrors, []);
  report.status = 'passed';
  console.log('PASS: 6 article viewport states, EN/ZH metadata/date/language/history/topic/links, 2 article-to-free-table draw/reveal/meaning flows.');
} catch (error) {
  report.status = 'failed';
  report.error = error.stack;
  throw error;
} finally {
  await browser.close();
  writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
}
