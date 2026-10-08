import Image from "next/image";
import TarotEditorialLinks from "@/components/tarot-editorial-links";
import Markdown from "react-markdown";
import { notFound } from "next/navigation";
import { JournalFooter } from "@/components/journal-chrome";
import { TarotHeader, TarotNavigation } from "@/components/tarot-navigation";
import { loadTarotLearningArticle } from "@/lib/tarot-learning/content";
import { tarotLearningCopy } from "@/lib/tarot-learning/copy";
import { tarotLearningHref,tarotLearningIds,tarotLearningSlug,type TarotLearningId } from "@/lib/tarot-learning/paths";
import { tarotLearningCatalog,tarotLearningUpdatedAt } from "@/lib/tarot-learning/metadata";
import { journalLanguageTags, journalUi } from "@/lib/journal-locales";
import { absoluteUrl,siteName } from "@/lib/seo";
import { defaultTarotDeck,tarotArtworkEditions } from "@/lib/celestial/tarot-decks";
import type { ReportLocale } from "@/lib/report-i18n";
import styles from "@/app/journal/journal.module.css";
import learn from "@/app/journal/tarot-learning.module.css";

const sunLegacyAnchors:Record<string,string[]>={"sun-section-1":["section-01"],"sun-section-2":["section-02","section-08"],"sun-section-3":["section-03","section-06"],"sun-section-5":["section-04"],"sun-section-6":["section-05"]};

export default async function TarotLearningArticle({id,locale}:{id:TarotLearningId;locale:ReportLocale}) {
 const a=await loadTarotLearningArticle(id,locale);if(!a)notFound();
 const c=tarotLearningCopy(locale),url=absoluteUrl(tarotLearningHref(id,locale)!),catalog=tarotLearningCatalog(locale),position=tarotLearningIds.indexOf(id);
 const schema=[{"@context":"https://schema.org","@type":"Article",headline:a.title,description:a.hook,url,mainEntityOfPage:url,inLanguage:journalLanguageTags[locale],datePublished:a.publishedAt??tarotLearningUpdatedAt,dateModified:a.updatedAt??tarotLearningUpdatedAt,isAccessibleForFree:true,image:[absoluteUrl(defaultTarotDeck.faces[id])],author:{"@type":"Organization",name:siteName,url:absoluteUrl("/")},publisher:{"@type":"Organization",name:siteName},citation:a.sources.map(s=>s.url??s.title)}, {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:c.directory,item:absoluteUrl(tarotLearningHref(undefined,locale)!)},{"@type":"ListItem",position:2,name:a.nameLocalized,item:url}]}];
 return <main className={`${styles.page} ${learn.page}`} lang={journalLanguageTags[locale]} data-server-localized>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/>
  <TarotHeader locale={locale} path={`/journal/${tarotLearningSlug(id)}`}/><TarotNavigation locale={locale}/>
  <article data-tarot-learning={id}>
   <header className={styles.articleHero}>
    <nav className={styles.breadcrumb}><a href={tarotLearningHref(undefined,locale)}>{c.directory}</a><span aria-hidden="true">/</span><span>{a.nameLocalized}</span></nav>
    <p className={styles.eyebrow}>RWS · {a.number} · {a.nameLocalized}</p><h1>{a.title}</h1>
    <div className={learn.hero}>
     <figure className={learn.figure}><Image src={defaultTarotDeck.faces[id]} alt={a.nameLocalized} width={560} height={960} sizes="(max-width:650px) 220px, 280px" priority/><figcaption>{tarotArtworkEditions[0].credits} · <a href={defaultTarotDeck.attribution}>{c.source}</a></figcaption></figure>
     <div className={learn.opening}>
      {a.legacyIntroAnchors?.map(anchor=><span key={anchor} id={anchor} aria-hidden="true"/>)}
      <dl className={learn.quick}><div><dt>{c.upright}</dt><dd>{a.quickTake.upright}</dd></div><div><dt>{c.reversed}</dt><dd>{a.quickTake.reversed}</dd></div></dl>
      <p className={styles.introduction} data-learning-hook>{a.hook}</p>
      {a.openingParagraphs?.map((paragraph,index)=><p className={styles.introduction} key={index}>{paragraph}</p>)}
      {a.plainLanguageSummary && <p className={learn.summary}><strong>{c.summary}</strong> {a.plainLanguageSummary}</p>}
      <ul className={learn.keywords} aria-label={a.nameLocalized}>{a.keywords.map(word=><li key={word}>{word}</li>)}</ul>
      <a className={styles.libraryTextLink} href={`/tarot${locale==="en"?"":`?locale=${locale}`}`}>{c.table} →</a>
     </div>
    </div>
   {a.updatedAt && <div className={styles.byline}><span>{journalUi[locale].published} <time dateTime={a.publishedAt}>{a.publishedAt}</time></span><span>{journalUi[locale].updated} <time dateTime={a.updatedAt}>{a.updatedAt}</time></span></div>}
   </header>
   <div className={`${styles.readingLayout} ${learn.reading}`}>
    <aside className={`${styles.contents} ${learn.contents}`}><p>{c.contents}</p><nav aria-label={c.contents}>{a.sections.map(s=><a href={`#${s.id}`} key={s.id}>{s.title}</a>)}{a.sourceAppendix&&<a href={`#${a.sourceAppendix.id}`}>{a.sourceAppendix.title}</a>}</nav></aside>
    <div className={styles.articleBody}>
     {a.sections.map(s=><section key={s.id} id={s.id} className={`${styles.section} ${learn.prose}`} data-learning-section={s.id} aria-labelledby={`${s.id}-title`}><h2 id={`${s.id}-title`}>{s.title}</h2>{[...(id==="sun"?(sunLegacyAnchors[s.id]??[]):[]),...(s.legacyAnchors??[])].map(anchor=><span key={anchor} id={anchor} aria-hidden="true"/>)}<Markdown skipHtml components={{a:({href,children})=><a href={href} target={href?.startsWith("https:")?"_blank":undefined} rel={href?.startsWith("https:")?"noreferrer":undefined}>{children}</a>}}>{s.bodyMarkdown}</Markdown></section>)}
     {a.sourceAppendix && <section id={a.sourceAppendix.id} className={`${styles.section} ${learn.prose}`} data-learning-source-appendix={a.sourceAppendix.id} aria-labelledby={`${a.sourceAppendix.id}-title`}><h2 id={`${a.sourceAppendix.id}-title`}>{a.sourceAppendix.title}</h2><ul>{a.sources.map((source,index)=><li key={index}>{source.url?<a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>:source.title}</li>)}</ul></section>}
     {a.relatedCards.length>0 && <nav className={learn.related} aria-label={c.related} id={id==="sun"?"section-07":undefined}>{a.legacyRelatedAnchors?.map(anchor=><span key={anchor} id={anchor} aria-hidden="true"/>)}<h2>{c.related}</h2>{a.relatedCards.map(r=>{const href=tarotLearningHref(r.cardId,locale),entry=catalog.find(x=>x.cardId===r.cardId);return href&&entry?<a key={r.cardId} href={href}><strong>{entry.nameLocalized}</strong><span>{r.reason}</span></a>:null;})}</nav>}
     <TarotEditorialLinks slug={tarotLearningSlug(id)} locale={locale}/>
     <nav className={learn.pagination} aria-label={c.directory}>{position>0&&<a rel="prev" href={tarotLearningHref(tarotLearningIds[position-1],locale)}>← {c.previous}: {catalog[position-1].nameLocalized}</a>}{position<77&&<a rel="next" href={tarotLearningHref(tarotLearningIds[position+1],locale)}>{c.next}: {catalog[position+1].nameLocalized} →</a>}</nav>
     <div className={styles.articleAction}><a href={tarotLearningHref(undefined,locale)}>{c.directory} →</a></div>
     <aside className={styles.related}><a href={`/journal/pamela-colman-smith-tarot-artist${locale==="en"?"":`?locale=${locale}`}`}>{c.bio}</a></aside>
    </div>
   </div>
  </article><JournalFooter locale={locale}/>
 </main>;
}
