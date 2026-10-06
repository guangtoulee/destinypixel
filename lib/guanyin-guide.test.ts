import assert from "node:assert/strict";
import test from "node:test";
import sitemap from "../app/sitemap";
import { absoluteUrl } from "./seo";
import { getSeoGuide } from "./seo-guides";
import { journalLocales, journalLanguageTags } from "./journal-locales";
import { guanyinAlternates, guanyinGuideCopy, guanyinGuidePath, guanyinHref, guanyinLocale, guanyinPublishedAt, guanyinSources, guanyinToolHref, guanyinUpdatedAt } from "./guanyin-guide";

test("Guanyin keeps the established URL and publication date with four reciprocal editions", () => {
  assert.equal(guanyinGuidePath, "/learn/guanyin-fortune-sticks");
  assert.equal(guanyinPublishedAt, "2026-09-17");
  const entries = sitemap().filter(entry => new URL(entry.url).pathname === guanyinGuidePath);
  assert.equal(entries.length, 4);
  const languages = guanyinAlternates();
  assert.equal(languages["x-default"], absoluteUrl(guanyinGuidePath));
  for (const locale of journalLocales) {
    const url = absoluteUrl(guanyinHref(locale));
    const entry = entries.find(item => item.url === url);
    assert.ok(entry);
    assert.equal(entry.lastModified, guanyinUpdatedAt);
    assert.deepEqual(entry.alternates?.languages, languages);
    assert.equal(languages[journalLanguageTags[locale]], url);
    assert.equal(new URL(guanyinToolHref(locale), "https://example.com").searchParams.get("locale"), locale);
    assert.equal(new URL(guanyinToolHref(locale), "https://example.com").searchParams.get("type"), "guanyin");
  }
  assert.equal(guanyinLocale(undefined), "en");
  assert.equal(guanyinLocale("fr"), "en");
  assert.equal(guanyinLocale(["zh", "ru"]), "en");
  assert.equal(guanyinLocale("zh-TW"), "zh-TW");
});

test("all editions include provenance, a reading method, labeled original examples and tool limits", () => {
  const exampleLabels = { en: /Original teaching example—not an ancient poem/, zh: /原创教学例子——不是古代签诗/, "zh-TW": /原創教學例子——不是古代籤詩/, ru: /Авторский учебный пример — не древний стих/ };
  const scopeLabels = { en: /original modern reflections/, zh: /原创现代短签/, "zh-TW": /原創現代短籤/, ru: /авторские современные размышления/ };
  for (const locale of journalLocales) {
    const guide = guanyinGuideCopy[locale];
    assert.deepEqual(guide.sections.map(s => s.id), ["versions", "reading", "examples", "online-temple", "try"]);
    assert.equal(guide.sections.find(s => s.id === "reading")?.steps?.length, 4);
    const examples = guide.sections.find(s => s.id === "examples")!;
    assert.equal(examples.paragraphs.length, 3);
    assert.match(examples.paragraphs[0], exampleLabels[locale]);
    assert.match(guide.scope, scopeLabels[locale]);
    assert.match(guide.disclaimer, /not medical|不构成医疗|不構成醫療|не для медицинских/);
    for (const section of guide.sections.filter(s => s.source)) {
      assert.equal(new URL(guanyinSources[section.source!.key]).hostname, "www.shoushanyan.org.tw");
    }
    assert.equal(guide.sections.filter(s => s.source).length, 2);
    assert.ok(guide.related.every(link => !link.slug.includes("pillar")));
  }
  assert.equal(getSeoGuide("learn", "guanyin-fortune-sticks")?.title, guanyinGuideCopy.en.title);
  assert.match(guanyinGuideCopy["zh-TW"].sections.find(s => s.id === "examples")!.paragraphs[2], /不預告復合/);
  assert.doesNotMatch(JSON.stringify(guanyinGuideCopy["zh-TW"]), /複合/);
  assert.doesNotMatch(JSON.stringify(guanyinGuideCopy["zh-TW"]), /求签|签诗|线上|关系|确认/);
});
