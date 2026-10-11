import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dayPillarCycle, pillarFacts, pillarArticleSlug, pillarArticleHref, pillarCardHref, pillarName } from "./day-pillar-library";
import { getDayPillarCards } from "./day-pillar-cards";
import type { JournalTranslation } from "./journal";
import { journalArticles, journalLocales, journalArticleSchema } from "./journal";
import { pillarPractices } from "./day-pillar-practices";
import { getPillarImagePath } from "./archetype-assets";
import { calculateDateDayPillar } from "./day-pillar";
import { stemDetails, branchTotems } from "./bazi-totems";
import { toTraditional } from "./journal-locales";

test("all 60 calculated results have one searchable article and a real JPEG card", () => {
  const portraits = journalArticles.filter(a => a.pillar);
  assert.equal(portraits.length, 60);
  assert.equal(new Set(portraits.map(a => a.slug)).size, 60);
  assert.equal(dayPillarCycle[0], "甲子");
  assert.equal(dayPillarCycle.at(-1), "癸亥");
  for (let i = 0; i < 60; i++) {
    const result = calculateDateDayPillar(new Date(Date.UTC(2000,0,1+i)).toISOString().slice(0,10));
    assert.ok(result.ok);
    const article = portraits.find(a => a.pillar === result.pillar);
    assert.ok(article, result.pillar);
    assert.equal(article.slug, pillarArticleSlug(result.pillar));
    const jpeg = readFileSync(`public${getPillarImagePath(result.pillar).split("?")[0]}`);
    assert.equal(jpeg.subarray(0,3).toString("hex"), "ffd8ff");
    for (const locale of journalLocales) {
      const copy: JournalTranslation = article.translations[locale];
      assert.ok(copy.title.includes(result.pillar));
      // The searchable calendar title need not also carry the original card name.
      assert.ok(pillarArticleHref(result.pillar,locale).includes(article.slug));
      assert.ok(journalArticleSchema(article,locale)[0].image?.[0].includes(getPillarImagePath(result.pillar)));
      for (const source of copy.sections.flatMap(s=>s.sources??[])) {
        if (source.href.startsWith("/journal/")) {
          const url = new URL(source.href,"https://www.destinypixel.com");
          assert.ok(journalArticles.some(a=>`/journal/${a.slug}`===url.pathname), source.href);
          assert.equal(url.searchParams.get("locale") ?? "en", locale);
        }
      }
    }
  }
});

test("all 60 encyclopedia entries and original cards map to the same pillar in every language", () => {
  const articles = journalArticles.filter(article => article.pillar);
  assert.equal(new Set(articles.map(article => article.pillar)).size, 60);
  for (const locale of journalLocales) {
    const cards = getDayPillarCards(locale);
    assert.equal(cards.length, 60);
    assert.equal(new Set(cards.map(card => card.slug)).size, 60);
    const articleHrefs = new Set<string>();
    const cardHrefs = new Set<string>();
    for (const pillar of dayPillarCycle) {
      const matchingArticles = articles.filter(article => article.pillar === pillar);
      const matchingCards = cards.filter(card => card.pillar === pillar);
      assert.equal(matchingArticles.length, 1, `${locale}/${pillar}: encyclopedia entry`);
      assert.equal(matchingCards.length, 1, `${locale}/${pillar}: original card`);
      const article = matchingArticles[0], card = matchingCards[0];
      assert.equal(article.slug, `${card.slug.replace("_", "-")}-day-pillar`);
      assert.equal(card.name, pillarName(pillar, locale));
      assert.equal(card.image, getPillarImagePath(pillar));

      const articleHref = pillarArticleHref(pillar, locale);
      const articleUrl = new URL(articleHref, "https://www.destinypixel.com");
      assert.equal(articleUrl.pathname, `/journal/${article.slug}`);
      assert.equal(articleUrl.searchParams.get("locale") ?? "en", locale);
      assert.deepEqual([...articleUrl.searchParams.keys()], locale === "en" ? [] : ["locale"]);

      const cardHref = pillarCardHref(pillar, locale);
      const cardUrl = new URL(cardHref, "https://www.destinypixel.com");
      assert.equal(cardUrl.pathname, locale === "zh-TW" || locale === "ru" ? "/discover" : "/day-pillar");
      assert.equal(cardUrl.searchParams.get("locale") ?? "en", locale);
      assert.equal(cardUrl.searchParams.get("pillar"), card.slug);
      assert.deepEqual([...cardUrl.searchParams.keys()], locale === "en" ? ["pillar"] : ["locale", "pillar"]);
      articleHrefs.add(articleHref);
      cardHrefs.add(cardHref);
    }
    assert.equal(articleHrefs.size, 60, `${locale}: unique encyclopedia destinations`);
    assert.equal(cardHrefs.size, 60, `${locale}: unique original card destinations`);
  }
  for (const pillar of ["甲丑", "", "__proto__"]) assert.throws(() => pillarCardHref(pillar, "en"));
});

test("reference facts match the site's chart labels and reject impossible pairs", () => {
  for (const pillar of dayPillarCycle) {
    const f = pillarFacts(pillar,"en");
    assert.equal(f.master,stemDetails[pillar[0]].polarityElement.en);
    assert.ok(f.animal.includes(branchTotems[pillar[1]].animal.en) || pillar[1] === "未" || pillar[1] === "亥");
    assert.equal(f.pinyin,`${stemDetails[pillar[0]].pinyin} ${branchTotems[pillar[1]].pinyin}`);
  }
  assert.throws(()=>pillarArticleHref("甲丑","en"));
  assert.throws(()=>pillarFacts("","zh"));
});

test("expanded portraits retain their URLs and reproduce every sourced public birthday", () => {
  for (const pillar of ["乙丑", "丙寅", "丁卯"]) {
    const article = journalArticles.find(a => a.pillar === pillar)!;
    assert.equal(article.slug, pillarArticleSlug(pillar));
    assert.equal(article.publishedAt, "2026-09-23");
    assert.equal(article.updatedAt, pillar === "丁卯" ? "2026-09-29" : "2026-09-24");
    assert.equal(article.portraitDepth, "full");
    const prose = article.translations.en.sections.flatMap(s => s.paragraphs).join(" ");
    assert.ok(prose.split(/\s+/).length > 1000, `${pillar}: expanded prose missing`);
    for (const locale of journalLocales) {
      const section = article.translations[locale].sections.find(s => s.id === "famous-birthdays")!;
      assert.equal(section.table?.rows.length, 2);
      assert.equal(section.sources?.length, 2);
      assert.ok(section.sources!.every(s => /^https:\/\/(www\.)?(nobelprize\.org|obamalibrary\.gov)\//.test(s.href)));
      for (const [, date, result] of section.table!.rows) {
        assert.deepEqual(calculateDateDayPillar(date), { ok: true, pillar });
        assert.ok(result.includes(pillar));
      }
    }
  }
  // A substantive rewrite must not silently freshen all other portraits.
  for (const a of journalArticles.filter(a => a.kind === "portrait" && a.portraitDepth !== "full")) {
    assert.equal(a.updatedAt, "2026-09-23");
  }
});

test("each portrait retains its multilingual calendar, interpretation and exercise sections", () => {
  assert.deepEqual(Object.keys(pillarPractices).sort(), [...dayPillarCycle].sort());
  for (const edition of [0,1,2] as const) assert.equal(new Set(Object.values(pillarPractices).map(p=>p[edition])).size,60);
  for (const article of journalArticles.filter(a=>a.kind === "portrait")) {
    for (const locale of journalLocales) {
      const sections = article.translations[locale].sections;
      // Editorial sections can vary: a sourced encyclopedia need not make career claims.
      for (const id of ["stem-branch","personality","love","everyday-practice","calculation-and-context"]) assert.ok(sections.some(s=>s.id===id), `${article.slug}/${locale}: ${id}`);
      const scene = sections.find(s=>s.id==="everyday-practice")!.paragraphs[0];
      assert.ok(scene.length > (locale.startsWith("zh") ? 40 : 120), `${article.slug}/${locale}: incomplete scene`);
      if(locale === "zh-TW") assert.equal(scene,toTraditional(scene));
    }
  }
});
