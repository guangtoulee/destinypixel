import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { JournalHeader, JournalFooter } from "@/components/journal-chrome";
import { normalizeJournalLocale, dayPillarLibraryMetadata, journalArticles } from "@/lib/journal";
import { journalLanguageTags } from "@/lib/journal-locales";
import { dayPillarCycle, pillarArticleHref, pillarFacts, pillarName, pillarLibraryCopy, pillarLibraryHref, pillarEditionLabel, stems } from "@/lib/day-pillar-library";
import { getPillarImagePath } from "@/lib/archetype-assets";
import { getLocalizedDayPillarInsight } from "@/lib/day-pillar-insights-localized";
import { absoluteUrl } from "@/lib/seo";
import styles from "../journal.module.css";

type Props = { searchParams?: Promise<{ locale?: string }> };
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return dayPillarLibraryMetadata(normalizeJournalLocale((await searchParams)?.locale));
}

export default async function DayPillarLibrary({ searchParams }: Props) {
  const locale = normalizeJournalLocale((await searchParams)?.locale), copy = pillarLibraryCopy(locale);
  const schema = { "@context": "https://schema.org", "@type": "CollectionPage", name: copy.title, description: copy.description, url: absoluteUrl(pillarLibraryHref(locale)), inLanguage: journalLanguageTags[locale], mainEntity: { "@type": "ItemList", numberOfItems: 60, itemListElement: dayPillarCycle.map((pillar, i) => ({ "@type": "ListItem", position: i + 1, name: `${pillarFacts(pillar, locale).pinyin} · ${pillar} · ${pillarName(pillar, locale)}`, url: absoluteUrl(pillarArticleHref(pillar, locale)) })) } };
  return <main className={styles.page} lang={journalLanguageTags[locale]} data-server-localized>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <JournalHeader locale={locale} slug="day-pillars" />
    <section className={`${styles.indexHero} ${styles.libraryHero}`}>
      <div><p className={styles.eyebrow}>{copy.collection}</p><h1>{copy.heading}</h1><p className={styles.introduction}>{copy.intro}</p><a className={styles.libraryCta} href={`/discover${locale === "en" ? "" : `?locale=${locale}`}`}>{copy.calculate}<ArrowRight size={17} aria-hidden="true" /></a><p className={styles.libraryCount}>{copy.count}</p></div>
      <div className={styles.libraryFan} aria-hidden="true">{["甲子", "癸卯", "丙午"].map((pillar, i) => <Image key={pillar} src={getPillarImagePath(pillar)} alt="" width={480} height={640} sizes="(max-width: 650px) 34vw, 190px" priority={i === 1} />)}</div>
    </section>
    <nav className={styles.pillarJump} aria-label={copy.group}>{dayPillarCycle.map(pillar => <a key={pillar} href={pillarArticleHref(pillar, locale)} title={`${pillarFacts(pillar, locale).pinyin} · ${pillarName(pillar, locale)}`}><span>{pillar}</span>{(locale === "en" || locale === "ru") && <small>{pillarFacts(pillar, locale).pinyin}</small>}</a>)}</nav>
    <div className={styles.pillarLibrary}>
      {[...stems].map(stem => { const family = dayPillarCycle.filter(p => p[0] === stem); return <section key={stem} className={styles.pillarFamily}>
        <header><span>{stem}</span><h2>{pillarFacts(family[0], locale).master}</h2><p>{copy.same}</p></header>
        <div className={styles.pillarGrid}>{family.map(pillar => { const facts = pillarFacts(pillar, locale), name = pillarName(pillar, locale); return <article className={styles.pillarTile} key={pillar}>
          <a href={pillarArticleHref(pillar, locale)} className={styles.pillarTileArt} tabIndex={-1} aria-hidden="true"><Image src={getPillarImagePath(pillar)} alt="" width={480} height={640} sizes="(max-width:650px) 43vw, (max-width:1000px) 29vw, 250px" /></a>
          <div className={styles.pillarTileCopy}><span className={styles.portraitEdition}>{pillarEditionLabel(locale, journalArticles.some(a => a.pillar === pillar && a.portraitDepth === "full"))}</span><p className={styles.pillarCode}>{String(facts.number).padStart(2,"0")} · {pillar} · {locale === "ru" ? facts.russian : facts.pinyin}</p><h3><a href={pillarArticleHref(pillar, locale)}>{name}</a></h3><p>{getLocalizedDayPillarInsight(pillar, locale)?.headline}</p><a className={styles.pillarRead} href={pillarArticleHref(pillar, locale)} aria-label={`${copy.read}: ${pillar} · ${name}`}>{copy.read}<ArrowRight size={14} aria-hidden="true" /></a></div>
        </article>; })}</div>
      </section>; })}
    </div>
    <aside className={styles.editorialNote}><p>{copy.note}</p></aside>
    <JournalFooter locale={locale} />
  </main>;
}
