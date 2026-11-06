import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Markdown from 'react-markdown';
import { openTarotSettings } from './tarot-browser-helpers.mjs';

const { chromium, expect } = createRequire(import.meta.url)('playwright/test');
const base = (process.argv[2] ?? 'http://127.0.0.1:3058').replace(/\/$/, '');
const output = process.argv[3] ?? process.env.QA_EVIDENCE_DIR ?? '/tmp/two-swords-20261106/browser';
mkdirSync(output, { recursive: true });
const slug = 'tarot-two-of-swords';
const locales = ['en', 'zh'];
const tags = { en: 'en', zh: 'zh-Hans', 'zh-TW': 'zh-Hant', ru: 'ru' };
// The shared document-locale policy uses region tags on <html>, while this
// article's server-localized main and language alternates use script tags.
const documentTags = { en: 'en', zh: 'zh-CN' };
const suffix = locale => locale === 'en' ? '' : `?locale=${locale}`;
const editions = Object.fromEntries(locales.map(locale => [locale, JSON.parse(readFileSync(`content/tarot/${locale}/two-of-swords.json`, 'utf8'))]));
const normalized = value => value.replace(/\s+/g, '');
const plain = html => html.replace(/<[^>]*>/g, '').replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('&apos;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
const markdownText = markdown => plain(renderToStaticMarkup(React.createElement(Markdown, { skipHtml: true }, markdown)));
const report = { base, responsive: [], links: [], tool: [], pageErrors: [], blockedNonGet: 0 };
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium', args: ['--no-sandbox'] });
report.browser = browser.version();
const context = await browser.newContext({ reducedMotion: 'reduce' });
await context.route('**/*', route => {
  const request = route.request();
  if (request.method() !== 'GET') { report.blockedNonGet += 1; return route.abort(); }
  return new URL(request.url()).origin === new URL(base).origin ? route.continue() : route.abort();
});
context.on('page', page => page.on('pageerror', error => report.pageErrors.push(error.message)));
const page = await context.newPage();
async function metadata(locale) {
  const article = editions[locale];
  await expect(page.locator('h1')).toHaveText(article.title);
  await expect(page).toHaveTitle(`${article.title} | DestinyPixel`);
  await expect(page.locator('main')).toHaveAttribute('lang', tags[locale]);
  await expect(page.locator('html')).toHaveAttribute('lang', documentTags[locale]);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', article.hook);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.destinypixel.com/journal/${slug}${suffix(locale)}`);
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
  for (const other of ['en', 'zh', 'zh-TW', 'ru']) await expect(page.locator(`link[rel="alternate"][hreflang="${tags[other]}"]`)).toHaveAttribute('href', `https://www.destinypixel.com/journal/${slug}${suffix(other)}`);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', `https://www.destinypixel.com/journal/${slug}`);
  await expect(page.locator('article time[datetime="2026-10-07"]')).toHaveCount(1);
  await expect(page.locator('article time[datetime="2026-11-06"]')).toHaveCount(1);
  await expect(page.locator('[data-editorial-update]')).toHaveCount(1);
}
try {
  for (const locale of locales) {
    const article = editions[locale];
    assert.equal(article.sections.length, 12, `${locale}: revised source has twelve sections`);
    for (const [width, height] of [[320, 568], [390, 844], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      assert.equal((await page.goto(`${base}/journal/${slug}${suffix(locale)}`)).status(), 200);
      await metadata(locale);
      assert.deepEqual(await page.locator('[data-learning-section]').evaluateAll(elements => elements.map(element => element.id)), article.sections.map(section => section.id));
      const articleText = normalized(await page.locator('article').innerText());
      for (const value of [article.hook, ...Object.values(article.quickTake), ...(article.openingParagraphs ?? [])]) assert.ok(articleText.includes(normalized(value)), `${locale}/${width}: complete opening`);
      for (const section of article.sections) {
        const node = page.locator(`[data-learning-section="${section.id}"]`);
        const expected = normalized(section.title + markdownText(section.bodyMarkdown));
        assert.equal(normalized(await node.innerText()), expected, `${locale}/${width}/${section.id}: complete browser body`);
        await expect(page.locator(`article a[href="#${section.id}"]`)).toHaveCount(1);
      }
      for (const image of await page.locator('article img').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
      }
      await page.locator('article a[href="#armed-truce"]').click();
      await expect(page.locator('#armed-truce h2')).toBeInViewport();
      const layout = await page.evaluate(() => {
        const article = document.querySelector('article');
        return { document: document.documentElement.scrollWidth, viewport: innerWidth, article: article.scrollWidth, articleClient: article.clientWidth, headingTop: document.querySelector('#armed-truce h2').getBoundingClientRect().top };
      });
      assert.ok(layout.document <= layout.viewport + 1, `${locale}/${width}: document overflow`);
      assert.ok(layout.article <= layout.articleClient + 1, `${locale}/${width}: article overflow`);
      if ((locale === 'en' && width === 1440) || (locale === 'zh' && width === 390)) {
        await page.screenshot({ path: `${output}/${locale}-${width}-armed-truce.png` });
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: `${output}/${locale}-${width}-article.png`, fullPage: true });
      }
      report.responsive.push({ locale, width, height, completeSections: 12, completeOpening: true, metadata: true, imagesLoaded: true, toc: true, layout });
    }
    const internal = [...new Set(await page.locator('article a[href^="/"]').evaluateAll(elements => elements.map(element => element.getAttribute('href'))))];
    for (const link of internal) {
      const response = await context.request.get(base + link);
      assert.equal(response.status(), 200, link);
      report.links.push({ href: link, status: 200 });
    }
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
    const toolHref = `/tarot${suffix(locale)}`;
    const cta = page.locator(`#armed-truce a[href="${toolHref}"]`);
    await expect(cta).toHaveCount(1);
    await cta.focus();
    await expect(cta).toBeFocused();
    await page.keyboard.press('Enter');
    await page.waitForURL(new URL(toolHref, base).href);
    await expect(page.locator('#table')).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('html')).toHaveAttribute('lang', documentTags[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.destinypixel.com${toolHref}`);
    const tool = { locale, width, height, keyboardInlineCta: true, matchingLanguage: true };
    // This is one ordinary random free-table draw. It does not promise or force
    // Two of Swords, and every non-GET request remains blocked by the context.
    await openTarotSettings(page);
    await page.locator('.tarot-controls [role="tab"]').last().click();
    await page.locator('.tarot-check input').uncheck();
    await page.locator('.tarot-bottom-deck .cel-button').click();
    const top = page.locator('.tarot-deck-top');
    await expect(top).toBeEnabled();
    await top.press('Enter');
    const placed = page.locator('.tarot-free-card');
    await expect(placed).toHaveCount(1);
    await placed.press('Enter');
    await placed.press('Enter');
    await expect(page.locator('dialog[open] .tarot-orientation')).toHaveText(locale === 'en' ? 'Upright' : '正位');
    await expect(page.locator('dialog[open] .tarot-dialog-meaning p')).not.toBeEmpty();
    await expect.poll(() => page.locator('dialog[open] .tarot-dialog-head img').evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
    tool.freeDraw = { cardId: await placed.getAttribute('data-card-id'), reversalsDisabled: true, revealed: true, meaningOpened: true };
    await page.screenshot({ path: `${output}/${locale}-${width}-tool-meaning.png` });
    await page.locator('.tarot-dialog-close').click();
    report.tool.push(tool);
  }
  assert.deepEqual(report.pageErrors, []);
  report.status = 'passed';
  console.log('PASS: EN/ZH six actual Chromium viewports, complete browser bodies, sources/TOC/metadata, language history, keyboard article-to-tool entries and two ordinary free draws.');
} catch (error) {
  report.status = 'failed';
  report.error = error.stack;
  throw error;
} finally {
  await browser.close();
  writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2) + '\n');
}
