import assert from "node:assert/strict";
import test from "node:test";
import { getTrigramArticle } from "./content";
import { trigramIds, trigramIdentities, trigramSlug, trigramIdFromSlug, type TrigramId } from "./identity";
import { trigramHref } from "./paths";
import { trigramMetadata, trigramCatalog, trigramSitemap } from "./metadata";
import { journalLocales, journalLanguageTags } from "@/lib/journal-locales";
import { absoluteUrl } from "@/lib/seo";
import verified from "@/content/hexagrams/identities.verified.json";

const classical = { qian: "乾，健也。", dui: "兌，說也。", li: "離，麗也。", zhen: "震，動也。", xun: "巽，入也。", kan: "坎，陷也。", gen: "艮，止也。", kun: "坤，順也。" };

test("eight three-line identities match the verified six-line source, including asymmetric orientations", () => {
  const patterns = new Set<string>();
  for (const id of trigramIds) {
    const identity = trigramIdentities[id], pure = verified.hexagrams[identity.pureHexagram - 1];
    assert.equal(identity.bits.length, 3);
    assert.ok(identity.bits.every(bit => bit === 0 || bit === 1));
    assert.deepEqual(identity.bits, pure.lowerTrigram.linesBottomUp);
    assert.deepEqual(identity.bits, pure.upperTrigram.linesBottomUp);
    assert.deepEqual([...identity.bits, ...identity.bits], pure.linesBottomUp);
    assert.equal(identity.symbol, pure.lowerTrigram.symbol);
    patterns.add(identity.bits.join(""));
  }
  assert.equal(patterns.size, 8);
  assert.deepEqual(trigramIdentities.dui.bits, [1, 1, 0]);
  assert.deepEqual(trigramIdentities.xun.bits, [0, 1, 1]);
  assert.deepEqual(trigramIdentities.zhen.bits, [1, 0, 0]);
  assert.deepEqual(trigramIdentities.gen.bits, [0, 0, 1]);
});

test("32 editions contain substantial distinct prose, classical text, modern examples and valid reading connections", () => {
  let count = 0;
  for (const locale of journalLocales) {
    const titles = new Set<string>(), bodyParagraphs = new Set<string>();
    for (const id of trigramIds) {
      const a = getTrigramArticle(id, locale);
      assert.ok(a);
      assert.equal(a.id, id);
      assert.equal(a.locale, locale);
      assert.equal(a.quote.text, classical[id]);
      assert.ok(a.quote.translation.length > 20);
      assert.match(a.quote.locator, /7|七/);
      assert.equal(a.introduction.length, 2);
      assert.deepEqual(a.sections.map(section => section.id), ["figure", "tradition", "example", "misreadings"]);
      const prose = [...a.introduction, ...a.sections.flatMap(section => section.paragraphs)];
      for (const section of a.sections) {
        assert.ok(section.title.length > 3);
        assert.ok(section.paragraphs.length >= 2);
      }
      for (const paragraph of prose) {
        assert.ok(paragraph.length > (locale === "zh" || locale === "zh-TW" ? 40 : 60), `${locale}/${id}: meaningful paragraph`);
        assert.ok(!bodyParagraphs.has(paragraph), `${locale}/${id}: duplicated body paragraph`);
        bodyParagraphs.add(paragraph);
      }
      const body = prose.join(" ");
      if (locale === "en" || locale === "ru") assert.ok(body.split(/\s+/).length >= 600, `${locale}/${id}: complete article`);
      else assert.ok(body.length >= 1000, `${locale}/${id}: complete article`);
      if (locale === "ru") assert.ok((body.match(/[А-Яа-яЁё]/g) ?? []).length > 1000);
      if (locale === "en") assert.ok((body.match(/[A-Za-z]/g) ?? []).length > 1000);
      assert.equal(a.reflections.length, 3);
      assert.equal(new Set(a.reflections).size, 3);
      assert.equal(a.relatedTrigrams.length, 2);
      assert.equal(new Set(a.relatedTrigrams).size, 2);
      for (const related of a.relatedTrigrams) {
        assert.notEqual(related, id);
        assert.ok(getTrigramArticle(related, locale));
      }
      assert.equal(a.hexagramNumbers.length, 3);
      assert.equal(a.hexagramNumbers[0], trigramIdentities[id].pureHexagram);
      assert.equal(new Set(a.hexagramNumbers).size, 3);
      for (const number of a.hexagramNumbers) {
        const hexagram = verified.hexagrams[number - 1];
        assert.ok(hexagram);
        assert.ok(hexagram.lowerTrigram.id === id || hexagram.upperTrigram.id === id, `${locale}/${id}: related figure contains this trigram`);
      }
      titles.add(a.title);
      count++;
    }
    assert.equal(titles.size, 8);
    assert.equal(trigramCatalog(locale).length, 8);
  }
  assert.equal(count, 32);
});

test("only exact known trigram slugs load articles or generate article paths", () => {
  for (const id of trigramIds) assert.equal(trigramIdFromSlug(trigramSlug(id)), id);
  for (const slug of ["trigrams", "qian", "trigram-", "trigram-Qian", "trigram-qian-extra", "trigram-qian/", "trigram-constructor", "trigram-__proto__", "../trigram-qian"]) assert.equal(trigramIdFromSlug(slug), undefined);
  for (const id of ["constructor", "__proto__", "../qian", "qian-extra", ""]) {
    assert.equal(getTrigramArticle(id, "en"), undefined);
    assert.throws(() => trigramHref(id as TrigramId, "en"), /Unknown trigram/);
  }
});

test("all 36 index/article language editions have reciprocal canonical, hreflang, sitemap and matching titles", () => {
  const routes = trigramSitemap();
  assert.equal(routes.length, 36);
  assert.equal(new Set(routes.map(route => route.url)).size, 36);
  for (const id of [undefined, ...trigramIds]) {
    for (const locale of journalLocales) {
      const href = trigramHref(id, locale), metadata = trigramMetadata(locale, id);
      assert.equal(metadata.alternates?.canonical, href);
      const languages = metadata.alternates?.languages;
      assert.equal(Object.keys(languages ?? {}).length, 5);
      for (const language of journalLocales) assert.equal(languages?.[journalLanguageTags[language]], absoluteUrl(trigramHref(id, language)));
      assert.equal(languages?.["x-default"], absoluteUrl(trigramHref(id, "en")));
      const route = routes.find(item => item.url === absoluteUrl(href));
      assert.ok(route);
      assert.deepEqual(route.alternates.languages, languages);
      if (id) {
        const a = getTrigramArticle(id, locale)!;
        assert.deepEqual(metadata.title, { absolute: `${a.title} | DestinyPixel` });
        assert.equal(metadata.description, a.summary);
      }
    }
  }
});
