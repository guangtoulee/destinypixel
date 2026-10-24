import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import Markdown from 'react-markdown';
import {openTarotSettings} from './tarot-browser-helpers.mjs';

const {chromium, expect} = createRequire(import.meta.url)('playwright/test');
const base = new URL(process.argv[2] ?? 'http://127.0.0.1:3048');
const out = resolve(process.env.QA_EVIDENCE_DIR ?? 'docs/qa/hanged-man-20261024');
const articlePath = '/journal/tarot-hanged-man';
const locales = ['en', 'zh', 'zh-TW', 'ru'];
const tags = {en:'en', zh:'zh-Hans', 'zh-TW':'zh-Hant', ru:'ru'};
const suffix = locale => locale === 'en' ? '' : `?locale=${locale}`;
const authored = locale => locale === 'en' || locale === 'zh';
const editions = Object.fromEntries(locales.map(locale => [locale, JSON.parse(readFileSync(`content/tarot/${locale}/hanged-man.json`, 'utf8'))]));
const plain = value => value.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const renderText = markdown => plain(renderToStaticMarkup(React.createElement(Markdown, null, markdown)));
const report = {base:base.origin, scope:'Public GETs and browser interactions; no AI request, account write or payment', http:[], responsive:[], interactions:[], screenshots:[], pageErrors:[], consoleErrors:[], responseErrors:[], blockedRequests:[]};
mkdirSync(out, {recursive:true});
async function get(path) {
  const response = await fetch(new URL(path, base), {signal:AbortSignal.timeout(30000)});
  assert.equal(response.status, 200, path);
  return response.text();
}
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH ?? '/usr/bin/chromium', args:['--no-sandbox']});
const context = await browser.newContext({reducedMotion:'reduce'});
await context.route('**/*', route => {
  const request = route.request(), url = new URL(request.url());
  if (url.origin === base.origin && request.method() === 'GET') return route.continue();
  report.blockedRequests.push({method:request.method(), origin:url.origin, path:url.pathname});
  return route.abort();
});
context.on('page', page => {
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('console', message => {if (message.type() === 'error') report.consoleErrors.push({text:message.text(), url:message.location().url});});
  page.on('response', response => {if (response.status() >= 400) report.responseErrors.push({status:response.status(), url:response.url()});});
  page.on('dialog', dialog => dialog.dismiss());
});
const page = await context.newPage();
async function edition(locale) {
  const article = editions[locale];
  await expect(page.locator('h1')).toHaveText(article.title);
  await expect(page).toHaveTitle(`${article.title} | DestinyPixel`);
  await expect(page.locator('main')).toHaveAttribute('lang', tags[locale]);
  await expect(page.locator('link[rel=canonical]')).toHaveCount(1);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://www.destinypixel.com${articlePath}${suffix(locale)}`);
  await expect(page.locator('meta[name=description]')).toHaveAttribute('content', article.hook);
  for (const other of locales) await expect(page.locator(`link[rel=alternate][hreflang="${tags[other]}"]`)).toHaveAttribute('href', `https://www.destinypixel.com${articlePath}${suffix(other)}`);
  const schema = await page.locator('script[type="application/ld+json"]').evaluateAll(elements => elements.flatMap(element => JSON.parse(element.textContent))).then(entries => entries.find(entry => entry['@type'] === 'Article'));
  assert.equal(schema.datePublished, '2026-10-07');
  assert.equal(schema.dateModified, authored(locale) ? '2026-10-24' : '2026-10-08');
  await expect(page.locator('time[datetime="2026-10-07"]')).toHaveCount(1);
  await expect(page.locator(`time[datetime="${schema.dateModified}"]`)).toHaveCount(1);
  await expect(page.locator('[data-learning-section]')).toHaveCount(authored(locale) ? 12 : 9);
  await expect(page.locator('[data-editorial-update]')).toHaveCount(authored(locale) ? 1 : 0);
  if (authored(locale)) await expect(page.locator('[data-learning-short-answer]')).toContainText(article.shortAnswer.body);
}
try {
  const sitemap = await get('/sitemap.xml');
  const internalLinks = new Set();
  for (const locale of locales) {
    const article = editions[locale], html = await get(articlePath + suffix(locale));
    const renderedArticle = html.match(/<article\b[^>]*>[\s\S]*?<\/article>/)?.[0];
    assert.ok(renderedArticle, `${locale}: article absent from initial HTML`);
    for (const section of article.sections) {
      const rendered = renderedArticle.match(new RegExp(`<section[^>]*data-learning-section="${section.id}"[^>]*>([\\s\\S]*?)<\\/section>`))?.[1];
      assert.ok(rendered, `${locale}/${section.id}: no server section`);
      assert.equal(plain(rendered.replace(/<h2\b[^>]*>[\s\S]*?<\/h2>/, '')), renderText(section.bodyMarkdown), `${locale}/${section.id}: full server text mismatch`);
    }
    for (const source of article.sources) assert.ok(renderedArticle.includes(source.url.replaceAll('&', '&amp;')), `${locale}: source missing`);
    const entry = sitemap.match(new RegExp(`<url>\\s*<loc>https://www\\.destinypixel\\.com${articlePath}${locale === 'en' ? '' : `\\?locale=${locale}`}<\\/loc>([\\s\\S]*?)<\\/url>`))?.[1];
    assert.ok(entry?.includes(`<lastmod>${authored(locale) ? '2026-10-24' : '2026-10-08'}</lastmod>`), `${locale}: sitemap date mismatch`);
    if (authored(locale)) for (const link of renderedArticle.matchAll(/href="(\/[^"#]*)"/g)) internalLinks.add(link[1].replaceAll('&amp;', '&'));
    report.http.push({locale, status:200, sections:article.sections.length, completeText:true, sourceLinks:true, sitemapDate:true});
  }
  for (const link of internalLinks) await get(link);
  report.internalLinkCount = internalLinks.size;
  for (const locale of ['en', 'zh']) {
    for (const [width,height] of [[320,740], [390,844], [1440,900]]) {
      await page.setViewportSize({width,height});
      assert.equal((await page.goto(new URL(articlePath + suffix(locale), base).href)).status(), 200);
      await edition(locale);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${locale}/${width}: document overflow`);
      for (const image of await page.locator('article img').all()) await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
      for (const section of [...editions[locale].sections, editions[locale].sourceAppendix]) {
        await expect(page.locator(`[id="${section.id}"]`)).toHaveCount(1);
        await page.locator(`aside a[href="#${section.id}"]`).click();
        await expect(page.locator(`#${section.id}`)).toBeInViewport();
      }
      if ((locale === 'zh' && width === 390) || (locale === 'en' && width === 1440)) {
        if (locale === 'zh') await page.locator('#early-decks-and-rws').scrollIntoViewIfNeeded();
        else await page.evaluate(() => scrollTo(0,0));
        const name = `article-${locale}-${width}.png`;
        await page.screenshot({path:resolve(out,name)});
        report.screenshots.push(name);
      }
      report.responsive.push({locale,width,height,overflow:false,images:true,allTocAnchors:true});
      console.log(`PASS ${locale}/${width}: complete article, metadata, images, all TOC anchors, responsive fit`);
    }
  }
  for (const locale of ['ru','zh-TW']) {
    await page.goto(new URL(articlePath + suffix(locale),base).href);
    await edition(locale);
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto(new URL(articlePath,base).href); await edition('en');
  await page.locator('header a[hreflang="zh-Hans"]').click();
  await page.waitForURL(url => url.pathname === articlePath && url.searchParams.get('locale') === 'zh'); await edition('zh');
  await page.goBack(); await edition('en');
  await page.goForward(); await edition('zh');
  report.interactions.push('English → Chinese → Back → Forward preserves title, description, main language and canonical');
  for (const slug of ['how-to-connect-three-tarot-cards','how-to-keep-tarot-journal']) {
    await page.locator(`article a[href="/journal/${slug}?locale=zh"]`).click();
    await page.waitForURL(url => url.pathname === `/journal/${slug}` && url.searchParams.get('locale') === 'zh');
    await expect(page.locator('h1')).toBeVisible();
    await page.goBack(); await edition('zh');
  }
  report.interactions.push('Chinese related teaching links reach the actual three-card and journal pages');
  await page.locator('a[href="/tarot?locale=zh"]').first().click();
  await page.waitForURL(url => url.pathname === '/tarot' && url.searchParams.get('locale') === 'zh');
  await expect(page.locator('#table')).toHaveAttribute('aria-busy','false');
  await openTarotSettings(page);
  await page.getByRole('tab', {name:'自由牌桌', exact:true}).click();
  await page.getByRole('checkbox', {name:'加入逆位', exact:true}).uncheck();
  await page.locator('.tarot-bottom-deck .cel-button').click();
  await expect(page.locator('.tarot-draw-action')).toBeEnabled();
  await page.locator('.tarot-draw-action').click();
  await expect(page.locator('.tarot-free-card')).toHaveCount(1);
  await page.locator('.tarot-free-card').press('Enter');
  await expect(page.locator('#tarot-board .is-revealed')).toHaveCount(1);
  await expect(page.locator('.tarot-orientation-status')).toHaveText('正位 · 摆放角度 0°');
  const face = page.locator('.tarot-free-card img');
  await expect(face).toHaveCSS('transform','none');
  await page.getByRole('button', {name:'转动摆放角度15°',exact:true}).click();
  await expect(page.locator('.tarot-orientation-status')).toHaveText('正位 · 摆放角度 15°');
  await expect(face).toHaveCSS('transform','none');
  await page.getByRole('button', {name:'切换正逆位',exact:true}).click();
  await expect(page.locator('.tarot-orientation-status')).toHaveText('逆位 · 摆放角度 15°');
  await expect(face).toHaveCSS('transform','matrix(-1, 0, 0, -1, 0, 0)');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Free table workflow: overflow');
  report.interactions.push('Chinese article CTA → Free table → no reversals → shuffle → draw → reveal → rotate 15° keeps upright → orientation switch reverses face and label');
  assert.deepEqual(report.pageErrors, []);
  // Vercel injects these endpoints when deployed; a local Next production server returns 404.
  const localTelemetry = url => ['localhost','127.0.0.1','[::1]'].includes(base.hostname) && ['/_vercel/insights/script.js','/_vercel/speed-insights/script.js'].some(path => url === new URL(path,base).href);
  report.localTelemetry404s = report.responseErrors.filter(error => error.status === 404 && localTelemetry(error.url));
  assert.deepEqual(report.responseErrors.filter(error => !report.localTelemetry404s.includes(error)), [], 'Unexpected HTTP resource error');
  assert.deepEqual(report.consoleErrors.filter(message => !(localTelemetry(message.url) && message.text === 'Failed to load resource: the server responded with a status of 404 (Not Found)')), [], 'Unexpected browser console error');
  report.status = 'passed';
  console.log(`PASS 4 server-rendered editions, ${internalLinks.size} internal links, 6 responsive views, language/history/teaching/tool interactions`);
} catch (error) {
  report.status = 'failed'; report.failure = error.stack;
  throw error;
} finally {
  report.finishedAt = new Date().toISOString();
  writeFileSync(resolve(out,'responsive.json'), JSON.stringify(report,null,2) + '\n');
  await context.close(); await browser.close();
}
