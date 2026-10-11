/* Re-run against a running build, without changing package dependencies:
 * BASE_URL=http://127.0.0.1:3046 QA_RUN_LABEL=production node docs/qa/day-pillar-links-20261011/check-links.cjs
 * Optional OUT_DIR keeps deployment evidence outside the checkout.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('/opt/codex/cua_node/lib/node_modules/playwright');
const OpenCC = require('opencc-js/cn2t');

const root = path.resolve(__dirname, '../../..');
const base = (process.env.BASE_URL || 'http://127.0.0.1:3045').replace(/\/$/, '');
const label = process.env.QA_RUN_LABEL || 'development';
const out = process.env.OUT_DIR || path.join(__dirname, label);
const locales = ['en', 'zh', 'zh-TW', 'ru'];
const languageTags = { en: 'en', zh: 'zh-Hans', 'zh-TW': 'zh-Hant', ru: 'ru' };
const stems = '甲乙丙丁戊己庚辛壬癸';
const branches = '子丑寅卯辰巳午未申酉戌亥';
const stemSlugs = ['jia', 'yi', 'bing', 'ding', 'wu', 'ji', 'geng', 'xin', 'ren', 'gui'];
const branchSlugs = ['zi', 'chou', 'yin', 'mao', 'chen', 'si', 'wu', 'wei', 'shen', 'you', 'xu', 'hai'];
const animalNames = JSON.parse(fs.readFileSync(path.join(root, 'lib/compatibility/animal-names.json'), 'utf8'));
const traditional = OpenCC.Converter({ from: 'cn', to: 'tw' });
const cards = Array.from({ length: 60 }, (_, i) => ({ pillar: stems[i % 10] + branches[i % 12], slug: `${stemSlugs[i % 10]}_${branchSlugs[i % 12]}` }));
const ding = cards.find(c => c.pillar === '丁酉');
const articlePath = (card, locale) => `/journal/${card.slug.replace('_', '-')}-day-pillar${locale === 'en' ? '' : `?locale=${locale}`}`;
const cardPath = (card, locale) => `${['zh-TW', 'ru'].includes(locale) ? '/discover' : '/day-pillar'}?${locale === 'en' ? '' : `locale=${locale}&`}pillar=${card.slug}`;
const genericCardPath = locale => `${['zh-TW', 'ru'].includes(locale) ? '/discover' : '/day-pillar'}${locale === 'en' ? '' : `?locale=${locale}`}`;
const cardName = (card, locale) => locale === 'zh-TW' ? traditional(animalNames[card.pillar].zh) : animalNames[card.pillar][locale];
const expectedShared = { en: 'SHARED ARCHETYPE', zh: '分享的意象卡', 'zh-TW': '原創動物卡', ru: 'АВТОРСКАЯ КАРТОЧКА ЖИВОТНОГО' };
const expectedSharedNote = {
  en: 'This link shares a card type only. Enter your own date to find your preview.',
  zh: '这个链接只分享一种卡片意象。输入自己的生日，再看你的日期初算结果。',
  'zh-TW': '你正在瀏覽這張卡，沒有輸入生日。角色和故事屬於 DestinyPixel 的原創解讀。',
  ru: 'Вы просматриваете карточку без даты рождения. Персонаж и история — авторская интерпретация DestinyPixel.',
};
const report = {
  base, runLabel: label, startedAt: new Date().toISOString(),
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  method: '480 HTTP-rendered article/card routes parsed in a browser; all 60 original image assets; 4 no-JavaScript reciprocal flows; 12 viewport/locale browser cases; language, card interaction and calculator checks.',
  ssr: [], images: [], noJavaScript: [], views: [], flows: [], errors: [], screenshots: [],
};

async function check(name, fn) {
  try { await fn(); }
  catch (error) { report.errors.push({ name, error: error.stack || String(error) }); console.error(`FAIL ${name}: ${error.message}`); }
}
async function pool(items, width, fn) {
  let index = 0;
  await Promise.all(Array.from({ length: width }, async () => {
    while (index < items.length) { const item = items[index++]; await fn(item); }
  }));
}
function routeOf(url) { const parsed = new URL(url); return parsed.pathname + parsed.search; }
function checkCanonical(canonical, expected) {
  assert.ok(canonical, 'canonical is present');
  assert.equal(new URL(canonical).origin, 'https://www.destinypixel.com');
  assert.equal(routeOf(canonical), expected);
}
async function getSSR(parser, request, url) {
  const response = await request.get(base + url, { timeout: 90000 });
  assert.equal(response.status(), 200, url);
  const html = await response.text();
  return parser.evaluate(html => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const main = doc.querySelector('main');
    const article = doc.querySelector('article');
    const links = attribute => [...doc.querySelectorAll(`[${attribute}]`)].map(a => ({ pillar: a.getAttribute(attribute), href: a.getAttribute('href'), text: a.textContent.trim() }));
    const schema = [...doc.querySelectorAll('script[type="application/ld+json"]')].flatMap(s => { try { return JSON.parse(s.textContent); } catch { return []; } });
    return {
      lang: main?.getAttribute('lang'), title: doc.querySelector('h1')?.textContent.trim(),
      canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      cardLinks: links('data-pillar-card-link'), articleLinks: links('data-pillar-article-link'),
      images: [...doc.querySelectorAll('main img')].map(i => ({ src: i.getAttribute('src'), alt: i.getAttribute('alt') })),
      cardTitle: doc.querySelector('#day-card-title, #find-your-card h2')?.textContent.trim(),
      articleText: article?.textContent, genderText: doc.querySelector('#gender-tradition')?.textContent,
      firstSection: article?.querySelector('section')?.id,
      sharedLabel: doc.querySelector('section[aria-label] > div[class*="resultHeading"] p, #find-your-card div[aria-live] > p')?.textContent.trim(),
      sharedNote: doc.querySelector('p[class*="resultNote"], #find-your-card div[class*="revealed"] > div > p')?.textContent.trim(),
      handoffNotes: doc.querySelectorAll('p[class*="handoffNote"]').length,
      modified: schema.find(s => s['@type'] === 'Article')?.dateModified,
    };
  }, html);
}
function assertExactCard(data, card, locale) {
  assert.equal(data.lang, languageTags[locale]);
  assert.deepEqual(data.articleLinks.map(({ pillar, href }) => ({ pillar, href })), [{ pillar: card.pillar, href: articlePath(card, locale) }]);
  assert.equal(data.cardTitle, cardName(card, locale));
  assert.ok(data.images.some(i => i.src?.includes(`${card.slug}.jpg`) && i.alt?.includes(cardName(card, locale))), `${card.slug}/${locale}: matching card artwork and name`);
  assert.equal(data.sharedLabel, expectedShared[locale], 'preloaded card is labelled as shared/original rather than a calculated birthday');
  assert.equal(data.sharedNote, expectedSharedNote[locale]);
  assert.equal(data.handoffNotes, 0, 'preloaded card has no personal-date handoff claim');
}
async function waitForArtwork(page) {
  // Eager-loading visible layout images also verifies artwork above an initial
  // discovery-result scroll. Closed-dialog images are deliberately excluded.
  await page.evaluate(() => { for (const img of document.querySelectorAll('main img')) if (img.getClientRects().length) img.loading = 'eager'; });
  await page.waitForFunction(() => [...document.querySelectorAll('main img')].filter(i => i.getClientRects().length).every(i => i.complete && i.naturalWidth > 0), null, { timeout: 30000 });
}
async function viewChecks(page) {
  await waitForArtwork(page);
  return page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
    const toc = [...document.querySelectorAll('aside nav a[href^="#"]')].map(a => a.getAttribute('href'));
    return {
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      viewportWidth: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      brokenImages: [...document.querySelectorAll('main img')].filter(i => i.getClientRects().length && (!i.complete || !i.naturalWidth)).map(i => i.alt),
      tocTargets: toc.map(hash => ({ hash, targets: ids.filter(id => id === decodeURIComponent(hash.slice(1))).length })),
    };
  });
}
async function screenshot(page, name, selector) {
  const filename = `${name}.png`;
  if (selector) await page.locator(selector).screenshot({ path: path.join(out, filename) });
  else await page.screenshot({ path: path.join(out, filename), fullPage: false });
  report.screenshots.push(filename);
}
async function goto(page, route) {
  const response = await page.goto(base + route, { waitUntil: 'networkidle', timeout: 90000 });
  assert.equal(response.status(), 200, route);
}
async function assertBrowserCard(page, card, locale) {
  assert.equal(await page.locator('main').getAttribute('lang'), languageTags[locale]);
  const link = page.locator('[data-pillar-article-link]');
  assert.equal(await link.count(), 1);
  assert.equal(await link.getAttribute('data-pillar-article-link'), card.pillar);
  assert.equal(await link.getAttribute('href'), articlePath(card, locale));
  assert.equal(await page.locator('#day-card-title, #find-your-card h2').first().textContent(), cardName(card, locale));
  assert.ok(await page.locator(`main img[alt*="${cardName(card, locale)}"]`).count());
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const ssr = await browser.newContext({ javaScriptEnabled: false });
    const parser = await ssr.newPage();
    const matrix = cards.flatMap(card => locales.flatMap(locale => ['article', 'card'].map(kind => ({ card, locale, kind }))));
    await pool(matrix, 6, async ({ card, locale, kind }) => check(`SSR ${kind} ${card.slug}/${locale}`, async () => {
      const route = kind === 'article' ? articlePath(card, locale) : cardPath(card, locale);
      const data = await getSSR(parser, ssr.request, route);
      assert.equal(data.lang, languageTags[locale]);
      if (kind === 'article') {
        assert.deepEqual(data.cardLinks.map(({ pillar, href }) => ({ pillar, href })), [{ pillar: card.pillar, href: cardPath(card, locale) }]);
        assert.ok(data.cardLinks[0].text.includes(cardName(card, locale)));
        assert.ok(data.images.some(i => i.src?.includes(`${card.slug}.jpg`) && i.alt?.includes(cardName(card, locale))));
        checkCanonical(data.canonical, articlePath(card, locale));
        if (card.pillar === '丁酉' && ['en', 'zh'].includes(locale)) {
          assert.equal(data.firstSection, 'stem-branch', 'common structural terms come first');
          assert.ok(data.genderText, 'dedicated gender-tradition section');
          if (locale === 'en') {
            assert.match(data.title, /Men and Women/);
            assert.match(data.genderText, /For men[\s\S]*Wealth stars[\s\S]*For women[\s\S]*Officer[\s\S]*Seven Killings/);
            assert.match(data.genderText, /historical gender roles/);
            assert.match(data.genderText, /Neither convention supplies scientific evidence/);
          } else {
            assert.match(data.title, /男女/);
            assert.match(data.genderText, /男命[\s\S]*财星[\s\S]*女命[\s\S]*官[\s\S]*杀/);
            assert.match(data.genderText, /历史|旧式/);
            assert.match(data.genderText, /科学证据/);
          }
        }
      } else {
        assertExactCard(data, card, locale);
        checkCanonical(data.canonical, genericCardPath(locale));
      }
      report.ssr.push({ kind, pillar: card.pillar, slug: card.slug, locale, route, canonical: data.canonical, links: kind === 'article' ? data.cardLinks : data.articleLinks, modified: data.modified, sharedLabel: data.sharedLabel, sharedNote: data.sharedNote });
    }));
    console.log(`SSR complete: ${report.ssr.length}/${matrix.length} routes`);
    await pool(cards, 6, card => check(`asset ${card.slug}`, async () => {
      const response = await ssr.request.get(`${base}/archetypes/${card.slug}.jpg?v=20260914-new`);
      assert.equal(response.status(), 200); assert.match(response.headers()['content-type'], /image/);
      report.images.push({ pillar: card.pillar, slug: card.slug, status: response.status(), bytes: (await response.body()).length });
    }));
    for (const locale of locales) await check(`no-JavaScript ${locale}`, async () => {
      const page = await ssr.newPage();
      try {
        await goto(page, articlePath(ding, locale));
        await page.locator('[data-pillar-card-link]').click();
        await page.waitForURL(base + cardPath(ding, locale));
        await assertBrowserCard(page, ding, locale);
        await page.locator('[data-pillar-article-link]').click();
        await page.waitForURL(base + articlePath(ding, locale));
        assert.equal(await page.locator('main').getAttribute('lang'), languageTags[locale]);
        await page.goBack({ waitUntil: 'load' });
        await assertBrowserCard(page, ding, locale);
        report.noJavaScript.push({ locale, article: articlePath(ding, locale), card: cardPath(ding, locale), reciprocalClick: true, back: true });
      } finally { await page.close(); }
    });
    await ssr.close();

    const context = await browser.newContext({ reducedMotion: 'reduce' });
    await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
    const viewports = [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 1440, height: 900 }];
    for (const viewport of viewports) for (const locale of locales) await check(`browser ${locale}/${viewport.width}`, async () => {
      const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.setViewportSize(viewport);
      try {
        await goto(page, articlePath(ding, locale));
        const articleView = await viewChecks(page);
        assert.equal(articleView.overflow, false); assert.deepEqual(articleView.brokenImages, []);
        assert.ok(articleView.tocTargets.length); assert.ok(articleView.tocTargets.every(t => t.targets === 1), 'each TOC target is unique');
        if (['zh', 'en'].includes(locale)) {
          await screenshot(page, `ding-you-${locale}-${viewport.width}`);
          if (viewport.width === 390) {
            await screenshot(page, `ding-you-${locale}-${viewport.width}-gender-tradition`, '#gender-tradition');
            await screenshot(page, `ding-you-${locale}-${viewport.width}-card-link`, 'div[class*="articleAction"]');
          }
        }
        const toc = page.locator('aside nav a[href^="#"]').first(); const target = await toc.getAttribute('href');
        await toc.click();
        const box = await page.locator(target).boundingBox();
        assert.ok(box && box.y >= -1 && box.y < viewport.height, 'TOC moves to the target');
        await page.locator('[data-pillar-card-link]').click();
        await page.waitForURL(base + cardPath(ding, locale));
        await assertBrowserCard(page, ding, locale);
        const cardView = await viewChecks(page);
        assert.equal(cardView.overflow, false); assert.deepEqual(cardView.brokenImages, []);
        if (viewport.width === 390) {
          await page.locator('[data-tilted], [data-card-artwork]').first().scrollIntoViewIfNeeded();
          await screenshot(page, `ding-you-card-${locale}-${viewport.width}`);
        }
        if (['en', 'zh'].includes(locale)) {
          const tilt = page.locator('button[aria-pressed]');
          assert.equal(await tilt.getAttribute('aria-pressed'), 'false'); await tilt.click();
          assert.equal(await tilt.getAttribute('aria-pressed'), 'true');
          assert.equal(await page.locator('[data-tilted]').getAttribute('data-tilted'), 'true');
          await tilt.click(); assert.equal(await tilt.getAttribute('aria-pressed'), 'false');
        } else {
          const originalURL = page.url(); await page.locator('[data-card-artwork]').click();
          await page.locator('dialog[open]').waitFor();
          assert.equal(page.url(), originalURL, 'enlarging keeps the public route');
          const dialogView = await viewChecks(page); assert.equal(dialogView.overflow, false);
          await page.goBack(); await page.locator('dialog[open]').waitFor({ state: 'hidden' });
          assert.equal(page.url(), originalURL, 'Back closes the enlarged artwork');
          await page.locator('[data-card-artwork]').click(); await page.locator('dialog[open]').waitFor();
          await page.keyboard.press('Escape'); await page.locator('dialog[open]').waitFor({ state: 'hidden' });
        }
        await page.locator('[data-pillar-article-link]').click();
        await page.waitForURL(base + articlePath(ding, locale));
        await page.goBack({ waitUntil: 'networkidle' }); await assertBrowserCard(page, ding, locale);
        assert.deepEqual(errors, [], 'no runtime page errors');
        report.views.push({ locale, viewport, article: articleView, card: cardView, runtimeErrors: errors, reciprocalClick: true, back: true, interaction: ['en', 'zh'].includes(locale) ? 'tilt and reset' : 'enlarge, Back close and Escape close' });
      } finally { await page.close(); }
    });

    for (const locale of locales) await check(`locale switch ${locale}`, async () => {
      const page = await context.newPage(); await page.setViewportSize({ width: 390, height: 844 });
      try {
        const switched = [];
        for (const targetLocale of locales) {
          await goto(page, articlePath(ding, locale));
          await page.locator(`header nav a[lang="${languageTags[targetLocale]}"]`).click();
          await page.waitForURL(base + articlePath(ding, targetLocale));
          assert.equal(await page.locator('[data-pillar-card-link]').getAttribute('href'), cardPath(ding, targetLocale));
          assert.equal(await page.locator('main').getAttribute('lang'), languageTags[targetLocale]);
          checkCanonical(await page.locator('link[rel="canonical"]').getAttribute('href'), articlePath(ding, targetLocale));
          switched.push(targetLocale);
        }
        await goto(page, cardPath(ding, locale));
        const cardTargets = ['en', 'zh'].includes(locale) ? ['en', 'zh'] : locales;
        for (const targetLocale of cardTargets) {
          const pathName = new URL(page.url()).pathname;
          const target = page.locator(`header a[href="${pathName}?${targetLocale === 'en' ? '' : `locale=${targetLocale}&`}pillar=${ding.slug}"]`);
          assert.equal(await target.count(), 1, `${locale} -> ${targetLocale} preserves selected card`);
          const targetHref = await target.getAttribute('href');
          await target.click();
          await page.waitForURL(base + targetHref);
          await page.waitForFunction(lang => document.querySelector('main')?.getAttribute('lang') === lang, languageTags[targetLocale]);
          await page.waitForLoadState('networkidle');
          assert.equal(new URL(page.url()).searchParams.get('pillar'), ding.slug);
          await assertBrowserCard(page, ding, targetLocale);
          const expectedCanonical = `${pathName}${targetLocale === 'en' ? '' : `?locale=${targetLocale}`}`;
          checkCanonical(await page.locator('link[rel="canonical"]').getAttribute('href'), expectedCanonical);
        }
        report.flows.push({ name: 'language switching', from: locale, articleTargets: switched, cardTargets, selectedPillarRetained: true, canonicalLocalized: true });
      } finally { await page.close(); }
    });
    for (const locale of locales) await check(`calculator ${locale}`, async () => {
      const page = await context.newPage();
      try {
        const route = `/discover${locale === 'en' ? '' : `?locale=${locale}`}`;
        await goto(page, route);
        assert.equal(await page.locator('[data-pillar-article-link]').count(), 0, 'finder starts without a phantom result');
        await page.locator('#discovery-birthday').fill('1982-03-21');
        await page.locator('#find-your-card form button[type="submit"]').click();
        await page.locator('[data-pillar-article-link="癸卯"]').waitFor();
        await assertBrowserCard(page, cards.find(c => c.slug === 'gui_mao'), locale);
        assert.equal(await page.locator('#discovery-error').count(), 0);
        const publicQuery = new URL(page.url()).searchParams;
        assert.equal(publicQuery.get('pillar'), 'gui_mao');
        assert.ok([...publicQuery.keys()].every(key => ['locale', 'pillar'].includes(key)), 'calculation URL contains only public card and locale');
        assert.ok(!page.url().includes('1982'), 'birth date is absent from URL');
        await page.locator('#discovery-birthday').fill('2100-01-01');
        await page.locator('#find-your-card form button[type="submit"]').click();
        await page.locator('#discovery-error').waitFor();
        assert.equal(await page.locator('[data-pillar-article-link]').count(), 0, 'invalid future date removes the previous result');
        await goto(page, `/discover?${locale === 'en' ? '' : `locale=${locale}&`}pillar=not_a_pillar`);
        assert.equal(await page.locator('[data-pillar-article-link]').count(), 0, 'invalid card slug does not preload a phantom card');
        assert.equal(await page.locator('[data-card-artwork]').count(), 0);
        if (['en', 'zh'].includes(locale)) {
          await goto(page, `/day-pillar?${locale === 'en' ? '' : `locale=${locale}&`}pillar=not_a_pillar`);
          assert.equal(await page.locator('[data-pillar-article-link]').getAttribute('data-pillar-article-link'), '癸卯', 'illustrated route retains its existing Gui Mao sample fallback');
          assert.ok(await page.locator('section[aria-label]').filter({ has: page.locator('[data-tilted]') }).getAttribute('aria-label'));
          assert.equal(new URL(await page.locator('header a[lang="en"]').getAttribute('href'), base).searchParams.has('pillar'), false, 'invalid selection is not carried across languages');
        }
        report.flows.push({ name: 'birthday calculator and invalid slug', locale, validDate: '1982-03-21', expectedPillar: '癸卯', expectedSlug: 'gui_mao', invalidFutureDate: '2100-01-01', invalidSlugRejected: true });
      } finally { await page.close(); }
    });
    await check('recalculated discovery card survives locale switch', async () => {
      const page = await context.newPage();
      try {
        await goto(page, '/discover?locale=ru&pillar=ding_you');
        assert.equal(await page.locator('p[class*="handoffNote"]').count(), 0);
        await page.locator('#discovery-birthday').fill('1982-03-21');
        await page.locator('#find-your-card form button[type="submit"]').click();
        await page.locator('[data-pillar-article-link="癸卯"]').waitFor();
        assert.equal(new URL(page.url()).searchParams.get('pillar'), 'gui_mao');
        const languageLink = page.locator('header a[href="/discover?locale=zh-TW&pillar=gui_mao"]');
        await languageLink.waitFor(); await languageLink.click();
        await page.waitForURL(base + '/discover?locale=zh-TW&pillar=gui_mao');
        await assertBrowserCard(page, cards.find(c => c.slug === 'gui_mao'), 'zh-TW');
        const publicQuery = new URL(page.url()).searchParams;
        assert.ok([...publicQuery.keys()].every(key => ['locale', 'pillar'].includes(key)));
        assert.ok(!page.url().includes('1982') && !page.url().includes('ding_you'));
        assert.equal(await page.locator('p[class*="handoffNote"]').count(), 0, 'new locale reload does not claim to retain a birth date');
        assert.equal(await page.locator('#find-your-card div[aria-live] > p').first().textContent(), expectedShared['zh-TW']);
        report.flows.push({ name: 'recalculation followed by locale switch', start: '/discover?locale=ru&pillar=ding_you', date: '1982-03-21', target: '/discover?locale=zh-TW&pillar=gui_mao', selectedPillarRetained: true, birthDateAbsentFromURL: true, stalePillarAbsent: true, noDateHandoffAbsent: true });
      } finally { await page.close(); }
    });
    await context.close();
  } finally {
    await browser.close();
    report.finishedAt = new Date().toISOString();
    report.ssr.sort((a, b) => a.route.localeCompare(b.route));
    report.images.sort((a, b) => a.slug.localeCompare(b.slug));
    report.passed = report.errors.length === 0 && report.ssr.length === 480 && report.images.length === 60 && report.views.length === 12 && report.noJavaScript.length === 4 && report.flows.length === 9;
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  }
  console.log(`${report.passed ? 'PASS' : 'FAIL'}: ${report.ssr.length}/480 SSR routes, ${report.images.length}/60 assets, ${report.noJavaScript.length}/4 no-JavaScript flows, ${report.views.length}/12 viewport cases, ${report.flows.length}/9 locale/calculator cases, ${report.errors.length} failures. Report: ${path.join(out, 'report.json')}`);
  if (!report.passed) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
