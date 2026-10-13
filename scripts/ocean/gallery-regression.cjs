// Run with the bundled Node runtime. Uses real Chromium, controlled image
// responses, and decoded pixels rather than assuming a changed label is a fix.
const { chromium } = require('/Users/lee/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const repo = path.resolve(__dirname, '../..');
const reportPath = process.env.OCEAN_GALLERY_REPORT || path.resolve(repo, '../qa/gallery-regression.json');
const baseline = process.argv.includes('--baseline');
const script = baseline ? execFileSync('git', ['show', 'HEAD:public/ocean/assets/presentation.js'], { cwd: repo }) : fs.readFileSync(path.join(repo, 'public/ocean/assets/presentation.js'));
const scenePath = (i, mode) => `场景${i} ${mode}.svg`;
const fixture = {
  project: { title: 'Gallery fixture', institution: 'Fixture', summary: '', stage: '', date: '', stats: [] },
  hero: { path: 'hero.svg' },
  scenes: [0, 1, 2].map(i => ({ title: `Scene ${i}`, images: Object.fromEntries(['effect', 'native', 'white'].map(m => [m, scenePath(i, m)])), thumbnail: `thumb${i}.svg`, tags: [], group: i === 2 ? 'detail' : 'overview' })),
  plan: { layout: { path: 'layout.svg' }, notes: [] },
  model: { path: 'unused.glb', views: [] }, chapters: [], overviewChapters: [],
};
const colors = {};
for (let i = 0; i < 3; i++) for (const [n, mode] of ['effect', 'native', 'white'].entries()) colors[scenePath(i, mode)] = [45 + 60 * i, 55 + 65 * n, 215 - 25 * i - 20 * n];
function image(filename) { const c = colors[filename] || [30, 90, 70]; return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect width="320" height="200" fill="rgb(${c.join(',')})"/></svg>`; }
let phase = 'normal', browser;
const requests = [], held = [];
const report = { baseline, scope: 'Real Chromium, actual gallery handlers, distinct decoded pixels and screenshot hashes, delayed/reordered/failed image responses', checks: [], states: [], pageErrors: [] };
function respond(res, name) { if (!res.destroyed) { res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' }); res.end(image(name)); } }
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const name = decodeURIComponent(url.pathname.split('/').pop());
  if (url.pathname === '/ocean/media/manifest.json') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(fixture)); return; }
  if (url.pathname.startsWith('/ocean/media/')) {
    requests.push({ phase, name, search: url.search });
    if (phase === 'slow' && name === scenePath(0, 'native')) { held.push({ res, name }); return; }
    if ((phase === 'recover' && name === scenePath(2, 'white') && !url.search) || (phase === 'fail' && name === scenePath(2, 'native'))) { res.writeHead(503, { 'Content-Type': 'text/plain' }); res.end('Fixture image failure'); return; }
    respond(res, name); return;
  }
  const allowed = new Set(['/ocean/presentation.html', '/ocean/assets/presentation.js', '/ocean/assets/presentation.css']);
  if (!allowed.has(url.pathname)) { res.writeHead(404); res.end(); return; }
  const body = url.pathname.endsWith('/presentation.js') ? script : fs.readFileSync(path.join(repo, 'public', url.pathname));
  res.writeHead(200, { 'Content-Type': url.pathname.endsWith('.js') ? 'text/javascript' : url.pathname.endsWith('.css') ? 'text/css' : 'text/html', 'Cache-Control': 'no-store' }); res.end(body);
});
const check = name => report.checks.push({ name, passed: true });
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--no-proxy-server'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', e => report.pageErrors.push(e.message));
  await page.goto(base + '/ocean/presentation.html#gallery'); await page.waitForFunction(() => window.OceanReady);
  async function selected(i, mode) {
    await page.waitForFunction(({ i, mode }) => {
      const image = document.getElementById('main-image');
      return image.dataset.imageState === 'ready' && image.complete && image.naturalWidth > 0 && decodeURIComponent(new URL(image.currentSrc).pathname).endsWith(`/场景${i} ${mode}.svg`);
    }, { i, mode }, { timeout: 10000 });
    const actual = await page.locator('#main-image').evaluate(img => {
      const canvas = document.createElement('canvas'); canvas.width = 1; canvas.height = 1;
      const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, 1, 1);
      return { src: img.src, currentSrc: img.currentSrc, state: img.dataset.imageState, pixels: Array.from(ctx.getImageData(0, 0, 1, 1).data).slice(0, 3), visible: getComputedStyle(img).opacity !== '0' };
    });
    assert.deepEqual(actual.pixels, colors[scenePath(i, mode)]); assert.equal(actual.visible, true);
    assert.equal(await page.locator('.scene-card').nth(i).getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator(`[data-mode=${mode}]`).getAttribute('aria-pressed'), 'true');
    assert.equal(decodeURIComponent(new URL(await page.locator('#original-link').getAttribute('href'), base).pathname).split('/').pop(), scenePath(i, mode));
    actual.screenshotHash = crypto.createHash('sha256').update(await page.locator('#main-image').screenshot()).digest('hex');
    report.states.push({ i, mode, ...actual }); return actual;
  }
  const first = await selected(0, 'effect');
  await page.locator('#next-scene').click(); const second = await selected(1, 'effect'); assert.notEqual(first.screenshotHash, second.screenshotHash);
  await page.locator('#prev-scene').click(); await selected(0, 'effect');
  check('Previous/next replace actual decoded pixels, selection and original URL');
  await page.locator('.scene-card').nth(2).click(); await selected(2, 'effect');
  for (const mode of ['native', 'white', 'effect']) { await page.locator(`[data-mode=${mode}]`).click(); await selected(2, mode); }
  check('Thumbnail selection and all three display modes show their own pixels');
  await page.locator('.scene-card').nth(0).click(); await selected(0, 'effect');
  phase = 'slow'; await page.locator('[data-mode=native]').click();
  await page.waitForFunction(() => document.getElementById('main-image').dataset.imageState === 'loading');
  const loading = await page.locator('body').evaluate(() => ({ status: document.getElementById('gallery-image-status')?.textContent, state: document.getElementById('image-stage').dataset.imageState, busy: document.getElementById('image-stage').getAttribute('aria-busy'), opacity: getComputedStyle(document.getElementById('main-image')).opacity, displayedSource: window.OceanGalleryDiagnostics?.displayedSource }));
  report.slowSelection = loading;
  assert.equal(loading.opacity, '0', 'Slow new selection must not present the previous image as its content');
  assert.equal(loading.busy, 'true'); assert.equal(loading.displayedSource, null); assert.match(loading.status, /载入/);
  await page.locator('#main-image').evaluate(img => window.oldGalleryImage = img);
  await page.locator('.scene-card').nth(1).click(); await selected(1, 'native');
  for (const pending of held.splice(0)) respond(pending.res, pending.name);
  await page.evaluate(() => { window.oldGalleryImage.dispatchEvent(new Event('load')); window.oldGalleryImage.dispatchEvent(new Event('error')); });
  await page.waitForTimeout(800); await selected(1, 'native');
  assert.equal(requests.filter(r => r.phase === 'slow' && r.name === scenePath(0, 'native')).length, 1);
  check('Slow/late old response and load/error events cannot replace the latest selection or start stale retries');
  phase = 'normal';
  await page.evaluate(() => { const right = document.getElementById('next-scene'), left = document.getElementById('prev-scene'); right.click(); right.click(); left.click(); left.click(); right.click(); document.querySelectorAll('.scene-card')[2].click(); document.querySelector('[data-mode=white]').click(); document.querySelector('[data-mode=effect]').click(); });
  await selected(2, 'effect'); await page.waitForTimeout(400); await selected(2, 'effect');
  check('Rapid alternating arrows, thumbnail and mode switches retain the final image');
  await page.locator('[data-filter=overview]').click(); await selected(0, 'effect'); await page.locator('#prev-scene').click(); await selected(1, 'effect');
  await page.locator('[data-filter=detail]').click(); await selected(2, 'effect'); await page.locator('#next-scene').click(); await selected(2, 'effect');
  await page.locator('[data-filter=all]').click();
  check('Filtered arrows wrap only through visible scene images');
  phase = 'recover'; await page.locator('[data-mode=white]').click(); await selected(2, 'white');
  const recovery = requests.filter(r => r.phase === 'recover' && r.name === scenePath(2, 'white'));
  assert.equal(recovery.length, 2); assert.equal(recovery[1].search, '?ocean-retry=1');
  assert.equal(new URL(await page.locator('#original-link').getAttribute('href'), base).search, '');
  check('Failed selected image recovers without altering original media URL');
  phase = 'fail'; await page.locator('[data-mode=native]').click();
  await page.locator('#gallery-image-retry').waitFor({ state: 'visible', timeout: 10000 });
  const unavailable = await page.locator('body').evaluate(() => ({ state: document.getElementById('main-image').dataset.imageState, opacity: getComputedStyle(document.getElementById('main-image')).opacity, displayedSource: window.OceanGalleryDiagnostics.displayedSource, text: document.getElementById('gallery-image-status').textContent }));
  assert.equal(unavailable.state, 'unavailable'); assert.equal(unavailable.opacity, '0'); assert.equal(unavailable.displayedSource, null); assert.match(unavailable.text, /重新载入/);
  assert.equal(requests.filter(r => r.phase === 'fail' && r.name === scenePath(2, 'native')).length, 3);
  check('Exactly two retries then visible failure feedback, with no old image masquerading as success');
  phase = 'normal'; await page.locator('#gallery-image-retry').click(); await selected(2, 'native');
  await page.locator('#gallery-image-status').waitFor({ state: 'hidden' });
  check('Manual retry loads the current selection and dismisses feedback');
  assert.deepEqual(report.pageErrors, []); report.passed = true;
})().catch(error => { report.passed = false; report.error = error.stack; process.exitCode = 1; }).finally(async () => {
  report.requests = requests; fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  if (browser) await browser.close(); for (const pending of held) pending.res.destroy(); server.closeAllConnections(); server.close();
  console.log(JSON.stringify({ passed: report.passed, baseline, checks: report.checks.length, report: reportPath, error: report.error }));
});
