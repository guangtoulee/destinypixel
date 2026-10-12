import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import sitemap from "@/app/sitemap";
import baseline from "@/content/day-pillar-people/second-batch-previous-editions.json";
import secondRevisions from "@/content/day-pillar-people/second-batch-revisions.json";
import registry from "@/content/day-pillar-people/verified-people.json";
import { calculateDateDayPillar } from "./day-pillar";
import { dayPillarCycle, pillarArticleSlug } from "./day-pillar-library";
import { verifiedDayPillarPeople } from "./day-pillar-people";
import { journalArticles, journalArticleSchema, journalHref, journalLocales, type JournalSection, type JournalTranslation } from "./journal";
import { absoluteUrl } from "./seo";

// Parent-approved source dates and independently supplied calendar assignments.
// These literals are captured before converting the source candidates into the registry.
const expectedAssignments = [
  ["kazuo-ishiguro", "1954-11-08", "戊辰"],
  ["barack-obama", "1961-08-04", "己巳"],
  ["barbara-mcclintock", "1902-06-16", "庚午"],
  ["shirin-ebadi", "1947-06-21", "辛未"],
  ["bob-dylan", "1941-05-24", "壬申"],
  ["irene-joliot-curie", "1897-09-12", "癸酉"],
  ["daniel-kahneman", "1934-03-05", "乙亥"],
  ["katalin-kariko", "1955-01-17", "戊寅"],
  ["syukuro-manabe", "1931-09-21", "己卯"],
  ["demis-hassabis", "1976-07-27", "庚辰"],
  ["john-steinbeck", "1902-02-27", "辛巳"],
  ["cv-raman", "1888-11-07", "壬午"],
  ["steven-chu", "1948-02-28", "癸未"],
  ["john-nash", "1928-06-13", "甲申"],
  ["abhijit-banerjee", "1961-02-21", "乙酉"],
  ["max-planck", "1858-04-23", "丙戌"],
  ["claudia-goldin", "1946-05-14", "戊子"],
  ["esther-duflo", "1972-10-25", "己丑"],
  ["ada-yonath", "1939-06-22", "庚寅"],
  ["albert-camus", "1913-11-07", "壬辰"],
  ["frances-arnold", "1956-07-25", "癸巳"],
  ["desmond-tutu", "1931-10-07", "乙未"],
  ["jennifer-doudna", "1964-02-19", "戊戌"],
  ["gabriel-garcia-marquez", "1927-03-06", "己亥"],
  ["herta-muller", "1953-08-17", "庚子"],
  ["andrea-ghez", "1965-06-16", "辛丑"],
  ["carolyn-bertozzi", "1966-10-10", "壬寅"],
  ["maria-goeppert-mayer", "1906-06-28", "癸卯"],
  ["gao-xingjian", "1940-01-04", "丙午"],
  ["samuel-ting", "1936-01-27", "戊申"],
  ["donna-strickland", "1959-05-27", "己酉"],
  ["louise-gluck", "1943-04-22", "庚戌"],
  ["han-kang", "1970-11-27", "辛亥"],
  ["rita-levi-montalcini", "1909-04-22", "壬子"],
  ["gabriela-mistral", "1889-04-07", "癸丑"],
  ["richard-feynman", "1918-05-11", "戊午"],
  ["sigrid-undset", "1882-05-20", "己未"],
  ["paul-dirac", "1902-08-08", "癸亥"],
] as const;
const firstIds = new Set(baseline.firstBatch.ids);
const firstPeople = verifiedDayPillarPeople.filter(person => firstIds.has(person.id));
const secondPeople = verifiedDayPillarPeople.filter(person => !firstIds.has(person.id));
const newIds = new Set<string>(expectedAssignments.map(([id]) => id));
const editedSlugs = expectedAssignments.map(([, , pillar]) => pillarArticleSlug(pillar)).sort();
const editions: Record<string, Record<typeof journalLocales[number], { translationSha256: string; citationSha256: string; dateModified: string }>> = baseline.articles;
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const fileDigest = (path: string) => createHash("sha256").update(readFileSync(new URL(path, import.meta.url))).digest("hex");

function beforeSecondBatch(copy: JournalTranslation): JournalTranslation {
  return { ...copy, sections: copy.sections.flatMap(section => {
    if (!section.people) return [section];
    const retained = section.people.filter(person => !newIds.has(person.id));
    if (retained.length) return [{ ...section, people: retained }];
    const original: JournalSection = { ...section };
    delete original.people;
    if (section.id === "famous-birthdays" && section.paragraphs.length === 0 && !section.table) return [];
    return [original];
  }) };
}

test("the second batch keeps the first 22 people and both first-batch historical files unchanged", () => {
  assert.equal(baseline.baseCommit, "05c507ce378351b3248168daa900396bddd8458a");
  assert.equal(firstPeople.length, baseline.firstBatch.count);
  assert.equal(firstPeople.length, 22);
  assert.equal(digest(firstPeople), baseline.firstBatch.peopleSha256);
  assert.equal(fileDigest("../content/day-pillar-people/revisions.json"), baseline.firstBatch.revisionsFileSha256);
  assert.equal(fileDigest("../content/day-pillar-people/previous-editions.json"), baseline.firstBatch.previousEditionsFileSha256);
});

test("all 38 approved Nobel Facts birthdays fill exactly the previously uncovered 38 pillars", () => {
  assert.equal(registry.reviewedAt, "2026-10-12");
  assert.deepEqual(verifiedDayPillarPeople, registry.people);
  assert.equal(verifiedDayPillarPeople.length, 60);
  assert.equal(new Set(verifiedDayPillarPeople.map(person => person.id)).size, 60);
  assert.equal(new Set(verifiedDayPillarPeople.map(person => person.dayPillar)).size, 58);
  assert.equal(secondPeople.length, 38);
  assert.deepEqual(secondPeople.map(person => person.id).sort(), [...newIds].sort());
  const originalCovered = new Set(["甲子", "乙丑", "丙寅", "丁卯", ...firstPeople.map(person => person.dayPillar)]);
  assert.equal(originalCovered.size, 22);
  const newlyCovered = new Set(secondPeople.map(person => person.dayPillar));
  assert.equal(newlyCovered.size, 38);
  assert.deepEqual([...newlyCovered].sort(), dayPillarCycle.filter(pillar => !originalCovered.has(pillar)).sort());
  for (const [id, date, pillar] of expectedAssignments) {
    const person = secondPeople.find(item => item.id === id)!;
    assert.equal(person.birthDate, date, id);
    assert.equal(person.dayPillar, pillar, id);
    assert.deepEqual(calculateDateDayPillar(date), { ok: true, pillar }, id);
    assert.equal(person.calendar, "gregorian", id);
    assert.equal(person.birthTime, null, id);
    assert.ok(person.birthPlace.city.trim() && person.birthPlace.country.trim(), id);
    for (const locale of ["en", "zh"] as const) assert.ok(person.name[locale].trim() && person.field[locale].trim() && person.notes[locale].trim(), `${id}/${locale}`);
    assert.equal(person.sources.length, 1, id);
    for (const source of person.sources) {
      assert.equal(source.publisher, "Nobel Prize", id);
      assert.equal(new URL(source.url).hostname, "www.nobelprize.org", id);
      assert.match(new URL(source.url).pathname, /^\/prizes\/[^/]+\/\d{4}\/[^/]+\/facts\/$/, id);
      assert.equal(source.evidenceType, "short_quote_of_opened_original_page", id);
      assert.equal(source.accessedAt, "2026-10-12", id);
      assert.match(source.evidence, /^Born: /, id);
      assert.ok(source.evidence.trim().split(/\s+/).length <= 25, `${id}: keep the direct birthday quote short`);
    }
  }
  const receipts = secondPeople.map(person => [person.id, person.name.en, person.birthDate, person.dayPillar, person.sources[0].url, person.sources[0].evidence]);
  assert.equal(digest(receipts), baseline.secondBatchReceiptsSha256, "a birthday/name/source/quote differs from the approved source receipt");
});

test("all 75 prior editions and their citations survive after removing only the second-batch additions", () => {
  assert.equal(journalArticles.length, baseline.journalCount);
  assert.deepEqual(journalArticles.map(article => article.slug).sort(), Object.keys(editions).sort());
  const newSourceUrls = new Set(secondPeople.flatMap(person => person.sources.map(source => source.url)));
  for (const article of journalArticles) {
    for (const locale of journalLocales) {
      const copy = article.translations[locale];
      const restored = locale === "en" || locale === "zh" ? beforeSecondBatch(copy) : copy;
      assert.equal(digest(restored), editions[article.slug][locale].translationSha256, `${article.slug}/${locale}: pre-second-batch body changed`);
      const schema = journalArticleSchema(article, locale)[0];
      const previousCitations = schema.citation.filter(url => !newSourceUrls.has(url));
      assert.equal(digest(previousCitations), editions[article.slug][locale].citationSha256, `${article.slug}/${locale}: previous citation order/duplicates changed`);
      const edited = (locale === "en" || locale === "zh") && editedSlugs.includes(article.slug);
      assert.equal(schema.dateModified, edited ? "2026-10-12" : editions[article.slug][locale].dateModified, `${article.slug}/${locale}: wrong edition date`);
      const newPeople = copy.sections.flatMap(section => section.people ?? []).filter(person => newIds.has(person.id));
      assert.equal(newPeople.length, edited ? 1 : 0, `${article.slug}/${locale}: new person outside approved scope`);
    }
  }
});

test("zh/en each show 68 distinct people across all 60 pillars and four-language legacy data brings the total to 70", () => {
  const globalLegacyDates = new Set<string>();
  const structuredDates = new Set(verifiedDayPillarPeople.map(person => person.birthDate));
  assert.equal(structuredDates.size, 60);
  for (const locale of journalLocales) {
    let covered = 0;
    const structuredIds: string[] = [];
    const legacyDates: string[] = [];
    for (const article of journalArticles.filter(item => item.pillar)) {
      const sections = article.translations[locale].sections;
      const people = sections.flatMap(section => section.people ?? []);
      const rows = sections.filter(section => section.id === "famous-birthdays").flatMap(section => section.table?.rows ?? []);
      if (people.length || rows.length) covered++;
      structuredIds.push(...people.map(person => person.id));
      for (const [, date] of rows) {
        legacyDates.push(date);
        globalLegacyDates.add(date);
        assert.equal(structuredDates.has(date), false, `${article.slug}/${locale}: repeated legacy birthday`);
      }
    }
    assert.equal(covered, locale === "en" || locale === "zh" ? 60 : 4, locale);
    assert.equal(structuredIds.length, locale === "en" || locale === "zh" ? 60 : 0, locale);
    assert.equal(new Set(structuredIds).size, structuredIds.length, `${locale}: duplicate structured person`);
    assert.equal(legacyDates.length, 8, locale);
    assert.equal(new Set(legacyDates).size, 8, locale);
    assert.equal(structuredIds.length + legacyDates.length, locale === "en" || locale === "zh" ? 68 : 8, locale);
  }
  assert.equal(globalLegacyDates.size, 10);
  assert.equal(verifiedDayPillarPeople.length + globalLegacyDates.size, 70);
});

test("only 38 zh/en article pairs and their library receive new dates, with every baseline URL/date preserved", () => {
  assert.equal(secondRevisions.baseCommit, baseline.baseCommit);
  assert.equal(secondRevisions.updatedAt, "2026-10-12");
  const slugs = [...editedSlugs, "day-pillars"].sort();
  assert.equal(slugs.length, 39);
  assert.deepEqual(Object.keys(secondRevisions.articles).sort(), slugs);
  const priorDates = new Map(slugs.flatMap(slug => (["en", "zh"] as const).map(locale => [absoluteUrl(journalHref(locale, slug)), slug === "day-pillars" ? "2026-10-11" : editions[slug][locale].dateModified] as const)));
  const entries = sitemap();
  assert.equal(entries.length, 982);
  assert.equal(new Set(entries.map(entry => entry.url)).size, entries.length);
  const changes = entries.filter(entry => priorDates.has(entry.url) && entry.lastModified !== priorDates.get(entry.url));
  assert.equal(changes.length, 78);
  for (const entry of changes) assert.equal(entry.lastModified, "2026-10-12", entry.url);
  const restored = entries.map(entry => [entry.url, priorDates.get(entry.url) ?? entry.lastModified ?? null]).sort(([a], [b]) => String(a).localeCompare(String(b)));
  assert.equal(digest(restored), baseline.sitemapDateHash, "a URL/date outside the exact second-batch scope changed");
});
