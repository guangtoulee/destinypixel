import type { JournalLocale } from "@/lib/journal-locales";
import catalog from "./catalog.json";

export const tarotEducationSlugs = ["why-the-four-fours-differ", "how-to-connect-three-tarot-cards", "tarot-from-game-to-occult-traditions"] as const;
export const tarotEditorialSlugs = ["tarot-sun", ...tarotEducationSlugs] as const;
export const tarotEditorialCatalog = (locale: JournalLocale) => catalog[locale];
export const tarotEducationCopy = {
  en: { title: "Explore tarot", intro: "Look closely at the images, connect a reading, and discover how tarot's traditions developed.", related: "Continue exploring", cards: "Cards in this article", practice: "Try the tarot table", all: "All articles", sun: "A closer look at the Sun" },
  zh: { title: "塔罗科普", intro: "细看图像，学习连读，也了解塔罗传统怎样形成。", related: "延伸阅读", cards: "文中相关牌", practice: "到塔罗桌练习", all: "全部文章", sun: "深入阅读太阳牌" },
  "zh-TW": { title: "塔羅科普", intro: "細看圖像，學習連讀，也了解塔羅傳統怎樣形成。", related: "延伸閱讀", cards: "文中相關牌", practice: "到塔羅桌練習", all: "全部文章", sun: "深入閱讀太陽牌" },
  ru: { title: "Знакомство с Таро", intro: "Рассмотрите изображения, соедините карты в чтение и узнайте, как складывались традиции Таро.", related: "Читайте дальше", cards: "Карты из статьи", practice: "Попробовать стол Таро", all: "Все статьи", sun: "Подробно о Солнце" },
};
export const editorialCardIds: Record<string, string[]> = {
  "why-the-four-fours-differ": ["four-of-wands", "four-of-cups", "four-of-swords", "four-of-pentacles"],
  "how-to-connect-three-tarot-cards": ["eight-of-pentacles", "four-of-cups", "three-of-pentacles"],
};
export function relatedEditorialSlugs(slug: string): readonly (typeof tarotEditorialSlugs[number])[] {
  if (tarotEditorialSlugs.some(s => s === slug)) return tarotEditorialSlugs.filter(s => s !== slug);
  if (slug === "how-to-read-three-card-tarot") return ["how-to-connect-three-tarot-cards"];
  if (slug === "pamela-colman-smith-tarot-artist") return ["tarot-from-game-to-occult-traditions"];
  const id = slug.replace(/^tarot-/, "");
  return tarotEducationSlugs.filter(s => editorialCardIds[s]?.includes(id));
}
