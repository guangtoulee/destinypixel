import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { openTarotSettings } from './tarot-browser-helpers.mjs';

const require = createRequire(import.meta.url);
const { chromium, expect } = require(process.env.PLAYWRIGHT_MODULE ?? '/opt/codex/cua_node/lib/node_modules/playwright/test');
const base = new URL(process.argv[2] ?? 'http://127.0.0.1:3060');
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname), 'This check is limited to local acceptance');
const out = resolve(process.env.QA_EVIDENCE_DIR ?? 'docs/qa/tarot-four-cups-20261108');
mkdirSync(out, { recursive: true });
const report = { base: base.origin, scope: 'Local production build only', views: [], http: [], links: [], flows: [], errors: [] };
const plain = text => text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\*\*|__/g, '').replace(/^\d+\. /gm, '').replace(/^[-#]+ /gm, '').replace(/\s+/g, '');
const suffix = locale => locale === 'en' ? '' : `?locale=${locale}`;
const href = locale => `/journal/tarot-four-of-cups${suffix(locale)}`;
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
  const internal = new Set();
  const sitemap = await get('/sitemap.xml');
  for (const locale of ['en', 'zh', 'zh-TW', 'ru']) {
    const article = JSON.parse(readFileSync(`content/tarot/${locale}/four-of-cups.json`, 'utf8'));
    const html = await get(href(locale));
    const jsonLd = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(match => JSON.parse(match[1]));
    const schema = jsonLd.find(value => value['@type'] === 'Article');
    assert.equal(schema.datePublished, '2026-10-07');
    assert.equal(schema.dateModified, article.updatedAt);
    assert.equal(schema.headline, article.title);
    for (const source of article.sources) assert.ok(schema.citation.includes(source.url));
    const escaped = `https://www.destinypixel.com${href(locale)}`.replaceAll('&', '&amp;');
    const entry = sitemap.match(/<url>[\s\S]*?<\/url>/g).find(block => block.includes(`<loc>${escaped}</loc>`));
    assert.ok(entry?.includes(`<lastmod>${article.updatedAt}</lastmod>`), `${locale}: sitemap date`);
    // These markers must arrive in initial server HTML, before browser hydration.
    for (const section of article.sections) assert.ok(html.includes(`id="${section.id}"`));
    report.http.push({ locale, status: 200, initialSectionCount: article.sections.length, modified: schema.dateModified, citationCount: schema.citation.length });
    for (const [width, height] of [[320, 568], [390, 844], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      await page.goto(new URL(href(locale), base).href);
      await expect(page.locator('h1')).toHaveText(article.title);
      assert.equal(await page.locator('h1').count(), 1);
      await expect(page.locator('main')).toHaveAttribute('lang', ({ en: 'en', zh: 'zh-Hans', 'zh-TW': 'zh-Hant', ru: 'ru' })[locale]);
      await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://www.destinypixel.com${href(locale)}`);
      assert.equal(await page.locator('link[rel=alternate][hreflang]').count(), 5);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${locale}/${width}: overflow`);
      await expect.poll(() => page.locator('article figure img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
      assert.equal(await page.locator('[data-learning-section]').count(), article.sections.length);
      for (const section of article.sections) {
        const node = page.locator(`[data-learning-section="${section.id}"]`);
        await expect(node.locator('h2')).toHaveText(section.title);
        const text = plain(await node.innerText());
        for (const paragraph of section.bodyMarkdown.split(/\n\s*\n/)) assert.ok(text.includes(plain(paragraph)), `${locale}/${width}/${section.id}: complete paragraph`);
      }
      for (const sectionId of ['section-01', 'section-02', 'section-04', 'depth-case-1', 'depth-case-2', 'section-06']) {
        await expect(page.locator(`aside nav a[href="#${sectionId}"]`)).toHaveCount(1);
      }
      if (['en', 'zh'].includes(locale)) {
        for (const sectionId of ['reversal-source-choice', 'reversal-practice']) {
          const toc = page.locator(`aside nav a[href="#${sectionId}"]`);
          await toc.focus(); await page.keyboard.press('Enter');
          await page.waitForURL(url => url.hash === `#${sectionId}`);
          await expect(page.locator(`#${sectionId}-title`)).toBeInViewport();
          if (width !== 320) await page.screenshot({ path: resolve(out, `${locale}-${sectionId}-${width}.png`) });
        }
      }
      for (const link of await page.locator('article a[href^="/"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) internal.add(link);
      report.views.push({ locale, width, height, fullText: true, sections: article.sections.length, image: true, overflow: false });
    }
  }
  for (const path of internal) {
    const url = new URL(path, base), id = url.hash.slice(1); url.hash = '';
    const html = await get(url.href);
    if (id) assert.ok(html.includes(`id="${id}"`), `Internal fragment: ${path}`);
    report.links.push({ path, status: 200, fragment: id || null });
  }
  await page.goto(new URL(href('en'), base).href);
  await page.locator('header a[hreflang="zh-Hans"]').first().click();
  await expect(page.locator('main')).toHaveAttribute('lang', 'zh-Hans');
  await expect(page.locator('#reversal-source-choice h2')).toHaveText('另一份牌义为何写成“预感”？');
  await page.goBack(); await expect(page.locator('main')).toHaveAttribute('lang', 'en');
  await page.goForward(); await expect(page.locator('main')).toHaveAttribute('lang', 'zh-Hans');
  report.flows.push({ languageSwitchAndHistory: true });
  for (const [locale, width, height] of [['en', 1440, 900], ['zh', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto(new URL(href(locale), base).href);
    await page.locator(`#reversal-practice a[href="/tarot${suffix(locale)}"]`).click();
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
    report.flows.push({ locale, width, articleToTool: true, shuffleDrawRevealMeaning: true, card, settingsOpened: true });
  }
  assert.deepEqual(report.errors, []);
  report.status = 'passed';
  await context.close();
  console.log(`PASS ${report.views.length} responsive states, ${report.http.length} initial HTML editions, ${report.links.length} internal links, language history and desktop/mobile free-table flows`);
} catch (error) {
  report.status = 'failed'; report.error = error.stack; throw error;
} finally {
  writeFileSync(resolve(out, 'acceptance-local.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
