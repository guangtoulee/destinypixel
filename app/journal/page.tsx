import JournalTopicTags from "@/components/journal-topic-tags";
import { journalTopicIds, journalTopicHref, journalTopicLabels, journalTopicUi, normalizeJournalTopic } from "@/lib/journal-topics";
import { journalTopicEntries } from "@/lib/journal-topic-catalog";
import { hexagramHref } from "@/lib/hexagram-learning/paths";
import { hexagramCopy } from "@/lib/hexagram-learning/copy";
import { trigramHref } from "@/lib/trigram-learning/paths";
import { trigramCopy } from "@/lib/trigram-learning/copy";
import { tarotLearningHref } from "@/lib/tarot-learning/paths";
import { tarotLearningCopy } from "@/lib/tarot-learning/copy";
import type { Metadata } from "next";
import { ArrowRight, BookOpen } from "lucide-react";
import { JournalFooter, JournalHeader } from "@/components/journal-chrome";
import { journalArticles, journalArticleLocales, journalHref, journalMetadata, normalizeJournalLocale } from "@/lib/journal";
import { absoluteUrl, siteName } from "@/lib/seo";
import { journalUi, journalLanguageTags } from "@/lib/journal-locales";
import styles from "./journal.module.css";
import Image from "next/image";
import { pillarLibraryHref, pillarLibraryCopy } from "@/lib/day-pillar-library";
import { getPillarImagePath } from "@/lib/archetype-assets";
import { tarotEducationCopy, tarotEducationSlugs, tarotEditorialCatalog } from "@/lib/tarot-editorial/navigation";

type PageProps = { searchParams?: Promise<{ locale?: string; topic?: string }> };

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const metadata = journalMetadata(normalizeJournalLocale(params?.locale));
  // Query filters aid discovery; the existing journal remains the canonical index.
  return normalizeJournalTopic(params?.topic, normalizeJournalLocale(params?.locale)) ? { ...metadata, robots: { index: false, follow: true } } : metadata;
}

export default async function JournalPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = normalizeJournalLocale(params?.locale);
  const topic = normalizeJournalTopic(params?.topic, locale);
  const topicUi = journalTopicUi[locale];
  const topicLabels = journalTopicLabels[locale];
  const entries = journalTopicEntries(locale);
  const filteredEntries = topic ? entries.filter(article => article.topics.includes(topic)) : [];
  const counts = Object.fromEntries(journalTopicIds.map(id => [id, entries.filter(article => article.topics.includes(id)).length]));
  const ui = journalUi[locale];
  const library = pillarLibraryCopy(locale);
  const guides = journalArticles.filter(article => !article.pillar && journalArticleLocales(article).includes(locale));
  const education = tarotEducationCopy[locale];
  const editorial = tarotEditorialCatalog(locale);
  const methodGuides = guides.filter(article => article.kind === "education" && !tarotEducationSlugs.some(slug => slug === article.slug));
  const schema = {
    "@context": "https://schema.org", "@type": "CollectionPage", name: `${siteName} · ${ui.journal}`, url: absoluteUrl(journalHref(locale)), inLanguage: journalLanguageTags[locale],
    mainEntity: topic ? { "@type": "ItemList", numberOfItems: filteredEntries.length, itemListElement: filteredEntries.map((article, index) => ({ "@type": "ListItem", position: index + 1, name: article.title, url: absoluteUrl(article.href) })) } : { "@type": "ItemList", numberOfItems: guides.length + 4, itemListElement: [{ "@type": "ListItem", position: 1, name: library.title, url: absoluteUrl(pillarLibraryHref(locale)) }, { "@type":"ListItem",position:2,name:tarotLearningCopy(locale).title,url:absoluteUrl(tarotLearningHref(undefined,locale)!) }, { "@type":"ListItem",position:3,name:hexagramCopy(locale).title,url:absoluteUrl(hexagramHref(undefined,locale)!) }, { "@type":"ListItem",position:4,name:trigramCopy(locale).title,url:absoluteUrl(trigramHref(undefined,locale)) }, ...guides.map((article, index) => ({ "@type": "ListItem", position: index + 5, name: article.translations[locale].title, url: absoluteUrl(journalHref(locale, article.slug)) }))] },
  };
  return (
    <main className={styles.page} lang={journalLanguageTags[locale]} data-server-localized>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <JournalHeader locale={locale} topic={topic} />
      <section className={styles.indexHero}>
        <p className={styles.eyebrow}><BookOpen size={16} aria-hidden="true" />{ui.eyebrow}</p>
        <h1>{ui.heading}</h1>
        <p className={styles.introduction}>{ui.intro}</p>
      </section>
      <section className={styles.topicBrowser} id="topics" aria-labelledby="topic-browser-title">
        <h2 id="topic-browser-title">{topicUi.browse}</h2><p>{topicUi.intro}</p>
        <nav className={styles.topicFilters} aria-label={topicUi.browse} data-topic-filter>
          <a href={journalTopicHref(locale)} aria-current={!topic ? "page" : undefined} data-topic-clear>{topicUi.all}</a>
          {journalTopicIds.filter(id => counts[id] > 0).map(id => <a key={id} href={journalTopicHref(locale, id)} aria-current={topic === id ? "page" : undefined} data-topic={id}>{topicLabels[id]}<small>{counts[id]}</small></a>)}
        </nav>
      </section>
      {topic ? <section className={styles.topicResults} id="topic-results" aria-labelledby="topic-results-title" data-topic-results={topic}>
        <header><h2 id="topic-results-title">{topicUi.results} · {topicLabels[topic]}</h2><p>{topicUi.count(filteredEntries.length)}</p></header>
        <div className={styles.articleGrid}>{filteredEntries.map(article => <article className={styles.articleCard} key={article.slug} data-topic-result={article.slug}>
          <h2><a href={article.href}>{article.title}</a></h2><JournalTopicTags article={article} topics={article.topics} locale={locale}/><p className={styles.cardDescription}>{article.description}</p><a className={styles.libraryTextLink} href={article.href}>{ui.read}<ArrowRight size={16} aria-hidden="true"/></a>
        </article>)}</div>
      </section> : <>
      <section id="tarot-education" className={styles.education} aria-labelledby="tarot-education-title">
        <header><h2 id="tarot-education-title">{education.title}</h2><p>{education.intro}</p></header>
        <div className={styles.educationGrid}>{tarotEducationSlugs.map(slug => <article className={styles.articleCard} key={slug}>
          <p className={styles.eyebrow}>{editorial[slug].topic}</p>
          <h3><a href={journalHref(locale, slug)}>{editorial[slug].title}</a></h3>
          <JournalTopicTags article={{slug}} locale={locale}/><p className={styles.cardDescription}>{editorial[slug].description}</p>
          <a className={styles.libraryTextLink} href={journalHref(locale, slug)}>{ui.read}<ArrowRight size={16} aria-hidden="true" /></a>
        </article>)}{methodGuides.map(article => <article className={styles.articleCard} key={article.slug}>
          <p className={styles.eyebrow}>{article.translations[locale].topic}</p>
          <h3><a href={journalHref(locale, article.slug)}>{article.translations[locale].title}</a></h3>
          <JournalTopicTags article={article} locale={locale}/><p className={styles.cardDescription}>{article.translations[locale].description}</p>
          <a className={styles.libraryTextLink} href={journalHref(locale, article.slug)}>{ui.read}<ArrowRight size={16} aria-hidden="true" /></a>
        </article>)}</div>
        <a className={styles.libraryTextLink} href={tarotLearningHref("sun", locale)}>{education.sun}<ArrowRight size={16} aria-hidden="true" /></a>
      </section>
      <a href={pillarLibraryHref(locale)} className={styles.libraryBanner}><div className={styles.bannerArt}>{["甲子","癸卯","丙午"].map(p => <Image key={p} src={getPillarImagePath(p)} alt="" width={120} height={160} sizes="90px" />)}</div><div><p>{library.count}</p><h2>{library.browse}</h2><ArrowRight size={23} aria-hidden="true" /></div></a>
      <a href={tarotLearningHref(undefined,locale)} className={styles.libraryBanner}><div className={styles.bannerArt}>{["fool","high-priestess","sun"].map(id=><Image key={id} src={`/tarot/rws/${id}.webp`} alt="" width={120} height={206} sizes="90px"/>)}</div><div><p>RWS · 78</p><h2>{tarotLearningCopy(locale).title}</h2><ArrowRight size={23} aria-hidden="true"/></div></a>
      <a href={hexagramHref(undefined,locale)} className={styles.libraryBanner}><div className={styles.bannerArt} aria-hidden="true" style={{fontSize:48}}>䷀ ䷊ ䷿</div><div><p>64</p><h2>{hexagramCopy(locale).title}</h2><ArrowRight size={23} aria-hidden="true"/></div></a>
      <a href={trigramHref(undefined,locale)} className={styles.libraryBanner}><div className={styles.bannerArt} aria-hidden="true" style={{fontSize:48}}>☰ ☵ ☲</div><div><p>8</p><h2>{trigramCopy(locale).title}</h2><ArrowRight size={23} aria-hidden="true"/></div></a>
      <section className={styles.articleGrid} aria-label={ui.list}>
        {guides.filter(article => article.kind !== "education").map((article, index) => {
          const copy = article.translations[locale];
          return <article className={styles.articleCard} key={article.slug}>
            <div className={styles.cardTop}><span>{String(index + 1).padStart(2, "0")}</span><p>{copy.topic}</p></div>
            <h2><a href={journalHref(locale, article.slug)}>{copy.title}</a></h2>
            <JournalTopicTags article={article} locale={locale}/><p className={styles.cardDescription}>{copy.description}</p>
            <div className={styles.cardFooter}><time dateTime={article.publishedAt}>{article.publishedAt}</time><a href={journalHref(locale, article.slug)}>{ui.read}<ArrowRight size={16} aria-hidden="true" /></a></div>
          </article>;
        })}
      </section>
      </>}
      <aside className={styles.editorialNote}>
        <span>{ui.editorial}</span>
        <p>{ui.editorialBody}</p>
      </aside>
      <JournalFooter locale={locale} />
    </main>
  );
}
