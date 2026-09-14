import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { JournalFooter, JournalHeader } from "@/components/journal-chrome";
import { getJournalArticle, journalArticles, journalArticleSchema, journalHref, journalMetadata, normalizeJournalLocale } from "@/lib/journal";
import { journalUi, journalLanguageTags, journalHomeHref } from "@/lib/journal-locales";
import styles from "../journal.module.css";

type PageProps = { params: Promise<{ slug: string }>; searchParams?: Promise<{ locale?: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return journalArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const article = getJournalArticle((await params).slug);
  if (!article) return { robots: { index: false, follow: false } };
  return journalMetadata(normalizeJournalLocale((await searchParams)?.locale), article);
}

export default async function JournalArticlePage({ params, searchParams }: PageProps) {
  const article = getJournalArticle((await params).slug);
  if (!article) notFound();
  const locale = normalizeJournalLocale((await searchParams)?.locale);
  const ui = journalUi[locale];
  const copy = article.translations[locale];
  const related = journalArticles.find((candidate) => candidate.slug !== article.slug);
  return (
    <main className={styles.page} lang={journalLanguageTags[locale]} data-server-localized>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(journalArticleSchema(article, locale)).replace(/</g, "\\u003c") }} />
      <JournalHeader locale={locale} slug={article.slug} />
      <article>
        <header className={styles.articleHero}>
          <nav className={styles.breadcrumb} aria-label={ui.breadcrumb}><a href={journalHomeHref(locale)}>{ui.home}</a><span aria-hidden="true">/</span><a href={journalHref(locale)}>{ui.journal}</a><span aria-hidden="true">/</span><span>{copy.topic}</span></nav>
          <p className={styles.eyebrow}>{copy.topic}</p>
          <h1>{copy.title}</h1>
          <p className={styles.introduction}>{copy.introduction}</p>
          <div className={styles.byline}><span>DestinyPixel</span><span aria-hidden="true">·</span><span>{ui.published} <time dateTime={article.publishedAt}>{article.publishedAt}</time></span>{article.updatedAt !== article.publishedAt && <span>{ui.updated} <time dateTime={article.updatedAt}>{article.updatedAt}</time></span>}</div>
        </header>
        <div className={styles.readingLayout}>
          <aside className={styles.contents}><p>{ui.contents}</p><nav aria-label={ui.sections}>{copy.sections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}</nav></aside>
          <div className={styles.articleBody}>
            <div className={styles.takeaway}><span>{ui.takeaway}</span><p>{copy.takeaway}</p></div>
            {copy.sections.map((section) => <section className={styles.section} id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              {section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              {section.steps && <ol>{section.steps.map((step, index) => <li key={index}>{step}</li>)}</ol>}
              {section.table && <div className={styles.tableWrap} role="region" aria-label={section.title} tabIndex={0}><table><thead><tr>{section.table.headings.map((heading) => <th key={heading} scope="col">{heading}</th>)}</tr></thead><tbody>{section.table.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th scope="row" key={cellIndex}>{cell}</th> : <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>}
              {section.sources && <div className={styles.sources}><span>{ui.sources}</span>{section.sources.map((source) => <a key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.label}<ArrowUpRight size={14} aria-hidden="true" /></a>)}</div>}
            </section>)}
            <div className={styles.articleAction}><p>{ui.try}</p><a href={copy.action.href}>{copy.action.label}<ArrowRight size={17} aria-hidden="true" /></a></div>
            {related && <aside className={styles.related}><span>{ui.related}</span><a href={journalHref(locale, related.slug)}>{related.translations[locale].title}<ArrowRight size={18} aria-hidden="true" /></a></aside>}
          </div>
        </div>
      </article>
      <JournalFooter locale={locale} />
    </main>
  );
}
