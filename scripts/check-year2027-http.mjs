import assert from "node:assert/strict";

const base = process.argv[2] || "http://127.0.0.1:3007";
const page = async path => {
  const response = await fetch(`${base}${path}`);
  assert.equal(response.status, 200, path);
  assert.ok(!/noindex/.test(response.headers.get("x-robots-tag") || ""), path);
  return response.text();
};

for (const [locale, lang, canonical] of [["en", "en", "/2027"], ["zh", "zh-CN", "/2027?locale=zh"]]) {
  const html = await page(`/2027?locale=${locale}&analytics_test=1`);
  assert.match(html, new RegExp(`<html[^>]*lang="${lang}"`));
  assert.ok(html.includes(`<link rel="canonical" href="https://www.destinypixel.com${canonical}"`));
  assert.ok(html.includes('hrefLang="en"') || html.includes('hreflang="en"'));
  assert.ok(html.includes('hrefLang="zh-Hans"') || html.includes('hreflang="zh-Hans"'));
  assert.ok(html.includes('application/ld+json'));
  assert.ok(html.includes('"isAccessibleForFree":true'));
  assert.ok(html.includes('"price":"0"'));
  assert.ok(html.includes('data-analytics-form="year_2027"'));
  assert.ok(html.includes("/2027/opengraph-image"));
  const tools = await page(`/tools?locale=${locale}&analytics_test=1`);
  assert.ok(tools.includes(locale === "zh" ? '/2027?locale=zh' : '/2027'));
  const home = await page(`/?locale=${locale}&analytics_test=1`);
  assert.ok(home.includes(locale === "zh" ? '/2027?locale=zh' : '/2027'));
  console.log(`PASS ${locale}: SSR language, canonical, alternate, free schema, form, OG and discoverable entry points`);
}

const sitemap = await page("/sitemap.xml");
for (const url of ["https://www.destinypixel.com/2027</loc>", "https://www.destinypixel.com/2027?locale=zh</loc>"]) assert.ok(sitemap.includes(url), url);
assert.ok(!(await page("/robots.txt")).includes("Disallow: /2027"));
const image = await fetch(`${base}/2027/opengraph-image`);
assert.equal(image.status, 200);
assert.match(image.headers.get("content-type") || "", /image\/png/);
assert.ok((await image.arrayBuffer()).byteLength > 10000);
console.log("PASS sitemap, indexing and share image; no birth data or calculation API requested");
