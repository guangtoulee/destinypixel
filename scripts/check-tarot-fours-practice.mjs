import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getJournalArticle, journalArticleSchema, journalHref } from '../lib/journal.ts';
import { openTarotSettings } from './tarot-browser-helpers.mjs';

const require = createRequire(import.meta.url);
const { chromium, expect } = require(process.env.PLAYWRIGHT_MODULE ?? '/opt/codex/cua_node/lib/node_modules/playwright/test');
const base = new URL(process.argv[2] ?? 'http://127.0.0.1:3062');
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname), 'This replay is limited to local acceptance');
const out = resolve(process.env.QA_EVIDENCE_DIR ?? 'docs/qa/tarot-fours-practice-20261112');
mkdirSync(out, { recursive: true });
const slug = 'why-the-four-fours-differ', sectionId = 'fours-compare-and-combine';
const article = getJournalArticle(slug);
assert.ok(article);
const plain = value => value.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\*\*|__/g, '').replace(/^\d+\. /gm, '').replace(/^[-#]+ /gm, '').replace(/\s+/g, '');
const tags = { en: 'en', zh: 'zh-Hans', 'zh-TW': 'zh-Hant', ru: 'ru' };
const suffix = locale => locale === 'en' ? '' : `?locale=${locale}`;
const report = { scope: 'Local production build', base: base.origin, html: [], views: [], links: [], flows: [], errors: [] };
const get = async path => {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  return response.text();
};
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  await context.route('**/*', route => {
    const request = route.request();
    return new URL(request.url()).origin === base.origin && request.method() === 'GET' ? route.continue() : route.abort();
  });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  const sitemap = await get('/sitemap.xml');
  const destinations = new Set();
  for (const locale of ['en', 'zh', 'zh-TW', 'ru']) {
    const copy = article.translations[locale], href = journalHref(locale, slug);
    const html = await get(href);
    const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(match => JSON.parse(match[1]));
    const schema = schemas.find(value => value['@type'] === 'Article');
    const expected = journalArticleSchema(article, locale)[0];
    for (const field of ['headline', 'inLanguage', 'datePublished', 'dateModified', 'citation']) assert.deepEqual(schema[field], expected[field], `${locale}/${field}`);
    for (const section of copy.sections) assert.ok(html.includes(`id="${section.id}"`));
    const escaped = `https://www.destinypixel.com${href}`.replaceAll('&', '&amp;');
    const entry = sitemap.match(/<url>[\s\S]*?<\/url>/g).find(block => block.includes(`<loc>${escaped}</loc>`));
    assert.ok(entry?.includes(`<lastmod>${expected.dateModified}</lastmod>`));
    report.html.push({ locale, status: 200, initialSectionCount: copy.sections.length, modified: schema.dateModified, citationCount: schema.citation.length });
    for (const [width, height] of [[320, 568], [390, 844], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      await page.goto(new URL(href, base).href);
      await expect(page.locator('h1')).toHaveText(copy.title);
      assert.equal(await page.locator('h1').count(), 1);
      await expect(page.locator('main')).toHaveAttribute('lang', tags[locale]);
      await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://www.destinypixel.com${href}`);
      assert.equal(await page.locator('link[rel=alternate][hreflang]').count(), 5);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${locale}/${width}: overflow`);
      for (const image of await page.locator('article img').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);
      }
      assert.equal(await page.locator('article section').count(), copy.sections.length);
      for (const section of copy.sections) {
        const node = page.locator(`article section[id="${section.id}"]`);
        await expect(node.locator('h2')).toHaveText(section.title);
        const text = plain(await node.innerText());
        for (const paragraph of section.bodyMarkdown.split(/\n\s*\n/)) assert.ok(text.includes(plain(paragraph)), `${locale}/${width}/${section.id}: complete paragraph`);
        await expect(page.locator(`aside nav a[href="#${section.id}"]`)).toHaveCount(1);
      }
      if (locale === 'en' || locale === 'zh') {
        const toc = page.locator(`aside nav a[href="#${sectionId}"]`);
        await toc.focus(); await page.keyboard.press('Enter');
        await page.waitForURL(url => url.hash === `#${sectionId}`);
        await expect(page.locator(`#${sectionId}-title`)).toBeInViewport();
        assert.equal(await page.locator(`#${sectionId} ol li`).count(), 3);
        if (width !== 320) {
          await page.screenshot({ path: resolve(out, `${locale}-new-section-${width}.png`) });
          await page.locator(`#${sectionId} ol`).scrollIntoViewIfNeeded();
          await page.screenshot({ path: resolve(out, `${locale}-practice-${width}.png`) });
        }
      }
      for (const href of await page.locator('article a[href^="/"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) destinations.add(href);
      report.views.push({ locale, width, height, sections: copy.sections.length, fullText: true, image: true, overflow: false });
    }
  }
  for (const path of destinations) {
    const url = new URL(path, base), fragment = url.hash.slice(1); url.hash = '';
    const html = await get(url.href);
    if (fragment) assert.ok(html.includes(`id="${fragment}"`));
    report.links.push({ path, status: 200, fragment: fragment || null });
  }
  await page.goto(new URL(journalHref('en', slug), base).href);
  await page.locator('header a[hreflang="zh-Hans"]').first().click();
  await expect(page.locator('main')).toHaveAttribute('lang', 'zh-Hans');
  await expect(page.locator(`#${sectionId} h2`)).toHaveText(article.translations.zh.sections.at(-1).title);
  await page.goBack(); await expect(page.locator('main')).toHaveAttribute('lang', 'en');
  await page.goForward(); await expect(page.locator('main')).toHaveAttribute('lang', 'zh-Hans');
  report.flows.push({ languageSwitchAndHistory: true });
  for (const [locale, width, height] of [['en', 1440, 900], ['zh', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto(new URL(journalHref(locale, slug), base).href);
    await page.locator(`#${sectionId} a[href="/tarot${suffix(locale)}"]`).click();
    await expect(page.locator('#table')).toHaveAttribute('aria-busy', 'false');
    assert.equal(new URL(page.url()).searchParams.get('locale') ?? 'en', locale);
    await openTarotSettings(page);
    await page.locator('.tarot-controls [role=tab]').last().click();
    await page.locator('.tarot-bottom-deck .cel-button').click();
    await expect(page.locator('.tarot-deck-top')).toBeEnabled();
    await page.locator('.tarot-deck-top').click();
    const placed = page.locator('.tarot-free-card');
    await placed.press('Enter'); await placed.press('Enter');
    await expect(page.locator('dialog[open]')).toHaveCount(1);
    const card = await placed.getAttribute('data-card-id');
    await expect(page.locator('.tarot-learning-link')).toHaveAttribute('href', `/journal/tarot-${card}${suffix(locale)}`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: resolve(out, `tool-meaning-${locale}-${width}.png`) });
    report.flows.push({ locale, width, articleToTool: true, shuffleDrawRevealMeaning: true, card });
  }
  assert.deepEqual(report.errors, []);
  report.status = 'passed';
  console.log(`PASS ${report.views.length} responsive states, ${report.html.length} initial HTML editions, ${report.links.length} internal targets, language history and desktop/mobile tool flows`);
  await context.close();
} catch (error) { report.status = 'failed'; report.error = error.stack; throw error; }
finally { writeFileSync(resolve(out, 'acceptance-local.json'), JSON.stringify(report, null, 2) + '\n'); await browser.close(); }
