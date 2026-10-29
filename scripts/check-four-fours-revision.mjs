import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Markdown from 'react-markdown';

const { chromium, expect } = createRequire(import.meta.url)('playwright/test');
const base = (process.argv[2] ?? 'http://127.0.0.1:3049').replace(/\/$/, '');
const output = process.env.QA_EVIDENCE_DIR ?? '/tmp/four-fours-20261029/browser';
mkdirSync(output, { recursive: true });
const slug = 'why-the-four-fours-differ';
const locales = ['en', 'zh', 'zh-TW', 'ru'];
const tags = { en: 'en', zh: 'zh-Hans', 'zh-TW': 'zh-Hant', ru: 'ru' };
const suffix = locale => locale === 'en' ? '' : `?locale=${locale}`;
const path = locale => `/journal/${slug}${suffix(locale)}`;
const canonical = locale => `https://www.destinypixel.com${path(locale)}`;
const modified = locale => ['en', 'zh'].includes(locale) ? '2026-10-29' : '2026-10-08';
const normalize = text => text.replace(/\s+/g, ' ').trim();
const read = file => JSON.parse(readFileSync(file, 'utf8'));
const editions = Object.fromEntries(locales.map(locale => {
  const original = read(`content/tarot-editorial/${locale}.json`)[slug];
  const additions = ['en', 'zh'].includes(locale) ? read(`content/four-fours-update-20261029/${locale}.json`).sections : [];
  return [locale, { ...original, sections: [...original.sections, ...additions] }];
}));
const report = { base, responsive: [], links: [], tool: [], history: [], pageErrors: [], blockedMethods: [], blockedThirdPartyRequests: 0 };
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium', args: ['--no-sandbox'] });
report.browser = browser.version();
const context = await browser.newContext({ reducedMotion: 'reduce' });
await context.route('**/*', route => {
  const request = route.request();
  if (request.method() !== 'GET') {
    report.blockedMethods.push({ method: request.method(), pathname: new URL(request.url()).pathname });
    return route.abort();
  }
  if (new URL(request.url()).origin !== new URL(base).origin) {
    report.blockedThirdPartyRequests++;
    return route.abort();
  }
  return route.continue();
});
context.on('page', page => page.on('pageerror', error => report.pageErrors.push(error.message)));
const page = await context.newPage();

async function metadata(locale) {
  const copy = editions[locale];
  await expect(page.locator('h1')).toHaveText(copy.title);
  await expect(page).toHaveTitle(`${copy.title} | DestinyPixel`);
  await expect(page.locator('main')).toHaveAttribute('lang', tags[locale]);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', copy.opening[0]);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical(locale));
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
  for (const other of locales) await expect(page.locator(`link[rel="alternate"][hreflang="${tags[other]}"]`)).toHaveAttribute('href', canonical(other));
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', canonical('en'));
  const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll(elements => elements.flatMap(element => JSON.parse(element.textContent)));
  const article = schemas.find(schema => schema['@type'] === 'Article' && schema.inLanguage === tags[locale]);
  assert.ok(article, `${locale}: Article schema`);
  assert.equal(article.datePublished, '2026-10-08');
  assert.equal(article.dateModified, modified(locale));
  await expect(page.locator('article header time[datetime="2026-10-08"]').first()).toHaveText('2026-10-08');
  if (['en', 'zh'].includes(locale)) {
    await expect(page.locator('article header time[datetime="2026-10-29"]')).toHaveText('2026-10-29');
    await expect(page.locator('[data-editorial-update]')).toHaveCount(1);
  } else {
    await expect(page.locator('article header time')).toHaveCount(1);
    await expect(page.locator('[data-editorial-update]')).toHaveCount(0);
  }
}

async function expectedMarkdownText(markdown) {
  const html = renderToStaticMarkup(createElement(Markdown, { skipHtml: true }, markdown));
  return page.evaluate(value => new DOMParser().parseFromString(value, 'text/html').body.textContent.replace(/\s+/g, ' ').trim(), html);
}

async function content(locale, serverHtml) {
  const copy = editions[locale];
  const articleText = normalize(await page.locator('article').innerText());
  for (const paragraph of copy.opening) assert.ok(articleText.includes(normalize(paragraph)), `${locale}: missing opening paragraph`);
  const sections = page.locator('article section[id]');
  assert.deepEqual(await sections.evaluateAll(elements => elements.map(element => element.id)), copy.sections.map(section => section.id));
  for (const section of copy.sections) {
    const container = page.locator(`article section#${section.id}`);
    await expect(container.locator('h2')).toHaveText(section.title);
    const expected = await expectedMarkdownText(section.bodyMarkdown);
    assert.equal(normalize(await container.locator('[data-editorial-section]').textContent()), expected, `${locale}/${section.id}: complete Markdown body`);
    const serverText = await page.evaluate(({ html, id }) => new DOMParser().parseFromString(html, 'text/html').querySelector(`#${id} [data-editorial-section]`)?.textContent ?? null, { html: serverHtml, id: section.id });
    assert.ok(serverText !== null, `${locale}/${section.id}: server body missing`);
    assert.equal(normalize(serverText), expected, `${locale}/${section.id}: complete server-rendered Markdown body`);
    for (const source of section.sources) await expect(container.locator(`a[href="${source.href}"]`)).toHaveCount(1);
    if (section.table) {
      assert.deepEqual((await container.locator('thead th').allTextContents()).map(normalize), section.table.headings);
      assert.equal(await container.locator('tbody tr').count(), 4);
      for (const [index, row] of section.table.rows.entries()) assert.deepEqual((await container.locator('tbody tr').nth(index).locator('th, td').allTextContents()).map(normalize), row);
    }
  }
}

async function noOverflow(label) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${label}: horizontal document overflow`);
}

try {
  const sitemapResponse = await context.request.get(`${base}/sitemap.xml`);
  assert.equal(sitemapResponse.status(), 200);
  const sitemap = await sitemapResponse.text();
  for (const locale of locales) {
    const entries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(match => match[1].replace(/&amp;/g, '&'));
    const entry = entries.find(value => value.includes(`<loc>${canonical(locale)}</loc>`));
    assert.ok(entry?.includes(`<lastmod>${modified(locale)}`), `${locale}: sitemap date`);
    for (const [width, height] of [[320, 568], [390, 844], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      const response = await page.goto(base + path(locale));
      assert.equal(response.status(), 200);
      await metadata(locale);
      await content(locale, await response.text());
      const images = await page.locator('article img').all();
      assert.equal(images.length, 4);
      for (const image of images) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
      }
      for (const section of editions[locale].sections) {
        const link = page.locator(`a[href="#${section.id}"]`);
        await link.click();
        await expect(page.locator(`section#${section.id}`)).toBeInViewport();
        await noOverflow(`${locale}/${width}/${section.id}`);
      }
      if (['en', 'zh'].includes(locale)) {
        const tableRegion = page.locator('#fours-reversed-entries [role="region"]');
        await tableRegion.focus();
        await expect(tableRegion).toBeFocused();
        await tableRegion.evaluate(element => { element.scrollLeft = 0; });
        const scroll = await tableRegion.evaluate(element => ({ width: element.clientWidth, content: element.scrollWidth }));
        if (scroll.content > scroll.width) {
          await page.keyboard.press('End');
          await tableRegion.evaluate(element => { element.scrollLeft = element.scrollWidth; });
          assert.ok(await tableRegion.evaluate(element => element.scrollLeft > 0), `${locale}/${width}: table scrolling`);
        }
        if (width === 390 || width === 1440) {
          await tableRegion.evaluate(element => { element.scrollLeft = 0; });
          await tableRegion.scrollIntoViewIfNeeded();
          await page.screenshot({ path: `${output}/${locale}-${width}-reversed-entries.png` });
          if (scroll.content > scroll.width) {
            await tableRegion.evaluate(element => { element.scrollLeft = element.scrollWidth; });
            await page.screenshot({ path: `${output}/${locale}-${width}-reversed-entries-right.png` });
          }
          await page.locator('#fours-reversal-practice').scrollIntoViewIfNeeded();
          await page.screenshot({ path: `${output}/${locale}-${width}-practice.png` });
        }
      }
      await noOverflow(`${locale}/${width}/final`);
      report.responsive.push({ locale, width, height, status: 200, metadata: true, originalPublication: '2026-10-08', modified: modified(locale), completeOriginalSections: 5, completeNewSections: ['en', 'zh'].includes(locale) ? 2 : 0, fullServerContent: true, tableRows: ['en', 'zh'].includes(locale) ? 4 : 0, toc: true, imagesLoaded: images.length, horizontalOverflow: false });
      console.log(`PASS ${locale}/${width}: complete server/client content, metadata/dates, images, TOC and layout`);
    }
    const internal = [...new Set(await page.locator('article a[href^="/"]').evaluateAll(elements => elements.map(element => element.getAttribute('href'))))];
    for (const href of internal) {
      const target = new URL(href, base);
      assert.equal(target.origin, new URL(base).origin);
      const response = await context.request.get(target.href);
      assert.equal(response.status(), 200, `${locale}: internal GET ${href}`);
      report.links.push({ locale, href, status: response.status() });
    }
  }

  await page.goto(base + path('en'));
  for (const locale of ['zh', 'zh-TW', 'ru']) {
    await page.locator(`header a[hreflang="${tags[locale]}"]`).click();
    await metadata(locale);
    report.history.push({ action: 'language-link', locale });
  }
  for (const locale of ['zh-TW', 'zh', 'en']) {
    await page.goBack();
    await metadata(locale);
    report.history.push({ action: 'back', locale });
  }
  await page.goForward();
  await metadata('zh');
  report.history.push({ action: 'forward', locale: 'zh' });

  for (const [locale, width, height] of [['en', 1440, 900], ['zh', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto(base + path(locale));
    await page.locator(`article a[href="/tarot${suffix(locale)}"]`).last().click();
    await expect(page.locator('#table')).toHaveAttribute('aria-busy', 'false');
    const disclosure = page.locator('.tarot-settings-disclosure');
    if (await disclosure.getAttribute('open') === null) await disclosure.locator(':scope > summary').click();
    await page.locator('.tarot-controls [role="tab"]').last().click();
    await expect(page.locator('.is-free-workbench')).toHaveCount(1);
    await page.locator('.tarot-check input').uncheck();
    await expect(page.locator('.tarot-check input')).not.toBeChecked();
    await page.locator('.tarot-bottom-deck .cel-button').click();
    await expect(page.locator('.tarot-deck-top')).toBeEnabled();
    await page.locator('.tarot-deck-top').click();
    const placed = page.locator('.tarot-free-card');
    await expect(placed).toHaveCount(1);
    await placed.press('Enter');
    await placed.press('Enter');
    await expect(page.locator('dialog[open] .tarot-orientation')).toHaveText(locale === 'en' ? 'Upright' : '正位');
    const id = await placed.getAttribute('data-card-id');
    assert.ok(id);
    await expect.poll(() => page.locator('dialog[open] .tarot-dialog-head img').evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
    const learning = page.locator('dialog[open] .tarot-learning-link');
    await expect(learning).toHaveAttribute('href', `/journal/tarot-${id}${suffix(locale)}`);
    await page.screenshot({ path: `${output}/${locale}-${width}-tool-meaning.png` });
    const newPage = context.waitForEvent('page');
    await learning.click();
    const cardArticle = await newPage;
    await cardArticle.waitForLoadState('domcontentloaded');
    await expect(cardArticle.locator('article')).toHaveAttribute('data-tarot-learning', id);
    await cardArticle.close();
    await expect(page.locator('dialog[open]')).toHaveCount(1);
    await page.locator('.tarot-dialog-close').click();
    report.tool.push({ locale, width, height, fromArticleCta: true, freeTable: true, reversalsDisabledBeforeShuffle: true, shuffled: true, drawnCard: id, revealed: true, meaning: true, displayedOrientation: 'upright', meaningToCardArticle: true });
    console.log(`PASS ${locale}/${width}: article CTA → Free table → disable reversals → shuffle → draw → reveal → meaning → drawn card article`);
  }
  assert.deepEqual(report.pageErrors, []);
  report.status = 'passed';
  console.log(`PASS: 12 four-language viewport states, ${report.links.length} internal GETs, reciprocal language/history and 2 real article-to-tool flows.`);
} catch (error) {
  report.status = 'failed';
  report.error = error.stack;
  await page.screenshot({ path: `${output}/failure.png` }).catch(() => {});
  throw error;
} finally {
  await browser.close();
  writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2) + '\n');
}
