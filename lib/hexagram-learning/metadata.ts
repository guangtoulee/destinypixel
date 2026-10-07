import "server-only";
import type { Metadata } from "next";
import type { ReportLocale } from "@/lib/report-i18n";
import { journalLocales,journalLanguageTags,journalOgLocales } from "@/lib/journal-locales";
import { absoluteUrl,siteName } from "@/lib/seo";
import catalog from "./catalog.json";
import { hexagramHref } from "./paths";
import { hexagramCopy } from "./copy";
export const hexagramUpdatedAt="2026-10-07";
export const hexagramCatalog=(locale:ReportLocale)=>catalog[locale];
export function hexagramAlternates(number?:number){return Object.fromEntries([...journalLocales.map(l=>[journalLanguageTags[l],absoluteUrl(hexagramHref(number,l)!)]),["x-default",absoluteUrl(hexagramHref(number,"en")!)]]);}
export function hexagramMetadata(locale:ReportLocale,number?:number):Metadata {
 const entry=number?catalog[locale][number-1]:undefined,c=hexagramCopy(locale),title=entry?.title??c.title,description=entry?.plainSummary??c.intro,url=hexagramHref(number,locale)!;
 return {title:{absolute:`${title} | ${siteName}`},description,alternates:{canonical:url,languages:hexagramAlternates(number)},openGraph:{type:number?"article":"website",title,description,url,siteName,locale:journalOgLocales[locale]},twitter:{card:"summary",title,description}};
}
export function hexagramSitemap(){return [undefined,...Array.from({length:64},(_,i)=>i+1)].flatMap(number=>journalLocales.map(locale=>({url:absoluteUrl(hexagramHref(number,locale)!),lastModified:hexagramUpdatedAt,changeFrequency:"monthly" as const,priority:number?0.7:0.8,alternates:{languages:hexagramAlternates(number)}})));}
