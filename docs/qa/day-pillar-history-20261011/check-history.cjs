/* Run against an existing production build, without changing dependencies:
 * BASE_URL=http://127.0.0.1:3050 node docs/qa/day-pillar-history-20261011/check-history.cjs
 * Optional OUT_DIR keeps later deployment evidence outside the checkout.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('/opt/codex/cua_node/lib/node_modules/playwright');

const root = path.resolve(__dirname, '../../..');
const base = (process.env.BASE_URL || 'http://127.0.0.1:3050').replace(/\/$/, '');
const out = process.env.OUT_DIR || path.join(__dirname, 'production');
const names = JSON.parse(fs.readFileSync(path.join(root, 'lib/compatibility/animal-names.json'), 'utf8'));
const cardPath = (locale, slug) => `/day-pillar?${locale === 'zh' ? 'locale=zh&' : ''}pillar=${slug}`;
const canonicalPath = locale => `/day-pillar${locale === 'zh' ? '?locale=zh' : ''}`;
const report = { base, commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), startedAt: new Date().toISOString(), flows: [], errors: [], screenshots: [] };
const routeOf = url => { const parsed = new URL(url); return parsed.pathname + parsed.search; };

async function snapshot(page, stage, locale, pillar, slug) {
  await page.waitForFunction(({ pillar, slug }) => {
    const link = document.querySelector('[data-pillar-article-link]');
    const image = document.querySelector('main img');
    return link?.getAttribute('data-pillar-article-link') === pillar && image?.getAttribute('src')?.includes(`${slug}.jpg`) && image.complete && image.naturalWidth > 0;
  }, { pillar, slug });
  const data = await page.evaluate(() => ({
    url: location.pathname + location.search, lang: document.querySelector('main')?.getAttribute('lang'),
    cardTitle: document.querySelector('#day-card-title')?.textContent,
    canonical: document.querySelector('link[rel="canonical"]')?.href,
    article: { pillar: document.querySelector('[data-pillar-article-link]')?.getAttribute('data-pillar-article-link'), href: document.querySelector('[data-pillar-article-link]')?.getAttribute('href') },
    languages: [...document.querySelectorAll('header a[lang]')].map(a => ({ lang: a.lang, href: a.getAttribute('href'), current: a.getAttribute('aria-current') })),
    image: { src: document.querySelector('main img')?.getAttribute('src'), alt: document.querySelector('main img')?.alt },
    date: document.querySelector('#day-pillar-date')?.value,
    historyLength: history.length, historyState: history.state,
    localStorage: { ...localStorage }, sessionStorage: { ...sessionStorage },
    viewportWidth: innerWidth, documentWidth: document.documentElement.scrollWidth,
  }));
  assert.equal(data.url, cardPath(locale, slug), `${stage}: controlled current-card URL`);
  assert.equal(data.lang, locale === 'zh' ? 'zh-Hans' : 'en');
  assert.equal(data.cardTitle, names[pillar][locale]);
  assert.equal(routeOf(data.canonical), canonicalPath(locale), `${stage}: canonical remains the current locale's generic tool URL`);
  assert.equal(new URL(data.canonical).origin, 'https://www.destinypixel.com');
  assert.deepEqual(data.article, { pillar, href: `/journal/${slug.replace('_', '-')}-day-pillar${locale === 'zh' ? '?locale=zh' : ''}` });
  for (const link of data.languages) {
    const targetLocale = link.lang === 'en' ? 'en' : 'zh';
    assert.equal(link.href, cardPath(targetLocale, slug));
    assert.equal(link.current, targetLocale === locale ? 'page' : null);
  }
  assert.ok(data.image.src.includes(`${slug}.jpg`));
  assert.ok(data.image.alt.includes(names[pillar][locale]));
  assert.ok(data.documentWidth <= data.viewportWidth + 1, `${stage}: no horizontal overflow`);
  assert.ok(!JSON.stringify({ url: data.url, historyState: data.historyState, localStorage: data.localStorage, sessionStorage: data.sessionStorage }).includes('2000-01-01'), `${stage}: birth date absent from URL/history state/storage`);
  assert.deepEqual(data.localStorage, {});
  assert.deepEqual(data.sessionStorage, {});
  return { stage, ...data };
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    for (const width of [320, 390, 1440]) for (const locale of ['en', 'zh']) {
      const context = await browser.newContext({ viewport: { width, height: width === 320 ? 740 : width === 390 ? 844 : 900 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const runtimeErrors = [];
      const requests = [];
      page.on('pageerror', e => runtimeErrors.push(e.message));
      page.on('request', request => requests.push({ method: request.method(), url: request.url(), body: request.postData() }));
      const flow = { width, locale, stages: [], invalid: [], requests: [] };
      try {
        await page.goto(base + cardPath(locale, 'ding_you'), { waitUntil: 'networkidle' });
        flow.stages.push(await snapshot(page, 'initial shared Ding You', locale, '丁酉', 'ding_you'));
        const initialHistoryLength = flow.stages[0].historyLength;
        for (const invalidDate of ['', '1799-01-01', '2100-12-31']) {
          await page.locator('#day-pillar-date').fill(invalidDate);
          await page.locator('form button[type="submit"]').click();
          await page.locator('#day-pillar-error').waitFor();
          assert.equal(routeOf(page.url()), cardPath(locale, 'ding_you'));
          assert.equal(await page.evaluate(() => history.length), initialHistoryLength);
          assert.equal(await page.locator('[data-pillar-article-link]').getAttribute('data-pillar-article-link'), '丁酉');
          flow.invalid.push({ date: invalidDate, message: await page.locator('#day-pillar-error').textContent(), url: routeOf(page.url()), historyLength: initialHistoryLength });
        }
        await page.locator('#day-pillar-date').fill('2000-01-01');
        await page.locator('form button[type="submit"]').click();
        await page.waitForURL(base + cardPath(locale, 'wu_wu'));
        const calculated = await snapshot(page, 'calculated Wu Wu', locale, '戊午', 'wu_wu');
        assert.equal(calculated.historyLength, initialHistoryLength, 'calculation replaces the existing history entry');
        assert.equal(calculated.date, '2000-01-01', 'input retained during the current calculation');
        flow.stages.push(calculated);
        await page.locator('form button[type="submit"]').click();
        assert.equal(await page.evaluate(() => history.length), initialHistoryLength, 'repeated calculation adds no entry');
        const screenshot = `${locale}-${width}-calculated-wu-wu.png`;
        await page.screenshot({ path: path.join(out, screenshot), fullPage: true });
        report.screenshots.push(screenshot);
        const otherLocale = locale === 'en' ? 'zh' : 'en';
        await page.locator(`header a[lang="${otherLocale === 'zh' ? 'zh-Hans' : 'en'}"]`).click();
        await page.waitForURL(base + cardPath(otherLocale, 'wu_wu'));
        const switched = await snapshot(page, 'language switch keeps Wu Wu', otherLocale, '戊午', 'wu_wu');
        assert.equal(switched.historyLength, initialHistoryLength + 1, 'language document navigation adds exactly one entry');
        flow.stages.push(switched);
        await page.goBack({ waitUntil: 'domcontentloaded' });
        const back = await snapshot(page, 'Back keeps Wu Wu in original language', locale, '戊午', 'wu_wu');
        assert.equal(back.historyLength, initialHistoryLength + 1);
        flow.stages.push(back);
        await page.goForward({ waitUntil: 'domcontentloaded' });
        const forward = await snapshot(page, 'Forward keeps Wu Wu in switched language', otherLocale, '戊午', 'wu_wu');
        assert.equal(forward.historyLength, initialHistoryLength + 1);
        flow.stages.push(forward);
        await page.reload({ waitUntil: 'networkidle' });
        const reloaded = await snapshot(page, 'reload reconstructs Wu Wu without a birth date', otherLocale, '戊午', 'wu_wu');
        assert.equal(reloaded.date, '');
        assert.equal(reloaded.historyLength, initialHistoryLength + 1);
        flow.stages.push(reloaded);
        assert.deepEqual(runtimeErrors, []);
        assert.ok(!JSON.stringify(requests).includes('2000-01-01'), 'birth date is never in a network request');
        assert.ok(!requests.some(r => /\/api\//.test(new URL(r.url).pathname)), 'no API/AI endpoint is triggered');
        flow.requests = requests.filter(r => r.method !== 'GET');
        flow.runtimeErrors = runtimeErrors;
        flow.status = 'passed';
      } catch (error) {
        flow.status = 'failed';
        report.errors.push({ width, locale, error: error.stack || String(error) });
      } finally {
        report.flows.push(flow);
        await context.close();
      }
    }
  } finally {
    await browser.close();
    report.finishedAt = new Date().toISOString();
    report.status = report.errors.length ? 'failed' : 'passed';
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  }
  console.log(JSON.stringify({ status: report.status, flows: report.flows.length, errors: report.errors, out }, null, 2));
  if (report.errors.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
