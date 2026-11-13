import test from "node:test";
import assert from "node:assert/strict";
import { topicCopy, topicGuides, topicKeys, siteFunctions, type TopicKey } from "./topic-journeys";
import { sectionKeys, sectionHref } from "./section-journeys";
import { directoryTools } from "./tool-directory";
import { journalArticles } from "./journal";

test("six core navigation realms and legacy atelier fallback resolve cleanly across four locales", () => {
  assert.equal(sectionKeys.length, 3);
  assert.equal(topicKeys.length, 6);
  assert.ok(!topicKeys.includes("atelier" as never));
  assert.ok(!directoryTools.some(tool => tool.key === "atelier"));

  const allTopics: TopicKey[] = [...topicKeys, "atelier"];
  for (const locale of ["en", "zh", "zh-TW", "ru"] as const) {
    for (const topic of allTopics) {
      assert.ok(topicCopy(locale).sections[topic].action);
      for (const slug of topicGuides[topic]) {
        const article = journalArticles.find(item => item.slug === slug);
        assert.ok(article?.translations[locale].sections.length, `${locale}/${slug}`);
      }
    }
    for (const current of ["tarot", "astrology", "atelier"] as const) {
      const links = siteFunctions(locale, current);
      assert.deepEqual(
        links.map(link => link.key).sort(),
        ["discover", ...directoryTools.filter(tool => tool.key !== current).map(tool => tool.key)].sort(),
      );
      assert.equal(new Set(links.map(link => link.key)).size, links.length);
      for (const link of links) {
        assert.ok(link.name);
        assert.doesNotMatch(link.path, /prompt|script|image|english|atelier/);
        const url = new URL(sectionHref(link.path, locale), "https://example.test");
        assert.equal(url.searchParams.get("locale"), locale === "en" ? null : locale);
      }
      assert.equal(links.find(link => link.key === "birth-map")?.fragment, "#report");
    }
  }
});
