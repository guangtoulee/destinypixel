import { JournalHeader, JournalFooter } from "@/components/journal-chrome";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { journalLanguageTags } from "@/lib/journal-locales";
import { trigramCopy } from "@/lib/trigram-learning/copy";
import { trigramCatalog, trigramMetadata } from "@/lib/trigram-learning/metadata";
import { trigramHref, trigramToolHref } from "@/lib/trigram-learning/paths";
import { TrigramDiagram } from "@/lib/trigram-learning/diagram";
import { hexagramHref } from "@/lib/hexagram-learning/paths";
import { absoluteUrl } from "@/lib/seo";
import styles from "../journal.module.css";
import learn from "../trigram-learning.module.css";
type Props = { searchParams?: Promise<{ locale?: string }> };
export async function generateMetadata({ searchParams }: Props) { return trigramMetadata(normalizeReportLocale((await searchParams)?.locale ?? "en")); }
export default async function TrigramLibrary({ searchParams }: Props) {
  const locale = normalizeReportLocale((await searchParams)?.locale ?? "en"), c = trigramCopy(locale), articles = trigramCatalog(locale);
  const schema = { "@context": "https://schema.org", "@type": "CollectionPage", name: c.title, description: c.intro, url: absoluteUrl(trigramHref(undefined, locale)), inLanguage: journalLanguageTags[locale], mainEntity: { "@type": "ItemList", numberOfItems: 8, itemListElement: articles.map((a, index) => ({ "@type": "ListItem", position: index + 1, name: c.names[a.id], url: absoluteUrl(trigramHref(a.id, locale)) })) } };
  return <main className={styles.page} lang={journalLanguageTags[locale]} data-server-localized><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} /><JournalHeader locale={locale} slug="trigrams" />
    <header className={styles.indexHero}><p className={styles.eyebrow}>☰ · 8 · ☷</p><h1>{c.title}</h1><p className={styles.introduction}>{c.intro}</p></header>
    <nav className={learn.directoryActions}><a href={trigramToolHref(locale)}>{c.tool} →</a><a href={hexagramHref(undefined, locale)}>{c.library} →</a></nav>
    <section className={learn.grid} aria-label={c.title}>{articles.map(a => <article className={learn.tile} key={a.id}><a href={trigramHref(a.id, locale)}><TrigramDiagram id={a.id} locale={locale} /><h2>{a.symbol} {c.names[a.id]}</h2><p>{a.summary}</p><span className={learn.read}>{c.read} →</span></a></article>)}</section>
    <aside className={styles.editorialNote}><p>{c.note}</p></aside><JournalFooter locale={locale} />
  </main>;
}
