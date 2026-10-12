import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import previousEditions from "@/content/day-pillar-people/previous-editions.json";
import registry from "@/content/day-pillar-people/verified-people.json";
import { calculateDateDayPillar } from "./day-pillar";
import { dayPillarCycle, pillarArticleSlug } from "./day-pillar-library";
import { isSafeBirthdaySource, peopleForPillar, verifiedDayPillarPeople, withDayPillarPeople } from "./day-pillar-people";
import { journalArticles, journalArticleSchema, journalHref, journalLocales, type JournalSection, type JournalTranslation } from "./journal";
import { absoluteUrl } from "./seo";

const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const editions: Record<string, Record<typeof journalLocales[number], { translationSha256: string; dateModified: string }>> = previousEditions.articles;
const expectedPillars: Record<string, string> = {
  "toni-morrison": "甲辰", "katherine-johnson": "乙巳", "sally-ride": "丙寅", "martin-luther-king-jr": "庚申",
  "marie-curie": "辛卯", "serena-williams": "丁未", "venus-williams": "辛酉", "frida-kahlo": "丙辰",
  "albert-einstein": "丙申", "charlie-chaplin": "壬戌", "tsung-dao-lee": "丁巳", "qian-xuesen": "乙卯",
  "ella-fitzgerald": "丁酉", "duke-ellington": "丁卯", "rachel-carson": "丙子", "maya-angelou": "甲戌",
  "thomas-edison": "丁丑", "eleanor-roosevelt": "甲午", "neil-armstrong": "丁亥", "ansel-adams": "甲戌",
  "rosa-parks": "丙辰", "tu-youyou": "甲寅",
};
const legacyPillars = ["甲子", "乙丑", "丙寅", "丁卯"];
const firstBatchPeople = verifiedDayPillarPeople.filter(person => Object.hasOwn(expectedPillars, person.id));

function originalTranslation(copy: JournalTranslation): JournalTranslation {
  return { ...copy, sections: copy.sections.flatMap(section => {
    if (section.people && section.id === "famous-birthdays" && section.paragraphs.length === 0 && !section.table) return [];
    const original: JournalSection = { ...section };
    delete original.people;
    return [original];
  }) };
}

test("the 22 source-backed birthday records match the independently supplied 20-pillar assignments", () => {
  assert.equal(registry.reviewedAt, "2026-10-12");
  assert.deepEqual(verifiedDayPillarPeople, registry.people);
  assert.equal(firstBatchPeople.length, 22);
  assert.deepEqual(firstBatchPeople.map(person => person.id).sort(), Object.keys(expectedPillars).sort());
  assert.equal(new Set(firstBatchPeople.map(person => person.id)).size, 22);
  assert.equal(new Set(firstBatchPeople.map(person => person.dayPillar)).size, 20);
  for (const person of firstBatchPeople) {
    assert.equal(person.dayPillar, expectedPillars[person.id], person.id);
    assert.deepEqual(calculateDateDayPillar(person.birthDate), { ok: true, pillar: person.dayPillar }, person.id);
    assert.equal(person.calendar, "gregorian", person.id);
    assert.equal(person.birthTime, null, `${person.id}: a date must not become a guessed birth time`);
    assert.ok(person.birthPlace.city.trim() && person.birthPlace.country.trim(), person.id);
    for (const locale of ["en", "zh"] as const) assert.ok(person.name[locale].trim() && person.field[locale].trim() && person.notes[locale].trim(), `${person.id}/${locale}`);
    assert.ok(person.sources.length > 0, person.id);
    for (const source of person.sources) {
      assert.ok(isSafeBirthdaySource(source.url), `${person.id}: ${source.url}`);
      assert.ok(source.publisher.trim() && source.evidence.trim(), person.id);
      assert.equal(source.evidenceType, "paraphrase_of_opened_original_page");
      assert.equal(source.accessedAt, "2026-10-11");
    }
  }
});

test("birthday source links accept HTTPS and reject executable, relative and credential-bearing URLs", () => {
  for (const url of ["https://www.nps.gov/people/rosa-parks.htm", "https://wtafiles.wtatennis.com/pdf/guide.pdf"]) assert.equal(isSafeBirthdaySource(url), true, url);
  for (const url of ["javascript:alert(1)", "data:text/html,unsafe", "http://example.com", "//example.com", "/journal", "https://user:secret@example.com/birthday", "not a URL"]) assert.equal(isSafeBirthdaySource(url), false, url);
});

test("only matched zh/en entries receive structured people; other languages remain untouched", () => {
  const addedIds: Record<"en" | "zh", string[]> = { en: [], zh: [] };
  for (const pillar of dayPillarCycle) {
    const article = journalArticles.find(item => item.pillar === pillar)!;
    assert.equal(article.slug, pillarArticleSlug(pillar));
    for (const locale of journalLocales) {
      const copy = article.translations[locale];
      const people = copy.sections.flatMap(section => section.people ?? []);
      const expected = locale === "en" || locale === "zh" ? peopleForPillar(pillar) : [];
      assert.deepEqual(people.map(person => person.id), expected.map(person => person.id), `${pillar}/${locale}`);
      assert.equal(new Set(people.map(person => person.id)).size, people.length, `${pillar}/${locale}: duplicate person`);
      assert.deepEqual(withDayPillarPeople(copy, pillar, locale), copy, `${pillar}/${locale}: repeated assembly duplicated content`);
      if (locale === "en" || locale === "zh") addedIds[locale].push(...people.map(person => person.id));
      if (!expected.length) {
        assert.deepEqual(withDayPillarPeople(copy, pillar, locale), copy, `${pillar}/${locale}: an unedited edition changed`);
        if (!legacyPillars.includes(pillar)) assert.ok(!copy.sections.some(section => section.id === "famous-birthdays"), `${pillar}/${locale}: empty famous-person section`);
      }
    }
  }
  for (const locale of ["en", "zh"] as const) assert.deepEqual(addedIds[locale].sort(), verifiedDayPillarPeople.map(person => person.id).sort());
});

test("a matching legacy name and date prevent a new structured record from being displayed twice", () => {
  const person = verifiedDayPillarPeople.find(item => item.id === "toni-morrison")!;
  const article = journalArticles.find(item => item.pillar === person.dayPillar)!;
  for (const locale of ["en", "zh"] as const) {
    const original = originalTranslation(article.translations[locale]);
    const copy: JournalTranslation = { ...original, sections: [...original.sections, {
      id: "famous-birthdays", title: "Existing sourced birthday", paragraphs: ["An existing birthday record."],
      table: { headings: ["Person", "Birthday", "Pillar"], rows: [[`${person.name[locale]} · ${person.field[locale]}`, person.birthDate, person.dayPillar]] },
    }] };
    assert.deepEqual(withDayPillarPeople(copy, person.dayPillar, locale), copy, locale);
  }
});

test("the original batch still covers 22 pillars, full zh/en coverage is 60 and zh-TW/ru retain the original four", () => {
  assert.equal(new Set([...Object.values(expectedPillars), ...legacyPillars]).size, 22);
  for (const locale of journalLocales) {
    const covered = journalArticles.filter(article => article.pillar && article.translations[locale].sections.some(section => section.id === "famous-birthdays" && ((section.people?.length ?? 0) > 0 || (section.table?.rows.length ?? 0) > 0))).map(article => article.pillar!);
    const expected = locale === "en" || locale === "zh" ? [...dayPillarCycle] : legacyPillars;
    assert.equal(covered.length, locale === "en" || locale === "zh" ? 60 : 4, locale);
    assert.deepEqual(covered.sort(), expected.sort(), locale);
  }
});

test("all 75 original translations survive the additive people content and all zh-TW/ru effective dates remain unchanged", () => {
  assert.equal(previousEditions.baseCommit, "f54c97098cfed468d7e3145bd730c41c0b27fdb7");
  assert.equal(journalArticles.length, previousEditions.journalCount);
  assert.deepEqual(journalArticles.map(article => article.slug).sort(), Object.keys(editions).sort());
  for (const article of journalArticles) {
    for (const locale of journalLocales) {
      const copy = article.translations[locale];
      const retained = locale === "en" || locale === "zh" ? originalTranslation(copy) : copy;
      assert.equal(digest(retained), editions[article.slug][locale].translationSha256, `${article.slug}/${locale}: original translation changed`);
      if (locale === "zh-TW" || locale === "ru") assert.equal(journalArticleSchema(article, locale)[0].dateModified, editions[article.slug][locale].dateModified, `${article.slug}/${locale}: unedited date changed`);
    }
  }
});

test("the four legacy birthday tables keep 32 rows and their sources without duplicating new people", () => {
  const existingDates = new Set<string>();
  let tableRows = 0;
  for (const pillar of legacyPillars) {
    const article = journalArticles.find(item => item.pillar === pillar)!;
    for (const locale of journalLocales) {
      const section = article.translations[locale].sections.find(item => item.id === "famous-birthdays")!;
      assert.equal(section.table?.rows.length, 2, `${pillar}/${locale}`);
      assert.equal(section.sources?.length, 2, `${pillar}/${locale}`);
      for (const [, date] of section.table!.rows) {
        tableRows++;
        existingDates.add(date);
        assert.deepEqual(calculateDateDayPillar(date), { ok: true, pillar }, `${pillar}/${locale}`);
      }
    }
  }
  assert.equal(tableRows, 32);
  assert.equal(existingDates.size, 10);
  for (const person of verifiedDayPillarPeople) assert.equal(existingDates.has(person.birthDate), false, `${person.id}: duplicated legacy birthday`);
});

test("Article schema cites exactly the legacy sources and the directly associated birthday sources", () => {
  for (const article of journalArticles) {
    for (const locale of journalLocales) {
      const copy = article.translations[locale];
      const original = originalTranslation(copy).sections.flatMap(section => section.sources?.map(source => source.href.startsWith("/") ? absoluteUrl(source.href) : source.href) ?? []);
      const added = [...new Set(copy.sections.flatMap(section => section.people?.flatMap(person => person.sources.map(source => source.url)) ?? []))].filter(url => !original.includes(url));
      const expected = [...original, ...added];
      const schema = journalArticleSchema(article, locale)[0];
      assert.deepEqual(schema.citation, expected, `${article.slug}/${locale}: original citation order or added birthday sources changed`);
      assert.equal(new Set(schema.citation.slice(original.length)).size, added.length, `${article.slug}/${locale}: duplicate new birthday citation`);
      assert.equal(schema.mainEntityOfPage, absoluteUrl(journalHref(locale, article.slug)), `${article.slug}/${locale}: URL changed`);
    }
  }
});
