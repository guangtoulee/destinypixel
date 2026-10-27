import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { journalTopicEntries } from "../lib/journal-topic-catalog";
import { journalLocales, journalLanguageTags } from "../lib/journal-locales";
import { journalTopicHref, journalTopicIds, journalTopicLabels } from "../lib/journal-topics";
import { tarotLearningCatalog } from "../lib/tarot-learning/metadata";
import { tarotLearningHref } from "../lib/tarot-learning/paths";

const base = (process.argv[2] ?? "http://127.0.0.1:3047").replace(/\/$/, "");
const output = process.env.QA_EVIDENCE_DIR ?? "docs/qa/card-search-topics-20261027/local-http";
mkdirSync(output, { recursive: true });
const origin = "https://www.destinypixel.com";
const report: { base: string; articles: { locale: string; count: number }[]; topics: { locale: string; topic: string; count: number }[]; directories: { locale: string; cards: number }[]; unavailable: { locale: string; topic: string }[]; status?: string; error?: string } = { base, articles: [], topics: [], directories: [], unavailable: [] };
const decode = (value: string) => value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const attrs = (tag: string) => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(match => [match[1], decode(match[2])]));
async function html(path: string) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(30000), headers: { "User-Agent": "DestinyPixel-read-only-release-QA" } });
  assert.equal(response.status, 200, path);
  const text = await response.text();
  return text;
}
function metadata(page: string, path: string, language: string) {
  const links = [...page.matchAll(/<link\b[^>]*>/g)].map(match => attrs(match[0]));
  assert.equal(links.find(link => link.rel === "canonical")?.href, origin + path, `${path}: canonical`);
  assert.equal((page.match(/<h1[ >]/g) ?? []).length, 1, `${path}: H1`);
  assert.ok(page.includes(`lang="${language}"`), `${path}: language`);
}
async function main() {
  for (const locale of journalLocales) {
    const entries = journalTopicEntries(locale);
    for (let start = 0; start < entries.length; start += 4) {
      await Promise.all(entries.slice(start, start + 4).map(async entry => {
        const page = await html(entry.href);
        metadata(page, entry.href, journalLanguageTags[locale]);
        const tags = [...page.matchAll(/<nav\b[^>]*data-article-topics[^>]*>([\s\S]*?)<\/nav>/g)];
        assert.equal(tags.length, 1, `${entry.href}: exactly one article topics navigation`);
        const links = [...tags[0][1].matchAll(/<a\b[^>]*>/g)].map(match => attrs(match[0]));
        assert.deepEqual(links.map(link => link["data-topic"]), entry.topics, `${entry.href}: rendered subject assignments`);
        for (const [index, topic] of entry.topics.entries()) {
          assert.equal(links[index].href, journalTopicHref(locale, topic), `${entry.href}: working topic URL`);
          assert.ok(decode(tags[0][1]).includes(journalTopicLabels[locale][topic]), `${entry.href}: translated topic label`);
        }
      }));
    }
    report.articles.push({ locale, count: entries.length });
    console.log(`PASS ${locale}: ${entries.length} article URLs, canonical, SSR subject tags and translated filter links`);
    for (const topic of journalTopicIds) {
      const selected = entries.filter(entry => entry.topics.includes(topic));
      if (!selected.length) {
        const rawPath = `/journal?${locale === "en" ? "" : `locale=${locale}&`}topic=${topic}`;
        const fallback = await html(rawPath);
        metadata(fallback, `/journal${locale === "en" ? "" : `?locale=${locale}`}`, journalLanguageTags[locale]);
        assert.equal((fallback.match(/\bdata-topic-results=/g) ?? []).length, 0, `${rawPath}: must show all topics instead of an empty index`);
        assert.equal((fallback.match(new RegExp(`data-topic="${topic}"`, "g")) ?? []).length, 0, `${rawPath}: unavailable topic control`);
        report.unavailable.push({ locale, topic });
        continue;
      }
      const page = await html(journalTopicHref(locale, topic));
      const indexPath = `/journal${locale === "en" ? "" : `?locale=${locale}`}`;
      metadata(page, indexPath, journalLanguageTags[locale]);
      assert.match(page, /<meta\b[^>]*name="robots"[^>]*content="noindex, follow"/, `${locale}/${topic}: query filter indexing`);
      const slugs = [...page.matchAll(/\bdata-topic-result="([^"]+)"/g)].map(match => match[1]);
      assert.deepEqual(slugs, selected.map(entry => entry.slug), `${locale}/${topic}: correct complete subset`);
      const schema = [...page.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1])).find(value => value["@type"] === "CollectionPage");
      assert.equal(schema.mainEntity.numberOfItems, selected.length);
      assert.deepEqual(schema.mainEntity.itemListElement.map((item: { url: string }) => item.url), selected.map(entry => origin + entry.href));
      report.topics.push({ locale, topic, count: selected.length });
    }
    const directory = await html(tarotLearningHref(undefined, locale)!);
    metadata(directory, tarotLearningHref(undefined, locale)!, journalLanguageTags[locale]);
    assert.equal((directory.match(/\bdata-card-id="/g) ?? []).length, 78);
    for (const card of tarotLearningCatalog(locale)) {
      assert.ok(decode(directory).includes(`href="${tarotLearningHref(card.cardId, locale)}"`));
      assert.ok(decode(directory).includes(card.quickTake.upright));
      assert.ok(decode(directory).includes(card.quickTake.reversed));
    }
    report.directories.push({ locale, cards: 78 });
  }
  report.status = "passed";
  console.log(`PASS ${report.articles.reduce((sum, row) => sum + row.count, 0)} article editions, ${report.topics.length} complete filters and 4 crawlable 78-card directories.`);
}
main().catch(error => { report.status = "failed"; report.error = error.stack; console.error(error); process.exitCode = 1; }).finally(() => writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2)));
