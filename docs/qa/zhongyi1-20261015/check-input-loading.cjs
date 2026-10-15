const { chromium, expect } = require('/Users/lee/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.QA_BASE || 'http://127.0.0.1:3048';
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
const out = process.env.QA_OUT || __dirname;
const report = { scope: 'Local Chrome only. Actual CDP touch input, intentional image-delay/failure fixtures, reduced-motion narrow viewport.', cases: [], pageErrors: [], failures: [] };
let browser;
const passed = name => report.cases.push({ name, passed: true });
async function makeContext(width = 390, height = 844) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: width < 900, hasTouch: width < 900, reducedMotion: 'reduce' });
  await context.route('**/*', route => {
    const r = route.request(), url = new URL(r.url());
    if (url.origin !== new URL(base).origin || !['GET', 'HEAD'].includes(r.method()) || /\/_vercel\//.test(url.pathname)) return route.abort();
    return route.continue();
  });
  const page = await context.newPage(); page.on('pageerror', e => report.pageErrors.push(e.message));
  return { context, page };
}
async function touchDrag(page, from, to) {
  const session = await page.context().newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x, y: from.y, id: 0 }] });
  for (let i = 1; i <= 12; i++) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (to.x - from.x) * i / 12, y: from.y + (to.y - from.y) * i / 12, id: 0 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await session.detach();
}
async function center(locator) { const b = await locator.boundingBox(); assert(b); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }
(async () => {
  browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-proxy-server'] });
  {
    const { context, page } = await makeContext();
    await page.goto(`${base}/zhongyi1`); await page.getByRole('button', { name: /开始「一部书的旅行」/ }).tap();
    for (const name of ['山川', '本草', '书坊']) await page.getByRole('button', { name: `收集${name}书页`, exact: true }).tap();
    await page.getByRole('button', { name: '前往校序' }).tap();
    for (const [i, name] of ['山川', '本草', '书坊'].entries()) {
      const from = page.getByRole('button', { name: `选择${name}书页`, exact: true }), to = page.getByRole('button', { name: `第${i + 1}格，放入选中书页`, exact: true });
      await from.scrollIntoViewIfNeeded(); await touchDrag(page, await center(from), await center(to));
      await expect(page.getByRole('button', { name: `第${i + 1}格已放入${name}`, exact: true })).toBeVisible();
    }
    passed('390×844: actual touch drag places all three pages into correct sequence');
    await page.getByRole('button', { name: '前往刷印' }).tap(); await page.getByRole('button', { name: /为木版上墨/ }).tap(); await page.getByRole('button', { name: /覆上一张宣纸/ }).tap();
    const print = page.getByLabel('刷印区域'); await print.scrollIntoViewIfNeeded(); const box = await print.boundingBox();
    await touchDrag(page, { x: box.x + 5, y: box.y + box.height / 2 }, { x: box.x + box.width - 5, y: box.y + box.height / 2 });
    await expect(page.getByRole('button', { name: /轻轻揭起书页/ })).toBeVisible(); await page.getByRole('button', { name: /轻轻揭起书页/ }).tap();
    await expect(page.getByRole('button', { name: '前往赏器' })).toBeEnabled(); passed('390×844: actual horizontal touch gesture inks all four bands and reveals printed page');
    await context.close();
  }
  {
    const { context, page } = await makeContext(); let release; const imageGate = new Promise(r => release = r); let requested = false;
    await context.route('**/zhongyi1/bookshop*.webp', async route => { requested = true; await imageGate; await route.continue(); });
    await page.goto(`${base}/zhongyi1`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    await expect(page.getByRole('button', { name: /开始「一部书的旅行」/ })).toBeVisible(); assert(requested);
    const img = page.getByAltText('青绿山水窗景、古籍与青瓷相伴的想象书坊'); assert.equal(await img.evaluate(i => i.complete), false);
    await page.getByRole('button', { name: /开始「一部书的旅行」/ }).tap(); await expect(page.getByRole('button', { name: '收集山川书页', exact: true })).toBeVisible(); release();
    passed('Delayed artwork response does not block entering the interactive journey'); await context.close();
  }
  {
    const { context, page } = await makeContext(); await context.route('**/zhongyi1/bookshop*.webp', route => route.abort('failed'));
    await page.goto(`${base}/zhongyi1`); const img = page.getByAltText('青绿山水窗景、古籍与青瓷相伴的想象书坊');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    await expect.poll(() => img.evaluate(i => i.complete)).toBe(true);
    report.failedArtworkDOM = await img.evaluate(i => ({ complete: i.complete, naturalWidth: i.naturalWidth, pictureDisplay: getComputedStyle(i.parentElement).display, heroClass: i.closest('section').className }));
    if (report.failedArtworkDOM.pictureDisplay !== 'none') report.failures.push(`Intentional artwork network failure did not activate CSS fallback: ${JSON.stringify(report.failedArtworkDOM)}`);
    await expect(page.getByRole('button', { name: /开始「一部书的旅行」/ })).toBeVisible(); await page.screenshot({ path: path.join(out, 'mobile-image-fallback.png') });
    await page.getByRole('button', { name: /开始「一部书的旅行」/ }).tap(); await expect(page.getByRole('button', { name: '收集山川书页', exact: true })).toBeVisible();
    passed('Intentionally failed artwork still leaves start control usable'); await context.close();
  }
  {
    for (const [width, height] of [[320, 740], [430, 932], [844, 390]]) {
      const { context, page } = await makeContext(width, height); await page.goto(`${base}/zhongyi1`);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
      const primary = page.getByRole('button', { name: /开始「一部书的旅行」/ });
      assert((await primary.boundingBox()).height >= 44); await primary.tap();
      for (let i = 0; i < 4; i++) {
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        for (const label of [/跳过本幕/, i === 0 ? /返回入口/ : /上一幕/]) {
          const target = page.getByRole('button', { name: label }); assert((await target.boundingBox()).height >= 44);
        }
        await page.getByRole('button', { name: '跳过本幕', exact: true }).tap();
      }
      await expect(page.getByRole('button', { name: '重新体验' })).toBeVisible(); assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert((await page.getByRole('button', { name: '重新体验' }).boundingBox()).height >= 44);
      await page.screenshot({ path: path.join(out, `mobile-${width}-keepsake.png`), fullPage: true });
      passed(`${width}×${height} reduced-motion: entrance, four scenes and keepsake no horizontal overflow; key start/back/skip/replay controls ≥44px tall`); await context.close();
    }
  }
  {
    const { context, page } = await makeContext(1440, 1000);
    const scripts = [], pending = [];
    page.on('response', response => { if (/\/_next\/static\/.*\.js/.test(response.url())) pending.push(response.text().then(text => { scripts.push({ url: response.url(), bytes: text.length, engine: text.includes('WebGLRenderer') && (text.includes('ShaderMaterial') || text.includes('WebGLProgram')) }); }).catch(() => {})); });
    await page.goto(`${base}/zhongyi1`, { waitUntil: 'networkidle' }); await page.getByRole('button', { name: /开始「一部书的旅行」/ }).click();
    for (const name of ['山川', '本草', '书坊']) await page.getByRole('button', { name: `收集${name}书页`, exact: true }).click();
    await page.getByRole('button', { name: '前往校序' }).click();
    for (const [i, name] of ['山川', '本草', '书坊'].entries()) {
      const from = page.getByRole('button', { name: `选择${name}书页`, exact: true }), to = page.getByRole('button', { name: `第${i + 1}格，放入选中书页`, exact: true });
      await from.scrollIntoViewIfNeeded(); const a = await center(from), b = await center(to);
      await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(b.x, b.y, { steps: 12 }); await page.mouse.up();
      await expect(page.getByRole('button', { name: `第${i + 1}格已放入${name}`, exact: true })).toBeVisible();
    }
    passed('1440×1000: desktop mouse drag places all three pages correctly');
    await page.getByRole('button', { name: '前往刷印' }).click();
    await page.waitForLoadState('networkidle'); await Promise.all(pending);
    assert.equal(scripts.filter(s => s.engine).length, 0); report.firstThreeSceneScriptCount = scripts.length;
    await page.getByRole('button', { name: /为木版上墨/ }).click(); await page.getByRole('button', { name: /覆上一张宣纸/ }).click();
    const print = page.getByLabel('刷印区域'); await print.scrollIntoViewIfNeeded(); const b = await print.boundingBox();
    await page.mouse.move(b.x + 5, b.y + b.height / 2); await page.mouse.down(); await page.mouse.move(b.x + b.width - 5, b.y + b.height / 2, { steps: 12 }); await page.mouse.up();
    await page.getByRole('button', { name: /轻轻揭起书页/ }).click(); await page.getByRole('button', { name: '前往赏器' }).click();
    await expect(page.getByRole('heading', { name: '一抹青釉，盛住草木时光' })).toBeVisible(); await page.waitForLoadState('networkidle'); await Promise.all(pending);
    const engineScripts = scripts.filter(s => s.engine); assert(engineScripts.length > 0); report.engineScriptsAfterArtifact = engineScripts;
    passed('1440×1000: desktop mouse swipe completes printing; no Three.js implementation requested in first three scenes, loaded when artifact opens');
    await context.close();
  }
})().catch(e => report.failures.push(e.stack)).finally(async () => {
  if (browser) await browser.close(); report.passed = !report.failures.length && !report.pageErrors.length;
  fs.writeFileSync(path.join(out, 'input-loading-report.json'), JSON.stringify(report, null, 2)); console.log(JSON.stringify(report)); if (!report.passed) process.exitCode = 1;
});
