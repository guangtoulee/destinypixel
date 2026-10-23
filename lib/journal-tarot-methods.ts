import type { JournalArticle, JournalTranslation } from "./journal";
import en from "@/content/tarot-methods/en.json";
import zh from "@/content/tarot-methods/zh.json";

export const tarotMethodSlugs = ["how-to-read-celtic-cross", "how-to-keep-tarot-journal"] as const;
export const tarotMethodLocales = ["en", "zh"] as const;

/** Only the two authored editions are advertised or indexed. */
export const tarotMethodArticles: JournalArticle[] = tarotMethodSlugs.map(slug => {
  const translations = { en: en[slug] as JournalTranslation, zh: zh[slug] as JournalTranslation };
  return {
    slug,
    kind: "education",
    availableLocales: tarotMethodLocales,
    publishedAt: "2026-10-23",
    updatedAt: "2026-10-23",
    // These satisfy the internal shape; unsupported editions redirect to English.
    translations: { ...translations, "zh-TW": translations.zh, ru: translations.en },
  };
});
