import "server-only";
import type { Metadata } from "next";
import type { ReportLocale } from "@/lib/report-i18n";
import { journalLocales,journalLanguageTags,journalOgLocales } from "@/lib/journal-locales";
import { absoluteUrl,siteName } from "@/lib/seo";
import catalog from "./catalog.json";
import { tarotLearningHref,tarotLearningIds } from "./paths";
import { tarotLearningCopy } from "./copy";
export const tarotLearningUpdatedAt="2026-10-07";
export const tarotLearningCatalog=(locale:ReportLocale)=>catalog[locale];
export function tarotLearningAlternates(id?:string){return Object.fromEntries([...journalLocales.map(l=>[journalLanguageTags[l],absoluteUrl(tarotLearningHref(id,l)!)]),["x-default",absoluteUrl(tarotLearningHref(id,"en")!)]]);}
export function tarotLearningMetadata(locale:ReportLocale,id?:string):Metadata {
 const entry=id?catalog[locale].find(c=>c.cardId===id):undefined;
 if(id&&!entry)return {robots:{index:false,follow:false}};
 const c=tarotLearningCopy(locale),title=entry?.title??c.title,description=entry?.hook??c.intro,url=tarotLearningHref(id,locale)!;
 const images=id?[{url:`/tarot/rws/${id}.webp`,width:560,height:960,alt:entry!.nameLocalized}]:["/tarot/opengraph-image"];
 return {title:{absolute:title},description,alternates:{canonical:url,languages:tarotLearningAlternates(id)},openGraph:{type:id?"article":"website",title,description,url,siteName,locale:journalOgLocales[locale],images},twitter:{card:"summary_large_image",title,description,images}};
}
export function tarotLearningSitemap(){return [undefined,...tarotLearningIds].flatMap(id=>journalLocales.map(locale=>({url:absoluteUrl(tarotLearningHref(id,locale)!),lastModified:tarotLearningUpdatedAt,changeFrequency:"monthly" as const,priority:id?0.7:0.8,alternates:{languages:tarotLearningAlternates(id)},...(id?{images:[absoluteUrl(`/tarot/rws/${id}.webp`)]}:{})})));}
