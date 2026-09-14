import type { Metadata } from "next";
import { ArrowRight, BookOpen } from "lucide-react";
import { JournalFooter, JournalHeader } from "@/components/journal-chrome";
import { journalArticles, journalHref, journalMetadata, normalizeJournalLocale } from "@/lib/journal";
import { absoluteUrl, siteName } from "@/lib/seo";
import { journalUi, journalLanguageTags } from "@/lib/journal-locales";
import styles from "./journal.module.css";

type PageProps = { searchParams?: Promise<{ locale?: string }> };

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return journalMetadata(normalizeJournalLocale((await searchParams)?.locale));
}

export default async function JournalPage({ searchParams }: PageProps) {
  const locale = normalizeJournalLocale((await searchParams)?.locale);
  const ui = journalUi[locale];
  const schema = {
    "@context": "https://schema.org", "@type": "CollectionPage", name: `${siteName} · ${ui.journal}`, url: absoluteUrl(journalHref(locale)), inLanguage: journalLanguageTags[locale],
    mainEntity: { "@type": "ItemList", numberOfItems: journalArticles.length, itemListElement: journalArticles.map((article, index) => ({ "@type": "ListItem", position: index + 1, name: article.translations[locale].title, url: absoluteUrl(journalHref(locale, article.slug)) })) },
  };
  return (
    <main className={styles.page} lang={journalLanguageTags[locale]} data-server-localized>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <JournalHeader locale={locale} />
      <section className={styles.indexHero}>
        <p className={styles.eyebrow}><BookOpen size={16} aria-hidden="true" />{ui.eyebrow}</p>
        <h1>{ui.heading}</h1>
        <p className={styles.introduction}>{ui.intro}</p>
      </section>
      <section className={styles.articleGrid} aria-label={ui.list}>
        {journalArticles.map((article, index) => {
          const copy = article.translations[locale];
          return <article className={styles.articleCard} key={article.slug}>
            <div className={styles.cardTop}><span>{String(index + 1).padStart(2, "0")}</span><p>{copy.topic}</p></div>
            <h2><a href={journalHref(locale, article.slug)}>{copy.title}</a></h2>
            <p className={styles.cardDescription}>{copy.description}</p>
            <div className={styles.cardFooter}><time dateTime={article.publishedAt}>{article.publishedAt}</time><a href={journalHref(locale, article.slug)}>{ui.read}<ArrowRight size={16} aria-hidden="true" /></a></div>
          </article>;
        })}
      </section>
      <aside className={styles.editorialNote}>
        <span>{ui.editorial}</span>
        <p>{ui.editorialBody}</p>
      </aside>
      <JournalFooter locale={locale} />
    </main>
  );
}
