const { chromium, expect } = require('/Users/lee/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const base = process.env.QA_BASE || 'http://127.0.0.1:3048';
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Only local QA is authorized');
const out = process.env.QA_OUT || __dirname;
fs.mkdirSync(out, { recursive: true });
const report = { scope: 'Local Next.js page, actual Chrome desktop and emulated touch viewport; not physical-phone or public deployment verification', base, started: new Date().toISOString(), cases: [], screenshots: [], unexpectedConsole: [], pageErrors: [], failedRequests: [], knownLocalTelemetry: [], blocked: [], failures: [] };
let browser;
const check = (view, name, extra = {}) => report.cases.push({ view, name, passed: true, ...extra });
async function overflow(page, view, state) {
  const result = await page.evaluate(() => ({ width: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  assert(result.document <= result.width && result.body <= result.width, `${view} ${state} horizontal overflow ${JSON.stringify(result)}`);
  check(view, `${state}: no horizontal overflow`, result);
}
async function shot(page, name) { await page.screenshot({ path: path.join(out, name), fullPage: true }); report.screenshots.push(name); }
async function click(page, name, mobile, exact = false) {
  const button = page.getByRole('button', { name, exact });
  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();
  if (mobile) await button.tap(); else await button.click();
}
async function source(page, view, mobile) {
  await click(page, /缘起与来源/, mobile);
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('非正式官方博物馆');
  await expect(dialog.getByRole('link')).toHaveCount(3);
  const links = await dialog.getByRole('link').evaluateAll(links => links.map(a => ({ href: a.href, rel: a.rel, target: a.target })));
  assert(links.every(a => /^https:/.test(a.href) && a.rel.includes('noreferrer') && a.target === '_blank'));
  await page.keyboard.press('Tab');
  assert(await dialog.evaluate(d => d.contains(document.activeElement)), 'Dialog focus must remain contained');
  await overflow(page, view, 'source dialog');
  await shot(page, `${view}-sources.png`);
  await page.keyboard.press('Escape'); await expect(dialog).not.toBeVisible();
  await click(page, /缘起与来源/, mobile); await click(page, '关闭来源说明', mobile, true); await expect(dialog).not.toBeVisible();
  await click(page, /史实与创作说明/, mobile); await click(page, '回到书坊', mobile); await expect(dialog).not.toBeVisible();
  check(view, 'Sources: visible disclaimer, three secure links, modal focus, Escape/close/return controls', { links });
}
async function journey({ view, width, height, mobile }) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, acceptDownloads: true });
  await context.route('**/*', route => {
    const req = route.request(); const url = new URL(req.url());
    if (url.origin !== new URL(base).origin || !['GET', 'HEAD'].includes(req.method()) || /\/_vercel\//.test(url.pathname)) {
      report.blocked.push({ view, url: req.url(), method: req.method() }); return route.abort();
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', err => report.pageErrors.push({ view, error: err.message }));
  page.on('console', msg => { if (msg.type() === 'error' && !/net::ERR_FAILED|net::ERR_BLOCKED_BY_CLIENT/.test(msg.text())) report.unexpectedConsole.push({ view, text: msg.text() }); });
  page.on('response', response => { if (response.status() >= 400) { const url = response.url(); (/\/_vercel\//.test(url) ? report.knownLocalTelemetry : report.failedRequests).push({ view, url, status: response.status() }); } });
  const response = await page.goto(`${base}/zhongyi1`, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  await expect(page).toHaveTitle('燕赵本草长卷 · 一部书的旅行');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex.*nofollow/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect.poll(() => page.getByAltText('青绿山水窗景、古籍与青瓷相伴的想象书坊').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  await overflow(page, view, 'entrance'); await shot(page, `${view}-entrance.png`);
  check(view, 'Entrance loads artwork, cultural boundary, localized title and noindex');
  await source(page, view, mobile);
  await click(page, '开启音效', mobile, true); await expect(page.getByRole('button', { name: '关闭音效', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await click(page, '关闭音效', mobile, true); await expect(page.getByRole('button', { name: '开启音效', exact: true })).toHaveAttribute('aria-pressed', 'false');
  check(view, 'Sound defaults muted and both toggle directions work');
  await click(page, /开始「一部书的旅行」/, mobile);
  await expect(page.getByRole('button', { name: /前往校序/ })).toBeDisabled();
  await overflow(page, view, 'collect'); await shot(page, `${view}-collect.png`);
  for (const name of ['本草', '书坊', '山川']) await click(page, `收集${name}书页`, mobile, true);
  await expect(page.getByRole('status')).toContainText('三页已齐');
  await click(page, '前往校序', mobile);
  await expect(page.getByRole('button', { name: /前往刷印/ })).toBeDisabled();
  await click(page, /第1格，放入选中书页/, mobile); await expect(page.getByRole('status')).toContainText('先轻点下方的一页');
  await click(page, '选择本草书页', mobile, true); await click(page, /第1格，放入选中书页/, mobile); await expect(page.getByRole('status')).toContainText('第一页是「山川」');
  await click(page, '选择山川书页', mobile, true); await click(page, /第2格，放入选中书页/, mobile); await expect(page.getByRole('status')).toContainText('从第一格开始');
  for (const [index, name] of ['山川', '本草', '书坊'].entries()) { await click(page, `选择${name}书页`, mobile, true); await click(page, `第${index + 1}格，放入选中书页`, mobile, true); }
  await expect(page.getByRole('status')).toContainText('书页已归序');
  await overflow(page, view, 'arrange'); await shot(page, `${view}-arrange.png`);
  check(view, 'Collect three pages, incomplete state gating, invalid/missing/out-of-order placement feedback, correct tap sequence');
  await click(page, '上一幕', mobile, true); await expect(page.getByRole('status')).toContainText('三页已齐'); await click(page, '前往校序', mobile); await expect(page.getByRole('button', { name: /第3格已放入书坊/ })).toBeVisible();
  check(view, 'Previous scene retains collected and arranged pages');
  await click(page, '前往刷印', mobile); await expect(page.getByRole('button', { name: /前往赏器/ })).toBeDisabled();
  await click(page, /为木版上墨/, mobile); await click(page, /覆上一张宣纸/, mobile);
  for (let i = 0; i < 4; i++) await click(page, new RegExp(`点按刷印（${i}/4）`), mobile);
  await click(page, /轻轻揭起书页/, mobile); await expect(page.getByRole('status')).toContainText('亲手刷印的一页');
  await overflow(page, view, 'print'); await shot(page, `${view}-print.png`);
  check(view, 'Printing completes ink → cover → four tap bands → reveal with gated continue');
  await click(page, '前往赏器', mobile); await expect(page.getByRole('heading', { name: '一抹青釉，盛住草木时光' })).toBeVisible();
  await expect(page.getByRole('button', { name: /领取纪念卡/ })).toBeDisabled();
  for (const name of ['口沿', '釉色', '器足']) await click(page, new RegExp(name + '.*看'), mobile);
  await expect(page.getByRole('button', { name: /领取纪念卡/ })).toBeEnabled();
  await overflow(page, view, 'artifact'); await shot(page, `${view}-artifact.png`);
  await click(page, '领取纪念卡', mobile); await expect(page.getByText('已体验 4 / 4 个章节')).toBeVisible();
  await overflow(page, view, 'keepsake'); await shot(page, `${view}-keepsake.png`);
  check(view, 'All three artifact observations unlock completion and four-chapter keepsake');
  const downloadWait = page.waitForEvent('download'); const card = page.getByRole('link', { name: /收藏文化纪念卡/ }); if (mobile) await card.tap(); else await card.click();
  const download = await downloadWait; const saved = path.join(out, `${view}-downloaded-keepsake.svg`); await download.saveAs(saved);
  const svg = fs.readFileSync(saved, 'utf8'); assert.match(svg, /<svg/); assert.match(svg, /燕赵|本草|書香|书香/); assert(!await download.failure());
  check(view, 'SVG keepsake downloads successfully with artwork markup', { filename: download.suggestedFilename(), bytes: Buffer.byteLength(svg) });
  await click(page, '重新体验', mobile); await expect(page.getByText('已收集 0 / 3')).toBeVisible(); await expect(page.getByRole('button', { name: /前往校序/ })).toBeDisabled();
  await click(page, '跳过本幕', mobile, true); await expect(page.getByText('0 / 3 页归序')).toBeVisible();
  await click(page, '跳过本幕', mobile, true); await expect(page.getByRole('button', { name: /为木版上墨/ })).toBeVisible();
  await click(page, '跳过本幕', mobile, true); await expect(page.getByRole('heading', { name: '一抹青釉，盛住草木时光' })).toBeVisible();
  await click(page, '跳过本幕', mobile, true); await expect(page.getByText('已体验 0 / 4 个章节')).toBeVisible(); await expect(page.getByText('含跳过章节')).toBeVisible();
  check(view, 'Replay clears chapter state; all four skip actions reach honestly labeled incomplete keepsake');
  await click(page, '返回书坊入口', mobile, true); await expect(page.getByRole('button', { name: /开始「一部书的旅行」/ })).toBeVisible();
  await click(page, /开始「一部书的旅行」/, mobile); await click(page, '返回入口', mobile, true); await expect(page.getByRole('button', { name: /开始「一部书的旅行」/ })).toBeVisible();
  check(view, 'Brand and first-scene return controls reach entrance');
  await context.close();
}
(async () => {
  browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-proxy-server'] });
  report.browser = browser.version();
  for (const config of [{view: 'desktop', width: 1440, height: 1000, mobile: false}, {view: 'mobile', width: 390, height: 844, mobile: true}]) {
    try { await journey(config); } catch (err) { report.failures.push({ view: config.view, error: err.stack }); }
  }
  report.passed = !report.failures.length && !report.pageErrors.length && !report.unexpectedConsole.length && !report.failedRequests.length;
})().catch(err => { report.failures.push({ error: err.stack }); report.passed = false; }).finally(async () => {
  if (browser) await browser.close();
  report.finished = new Date().toISOString(); fs.writeFileSync(path.join(out, 'experience-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed: report.passed, checks: report.cases.length, failures: report.failures, pageErrors: report.pageErrors, console: report.unexpectedConsole, requests: report.failedRequests, screenshots: report.screenshots }));
  if (!report.passed) process.exitCode = 1;
});
