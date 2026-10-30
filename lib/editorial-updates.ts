import revisions from "@/content/encyclopedia-samples-20261011/revisions.json";
import peopleRevisions from "@/content/day-pillar-people/revisions.json";
import secondBatchRevisions from "@/content/day-pillar-people/second-batch-revisions.json";
import queenSwordsRevision from "@/content/queen-swords-update-20261023/revisions.json";
import hangedManRevision from "@/content/hanged-man-update-20261024/revisions.json";
import starRevision from "@/content/star-update-20261025/revisions.json";
import questionScopeRevision from "@/content/three-card-question-scope-20261030/revisions.json";
import type { ReportLocale } from "@/lib/report-i18n";

type Revision = { notes: Partial<Record<ReportLocale, string>> };
const registries: { updatedAt: string; articles: Record<string, Revision> }[] = [questionScopeRevision, starRevision, hangedManRevision, queenSwordsRevision, secondBatchRevisions, peopleRevisions, revisions];

/** A date applies only to the language actually edited in this revision. */
export function editorialUpdate(slug: string, locale: ReportLocale) {
  for (const registry of registries) {
    if (!Object.hasOwn(registry.articles, slug)) continue;
    const note = registry.articles[slug]?.notes[locale];
    if (note) return { updatedAt: registry.updatedAt, note };
  }
  return undefined;
}

export function editorialModifiedAt(slug: string, locale: ReportLocale, previous: string) {
  return editorialUpdate(slug, locale)?.updatedAt ?? previous;
}
