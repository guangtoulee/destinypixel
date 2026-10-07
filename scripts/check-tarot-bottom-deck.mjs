// Local-only interaction checks; no AI, account, payment or analytics requests.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
const { chromium, expect } = createRequire(import.meta.url)("playwright/test");
const base = process.argv[2] || "http://127.0.0.1:3010";
const evidence = process.env.QA_EVIDENCE_DIR;
if (evidence) await mkdir(evidence, {recursive: true});
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", args: ["--no-sandbox"]});
let cases = 0;
try {
  await Promise.all(["en", "zh", "zh-TW", "ru"].map(async locale => {
  for (const width of [320, 390, 430, 1440]) {
    const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: width === 390 ? "no-preference" : "reduce"});
    const errors = [];
    let acceptDialogs = true;
    page.on("dialog", dialog => acceptDialogs ? dialog.accept() : dialog.dismiss());
    const cdp = await page.context().newCDPSession(page);
    page.on("pageerror", error => errors.push(error.message));
    await page.route("**/*", route => {
      const r = route.request();
      return new URL(r.url()).origin === new URL(base).origin && ["GET", "HEAD"].includes(r.method()) ? route.continue() : route.abort();
    });
    await page.goto(`${base}/tarot?locale=${locale}`);
    await expect(page.locator("#table")).toHaveAttribute("aria-busy", "false");
    const top = page.locator(".tarot-deck-top");
    const shuffle = page.locator(".tarot-bottom-deck .cel-button");
    const board = page.locator("#tarot-board");
    const tabs = page.locator(".tarot-controls [role=tab]");
    await expect(top).toBeDisabled();
    await tabs.last().click();
    await shuffle.click();
    await expect(top).toBeEnabled();
    // Repeated keyboard/tap deals preserve 78 unique cards across deck and table.
    await top.press("Enter"); await top.click(); await top.click();
    const free = page.locator(".tarot-free-card");
    await expect(free).toHaveCount(3);
    assert.equal(new Set(await free.evaluateAll(cards => cards.map(c => c.dataset.cardId))).size, 3);
    assert.match(await page.locator(".tarot-deck-label span").innerText(), /75/);
    // Keep deck and target visible together, then draw with real pointer capture.
    await page.locator(".tarot-bottom-deck").scrollIntoViewIfNeeded();
    let d = await top.boundingBox(), b = await board.boundingBox();
    const target = {x: b.x + b.width * .7, y: Math.max(30, b.y + b.height * .65)};
    await page.mouse.move(d.x+d.width/2,d.y+d.height/2); await page.mouse.down();
    await page.mouse.move(target.x,target.y,{steps:18});
    await expect(page.locator(".tarot-drag-ghost")).toHaveCSS("visibility","visible");
    await page.mouse.up();
    await expect(free).toHaveCount(4);
    await expect(board.locator("img")).toHaveCount(0);
    // Outside release cancels, never deals or flips.
    d = await top.boundingBox();
    await page.mouse.move(d.x+d.width/2,d.y+d.height/2); await page.mouse.down();
    await page.mouse.move(2,d.y,{steps:8}); await page.mouse.up();
    await expect(free).toHaveCount(4);
    // Cancel an in-flight deck gesture. A subsequent tap must still work.
    await cdp.send("Input.dispatchTouchEvent", {type:"touchStart",touchPoints:[{x:d.x+d.width/2,y:d.y+d.height/2}]});
    await cdp.send("Input.dispatchTouchEvent", {type:"touchCancel",touchPoints:[]});
    await expect(page.locator(".tarot-drag-ghost")).toHaveCSS("visibility","hidden");
    // Drag a placed card without flipping, then rotate using the accessible control.
    await free.first().scrollIntoViewIfNeeded();
    const first = free.first(), before = await first.getAttribute("style"), r = await first.boundingBox();
    await page.mouse.move(r.x+r.width/2,r.y+r.height/2); await page.mouse.down();
    await page.mouse.move(r.x+r.width/2+20,r.y+r.height/2+45,{steps:12}); await page.mouse.up();
    assert.notEqual(await first.getAttribute("style"),before);
    await expect(board.locator("img")).toHaveCount(0);
    await page.locator(".tarot-table-toolbar button").nth(1).click();
    assert.match(await first.getAttribute("style"),/rotate\(15deg\)/);
    // Touch cancellation restores the committed position.
    const committed = await first.getAttribute("style");
    const touch = await first.boundingBox();
    await cdp.send("Input.dispatchTouchEvent", {type:"touchStart",touchPoints:[{x:touch.x+touch.width/2,y:touch.y+touch.height/2}]});
    await cdp.send("Input.dispatchTouchEvent", {type:"touchMove",touchPoints:[{x:touch.x+touch.width/2+35,y:touch.y+touch.height/2+30}]});
    await cdp.send("Input.dispatchTouchEvent", {type:"touchCancel",touchPoints:[]});
    assert.equal(await first.getAttribute("style"),committed);
    await first.press("Enter"); await first.press("Enter");
    await expect(page.locator("dialog[open]")).toHaveCount(1);
    await page.locator(".tarot-dialog-tabs button").last().click();
    await expect(page.locator(".tarot-dialog-art")).toBeVisible();
    await page.goBack();
    await expect(page.locator("dialog[open]")).toHaveCount(0);
    await expect(free).toHaveCount(4);
    await first.press("Enter");
    await expect(page.locator("dialog[open]")).toHaveCount(1);
    await expect(page.locator(".tarot-dialog-meaning")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog[open]")).toHaveCount(0);
    if (evidence) {
      await board.scrollIntoViewIfNeeded();
      await page.screenshot({path:`${evidence}/free-${locale}-${width}.png`});
    }
    // Declining a mode change keeps every card. Accepting makes the reset explicit.
    acceptDialogs = false; await tabs.first().click();
    await expect(free).toHaveCount(4);
    acceptDialogs = true; await tabs.first().click();
    await expect(free).toHaveCount(0); await expect(top).toBeDisabled();
    cases++;
    for (const [spread,size] of [["single",1],["three",3],["relationship",5],["choice",5],["celtic",10]]) {
      await page.locator(".tarot-select select").selectOption(spread);
      await expect(board.locator("[data-drop-slot]")).toHaveCount(size);
      await shuffle.click(); await expect(top).toBeEnabled();
      for (let i=0;i<size;i++) await top.press("Enter");
      await expect(board.locator(".tarot-flipper")).toHaveCount(size);
      // A completed spread may scroll into view. Wait for that movement before pointer actions.
      await page.evaluate(() => new Promise(resolve => {
        let previous = scrollY, stable = 0;
        const frame = () => { stable = Math.abs(scrollY - previous) < .5 ? stable + 1 : 0; previous = scrollY; if (stable >= 4) resolve(); else requestAnimationFrame(frame); };
        requestAnimationFrame(frame);
      }));
      for (let i=0;i<size;i++) {
        await board.locator(".tarot-slot-label").nth(i).click();
        await expect(board.locator(".tarot-slot-label").nth(i)).toHaveAttribute("aria-pressed", "true");
        await page.locator(".tarot-table-toolbar button").first().click();
        await expect(board.locator("[data-drop-slot]").nth(i).locator("img")).toHaveCount(1);
      }
      await expect(board.locator("img")).toHaveCount(size);
      assert.equal(new Set(await board.locator("img").evaluateAll(imgs=>imgs.map(i=>i.src))).size,size);
      await page.locator(".tarot-table-toolbar button").last().click();
      await expect(board.locator(".tarot-flipper")).toHaveCount(size-1);
      await top.press("Enter");
      await expect(board.locator(".tarot-flipper")).toHaveCount(size);
    }
    const overflow = await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert.ok(overflow <= 1,`${locale}/${width}: horizontal overflow ${overflow}`);
    if (evidence) {await board.scrollIntoViewIfNeeded(); await page.screenshot({path:`${evidence}/spread-${locale}-${width}.png`});}
    await page.setViewportSize({width:900,height:width});
    await expect(board.locator(".tarot-flipper")).toHaveCount(10);
    assert.deepEqual(errors,[]);
    cases++;
    console.log(`PASS ${locale} ${width}: free + five spreads, details/back, cancellation, reset, rotation, orientation`);
    await page.close();
  }
  }));
  console.log(`PASS ${cases}/32 mode/locale/viewport cases`);
} finally { await browser.close(); }
