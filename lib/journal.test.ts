import { tarotLearningIds } from "@/lib/tarot-learning/paths";
import assert from "node:assert/strict";
import test from "node:test";
import sitemap from "@/app/sitemap";
import { absoluteUrl } from "@/lib/seo";
import { journalArticles, journalHref, journalMetadata, journalArticleSchema, normalizeJournalLocale, journalLocales, journalLanguageTags } from "@/lib/journal";
import { birthFormFeedback } from "@/lib/birth-form-feedback";
import { toTraditional } from "@/lib/journal-locales";
import { calculateDateDayPillar } from "@/lib/day-pillar";

test("published famous birthdays reproduce the featured day pillar in every edition", () => {
  const article = journalArticles.find((item) => item.slug === "jia-zi-day-pillar")!;
  for (const locale of journalLocales) {
    const section = article.translations[locale].sections.find((item) => item.id === "famous-birthdays")!;
    assert.equal(section.table?.rows.length, 2);
    assert.equal(section.sources?.length, 2);
    for (const [, date, result] of section.table!.rows) {
      assert.deepEqual(calculateDateDayPillar(date), { ok: true, pillar: "甲子" });
      assert.match(result, locale === "en" ? /Azure Rat/ : /甲子/);
    }
  }
});

test("Traditional Chinese preserves prose meaning instead of applying software terminology", () => {
  assert.equal(toTraditional("真实例子支持这个观点。香港天文台的资料与读者反馈。"), "真實例子支持這個觀點。香港天文台的資料與讀者回饋。");
});

test("Traditional Chinese preserves every calendar stem and branch without changing aesthetic Chou", () => {
  const stems = "甲乙丙丁戊己庚辛壬癸", branches = "子丑寅卯辰巳午未申酉戌亥";
  for (const character of stems + branches) assert.equal(toTraditional(character), character);
  assert.equal(toTraditional(branches), branches);
  for (let index = 0; index < 60; index++) {
    const pillar = stems[index % 10] + branches[index % 12];
    assert.equal(toTraditional(pillar), pillar);
    const copy = journalArticles.find((article) => article.pillar === pillar)!.translations["zh-TW"];
    assert.ok(copy.title.includes(pillar), pillar);
    const branchRows = copy.sections.flatMap((section) => section.table?.rows ?? []).filter(([label]) => /日支/.test(label) && !/本氣/.test(label));
    // The original Jia Zi essay predates the shared fact-table layout.
    if (pillar !== "甲子") assert.ok(branchRows.length > 0, pillar);
    for (const row of branchRows) assert.ok(row.slice(1).some((value) => value.includes(pillar[1])), `${pillar}: ${row}`);
  }
  assert.equal(toTraditional("地支丑组成，丑的本气属土。但丑还有内部天干。丑 · 牛，丑支、丑土、丑为牛。"), "地支丑組成，丑的本氣屬土。但丑還有內部天干。丑 · 牛，丑支、丑土、丑為牛。");
  assert.equal(toTraditional("不以美丑评人，也不嘲笑丑陋。"), "不以美醜評人，也不嘲笑醜陋。");
});

test("journal advertises all four complete language editions with reciprocal URLs", () => {
  const entries = sitemap().filter((entry) => new URL(entry.url).pathname.startsWith("/journal"));
  assert.equal(entries.length, (journalArticles.length + 2 + 65 + tarotLearningIds.length + 1) * journalLocales.length);
  const urls = new Set(entries.map((entry) => entry.url));
  for (const article of [undefined, ...journalArticles]) {
    for (const locale of journalLocales) {
      const metadata = journalMetadata(locale, article);
      assert.equal(metadata.alternates?.canonical, journalHref(locale, article?.slug));
      assert.ok(urls.has(absoluteUrl(String(metadata.alternates?.canonical))));
      for (const href of Object.values(metadata.alternates?.languages ?? {})) assert.ok(urls.has(absoluteUrl(String(href))));
    }
  }
  assert.equal(normalizeJournalLocale("ru"), "ru");
  assert.equal(normalizeJournalLocale("zh-TW"), "zh-TW");
  assert.equal(normalizeJournalLocale("zh-Hant"), "zh-TW");
  assert.equal(normalizeJournalLocale("zh-Hans"), "zh");
  assert.equal(normalizeJournalLocale("unknown"), "en");
});

test("articles have translated sections, truthful free Article schema and useful original length", () => {
  assert.equal(new Set(journalArticles.map((article) => article.slug)).size, journalArticles.length);
  for (const article of journalArticles) {
    assert.deepEqual(article.translations.en.sections.map((section) => section.id), article.translations.zh.sections.map((section) => section.id));
    for (const locale of journalLocales) {
      const translation = article.translations[locale];
      assert.deepEqual(translation.sections.map((section) => [section.id, section.paragraphs.length, section.steps?.length, section.table?.rows.length]), article.translations.en.sections.map((section) => [section.id, section.paragraphs.length, section.steps?.length, section.table?.rows.length]));
      if (locale === "ru") assert.match(translation.title, /[А-Яа-яЁё]/);
      if (locale === "zh-TW") assert.notEqual(translation.introduction, article.translations.zh.introduction);
      const schema = journalArticleSchema(article, locale)[0];
      assert.equal(schema.inLanguage, journalLanguageTags[locale]);
      assert.equal(schema["@type"], "Article");
      assert.equal(schema.isAccessibleForFree, true);
      assert.equal(schema.author?.["@type"], "Organization");
      assert.equal(schema.datePublished, article.publishedAt);
      assert.equal(schema.dateModified, article.updatedAt);
      assert.ok(article.translations[locale].sections.some((section) => section.sources?.length));
      assert.ok(!/\/(prompt|juben|daoyan|image|english|danci)(?:\?|\/|$)/.test(article.translations[locale].action.href));
    }
    const copy = article.translations.en;
    const body = [copy.introduction, copy.takeaway, ...copy.sections.flatMap((section) => [section.title, ...section.paragraphs, ...(section.steps ?? []), ...(section.table ? [...section.table.headings, ...section.table.rows.flat()] : [])])].join(" ");
    const words = body.trim().split(/\s+/).length;
    assert.ok(words >= (article.kind === "portrait" ? 280 : 600), `${article.slug}: ${words} words`);
  }
});

test("birth form feedback renders only known localized errors", () => {
  assert.match(birthFormFeedback("ambiguous-local-time", "en") ?? "", /twice/);
  assert.match(birthFormFeedback("unsupported-year", "zh") ?? "", /1800.*2100/);
  assert.match(birthFormFeedback("report-storage-unavailable", "zh") ?? "", /无法安全保存/);
  assert.match(birthFormFeedback("rate-limited", "en") ?? "", /wait/);
  assert.equal(birthFormFeedback("unknown-query-string", "en"), undefined);
  assert.equal(birthFormFeedback("__proto__", "en"), undefined);
});


test("English identifies the searchable calendar pair and current animal card", () => {
  const copy = journalArticles.find(item => item.slug === "jia-zi-day-pillar")!.translations.en;
  assert.match(copy.title, /^Jia Zi Day Pillar \(甲子\): The Azure Rat/);

  const names = copy.sections.find(s => s.id === "famous-birthdays")!.table!.rows.map(row => row[0]);
  assert.deepEqual(names, ["Olivia Rodrigo", "Henry Dunant · Red Cross founder"]);
});
