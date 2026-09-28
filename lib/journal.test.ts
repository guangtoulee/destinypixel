import assert from "node:assert/strict";
import test from "node:test";
import sitemap from "@/app/sitemap";
import { absoluteUrl } from "@/lib/seo";
import { journalArticles, journalHref, journalMetadata, journalArticleSchema, journalArticleIndexable, getJournalArticle, normalizeJournalLocale, journalLocales, journalLanguageTags } from "@/lib/journal";
import { dayPillarCycle, pillarArticleSlug } from "@/lib/day-pillar-library";
import { birthFormFeedback } from "@/lib/birth-form-feedback";
import { toTraditional } from "@/lib/journal-locales";
import { calculateDateDayPillar } from "@/lib/day-pillar";

test("incomplete day-pillar portraits are noindex,follow and absent from the sitemap", () => {
  const entries = sitemap();
  const urls = new Set(entries.map((entry) => entry.url));
  const portraits = journalArticles.filter((article) => article.pillar);
  assert.equal(portraits.length, dayPillarCycle.length);
  for (const pillar of ["甲子", "乙丑", "丙寅"]) {
    const article = portraits.find((item) => item.pillar === pillar);
    assert.ok(article, pillar);
    assert.equal(article.portraitDepth, "full");
    assert.equal(article.slug, pillarArticleSlug(pillar));
    assert.equal(journalArticleIndexable(article), true);
  }
  const excluded = new Set<string>();
  for (const article of portraits) {
    const indexable = journalArticleIndexable(article);
    assert.equal(indexable, article.portraitDepth === "full", article.slug);
    for (const locale of journalLocales) {
      const metadata = journalMetadata(locale, article);
      const url = absoluteUrl(journalHref(locale, article.slug));
      assert.equal(metadata.alternates?.canonical, journalHref(locale, article.slug));
      const robots = metadata.robots;
      assert.ok(robots && typeof robots !== "string");
      const languages = metadata.alternates?.languages ?? {};
      assert.equal(languages["x-default"], journalHref("en", article.slug));
      for (const edition of journalLocales) assert.equal(languages[journalLanguageTags[edition]], journalHref(edition, article.slug));
      if (indexable) {
        assert.equal(robots.index, true);
        assert.equal(robots.follow, true);
        assert.equal(urls.has(url), true, article.slug);
        for (const href of Object.values(languages)) {
          assert.equal(urls.has(absoluteUrl(String(href))), true, String(href));
          const target = getJournalArticle(new URL(String(href), "https://www.destinypixel.com").pathname.split("/")[2] ?? "");
          assert.equal(journalArticleIndexable(target), true, String(href));
        }
      } else {
        assert.equal(robots.index, false);
        assert.equal(robots.follow, true);
        const googleBot = robots.googleBot;
        assert.ok(googleBot && typeof googleBot !== "string");
        assert.equal(googleBot.index, false);
        assert.equal(googleBot.follow, true);
        assert.equal(urls.has(url), false, article.slug);
        excluded.add(url);
        for (const href of Object.values(languages)) assert.equal(urls.has(absoluteUrl(String(href))), false, String(href));
      }
    }
  }
  for (const entry of entries) {
    assert.equal(excluded.has(entry.url), false, entry.url);
    for (const href of Object.values(entry.alternates?.languages ?? {})) assert.equal(excluded.has(String(href)), false, String(href));
  }
  assert.equal(journalArticleIndexable({ pillar: "丁卯", portraitDepth: "full" }), true);
  assert.equal(journalArticleIndexable({ pillar: "丁卯" }), false);
  assert.equal(journalArticleIndexable(undefined), true);
});

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

test("journal advertises all four complete language editions with reciprocal URLs", () => {
  const entries = sitemap().filter((entry) => new URL(entry.url).pathname.startsWith("/journal"));
  const indexable = journalArticles.filter((article) => journalArticleIndexable(article));
  assert.equal(entries.length, (indexable.length + 2) * journalLocales.length);
  const urls = new Set(entries.map((entry) => entry.url));
  for (const article of [undefined, ...journalArticles]) {
    for (const locale of journalLocales) {
      const metadata = journalMetadata(locale, article);
      assert.equal(metadata.alternates?.canonical, journalHref(locale, article?.slug));
      const listed = urls.has(absoluteUrl(String(metadata.alternates?.canonical)));
      if (journalArticleIndexable(article)) {
        assert.equal(listed, true);
        for (const href of Object.values(metadata.alternates?.languages ?? {})) assert.ok(urls.has(absoluteUrl(String(href))));
      } else {
        assert.equal(listed, false);
      }
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
