import type { JournalArticle, JournalTranslation } from "./journal";
import en from "@/content/tarot-suit-patterns-20261031/en.json";
import zh from "@/content/tarot-suit-patterns-20261031/zh.json";

export const tarotSuitSlug = "when-one-tarot-suit-dominates";
const translations: Record<"en" | "zh", JournalTranslation> = { en, zh };
export const tarotSuitArticle: JournalArticle = {
  slug: tarotSuitSlug,
  kind: "education",
  relatedSlug: "how-to-read-three-card-tarot",
  availableLocales: ["en", "zh"],
  publishedAt: "2026-10-31",
  updatedAt: "2026-10-31",
  // Internal fallbacks do not advertise or create additional language editions.
  translations: { ...translations, "zh-TW": translations.zh, ru: translations.en },
};
