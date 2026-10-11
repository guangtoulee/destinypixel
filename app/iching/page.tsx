import { ArrowUpRight } from "lucide-react";
import { IChingWorkbench } from "@/components/iching-workbench";
import { JournalFooter } from "@/components/journal-chrome";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { journalHomeHref, journalLanguageLabels, journalLanguageTags, journalLocales, journalUi } from "@/lib/journal-locales";
import { journalHref } from "@/lib/journal";
import { hexagramCatalog } from "@/lib/hexagram-learning/metadata";
import { hexagramHref } from "@/lib/hexagram-learning/paths";
import { ichingCopy, ichingBranches, ichingTrigrams } from "@/lib/iching/copy";
import { ichingHref, trigramLibraryHref } from "@/lib/iching/paths";
import { ichingMetadata } from "@/lib/iching/metadata";
import { absoluteUrl } from "@/lib/seo";
import chrome from "@/app/journal/journal.module.css";
import styles from "@/components/iching-workbench.module.css";

type Props = { searchParams?: Promise<{ locale?: string }> };
export async function generateMetadata({ searchParams }: Props) { return ichingMetadata(normalizeReportLocale((await searchParams)?.locale ?? "en")); }

export default async function IChingPage({ searchParams }: Props) {
  const locale = normalizeReportLocale((await searchParams)?.locale ?? "en"), c = ichingCopy(locale), ui = journalUi[locale];
  const schema = { "@context": "https://schema.org", "@type": "WebApplication", name: c.title, description: c.description, url: absoluteUrl(ichingHref(locale)), applicationCategory: "EducationalApplication", operatingSystem: "Web", inLanguage: journalLanguageTags[locale], isAccessibleForFree: true };
  return <main className={styles.page} lang={journalLanguageTags[locale]} data-server-localized>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <header className={chrome.header}>
      <a className={chrome.brand} href={journalHomeHref(locale)}><span aria-hidden="true" />DestinyPixel</a>
      <nav className={chrome.navigation} aria-label={ui.mainNav}><a href={ichingHref(locale)} aria-current="page">{c.title}</a><a href={journalHref(locale)}>{ui.journal}</a></nav>
      <nav className={chrome.languages} aria-label={ui.language}>{journalLocales.map(l => <a key={l} href={ichingHref(l)} hrefLang={journalLanguageTags[l]} lang={journalLanguageTags[l]} aria-current={locale === l ? "page" : undefined}>{journalLanguageLabels[l]}</a>)}</nav>
    </header>
    <header className={styles.hero}>
      <div><p className={styles.eyebrow}>{c.eyebrow}</p><h1>{c.heading}</h1><p className={styles.intro}>{c.intro}</p><div className={styles.heroLinks}><a href={trigramLibraryHref(locale)}>{c.trigrams} <ArrowUpRight size={13} aria-hidden="true" /></a><a href={hexagramHref(undefined, locale)}>{c.hexagrams} <ArrowUpRight size={13} aria-hidden="true" /></a></div></div>
      <div className={styles.heroArt} aria-hidden="true"><div className={styles.orbit} /><div className={styles.heroHexagram}>{[1,0,1,0,1,0].map((yang, i) => <span key={i} data-yang={yang === 1}><i /><i /></span>)}</div><span className={styles.artNumber}>01 — 64</span><span className={styles.artSymbol}>䷿</span></div>
    </header>
    <IChingWorkbench locale={locale} copy={c} catalog={hexagramCatalog(locale).map(({ kingWenNumber, displayName, plainSummary }) => ({ kingWenNumber, displayName, plainSummary }))} branches={ichingBranches(locale)} trigrams={ichingTrigrams[locale]} />
    <section className={styles.learning} aria-labelledby="iching-learning"><div><p className={styles.eyebrow}>☰ ☱ ☲ ☳ ☴ ☵ ☶ ☷</p><h2 id="iching-learning">{c.learning}</h2><p>{c.learningIntro}</p></div><div><a href={trigramLibraryHref(locale)}><span>08</span>{c.trigrams}<ArrowUpRight size={17} aria-hidden="true" /></a><a href={hexagramHref(undefined, locale)}><span>64</span>{c.hexagrams}<ArrowUpRight size={17} aria-hidden="true" /></a></div></section>
    <section className={styles.scope}><h2>{c.scopeTitle}</h2><p>{c.scope}</p><p>{c.note}</p><details><summary>{c.yarrowTitle}</summary><p>{c.yarrowBody}</p><a href="https://zh.wikisource.org/wiki/易傳/繫辭上" target="_blank" rel="noopener noreferrer">{c.yarrowSource} <ArrowUpRight size={13} aria-hidden="true" /></a></details><details><summary>{c.sources}</summary><a href="https://people.willamette.edu/~rloftus/Asia%20201/AS%20201%203CoinCasting.pdf" target="_blank" rel="noopener noreferrer">{c.coinsSource} <ArrowUpRight size={13} aria-hidden="true" /></a><a href="https://zh.wikisource.org/wiki/梅花易數/卷一" target="_blank" rel="noopener noreferrer">{c.meihuaSource} <ArrowUpRight size={13} aria-hidden="true" /></a><a href="https://www.hko.gov.hk/tc/gts/time/stemsandbranches.htm" target="_blank" rel="noopener noreferrer">{c.calendarSource} <ArrowUpRight size={13} aria-hidden="true" /></a><a href="https://zh.wikisource.org/zh/增刪卜易" target="_blank" rel="noopener noreferrer">{c.liuyaoSource} <ArrowUpRight size={13} aria-hidden="true" /></a></details></section>
    <JournalFooter locale={locale} />
  </main>;
}
