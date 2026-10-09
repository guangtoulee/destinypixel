import { openTarotSettings } from "./tarot-browser-helpers.mjs";
// Actual browser gestures and order checks. AI response is a local fixture; no writes leave the browser.
import assert from "node:assert/strict";
import {createRequire} from "node:module";
const {chromium,expect}=createRequire(import.meta.url)("playwright/test");
const base=process.argv[2] || "http://127.0.0.1:3015";
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || "/usr/bin/chromium",args:["--no-sandbox"]});
try {
 // These cases assert window focus. Opening another page in parallel can
 // dispatch blur and intentionally cancel the active deck animation.
 for (const locale of ["en","zh","zh-TW","ru"]) {
  for(const reducedMotion of ["reduce","no-preference"]){
   const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));page.on("dialog",d=>d.accept());
   await page.route("**/*",route=>{
    const r=route.request();
    if(new URL(r.url()).origin!==new URL(base).origin)return route.abort();
    if(r.method()==="GET")return route.continue();
    if(new URL(r.url()).pathname==="/api/tarot")return route.fulfill({json:{reading:{summary:"Local fixture reading",sections:[{title:"A",body:"One"},{title:"B",body:"Two"},{title:"C",body:"Three"}],reflection:"Fixture reflection"}}});
    return route.abort();
   });
   await page.goto(`${base}/tarot?locale=${locale}`);
   await expect(page.locator("#table")).toHaveAttribute("aria-busy","false");
   await openTarotSettings(page);
   await page.locator(".tarot-controls [role=tab]").last().click();
   const top=page.locator(".tarot-deck-top"),deck=page.locator(".tarot-bottom-deck"),stack=page.locator(".tarot-deck-stack");
   await deck.locator(".cel-button").click();await expect(top).toBeEnabled();
   const initial=await top.getAttribute("data-card-id"),count=await page.locator(".tarot-deck-label span").innerText();
   async function liftReturn(){
    await top.scrollIntoViewIfNeeded();const r=await top.boundingBox(),x=r.x+r.width/2,y=r.y+r.height/2;
    await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x,y-85,{steps:8});
    await page.mouse.move(x,y,{steps:8});await expect(stack).toHaveClass(/is-return-target/);await page.mouse.up();
   }
   await liftReturn();
   await expect(top).not.toHaveAttribute("data-card-id",initial);
   await expect(page.locator(".tarot-free-card")).toHaveCount(0);
   if(reducedMotion==="no-preference"){
    await page.waitForFunction(()=>{const card=document.querySelector(".tarot-tucking-card"),layers=document.querySelector(".tarot-stack-layers");return card && layers && getComputedStyle(card).zIndex==="0" && getComputedStyle(layers).zIndex==="1";},null,{polling:"raf"});
   }else await expect(page.locator(".tarot-tucking-card")).toHaveCount(0);
   await expect(deck).toHaveAttribute("aria-busy","false");
   const second=await top.getAttribute("data-card-id");assert.notEqual(second,initial);
   // Keyboard cycling must keep focus, and one complete tour must restore the original top.
   const seen=new Set([initial,second]);
   await top.focus();await page.keyboard.press("ArrowDown");await expect(deck).toHaveAttribute("aria-busy","false");
   await expect(top).toBeFocused();const third=await top.getAttribute("data-card-id");assert.ok(!seen.has(third));seen.add(third);
   if(reducedMotion==="reduce"){
    for(let i=0;i<75;i++){await top.press("ArrowDown");const id=await top.getAttribute("data-card-id");assert.ok(!seen.has(id));seen.add(id);}
    assert.equal(seen.size,78);await top.press("ArrowDown");await expect(top).toHaveAttribute("data-card-id",initial);
   }
   assert.equal(await page.locator(".tarot-deck-label span").innerText(),count);
   // Repeated intentional releases, including actual touch, each advance exactly once.
   const cdp=await page.context().newCDPSession(page);
   await top.scrollIntoViewIfNeeded();let r=await top.boundingBox(),current=await top.getAttribute("data-card-id");
   const touch=(type,points)=>cdp.send("Input.dispatchTouchEvent",{type,touchPoints:points});
   await touch("touchStart",[{x:r.x+r.width/2,y:r.y+r.height/2}]);
   await touch("touchMove",[{x:r.x+r.width/2,y:r.y-30}]);await touch("touchMove",[{x:r.x+r.width/2,y:r.y+r.height/2}]);
   await touch("touchEnd",[]);await expect(top).not.toHaveAttribute("data-card-id",current);await expect(deck).toHaveAttribute("aria-busy","false");
   current=await top.getAttribute("data-card-id");r=await top.boundingBox();
   await touch("touchStart",[{x:r.x+r.width/2,y:r.y+r.height/2}]);await touch("touchMove",[{x:r.x+r.width/2,y:r.y-30}]);await touch("touchCancel",[]);
   await expect(deck).not.toHaveClass(/is-lifting/);await expect(top).toHaveAttribute("data-card-id",current);
   if(reducedMotion==="no-preference"){
    await liftReturn();await expect(top).not.toHaveAttribute("data-card-id",current);
    current=await top.getAttribute("data-card-id");
    await page.evaluate(()=>window.dispatchEvent(new Event("blur")));
    await expect(deck).toHaveAttribute("aria-busy","false");
    await page.waitForTimeout(450);
    await expect(top).toHaveAttribute("data-card-id",current);
    await expect(page.locator(".tarot-tucking-card")).toHaveCount(0);
   }
   // Small drag jitter is not an intentional lift-and-return.
   r=await top.boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();
   await page.mouse.move(r.x+r.width/2,r.y+r.height/2-12,{steps:3});await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.up();
   await expect(top).toHaveAttribute("data-card-id",current);await expect(page.locator(".tarot-free-card")).toHaveCount(0);
   // Losing capture/blur and dropping outside both targets are cancellations.
   for(const finish of ["outside","blur","capture"]){
    r=await top.boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width/2,r.y-50,{steps:5});
    if(finish==="outside")await page.mouse.move(1,r.y,{steps:5});
    if(finish==="blur")await page.evaluate(()=>window.dispatchEvent(new Event("blur")));
    if(finish==="capture")await top.evaluate(e=>{if(e.hasPointerCapture(1))e.releasePointerCapture(1)});
    await page.mouse.up();await expect(top).toHaveAttribute("data-card-id",current);await expect(page.locator(".tarot-free-card")).toHaveCount(0);
   }
   // Deal exactly the current top, then preserve its meaning/question/mock reading while cycling the remainder.
   await top.press("Enter");const placed=page.locator(".tarot-free-card");await expect(placed).toHaveAttribute("data-card-id",current);await placed.press("Enter");
   await page.locator("#tarot-question-title").fill("Synthetic question");await page.locator("#tarot-question-details").fill("Synthetic context");
   await page.locator(".cel-reading-head .cel-button").click();await expect(page.locator(".cel-reading-summary")).toHaveText("Local fixture reading");
   const face=await placed.locator("img").getAttribute("style");
   for(let i=0;i<3;i++){await liftReturn();await expect(deck).toHaveAttribute("aria-busy","false");}
   await expect(placed).toHaveAttribute("data-card-id",current);assert.equal(await placed.locator("img").getAttribute("style"),face);
   await expect(page.locator("#tarot-question-title")).toHaveValue("Synthetic question");await expect(page.locator(".cel-reading-summary")).toHaveText("Local fixture reading");
   await placed.press("Enter");await expect(page.locator(".tarot-art-versions, .tarot-art-version-options")).toHaveCount(0);
   await expect(page.locator(".tarot-dialog-source a")).toHaveAttribute("href","/tarot/attribution.json");await page.keyboard.press("Escape");
   // Structured mode still deals the advanced top into the selected slot.
   await page.locator(".tarot-controls [role=tab]").first().click();await openTarotSettings(page);await page.locator(".tarot-select select").selectOption("single");
   await deck.locator(".cel-button").click();await expect(top).toBeEnabled();await top.press("ArrowDown");await expect(deck).toHaveAttribute("aria-busy","false");
   const selected=await top.getAttribute("data-card-id");await top.press("Enter");await page.locator("[data-drop-slot='0']").press("Enter");
   await expect(page.locator("[data-drop-slot='0'] img")).toHaveAttribute("src",`/tarot/rws/${selected}.webp`);
   assert.deepEqual(errors,[]);console.log(`PASS ${locale}/${reducedMotion}: real deck order, tuck layers, keyboard/touch, repeated/cancelled drops, reading preservation, structured deal, no version UI`);await page.close();
  }
 }
}finally{await browser.close();}
