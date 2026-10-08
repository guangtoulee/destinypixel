import Markdown from "react-markdown";
import { notFound } from "next/navigation";
import { JournalHeader,JournalFooter } from "@/components/journal-chrome";
import { hexagramDiagramLabel } from "@/components/hexagram-diagram";
import { loadHexagramArticle } from "@/lib/hexagram-learning/content";
import { hexagramCopy } from "@/lib/hexagram-learning/copy";
import { hexagramHref,hexagramToolHref } from "@/lib/hexagram-learning/paths";
import { hexagramCatalog,hexagramUpdatedAt } from "@/lib/hexagram-learning/metadata";
import { journalLanguageTags } from "@/lib/journal-locales";
import { absoluteUrl,siteName } from "@/lib/seo";
import type { ReportLocale } from "@/lib/report-i18n";
import sources from "@/content/hexagrams/sources.json";
import styles from "@/app/journal/journal.module.css";
import learn from "@/app/journal/hexagram-learning.module.css";

export default async function HexagramLearningArticle({number,locale}:{number:number;locale:ReportLocale}) {
 const id=`hexagram-${String(number).padStart(2,"0")}`,a=await loadHexagramArticle(id,locale);if(!a)notFound();
 const c=hexagramCopy(locale),url=absoluteUrl(hexagramHref(number,locale)!),catalog=hexagramCatalog(locale);
 const headings=[...a.articleMarkdown.matchAll(/^## (.+)$/gm)].map(m=>m[1]);let section=0;
 const manuscript=a.articleMarkdown.replace(/^# [^\n]+\n/,"").trimStart();
 const opening=manuscript.split(/\n\s*\n/,1)[0],body=manuscript.slice(opening.length).trimStart();
 const citations=sources.filter(s=>a.sourceIds.includes(s.id));
 const schema=[{"@context":"https://schema.org","@type":"Article",headline:a.title,description:a.plainSummary,url,mainEntityOfPage:url,inLanguage:journalLanguageTags[locale],datePublished:hexagramUpdatedAt,dateModified:hexagramUpdatedAt,isAccessibleForFree:true,author:{"@type":"Organization",name:siteName,url:absoluteUrl("/")},publisher:{"@type":"Organization",name:siteName},citation:citations.map(s=>s.url)}, {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:c.title,item:absoluteUrl(hexagramHref(undefined,locale)!)},{"@type":"ListItem",position:2,name:a.displayName,item:url}]}];
 return <main className={styles.page} lang={journalLanguageTags[locale]} data-server-localized>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/>
  <JournalHeader locale={locale} slug={id}/>
  <article data-hexagram-learning={id}>
   <header className={styles.articleHero}><nav className={styles.breadcrumb}><a href={hexagramHref(undefined,locale)}>{c.title}</a><span aria-hidden="true">/</span><span>{a.displayName}</span></nav><p className={styles.eyebrow}>{String(number).padStart(2,"0")} · {a.unicode} · {a.displayName}</p><h1>{a.title}</h1><div className={learn.opening} data-manuscript-opening><Markdown skipHtml>{opening}</Markdown></div><a className={styles.libraryTextLink} href={hexagramToolHref(locale)}>{c.tool} →</a></header>
   <div className={styles.readingLayout}>
    <aside className={styles.contents}><p>{c.contents}</p><nav aria-label={c.contents}>{headings.map((h,i)=><a href={`#section-${i+1}`} key={i}>{h}</a>)}</nav></aside>
    <div className={styles.articleBody}>
     <div className={learn.prose} data-full-manuscript>
      <Markdown skipHtml components={{
       h2:({children})=><h2 id={`section-${++section}`}>{children}</h2>,
       pre:({children})=><pre role="img" aria-label={hexagramDiagramLabel(a.linesBottomUp,locale)} data-hexagram-diagram>{children}</pre>,
       a:({href,children})=><a href={href} target={href?.startsWith("https:")?"_blank":undefined} rel={href?.startsWith("https:")?"noreferrer":undefined}>{children}</a>
      }}>{body}</Markdown>
     </div>
     <nav className={learn.related} aria-label={c.related}><h2>{c.related}</h2>{a.related.map(r=>{const entry=catalog.find(x=>x.id===r.id);return entry?<a key={r.id} href={hexagramHref(entry.kingWenNumber,locale)}>{entry.unicode} {entry.displayName} →</a>:null;})}</nav>
     <nav className={learn.pagination} aria-label={c.title}>{number>1&&<a rel="prev" href={hexagramHref(number-1,locale)}>← {c.previous}: {catalog[number-2].displayName}</a>}{number<64&&<a rel="next" href={hexagramHref(number+1,locale)}>{c.next}: {catalog[number].displayName} →</a>}</nav>
     <div className={styles.articleAction}><a href={hexagramHref(undefined,locale)}>{c.title} →</a></div>
    </div>
   </div>
  </article><JournalFooter locale={locale}/>
 </main>;
}
