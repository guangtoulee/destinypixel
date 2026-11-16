/**
 * Local-only browser regression. No production dependencies are added.
 * node scripts/check-tarot-a11y.mjs http://127.0.0.1:3049
 * QA_EVIDENCE_DIR=/absolute/output QA_MOTION=reduce QA_LOCALES=en QA_WIDTHS=390
 * Uses the existing Playwright/axe-core tools; QA_TOOLS_DIR can name a separate
 * tools directory. Violations and functional/scanner errors fail the run;
 * incomplete results remain explicit manual-review items, never a WCAG score.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(process.env.QA_TOOLS_DIR
  ? path.join(path.resolve(process.env.QA_TOOLS_DIR), "package.json")
  : import.meta.url);
const { chromium, expect } = require("playwright/test");
const axePath = require.resolve("axe-core/axe.min.js");
const base = new URL(process.argv[2] || "http://127.0.0.1:3049");
assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(base.hostname), "Loopback base URL required");
assert.equal(base.protocol, "http:", "Use the isolated local HTTP server");
assert.ok(!base.username && !base.password && !base.search && !base.hash && base.pathname === "/", "Pass an origin only");
const out = path.resolve(process.env.QA_EVIDENCE_DIR || "work/tarot-a11y-evidence");
const motion = process.env.QA_MOTION || "no-preference";
assert.ok(["no-preference", "reduce"].includes(motion));
const locales = (process.env.QA_LOCALES || "en,zh").split(",");
const widths = (process.env.QA_WIDTHS || "1440,390").split(",").map(Number);
assert.ok(locales.every(l => ["en", "zh"].includes(l)) && locales.length);
assert.ok(widths.every(w => [1440, 390].includes(w)) && widths.length);
for (const dir of [out, path.join(out, "axe"), path.join(out, "screenshots")]) fs.mkdirSync(dir, { recursive: true });

const report = {
  startedAt: new Date().toISOString(), base: base.origin, motion,
  tools: { playwright: require("playwright/package.json").version, axe: require("axe-core/package.json").version, node: process.version },
  policy: "Loopback GET only; API, telemetry, other origins, service workers and WebSockets blocked. No AI, personal data, account writes, keepsake opening or export.",
  scope: { locales, widths, heights: { 1440: 900, 390: 844 } },
  states: [], checks: [], flows: [], failures: [], scannerErrors: [],
  limitations: ["Headless Chromium viewports are not physical mobile/assistive-technology tests.", "Automated rules and incomplete results do not establish full WCAG conformance."]
};
const save = () => fs.writeFileSync(path.join(out, "results.json"), JSON.stringify(report, null, 2));
const href = (route, locale) => route + (locale === "en" ? "" : "?locale=zh");
const openDialog = page => page.locator(".tarot-card-dialog[open]");

async function settled(page) {
  await page.evaluate(async () => { await document.fonts.ready; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); });
}

async function tabTo(page, locator) {
  await expect(locator).toHaveCount(1);
  await expect(locator).toBeVisible();
  for (let i = 0; i < 180; i++) {
    if (await locator.evaluate(el => el === document.activeElement)) return i;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Tab could not reach ${await locator.evaluate(el => el.outerHTML.slice(0, 180))}`);
}

async function keyboardNavigate(page, locator, route, locale) {
  await tabTo(page, locator);
  await Promise.all([
    page.waitForURL(url => url.pathname === route && (url.searchParams.get("locale") || "en") === locale),
    page.keyboard.press("Enter")
  ]);
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("main[data-server-localized]")).toHaveAttribute("lang", locale === "zh" ? "zh-Hans" : "en");
  if (route === "/tarot") await expect(page.locator("#table")).toHaveAttribute("aria-busy", "false");
}

async function geometry(locator) {
  return locator.evaluate(el => {
    const r = el.getBoundingClientRect(), style = getComputedStyle(el);
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const hit = document.elementFromPoint(x, y);
    return {
      box: { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom, right: r.right },
      viewport: { width: innerWidth, height: innerHeight },
      fullyInViewport: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
      centerHittable: Boolean(hit && (hit === el || el.contains(hit))),
      hitElement: hit?.outerHTML.slice(0, 220), focused: document.activeElement === el,
      focusVisible: el.matches(":focus-visible"), outline: style.outline, boxShadow: style.boxShadow,
      display: style.display, visibility: style.visibility
    };
  });
}

async function snapshot(page, id) {
  await settled(page);
  const metrics = await page.evaluate(() => ({
    url: location.href, lang: document.documentElement.lang, title: document.title,
    viewport: { width: innerWidth, height: innerHeight }, documentWidth: document.documentElement.scrollWidth,
    active: { tag: document.activeElement?.tagName, text: document.activeElement?.textContent?.trim().slice(0, 100), label: document.activeElement?.getAttribute("aria-label") },
    scene: [...document.querySelectorAll(".tarot-scene,.tarot-scene-landscape")].map(el => ({ class: el.className, background: getComputedStyle(el).backgroundImage, pointerEvents: getComputedStyle(el).pointerEvents })),
    badImages: [...document.images].filter(i => i.complete && i.currentSrc && !i.naturalWidth).map(i => i.currentSrc)
  }));
  let axe;
  try {
    if (!await page.evaluate(() => Boolean(window.axe))) await page.addScriptTag({ path: axePath });
    axe = await page.evaluate(() => window.axe.run(document, { resultTypes: ["violations", "incomplete", "passes", "inapplicable"] }));
    fs.writeFileSync(path.join(out, "axe", `${id}.json`), JSON.stringify(axe, null, 2));
  } catch (error) {
    const diagnostic = { id, error: String(error) };
    report.scannerErrors.push(diagnostic);
    fs.writeFileSync(path.join(out, "axe", `${id}.json`), JSON.stringify(diagnostic, null, 2));
  }
  const screenshot = `screenshots/${id}.png`;
  await page.screenshot({ path: path.join(out, screenshot), fullPage: !await openDialog(page).count(), animations: "allow" });
  const summarize = result => ({ id: result.id, impact: result.impact, nodes: result.nodes.length, targets: result.nodes.map(n => n.target) });
  const state = {
    id, metrics, screenshot, status: axe ? "scanned" : "scanner-error",
    violations: axe ? axe.violations.map(summarize) : null,
    incomplete: axe ? axe.incomplete.map(summarize) : null,
    rawAxe: `axe/${id}.json`
  };
  report.states.push(state); save();
  const counts = results => results?.map(({ id: rule, impact, nodes }) => ({ rule, impact, nodes }));
  console.log(JSON.stringify({ state: id, violations: counts(state.violations), incomplete: counts(state.incomplete), status: state.status }));
  assert.ok(metrics.documentWidth <= metrics.viewport.width + 1, `${id}: horizontal document overflow`);
}

async function panelSelection(page, expectedIndex) {
  const tabs = page.locator(".tarot-spread-pills [role=tab]");
  await expect(tabs).toHaveCount(6);
  const selected = page.locator('.tarot-spread-pills [role=tab][aria-selected="true"]');
  await expect(selected).toHaveCount(1);
  await expect(tabs.nth(expectedIndex)).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#tarot-board")).toHaveAttribute("role", "tabpanel");
  await expect(page.locator("#tarot-board")).toHaveAttribute("aria-labelledby", await selected.getAttribute("id"));
  for (const tab of await tabs.all()) await expect(tab).toHaveAttribute("aria-controls", "tarot-board");
  assert.equal(await tabs.evaluateAll(es => es.filter(e => e.tabIndex === 0).length), 1, "Exactly one tab participates in Tab order");
}

async function dialogKeyboardCycle(page) {
  const count = await openDialog(page).evaluate(dialog => [...dialog.querySelectorAll("button,a[href],input,select,textarea,[tabindex]")].filter(el => el.tabIndex >= 0 && !el.disabled && el.getClientRects().length).length);
  const observations = [];
  for (const direction of ["Tab", "Shift+Tab"]) {
    const cycle = [];
    for (let i = 0; i < count + 3; i++) {
      await page.keyboard.press(direction);
      const active = await page.evaluate(() => {
        const el = document.activeElement;
        return { tag: el?.tagName, class: el?.className, withinDialog: Boolean(el?.closest(".tarot-card-dialog[open]")), documentHasFocus: document.hasFocus() };
      });
      // Chromium can include a native browser-chrome/BODY stop at the wrap.
      // A background page control is always a failure, regardless of hasFocus.
      assert.ok(active.withinDialog || active.tag === "BODY", `Dialog focus escaped to a background element: ${JSON.stringify(active)}`);
      cycle.push(active);
    }
    assert.ok(cycle.some(active => String(active.class).includes("tarot-dialog-close")), `${direction} must wrap back to the close control`);
    observations.push({ direction, cycle });
  }
  return observations;
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true });
report.browserVersion = browser.version();
try {
  for (const width of widths) for (const locale of locales) {
    const id = `${locale}-${width}-${motion}`;
    const flow = { id, blockedRequests: [], pageErrors: [], consoleErrors: [], httpErrors: [], nativeDialogs: [], storage: null };
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, locale: locale === "zh" ? "zh-CN" : "en-US", reducedMotion: motion, serviceWorkers: "block" });
    await context.addInitScript(() => sessionStorage.setItem("destinypixel:analytics-test", "1"));
    await context.route("**/*", route => {
      const request = route.request(), url = new URL(request.url());
      let reason;
      if (request.method() !== "GET") reason = "non-GET";
      else if (url.origin !== base.origin) reason = "third-party";
      else if (/^\/api(?:\/|$)/.test(url.pathname)) reason = "API";
      else if (/^\/_vercel\//.test(url.pathname)) reason = "telemetry";
      if (reason) { flow.blockedRequests.push({ url: request.url(), method: request.method(), reason }); return route.abort("blockedbyclient"); }
      return route.continue();
    });
    await context.routeWebSocket("**/*", socket => { flow.blockedRequests.push({ url: socket.url(), reason: "WebSocket" }); socket.close(); });
    const page = await context.newPage();
    page.setDefaultTimeout(12000);
    page.on("pageerror", e => flow.pageErrors.push(String(e)));
    page.on("console", m => { if (m.type() === "error") flow.consoleErrors.push(m.text()); });
    page.on("response", r => { if (r.status() >= 400) flow.httpErrors.push({ url: r.url(), status: r.status() }); });
    let expectedConfirm = null;
    page.on("dialog", async dialog => {
      const action = expectedConfirm;
      expectedConfirm = null;
      flow.nativeDialogs.push({ type: dialog.type(), message: dialog.message(), action: action || "unexpected-dismiss" });
      if (dialog.type() !== "confirm" || !action) { report.failures.push({ id, step: "unexpected-native-dialog", message: dialog.message() }); await dialog.dismiss(); }
      else if (action === "accept") await dialog.accept();
      else await dialog.dismiss();
    });
    let step = "home-initial";
    const check = (name, evidence = {}) => { report.checks.push({ id, name, status: "pass", ...evidence }); save(); };
    try {
      await page.goto(new URL(href("/", locale), base).href, { waitUntil: "networkidle" });
      await snapshot(page, `${id}-home-initial`);
      step = "home-language-keyboard";
      const other = locale === "en" ? "zh" : "en";
      await keyboardNavigate(page, page.locator(`[data-v2-header] a[href='${href("/", other)}']`).last(), "/", other);
      await keyboardNavigate(page, page.locator(`[data-v2-header] a[href='${href("/", locale)}']`).last(), "/", locale);
      check(step);
      step = "home-to-tarot-header-keyboard";
      await keyboardNavigate(page, page.locator(`[data-v2-header] a[href='${href("/tarot", locale)}']`), "/tarot", locale);
      check(step);
      await snapshot(page, `${id}-tarot-initial`);
      step = "tarot-header-language-and-home-return";
      await keyboardNavigate(page, page.locator(`[data-celestial-header] a[href='${href("/tarot", other)}']`), "/tarot", other);
      await keyboardNavigate(page, page.locator(`[data-celestial-header] a[href='${href("/tarot", locale)}']`).last(), "/tarot", locale);
      await keyboardNavigate(page, page.locator(`[data-celestial-header] a[href='${href("/", locale)}']`), "/", locale);
      await keyboardNavigate(page, page.locator(`[data-v2-header] a[href='${href("/tarot", locale)}']`), "/tarot", locale);
      check(step);
      step = "scene-background";
      const background = await page.locator(".tarot-scene-landscape").evaluate(async el => {
        const css = getComputedStyle(el).backgroundImage, match = css.match(/url\(["']?(.*?)["']?\)/);
        if (!match) return { css, loaded: false };
        const image = new Image(); image.src = match[1];
        try { await image.decode(); return { css, loaded: image.naturalWidth > 0, width: image.naturalWidth }; } catch { return { css, loaded: false }; }
      });
      assert.ok(background.loaded, "Mountain-lake background must load");
      check(step, background);
      step = "question-capsule-repeated-focus-return";
      for (const closeWith of ["Enter", "Escape", "Done", "Escape"]) {
        const pill = page.locator(".tarot-question-capsule-pill");
        await tabTo(page, pill); await page.keyboard.press("Enter");
        const input = page.locator(".tarot-question-capsule-editor input");
        await expect(input).toBeFocused();
        if (closeWith === "Done") { await tabTo(page, page.locator(".tarot-capsule-done")); await page.keyboard.press("Enter"); }
        else await page.keyboard.press(closeWith);
        await expect(pill).toBeFocused();
      }
      check(step);
      await tabTo(page, page.locator(".tarot-question-capsule-pill")); await page.keyboard.press("Enter");
      await snapshot(page, `${id}-capsule-open`);
      await page.keyboard.press("Escape");
      step = "manual-tabs-roving-and-panel";
      const tabs = page.locator(".tarot-spread-pills [role=tab]");
      await tabTo(page, tabs.nth(0)); await panelSelection(page, 0);
      for (const [key, index] of [["ArrowRight", 1], ["ArrowLeft", 0], ["End", 5], ["Home", 0], ["ArrowLeft", 5], ["ArrowRight", 0]]) {
        await page.keyboard.press(key); await expect(tabs.nth(index)).toBeFocused(); await panelSelection(page, 0);
      }
      await page.keyboard.press("End"); await page.keyboard.press("Enter");
      await panelSelection(page, 5); await expect(page.locator(".tarot-table.tarot-free")).toBeVisible();
      check(step);
      await snapshot(page, `${id}-free-empty`);
      step = "free-cockpit-reset-visible";
      await settled(page);
      const resetGeometry = await geometry(page.locator(".tarot-reset-inline"));
      if (width === 390) assert.ok(resetGeometry.fullyInViewport, `Narrow-screen reset must remain visible: ${JSON.stringify(resetGeometry)}`);
      check(step, { resetGeometry });
      step = "free-draw-button-focus-and-pointer-geometry";
      const draw = page.locator(".tarot-draw-action");
      await tabTo(page, draw); await settled(page);
      const drawGeometry = await geometry(draw);
      assert.ok(drawGeometry.focused && drawGeometry.focusVisible, "Draw action must have keyboard focus");
      assert.ok(drawGeometry.fullyInViewport && drawGeometry.centerHittable, JSON.stringify(drawGeometry));
      assert.ok(!drawGeometry.outline.includes("none 0px") || drawGeometry.boxShadow !== "none", "Draw focus indicator must be styled");
      const arc = page.locator(".tarot-arc-card").last();
      await expect(arc).toBeVisible();
      const arcGeometry = await geometry(arc);
      assert.ok(arcGeometry.box.width > 0 && arcGeometry.box.y < arcGeometry.viewport.height && arcGeometry.box.bottom > 0, "Visible arc alternative required");
      await snapshot(page, `${id}-free-draw-focused`);
      await draw.click();
      const cards = page.locator(".tarot-free-card");
      await expect(cards).toHaveCount(1);
      check(step, { drawGeometry, arcGeometry });
      await snapshot(page, `${id}-free-drawn`);
      step = "individual-reveal";
      await cards.first().click();
      await expect(cards.first().locator(".tarot-flipper")).toHaveClass(/is-revealed/);
      check(step);
      await snapshot(page, `${id}-free-revealed`);
      step = "visible-arc-pointer-alternative";
      await page.locator(".tarot-arc-card").last().click();
      await expect(cards).toHaveCount(2); check(step);
      step = "reveal-all-and-keepsake-accessible-names";
      const revealAll = page.locator(".tarot-reveal-all-btn");
      await expect(revealAll).toHaveAccessibleName(locale === "zh" ? "一键翻开全部" : "Reveal All");
      await tabTo(page, revealAll); await page.keyboard.press("Enter");
      await expect(cards.locator(".tarot-flipper.is-revealed")).toHaveCount(2);
      await expect(page.locator(".tarot-keepsake-trigger")).toHaveAccessibleName(locale === "zh" ? "保存此刻书签卡 (PNG)" : "Save Keepsake Bookmark (PNG)");
      await expect(page.locator(".tarot-keepsake-dialog[open]")).toHaveCount(0); check(step);
      await snapshot(page, `${id}-free-all-revealed`);
      step = "meaning-art-and-repeated-focus-return";
      const opener = cards.first();
      for (const closing of ["Escape", "close-button", "Back", "Escape"]) {
        await tabTo(page, opener); await page.keyboard.press("Enter");
        await expect(openDialog(page)).toBeVisible();
        const close = page.locator(".tarot-dialog-close"); await expect(close).toBeFocused();
        if (closing === "Escape") {
          check("dialog-tab-and-shift-tab-cycle", { observations: await dialogKeyboardCycle(page) });
          await snapshot(page, `${id}-meaning-${flow.nativeDialogs.length}-${report.states.length}`);
          const art = page.locator(".tarot-dialog-tabs button").nth(1);
          await tabTo(page, art); await page.keyboard.press("Enter");
          await expect(art).toHaveAttribute("aria-pressed", "true");
          await expect(page.locator(".tarot-dialog-art")).toBeVisible();
          assert.ok(await page.locator(".tarot-dialog-art").evaluate(img => img.complete && img.naturalWidth > 0), "Card artwork must load");
          await snapshot(page, `${id}-art-${report.states.length}`);
          const meaning = page.locator(".tarot-dialog-tabs button").first();
          await tabTo(page, meaning); await page.keyboard.press("Enter");
          await expect(page.locator(".tarot-dialog-meaning")).toBeVisible();
          await page.keyboard.press("Escape");
        } else if (closing === "Back") await page.goBack();
        else await page.keyboard.press("Enter");
        await expect(openDialog(page)).toHaveCount(0); await expect(opener).toBeFocused();
      }
      check(step);
      step = "drawn-table-change-cancel-and-accept";
      for (const action of ["dismiss", "accept"]) {
        await tabTo(page, tabs.nth(5)); await page.keyboard.press("Home"); await page.keyboard.press("ArrowRight");
        await expect(tabs.nth(1)).toBeFocused(); await panelSelection(page, 5);
        const beforeDialogs = flow.nativeDialogs.length; expectedConfirm = action;
        await page.keyboard.press("Enter");
        await expect.poll(() => flow.nativeDialogs.length).toBe(beforeDialogs + 1);
        if (action === "dismiss") { await panelSelection(page, 5); await expect(cards).toHaveCount(2); await expect(tabs.nth(5)).toBeFocused(); }
        else { await panelSelection(page, 1); await expect(cards).toHaveCount(0); await expect(tabs.nth(1)).toBeFocused(); }
        await snapshot(page, `${id}-reset-${action}`);
      }
      check(step);
      assert.deepEqual(flow.pageErrors, [], "No browser page exceptions");
      assert.deepEqual(flow.httpErrors, [], "No failed HTTP responses");
    } catch (error) {
      report.failures.push({ id, step, error: String(error), stack: error.stack });
      console.error(`FAIL ${id}/${step}: ${String(error)}`);
      await page.screenshot({ path: path.join(out, "screenshots", `${id}-failure.png`), animations: "allow" }).catch(() => {});
    } finally {
      flow.storage = await page.evaluate(() => ({ localKeys: Object.keys(localStorage), sessionKeys: Object.keys(sessionStorage) })).catch(() => null);
      report.flows.push(flow); save(); await context.close();
    }
  }
} finally {
  report.finishedAt = new Date().toISOString();
  report.summary = {
    states: report.states.length, functionalFailures: report.failures.length, scannerErrors: report.scannerErrors.length,
    violationRuleOccurrences: report.states.reduce((n, s) => n + (s.violations?.length || 0), 0),
    incompleteRuleOccurrences: report.states.reduce((n, s) => n + (s.incomplete?.length || 0), 0)
  };
  save(); await browser.close(); console.log(JSON.stringify(report.summary));
}
if (report.failures.length || report.scannerErrors.length || report.states.some(s => s.violations?.length)) process.exitCode = 1;
