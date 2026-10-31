import type { JournalLocale } from "./journal-locales";
import { tarotLearningId } from "./tarot-learning/paths";
import { hexagramNumber } from "./hexagram-learning/identity";
import { trigramIdFromSlug } from "./trigram-learning/identity";

/** A small editorial taxonomy, shared by every authored language edition.
 * These are subjects of the actual articles, not search-keyword inventories.
 */
export const journalTopicIds = ["tarot-reading", "tarot-history", "iching", "day-pillars", "birth-charts", "bazi", "relationships", "fortune-sticks", "five-elements", "bracelets", "palmistry"] as const;
export type JournalTopic = typeof journalTopicIds[number];
export const journalTopicLabels: Record<JournalLocale, Record<JournalTopic, string>> = {
  en: { "tarot-reading": "Tarot reading", "tarot-history": "Tarot history", iching: "I Ching", "day-pillars": "Day Pillars", "birth-charts": "Birth charts", bazi: "BaZi", relationships: "Relationships", "fortune-sticks": "Fortune sticks", "five-elements": "Five elements", bracelets: "Bracelet design & care", palmistry: "Palmistry" },
  zh: { "tarot-reading": "塔罗解读", "tarot-history": "塔罗历史", iching: "易经", "day-pillars": "日柱", "birth-charts": "出生图谱", bazi: "八字", relationships: "感情与相处", "fortune-sticks": "灵签", "five-elements": "五行", bracelets: "手串设计与养护", palmistry: "手相" },
  "zh-TW": { "tarot-reading": "塔羅解讀", "tarot-history": "塔羅歷史", iching: "易經", "day-pillars": "日柱", "birth-charts": "出生圖譜", bazi: "八字", relationships: "感情與相處", "fortune-sticks": "靈籤", "five-elements": "五行", bracelets: "手串設計與養護", palmistry: "手相" },
  ru: { "tarot-reading": "Чтение Таро", "tarot-history": "История Таро", iching: "И цзин", "day-pillars": "Столпы дня", "birth-charts": "Карта рождения", bazi: "Бацзы", relationships: "Отношения", "fortune-sticks": "Гадательные палочки", "five-elements": "Пять элементов", bracelets: "Дизайн и уход за браслетами", palmistry: "Хиромантия" },
};
export const journalTopicUi = {
  en: { topics: "Article topics", browse: "Browse by topic", intro: "Follow a subject across guides, card meanings and illustrated portraits.", all: "All topics", results: "Articles in this topic", count: (n: number) => `${n} articles`, related: "More on these topics" },
  zh: { topics: "文章主题", browse: "按主题找文章", intro: "从指南、牌义与人物画像中，继续阅读你感兴趣的主题。", all: "全部主题", results: "这个主题的文章", count: (n: number) => `${n} 篇文章`, related: "继续读这些主题" },
  "zh-TW": { topics: "文章主題", browse: "按主題找文章", intro: "從指南、牌義與人物畫像中，繼續閱讀你感興趣的主題。", all: "全部主題", results: "這個主題的文章", count: (n: number) => `${n} 篇文章`, related: "繼續讀這些主題" },
  ru: { topics: "Темы статьи", browse: "Статьи по темам", intro: "Продолжайте изучать тему в руководствах, значениях карт и иллюстрированных портретах.", all: "Все темы", results: "Статьи по этой теме", count: (n: number) => `Статей: ${n}`, related: "Ещё по этим темам" },
};

// Assign secondary subjects only when the article actually develops them.
const guideTopics: Record<string, readonly JournalTopic[]> = {
  "when-one-tarot-suit-dominates": ["tarot-reading"],
  "how-to-read-celtic-cross": ["tarot-reading"],
  "how-to-keep-tarot-journal": ["tarot-reading"],
  "why-the-four-fours-differ": ["tarot-reading"],
  "how-to-connect-three-tarot-cards": ["tarot-reading"],
  "how-to-read-three-card-tarot": ["tarot-reading"],
  "tarot-from-game-to-occult-traditions": ["tarot-history"],
  "pamela-colman-smith-tarot-artist": ["tarot-history"],
  "prepare-birth-date-time-place": ["birth-charts"],
  "sun-moon-rising-signs-explained": ["birth-charts"],
  "compatibility-without-birth-time": ["birth-charts", "relationships"],
  "bazi-vs-chinese-zodiac-compatibility": ["bazi", "relationships", "five-elements"],
  "five-elements-relationship-compatibility": ["relationships", "five-elements"],
  "how-to-ask-fortune-sticks": ["fortune-sticks"],
  "fortune-stick-number-and-edition": ["fortune-sticks"],
  "yuelao-love-fortune-conversation": ["fortune-sticks", "relationships"],
  "five-element-bracelet-design": ["five-elements", "bracelets"],
  "crystal-bracelet-care": ["bracelets"],
  "what-is-a-day-pillar": ["day-pillars"],
  "ben-ming-nian-tai-sui": ["bazi"],
  "what-is-bazi-birth-chart": ["bazi", "birth-charts"],
  "i-ching-vs-tarot": ["iching", "tarot-reading"],
  "guanyin-fortune-sticks": ["fortune-sticks"],
  "bazi-love-compatibility": ["bazi", "relationships"],
  "chinese-palm-reading-vs-western": ["palmistry"],
};
export function journalArticleTopics(article: { slug: string; pillar?: string }): readonly JournalTopic[] {
  if (article.pillar) return ["day-pillars"];
  if (tarotLearningId(article.slug)) return ["tarot-reading"];
  if (hexagramNumber(article.slug) || trigramIdFromSlug(article.slug)) return ["iching"];
  return guideTopics[article.slug] ?? [];
}
/** Palmistry currently has one English-only guide; no translated landing is invented. */
export function journalTopicAvailable(topic: JournalTopic, locale: JournalLocale): boolean {
  return topic !== "palmistry" || locale === "en";
}
export function normalizeJournalTopic(value?: string, locale?: JournalLocale): JournalTopic | undefined {
  return journalTopicIds.find(topic => topic === value && (!locale || journalTopicAvailable(topic, locale)));
}
export function journalTopicHref(locale: JournalLocale, topic?: JournalTopic): string {
  if (topic && !journalTopicAvailable(topic, locale)) topic = undefined;
  const params = new URLSearchParams();
  if (locale !== "en") params.set("locale", locale);
  if (topic) params.set("topic", topic);
  return `/journal${params.size ? `?${params}` : ""}${topic ? "#topic-results" : "#topics"}`;
}
