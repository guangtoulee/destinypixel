import type { ReportLocale } from "@/lib/report-i18n";
import { isTrigramId, trigramSlug, type TrigramId } from "./identity";
export function trigramHref(id: TrigramId | undefined, locale: ReportLocale): string {
  if (id !== undefined && !isTrigramId(id)) throw new Error("Unknown trigram");
  return `/journal/${id === undefined ? "trigrams" : trigramSlug(id)}${locale === "en" ? "" : `?locale=${locale}`}`;
}
export function trigramToolHref(locale: ReportLocale) {
  return `/iching${locale === "en" ? "" : `?locale=${locale}`}`;
}
