import type { JournalArticle, JournalTranslation, JournalLocale } from "./journal";
import en from "@/content/tarot-editorial/en.json";
import zh from "@/content/tarot-editorial/zh.json";
import zhTw from "@/content/tarot-editorial/zh-TW.json";
import ru from "@/content/tarot-editorial/ru.json";
import { tarotEducationSlugs, tarotEducationCopy } from "./tarot-editorial/navigation";

const editions = { en, zh, "zh-TW": zhTw, ru };
export const tarotEducationArticles: JournalArticle[] = tarotEducationSlugs.map(slug => ({
  slug, kind: "education", publishedAt: "2026-10-08", updatedAt: "2026-10-08",
  translations: Object.fromEntries((["en", "zh", "zh-TW", "ru"] as const).map((locale: JournalLocale) => {
    const a = editions[locale][slug];
    const copy: JournalTranslation = {
      title: a.title, topic: a.topic, description: a.opening[0], introduction: a.opening[0],
      openingParagraphs: a.opening.slice(1), sections: a.sections,
      action: { label: tarotEducationCopy[locale].practice, href: `/tarot${locale === "en" ? "" : `?locale=${locale}`}` },
    };
    return [locale, copy];
  })) as Record<JournalLocale, JournalTranslation>,
}));
