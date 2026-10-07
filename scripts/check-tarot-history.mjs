// Requires Playwright and its Chromium browser (or CHROMIUM_PATH).
// node scripts/check-tarot-history.mjs http://127.0.0.1:3002
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { chromium, expect } = createRequire(import.meta.url)("playwright/test");
const base = process.argv[2] ?? "http://127.0.0.1:3002";
const sizes = { single: 1, three: 3, relationship: 5, choice: 5, celtic: 10 };
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  headless: true,
});

try {
  for (const width of [1280, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    // Only exercise the local deck. Never allow an AI, account or payment write.
    await page.route("**/*", route => route.request().method() === "GET"
      ? route.continue() : route.abort());
    const select = page.locator(".tarot-select select");
    const board = page.locator("#tarot-board");
    async function consistent(stage) {
      const spread = await select.inputValue();
      assert.ok(Object.hasOwn(sizes, spread));
      await expect(board, stage).toHaveClass(new RegExp(`\\btarot-spread-${spread}\\b`));
      await expect(board.locator("[data-drop-slot]"), stage).toHaveCount(sizes[spread]);
      await expect(board.locator(".tarot-table-caption"), stage)
        .toContainText(await select.locator("option:checked").innerText());
    }
    await page.goto(new URL("/astrology", base).href);
    // Full document navigation reproduces native session-history form restoration.
    await page.goto(new URL("/tarot", base).href);
    await select.selectOption("single");
    await expect(board).toHaveClass(/tarot-spread-single/);
    await page.locator(".tarot-bottom-deck button.cel-button").first().click();
    await expect(page.locator(".tarot-deck-top")).toBeEnabled();
    await page.locator(".tarot-deck-top").press("Enter");
    await page.locator(".tarot-table-toolbar").getByRole("button", { name: "Turn over", exact: true }).click();
    await expect(board.locator("img")).toHaveCount(1);
    await page.getByRole("button", { name: "Return to deck", exact: true }).click();
    await page.getByRole("button", { name: "Start a new reading", exact: true }).click();
    await consistent("after returning the card and resetting");
    await page.goBack();
    await expect(page).toHaveURL(new URL("/astrology", base).href);
    await page.goForward();
    await expect(select).toBeVisible();
    await consistent("after browser Back/Forward");
    // A fresh choice must still update the board after history restoration.
    await select.selectOption("choice");
    await expect(board).toHaveClass(/tarot-spread-choice/);
    await consistent("after choosing another spread");
    assert.deepEqual(errors, [], "browser runtime errors");
    console.log(`PASS ${width}px: select, draw/reveal/return/reset, Back/Forward, title and slot count agree`);
    await page.close();
  }
} finally {
  await browser.close();
}
