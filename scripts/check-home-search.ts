import assert from "node:assert/strict";
import { homeOfferCopy } from "../lib/home-offer";
const base = process.argv[2] ?? "http://localhost:3047";
const origin = "https://www.destinypixel.com";
const locales = ["en", "zh", "zh-TW", "ru"] as const;
const decode = (s: string) => s.replaceAll("&amp;", "&").replaceAll("&quot;", '"');
async function get(path: string) {
  const r = await fetch(new URL(path, base), { signal: AbortSignal.timeout(30000) });
  assert.equal(r.status, 200, path);
  return r.text();
}
async function main() {
  const catalog = JSON.parse(await get("/api/products.json"));
  const offer = catalog.products.find((p: { id: string }) => p.id === "birth-map").pricing.completeReport;
  const sitemap = decode(await get("/sitemap.xml"));
  for (const [i, locale] of locales.entries()) {
    const path = locale === "en" ? "/" : `/?locale=${locale}`;
    const html = decode(await get(path));
    const text = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, "");
    const tag = { en: "en", zh: "zh-Hans", "zh-TW": "zh-Hant", ru: "ru" }[locale];
    assert.ok(new RegExp(`<main[^>]+lang="${tag}"`).test(html));
    assert.ok(text.includes(["Birth times optional", "时辰可选未知", "時辰可選未知", "Время можно не знать"][i]));
    assert.ok(!["Both birth dates, known times and cities", "双方生日、已知出生时间与城市", "雙方生日、已知出生時間與城市", "Даты, известное время и города рождения обоих"].some(s => text.includes(s)));
    const links = [...html.matchAll(/<link\b[^>]*>/g)].map(m => Object.fromEntries([...m[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(a => [a[1], a[2]])));
    assert.equal(new URL(links.find(a => a.rel === "canonical")!.href).href, new URL(path, origin).href);
    for (const l of locales) {
      const target = l === "en" ? "/" : `/?locale=${l}`;
      assert.ok(links.some(a => a.rel === "alternate" && new URL(a.href).href === new URL(target, origin).href));
      assert.ok(sitemap.includes(`<loc>${new URL(target, origin).href}</loc>`));
    }
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m => JSON.parse(m[1]));
    const app = schemas.find(s => s["@type"] === "SoftwareApplication");
    assert.deepEqual(app.offers.map((o: { price: string }) => o.price), offer.available ? ["0", offer.amount] : ["0"]);
    const c = homeOfferCopy(locale);
    assert.ok(text.includes(offer.available ? c.note.replace("{price}", offer.amount) : c.unavailable));
    if (locale === "zh-TW") {
      for (const s of ["免費測我的意象卡", "原創文章", "六十日柱", "填寫出生日期、時間與城市", "求籤問事", "手串工坊"]) assert.ok(text.includes(s), s);
      for (const s of ["问事", "求签"]) assert.ok(!text.includes(s), `Unexpected Simplified copy: ${s}`);
    }
    for (const route of ["discover", "sticks", "compatibility", "atelier"]) {
      assert.ok(html.includes(`data-home-path="${route}"`), `Missing primary path ${route}`);
      const href = `/${route}${locale === "en" ? "" : `?locale=${locale}`}`;
      assert.ok(html.includes(`href="${href}"`), `Wrong language section path ${href}`);
    }
    assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
    assert.ok(html.includes('id="report"'), "Preserved report handoff");
    const discover = decode(await get(`/discover${locale === "en" ? "" : `?locale=${locale}`}`));
    assert.ok(discover.includes(["birth times are optional", "时辰可选未知", "時辰可選未知", "время может быть неизвестно"][i]));
    console.log(`PASS ${locale}: home initial text, offers, canonical/languages, sitemap and discover handoff`);
  }
  const ultra = await get("/ultra");
  assert.match(ultra, /<meta name="robots" content="noindex, follow"/);
  assert.ok(!sitemap.includes(`<loc>${origin}/ultra</loc>`));
  assert.ok((await get("/product-facts?locale=zh-TW")).includes("籤號與版本說明"));
  console.log("PASS ultra remains accessible but excluded from indexing; Traditional facts link is localized.");
}
main().catch(e => { console.error(e); process.exitCode = 1; });
