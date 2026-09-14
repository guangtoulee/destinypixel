import { getPillarImagePath } from "@/lib/archetype-assets";
import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import BirthdayCardFinder from "@/components/birthday-card-finder";
import {getDiscoveryCopy,discoveryHref,discoveryAlternates,discoveryLocales} from "@/lib/discovery";
import {getDayPillarCards} from "@/lib/day-pillar-cards";
import {normalizeReportLocale} from "@/lib/report-i18n";
import {journalLanguageTags} from "@/lib/journal-locales";
import {absoluteUrl} from "@/lib/seo";
import styles from "@/components/discovery.module.css";
type Props={searchParams?:Promise<{locale?:string}>};
export async function generateMetadata({searchParams}:Props):Promise<Metadata>{const locale=normalizeReportLocale((await searchParams)?.locale??"en"),copy=getDiscoveryCopy(locale);return {title:{absolute:copy.title},description:copy.description,alternates:{canonical:discoveryHref(locale),languages:discoveryAlternates()},openGraph:{type:"website",title:copy.title,description:copy.description,url:discoveryHref(locale),images:[getPillarImagePath("癸卯")]},twitter:{card:"summary_large_image",title:copy.title,description:copy.description,images:[getPillarImagePath("癸卯")]}};}
export default async function Discover({searchParams}:Props){
 const locale=normalizeReportLocale((await searchParams)?.locale??"en"),copy=getDiscoveryCopy(locale),home=locale==="en"?"/":`/?locale=${locale}`;
 const cards=getDayPillarCards(locale);
 const schema={"@context":"https://schema.org","@type":"WebApplication",name:copy.title,description:copy.description,url:absoluteUrl(discoveryHref(locale)),inLanguage:journalLanguageTags[locale],applicationCategory:"LifestyleApplication",operatingSystem:"Web",offers:{"@type":"Offer",price:"0",priceCurrency:"USD"}};
 return <main className={styles.page} lang={journalLanguageTags[locale]} data-server-localized><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/><header className={styles.header}><a className={styles.brand} href={home}><span/>DestinyPixel</a><nav aria-label="Language">{discoveryLocales.map(l=><a key={l} href={discoveryHref(l)} aria-current={l===locale?"page":undefined}>{({en:"EN",zh:"简体","zh-TW":"繁體",ru:"RU"})[l]}</a>)}</nav></header><div className={styles.hero}><section className={styles.intro}><p className={styles.label}>{copy.eyebrow}</p><h1>{copy.heading}</h1><p className={styles.lead}>{copy.intro}</p><ul className={styles.features}>{copy.features.map(x=><li key={x}><Check size={14}/>{x}</li>)}</ul><div className={styles.preview}>{["癸卯","丙午","辛巳"].map(p=>{const c=cards.find(x=>x.pillar===p)!;return <figure key={p}><Image src={c.image} alt={c.name} width={896} height={1200} sizes="(max-width:650px) 28vw, 130px"/><figcaption>{c.name}</figcaption></figure>})}</div></section><BirthdayCardFinder cards={cards} copy={copy.finder} locale={locale}/></div><section className={styles.steps}><h2>{copy.nextTitle}</h2><div>{copy.steps.map((step,i)=><article key={step.title}><span>0{i+1}</span><h3>{step.title}</h3><p>{step.body}</p></article>)}</div></section><section className={styles.faq}><h2>{copy.faqTitle}</h2><div>{copy.faqs.map(x=><details key={x.q}><summary>{x.q}</summary><p>{x.a}</p></details>)}</div></section><footer className={styles.footer}><a href={home}>DestinyPixel</a><a href={`/journal${locale==="en"?"":`?locale=${locale}`}`}>{copy.journal}<ArrowRight size={14}/></a></footer></main>;
}
