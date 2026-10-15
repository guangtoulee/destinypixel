const { chromium, expect } = require('/Users/lee/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.QA_BASE || 'http://127.0.0.1:3050';
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
const out = process.env.QA_OUT || path.join(__dirname, 'production-local'); fs.mkdirSync(out, { recursive: true });
const report = { base, scope: 'Focused local-production repair verification; controlled artwork failure before and after hydration', cases: [], failures: [], pageErrors: [] };
let browser;
(async () => {
  browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-proxy-server'] });
  for (const timing of ['before-hydration', 'after-hydration']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await context.route('**/*', route => {
      const r = route.request(), u = new URL(r.url());
      return u.origin === new URL(base).origin && ['GET', 'HEAD'].includes(r.method()) && !/\/_vercel\//.test(u.pathname) ? route.continue() : route.abort();
    });
    let release; const gate = new Promise(r => release = r);
    await context.route('**/zhongyi1/bookshop*.webp', async route => { if (timing === 'after-hydration') await gate; await route.abort('failed'); });
    const page = await context.newPage(); page.on('pageerror', e => report.pageErrors.push({ timing, message: e.message }));
    await page.goto(`${base}/zhongyi1`, { waitUntil: 'domcontentloaded' }); await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    if (timing === 'after-hydration') release();
    const img = page.getByAltText('青绿山水窗景、古籍与青瓷相伴的想象书坊');
    await expect.poll(() => img.evaluate(i => ({ complete: i.complete, naturalWidth: i.naturalWidth, display: getComputedStyle(i.parentElement).display }))).toEqual({ complete: true, naturalWidth: 0, display: 'none' });
    const result = await img.evaluate(i => ({ complete: i.complete, naturalWidth: i.naturalWidth, pictureDisplay: getComputedStyle(i.parentElement).display, heroClass: i.closest('section').className, heroBackground: getComputedStyle(i.closest('section')).backgroundImage }));
    assert(result.heroClass.includes('heroFallback')); assert.notEqual(result.heroBackground, 'none');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: path.join(out, `mobile-image-fallback-fixed-${timing}.png`) });
    await page.getByRole('button', { name: /开始「一部书的旅行」/ }).tap(); await expect(page.getByRole('button', { name: '收集山川书页', exact: true })).toBeVisible();
    report.cases.push({ timing, passed: true, ...result, startUsable: true }); await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await context.route('**/*', route => {
    const r = route.request(), u = new URL(r.url());
    return u.origin === new URL(base).origin && ['GET', 'HEAD'].includes(r.method()) && !/\/_vercel\//.test(u.pathname) ? route.continue() : route.abort();
  });
  const page = await context.newPage(); page.on('pageerror', e => report.pageErrors.push({ timing: 'normal-smoke', message: e.message }));
  await page.goto(`${base}/zhongyi1`, { waitUntil: 'networkidle' });
  await expect.poll(() => page.getByAltText('青绿山水窗景、古籍与青瓷相伴的想象书坊').evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true);
  await page.screenshot({ path: path.join(out, 'mobile-entrance.png'), fullPage: true });
  await page.getByRole('button', { name: /开始「一部书的旅行」/ }).tap();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: '跳过本幕', exact: true }).tap();
  await expect(page.getByRole('heading', { name: '一抹青釉，盛住草木时光' })).toBeVisible();
  for (const name of ['口沿', '釉色', '器足']) await page.getByRole('button', { name: new RegExp(name + '.*看') }).tap();
  await page.getByRole('button', { name: '领取纪念卡' }).tap(); await expect(page.getByText('已体验 1 / 4 个章节')).toBeVisible();
  await page.getByRole('button', { name: '重新体验' }).tap(); await expect(page.getByText('已收集 0 / 3')).toBeVisible();
  report.cases.push({ timing: 'normal-smoke', passed: true, flow: 'normal artwork loads → start → skip first three scenes → three artifact hotspots → keepsake honestly records 1/4 → replay resets collection' });
  await context.close();
})().catch(e => report.failures.push(e.stack)).finally(async () => {
  if (browser) await browser.close(); report.passed = !report.failures.length && !report.pageErrors.length;
  fs.writeFileSync(path.join(out, 'fallback-fix-report.json'), JSON.stringify(report, null, 2)); console.log(JSON.stringify(report)); if (!report.passed) process.exitCode = 1;
});
