import assert from "node:assert/strict";
import test from "node:test";
import sitemap from "@/app/sitemap";
import promptSitemap from "@/app/prompt/sitemap";
import { getIndexablePromptItems, promptItemHref } from "@/lib/prompt-library";
import { absoluteUrl, canonicalPagePath, languageAlternates, makePageMetadata, routeSeo } from "@/lib/seo";
import { getJournalArticle, journalMetadata, normalizeJournalLocale } from "@/lib/journal";

test("translated landing pages keep their own canonical and translated search text", () => {
  const zh = makePageMetadata({ ...routeSeo.home, locale: "zh" });
  const ru = makePageMetadata({ ...routeSeo.tuteng, locale: "ru" });
  assert.equal(zh.alternates?.canonical, "/?locale=zh");
  assert.match(JSON.stringify(zh.title), /八字/);
  assert.match(zh.description ?? "", /四柱八字/);
  assert.equal(ru.alternates?.canonical, "/tuteng?locale=ru");
  assert.match(JSON.stringify(ru.title), /Тотем/);
  assert.equal(zh.openGraph?.url, "/?locale=zh");
});

test("English and invalid locale aliases do not create duplicate canonical URLs", () => {
  assert.equal(canonicalPagePath("/palm", "en"), "/palm");
  assert.equal(canonicalPagePath("/palm", "unknown"), "/palm");
  assert.equal(canonicalPagePath("/palm", "cn"), "/palm?locale=zh");
  assert.equal(canonicalPagePath("/tools", "ru"), "/tools");
});

test("language alternates only claim translations that exist in initial HTML", () => {
  for (const path of ["/learn", "/daoyan", "/juben", "/prompt", "/xingpan", "/ultra", "/english"]) {
    assert.equal(languageAlternates(path), undefined, path);
  }
  assert.deepEqual(languageAlternates("/tools"), {
    en: "/tools",
    "zh-Hans": "/tools?locale=zh",
    "x-default": "/tools",
  });
  const traditional = makePageMetadata({ ...routeSeo.home, locale: "zh-TW" });
  assert.equal(traditional.alternates?.canonical, "/?locale=zh-TW");
  assert.equal(traditional.alternates?.languages, undefined);
});

test("standalone tools never inherit a homepage canonical or unrelated keywords", () => {
  const metadata = makePageMetadata({ path: "/english", title: "Bright Steps English | DestinyPixel", description: "English practice", keywords: ["English learning"] });
  assert.equal(metadata.alternates?.canonical, "/english");
  assert.equal(metadata.alternates?.languages, undefined);
  assert.deepEqual(metadata.title, { absolute: "Bright Steps English | DestinyPixel" });
  assert.deepEqual(metadata.keywords, ["DestinyPixel", "English learning"]);
});

test("every advertised language variant has a reciprocal canonical sitemap entry", () => {
  const entries = sitemap();
  const byUrl = new Map(entries.map((entry) => [entry.url, entry]));
  assert.equal(byUrl.size, entries.length, "sitemap URLs must be unique");
  for (const entry of entries) {
    for (const variant of Object.values(entry.alternates?.languages ?? {})) {
      assert.ok(variant);
      const target = byUrl.get(variant);
      assert.ok(target, `${variant} needs its own sitemap entry`);
      assert.deepEqual(target.alternates, entry.alternates);
      const url = new URL(variant);
      const canonical = url.pathname === "/journal" || url.pathname.startsWith("/journal/")
        ? journalMetadata(normalizeJournalLocale(url.searchParams.get("locale") ?? undefined), getJournalArticle(url.pathname.split("/")[2])).alternates?.canonical
        : canonicalPagePath(url.pathname, url.searchParams.get("locale") ?? "en");
      assert.equal(absoluteUrl(String(canonical)), variant);
    }
  }
  assert.ok(byUrl.has(absoluteUrl("/tools?locale=zh")));
  assert.ok(byUrl.has(absoluteUrl("/atelier")));
  assert.ok(!entries.some((entry) => entry.url.includes("locale=zh-TW")));
});

test("sitemap modification dates describe content rather than request time", () => {
  const entries = sitemap();
  const promptEntries = promptSitemap();
  assert.equal(entries.find((entry) => entry.url === absoluteUrl("/"))?.lastModified, undefined);
  assert.equal(promptEntries.find((entry) => entry.url === absoluteUrl("/prompt/about"))?.lastModified, undefined);
  for (const entry of promptEntries.filter((entry) => /\/prompt\/(case|article)\//.test(entry.url))) {
    assert.ok(entry.lastModified instanceof Date);
    assert.ok(Number.isFinite(entry.lastModified.getTime()));
  }
  assert.deepEqual(sitemap(), entries);
});

test("the metaphysics sitemap excludes experiments while Prompt keeps its own inventory", () => {
  const unrelated = ["/prompt", "/juben", "/daoyan", "/image", "/english", "/danci"];
  for (const entry of sitemap()) {
    const path = new URL(entry.url).pathname;
    assert.ok(!unrelated.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)), path);
  }
  const promptUrls = new Set(promptSitemap().map((entry) => entry.url));
  assert.ok(promptUrls.has(absoluteUrl("/prompt")));
  assert.ok(promptUrls.has(absoluteUrl("/prompt/articles")));
  assert.ok([...promptUrls].every((url) => new URL(url).pathname.startsWith("/prompt")));
  for (const item of getIndexablePromptItems()) {
    assert.ok(promptUrls.has(absoluteUrl(promptItemHref(item))), item.id);
  }
});
