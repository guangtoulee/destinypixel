import { notFound } from "next/navigation";
import { JournalHeader, JournalFooter } from "@/components/journal-chrome";
import { getTrigramArticle } from "@/lib/trigram-learning/content";
import { trigramCopy } from "@/lib/trigram-learning/copy";
import { trigramIdentities, trigramSlug, type TrigramId } from "@/lib/trigram-learning/identity";
import { TrigramDiagram } from "@/lib/trigram-learning/diagram";
import { trigramHref, trigramToolHref } from "@/lib/trigram-learning/paths";
import { trigramUpdatedAt } from "@/lib/trigram-learning/metadata";
import { hexagramCatalog } from "@/lib/hexagram-learning/metadata";
import { hexagramHref } from "@/lib/hexagram-learning/paths";
import { journalLanguageTags } from "@/lib/journal-locales";
import { absoluteUrl, siteName } from "@/lib/seo";
import type { ReportLocale } from "@/lib/report-i18n";
import styles from "@/app/journal/journal.module.css";
import learn from "@/app/journal/trigram-learning.module.css";
const sourceUrl = "https://zh.wikisource.org/w/index.php?title=易傳/說卦&oldid=2614055";
export default function TrigramLearningArticle({ id, locale }: { id: TrigramId; locale: ReportLocale }) {
  const a = getTrigramArticle(id, locale); if (!a) notFound();
  const c = trigramCopy(locale), identity = trigramIdentities[id], hexagrams = hexagramCatalog(locale), url = absoluteUrl(trigramHref(id, locale));
  const schema = [{ "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.summary, url, mainEntityOfPage: url, inLanguage: journalLanguageTags[locale], datePublished: trigramUpdatedAt, dateModified: trigramUpdatedAt, isAccessibleForFree: true, author: { "@type": "Organization", name: siteName, url: absoluteUrl("/") }, publisher: { "@type": "Organization", name: siteName }, citation: [sourceUrl] }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: c.title, item: absoluteUrl(trigramHref(undefined, locale)) }, { "@type": "ListItem", position: 2, name: c.names[id], item: url }] }];
  return <main className={styles.page} lang={journalLanguageTags[locale]} data-server-localized>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <JournalHeader locale={locale} slug={trigramSlug(id)} />
    <article data-trigram-learning={id}>
      <header className={styles.articleHero}><nav className={styles.breadcrumb}><a href={trigramHref(undefined, locale)}>{c.title}</a><span aria-hidden="true">/</span><span>{c.names[id]}</span></nav><p className={styles.eyebrow}>{identity.symbol} · {identity.pinyin}</p><h1>{a.title}</h1><p className={styles.introduction}>{a.summary}</p><a className={styles.libraryTextLink} href={trigramToolHref(locale)}>{c.tool} →</a></header>
      <div className={styles.readingLayout}>
        <aside className={styles.contents}><p>{c.contents}</p><nav aria-label={c.contents}>{a.sections.map(section => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}<a href="#reflection">{c.reflections}</a><a href="#connections">{c.hexagrams}</a><a href="#sources">{c.sources}</a></nav></aside>
        <div className={`${styles.articleBody} ${learn.prose}`}>
          {a.introduction.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          {a.sections.map(section => <section id={section.id} key={section.id} aria-labelledby={`${section.id}-heading`}><h2 id={`${section.id}-heading`}>{section.title}</h2>{section.id === "figure" && <figure className={learn.figure}><TrigramDiagram id={id} locale={locale} labelled /><figcaption>{c.figure}</figcaption></figure>}{section.id === "tradition" && <div className={learn.quotation}><p className={learn.label}>{c.quotation}</p><blockquote lang="zh-Hant">{a.quote.text}</blockquote><p className={learn.label}>{c.gloss}</p><p className={learn.translation}>{a.quote.translation}</p></div>}{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</section>)}
          <section id="reflection"><h2>{c.reflections}</h2><ol>{a.reflections.map(question => <li key={question}>{question}</li>)}</ol></section>
          <nav className={learn.links} aria-label={c.related}><h2>{c.related}</h2>{a.relatedTrigrams.map(related => <a key={related} href={trigramHref(related, locale)}>{trigramIdentities[related].symbol} {c.names[related]} →</a>)}</nav>
          <nav className={learn.links} id="connections" aria-label={c.hexagrams}><h2>{c.hexagrams}</h2>{a.hexagramNumbers.map(number => { const h = hexagrams[number - 1]; return <div key={number}><a href={hexagramHref(number, locale)}>{h.unicode} {String(number).padStart(2, "0")} · {h.displayName} →</a><p>{h.plainSummary}</p></div>; })}<a href={hexagramHref(undefined, locale)}>{c.library} →</a></nav>
          <section className={learn.source} id="sources"><h2>{c.sources}</h2><p><a href={sourceUrl} target="_blank" rel="noreferrer">《說卦傳》 · {a.quote.locator}</a></p><p>{c.sourceNote}</p></section>
          <div className={styles.articleAction}><a href={trigramHref(undefined, locale)}>{c.title} →</a></div>
        </div>
      </div>
    </article><JournalFooter locale={locale} />
  </main>;
}
