import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { JournalFooter, JournalHeader } from "@/components/journal-chrome";
import { getJournalArticle, journalArticles, journalArticleSchema, journalHref, journalMetadata, normalizeJournalLocale } from "@/lib/journal";
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
  const zh = locale === "zh";
  const copy = article.translations[locale];
  const related = journalArticles.find((candidate) => candidate.slug !== article.slug);
  return (
    <main className={styles.page} lang={zh ? "zh-Hans" : "en"}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(journalArticleSchema(article, locale)).replace(/</g, "\\u003c") }} />
      <JournalHeader locale={locale} slug={article.slug} />
      <article>
        <header className={styles.articleHero}>
          <nav className={styles.breadcrumb} aria-label={zh ? "面包屑导航" : "Breadcrumb"}><Link href={zh ? "/?locale=zh" : "/"}>{zh ? "首页" : "Home"}</Link><span aria-hidden="true">/</span><Link href={journalHref(locale)}>{zh ? "文章" : "Journal"}</Link><span aria-hidden="true">/</span><span>{copy.topic}</span></nav>
          <p className={styles.eyebrow}>{copy.topic}</p>
          <h1>{copy.title}</h1>
          <p className={styles.introduction}>{copy.introduction}</p>
          <div className={styles.byline}><span>DestinyPixel</span><span aria-hidden="true">·</span><span>{zh ? "发布于" : "Published"} <time dateTime={article.publishedAt}>{article.publishedAt}</time></span>{article.updatedAt !== article.publishedAt && <span>{zh ? "更新于" : "Updated"} <time dateTime={article.updatedAt}>{article.updatedAt}</time></span>}</div>
        </header>
        <div className={styles.readingLayout}>
          <aside className={styles.contents}><p>{zh ? "文章目录" : "IN THIS GUIDE"}</p><nav aria-label={zh ? "文章章节" : "Article sections"}>{copy.sections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}</nav></aside>
          <div className={styles.articleBody}>
            <div className={styles.takeaway}><span>{zh ? "先记住这一点" : "START HERE"}</span><p>{copy.takeaway}</p></div>
            {copy.sections.map((section) => <section className={styles.section} id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              {section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              {section.steps && <ol>{section.steps.map((step, index) => <li key={index}>{step}</li>)}</ol>}
              {section.table && <div className={styles.tableWrap} role="region" aria-label={section.title} tabIndex={0}><table><thead><tr>{section.table.headings.map((heading) => <th key={heading} scope="col">{heading}</th>)}</tr></thead><tbody>{section.table.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th scope="row" key={cellIndex}>{cell}</th> : <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>}
              {section.sources && <div className={styles.sources}><span>{zh ? "相关原始来源" : "PRIMARY SOURCES"}</span>{section.sources.map((source) => <a key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.label}<ArrowUpRight size={14} aria-hidden="true" /></a>)}</div>}
            </section>)}
            <div className={styles.articleAction}><p>{zh ? "带着清楚的预期，动手试一次。" : "Try it with a clear idea of what to expect."}</p><Link href={copy.action.href}>{copy.action.label}<ArrowRight size={17} aria-hidden="true" /></Link></div>
            {related && <aside className={styles.related}><span>{zh ? "继续阅读" : "CONTINUE READING"}</span><Link href={journalHref(locale, related.slug)}>{related.translations[locale].title}<ArrowRight size={18} aria-hidden="true" /></Link></aside>}
          </div>
        </div>
      </article>
      <JournalFooter locale={locale} />
    </main>
  );
}
