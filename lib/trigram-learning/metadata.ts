import "server-only";
import type { Metadata } from "next";
import type { ReportLocale } from "@/lib/report-i18n";
import { journalLocales, journalLanguageTags, journalOgLocales } from "@/lib/journal-locales";
import { absoluteUrl, siteName } from "@/lib/seo";
import { getTrigramArticle } from "./content";
import { trigramCopy } from "./copy";
import { trigramIds, trigramIdentities, type TrigramId } from "./identity";
import { trigramHref } from "./paths";
export const trigramUpdatedAt = "2026-10-11";
export function trigramCatalog(locale: ReportLocale) {
  return trigramIds.map(id => ({ ...trigramIdentities[id], title: getTrigramArticle(id, locale)!.title, summary: getTrigramArticle(id, locale)!.summary }));
}
export function trigramAlternates(id?: TrigramId) {
  return Object.fromEntries([...journalLocales.map(locale => [journalLanguageTags[locale], absoluteUrl(trigramHref(id, locale))]), ["x-default", absoluteUrl(trigramHref(id, "en"))]]);
}
export function trigramMetadata(locale: ReportLocale, id?: TrigramId): Metadata {
  const article = id ? getTrigramArticle(id, locale) : undefined;
  const c = trigramCopy(locale), title = article?.title ?? c.title, description = article?.summary ?? c.intro, url = trigramHref(id, locale);
  return { title: { absolute: `${title} | ${siteName}` }, description, alternates: { canonical: url, languages: trigramAlternates(id) }, openGraph: { type: id ? "article" : "website", title, description, url, siteName, locale: journalOgLocales[locale] }, twitter: { card: "summary", title, description } };
}
export function trigramSitemap() {
  return [undefined, ...trigramIds].flatMap(id => journalLocales.map(locale => ({ url: absoluteUrl(trigramHref(id, locale)), lastModified: trigramUpdatedAt, changeFrequency: "monthly" as const, priority: id ? 0.7 : 0.8, alternates: { languages: trigramAlternates(id) } })));
}
