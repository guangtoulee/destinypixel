// NODE_PATH=/opt/codex/cua_node/lib/node_modules CHROMIUM_PATH=/usr/bin/chromium node scripts/check-taisui-browser.mjs <base> [output]
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
const { chromium, expect } = createRequire(import.meta.url)("playwright/test");
const base = process.argv[2] ?? "http://127.0.0.1:3038";
const output = process.argv[3] ?? "docs/qa/taisui-20261021";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, headless: true });
const report = { base, at: new Date().toISOString(), checks: [], errors: [], layoutFailures: [], consoleErrors: [], httpErrors: [], blocked: [], requests: [], screenshots: [] };
const query = locale => `?${locale === "zh" ? "locale=zh&" : ""}analytics_test=1`;
const canonical = (path, locale) => `https://www.destinypixel.com${path}${locale === "zh" ? "?locale=zh" : ""}`;

async function contextFor(width = 390, reducedMotion = "no-preference") {
  const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: width < 700, hasTouch: width < 700, reducedMotion });
  await context.route("**/*", route => {
    const request = route.request();
    const item = { url: request.url(), method: request.method() };
    report.requests.push(item);
    if (request.method() === "GET" && new URL(request.url()).origin === new URL(base).origin) return route.continue();
    report.blocked.push(item);
    return route.abort();
  });
  return context;
}
async function open(context, path, locale) {
  const page = await context.newPage();
  page.on("pageerror", error => report.errors.push({ path, locale, error: error.message }));
  page.on("console", message => {
    if (message.type() === "error" && !/Failed to load resource|net::ERR_FAILED/.test(message.text())) report.consoleErrors.push({ path, locale, message: message.text() });
  });
  page.on("response", response => {
    if (response.status() >= 400 && !/_vercel\/(insights|speed-insights)\//.test(response.url())) report.httpErrors.push({ url: response.url(), status: response.status() });
  });
  const response = await page.goto(`${base}${path}${query(locale)}`, { waitUntil: "networkidle" });
  assert.equal(response.status(), 200, `${path} ${locale}`);
  const html = await response.text();
  assert.match(html, new RegExp(`<html[^>]*lang="${locale === "zh" ? "zh-CN" : "en"}"`), "initial document language");
  assert.ok(html.includes('application/ld+json'), "server-rendered structured data");
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", locale === "zh" ? "zh-CN" : "en");
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical(path, locale));
  const hreflang = await page.locator('link[rel="alternate"][hreflang]').evaluateAll(items => items.map(item => item.hreflang));
  assert.ok(hreflang.includes("en") && hreflang.includes("zh-Hans") && hreflang.includes("x-default"), `${path} hreflang`);
  assert.ok(!hreflang.includes("ru") && !hreflang.includes("zh-Hant"), `${path} authored editions only`);
  const overflow = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  assert.ok(overflow.scroll <= overflow.width + 1 && overflow.body <= overflow.width + 1, `${path} ${locale}: ${JSON.stringify(overflow)}`);
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(item => item.complete && item.naturalWidth > 0)).toBe(true);
    assert.ok((await image.getAttribute("alt"))?.trim(), `${path}: useful image alt`);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  return page;
}
async function screenshot(locator, name) {
  const path = `${output}/${name}.png`;
  await locator.screenshot({ path });
  report.screenshots.push(path);
}
async function fit(page, locator, label) {
  const boxes = await locator.evaluateAll(items => items.map(item => {
    const region = item.tagName === "TABLE" ? item.parentElement : item;
    return { width: region.getBoundingClientRect().width, scroll: region.scrollWidth, client: region.clientWidth };
  }));
  if (!boxes.every(box => box.scroll <= box.client + 1)) {
    report.layoutFailures.push({ label, boxes });
    await screenshot(page.locator("main"), `overflow-${label.replaceAll(/[^a-z0-9]+/gi, "-")}`);
  }
}

try {
  for (const width of [320, 390, 430, 1280]) for (const locale of ["en", "zh"]) {
    const context = await contextFor(width);
    const annual = await open(context, "/2027", locale);
    const ranking = annual.locator("#zodiac-ranking");
    await expect(ranking).toBeVisible();
    await expect(ranking.locator("li[data-zodiac]")).toHaveCount(12);
    await expect(ranking.locator('[role="img"][aria-label]')).toHaveCount(48);
    assert.deepEqual(await ranking.locator("li[data-zodiac]").evaluateAll(items => items.slice(0, 3).map(item => item.dataset.zodiac)), ["rabbit", "horse", "pig"]);
    for (const [name, last] of locale === "zh" ? [["事业", "ox"], ["感情", "rat"], ["财运", "dog"]] : [["Career", "ox"], ["Love", "rat"], ["Money", "dog"]]) {
      const sort = ranking.getByRole("button", { name, exact: true });
      await sort.click();
      await expect(sort).toHaveAttribute("aria-pressed", "true");
      await expect(ranking.locator("li[data-zodiac]").last()).toHaveAttribute("data-zodiac", last);
      const ratings = await ranking.locator('li[data-zodiac] [data-selected] [role="img"]').evaluateAll(items => items.map(item => Number(item.getAttribute("aria-label").match(/\d+/)[0])));
      assert.ok(ratings.every((value, index) => index === 0 || value <= ratings[index - 1]), `${name} descending ranking`);
    }
    await ranking.getByRole("button", { name: locale === "zh" ? "综合" : "Overall", exact: true }).click();
    await expect(ranking.locator('[data-zodiac="goat"] [data-selected] [role="img"]')).toHaveAttribute("aria-label", locale === "zh" ? "3 星，满分 5 星" : "3 out of 5 stars");
    await expect(annual.locator('[role="tab"]')).toHaveCount(12);
    const january = annual.locator('[role="tabpanel"]');
    await expect(january).toContainText("丙午");
    await expect(january).not.toContainText("丁未");
    await annual.locator('[role="tab"]').nth(1).click();
    await expect(january).toContainText("丙午");
    await expect(january).toContainText("丁未");
    if (width === 390) {
      await screenshot(ranking, `ranking-${locale}-390`);
      await screenshot(ranking.locator("li[data-zodiac]").first(), `ranking-card-${locale}-390`);
    }
    await annual.close();

    const article = await open(context, "/journal/ben-ming-nian-tai-sui", locale);
    assert.ok(await article.locator("article table").count() >= 2, "definition and 2027 tables");
    assert.ok(await article.locator("article figure img").count() >= 2, "two original relation diagrams");
    await fit(article, article.locator("article table"), `article tables ${width}/${locale}`);
    for (const destination of ["/2027", "/taisui"]) assert.ok(await article.locator(`article a[href^="${destination}"]`).count(), `article link ${destination}`);
    if (width === 390) {
      await screenshot(article.locator("article figure").first(), `relationships-${locale}-390`);
      await screenshot(article.locator("article figure").nth(1), `taisui-connections-${locale}-390`);
      await screenshot(article.locator("article table").last(), `table-${locale}-390`);
    }
    if (width === 320) await screenshot(article.locator("article table").first(), `definitions-${locale}-320`);
    await article.close();

    const peace = await open(context, "/taisui", locale);
    assert.equal(await peace.locator("input,textarea,form").count(), 0, "peace page asks for no data");
    for (const destination of ["/2027", "/journal/ben-ming-nian-tai-sui"]) assert.ok(await peace.locator(`a[href^="${destination}"]`).count(), `peace link ${destination}`);
    if (width === 390) await screenshot(peace.locator("main"), `peace-${locale}-390`);
    if (width === 1280) await screenshot(peace.locator("section[data-lit]"), `peace-${locale}-1280`);
    await peace.close();
    await context.close();
    report.checks.push({ type: "layout-and-metadata", width, locale, result: "pass" });
  }

  for (const locale of ["en", "zh"]) {
    const context = await contextFor(390);
    const page = await open(context, "/2027", locale);
    const form = page.locator('form[data-analytics-form="year_2027"]');
    await form.locator('input[type="date"]').fill("1990-05-12");
    await form.locator('input[type="time"]').fill("08:30");
    await form.locator("select").first().selectOption("beijing-cn");
    await form.locator('button[type="submit"]').click();
    await expect(page.locator("#reading")).toBeVisible();
    await expect(page.locator("#reading")).toContainText(locale === "zh" ? "已提供出生时刻" : "Birth time provided");
    await expect(page.locator("#reading")).toContainText("1990-05-12");
    await form.locator('input[type="checkbox"]').check();
    await expect(form.locator('input[type="time"]')).toBeDisabled();
    await form.locator('button[type="submit"]').click();
    await expect(page.locator("#reading")).toContainText(locale === "zh" ? "未知时辰" : "Unknown time");
    await expect(page.locator("#reading")).toContainText(locale === "zh" ? "不计算" : "Omitted");
    await expect(page.locator("#reading")).not.toContainText("08:30");
    assert.ok(!(await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage }, history: history.state }))).includes("1990-05-12"), "no birthday persistence or history payload");
    assert.ok(!report.requests.some(request => request.url.includes("1990-05-12")), "no birthday in request URL");
    await screenshot(page.locator("#reading"), `annual-unknown-${locale}-390`);
    await page.close();
    await context.close();
    report.checks.push({ type: "free-personal-guide", locale, knownTime: "pass", unknownTime: "pass" });
  }

  for (const locale of ["en", "zh"]) {
    const context = await contextFor(390, "reduce");
    await context.addInitScript(() => {
      window.__shares = [];
      Object.defineProperty(navigator, "share", { configurable: true, value: async payload => { window.__shares.push(payload); } });
      window.__clipboard = [];
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async text => { window.__clipboard.push(text); } } });
    });
    const page = await open(context, "/taisui", locale);
    const light = page.getByRole("button", { name: locale === "zh" ? "点亮平安，送出心愿" : "Light the lamp, offer your wish", exact: true });
    const share = page.getByRole("button", { name: locale === "zh" ? "分享这份祝福" : "Share this blessing", exact: true });
    const reread = () => page.getByRole("button", { name: locale === "zh" ? "再读一遍祝福" : "Read the blessing again", exact: true });
    assert.deepEqual(await page.evaluate(() => window.__shares), [], "share happens only after explicit click");
    await light.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator('[data-lit="true"]')).toBeVisible();
    await expect(page.getByRole("button", { name: locale === "zh" ? "这盏灯，为你亮着" : "A little light, here for you", exact: true })).toHaveAttribute("aria-pressed", "true");
    const blessing = page.locator('[role="status"]').filter({ hasText: locale === "zh" ? "愿这份心意，陪你踏实走好每一天。" : "May this quiet intention keep you company, one steady day at a time." });
    await expect(blessing).toBeVisible();
    await reread().click();
    await expect(blessing).toBeFocused();
    await share.click();
    const shares = await page.evaluate(() => window.__shares);
    assert.equal(shares.length, 1);
    assert.equal(shares[0].url, canonical("/taisui", locale));
    assert.ok(!shares[0].url.includes("analytics_test"));
    await page.evaluate(() => Object.defineProperty(navigator, "share", { configurable: true, value: async () => { throw new DOMException("Cancelled", "AbortError"); } }));
    await share.click();
    await expect(page.locator('[data-lit="true"]')).toBeVisible();
    await expect(page.getByText(locale === "zh" ? "分享已取消，你的灯依然亮着。" : "Sharing cancelled. Your lamp is still glowing.", { exact: true })).toBeVisible();
    await page.evaluate(() => Object.defineProperty(navigator, "share", { configurable: true, value: undefined }));
    await share.click();
    assert.deepEqual(await page.evaluate(() => window.__clipboard), [canonical("/taisui", locale)]);
    await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("Clipboard denied"); } } }));
    await share.click();
    await expect(page.locator('input[readonly]')).toHaveValue(canonical("/taisui", locale));
    await page.locator('input[readonly]').focus();
    assert.equal(await page.locator('input[readonly]').evaluate(input => input.selectionEnd - input.selectionStart), canonical("/taisui", locale).length, "manual fallback selects the whole canonical URL");
    const animations = await page.locator("main").evaluate(item => item.getAnimations({ subtree: true }).filter(animation => animation.playState === "running").length);
    assert.equal(animations, 0, "reduced motion removes running animations");
    assert.equal(await page.evaluate(() => localStorage.length), 0, "lamp stores no wishes or state");
    await screenshot(page.locator("main"), `peace-lit-${locale}-390`);
    const localeQuery = locale === "zh" ? "?locale=zh" : "";
    await page.locator(`a[href="/2027${localeQuery}#zodiac-ranking"]`).click();
    await expect(page).toHaveURL(`${base}/2027${localeQuery}#zodiac-ranking`);
    await expect(page.locator("#zodiac-ranking")).toBeInViewport();
    await page.locator(`#zodiac-ranking a[href="/journal/ben-ming-nian-tai-sui${localeQuery}"]`).click();
    await expect(page).toHaveURL(`${base}/journal/ben-ming-nian-tai-sui${localeQuery}`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale === "zh" ? "zh-CN" : "en");
    await page.locator(`article a[href="/2027${localeQuery}#your-year"]`).first().click();
    await expect(page).toHaveURL(`${base}/2027${localeQuery}#your-year`);
    await expect(page.locator('#your-year form')).toBeInViewport();
    await page.close();
    await context.close();
    report.checks.push({ type: "peace-lamp", locale, keyboard: "pass", reread: "pass", share: "pass", cancellation: "pass", copyFallback: "pass", reducedMotion: "pass", realCrosslinkNavigation: "pass" });
  }

  const sitemapResponse = await fetch(`${base}/sitemap.xml`);
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1].replaceAll("&amp;", "&"));
  assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, "no duplicate sitemap URLs");
  for (const path of ["/2027", "/taisui", "/journal/ben-ming-nian-tai-sui"]) for (const locale of ["en", "zh"]) assert.ok(sitemapUrls.includes(canonical(path, locale)), `sitemap ${path} ${locale}`);
  for (const locale of ["ru", "zh-TW"]) assert.ok(!sitemapUrls.includes(`https://www.destinypixel.com/journal/ben-ming-nian-tai-sui?locale=${locale}`), "unsupported new article edition absent");
  assert.ok(sitemapUrls.includes("https://www.destinypixel.com/journal/what-is-a-day-pillar?locale=ru"), "existing Russian article preserved");
  const llms = await (await fetch(`${base}/llms.txt`)).text();
  assert.ok(llms.includes("https://www.destinypixel.com/2027"));
  assert.ok(llms.includes("https://www.destinypixel.com/taisui"));
  report.checks.push({ type: "sitemap-and-llms", uniqueUrls: sitemapUrls.length, result: "pass" });

  assert.deepEqual(report.errors, [], "no browser page exceptions");
  assert.deepEqual(report.layoutFailures, [], "no inner table overflow");
  assert.deepEqual(report.consoleErrors, [], "no unexpected console exceptions");
  assert.deepEqual(report.httpErrors, [], "no failed page or asset response");
  assert.ok(!report.requests.some(request => /\/api\//.test(request.url)), "no calculation or AI API requested");
} catch (error) {
  report.failure = { message: error.message, stack: error.stack };
  process.exitCode = 1;
} finally {
  await browser.close();
  await writeFile(`${output}/browser-report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ checks: report.checks.length, pageErrors: report.errors.length, failure: report.failure?.message, screenshots: report.screenshots.length }, null, 2));
}
