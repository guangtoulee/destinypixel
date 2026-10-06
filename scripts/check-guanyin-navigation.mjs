// Requires Playwright; use CHROMIUM_PATH for an existing Chromium installation.
// NODE_PATH=<playwright modules> CHROMIUM_PATH=<chromium> node scripts/check-guanyin-navigation.mjs <base>
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { chromium, expect } = createRequire(import.meta.url)("playwright/test");
const base = process.argv[2] ?? "http://127.0.0.1:3005";
const path = "/learn/guanyin-fortune-sticks";
const tags = { en: "en", zh: "zh-Hans", "zh-TW": "zh-Hant", ru: "ru" };
const href = locale => path + (locale === "en" ? "" : `?locale=${locale}`);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, headless: true });
try {
  for (const width of [320, 390, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await context.route("**/*", route => route.request().method() === "GET" && new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const expected = {};
    async function metadata() {
      return page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content,
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        heading: document.querySelector('h1')?.textContent,
        lang: document.querySelector('main')?.lang,
      }));
    }
    // Establish correct full-document metadata; the SSR checker separately verifies copy.
    for (const locale of Object.keys(tags)) {
      await page.goto(new URL(href(locale), base).href, { waitUntil: "networkidle" });
      expected[locale] = await metadata();
      assert.equal(expected[locale].lang, tags[locale]);
      assert.equal(expected[locale].canonical, new URL(href(locale), "https://www.destinypixel.com").href);
      assert.ok(expected[locale].title && expected[locale].description);
    }
    assert.equal(new Set(Object.values(expected).map(item => item.title)).size, 4);
    assert.equal(new Set(Object.values(expected).map(item => item.description)).size, 4);
    async function consistent(locale, action) {
      await expect(page).toHaveURL(new URL(href(locale), base).href);
      await expect.poll(metadata, { message: `${width}px ${action}: ${locale} metadata must match a direct visit` }).toEqual(expected[locale]);
      await expect(page.locator("title")).toHaveCount(1);
      await expect(page.locator('meta[name="description"]')).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      await expect(page.locator(`header nav a[lang="${tags[locale]}"]`)).toHaveAttribute("aria-current", "page");
      await expect(page.locator(`a[href="/sticks?locale=${locale}&type=guanyin"]`).first()).toBeVisible();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      console.log(`PASS ${width}px ${action} ${locale}: URL, language, H1, title, description, canonical, tool link`);
    }
    await page.goto(new URL(path, base).href);
    await consistent("en", "initial");
    const journey = ["en", "zh", "zh-TW", "ru", "en"];
    for (const locale of journey.slice(1)) {
      await page.locator(`header nav a[lang="${tags[locale]}"]`).click();
      await consistent(locale, "switch");
    }
    for (const locale of journey.slice(0, -1).reverse()) {
      await page.goBack();
      await consistent(locale, "back");
    }
    for (const locale of journey.slice(1)) {
      await page.goForward();
      await consistent(locale, "forward");
    }
    assert.deepEqual(errors, []);
    await context.close();
  }
} finally {
  await browser.close();
}
