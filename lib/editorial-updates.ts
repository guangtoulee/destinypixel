import revisions from "@/content/encyclopedia-samples-20261011/revisions.json";
import type { ReportLocale } from "@/lib/report-i18n";

type Revision = { notes: Partial<Record<ReportLocale, string>> };
const articles: Record<string, Revision> = revisions.articles;

/** A date applies only to the language actually edited in this revision. */
export function editorialUpdate(slug: string, locale: ReportLocale) {
  if (!Object.hasOwn(articles, slug)) return undefined;
  const note = articles[slug]?.notes[locale];
  return note ? { updatedAt: revisions.updatedAt, note } : undefined;
}

export function editorialModifiedAt(slug: string, locale: ReportLocale, previous: string) {
  return editorialUpdate(slug, locale)?.updatedAt ?? previous;
}
