import { getPillarImagePath, getPillarSlug } from "@/lib/archetype-assets";
import { pillarsDB } from "@/lib/pillars";

export type DayPillarLocale = "en" | "zh";
export type DayPillarCard = {
  pillar: string;
  slug: string;
  image: string;
  name: string;
  essence: string;
  growth: string;
};

/** Project only the public card fields. Health, wealth and full-report text are excluded. */
export function getDayPillarCards(locale: DayPillarLocale): DayPillarCard[] {
  const language = locale === "zh" ? "cn" : "en";
  return Object.entries(pillarsDB).map(([pillar, profile]) => ({
    pillar, slug: getPillarSlug(pillar), image: getPillarImagePath(pillar),
    name: profile.name[language], essence: profile.essence[language], growth: profile.growth[language],
  }));
}
