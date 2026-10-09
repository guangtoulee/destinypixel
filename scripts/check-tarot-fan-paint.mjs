import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const require=createRequire(import.meta.url),{chromium,expect}=require('playwright/test'),sharp=require('sharp');
const base=process.argv[2]||'http://localhost:3050';
const out=process.env.QA_EVIDENCE_DIR||'/workspace/artifacts/tarot-clip-20261009/after';
const before=process.env.QA_ALLOW_PARENT_FILTER==='1';
const sizes=process.env.QA_CLIP_QUICK==='1'?[[2048,1136]]:[[1165,757],[1280,720],[2048,1136],[390,844]];
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const report={before,base,cases:[],errors:[]};
try{for(const [width,height] of sizes)for(const motion of ['no-preference','reduce']){
 const page=await browser.newPage({viewport:{width,height},reducedMotion:motion,deviceScaleFactor:width===2048?2:1});
 page.on('pageerror',e=>report.errors.push(e.message));
 await page.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin&&r.request().method()==='GET'?r.continue():r.abort());
 await page.goto(`${base}/tarot?locale=zh`);await expect(page.locator('#table')).toHaveAttribute('aria-busy','false');
 const stack=page.locator('.tarot-deck-stack'),deck=page.locator('.tarot-bottom-deck'),draw=page.locator('.tarot-draw-action'),shuffle=deck.locator('.cel-button');
 const states=[];
 async function settled(name,count,wait=2500){
  await page.mouse.move(5,5);await page.locator('.tarot-deck-top').evaluate(e=>e.blur());
  await expect(deck).toHaveAttribute('aria-busy','false');await page.waitForTimeout(wait);
  await expect(page.locator('.tarot-deck-label span')).toContainText(String(count));
  const a=await stack.evaluate(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();const cards=[...e.querySelectorAll('.tarot-fan-choice,.tarot-deck-top')].map(c=>{const b=c.getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height}});return{filter:s.filter,overflow:s.overflow,contain:s.contain,width:r.width,height:r.height,cards,active:e.getAnimations({subtree:true}).filter(a=>a.playState==='running').length};});
  assert.equal(a.active,0,`${width}/${motion}/${name}: card animation still running`);
  assert.equal(a.overflow,'visible');assert.equal(a.contain,'none');if(!before)assert.equal(a.filter,'none','fan parent must not rasterize overflowing cards into a single-card filter surface');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  // Probe exposed areas OUTSIDE the narrow center-card container on both wings.
  const wings=await page.locator('.tarot-fan-choice').evaluateAll(buttons=>[buttons[0],buttons.at(-1)].map(button=>{const r=button.getBoundingClientRect(),s=button.closest('.tarot-deck-stack').getBoundingClientRect();const found=[];for(let y=Math.max(1,r.top+8);y<Math.min(innerHeight,r.bottom)-8;y+=5)for(let x=Math.max(1,r.left+8);x<Math.min(innerWidth,r.right)-8;x+=5)if((x<s.left-8||x>s.right+8)&&document.elementFromPoint(x,y)?.closest('button')===button)found.push({x,y});return found.length?found[Math.floor(found.length/2)]:null;}));
  assert.ok(wings.every(Boolean),`${width}/${motion}/${name}: wing hit regions lost`);
  const bounds={x:Math.max(0,Math.floor(Math.min(...a.cards.map(c=>c.x))-25)),y:Math.max(0,Math.floor(Math.min(...a.cards.map(c=>c.y))-25))};
  bounds.width=Math.min(width-bounds.x,Math.ceil(Math.max(...a.cards.map(c=>c.x+c.width))-bounds.x+25));bounds.height=Math.min(height-bounds.y,Math.ceil(Math.max(...a.cards.map(c=>c.y+c.height))-bounds.y+25));
  // Read painted pixels, not only layout boxes: compositor clipping may leave hit regions intact.
  const probes=await page.locator('.tarot-fan-choice').evaluateAll(buttons=>[buttons[0],buttons.at(-1)].map((button,side)=>{
   const svg=button.querySelector('svg'),matrix=svg.getScreenCTM(),stack=button.closest('.tarot-deck-stack').getBoundingClientRect(),points=[];
   for(let y=35;y<=275;y+=10){
    const edge=new DOMPoint(side?172:8,y).matrixTransform(matrix),inside=new DOMPoint(side?162:18,y).matrixTransform(matrix);
    if(edge.x<1||edge.y<1||edge.x>=innerWidth-1||edge.y>=innerHeight-1||inside.x<1||inside.y<1||inside.x>=innerWidth-1||inside.y>=innerHeight-1)continue;
    if(!(edge.x<stack.left-8||edge.x>stack.right+8))continue;
    if(document.elementFromPoint(edge.x,edge.y)?.closest('button')!==button||document.elementFromPoint(inside.x,inside.y)?.closest('button')!==button)continue;
    points.push({edge:{x:edge.x,y:edge.y},inside:{x:inside.x,y:inside.y}});
   }return points;
  }));
  const png=await page.screenshot({path:`${out}/${width}-${motion}-${name}.png`,clip:bounds});
  const {data,info}=await sharp(png).removeAlpha().raw().toBuffer({resolveWithObject:true}),scale=info.width/bounds.width;
  function colorAt(point){const x=Math.max(0,Math.min(info.width-1,Math.round((point.x-bounds.x)*scale))),y=Math.max(0,Math.min(info.height-1,Math.round((point.y-bounds.y)*scale))),i=(y*info.width+x)*3;return[data[i],data[i+1],data[i+2]];}
  const paint=probes.map(points=>({probes:points.length,painted:points.filter(({edge,inside})=>{
   const inner=colorAt(inside);if(inner[2]<inner[0]+8)return false;
   for(let dx=-1;dx<=1;dx+=.5)for(let dy=-1;dy<=1;dy+=.5){const c=colorAt({x:edge.x+dx,y:edge.y+dy});if(c[0]>c[2]+12&&c[0]>inner[0]+20)return true;}return false;
  }).length}));
  assert.ok(paint.every(p=>p.painted>=3),`${width}/${motion}/${name}: outer card borders are not painted ${JSON.stringify(paint)}`);
  states.push({name,count,...a,wings,paint});return wings;
 }
 await settled('initial-78',78,10000);
 const primary=await shuffle.boundingBox();assert.ok(primary.y>=0&&primary.y+primary.height<=height,'primary action below fold');
 await shuffle.click();await expect(draw).toBeEnabled();await settled('shuffled-78',78);
 await page.locator('.tarot-fan-choice').first().hover({force:true});await page.waitForTimeout(450);const wing=await settled('hover-ended-78',78);
 await page.mouse.click(wing[0].x,wing[0].y);await expect(page.locator('#tarot-board .tarot-flipper')).toHaveCount(1);
 await draw.press('Enter');await expect(page.locator('#tarot-board .tarot-flipper')).toHaveCount(2);await draw.press('Enter');await expect(page.locator('#tarot-board .tarot-flipper')).toHaveCount(3);
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await settled('placed-75',75);
 await shuffle.click();await expect(draw).toBeEnabled();await settled('reshuffled-75',75);
 await page.locator('.tarot-fan-choice').last().hover({force:true});await page.waitForTimeout(450);const end=await settled('hover-ended-75',75);
 await page.mouse.click(end[1].x,end[1].y);await expect(page.locator('#tarot-board .tarot-flipper')).toHaveCount(3);await expect(page.locator('.tarot-deck-label span')).toContainText('75');
 assert.ok(states.every(s=>s.width===states[s.count===78?0:3].width),'unexpected idle size change');
 report.cases.push({width,height,motion,states,wingPointerSelection:true});console.log(`PASS ${width}x${height}/${motion}: six settled states, both exposed wings, hit selection, primary action`);await page.close();
}assert.deepEqual(report.errors,[]);}finally{await browser.close();writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));}
