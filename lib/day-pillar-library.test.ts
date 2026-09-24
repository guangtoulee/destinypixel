import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dayPillarCycle, pillarFacts, pillarArticleSlug, pillarArticleHref, pillarName } from "./day-pillar-library";
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
      assert.ok(copy.title.includes(pillarName(result.pillar, locale)));
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
  for (const pillar of ["乙丑", "丙寅"]) {
    const article = journalArticles.find(a => a.pillar === pillar)!;
    assert.equal(article.slug, pillarArticleSlug(pillar));
    assert.equal(article.publishedAt, "2026-09-23");
    assert.equal(article.updatedAt, "2026-09-24");
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

test("each portrait has its own complete multilingual exercise and editorial sections", () => {
  assert.deepEqual(Object.keys(pillarPractices).sort(), [...dayPillarCycle].sort());
  for (const edition of [0,1,2] as const) assert.equal(new Set(Object.values(pillarPractices).map(p=>p[edition])).size,60);
  for (const article of journalArticles.filter(a=>a.kind === "portrait")) {
    for (const locale of journalLocales) {
      const sections = article.translations[locale].sections;
      for (const id of ["stem-branch","personality","love","career","everyday-practice","calculation-and-context"]) assert.ok(sections.some(s=>s.id===id));
      const scene = sections.find(s=>s.id==="everyday-practice")!.paragraphs[0];
      assert.ok(scene.length > (locale.startsWith("zh") ? 40 : 120), `${article.slug}/${locale}: incomplete scene`);
      if(locale === "zh-TW") assert.equal(scene,toTraditional(scene));
    }
  }
});
