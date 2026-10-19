import assert from "node:assert/strict";
import test from "node:test";
import { normalizeJournalLocale } from "./journal";
import { normalizeReportLocale } from "./report-i18n";
import { legacyDocumentLanguage, queryDocumentLanguage, queryDocumentLocalePolicy, resolvedDocumentPath } from "./document-locale";

const tags = { en: "en", zh: "zh-CN", "zh-TW": "zh-TW", ru: "ru" } as const;
const inputs = ["en", "zh", "zh-TW", "ru", "cn", "tw", "zh-Hans", "zh-Hant", "zh-CN", "RU", "invalid", ""];

test("document language follows the actual report and article locale normalizers", () => {
  for (const locale of inputs) {
    for (const path of ["/", "/tarot", "/astrology", "/product-facts", "/discover"]) {
      assert.equal(queryDocumentLanguage(path, locale), tags[normalizeReportLocale(locale)], `${path}?locale=${locale}`);
    }
    for (const path of ["/journal", "/journal/tarot-cards", "/journal/sun-moon-rising-signs-explained"]) {
      assert.equal(queryDocumentLanguage(path, locale), tags[normalizeJournalLocale(locale)], `${path}?locale=${locale}`);
    }
  }
});

test("the two-language directory and day-pillar page do not acquire unsupported translations", () => {
  for (const path of ["/tools", "/day-pillar", "/2027"]) {
    for (const locale of inputs) assert.equal(queryDocumentLanguage(path, locale), locale === "zh" ? "zh-CN" : "en", `${path}?locale=${locale}`);
    assert.equal(queryDocumentLanguage(path, null), "en");
  }
});

test("static routes and other projects stay outside request-time document localization", () => {
  for (const path of ["/learn", "/learn/what-is-bazi-birth-chart", "/insights/i-ching-vs-tarot", "/xingpan", "/ultra", "/english", "/image", "/prompt/articles", "/zhangshengjun", "/zhangshengjun/en", "/blender", "/ocean", "/api/astrology"]) {
    assert.equal(queryDocumentLocalePolicy(path), null, path);
  }
  assert.equal(resolvedDocumentPath([]), "/");
  assert.equal(resolvedDocumentPath(["journal", "tarot-death"]), "/journal/tarot-death");
  assert.equal(resolvedDocumentPath(["(projects)", "zhangshengjun"]), "/zhangshengjun");
  assert.equal(queryDocumentLocalePolicy(resolvedDocumentPath(["zhangshengjun"])), null);
});

test("legacy browser synchronization preserves its original canonical query behavior", () => {
  for (const locale of inputs) {
    assert.equal(legacyDocumentLanguage(locale), locale === "zh" ? "zh-CN" : locale === "zh-TW" ? "zh-TW" : locale === "ru" ? "ru" : "en");
  }
  assert.equal(legacyDocumentLanguage(null), "en");
});
