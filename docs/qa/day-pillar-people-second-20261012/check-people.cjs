/* BASE_URL=http://127.0.0.1:3055 node docs/qa/day-pillar-people-second-20261012/check-people.cjs
 * BASELINE_URL defaults to the first-batch production on local port 3053.
 * Uses the environment's existing Playwright/Chromium; adds no dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const { chromium } = require('/opt/codex/cua_node/lib/node_modules/playwright');
const root = path.resolve(__dirname, '../../..');
const base = (process.env.BASE_URL || 'http://127.0.0.1:3055').replace(/\/$/, '');
const baseline = (process.env.BASELINE_URL || 'http://127.0.0.1:3053').replace(/\/$/, '');
const out = process.env.OUT_DIR || path.join(__dirname, 'production');
const registry = require(path.join(root, 'content/day-pillar-people/verified-people.json'));
const previous = require(path.join(root, 'content/day-pillar-people/second-batch-previous-editions.json'));
const firstIds = new Set(previous.firstBatch.ids);
const firstPeople = registry.people.filter(person => firstIds.has(person.id));
const newPeople = registry.people.filter(person => !firstIds.has(person.id));
const firstPillars = new Set(firstPeople.map(p => p.dayPillar));
const newPillars = new Set(newPeople.map(p => p.dayPillar));
const locales = ['en', 'zh', 'zh-TW', 'ru'];
const languageTags = { en: 'en', zh: 'zh-Hans', 'zh-TW': 'zh-Hant', ru: 'ru' };
const stems = '甲乙丙丁戊己庚辛壬癸', branches = '子丑寅卯辰巳午未申酉戌亥';
const stemSlugs = ['jia', 'yi', 'bing', 'ding', 'wu', 'ji', 'geng', 'xin', 'ren', 'gui'];
const branchSlugs = ['zi', 'chou', 'yin', 'mao', 'chen', 'si', 'wu', 'wei', 'shen', 'you', 'xu', 'hai'];
const cards = Array.from({ length: 60 }, (_, i) => ({ pillar: stems[i % 10] + branches[i % 12], slug: `${stemSlugs[i % 10]}_${branchSlugs[i % 12]}` }));
const peopleFor = pillar => registry.people.filter(p => p.dayPillar === pillar);
const articlePath = (card, locale) => `/journal/${card.slug.replace('_', '-')}-day-pillar${locale === 'en' ? '' : `?locale=${locale}`}`;
const cardPath = (card, locale) => `/day-pillar?${locale === 'en' ? '' : `locale=${locale}&`}pillar=${card.slug}`;
const libraryPath = locale => `/journal/day-pillars${locale === 'en' ? '' : `?locale=${locale}`}`;
const legacy = new Set(['甲子', '乙丑', '丙寅', '丁卯']);
const affected = new Set(registry.people.map(p => p.dayPillar));
const report = { base, baseline, commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), startedAt: new Date().toISOString(), expectedStructuredPeople: 60, expectedStructuredPillars: 58, expectedCoveredPillars: 60, firstBatchPeople: 22, secondBatchPeople: 38, externalSources: 'HTTPS destinations, receipt/publisher/page correspondence and opener-safe attributes only; provider availability is not tested.', ssr: [], baselineComparisons: [], sitemapDates: [], libraries: [], views: [], libraryViews: [], screenshots: [], errors: [] };
const oldCache = new Map();
const telemetryPaths = ['/_vercel/insights/script.js', '/_vercel/speed-insights/script.js'];
const knownTelemetryURLs = new Set(telemetryPaths.map(route => base + route));
function consoleCollector(page, unexpected, known) {
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const url = message.location().url, text = message.text();
    if (knownTelemetryURLs.has(url) && text.includes('status of 404')) known.push(url);
    else unexpected.push({ text, url });
  });
}
function resourceCollector(page, unexpected) {
  page.on('response', response => {
    if (response.status() < 400) return;
    const url = response.url();
    if (knownTelemetryURLs.has(url) && response.status() === 404) return;
    unexpected.push({ url, status: response.status() });
  });
}
async function check(name, fn) { try { await fn(); } catch (error) { report.errors.push({ name, error: error.stack || String(error) }); console.error(`FAIL ${name}: ${error.message}`); } }
async function pool(items, width, fn) { let index = 0; await Promise.all(Array.from({ length: width }, async () => { while (index < items.length) await fn(items[index++]); })); }
function canonicalMatches(value, route) { assert.equal(value, 'https://www.destinypixel.com' + route); }
function digest(value) { return createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
function sourceHref(source) { return source.url + (source.pageNumber ? `#page=${source.pageNumber}` : ''); }
function assertMethod(text, locale) {
  if (locale === 'en') {
    assert.match(text, /Gregorian birthday/); assert.match(text, /local civil date.*midnight boundary/);
    assert.match(text, /No birth time is supplied/); assert.match(text, /no time-zone conversion or solar-time correction/);
    assert.match(text, /not a complete BaZi chart/); assert.match(text, /not evidence for a BaZi interpretation/);
  } else {
    assert.match(text, /公历生日/); assert.match(text, /当地民用日期、零点日界/);
    assert.match(text, /未采集出生时刻/); assert.match(text, /不做时区换算或太阳时校准/);
    assert.match(text, /不代表完整八字/); assert.match(text, /不是命理解读的证据/);
  }
}
function assertSources(actual, person) {
  assert.deepEqual(actual.map(s => s.href), person.sources.map(sourceHref), `${person.id}: source receipts`);
  for (let i = 0; i < actual.length; i++) {
    const source = actual[i], receipt = person.sources[i], url = new URL(source.href);
    assert.equal(url.protocol, 'https:'); assert.equal(url.username + url.password + url.port, '');
    assert.equal(source.target, '_blank');
    assert.ok(source.rel.split(/\s+/).includes('noopener') && source.rel.split(/\s+/).includes('noreferrer'));
    assert.ok(source.text.includes(receipt.publisher));
    if (receipt.locator) assert.ok(source.text.includes(receipt.locator));
    if (receipt.pageNumber) assert.equal(url.hash, `#page=${receipt.pageNumber}`);
    assert.ok(receipt.evidence.trim() && ['paraphrase_of_opened_original_page', 'short_quote_of_opened_original_page'].includes(receipt.evidenceType));
    if (!firstIds.has(person.id)) {
      assert.equal(receipt.publisher, 'Nobel Prize'); assert.equal(url.hostname, 'www.nobelprize.org');
      assert.match(url.pathname, /^\/prizes\/.+\/facts\/$/); assert.equal(receipt.accessedAt, '2026-10-12');
    }
  }
}
async function parseHTML(parser, html) {
  return parser.evaluate(html => {
    const doc = new DOMParser().parseFromString(html, 'text/html'), article = doc.querySelector('main > article');
    const sourceLinks = parent => [...parent.querySelectorAll('[data-birthday-source]')].map(a => ({ href: a.getAttribute('href'), text: a.textContent.trim(), target: a.getAttribute('target'), rel: a.getAttribute('rel') || '' }));
    const section = article?.querySelector('#famous-birthdays');
    const schema = [...doc.querySelectorAll('script[type="application/ld+json"]')].flatMap(s => JSON.parse(s.textContent));
    return {
      lang: doc.querySelector('main')?.getAttribute('lang'), canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      modified: schema.find(s => s['@type'] === 'Article')?.dateModified,
      citation: schema.find(s => s['@type'] === 'Article')?.citation,
      people: [...doc.querySelectorAll('[data-person-id]')].map(p => ({ id: p.getAttribute('data-person-id'), name: p.querySelector('h3')?.textContent.trim(), fields: [...p.querySelectorAll('dd')].map(dd => dd.textContent.trim()), dateTime: p.querySelector('time')?.getAttribute('datetime'), note: p.querySelector('p')?.textContent.trim(), sources: sourceLinks(p), images: p.querySelectorAll('img').length })),
      panelCount: doc.querySelectorAll('[data-day-pillar-people]').length,
      panelText: doc.querySelector('[data-day-pillar-people] > div[class*="method"]')?.textContent,
      sectionCount: doc.querySelectorAll('#famous-birthdays').length,
      legacyRows: [...(section?.querySelectorAll('table tbody tr') || [])].map(row => [...row.children].map(cell => cell.textContent.trim())),
      legacySources: [...(section?.querySelectorAll(':scope > div[class*="sources"] a') || [])].map(a => ({ href: a.getAttribute('href'), text: a.textContent.trim() })),
      articleImageCount: article?.querySelectorAll('img').length,
      cardHref: doc.querySelector('[data-pillar-card-link]')?.getAttribute('href'),
      coverage: [...doc.querySelectorAll('[data-people-coverage]')].map(e => ({ count: e.getAttribute('data-people-coverage'), text: e.textContent.trim() })),
      libraryArticles: [...new Set([...doc.querySelectorAll('main a[href^="/journal/"][href*="-day-pillar"]')].map(a => a.getAttribute('href')))],
      renderedArticle: article ? { text: article.textContent.replace(/\s+/g, ' ').trim(), images: [...article.querySelectorAll('img')].map(i => [i.getAttribute('alt'), i.getAttribute('src')]), links: [...article.querySelectorAll('a')].map(a => [a.getAttribute('href'), a.textContent.trim()]) } : undefined,
    };
  }, html);
}
async function fetchEdition(parser, request, origin, route) {
  const response = await request.get(origin + route, { timeout: 90000 }); assert.equal(response.status(), 200, origin + route);
  return parseHTML(parser, await response.text());
}
function baselineEdition(parser, request, route) {
  if (!oldCache.has(route)) oldCache.set(route, fetchEdition(parser, request, baseline, route));
  return oldCache.get(route);
}
async function goto(page, route) { const response = await page.goto(base + route, { waitUntil: 'networkidle', timeout: 90000 }); assert.equal(response.status(), 200); }
async function visibleImages(page) {
  await page.evaluate(() => { for (const i of document.querySelectorAll('main img')) if (i.getClientRects().length && i.getBoundingClientRect().top < innerHeight) i.loading = 'eager'; });
  await page.waitForFunction(() => [...document.querySelectorAll('main img')].filter(i => i.getClientRects().length && i.getBoundingClientRect().top < innerHeight && i.getBoundingClientRect().bottom > 0).every(i => i.complete && i.naturalWidth > 0));
}
async function layout(page) {
  return page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
    const inspected = [...document.querySelectorAll('[data-day-pillar-people] h3, [data-day-pillar-people] dt, [data-day-pillar-people] dd, [data-day-pillar-people] p, [data-birthday-source], [data-birthday-source] small')];
    return {
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      textOverflow: inspected.filter(e => e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.slice(0, 100)),
      sourceFonts: [...document.querySelectorAll('[data-birthday-source]')].map(e => Number.parseFloat(getComputedStyle(e).fontSize)),
      toc: [...document.querySelectorAll('aside nav a[href^="#"]')].map(a => ({ hash: a.getAttribute('href'), count: ids.filter(id => id === decodeURIComponent(a.hash.slice(1))).length })),
      peopleGrid: [...document.querySelectorAll('[data-day-pillar-people] ul')].map(e => getComputedStyle(e).gridTemplateColumns),
    };
  });
}
async function screenshot(page, name, selector) {
  const file = name + '.png'; await page.locator(selector).screenshot({ path: path.join(out, file) }); report.screenshots.push(file);
}
function writeCompactReport() {
  const arrays = ['ssr', 'baselineComparisons', 'sitemapDates', 'libraries', 'views', 'libraryViews', 'screenshots', 'errors'];
  const header = Object.fromEntries(Object.entries(report).filter(([key]) => !arrays.includes(key)));
  const lines = [JSON.stringify(header, null, 2).slice(0, -2)];
  for (const key of arrays) {
    lines.push(`,\n  ${JSON.stringify(key)}: [`);
    lines.push(report[key].map(row => '    ' + JSON.stringify(row)).join(',\n'));
    lines.push('  ]');
  }
  lines.push('}\n'); fs.writeFileSync(path.join(out, 'report.json'), lines.join('\n'));
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  assert.equal(registry.people.length, 60); assert.equal(affected.size, 58);
  assert.equal(firstPeople.length, 22); assert.equal(newPeople.length, 38); assert.equal(newPillars.size, 38);
  assert.equal(digest(firstPeople), previous.firstBatch.peopleSha256, 'first-batch records and source receipts retained exactly');
  assert.equal(registry.people.some(p => p.id === 'gerty-cori'), false);
  assert.equal(registry.people.find(p => p.id === 'herta-muller').name.en, 'Herta Müller');
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const ssr = await browser.newContext({ javaScriptEnabled: false }), parser = await ssr.newPage();
    await check('identify local telemetry endpoints against baseline', async () => {
      const endpoints = [];
      for (const route of telemetryPaths) {
        const current = await ssr.request.get(base + route), prior = await ssr.request.get(baseline + route);
        assert.equal(current.status(), 404); assert.equal(prior.status(), 404);
        endpoints.push({ path: route, currentStatus: current.status(), baselineStatus: prior.status() });
      }
      report.localTelemetry = { endpoints, limitation: 'These two exact Vercel telemetry scripts return404 on both local Next production servers. Only their URL-identified404 console messages are classified separately; all other console errors remain failures. This is not a claim of an entirely empty local console.' };
    });
    await pool(cards.flatMap(card => locales.map(locale => ({ card, locale }))), 6, ({ card, locale }) => check(`SSR ${card.slug}/${locale}`, async () => {
      const route = articlePath(card, locale), data = await fetchEdition(parser, ssr.request, base, route);
      const people = ['en', 'zh'].includes(locale) ? peopleFor(card.pillar) : [];
      assert.equal(data.lang, languageTags[locale]); canonicalMatches(data.canonical, route);
      assert.deepEqual(data.people.map(p => p.id), people.map(p => p.id));
      assert.equal(new Set(data.people.map(p => p.id)).size, data.people.length);
      assert.equal(data.panelCount, people.length ? 1 : 0);
      assert.equal(data.articleImageCount, 1, 'only the original animal artwork remains');
      const expectedSection = people.length || legacy.has(card.pillar) ? 1 : 0;
      assert.equal(data.sectionCount, expectedSection, 'no duplicate or empty people section');
      for (let i = 0; i < people.length; i++) {
        const actual = data.people[i], person = people[i];
        assert.equal(actual.name, person.name[locale]); assert.deepEqual(actual.fields, [person.field[locale], person.birthDate, person.dayPillar]);
        assert.equal(actual.dateTime, person.birthDate); assert.equal(actual.note, person.displayNote?.[locale]); assert.equal(actual.images, 0);
        assertSources(actual.sources, person); assert.ok(person.birthTime === null && person.calendar === 'gregorian');
        for (const source of person.sources) assert.ok(data.citation.includes(source.url), 'schema cites original birthday source without a viewer fragment');
      }
      if (people.length) assertMethod(data.panelText, locale);
      const expectedModified = people.length && newPillars.has(card.pillar) ? '2026-10-12' : previous.articles[card.slug.replace('_', '-') + '-day-pillar'][locale].dateModified;
      assert.equal(data.modified, expectedModified);
      if (legacy.has(card.pillar)) {
        assert.equal(data.legacyRows.length, 2); assert.equal(data.legacySources.length, 2);
        const old = await baselineEdition(parser, ssr.request, route);
        assert.deepEqual(data.legacyRows, old.legacyRows); assert.deepEqual(data.legacySources, old.legacySources);
      } else assert.equal(data.legacyRows.length, 0);
      if (['zh-TW', 'ru'].includes(locale) || firstPillars.has(card.pillar)) {
        const old = await baselineEdition(parser, ssr.request, route);
        assert.deepEqual(data.renderedArticle, old.renderedArticle, 'unmodified rendered article body, images and links');
        assert.equal(data.modified, old.modified); canonicalMatches(old.canonical, route);
        assert.deepEqual(data.people, old.people); assert.deepEqual(data.citation, old.citation);
        report.baselineComparisons.push({ kind: ['zh-TW', 'ru'].includes(locale) ? 'unchanged-language' : 'first-batch', slug: card.slug, locale, renderedSha256: digest(data.renderedArticle), modified: data.modified, sameTextImagesLinksPeopleCitations: true });
      }
      report.ssr.push({ slug: card.slug, locale, ids: data.people.map(p => p.id), panels: data.panelCount, legacyRows: data.legacyRows.length, modified: data.modified, canonical: data.canonical });
    }));
    for (const locale of ['en', 'zh']) assert.deepEqual(report.ssr.filter(r => r.locale === locale).flatMap(r => r.ids).sort(), registry.people.map(p => p.id).sort());
    for (const locale of ['en', 'zh']) assert.equal(report.ssr.filter(r => r.locale === locale && (r.ids.length || r.legacyRows)).length, 60, 'all sixty articles contain sourced people');
    console.log(`SSR: ${report.ssr.length}/240 editions, ${report.baselineComparisons.length}/160 retained-edition comparisons`);
    await check('sitemap article and library revision scope', async () => {
      const response = await ssr.request.get(base + '/sitemap.xml'); assert.equal(response.status(), 200);
      const rows = await parser.evaluate(xml => [...new DOMParser().parseFromString(xml, 'application/xml').querySelectorAll('url')].map(row => ({ url: row.querySelector('loc')?.textContent, modified: row.querySelector('lastmod')?.textContent?.slice(0, 10) })), await response.text());
      for (const row of report.ssr) {
        const route = articlePath(cards.find(c => c.slug === row.slug), row.locale), match = rows.find(x => x.url === 'https://www.destinypixel.com' + route);
        assert.ok(match, 'article sitemap entry'); assert.equal(match.modified, row.modified);
      }
      const oldResponse = await ssr.request.get(baseline + '/sitemap.xml'); assert.equal(oldResponse.status(), 200);
      const oldRows = await parser.evaluate(xml => [...new DOMParser().parseFromString(xml, 'application/xml').querySelectorAll('url')].map(row => ({ url: row.querySelector('loc')?.textContent, modified: row.querySelector('lastmod')?.textContent?.slice(0, 10) })), await oldResponse.text());
      for (const locale of locales) {
        const url = 'https://www.destinypixel.com' + libraryPath(locale), row = rows.find(r => r.url === url), old = oldRows.find(r => r.url === url);
        assert.ok(row && old); assert.equal(row.modified, ['en', 'zh'].includes(locale) ? '2026-10-12' : old.modified);
        report.sitemapDates.push({ locale, url, modified: row.modified, previous: old.modified });
      }
    });
    for (const locale of locales) await check(`library SSR ${locale}`, async () => {
      const route = libraryPath(locale), data = await fetchEdition(parser, ssr.request, base, route);
      canonicalMatches(data.canonical, route); assert.equal(data.lang, languageTags[locale]); assert.equal(data.libraryArticles.length, 60);
      if (['en', 'zh'].includes(locale)) {
        assert.equal(data.coverage.length, 1); assert.equal(data.coverage[0].count, '60'); assert.match(data.coverage[0].text, /60\/60/);
        assert.ok(!/await source review|Further entries|其余条目逐步核查/.test(data.coverage[0].text));
        assert.match(data.coverage[0].text, locale === 'en' ? /do not establish a complete birth chart/ : /不代表完整八字/);
      }
      else assert.deepEqual(data.coverage, []);
      assert.equal(data.panelCount, 0); report.libraries.push({ locale, coverage: data.coverage[0]?.count || null, entries: data.libraryArticles.length, canonical: data.canonical });
    });
    await ssr.close();
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    await context.route('**/*', r => new URL(r.request().url()).origin === base ? r.continue() : r.abort());
    const viewports = [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 1440, height: 900 }];
    const representatives = [
      { id: 'cv-raman', shot: { en: 320, zh: 320 } }, { id: 'irene-joliot-curie', shot: { en: 390 } },
      { id: 'daniel-kahneman', shot: { zh: 390 } }, { id: 'maria-goeppert-mayer', shot: { en: 390 } },
      { id: 'herta-muller', shot: { en: 320 } }, { id: 'paul-dirac', shot: { en: 1440 } },
      { id: 'marie-curie', shot: { zh: 390 } }, { id: 'serena-williams', shot: { zh: 320 } }, { id: 'ella-fitzgerald', shot: { zh: 1440 } },
    ].map(sample => ({ ...sample, slug: cards.find(c => c.pillar === registry.people.find(p => p.id === sample.id).dayPillar).slug }));
    for (const viewport of viewports) for (const sample of representatives) for (const locale of ['en', 'zh']) await check(`browser ${sample.slug}/${locale}/${viewport.width}`, async () => {
      const card = cards.find(c => c.slug === sample.slug), page = await context.newPage(), errors = [], consoleErrors = [], localTelemetry404s = [], resourceErrors = []; page.on('pageerror', e => errors.push(e.message));
      consoleCollector(page, consoleErrors, localTelemetry404s);
      resourceCollector(page, resourceErrors);
      await page.setViewportSize(viewport);
      try {
        await goto(page, articlePath(card, locale)); await visibleImages(page);
        const link = page.locator('aside nav a[href="#famous-birthdays"]'); assert.equal(await link.count(), 1); await link.click();
        const box = await page.locator('#famous-birthdays').boundingBox(); assert.ok(box && box.y >= -1 && box.y < viewport.height);
        const checks = await layout(page); assert.equal(checks.overflow, false); assert.deepEqual(checks.textOverflow, []);
        assert.ok(checks.sourceFonts.every(size => size >= 12)); assert.ok(checks.toc.length && checks.toc.every(t => t.count === 1));
        for (const person of peopleFor(card.pillar)) {
          const source = page.locator(`[data-person-id="${person.id}"] [data-birthday-source]`).first();
          await source.scrollIntoViewIfNeeded(); const sourceBox = await source.boundingBox();
          assert.ok(sourceBox && sourceBox.width > 0 && sourceBox.height > 0 && sourceBox.x >= 0 && sourceBox.x + sourceBox.width <= viewport.width + 1, 'source label fits the phone/desktop width');
        }
        if (sample.slug === 'bing_chen') {
          const people = page.locator('[data-person-id]'); assert.equal(await people.count(), 2);
          const first = await people.nth(0).boundingBox(), second = await people.nth(1).boundingBox();
          assert.ok(viewport.width === 1440 ? second.x > first.x : Math.abs(second.x - first.x) < 1, 'people grid responds to available width');
        }
        if (viewport.width === sample.shot[locale]) await screenshot(page, `${sample.id}-${locale}-${viewport.width}`, `[data-person-id="${sample.id}"]`);
        const cta = page.locator('[data-pillar-card-link]'); assert.equal(await cta.getAttribute('href'), cardPath(card, locale));
        await cta.click(); await page.waitForURL(base + cardPath(card, locale));
        assert.equal(await page.locator('[data-pillar-article-link]').getAttribute('href'), articlePath(card, locale));
        assert.equal(await page.locator('[data-pillar-article-link]').getAttribute('data-pillar-article-link'), card.pillar);
        assert.equal(await page.locator('main').getAttribute('lang'), languageTags[locale]);
        if (viewport.width === 390) {
          const other = locale === 'en' ? 'zh' : 'en'; await page.locator(`header a[href="${cardPath(card, other)}"]`).click();
          await page.waitForURL(base + cardPath(card, other));
          assert.equal(await page.locator('main').getAttribute('lang'), languageTags[other]);
          canonicalMatches(await page.locator('link[rel="canonical"]').getAttribute('href'), `/day-pillar${other === 'en' ? '' : '?locale=zh'}`);
          assert.equal(await page.locator('[data-pillar-article-link]').getAttribute('href'), articlePath(card, other));
          await page.goBack({ waitUntil: 'commit' }); await page.waitForURL(base + cardPath(card, locale));
          await page.waitForFunction(lang => document.querySelector('main')?.getAttribute('lang') === lang, languageTags[locale]);
          assert.equal(await page.locator('[data-pillar-article-link]').getAttribute('href'), articlePath(card, locale));
        }
        await page.locator('[data-pillar-article-link]').click(); await page.waitForURL(base + articlePath(card, locale));
        assert.equal(await page.locator('[data-person-id]').count(), peopleFor(card.pillar).length); assert.deepEqual(errors, []); assert.deepEqual(consoleErrors, []); assert.deepEqual(resourceErrors, []);
        report.views.push({ slug: card.slug, id: sample.id, locale, width: viewport.width, people: peopleFor(card.pillar).length, overflow: false, textOverflow: [], tocTargets: checks.toc.length, sourceFontMin: Math.min(...checks.sourceFonts), reciprocalCTA: true, localeSwitchAndBack: viewport.width === 390, runtimeErrors: [], unexpectedConsoleErrors: [], unexpectedResourceErrors: [], knownLocalTelemetry404Count: localTelemetry404s.length });
      } finally { await page.close(); }
    });
    console.log(`Browser: ${report.views.length}/54 responsive people cases`);
    for (const viewport of viewports) for (const locale of ['en', 'zh']) await check(`library browser ${locale}/${viewport.width}`, async () => {
      const page = await context.newPage(), errors = [], consoleErrors = [], localTelemetry404s = [], resourceErrors = []; page.on('pageerror', e => errors.push(e.message)); consoleCollector(page, consoleErrors, localTelemetry404s); resourceCollector(page, resourceErrors); await page.setViewportSize(viewport);
      try {
        await goto(page, libraryPath(locale)); await visibleImages(page);
        const coverage = page.locator('[data-people-coverage="60"]'); assert.equal(await coverage.count(), 1); assert.match(await coverage.textContent(), /60\/60/);
        await coverage.scrollIntoViewIfNeeded(); const checks = await layout(page); assert.equal(checks.overflow, false); assert.deepEqual(errors, []); assert.deepEqual(consoleErrors, []); assert.deepEqual(resourceErrors, []);
        report.libraryViews.push({ locale, width: viewport.width, coverage: '60/60', overflow: false, runtimeErrors: [], unexpectedConsoleErrors: [], unexpectedResourceErrors: [], knownLocalTelemetry404Count: localTelemetry404s.length });
      } finally { await page.close(); }
    });
    await context.close();
  } finally {
    await browser.close(); report.finishedAt = new Date().toISOString();
    report.ssr.sort((a, b) => (a.slug + a.locale).localeCompare(b.slug + b.locale));
    report.baselineComparisons.sort((a, b) => (a.slug + a.locale).localeCompare(b.slug + b.locale));
    report.passed = report.errors.length === 0 && report.ssr.length === 240 && report.baselineComparisons.length === 160 && report.sitemapDates.length === 4 && report.libraries.length === 4 && report.views.length === 54 && report.libraryViews.length === 6 && report.screenshots.length === 10;
    report.summary = { editions: report.ssr.length, structuredPersonOccurrences: report.ssr.reduce((sum, row) => sum + row.ids.length, 0), newPersonOccurrences: report.ssr.flatMap(row => row.ids).filter(id => !firstIds.has(id)).length, firstBatchOccurrences: report.ssr.flatMap(row => row.ids).filter(id => firstIds.has(id)).length, structuredPillars: new Set(report.ssr.filter(r => r.ids.length).map(r => r.slug)).size, coveredPillarsPerEnZh: new Set(report.ssr.filter(r => r.ids.length || r.legacyRows).map(r => r.slug)).size, retainedLanguageComparisons: report.baselineComparisons.filter(r => r.kind === 'unchanged-language').length, retainedFirstBatchComparisons: report.baselineComparisons.filter(r => r.kind === 'first-batch').length, originalBirthdayTableRows: report.ssr.reduce((sum, r) => sum + r.legacyRows, 0), directories: report.libraries.length, articleViews: report.views.length, libraryViews: report.libraryViews.length, localeSwitchAndBackCases: report.views.filter(r => r.localeSwitchAndBack).length, screenshots: report.screenshots.length, failures: report.errors.length };
    report.summary.peoplePerSupportedLocale = Object.fromEntries(['en', 'zh'].map(locale => [locale, report.ssr.filter(row => row.locale === locale).reduce((sum, row) => sum + row.ids.length + row.legacyRows, 0)]));
    report.summary.knownLocalTelemetry404Messages = [...report.views, ...report.libraryViews].reduce((sum, row) => sum + row.knownLocalTelemetry404Count, 0);
    writeCompactReport();
  }
  console.log(`${report.passed ? 'PASS' : 'FAIL'} ${JSON.stringify(report.summary)}; ${path.join(out, 'report.json')}`);
  if (!report.passed) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
