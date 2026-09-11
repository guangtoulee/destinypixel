import { branchSlugs, getPillarSlug, stemSlugs } from "@/lib/archetype-assets";
import type { DayPillarLocale } from "@/lib/day-pillar-cards";

const stems = Object.keys(stemSlugs);
const branches = Object.keys(branchSlugs);
const publicSlugs = new Set(Array.from({ length: 60 }, (_, index) => getPillarSlug(`${stems[index % 10]}${branches[index % 12]}`)));

/** Only a controlled public card type and language belong in a share URL. */
export function dayPillarSharePath(locale: DayPillarLocale, slug: string): string {
  const query = new URLSearchParams();
  if (locale === "zh") query.set("locale", "zh");
  if (publicSlugs.has(slug)) query.set("pillar", slug);
  return `/day-pillar${query.size ? `?${query}` : ""}`;
}
