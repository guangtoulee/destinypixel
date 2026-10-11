import type { ReportLocale } from "@/lib/report-i18n";
export function ichingHref(locale: ReportLocale = "en") { return "/iching" + (locale === "en" ? "" : "?locale=" + locale); }
export function trigramLibraryHref(locale: ReportLocale) { return "/journal/trigrams" + (locale === "en" ? "" : "?locale=" + locale); }
