import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
function browserRuntime() {
  if (process.env.PLAYWRIGHT_MODULE) return require(process.env.PLAYWRIGHT_MODULE);
  try { return require('playwright/test'); } catch {
    return require('/Users/lee/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/test');
  }
}
const { chromium, expect } = browserRuntime();
const base = (process.argv[2] ?? 'http://127.0.0.1:3047').replace(/\/$/, '');
const output = process.env.QA_EVIDENCE_DIR ?? 'docs/qa/card-search-topics-20261027/local';
mkdirSync(output, { recursive: true });
const executablePath = process.env.CHROMIUM_PATH ?? (existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome') ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/chromium');
const catalog = JSON.parse(readFileSync('lib/tarot-learning/catalog.json', 'utf8'));
const tags = { en: 'en', zh: 'zh-Hans', 'zh-TW': 'zh-Hant', ru: 'ru' };
const suffix = locale => locale === 'en' ? '' : `?locale=${locale}`;
const cards = page => page.locator('article[data-card-id]:visible');
const report = { base, browser: null, search: [], responsive: [], ssr: [], topics: [], tool: [], blockedWrites: [] };
const normalize = value => value.replace(/\s+/g, ' ').trim();
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
report.browser = browser.version();
async function restrictedContext(options = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', ...options });
  await context.route('**/*', route => {
    const request = route.request();
    if (request.method() === 'GET' && new URL(request.url()).origin === new URL(base).origin) return route.continue();
    if (request.method() !== 'GET') report.blockedWrites.push({ method: request.method(), pathname: new URL(request.url()).pathname });
    return route.abort();
  });
  return context;
}
async function checkMetadata(page, path, locale) {
  await expect(page.locator('main')).toHaveAttribute('lang', tags[locale]);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.destinypixel.com${path}${suffix(locale)}`);
  for (const [other, tag] of Object.entries(tags)) {
    await expect(page.locator(`link[rel="alternate"][hreflang="${tag}"]`)).toHaveAttribute('href', `https://www.destinypixel.com${path}${suffix(other)}`);
  }
}
async function search(page, query, expectedIds) {
  await page.locator('#tarot-card-search').fill(query);
  const wanted = [...expectedIds].sort();
  await expect.poll(async () => (await cards(page).evaluateAll(elements => elements.map(element => element.dataset.cardId))).sort()).toEqual(wanted);
  await expect(page.locator('[data-card-search-status]')).toBeVisible();
}
try {
  for (const locale of Object.keys(tags)) {
    const noJS = await restrictedContext({ javaScriptEnabled: false });
    const page = await noJS.newPage();
    const response = await page.goto(`${base}/journal/tarot-cards${suffix(locale)}`);
    assert.equal(response.status(), 200);
    await checkMetadata(page, '/journal/tarot-cards', locale);
    await expect(cards(page)).toHaveCount(78);
    for (const entry of catalog[locale]) {
      const card = page.locator(`article[data-card-id="${entry.cardId}"]`);
      await expect(card.locator('a[href]')).toHaveAttribute('href', `/journal/tarot-${entry.cardId}${suffix(locale)}`);
      await expect(card.locator('dl dt')).toHaveCount(2);
      const copy = normalize(await card.innerText());
      assert.ok(copy.includes(normalize(entry.quickTake.upright)), `${locale}/${entry.cardId}: upright absent from no-JS HTML`);
      assert.ok(copy.includes(normalize(entry.quickTake.reversed)), `${locale}/${entry.cardId}: reversed absent from no-JS HTML`);
    }
    for (const group of ['major', 'wands', 'cups', 'swords', 'pentacles']) {
      await expect(page.locator(`section#${group}`)).toHaveCount(1);
      await expect(page.locator(`a[href="#${group}"]`)).toHaveCount(1);
    }
    assert.match(await page.locator('main').evaluate(element => getComputedStyle(element, '::before').backgroundImage), /twilight-terrace/);
    report.ssr.push({ locale, cardCount: 78, fullGuideLinks: 78, quickTakePairs: 78, fiveAnchors: true, metadata: true, landscape: true });
    await noJS.close();

    const context = await restrictedContext();
    const errors = [];
    context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
    const live = await context.newPage();
    await live.goto(`${base}/journal/tarot-cards${suffix(locale)}`);
    await expect(cards(live)).toHaveCount(78);
    const searchInput = live.locator('#tarot-card-search');
    await expect(searchInput).toHaveAccessibleName(/\S/);
    const fixtures = [
      ['Ace of Pentacles', ['ace-of-pentacles']],
      ['  aCe   OF  pEnTaClEs  ', ['ace-of-pentacles']],
      ['ace pentacles', ['ace-of-pentacles']],
      ['星币一', ['ace-of-pentacles']],
      ['钱币一', ['ace-of-pentacles']],
      ['錢幣王牌', ['ace-of-pentacles']],
      ['星幣二', ['two-of-pentacles']],
      ['权杖一', ['ace-of-wands']],
      ['权杖十', ['ten-of-wands']],
      ['Queen of Swords', ['queen-of-swords']],
      ['Star', ['star']],
      ['星星', ['star']],
      ['Ace', ['ace-of-wands', 'ace-of-cups', 'ace-of-swords', 'ace-of-pentacles']],
      ['王牌', ['ace-of-wands', 'ace-of-cups', 'ace-of-swords', 'ace-of-pentacles']],
      ['coins', catalog.en.filter(card => card.suit === 'pentacles').map(card => card.cardId)],
      ['sunset', []],
      ['palace', []],
      ['someone', []],
      ['nothing-matches-12345', []],
    ];
    for (const [query, expected] of fixtures) await search(live, query, expected);
    const status = normalize(await live.locator('[data-card-search-status]').innerText());
    assert.ok(status.length > 5, 'No-result status must contain useful text');
    await expect(live.locator('[data-clear-card-search]')).toBeVisible();
    await live.locator('[data-clear-card-search]').click();
    await expect(searchInput).toHaveValue('');
    await expect(cards(live)).toHaveCount(78);
    await expect(searchInput).toBeFocused();
    await searchInput.pressSequentially('Ace');
    await expect(cards(live)).toHaveCount(4);
    await searchInput.press('Tab');
    await expect(live.locator('[data-clear-card-search]')).toBeFocused();
    await live.keyboard.press('Enter');
    await expect(cards(live)).toHaveCount(78);
    await search(live, 'Queen of Swords', ['queen-of-swords']);
    const link = live.locator('article[data-card-id="queen-of-swords"] a[href]');
    await link.focus();
    await live.keyboard.press('Enter');
    await live.waitForURL(url => url.pathname === '/journal/tarot-queen-of-swords');
    await expect(live.locator('article[data-tarot-learning="queen-of-swords"]')).toBeVisible();
    await checkMetadata(live, '/journal/tarot-queen-of-swords', locale);
    await live.goBack();
    await live.waitForURL(url => url.pathname === '/journal/tarot-cards');
    await expect(live.locator('#tarot-card-search')).toBeVisible();
    await live.locator('#tarot-card-search').fill('');
    await expect(cards(live)).toHaveCount(78);
    for (const [width, height] of [[320, 568], [390, 844], [1440, 900]]) {
      await live.setViewportSize({ width, height });
      await live.evaluate(() => scrollTo(0, 0));
      assert.ok(await live.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${locale}/${width}: directory overflow`);
      await expect(live.locator('#tarot-card-search')).toBeVisible();
      await live.screenshot({ path: `${output}/${locale}-${width}-directory.png`, fullPage: false });
      await search(live, '钱币一', ['ace-of-pentacles']);
      await live.locator('article[data-card-id="ace-of-pentacles"]').scrollIntoViewIfNeeded();
      assert.ok(await live.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${locale}/${width}: result overflow`);
      await live.screenshot({ path: `${output}/${locale}-${width}-result.png`, fullPage: false });
      await live.locator('[data-clear-card-search]').click();
      report.responsive.push({ locale, width, height, directoryAndResult: true, horizontalOverflow: false });
    }
    const next = locale === 'ru' ? 'en' : 'ru';
    await live.locator(`header a[hreflang="${tags[next]}"]`).click();
    await live.waitForURL(url => next === 'en' ? !url.searchParams.has('locale') : url.searchParams.get('locale') === next);
    await checkMetadata(live, '/journal/tarot-cards', next);
    await expect(cards(live)).toHaveCount(78);
    await live.goBack();
    await checkMetadata(live, '/journal/tarot-cards', locale);
    assert.deepEqual(errors, []);
    report.search.push({ locale, fixtureCount: fixtures.length, clearAndKeyboard: true, guideLinkAndBack: true, languageSwitchAndBack: true, pageErrors: errors });
    await context.close();

    const topicContext = await restrictedContext({ javaScriptEnabled: false });
    const topicPage = await topicContext.newPage();
    await topicPage.goto(`${base}/journal?${locale === 'en' ? '' : `locale=${locale}&`}topic=tarot-history`);
    await expect(topicPage.locator('[data-topic-results] [data-topic-result]')).toHaveCount(2);
    await expect(topicPage.locator('[data-topic-filter] a[aria-current]')).toHaveAttribute('href', /topic=tarot-history/);
    await expect(topicPage.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.destinypixel.com/journal${suffix(locale)}`);
    if (['en', 'zh'].includes(locale)) {
      for (const [width, height] of [[390, 844], [1440, 900]]) {
        await topicPage.setViewportSize({ width, height });
        await topicPage.locator('[data-topic-filter]').scrollIntoViewIfNeeded();
        assert.ok(await topicPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${locale}/${width}: topic filter overflow`);
        await topicPage.screenshot({ path: `${output}/${locale}-${width}-topic-filter.png` });
      }
    }
    const otherLocale = locale === 'ru' ? 'zh' : 'ru';
    await topicPage.locator(`header a[hreflang="${tags[otherLocale]}"]`).click();
    await expect(topicPage).toHaveURL(/topic=tarot-history/);
    await expect(topicPage.locator('main')).toHaveAttribute('lang', tags[otherLocale]);
    await expect(topicPage.locator('[data-topic-result]')).toHaveCount(2);
    await topicPage.goBack();
    await topicPage.locator('[data-topic-clear]').click();
    await expect(topicPage).not.toHaveURL(/topic=/);
    await expect(topicPage.locator('[data-topic-clear]')).toHaveAttribute('aria-current', 'page');
    await expect(topicPage.locator('#tarot-education')).toBeVisible();
    await topicPage.goto(`${base}/journal/how-to-read-three-card-tarot${suffix(locale)}`);
    await expect(topicPage.locator('[data-article-topics] a[href]')).not.toHaveCount(0);
    await expect(topicPage.locator('[data-topic-related] a[href]')).not.toHaveCount(0);
    if (['en', 'zh'].includes(locale)) {
      for (const [width, height] of [[390, 844], [1440, 900]]) {
        await topicPage.setViewportSize({ width, height });
        await topicPage.locator('[data-article-topics]').scrollIntoViewIfNeeded();
        assert.ok(await topicPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${locale}/${width}: article tags overflow`);
        await topicPage.screenshot({ path: `${output}/${locale}-${width}-article-tags.png` });
      }
    }
    const topicLink = topicPage.locator('[data-article-topics] a[href*="topic=tarot-reading"]').first();
    await expect(topicLink).toBeVisible();
    await topicLink.focus();
    await topicPage.keyboard.press('Enter');
    await expect(topicPage).toHaveURL(/topic=tarot-reading/);
    assert.ok(await topicPage.locator('[data-topic-result]').count() > 0);
    await topicPage.goBack();
    await expect(topicPage.locator('[data-article-topics]')).toBeVisible();
    for (const slug of ['tarot-sun', 'hexagram-01', 'jia-zi-day-pillar']) {
      const res = await topicPage.goto(`${base}/journal/${slug}${suffix(locale)}`);
      assert.equal(res.status(), 200, slug);
      await expect(topicPage.locator('[data-article-topics] a[href]')).not.toHaveCount(0);
    }
    assert.ok(await topicPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${locale}: article topics overflow`);
    if (locale === 'en') {
      for (const path of ['/learn/what-is-bazi-birth-chart', '/learn/chinese-palm-reading-vs-western']) {
        const response = await topicPage.goto(base + path);
        assert.equal(response.status(), 200, path);
        await expect(topicPage.locator('[data-article-topics] a[href]')).not.toHaveCount(0);
        await expect(topicPage.locator('[data-article-topics] a[href]').first()).toHaveAttribute('href', /\/journal\?topic=/);
      }
      await topicPage.goto(`${base}/journal?topic=palmistry`);
      await expect(topicPage.locator('[data-topic-result]')).toHaveCount(1);
      await expect(topicPage.locator('[data-topic-result] h2 a')).toHaveAttribute('href', '/learn/chinese-palm-reading-vs-western');
      await topicPage.locator('header a[hreflang="ru"]').click();
      await expect(topicPage).not.toHaveURL(/topic=/);
      await expect(topicPage.locator('[data-topic-results]')).toHaveCount(0);
      await expect(topicPage.locator('[data-topic-clear]')).toHaveAttribute('aria-current', 'page');
    }
    report.topics.push({ locale, noJSFiltering: true, knownHistoryResults: 2, languagePreservesFilter: true, clear: true, articleTagsAndRelated: true, tagKeyboardAndBack: true, standaloneGuides: locale === 'en' ? 2 : 0 });
    await topicContext.close();
  }

  for (const locale of ['en', 'zh']) {
    const context = await restrictedContext();
    const page = await context.newPage();
    await page.goto(`${base}/tarot${suffix(locale)}`);
    await expect(page.locator('#table')).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('.tarot-fan-choice')).toHaveCount(6);
    await page.locator('.tarot-bottom-deck .cel-button').click();
    const draw = page.locator('.tarot-draw-action');
    await expect(draw).toBeEnabled();
    await draw.press('Enter');
    await expect(page.locator('#tarot-board .tarot-flipper')).toHaveCount(1);
    await page.screenshot({ path: `${output}/${locale}-tool-smoke.png` });
    report.tool.push({ locale, deckReady: true, sixFanChoices: true, keyboardDraw: true });
    await context.close();
  }
  report.status = 'passed';
  console.log(`PASS: 4 language SSR directories; search aliases, no-result, clear, keyboard, guide + Back; 12 viewport states; 4 no-JS topic flows; 2 tool smoke flows.`);
} catch (error) {
  report.status = 'failed';
  report.error = error.stack;
  throw error;
} finally {
  await browser.close();
  writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
}
