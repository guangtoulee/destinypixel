// Read-only topic/workflow QA. Install Playwright separately or provide NODE_PATH.
// CHROMIUM_PATH=/usr/bin/chromium node scripts/check-topic-pages.mjs http://localhost:3002
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
const { chromium, expect } = createRequire(import.meta.url)("playwright/test");
const base = process.argv[2] || "http://localhost:3002";
const evidence = process.env.QA_EVIDENCE_DIR;
if (evidence) await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ["--no-sandbox"] });
const topics = ["discover", "sticks", "compatibility", "atelier", "tarot", "astrology"];
const functionPaths = ["/discover", "/astrology", "/tarot", "/compatibility", "/", "/tuteng", "/day-pillar", "/oracle", "/sticks", "/palm", "/face", "/atelier"];
const href = (path, locale) => path + (locale === "en" ? "" : `?locale=${locale}`);
let count = 0;
const checked = new Set();
try {
  for (const locale of ["en", "zh", "zh-TW", "ru"]) {
    for (const width of [320, 390, 430, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("dialog", dialog => dialog.accept());
      // Only local chart calculations may POST. AI, accounts and payment writes are blocked.
      await page.route("**/*", route => {
        const request = route.request();
        if (["GET", "HEAD"].includes(request.method())) return route.continue();
        if (new URL(request.url()).origin === new URL(base).origin && new URL(request.url()).pathname === "/api/astrology") {
          const payload = request.postDataJSON();
          if (!payload.mode || payload.mode === "calculate") return route.continue();
        }
        return route.abort();
      });
      for (const kind of ["tarot", "astrology"]) {
        await page.goto(new URL(href(`/${kind}`, locale), base).href);
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.locator("[data-section-navigation] a[aria-current=page]")).toHaveAttribute("href", href(`/${kind}`, locale));
        for (const topic of topics) await expect(page.locator(`[data-section-navigation] a[href="${href(`/${topic}`, locale)}"]`)).toHaveCount(1);
        await expect(page.locator("[data-section-reading] h3")).toHaveCount(3);
        await expect(page.locator("[data-site-functions] nav a")).toHaveCount(11);
        const urls = await page.locator("[data-site-functions] nav a").evaluateAll(links => links.map(a => a.getAttribute("href")));
        assert.deepEqual(urls.map(url => new URL(url, base).pathname).sort(), functionPaths.filter(path => path !== `/${kind}`).sort());
        for (const url of urls) assert.equal(new URL(url, base).searchParams.get("locale"), locale === "en" ? null : locale);
        assert.ok(urls.includes(href("/", locale) + "#report"));
        const guideBox = await page.locator("[data-section-reading]").boundingBox();
        const linksBox = await page.locator("[data-site-functions]").boundingBox();
        assert.ok(linksBox.y >= guideBox.y + guideBox.height - 1, "all-function links follow guides");
        await expect(page.locator(".cel-topic-action")).toHaveCSS("color", "rgb(255, 255, 255)");
        await expect(page.locator("[data-site-functions] > p")).toHaveCSS("margin-bottom", "22px");
        await page.locator(".cel-topic-action").click();
        await expect(page).toHaveURL(/#topic-tool$/);
        if (kind === "tarot") {
          const select = page.locator(".tarot-select select");
          const board = page.locator("#tarot-board");
          await select.selectOption("single");
          await expect(board.locator("[data-drop-slot]")).toHaveCount(1);
          await page.locator(".tarot-deck-zone button.cel-button:visible").first().click();
          await page.locator('[data-card-index="0"]').press("Enter");
          await page.locator(".tarot-table-toolbar button").first().click();
          await expect(board.locator("img")).toHaveCount(1);
          await page.locator(".tarot-table-toolbar button").first().click();
          await expect(page.getByRole("dialog")).toBeVisible();
          await page.keyboard.press("Escape");
          await expect(page.getByRole("dialog")).toHaveCount(0);
          await page.locator(".tarot-table-toolbar button").last().click();
          await expect(board.locator("img")).toHaveCount(0);
          await page.locator(".tarot-controls button.cel-button-text").click();
          await expect(board).toHaveClass(/tarot-spread-single/);
          // Native history restoration must not desynchronize the select and board.
          await page.goto(new URL(href("/astrology", locale), base).href);
          await page.goBack();
          await expect(select).toHaveValue("three");
          await expect(board.locator("[data-drop-slot]")).toHaveCount(3);
          await select.selectOption("choice");
          await expect(board.locator("[data-drop-slot]")).toHaveCount(5);
        } else {
          await page.locator('input[name="date"]').fill("1990-05-15");
          await page.locator('input[name="time"]').fill("12:00");
          await page.locator("form select").selectOption("london-uk");
          const response = page.waitForResponse(response => response.url().endsWith("/api/astrology") && response.request().method() === "POST");
          await page.locator("form button.cel-button").click();
          const result = await response;
          assert.equal(result.status(), 200);
          assert.equal((await result.json()).chart.placements.length, 10);
          for (const tab of ["houses", "aspects", "planets"]) {
            await page.locator(`#tab-${tab}`).click();
            await expect(page.locator(`#tab-${tab}`)).toHaveAttribute("aria-selected", "true");
          }
          await page.locator(".cel-detail-list button").nth(1).click();
          await expect(page.locator(".cel-detail-list button").nth(1)).toHaveClass(/is-active/);
        }
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${kind}/${locale}/${width}: horizontal overflow`);
        assert.equal(await page.locator("[data-nextjs-dialog], .vite-error-overlay").count(), 0);
        if (evidence && [320, 1440].includes(width)) {
          await page.screenshot({ path: `${evidence}/${kind}-${locale}-${width}.png`, fullPage: true });
          await page.locator("[data-site-functions]").screenshot({ path: `${evidence}/${kind}-${locale}-${width}-links.png` });
        }
        // Follow the actual cross-topic link; verify the destination's active navigation.
        const other = kind === "tarot" ? "astrology" : "tarot";
        await page.locator(`[data-section-navigation] a[href="${href(`/${other}`, locale)}"]`).click();
        await expect(page.locator("[data-section-navigation] a[aria-current=page]")).toHaveAttribute("href", href(`/${other}`, locale));
        for (const path of [...urls, ...await page.locator("[data-section-reading] a").evaluateAll(links => links.map(a => a.getAttribute("href")))]) {
          if (checked.has(path)) continue;
          const response = await page.request.get(new URL(path, base).href);
          assert.equal(response.status(), 200, path);
          checked.add(path);
        }
        count++;
        console.log(`PASS ${kind}/${locale}/${width}: navigation, guides, functions, workflow, overflow`);
      }
      assert.deepEqual(errors, [], `${locale}/${width}: runtime errors`);
      await page.goto(new URL(href("/", locale), base).href);
      await expect(page.locator("[data-home-path]")).toHaveCount(4);
      await expect(page.locator("[data-section-navigation] a")).toHaveCount(7);
      await page.close();
    }
  }
  console.log(`PASS ${count} topic/locale/viewport cases; 16 focused-homepage checks; ${checked.size} unique linked destinations`);
} finally { await browser.close(); }
