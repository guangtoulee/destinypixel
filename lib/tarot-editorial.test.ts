import assert from "node:assert/strict";
import test from "node:test";
import { journalArticles, journalLocales, journalMetadata } from "./journal";
import { tarotLearningIds, tarotLearningId } from "./tarot-learning/paths";
import { tarotLearningSitemap } from "./tarot-learning/metadata";
import { tarotEducationSlugs, editorialCardIds, relatedEditorialSlugs } from "./tarot-editorial/navigation";
import depthManifest from "@/content/tarot-depth-20261008/revisions.json";

test("education slugs remain separate from the original card routes and old articles", () => {
  for (const slug of tarotEducationSlugs) {
    assert.equal(tarotLearningId(slug), undefined);
    const matches = journalArticles.filter(a => a.slug === slug);
    assert.equal(matches.length, 1);
    assert.equal(matches[0].kind, "education");
    for (const locale of journalLocales) {
      assert.equal(journalMetadata(locale, matches[0]).alternates?.canonical, `/journal/${slug}${locale === "en" ? "" : `?locale=${locale}`}`);
      assert.ok(matches[0].translations[locale].sections.every(s => s.bodyMarkdown));
    }
  }
  for (const slug of ["pamela-colman-smith-tarot-artist", "how-to-read-three-card-tarot"]) {
    assert.ok(journalArticles.some(a => a.slug === slug));
    assert.ok(relatedEditorialSlugs(slug).length);
  }
  for (const ids of Object.values(editorialCardIds)) for (const id of ids) {
    assert.ok(tarotLearningIds.some(known => known === id));
    assert.ok(relatedEditorialSlugs(`tarot-${id}`).length);
  }
});

test("sitemap revision dates change only for the Sun, its directory and explicitly revised cards", () => {
  for (const entry of tarotLearningSitemap()) {
    const url = new URL(entry.url);
    const path = url.pathname;
    const locale = url.searchParams.get("locale")??"en";
    const revised:Record<string,{locales:string[]}>=depthManifest.cards;
    assert.equal(entry.lastModified, ["/journal/tarot-sun", "/journal/tarot-cards",...Object.keys(revised).filter(id=>revised[id].locales.includes(locale)).map(id=>`/journal/tarot-${id}`)].includes(path) ? "2026-10-08" : "2026-10-07");
  }
});
