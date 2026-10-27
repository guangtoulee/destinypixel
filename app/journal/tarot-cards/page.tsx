import { TarotCardDirectory } from "@/components/tarot-card-directory";
import { tarotCardSearchEntries } from "@/lib/tarot-learning/search-index";
import { JournalFooter } from "@/components/journal-chrome";
import { TarotHeader, TarotNavigation } from "@/components/tarot-navigation";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { journalLanguageTags } from "@/lib/journal-locales";
import { tarotLearningCopy } from "@/lib/tarot-learning/copy";
import { tarotLearningCatalog,tarotLearningMetadata } from "@/lib/tarot-learning/metadata";
import { tarotLearningHref } from "@/lib/tarot-learning/paths";
import { defaultTarotDeck } from "@/lib/celestial/tarot-decks";
import { absoluteUrl } from "@/lib/seo";
import styles from "../journal.module.css";
import learn from "../tarot-learning.module.css";
type Props={searchParams?:Promise<{locale?:string}>};
export async function generateMetadata({searchParams}:Props){return tarotLearningMetadata(normalizeReportLocale((await searchParams)?.locale??"en"));}
export default async function TarotLibrary({searchParams}:Props){
 const locale=normalizeReportLocale((await searchParams)?.locale??"en"),c=tarotLearningCopy(locale),cards=tarotLearningCatalog(locale);
 const schema={"@context":"https://schema.org","@type":"CollectionPage",name:c.title,description:c.intro,url:absoluteUrl(tarotLearningHref(undefined,locale)!),inLanguage:journalLanguageTags[locale],mainEntity:{"@type":"ItemList",numberOfItems:cards.length,itemListElement:cards.map((a,i)=>({"@type":"ListItem",position:i+1,name:a.nameLocalized,url:absoluteUrl(tarotLearningHref(a.cardId,locale)!)}))}};
 return <main className={`${styles.page} ${learn.page}`} lang={journalLanguageTags[locale]} data-server-localized><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/><TarotHeader locale={locale} path="/journal/tarot-cards"/><TarotNavigation locale={locale} current="library"/>
 <header className={styles.indexHero}><p className={styles.eyebrow}>RWS · 78</p><h1>{c.title}</h1><p className={styles.introduction}>{c.intro}</p><a className={styles.libraryTextLink} href={`/tarot${locale==="en"?"":`?locale=${locale}`}`}>{c.table} →</a></header>
 <TarotCardDirectory locale={locale} cards={cards.map(card=>({cardId:card.cardId,number:card.number,arcana:card.arcana,suit:card.suit,nameLocalized:card.nameLocalized,quickTake:card.quickTake,image:defaultTarotDeck.faces[card.cardId],aliases:tarotCardSearchEntries.find(entry=>entry.cardId===card.cardId)!.aliases}))}/>
 <aside className={styles.editorialNote}><p>{c.note}</p><a href={`/journal/pamela-colman-smith-tarot-artist${locale==="en"?"":`?locale=${locale}`}`}>{c.bio}</a></aside><JournalFooter locale={locale}/></main>;
}
