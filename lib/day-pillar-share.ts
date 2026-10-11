import { branchSlugs, getPillarSlug, stemSlugs } from "@/lib/archetype-assets";
import type { ReportLocale } from "@/lib/report-i18n";

const stems = Object.keys(stemSlugs);
const branches = Object.keys(branchSlugs);
const publicSlugs = new Set(Array.from({ length: 60 }, (_, index) => getPillarSlug(`${stems[index % 10]}${branches[index % 12]}`)));

export function isPublicDayPillarSlug(slug: string): boolean { return publicSlugs.has(slug); }

/** Only a controlled public card type and language belong in a share URL. */
export function dayPillarSharePath(locale: ReportLocale, slug: string): string {
  const query = new URLSearchParams();
  if (locale !== "en") query.set("locale", locale);
  if (isPublicDayPillarSlug(slug)) query.set("pillar", slug);
  // The illustrated day-pillar experience has zh/en editions; discovery also
  // renders the same public cards in Traditional Chinese and Russian.
  const path = locale === "zh-TW" || locale === "ru" ? "/discover" : "/day-pillar";
  return `${path}${query.size ? `?${query}` : ""}`;
}
