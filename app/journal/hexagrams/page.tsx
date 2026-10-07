import { JournalHeader,JournalFooter } from "@/components/journal-chrome";
import { HexagramDiagram } from "@/components/hexagram-diagram";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { journalLanguageTags } from "@/lib/journal-locales";
import { hexagramCopy } from "@/lib/hexagram-learning/copy";
import { hexagramCatalog,hexagramMetadata } from "@/lib/hexagram-learning/metadata";
import { hexagramHref,hexagramToolHref } from "@/lib/hexagram-learning/paths";
import { absoluteUrl } from "@/lib/seo";
import styles from "../journal.module.css";
import learn from "../hexagram-learning.module.css";
type Props={searchParams?:Promise<{locale?:string}>};
export async function generateMetadata({searchParams}:Props){return hexagramMetadata(normalizeReportLocale((await searchParams)?.locale??"en"));}
export default async function HexagramLibrary({searchParams}:Props){
 const locale=normalizeReportLocale((await searchParams)?.locale??"en"),c=hexagramCopy(locale),articles=hexagramCatalog(locale);
 const schema={"@context":"https://schema.org","@type":"CollectionPage",name:c.title,description:c.intro,url:absoluteUrl(hexagramHref(undefined,locale)!),inLanguage:journalLanguageTags[locale],mainEntity:{"@type":"ItemList",numberOfItems:64,itemListElement:articles.map(a=>({"@type":"ListItem",position:a.kingWenNumber,name:a.displayName,url:absoluteUrl(hexagramHref(a.kingWenNumber,locale)!)}))}};
 return <main className={styles.page} lang={journalLanguageTags[locale]} data-server-localized><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/><JournalHeader locale={locale} slug="hexagrams"/>
  <header className={styles.indexHero}><p className={styles.eyebrow}>䷀ · 64 · ䷿</p><h1>{c.title}</h1><p className={styles.introduction}>{c.intro}</p><a className={styles.libraryTextLink} href={hexagramToolHref(locale)}>{c.tool} →</a></header>
  <section className={learn.grid} aria-label={c.title}>{articles.map(a=><article className={learn.tile} key={a.id}><a href={hexagramHref(a.kingWenNumber,locale)}><HexagramDiagram bits={a.linesBottomUp} locale={locale}/><p className={learn.number}>{String(a.kingWenNumber).padStart(2,"0")} · {a.unicode}</p><h2>{a.displayName}</h2><p>{a.plainSummary}</p><span>{c.read} →</span></a></article>)}</section>
  <aside className={styles.editorialNote}><p>{c.note}</p></aside><JournalFooter locale={locale}/>
 </main>;
}
