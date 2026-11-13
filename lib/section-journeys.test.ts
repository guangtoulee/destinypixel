import test from "node:test";
import assert from "node:assert/strict";
import { journeyCopy, sectionKeys, sectionGuides, sectionHref, type SectionKey } from "./section-journeys";
import { journalArticles } from "./journal";

test("every primary section journey and legacy fallback links to complete existing articles in all four languages", () => {
  assert.deepEqual(sectionKeys, ["discover", "sticks", "compatibility"]);
  const allKeys: SectionKey[] = [...sectionKeys, "atelier"];
  for (const locale of ["en", "zh", "zh-TW", "ru"] as const) {
    const copy = journeyCopy(locale);
    for (const section of allKeys) {
      const href = new URL(sectionHref("/" + section, locale), "https://example.test");
      assert.equal(href.searchParams.get("locale"), locale === "en" ? null : locale);
      assert.ok(copy.sections[section].action && copy.sections[section].next);
      for (const slug of sectionGuides[section]) {
        const a = journalArticles.find(article => article.slug === slug);
        assert.ok(a, slug);
        assert.ok(a.translations[locale].sections.length, `${locale}/${slug}`);
      }
    }
  }
  assert.equal(journalArticles.filter(a => a.pillar && a.portraitDepth === "full").length, 60);
});
