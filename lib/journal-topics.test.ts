import assert from "node:assert/strict";
import test from "node:test";
import { seoGuides, seoGuidePath } from "./seo-guides";
import { journalArticles, journalArticleLocales } from "./journal";
import { journalLocales } from "./journal-locales";
import { journalTopicEntries } from "./journal-topic-catalog";
import { journalArticleTopics, journalTopicAvailable, journalTopicHref, journalTopicIds, journalTopicLabels, normalizeJournalTopic } from "./journal-topics";

// Coverage is tied to the real article inventory so new articles need an editorial choice.
test("every published article has one to three controlled, translated subjects", () => {
  assert.ok(journalTopicIds.length <= 12);
  for (const locale of journalLocales) {
    const entries = journalTopicEntries(locale);
    assert.equal(new Set(entries.map(article => article.slug)).size, entries.length);
    assert.equal(entries.length, journalArticles.filter(article => journalArticleLocales(article).includes(locale)).length + 78 + 64 + 8 + (locale === "en" ? seoGuides.length : 0));
    for (const article of entries) {
      assert.ok(article.topics.length >= 1 && article.topics.length <= 3, article.slug);
      assert.equal(new Set(article.topics).size, article.topics.length, article.slug);
      for (const topic of article.topics) {
        assert.ok(journalTopicIds.includes(topic), `${article.slug}: ${topic}`);
        assert.ok(journalTopicLabels[locale][topic]);
      }
      const guide = locale === "en" ? seoGuides.find(guide => guide.slug === article.slug) : undefined;
      assert.equal(new URL(article.href, "https://www.destinypixel.com").pathname, guide ? seoGuidePath(guide) : `/journal/${article.slug}`);
    }
    for (const topic of journalTopicIds.filter(topic => journalTopicAvailable(topic, locale))) assert.ok(entries.some(article => article.topics.includes(topic)), `${locale}: empty ${topic}`);
  }
});

test("topics describe substantive content instead of tagging every portrait with popular subjects", () => {
  for (const article of journalArticles.filter(article => article.pillar)) assert.deepEqual(journalArticleTopics(article), ["day-pillars"]);
  assert.deepEqual(journalArticleTopics({slug:"tarot-ace-of-pentacles"}), ["tarot-reading"]);
  assert.deepEqual(journalArticleTopics({slug:"hexagram-01"}), ["iching"]);
  assert.deepEqual(journalArticleTopics({slug:"trigram-qian"}), ["iching"]);
  assert.deepEqual(journalArticleTopics({slug:"pamela-colman-smith-tarot-artist"}), ["tarot-history"]);
  assert.deepEqual(journalArticleTopics({slug:"five-element-bracelet-design"}), ["five-elements", "bracelets"]);
  assert.deepEqual(journalArticleTopics({slug:"yuelao-love-fortune-conversation"}), ["fortune-sticks", "relationships"]);
  assert.deepEqual(journalArticleTopics({slug:"unreviewed-new-article"}), []);
});

test("topic links preserve the authored locale and use only the existing journal route", () => {
  for (const locale of journalLocales) for (const topic of journalTopicIds.filter(topic => journalTopicAvailable(topic, locale))) {
    const url = new URL(journalTopicHref(locale, topic), "https://www.destinypixel.com");
    assert.equal(url.pathname, "/journal");
    assert.equal(url.searchParams.get("locale"), locale === "en" ? null : locale);
    assert.equal(url.searchParams.get("topic"), topic);
    assert.equal(url.hash, "#topic-results");
  }
  assert.equal(journalTopicHref("zh"), "/journal?locale=zh#topics");
  assert.equal(normalizeJournalTopic("tarot-history"), "tarot-history");
  assert.equal(normalizeJournalTopic("anything-else"), undefined);
});

test("filtered topics do not expose fallback translations as authored editions", () => {
  for (const locale of ["zh-TW", "ru"] as const) {
    const entries = journalTopicEntries(locale);
    for (const slug of ["ben-ming-nian-tai-sui", "how-to-read-celtic-cross", "how-to-keep-tarot-journal"]) assert.ok(!entries.some(article => article.slug === slug));
  }
  for (const locale of ["en", "zh"] as const) assert.ok(journalTopicEntries(locale).some(article => article.slug === "ben-ming-nian-tai-sui"));
});

// The older guide system has authored English content only; its five routes remain unchanged.
test("existing SEO guides get accurate subjects and appear only in English discovery", () => {
  for (const guide of seoGuides) {
    assert.ok(journalArticleTopics(guide).length > 0, guide.slug);
    assert.ok(journalTopicEntries("en").some(entry => entry.href === seoGuidePath(guide)));
    for (const locale of ["zh", "zh-TW", "ru"] as const) assert.ok(!journalTopicEntries(locale).some(entry => entry.slug === guide.slug));
  }
  assert.deepEqual(journalArticleTopics({slug:"chinese-palm-reading-vs-western"}), ["palmistry"]);
  assert.deepEqual(journalArticleTopics({slug:"i-ching-vs-tarot"}), ["iching", "tarot-reading"]);
  assert.equal(normalizeJournalTopic("palmistry", "zh"), undefined);
  assert.equal(journalTopicHref("ru", "palmistry"), "/journal?locale=ru#topics");
});
