import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { IChingWorkbench } from "@/components/iching-workbench";
import { JournalFooter } from "@/components/journal-chrome";
import { normalizeReportLocale, type ReportLocale } from "@/lib/report-i18n";
import {
  journalHomeHref,
  journalLanguageLabels,
  journalLanguageTags,
  journalLocales,
  journalUi,
} from "@/lib/journal-locales";
import { journalHref } from "@/lib/journal";
import { hexagramCatalog } from "@/lib/hexagram-learning/metadata";
import { hexagramHref } from "@/lib/hexagram-learning/paths";
import { ichingCopy, ichingBranches, ichingTrigrams } from "@/lib/iching/copy";
import { ichingHref, trigramLibraryHref } from "@/lib/iching/paths";
import { ichingMetadata } from "@/lib/iching/metadata";
import { absoluteUrl } from "@/lib/seo";
import pageStyles from "./iching.module.css";

type Props = { searchParams?: Promise<{ locale?: string; cast?: string }> };

const compactLocaleLabels: Record<ReportLocale, string> = {
  en: "EN",
  zh: "简体",
  "zh-TW": "繁體",
  ru: "RU",
};

function realmUrl(path: string, locale: ReportLocale) {
  return locale === "en" ? path : `${path}?locale=${locale}`;
}

const crossSiteRealms: Array<{
  key: string;
  href: (locale: ReportLocale) => string;
  labels: Record<ReportLocale, string>;
}> = [
  {
    key: "discover",
    href: (locale) => realmUrl("/discover", locale),
    labels: { en: "Day Pillars", zh: "六十日柱", "zh-TW": "六十日柱", ru: "Столпы дня" },
  },
  {
    key: "tarot",
    href: (locale) => realmUrl("/tarot", locale),
    labels: { en: "Tarot", zh: "山湖塔罗", "zh-TW": "山湖塔羅", ru: "Таро" },
  },
  {
    key: "sticks",
    href: (locale) => realmUrl("/sticks", locale),
    labels: { en: "Fortune Sticks", zh: "灵签问事", "zh-TW": "靈籤問事", ru: "Жребии" },
  },
  {
    key: "astrology",
    href: (locale) => realmUrl("/astrology", locale),
    labels: { en: "Birth Chart", zh: "本命星盘", "zh-TW": "本命星盤", ru: "Астрология" },
  },
  {
    key: "iching",
    href: (locale) => ichingHref(locale),
    labels: { en: "I Ching", zh: "易经六爻", "zh-TW": "易經六爻", ru: "И цзин" },
  },
  {
    key: "compatibility",
    href: (locale) => realmUrl("/compatibility", locale),
    labels: { en: "Compatibility", zh: "关系合盘", "zh-TW": "關係合盤", ru: "Совместимость" },
  },
  {
    key: "journal",
    href: (locale) => journalHref(locale),
    labels: { en: "Journal", zh: "专栏", "zh-TW": "專欄", ru: "Журнал" },
  },
];

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = normalizeReportLocale((await searchParams)?.locale ?? "en");
  const meta = ichingMetadata(locale);
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      images: ["/opengraph-image"],
    },
    twitter: {
      ...meta.twitter,
      card: "summary_large_image",
      images: ["/opengraph-image"],
    },
  };
}

export default async function IChingPage({ searchParams }: Props) {
  const locale = normalizeReportLocale((await searchParams)?.locale ?? "en");
  const c = ichingCopy(locale);
  const ui = journalUi[locale];
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: c.title,
    description: c.description,
    url: absoluteUrl(ichingHref(locale)),
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    inLanguage: journalLanguageTags[locale],
    isAccessibleForFree: true,
  };

  return (
    <main className={pageStyles.page} lang={journalLanguageTags[locale]} data-server-localized>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />

      <header className={pageStyles.header}>
        <div className={pageStyles.headerTop}>
          <a className={pageStyles.brand} href={journalHomeHref(locale)}>
            <span aria-hidden="true" />
            DestinyPixel
          </a>
          <nav className={pageStyles.languages} aria-label={ui.language}>
            {journalLocales.map((l) => (
              <a
                key={l}
                href={ichingHref(l)}
                hrefLang={journalLanguageTags[l]}
                lang={journalLanguageTags[l]}
                title={journalLanguageLabels[l]}
                aria-label={journalLanguageLabels[l]}
                aria-current={locale === l ? "page" : undefined}
              >
                {compactLocaleLabels[l]}
              </a>
            ))}
          </nav>
        </div>

        <nav className={pageStyles.realmNav} aria-label={ui.mainNav}>
          {crossSiteRealms.map((realm) => (
            <a
              key={realm.key}
              href={realm.href(locale)}
              className={pageStyles.realmLink}
              aria-current={realm.key === "iching" ? "page" : undefined}
            >
              {realm.labels[locale]}
            </a>
          ))}
        </nav>
      </header>

      <header className={pageStyles.hero}>
        <div>
          <p className={pageStyles.eyebrow}>{c.eyebrow}</p>
          <h1>{c.heading}</h1>
          <p className={pageStyles.intro}>{c.intro}</p>
          <div className={pageStyles.heroLinks}>
            <a href={trigramLibraryHref(locale)}>
              {c.trigrams} <ArrowUpRight size={13} aria-hidden="true" />
            </a>
            <a href={hexagramHref(undefined, locale)}>
              {c.hexagrams} <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className={pageStyles.heroArt} aria-hidden="true">
          <div className={pageStyles.orbit} />
          <div className={pageStyles.heroHexagram}>
            {[1, 0, 1, 0, 1, 0].map((yang, i) => (
              <span key={i} data-yang={yang === 1}>
                <i />
                <i />
              </span>
            ))}
          </div>
          <span className={pageStyles.artNumber}>01 — 64</span>
          <span className={pageStyles.artSymbol}>䷿</span>
        </div>
      </header>

      <IChingWorkbench
        locale={locale}
        copy={c}
        catalog={hexagramCatalog(locale).map(({ kingWenNumber, displayName, plainSummary }) => ({
          kingWenNumber,
          displayName,
          plainSummary,
        }))}
        branches={ichingBranches(locale)}
        trigrams={ichingTrigrams[locale]}
      />

      <section className={pageStyles.learning} aria-labelledby="iching-learning">
        <div>
          <p className={pageStyles.eyebrow}>☰ ☱ ☲ ☳ ☴ ☵ ☶ ☷</p>
          <h2 id="iching-learning">{c.learning}</h2>
          <p>{c.learningIntro}</p>
        </div>
        <div className={pageStyles.learningCards}>
          <a href={trigramLibraryHref(locale)}>
            <span>08</span>
            {c.trigrams}
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <a href={hexagramHref(undefined, locale)}>
            <span>64</span>
            {c.hexagrams}
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className={pageStyles.scope}>
        <h2>{c.scopeTitle}</h2>
        <p>{c.scope}</p>
        <p>{c.note}</p>
        <details>
          <summary>{c.yarrowTitle}</summary>
          <p>{c.yarrowBody}</p>
          <a
            href="https://zh.wikisource.org/wiki/易傳/繫辭上"
            target="_blank"
            rel="noopener noreferrer"
          >
            {c.yarrowSource} <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </details>
        <details>
          <summary>{c.sources}</summary>
          <a
            href="https://people.willamette.edu/~rloftus/Asia%20201/AS%20201%203CoinCasting.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            {c.coinsSource} <ArrowUpRight size={13} aria-hidden="true" />
          </a>
          <a
            href="https://zh.wikisource.org/wiki/梅花易數/卷一"
            target="_blank"
            rel="noopener noreferrer"
          >
            {c.meihuaSource} <ArrowUpRight size={13} aria-hidden="true" />
          </a>
          <a
            href="https://www.hko.gov.hk/tc/gts/time/stemsandbranches.htm"
            target="_blank"
            rel="noopener noreferrer"
          >
            {c.calendarSource} <ArrowUpRight size={13} aria-hidden="true" />
          </a>
          <a
            href="https://zh.wikisource.org/zh/增刪卜易"
            target="_blank"
            rel="noopener noreferrer"
          >
            {c.liuyaoSource} <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </details>
      </section>

      <JournalFooter locale={locale} />
    </main>
  );
}
