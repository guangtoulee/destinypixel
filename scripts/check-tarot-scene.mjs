import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const {chromium,expect}=createRequire(import.meta.url)('playwright/test');
const base=process.argv[2]||'http://localhost:3044';
const output=process.env.QA_EVIDENCE_DIR||'/workspace/artifacts/tarot-scene-20261009/scene';
mkdirSync(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const results=[];
try{for(const locale of ['zh','zh-TW','en','ru'])for(const [width,height] of [[360,800],[390,844],[430,932],[1165,757],[1280,720],[1440,860],[1440,900]]){
 const page=await browser.newPage({viewport:{width,height},reducedMotion:width===360?'reduce':'no-preference'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>r.request().method()==='GET'&&new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());
 await page.goto(`${base}/tarot?locale=${locale}`);await expect(page.locator('#table')).toHaveAttribute('aria-busy','false');
 await page.waitForTimeout(950);
 const shuffle=page.locator('.tarot-bottom-deck .cel-button'),draw=page.locator('.tarot-draw-action');
 const initialBox=await shuffle.boundingBox();assert.ok(initialBox.y+initialBox.height<=height,`${locale}/${width}: shuffle outside first screen ${JSON.stringify(initialBox)}`);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${locale}/${width}: overflow`);
 await expect(page.locator('.tarot-fan-choice')).toHaveCount(6);
 const fanBounds=await page.locator('.tarot-fan-choice,.tarot-deck-top').evaluateAll(cards=>{const boxes=cards.map(c=>c.getBoundingClientRect());return {width:Math.max(...boxes.map(b=>b.right))-Math.min(...boxes.map(b=>b.left)),centerWidth:boxes.at(-1).width,top:Math.min(...boxes.map(b=>b.top)),bottom:Math.max(...boxes.map(b=>b.bottom))};});
 assert.ok(fanBounds.width>=(width<740?250:500)&&fanBounds.width<=(width<740?310:600),`${locale}/${width}: fan size ${JSON.stringify(fanBounds)}`);
 assert.ok(fanBounds.top>=0&&fanBounds.bottom<=height,`${locale}/${width}x${height}: fan clipped by viewport ${JSON.stringify(fanBounds)}`);
 await page.screenshot({path:`${output}/${locale}-${width}x${height}-initial.png`});
 await shuffle.click();await expect(draw).toBeEnabled();
 // Select an exposed part of an outer card with a real pointer, not force-click.
 const choice=page.locator('.tarot-fan-choice').first();
 const point=await choice.evaluate(button=>{const r=button.getBoundingClientRect();for(let y=r.top+8;y<Math.min(innerHeight,r.bottom)-8;y+=6)for(let x=Math.max(1,r.left+8);x<Math.min(innerWidth,r.right)-8;x+=6)if(document.elementFromPoint(x,y)?.closest('button')===button)return{x,y};return null;});
 assert.ok(point,`${locale}/${width}: fan choice not exposed`);await page.mouse.click(point.x,point.y);
 await expect(page.locator('#tarot-board .tarot-flipper')).toHaveCount(1);
 await draw.press('Enter');await expect(page.locator('#tarot-board .tarot-flipper')).toHaveCount(2);await draw.press('Enter');await expect(page.locator('#tarot-board .tarot-flipper')).toHaveCount(3);
 for(const slot of await page.locator('[data-drop-slot]').all())await slot.press('Enter');
 await expect(page.locator('#tarot-board img')).toHaveCount(3);
 const sources=await page.locator('#tarot-board img').evaluateAll(images=>images.map(i=>i.src));assert.equal(new Set(sources).size,3);
 await page.locator('#tarot-board').scrollIntoViewIfNeeded();
 await page.waitForTimeout(width===360?80:650);
 if(width>=1000&&height<=800){
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  const visible=await page.locator('.tarot-draw-action,#tarot-board .tarot-slot-card').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return{top:r.top,bottom:r.bottom};}));
  assert.ok(visible.every(r=>r.top>=0&&r.bottom<=height),`${locale}/${width}x${height}: action or revealed cards clipped ${JSON.stringify(visible)}`);
 }
 await page.screenshot({path:`${output}/${locale}-${width}x${height}-revealed.png`});
 if(width===360){await expect(page.locator('.tarot-scene-haze').first()).toHaveCSS('animation-name','none');await expect(page.locator('.tarot-flipper').first()).toHaveCSS('transition-duration','0s');}
 else{assert.notEqual(await page.locator('.tarot-scene-haze').first().evaluate(e=>getComputedStyle(e).animationName),'none');}
 assert.deepEqual(errors,[]);results.push({locale,width,height,initialBox,fanBounds,fanPointer:true,threeUniqueCards:true});console.log(`PASS ${locale}/${width}: visible initial actions, real fan selection, reveal, motion fallback`);await page.close();
}}finally{await browser.close();writeFileSync(`${output}/results.json`,JSON.stringify(results,null,2));}
