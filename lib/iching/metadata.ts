import "server-only";
import type { Metadata } from "next";
import type { ReportLocale } from "@/lib/report-i18n";
import { journalLocales, journalLanguageTags, journalOgLocales } from "@/lib/journal-locales";
import { absoluteUrl, siteName } from "@/lib/seo";
import { ichingCopy } from "./copy";
import { ichingHref } from "./paths";

export function ichingAlternates() {
  return Object.fromEntries([...journalLocales.map(locale => [journalLanguageTags[locale], absoluteUrl(ichingHref(locale))]), ["x-default", absoluteUrl(ichingHref("en"))]]);
}
export function ichingMetadata(locale: ReportLocale): Metadata {
  const copy = ichingCopy(locale), url = ichingHref(locale);
  return {
    title: { absolute: copy.title + " | " + siteName }, description: copy.description,
    alternates: { canonical: url, languages: ichingAlternates() },
    openGraph: { type: "website", title: copy.title, description: copy.description, url, siteName, locale: journalOgLocales[locale], alternateLocale: journalLocales.filter(l => l !== locale).map(l => journalOgLocales[l]) },
    twitter: { card: "summary", title: copy.title, description: copy.description },
  };
}
export function ichingSitemap() {
  return journalLocales.map(locale => ({ url: absoluteUrl(ichingHref(locale)), lastModified: "2026-10-11", changeFrequency: "monthly" as const, priority: 0.8, alternates: { languages: ichingAlternates() } }));
}
