const { chromium, expect } = require(process.env.PLAYWRIGHT_MODULE || 'playwright/test');
const sharp = require('sharp');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const origin = process.env.QA_BASE || 'http://127.0.0.1:3061';
const out = process.env.QA_OUT || path.join(require('node:os').tmpdir(), 'zhongyi1-timeline-qa'); fs.mkdirSync(out, { recursive: true });
const nodes = ['伏羲台', '商代台西', '张元素', '李东垣', '罗天益', '路志正'];
const ids = ['fuxi', 'taixi', 'zhang', 'li', 'luo', 'modern'];
const artifacts = [ ['伏羲文化 · 环形意象'], ['台西砭镰 · 器物示意', '台西种仁 · 植物遗存'], ['易水学说 · 书页意象'], ['《脾胃论》 · 著述意象'], ['《卫生宝鉴》 · 著述意象'], ['当代著述 · 书页意象'] ];
const report = { base: origin, scope: 'Final build / deployed-path verification in independent headless Chrome. Mobile viewport and CDP touch emulation, not physical handset or Safari.', started: new Date().toISOString(), checks: [], inspections: [], viewports: [], failures: [], bugs: [], pageErrors: [], consoleErrors: [], resourceErrors: [], screenshots: [], navigations: [] };
let browser;
const check = (view, name, data = {}) => { report.checks.push({ view, name, passed: true, ...data }); console.log(`PASS ${view}: ${name}`); };
async function make(view, width, height, mobile) {
 const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile });
 await context.route('**/*', route => { const r = route.request(), u = new URL(r.url()); return u.origin === origin && r.method() === 'GET' && !/^\/_vercel\//.test(u.pathname) ? route.continue() : route.abort(); });
 const page = await context.newPage(); page.setDefaultTimeout(12000);
 page.on('pageerror', e => report.pageErrors.push({ view, error: e.message }));
 page.on('console', m => { if (m.type() === 'error' && !/net::ERR_FAILED|net::ERR_BLOCKED_BY_CLIENT/.test(m.text())) report.consoleErrors.push({ view, error: m.text() }); });
 page.on('response', r => { if (r.status() >= 400 && !/\/_vercel\//.test(r.url())) report.resourceErrors.push({ view, status: r.status(), url: r.url() }); });
 page.on('framenavigated', f => { if (f === page.mainFrame()) report.navigations.push({ view, url: f.url() }); });
 await page.goto(origin + '/zhongyi1', { waitUntil: 'networkidle', timeout: 60000 });
 const canvas = page.getByTestId('timeline-canvas'); await expect(canvas).toBeVisible({ timeout: 30000 }); await settled(canvas);
 return { context, page, canvas };
}
async function settled(canvas) { await expect(canvas).toHaveAttribute('data-camera-settled', 'true', { timeout: 15000 }); }
async function hash(canvas) { await settled(canvas); return crypto.createHash('sha256').update(await canvas.screenshot()).digest('hex'); }
async function act(page, name, mobile, exact = false) { const b = page.getByRole('button', { name, exact }); await expect(b).toBeVisible(); await expect(b).toBeEnabled(); mobile ? await b.tap() : await b.click(); }
async function shot(page, file) { await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); }); await page.screenshot({ path: path.join(out, file), fullPage: true }); report.screenshots.push(file); }
async function canvasStats(canvas) { const { data, info } = await sharp(await canvas.screenshot()).resize(100, 100).raw().toBuffer({ resolveWithObject: true }); const palette = new Set(); let bright = 0; for (let i = 0; i < data.length; i += info.channels) { palette.add(`${data[i] >> 4},${data[i+1] >> 4},${data[i+2] >> 4}`); if (data[i] + data[i+1] + data[i+2] > 180) bright++; } return { paletteSize: palette.size, brightFraction: bright / 10000 }; }
async function layout(page, view, state) {
 const data = await page.evaluate(() => {
  const rect = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }; };
  const caption = document.querySelector('aside'), footer = document.querySelector('footer'), canvas = document.querySelector('[data-testid="timeline-canvas"]');
  const controls = [...document.querySelectorAll('button,input[type="range"]')].filter(el => el.getBoundingClientRect().width > 0 && getComputedStyle(el).visibility !== 'hidden').map(el => ({ label: el.getAttribute('aria-label') || el.textContent.trim().slice(0,45), ...rect(el) }));
  return { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight, canvas: rect(canvas), caption: rect(caption), footer: rect(footer), controls };
 });
 assert(data.scrollWidth <= data.width, `${state} horizontal overflow`);
 report.viewports.push({ view, state, ...data }); return data;
}
async function touchDrag(page, from, to) { const cdp = await page.context().newCDPSession(page); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x, y: from.y, id: 1 }] }); for (let i = 1; i <= 12; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (to.x-from.x)*i/12, y: from.y + (to.y-from.y)*i/12, id: 1 }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach(); }
async function main(view, width, height, mobile) {
 const { context, page, canvas } = await make(view, width, height, mobile);
 if(process.env.QA_FAST_MOTION==='1'){await page.getByRole('button',{name:'开启减弱动态',exact:true}).click();await settled(canvas);}
 const initial = await hash(canvas), stats = await canvasStats(canvas); assert(stats.paletteSize > 30 && stats.brightFraction > .005, 'Canvas is visually empty');
 await expect(canvas).toHaveAttribute('data-view-mode', 'journey'); await expect(canvas).toHaveAttribute('data-current-node','0'); await shot(page, `${view}-default-journey.png`); await layout(page, view, 'default-journey'); check(view, 'Default live canvas opens directly on first era with visible nonuniform pixels', { stats });
 await act(page,'查看六境全卷',mobile,true);await expect(canvas).toHaveAttribute('data-view-mode','overview');const overviewHash=await hash(canvas);assert.notEqual(initial,overviewHash);await shot(page,`${view}-overview.png`);
 await act(page, '沿医脉出发', mobile); await expect(canvas).toHaveAttribute('data-view-mode', 'journey'); const journeyHash = await hash(canvas); assert.notEqual(overviewHash, journeyHash); check(view, 'Overview and its CTA move the real camera between overview and first journey era');
 // Test navigation in ordinary motion; inspect controls use the UI reduced-motion option.
 const sceneHashes = [];
 for (let i=0; i<6; i++) { await act(page, `前往${nodes[i]}`, mobile, true); await expect(canvas).toHaveAttribute('data-current-node', String(i)); await settled(canvas); sceneHashes.push(await hash(canvas)); await expect(page.getByTestId('history-experience')).toHaveAttribute('data-node', ids[i]); }
 assert.equal(new Set(sceneHashes).size, 6); check(view, 'All six era controls select their own settled rendered view', { sceneHashes });
 await act(page, '上一年代', mobile, true); await expect(canvas).toHaveAttribute('data-current-node', '4'); await settled(canvas); await act(page, '下一年代', mobile, true); await expect(canvas).toHaveAttribute('data-current-node', '5'); await expect(page.getByRole('button',{name:'下一年代',exact:true})).toBeDisabled(); check(view, 'Previous/next era controls and last-boundary disabled state');
 const reduceButton = page.getByRole('button', { name: /减弱动态/ }); if(await reduceButton.getAttribute('aria-pressed')!=='true')await reduceButton.click();
 for(let i=0;i<6;i++) {
  await act(page, `前往${nodes[i]}`, mobile, true); await settled(canvas);
  for(const title of artifacts[i]) {
   await act(page, `走近${title}`, mobile, true); await expect(canvas).toHaveAttribute('data-view-mode','inspect'); await settled(canvas); const start = await hash(canvas);
   const controls = [];
   for(const label of ['向左旋转观察','向右旋转观察','放大观察物','缩小观察物']) { const before=await hash(canvas); await act(page,label,mobile,true); const after=await hash(canvas); assert.notEqual(before,after,`${title} ${label} did not change rendered pixels`); controls.push({label,before,after}); }
   report.inspections.push({view,title,focusId:await canvas.getAttribute('data-focus-id'),hash:start,controls});
   if (i===1 && title.includes('砭镰')) {await shot(page,`${view}-taixi-inspect.png`);await layout(page,view,'taixi-inspect');}
   await act(page,'返回时间长卷',mobile); await expect(canvas).toHaveAttribute('data-view-mode','journey'); await settled(canvas);
  }
 }
 check(view, 'All seven artifacts focus; every left/right/zoom-in/zoom-out control changes actual pixels; return restores journey');
 const range=page.getByRole('slider',{name:'拖动医脉时间线'}); const rb=await range.boundingBox(); if(mobile)await page.touchscreen.tap(rb.x+rb.width*.4,rb.y+rb.height/2);else await range.click({position:{x:rb.width*.4,y:rb.height/2}}); await expect(canvas).toHaveAttribute('data-current-node','2'); await settled(canvas); assert(Math.abs(Number(await canvas.getAttribute('data-camera-progress'))-.4)<.05); check(view,'Range scrubs progress and camera to corresponding era');
 const beforeGesture=await hash(canvas);
 const point=mobile ? {x:width*.55,y:height*.22} : {x:width*.65,y:height*.35};
 if(mobile) await touchDrag(page,point,{x:point.x-130,y:point.y+70}); else { await page.mouse.move(point.x,point.y); await page.mouse.wheel(0,700); }
 const afterGesture=await hash(canvas); assert.notEqual(beforeGesture,afterGesture); check(view,mobile?'Native CDP touch drag changes actual journey pixels':'Mouse wheel changes actual journey pixels');
 await act(page,'查看史实与来源',mobile,true); const dialog=page.getByRole('dialog'); await expect(dialog).toBeVisible(); await expect(dialog).toContainText('不冒充官方博物馆'); assert(await dialog.getByRole('link').count()>=1); await page.keyboard.press('Escape'); await expect(dialog).not.toBeVisible(); check(view,'Sources modal renders current evidence and closes with Escape');
 await act(page,'医脉长卷总览',mobile,true); await expect(canvas).toHaveAttribute('data-view-mode','overview'); await settled(canvas); await shot(page,`${view}-final-overview.png`); check(view,'Overview control restores real overview camera');
 const game=page.getByRole('button',{name:'进入书坊小游戏',exact:true});
 if(await game.isVisible()) {
  await act(page,`前往${nodes[5]}`,mobile,true); await settled(canvas); await game.click(); await expect(page.getByRole('button',{name:/返回 3D 医脉长卷/})).toBeVisible(); await expect(page.getByRole('button',{name:/开始「一部书的旅行」/})).toBeVisible();
  await act(page,/返回 3D 医脉长卷/,mobile); const nextCanvas=page.getByTestId('timeline-canvas');await expect(nextCanvas).toBeVisible();await settled(nextCanvas);
  const restored={canvasNode:await nextCanvas.getAttribute('data-current-node'),uiNode:await page.getByTestId('history-experience').getAttribute('data-node'),mode:await nextCanvas.getAttribute('data-view-mode')};
  if(restored.uiNode!==ids[Number(restored.canvasNode)]) report.bugs.push({view,type:'game-return-state',...restored});
  check(view,'Secondary game opens and returns to a fresh canvas',{restored});
 } else report.bugs.push({view,type:'game-entry-unavailable',message:'Only secondary game button exists in DOM but is display:none at this viewport; no visible alternative entry.'});
 await context.close();
}
async function narrow(view,width,height) {
 const {context,page,canvas}=await make(view,width,height,true);
 await layout(page,view,'overview');await shot(page,`${view}-overview.png`);
 await act(page,'前往商代台西',true,true);await settled(canvas);await layout(page,view,'taixi-journey');await shot(page,`${view}-taixi-journey.png`);
 await act(page,'走近台西砭镰 · 器物示意',true,true);await settled(canvas);await layout(page,view,'taixi-inspect');await shot(page,`${view}-taixi-inspect.png`);
 check(view,'Overview/journey/inspect render and buttons are reachable',{canvasStats:await canvasStats(canvas)}); await context.close();
}
(async()=>{
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-proxy-server']});report.browser=browser.version();
 for(const config of [['desktop',1440,1000,false],['mobile390',390,844,true]].filter(c=>!process.env.QA_MAIN_VIEWS||process.env.QA_MAIN_VIEWS.split(',').includes(c[0]))) {try{await main(...config);}catch(e){report.failures.push({view:config[0],error:e.stack});console.log(`FAIL ${config[0]}: ${e.message}`);}}
 if(process.env.QA_SKIP_NARROW!=='1')for(const config of [['mobile320',320,740],['mobile430',430,932],['landscape',844,390]]) {try{await narrow(...config);}catch(e){report.failures.push({view:config[0],error:e.stack});console.log(`FAIL ${config[0]}: ${e.message}`);}}
})().catch(e=>report.failures.push({error:e.stack})).finally(async()=>{if(browser)await browser.close();report.finished=new Date().toISOString();report.fastMotion=process.env.QA_FAST_MOTION==='1';report.passed=!report.failures.length&&!report.bugs.length&&!report.pageErrors.length&&!report.consoleErrors.length&&!report.resourceErrors.length;fs.writeFileSync(path.join(out,process.env.QA_REPORT||'timeline-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,inspections:report.inspections.length,bugs:report.bugs,failures:report.failures,pageErrors:report.pageErrors,consoleErrors:report.consoleErrors,resourceErrors:report.resourceErrors}));if(!report.passed)process.exitCode=1;});
