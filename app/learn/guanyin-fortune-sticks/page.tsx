import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";
import { guanyinAlternates, guanyinGuideCopy, guanyinHref, guanyinLocale, guanyinPublishedAt, guanyinSources, guanyinToolHref, guanyinUpdatedAt } from "@/lib/guanyin-guide";
import { journalHomeHref, journalLanguageLabels, journalLanguageTags, journalLocales, journalOgLocales, journalUi } from "@/lib/journal-locales";
import styles from "./page.module.css";

type Props = { searchParams: Promise<{ locale?: string | string[] }> };
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = guanyinLocale((await searchParams).locale), copy = guanyinGuideCopy[locale];
  return {
    title: { absolute: copy.title }, description: copy.description,
    alternates: { canonical: absoluteUrl(guanyinHref(locale)), languages: guanyinAlternates() },
    openGraph: {
      type: "article", title: copy.title, description: copy.description, url: absoluteUrl(guanyinHref(locale)),
      locale: journalOgLocales[locale], alternateLocale: journalLocales.filter(l => l !== locale).map(l => journalOgLocales[l]),
      publishedTime: guanyinPublishedAt, modifiedTime: guanyinUpdatedAt,
    },
  };
}
export default async function GuanyinGuidePage({ searchParams }: Props) {
  const locale = guanyinLocale((await searchParams).locale), copy = guanyinGuideCopy[locale], ui = journalUi[locale];
  const url = absoluteUrl(guanyinHref(locale));
  const schema = {
    "@context": "https://schema.org", "@type": "Article", headline: copy.h1, description: copy.description,
    url, mainEntityOfPage: url, inLanguage: journalLanguageTags[locale],
    datePublished: guanyinPublishedAt, dateModified: guanyinUpdatedAt,
    author: { "@type": "Organization", name: "DestinyPixel", url: absoluteUrl("/") },
    citation: Object.values(guanyinSources),
  };
  return <main lang={journalLanguageTags[locale]} className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <header className={styles.header}>
      <Link href={journalHomeHref(locale)} aria-label={`DestinyPixel · ${ui.home}`} className={styles.brand}>DestinyPixel</Link>
      <nav aria-label={ui.language} className={styles.languages}>
        {journalLocales.map(l => <Link key={l} href={guanyinHref(l)} hrefLang={journalLanguageTags[l]} lang={journalLanguageTags[l]} aria-current={l === locale ? "page" : undefined}>{journalLanguageLabels[l]}</Link>)}
      </nav>
    </header>
    <article className={styles.article}>
      <h1>{copy.h1}</h1>
      <p className={styles.dates}>{ui.published} <time dateTime={guanyinPublishedAt}>{guanyinPublishedAt}</time><span aria-hidden> · </span>{ui.updated} <time dateTime={guanyinUpdatedAt}>{guanyinUpdatedAt}</time></p>
      <p className={styles.intro}>{copy.intro}</p>
      <div className={styles.action}>
        <Link href={guanyinToolHref(locale)} className={styles.button}>{copy.cta}<span aria-hidden> →</span></Link>
        <p>{copy.ctaNote}</p>
      </div>
      <p className={styles.scope}>{copy.scope}</p>
      <nav aria-label={ui.sections} className={styles.contents}>
        <span>{ui.contents}</span>
        <ul>{copy.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ul>
      </nav>
      {copy.sections.map(section => <section id={section.id} key={section.id} className={styles.section}>
        <h2>{section.title}</h2>
        {section.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        {section.steps && <ol>{section.steps.map(step => <li key={step}>{step}</li>)}</ol>}
        {section.source && <p className={styles.source}><a href={guanyinSources[section.source.key]}>{section.source.label}</a></p>}
      </section>)}
      <div className={styles.closing}>
        <p>{copy.endCta}</p>
        <Link className={styles.button} href={guanyinToolHref(locale)}>{copy.cta}<span aria-hidden> →</span></Link>
      </div>
      <p className={styles.disclaimer}>{copy.disclaimer}</p>
      <aside className={styles.related} aria-label={ui.related}>
        <h2>{ui.related}</h2>
        <ul>{copy.related.map(item => <li key={item.slug}><Link href={`/journal/${item.slug}${locale === "en" ? "" : `?locale=${locale}`}`}>{item.label}</Link></li>)}</ul>
      </aside>
    </article>
    <footer className={styles.footer}><Link href={journalHomeHref(locale)}>← {ui.home}</Link><p>{ui.footer}</p></footer>
  </main>;
}
