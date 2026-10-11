import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const {chromium,expect}=createRequire(import.meta.url)('playwright/test');
const base=new URL(process.argv[2]??'http://127.0.0.1:3035');
const out=resolve(process.env.QA_EVIDENCE_DIR??'docs/qa/iching-20261011/browser-local');
const local=['127.0.0.1','localhost','[::1]'].includes(base.hostname);
assert.ok(local||process.env.QA_ALLOW_PUBLIC==='1','Set QA_ALLOW_PUBLIC=1 explicitly for public production verification');
mkdirSync(out,{recursive:true});
const locales=['en','zh','zh-TW','ru'];
const tags={en:'en',zh:'zh-Hans','zh-TW':'zh-Hant',ru:'ru'};
const suffix=locale=>locale==='en'?'':`?locale=${locale}`;
const url=(path,locale)=>new URL(`${path}${suffix(locale)}`,base).href;
const report={scope:local?'Local production build; no external deployment verification':'Public deployment browser verification',phase:process.env.QA_PHASE??'full',base:base.origin,startedAt:new Date().toISOString(),checks:[],views:[],workflows:[],screenshots:[],pageErrors:[],consoleErrors:[],httpErrors:[],blockedRequests:[],failures:[]};
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox']});

function recordPage(page){
 page.on('pageerror',e=>report.pageErrors.push({url:page.url(),message:e.message}));
 page.on('console',msg=>{if(msg.type()==='error')report.consoleErrors.push({url:page.url(),message:msg.text(),location:msg.location()});});
 page.on('response',response=>{if(new URL(response.url()).origin===base.origin&&response.status()>=400)report.httpErrors.push({url:response.url(),status:response.status(),type:response.request().resourceType()});});
}
async function context(options={}){
 const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',...options});
 c.on('page',recordPage);
 await c.route('**/*',route=>{
  const request=route.request(),requestUrl=new URL(request.url()),origin=requestUrl.origin;
  if(/^\/_vercel\/(?:insights|speed-insights)\//.test(requestUrl.pathname)){report.blockedRequests.push({url:request.url(),method:request.method(),reason:'Telemetry disabled by browser QA'});return route.abort();}
  if(origin===base.origin&&request.method()==='GET')return route.continue();
  report.blockedRequests.push({url:request.url(),method:request.method()});return route.abort();
 });
 return c;
}
async function prepareCoinFixture(c){
 await c.addInitScript(()=>{
  const native=crypto.getRandomValues.bind(crypto);
  Object.defineProperty(crypto,'getRandomValues',{configurable:true,value(array){
   if(array instanceof Uint8Array&&array.length===3&&Array.isArray(window.__qaCoinBytes)){
    if(window.__qaCoinBytes.length<3)throw new Error('Browser QA coin fixture exhausted');
    for(let i=0;i<3;i++)array[i]=window.__qaCoinBytes.shift();
    window.__qaCoinDraws=(window.__qaCoinDraws??0)+1;return array;
   }
   return native(array);
  }});
 });
}
async function setCoinFixture(page,tosses){
 await page.evaluate(coins=>{window.__qaCoinBytes=coins.flat().map(value=>value===3?1:0);window.__qaCoinDraws=0;},tosses);
}
const exampleTosses=[[2,2,2],[3,2,2],[3,3,2],[3,3,3],[3,2,2],[3,3,2]];
const exampleValues=[6,7,8,9,7,8];
const hexagramIdentities=JSON.parse(readFileSync('content/hexagrams/identities.verified.json','utf8')).hexagrams;
const hexagramNames=JSON.parse(readFileSync('lib/hexagram-learning/catalog.json','utf8'));
const action=(page,name)=>page.locator(`[data-iching-action="${name}"]`);
async function choose(page,method){await page.locator(`[data-iching-method="${method}"]`).click();await expect(page.locator(`[data-iching-method="${method}"]`)).toHaveAttribute('aria-pressed','true');await expect(page.locator('[data-iching-panel]')).toHaveAttribute('data-iching-panel',method);}
async function result(page,locale,baseNumber,changedNumber,values,moving){
 await expect(page.locator('[data-iching-result]')).toHaveCount(1);await expect(page.locator('#iching-result')).toBeFocused();
 for(const [key,number] of [['base',baseNumber],['changed',changedNumber]]){
  const card=page.locator(`[data-iching-hexagram="${key}"]`);await expect(card).toHaveAttribute('data-number',String(number));await expect(card.locator('h3')).toHaveText(hexagramNames[locale][number-1].displayName);await expect(card.locator('a')).toHaveAttribute('href',`/journal/hexagram-${String(number).padStart(2,'0')}${suffix(locale)}`);
  assert.deepEqual(await card.locator('[data-yang]').evaluateAll(es=>es.map(e=>Number(e.dataset.yang==='true'))),[...hexagramIdentities[number-1].linesBottomUp].reverse(),`${locale}/${key}/${number}: King Wen diagram`);
  assert.deepEqual(await card.locator('[data-moving="true"]').evaluateAll(es=>es.map(e=>6-[...e.parentElement.children].indexOf(e))),key==='base'?[...moving].reverse():[],`${locale}/${key}: moving-line markers`);
 }
 if(values)await expect(page.locator('[data-iching-raw]')).toHaveText(values.join(' · '));
 if(moving.length)assert.ok((await page.locator('[data-iching-moving]').innerText()).endsWith(moving.join(', ')));
 await expect(page.locator('[data-iching-result] details')).toHaveAttribute('open','');await expect(page.locator('[data-iching-workbench] [role=alert]')).toHaveCount(0);await fit(page,`${locale}: result ${baseNumber}/${changedNumber}`);
}
async function rawCoins(page,tosses){
 const recorded=await page.locator('[data-iching-result] details ol li').allTextContents();assert.equal(recorded.length,6);
 for(let i=0;i<6;i++)assert.ok(recorded[i].includes(`${tosses[i].join(' + ')} = ${tosses[i].reduce((n,v)=>n+v,0)}`),`Raw toss ${i+1} differs: ${recorded[i]}`);
}
async function reset(page){await action(page,'reset').click();await expect(page.locator('[data-iching-result]')).toHaveCount(0);if(await page.locator('[data-iching-progress]').count())await expect(page.locator('[data-iching-progress]')).toHaveText('0 / 6');}
async function checkReducedWorkflows(){
 for(const locale of locales){
  const c=await context();await prepareCoinFixture(c);const page=await c.newPage();
  await run(`${locale}: six coin tosses, raw faces, bottom-up order, undo and reset`,async()=>{
   await page.goto(url('/iching',locale));await page.locator('#iching-question').fill('Browser QA: one observation, one uncertainty, one small action.');await setCoinFixture(page,exampleTosses);
   assert.deepEqual(await page.locator('[data-iching-line]').evaluateAll(es=>es.map(e=>Number(e.dataset.ichingLine))),[6,5,4,3,2,1]);
   for(let i=0;i<6;i++){
    await action(page,'toss').click();await expect(page.locator('[data-iching-progress]')).toHaveText(`${i+1} / 6`);await expect(page.locator(`[data-iching-line="${i+1}"]`)).toHaveAttribute('data-value',String(exampleValues[i]));assert.ok((await page.locator(`[data-iching-line="${i+1}"]`).innerText()).includes(`${exampleTosses[i].join(' + ')} = ${exampleValues[i]}`));
    if(i<5)await expect(page.locator('[data-iching-result]')).toHaveCount(0);
   }
   assert.equal(await page.evaluate(()=>window.__qaCoinDraws),6);await result(page,locale,47,60,exampleValues,[1,4]);await rawCoins(page,exampleTosses);await screenshot(page,`${locale}-coins-six-tosses-result-390.png`);
   for(const [width,height] of [[320,568],[430,932]]){await page.setViewportSize({width,height});const dimensions=await fit(page,`${locale}: coin result ${width}`);await page.locator('#iching-result').scrollIntoViewIfNeeded();await screenshot(page,`${locale}-coins-result-${width}.png`);if(width===320&&['zh','ru'].includes(locale)){await page.locator('[data-iching-line="6"]').evaluate(e=>e.scrollIntoView({block:'start'}));await screenshot(page,`${locale}-coins-record-320.png`);}report.views.push({path:'/iching',state:'coin-result-47-to-60',locale,width,height,dimensions});}await page.setViewportSize({width:390,height:844});await page.locator('[data-iching-raw]').evaluate(e=>e.scrollIntoView({block:'start'}));await screenshot(page,`${locale}-coins-raw-faces-390.png`);
   await action(page,'undo').click();await expect(page.locator('[data-iching-progress]')).toHaveText('5 / 6');await expect(page.locator('[data-iching-result]')).toHaveCount(0);await setCoinFixture(page,[exampleTosses[5]]);await action(page,'toss').click();await result(page,locale,47,60,exampleValues,[1,4]);
   await reset(page);await expect(page.locator('#iching-question')).toHaveValue('Browser QA: one observation, one uncertainty, one small action.');report.workflows.push({locale,sixIndependentTosses:true,rawFaces:true,bottomUp:true,undo:true,reset:true,reducedMotion:true});
  });
  await run(`${locale}: one-action cast and reduced-motion synchronous-repeat lock`,async()=>{
   await reset(page);await choose(page,'coins');await setCoinFixture(page,exampleTosses);await action(page,'all').evaluate(element=>{for(let i=0;i<6;i++)element.click();});await result(page,locale,47,60,exampleValues,[1,4]);assert.equal(await page.evaluate(()=>window.__qaCoinDraws),6);await rawCoins(page,exampleTosses);await expect(page.locator('[data-iching-progress]')).toHaveText('6 / 6');
   await choose(page,'coins');await expect(page.locator('[data-iching-result]')).toHaveCount(1);await expect(page.locator('[data-iching-raw]')).toHaveText(exampleValues.join(' · '));assert.equal(await page.evaluate(()=>window.__qaCoinDraws),6);
   for(const [key,number] of [['base',47],['changed',60]]){const link=page.locator(`[data-iching-hexagram="${key}"] a`);await expect(link).toHaveAttribute('target','_blank');await link.focus();const opened=c.waitForEvent('page');await page.keyboard.press('Enter');const article=await opened;await article.waitForLoadState('domcontentloaded');await expect(article.locator('article[data-hexagram-learning]')).toHaveAttribute('data-hexagram-learning',`hexagram-${String(number).padStart(2,'0')}`);await expect(article.locator('main')).toHaveAttribute('lang',tags[locale]);await article.close();await expect(page.locator('[data-iching-raw]')).toHaveText(exampleValues.join(' · '));await expect(page.locator('[data-iching-progress]')).toHaveText('6 / 6');}
   await reset(page);await setCoinFixture(page,[exampleTosses[0]]);await action(page,'toss').evaluate(element=>{for(let i=0;i<6;i++)element.click();});await expect(page.locator('[data-iching-progress]')).toHaveText('1 / 6');assert.equal(await page.evaluate(()=>window.__qaCoinDraws),1);await expect(page.locator('[data-iching-workbench] [role=alert]')).toHaveCount(0);
   await action(page,'back').click();await expect(page.locator('#iching-methods')).toBeFocused();await expect(page.locator('[data-iching-progress]')).toHaveText('0 / 6');report.workflows.push({locale,allSixAction:true,reducedMotionRapidRepeat:true,sameMethodPreservesCast:true,backToMethods:true,baseAndChangedGuideNewTabsPreserveCast:true});
  });
  await run(`${locale}: manual four-state and individual-coin input`,async()=>{
   await reset(page);await choose(page,'manual');await expect(action(page,'submit')).toBeDisabled();for(let i=0;i<6;i++)await page.locator(`[data-iching-manual-line="${i+1}"]`).selectOption(String(exampleValues[i]));await action(page,'submit').click();await result(page,locale,47,60,exampleValues,[1,4]);await screenshot(page,`${locale}-manual-values-result-390.png`);
   await page.locator('[data-iching-entry="coins"]').click();await expect(action(page,'submit')).toBeDisabled();for(let i=0;i<6;i++)for(let j=0;j<3;j++)await page.locator(`[data-iching-manual-coin="${i+1}-${j+1}"]`).selectOption(String(exampleTosses[i][j]));await action(page,'submit').click();await result(page,locale,47,60,exampleValues,[1,4]);await rawCoins(page,exampleTosses);
   await page.locator('[data-iching-entry="values"]').click();for(const [value,baseNumber,changedNumber,moving] of [[7,1,1,[]],[8,2,2,[]],[6,2,1,[1,2,3,4,5,6]],[9,1,2,[1,2,3,4,5,6]]]){for(let i=1;i<=6;i++)await page.locator(`[data-iching-manual-line="${i}"]`).selectOption(String(value));await action(page,'submit').click();await result(page,locale,baseNumber,changedNumber,Array(6).fill(value),moving);}
   await reset(page);await expect(action(page,'submit')).toBeDisabled();report.workflows.push({locale,manualFourStates:true,manualCoinFaces:true,allYangAllYinAllMoving:true,incompleteInputBlocked:true});
  });
  await run(`${locale}: classical two-count arithmetic and invalid input`,async()=>{
   await choose(page,'numbers');await action(page,'example').click();await expect(page.locator('[data-iching-count="a"]')).toHaveValue('1');await expect(page.locator('[data-iching-count="b"]')).toHaveValue('5');await expect(page.locator('[data-iching-hour]')).toHaveValue('10');await action(page,'submit').click();await result(page,locale,44,57,[8,7,7,9,7,7],[4]);
   const formulas=await page.locator('[data-iching-formula] > p').allTextContents();assert.ok(formulas[0].includes('R8(1) = R8(1) = 1'));assert.ok(formulas[1].includes('R8(5) = R8(5) = 5'));assert.ok(formulas[2].includes('R6(1 + 5 + 10) = R6(16) = 4'));await screenshot(page,`${locale}-numbers-classical-result-390.png`);
   for(const invalid of ['', '0','-1','1.5','1e3','1.0','1000000001']){await page.locator('[data-iching-count="a"]').fill(invalid);const nativeValid=await page.locator('[data-iching-count="a"]').evaluate(e=>e.checkValidity());await action(page,'submit').click();await expect(page.locator('[data-iching-result]')).toHaveCount(0);if(nativeValid)await expect(page.locator('[data-iching-workbench] [role=alert]')).toHaveCount(1);}
   await page.locator('[data-iching-count="a"]').fill('1000000000');await page.locator('[data-iching-count="b"]').fill('1000000000');await action(page,'submit').click();await expect(page.locator('[data-iching-result]')).toHaveCount(1);assert.ok((await page.locator('[data-iching-formula] > p').last().innerText()).includes('R6(1000000000 + 1000000000 + 10) = R6(2000000010)'));
   report.workflows.push({locale,classicalCount44to57:true,originalCountsPreserved:true,invalidNumbersRejected:7,maximumCountAccepted:true});
  });
  await run(`${locale}: Beijing lunar date, New Year, hour boundaries and leap month`,async()=>{
   await choose(page,'time');const dates=[
    {input:'2026-02-16T22:59',lunar:[2025,12,29],year:6,hour:12,base:22,changed:37,moving:5},
    {input:'2026-02-16T23:00',lunar:[2025,12,29],year:6,hour:1,base:23,changed:2,moving:6},
    {input:'2026-02-17T00:00',lunar:[2026,1,1],year:7,hour:1,base:10,changed:61,moving:4},
    {input:'2026-02-17T00:59',lunar:[2026,1,1],year:7,hour:1,base:10,changed:61,moving:4},
    {input:'2026-02-17T01:00',lunar:[2026,1,1],year:7,hour:2,base:13,changed:30,moving:5},
    {input:'2023-03-22T12:00',lunar:[2023,2,1],year:4,hour:7,base:4,changed:23,moving:2,leap:true},
   ];
   for(const date of dates){
    await page.locator('[data-iching-datetime]').fill(date.input);await action(page,'submit').click();await result(page,locale,date.base,date.changed,undefined,[date.moving]);const inputs=await page.locator('[data-iching-calendar] strong').allTextContents();assert.equal(inputs[0],`${date.input.replace('T',' ')}:00 · UTC+8`);assert.deepEqual(inputs[1].match(/\d+/g).map(Number),date.lunar);assert.ok(inputs[2].endsWith(` · ${date.year}`));assert.ok(inputs[3].endsWith(` · ${date.hour}`));if(date.leap)assert.ok(inputs[1].includes({en:'Leap month',zh:'闰月','zh-TW':'閏月',ru:'Вставной месяц'}[locale]));
   }
   await screenshot(page,`${locale}-time-leap-month-result-390.png`);
   for(const invalid of ['', '1899-12-31T12:00','2101-01-01T00:00']){await page.locator('[data-iching-datetime]').fill(invalid);assert.equal(await page.locator('[data-iching-datetime]').evaluate(e=>e.checkValidity()),false);await action(page,'submit').click();await expect(page.locator('[data-iching-result]')).toHaveCount(0);}
   report.workflows.push({locale,beijingTime:true,lunarNewYear:true,lateZiSameDate:true,midnightRollover:true,hourBoundary0059to0100:true,leapMonth:true,unsupportedYearRejected:true});
  });await c.close();
 }
}
async function checkAnimatedWorkflows(){
 for(const locale of locales){
  const c=await context({reducedMotion:'no-preference'});await prepareCoinFixture(c);const page=await c.newPage();
  await run(`${locale}: animated rapid repeat and interruption safety`,async()=>{
   await page.goto(url('/iching',locale));await setCoinFixture(page,[exampleTosses[0]]);await action(page,'toss').evaluate(e=>{e.click();e.click();e.dispatchEvent(new MouseEvent('click',{bubbles:true}));});await expect(page.locator('[aria-busy="true"]')).toHaveCount(1);await expect(action(page,'toss')).toBeDisabled();await expect(page.locator('[data-iching-progress]')).toHaveText('1 / 6');assert.equal(await page.evaluate(()=>window.__qaCoinDraws),1);
   await reset(page);await setCoinFixture(page,[exampleTosses[0]]);await action(page,'toss').click();await choose(page,'manual');await page.waitForTimeout(550);await expect(page.locator('[data-iching-result]')).toHaveCount(0);await choose(page,'coins');await expect(page.locator('[data-iching-progress]')).toHaveText('0 / 6');
   await setCoinFixture(page,exampleTosses);await action(page,'all').click();await action(page,'reset').click();await page.waitForTimeout(550);await expect(page.locator('[data-iching-progress]')).toHaveText('0 / 6');await expect(page.locator('[data-iching-result]')).toHaveCount(0);
   await setCoinFixture(page,[exampleTosses[0]]);await action(page,'toss').click();await action(page,'undo').click();await page.waitForTimeout(550);await expect(page.locator('[data-iching-progress]')).toHaveText('0 / 6');
   await setCoinFixture(page,[exampleTosses[0]]);await action(page,'toss').click();await action(page,'back').click();await page.waitForTimeout(550);await expect(page.locator('[data-iching-progress]')).toHaveText('0 / 6');await expect(page.locator('#iching-methods')).toBeFocused();
   await setCoinFixture(page,[exampleTosses[0]]);await action(page,'toss').click();await page.goto(url('/journal/trigrams',locale));await page.goBack();await page.waitForTimeout(550);await expect(page.locator('[data-iching-progress]')).toHaveText('0 / 6');await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);await expect(page.locator('[data-iching-result]')).toHaveCount(0);
   await setCoinFixture(page,exampleTosses);await action(page,'all').evaluate(e=>{e.click();e.click();e.click();});await result(page,locale,47,60,exampleValues,[1,4]);assert.equal(await page.evaluate(()=>window.__qaCoinDraws),6);
   report.workflows.push({locale,animatedRapidRepeat:true,methodSwitchCancelsToss:true,resetCancelsAll:true,undoCancelsToss:true,backCancelsToss:true,leaveAndReturnCancelsToss:true,animatedAllCast:true});
  });await c.close();
 }
 for(const timezoneId of ['Pacific/Honolulu','Europe/London','Asia/Shanghai']){
  const c=await context({timezoneId});await c.addInitScript(()=>{Date.now=()=>Date.UTC(2026,1,16,16,0,0);});const page=await c.newPage();await run(`Browser timezone ${timezoneId}: fixed Beijing input and calculation`,async()=>{
   await page.goto(url('/iching','en'));await choose(page,'time');await expect(page.locator('[data-iching-datetime]')).toHaveValue('2026-02-17T00:00');await action(page,'submit').click();await result(page,'en',10,61,undefined,[4]);const inputs=await page.locator('[data-iching-calendar] strong').allTextContents();assert.equal(inputs[0],'2026-02-17 00:00:00 · UTC+8');assert.deepEqual(inputs[1].match(/\d+/g).map(Number),[2026,1,1]);report.workflows.push({timezoneId,beijingNowInput:true,timezoneInvariantCalculation:true});
  });await c.close();
 }
}
const trigramBits={qian:[1,1,1],dui:[1,1,0],li:[1,0,1],zhen:[1,0,0],xun:[0,1,1],kan:[0,1,0],gen:[0,0,1],kun:[0,0,0]};
async function diagram(page,id){
 const d=page.locator(`[data-trigram-diagram="${id}"]`);await expect(d).toHaveCount(1);await expect(d).toHaveAttribute('role','img');
 assert.ok((await d.getAttribute('aria-label')).length>10,`${id}: accessible figure label`);
 assert.deepEqual(await d.locator('[data-position]').evaluateAll(es=>es.map(e=>({position:Number(e.dataset.position),yang:Number(e.dataset.yang==='true')}))),[...trigramBits[id]].reverse().map((yang,i)=>({position:3-i,yang})),`${id}: bottom-up identity`);
}
async function checkLearning(page){
 for(const locale of locales){
  const articles=JSON.parse(readFileSync(`content/trigrams/${locale}.json`,'utf8'));
  for(const [width,height] of [[320,568],[390,844],[430,932],[1440,900]])await run(`${locale}/${width}: eight-trigram directory`,async()=>{
   await page.setViewportSize({width,height});const response=await page.goto(url('/journal/trigrams',locale));assert.equal(response.status(),200);await expect(page.locator('main')).toHaveAttribute('lang',tags[locale]);await expect(page.locator('[data-trigram-diagram]')).toHaveCount(8);
   for(const id of Object.keys(trigramBits)){await diagram(page,id);await expect(page.locator(`a[href="/journal/trigram-${id}${suffix(locale)}"]`)).toHaveCount(1);}
   const dimensions=await fit(page,`${locale}/trigrams/${width}`);report.views.push({path:'/journal/trigrams',locale,width,height,dimensions});await screenshot(page,`${locale}-trigrams-${width}.png`);
  });
  for(const id of Object.keys(trigramBits))for(const [width,height] of [[320,568],[1440,900]])await run(`${locale}/${id}/${width}: complete trigram article and anchors`,async()=>{
   const a=articles[id];assert.ok(a,`Missing ${locale}/${id}`);await page.setViewportSize({width,height});const response=await page.goto(url(`/journal/trigram-${id}`,locale));assert.equal(response.status(),200);
   await expect(page.locator('article[data-trigram-learning]')).toHaveAttribute('data-trigram-learning',id);await expect(page.locator('h1')).toHaveText(a.title);await expect(page).toHaveTitle(`${a.title} | DestinyPixel`);await expect(page.locator('main')).toHaveAttribute('lang',tags[locale]);await diagram(page,id);
   for(const section of a.sections){await expect(page.locator(`#${section.id} h2`)).toHaveText(section.title);assert.deepEqual(await page.locator(`#${section.id} > p`).allTextContents(),section.paragraphs,`${locale}/${id}/${section.id}: complete localized text`);}
   await expect(page.locator('blockquote[lang="zh-Hant"]')).toHaveText(a.quote.text);await expect(page.locator('blockquote + p + p')).toHaveText(a.quote.translation);assert.deepEqual(await page.locator('#reflection li').allTextContents(),a.reflections);
   for(const related of a.relatedTrigrams)await expect(page.locator(`article a[href="/journal/trigram-${related}${suffix(locale)}"]`)).toHaveCount(1);
   for(const n of a.hexagramNumbers)await expect(page.locator(`#connections a[href="/journal/hexagram-${String(n).padStart(2,'0')}${suffix(locale)}"]`)).toHaveCount(1);
   await expect(page.locator('#sources a')).toHaveAttribute('href',/zh\.wikisource\.org\/w\/index\.php\?title=.*oldid=/);
   const dimensions=await fit(page,`${locale}/${id}/${width}`);
   const anchors=await page.locator('aside nav a').evaluateAll(es=>es.map(e=>e.hash));for(const hash of anchors){await expect(page.locator(hash)).toHaveCount(1);await page.locator(`aside nav a[href="${hash}"]`).click();await expect(page).toHaveURL(u=>u.hash===hash);const top=await page.locator(hash).evaluate(e=>e.getBoundingClientRect().top);assert.ok(top>=-1&&top<height,`${locale}/${id}/${width}: unreachable ${hash}`);}
   report.views.push({path:`/journal/trigram-${id}`,locale,width,height,dimensions,sections:a.sections.length,anchors:anchors.length});
   if(id==='qian'||(id==='gen'&&width===320)){await page.evaluate(()=>scrollTo(0,0));await screenshot(page,`${locale}-trigram-${id}-${width}.png`);}
  });
  await run(`${locale}: trigram keyboard, language and back/forward workflow`,async()=>{
   await page.setViewportSize({width:390,height:844});await page.goto(url('/journal/trigrams',locale));const link=page.locator(`a[href="/journal/trigram-qian${suffix(locale)}"]`);await link.focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(url('/journal/trigram-qian',locale));await page.goBack();await expect(page).toHaveURL(url('/journal/trigrams',locale));await page.goForward();await expect(page).toHaveURL(url('/journal/trigram-qian',locale));
   const next=locales[(locales.indexOf(locale)+1)%locales.length];await page.locator(`header a[hreflang="${tags[next]}"]`).click();await expect(page).toHaveURL(url('/journal/trigram-qian',next));await expect(page.locator('main')).toHaveAttribute('lang',tags[next]);await page.goBack();await expect(page).toHaveURL(url('/journal/trigram-qian',locale));
   await screenshot(page,`${locale}-trigram-qian-390.png`);await page.locator('#tradition').evaluate(e=>e.scrollIntoView({block:'start'}));await screenshot(page,`${locale}-trigram-qian-body-390.png`);if(locale==='zh'){await page.locator('#figure').evaluate(e=>e.scrollIntoView({block:'start'}));await screenshot(page,'zh-trigram-qian-figure-390.png');}report.workflows.push({locale,trigramKeyboardNavigation:true,trigramLanguageHistory:true});
  });
 }
}
async function checkSsr(){
 const c=await browser.newContext({javaScriptEnabled:false});const p=await c.newPage();await p.route('**/*',r=>r.abort());report.ssr=[];
 for(const locale of locales)for(const path of ['/iching','/journal/trigrams',...Object.keys(trigramBits).map(id=>`/journal/trigram-${id}`)])await run(`${locale}/${path}: Googlebot SSR and reciprocal metadata`,async()=>{
  const response=await fetch(url(path,locale),{headers:{'User-Agent':'Googlebot'}});const html=await response.text();assert.equal(response.status,200);await p.setContent(html);const canonical=`https://www.destinypixel.com${path}${suffix(locale)}`;
  await expect(p.locator('main')).toHaveAttribute('lang',tags[locale]);await expect(p.locator('link[rel=canonical]')).toHaveAttribute('href',canonical);
  const alternates=await p.locator('link[rel=alternate][hreflang]').evaluateAll(es=>es.map(e=>({lang:e.hreflang,href:e.href})));assert.equal(alternates.length,5);
  for(const language of locales)assert.ok(alternates.some(a=>a.lang===tags[language]&&a.href===`https://www.destinypixel.com${path}${suffix(language)}`),`${path}/${locale}: reciprocal ${language}`);assert.ok(alternates.some(a=>a.lang==='x-default'&&a.href===`https://www.destinypixel.com${path}`));
  const description=await p.locator('meta[name=description]').getAttribute('content');assert.ok(description.length>30);assert.ok((await p.locator('h1').textContent()).trim());assert.ok((await p.locator('main').textContent()).length>400);assert.ok(!(response.headers.get('x-robots-tag')??'').includes('noindex'));
  const schemas=await p.locator('script[type="application/ld+json"]').evaluateAll(es=>es.flatMap(e=>{const data=JSON.parse(e.textContent);return Array.isArray(data)?data:[data];}));assert.ok(schemas.length>0);assert.ok(schemas.some(s=>s.inLanguage===tags[locale]));
  report.ssr.push({path,locale,status:response.status,canonical,alternates:alternates.length,schemas:schemas.map(s=>s['@type']),htmlBytes:Buffer.byteLength(html)});
 });
 await run('Four-language I Ching and all 32 trigram articles present in sitemap',async()=>{
  const response=await fetch(new URL('/sitemap.xml',base));assert.equal(response.status,200);const text=await response.text();const locations=[...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1].replaceAll('&amp;','&'));assert.equal(locations.length,new Set(locations).size,'Duplicate sitemap entries');
  const expected=locales.flatMap(locale=>['/iching','/journal/trigrams',...Object.keys(trigramBits).map(id=>`/journal/trigram-${id}`)].map(path=>`https://www.destinypixel.com${path}${suffix(locale)}`));for(const location of expected)assert.ok(locations.includes(location),`Missing sitemap URL ${location}`);report.sitemap={allUrls:locations.length,expectedUrls:expected.length,duplicates:0};
 });await c.close();
}
async function fit(page,label){
 const dimensions=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
 assert.ok(dimensions.document<=dimensions.viewport+1,`${label}: horizontal overflow ${JSON.stringify(dimensions)}`);
 if(new URL(page.url()).pathname==='/iching'){
  const clipped=await page.locator('main button, main input, main select, main textarea, [data-iching-result] h3').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({tag:e.tagName,text:e.textContent.slice(0,70),left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right,scroll:e.scrollWidth,width:e.clientWidth})).filter(e=>e.left< -1||e.right>innerWidth+1||(e.tag==='H3'&&e.scroll>e.width+1)));
  assert.deepEqual(clipped,[],`${label}: clipped or offscreen controls/result names`);
 }
 return dimensions;
}
async function screenshot(page,name){await page.screenshot({path:resolve(out,name)});report.screenshots.push(name);}
async function run(label,task){
 try{await task();report.checks.push({label,status:'passed'});console.log(`PASS ${label}`);}
 catch(error){report.checks.push({label,status:'failed'});report.failures.push({label,error:error.stack});console.error(`FAIL ${label}: ${error.message}`);}
 writeFileSync(resolve(out,'progress.json'),JSON.stringify({views:report.views.length,workflows:report.workflows.length,failures:report.failures,lastCheck:label},null,2)+'\n');
}

try{
 // Interaction and learning checks are populated against the completed UI below.
 const c=await context();const page=await c.newPage();
 for(const locale of locales)for(const [width,height] of [[320,568],[390,844],[430,932],[1440,900]]){
  await run(`${locale}/${width}: I Ching route, localization and responsive fit`,async()=>{
   await page.setViewportSize({width,height});const response=await page.goto(url('/iching',locale));assert.equal(response.status(),200);
   await expect(page.locator('h1')).toBeVisible();await expect(page.locator('main')).toHaveAttribute('lang',tags[locale]);
   await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',`https://www.destinypixel.com/iching${suffix(locale)}`);
   const dimensions=await fit(page,`${locale}/${width}`);report.views.push({path:'/iching',locale,width,height,dimensions});
   await screenshot(page,`${locale}-iching-${width}.png`);
  });
 }
 if(process.env.QA_PHASE!=='responsive'){
 for(const locale of locales){
  await run(`${locale}: homepage I Ching entry and preserved Tarot navigation`,async()=>{
   await page.setViewportSize({width:390,height:844});await page.goto(url('/',locale));
   const entry=page.locator(`[data-section-navigation] a[href="/iching${suffix(locale)}"]`);await expect(entry).toHaveCount(1);await entry.focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(url('/iching',locale));
   await page.goBack();await expect(page).toHaveURL(url('/',locale));await fit(page,`${locale}: home`);
   await page.goto(url('/tarot',locale));await expect(page.locator('#table')).toHaveAttribute('aria-busy','false');await expect(page.locator('[data-tarot-navigation]')).toHaveCount(1);await expect(page.locator('[data-section-navigation]')).toHaveCount(0);
   assert.deepEqual(await page.locator('[data-tarot-navigation] a').evaluateAll(es=>es.map(e=>e.getAttribute('href'))),[`/tarot${suffix(locale)}#table`,`/journal/tarot-cards${suffix(locale)}`,`/journal/how-to-connect-three-tarot-cards${suffix(locale)}`]);
   await fit(page,`${locale}: tarot`);await screenshot(page,`${locale}-tarot-preserved-390.png`);
   await page.locator('[data-tarot-navigation] a').nth(1).click();await expect(page).toHaveURL(url('/journal/tarot-cards',locale));await expect(page.locator('[data-tarot-navigation]')).toHaveCount(1);await expect(page.locator('[data-section-navigation]')).toHaveCount(0);
   await expect(page.locator('h1')).toBeVisible();await fit(page,`${locale}: tarot library`);await page.goBack();await expect(page).toHaveURL(url('/tarot',locale));
   report.workflows.push({locale,homepageEntry:true,tarotNavigationPreserved:true,tarotLibraryBack:true});
  });
 }
 for(const locale of ['en','zh']){
  await run(`${locale}: tools-directory I Ching entry`,async()=>{
   await page.goto(url('/tools',locale));const entry=page.locator('a[data-analytics-tool="iching"]');await expect(entry).toHaveAttribute('href',`/iching${suffix(locale)}`);
   await entry.click();await expect(page).toHaveURL(url('/iching',locale));await expect(page.locator('main')).toHaveAttribute('lang',tags[locale]);await page.goBack();await expect(page).toHaveURL(url('/tools',locale));
   report.workflows.push({locale,toolsDirectoryEntry:true,back:true});
  });
 }
 await checkLearning(page);
 await c.close();
 await checkReducedWorkflows();
 await checkAnimatedWorkflows();
 await checkSsr();
 }else await c.close();
 await run('No application page errors, failed resources or API writes',async()=>{assert.deepEqual(report.pageErrors,[]);assert.deepEqual(report.httpErrors,[]);assert.deepEqual(report.blockedRequests.filter(r=>r.method!=='GET'),[]);});
}catch(error){report.failures.push({label:'unexpected browser failure',error:error.stack});}
finally{
 report.status=report.failures.length?'failed':'passed';report.finishedAt=new Date().toISOString();report.totals={checks:report.checks.length,views:report.views.length,workflows:report.workflows.length,ssr:report.ssr?.length??0,screenshots:report.screenshots.length,pageErrors:report.pageErrors.length,consoleErrors:report.consoleErrors.length,httpErrors:report.httpErrors.length,failures:report.failures.length};
 writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');await browser.close();
}
if(report.failures.length)process.exitCode=1;
