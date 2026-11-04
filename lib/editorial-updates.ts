import revisions from "@/content/encyclopedia-samples-20261011/revisions.json";
import peopleRevisions from "@/content/day-pillar-people/revisions.json";
import secondBatchRevisions from "@/content/day-pillar-people/second-batch-revisions.json";
import queenSwordsRevision from "@/content/queen-swords-update-20261023/revisions.json";
import hangedManRevision from "@/content/hanged-man-update-20261024/revisions.json";
import starRevision from "@/content/star-update-20261025/revisions.json";
import questionScopeRevision from "@/content/three-card-question-scope-20261030/revisions.json";
import eightSwordsRevision from "@/content/eight-swords-update-20261102/revisions.json";
import judgementRevision from "@/content/judgement-update-20261103/revisions.json";
import moonRevision from "@/content/moon-update-20261103/revisions.json";
import sunRevision from "@/content/sun-update-20261103/revisions.json";
import sevenCupsRevision from "@/content/seven-cups-update-20261103/revisions.json";
import towerRevision from "@/content/tower-update-20261104/revisions.json";
import devilRevision from "@/content/devil-update-20261104/revisions.json";
import type { ReportLocale } from "@/lib/report-i18n";

type Revision = { notes: Partial<Record<ReportLocale, string>> };
const registries: { updatedAt: string; articles: Record<string, Revision> }[] = [devilRevision, towerRevision, sevenCupsRevision, sunRevision, moonRevision, judgementRevision, eightSwordsRevision, questionScopeRevision, starRevision, hangedManRevision, queenSwordsRevision, secondBatchRevisions, peopleRevisions, revisions];

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
