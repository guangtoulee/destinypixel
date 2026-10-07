import type { ReportLocale } from "./report-i18n";
import { toTraditional } from "./journal-locales";
import { journeyCopy, sectionGuides, sectionKeys } from "./section-journeys";
import { directoryTools } from "./tool-directory";

// The homepage keeps its four editorial cards; navigation also exposes the two studios.
export const topicKeys = [...sectionKeys, "tarot", "astrology"] as const;
export type TopicKey = typeof topicKeys[number];
const en = {
  tarot: { name: "Tarot", action: "Open the card table", next: "Try a three-card reading, learn to frame a useful question, then explore relationship themes without treating the cards as a verdict." },
  astrology: { name: "Astrology", action: "Create my birth chart", next: "Prepare your birth details, explore your own chart, then learn what can and cannot be compared when another person's birth time is unknown." },
  functions: "Explore the rest of DestinyPixel", functionsIntro: "Choose another tool for birth symbolism, reflection or a personal bracelet design.",
};
const zh: typeof en = {
  tarot: { name: "塔罗专题", action: "进入塔罗牌桌", next: "从三张牌的实例读起，练习把问题说清楚，再探索关系主题；牌面不是一段关系的判决。" },
  astrology: { name: "星盘专题", action: "绘制我的出生星盘", next: "先准备出生资料，再读自己的星盘；想比较两个人时，了解未知时辰会影响哪些判断。" },
  functions: "继续探索全站功能", functionsIntro: "从出生意象、问事与自我观察，到亲手设计一串手串，选择下一步。",
};
const ru: typeof en = {
  tarot: { name: "Таро", action: "Открыть карточный стол", next: "Начните с примера расклада на три карты, уточните свой вопрос и исследуйте темы отношений. Карты не выносят приговор отношениям." },
  astrology: { name: "Астрология", action: "Построить карту рождения", next: "Подготовьте данные рождения, изучите свою карту, затем узнайте, что можно сравнить, если время рождения другого человека неизвестно." },
  functions: "Другие возможности DestinyPixel", functionsIntro: "Выберите другой инструмент для изучения символов рождения, размышлений или создания своего браслета.",
};
export function topicCopy(locale: ReportLocale) {
  const base = journeyCopy(locale);
  const extra = locale === "zh-TW" ? JSON.parse(toTraditional(JSON.stringify(zh))) as typeof en : locale === "zh" ? zh : locale === "ru" ? ru : en;
  return { ...base, ...extra, sections: { ...base.sections, tarot: extra.tarot, astrology: extra.astrology } };
}
export const topicGuides: Record<TopicKey, string[]> = {
  ...sectionGuides,
  tarot: ["how-to-read-three-card-tarot", "how-to-ask-fortune-sticks", "yuelao-love-fortune-conversation", "pamela-colman-smith-tarot-artist"],
  astrology: ["prepare-birth-date-time-place", "compatibility-without-birth-time", "bazi-vs-chinese-zodiac-compatibility"],
};
const russianNames: Record<string, string> = {
  astrology: "Карта рождения", tarot: "Карточный стол Таро", compatibility: "Совместимость",
  "birth-map": "Полная карта рождения", tuteng: "Тотем рождения", "day-pillar": "Бесплатная карточка столпа дня",
  oracle: "Оракул одного вопроса", sticks: "Гадательные палочки", palm: "Наблюдение за ладонью",
  face: "Наблюдение за лицом", atelier: "Мастерская браслетов",
};
export function siteFunctions(locale: ReportLocale, current: TopicKey) {
  const c = topicCopy(locale);
  return [
    { key: "discover", path: "/discover", fragment: "", name: c.sections.discover.name },
    ...directoryTools.map(tool => ({
      key: tool.key, path: tool.path, fragment: tool.key === "birth-map" ? "#report" : "",
      name: locale === "ru" ? russianNames[tool.key] : locale === "zh-TW" ? toTraditional(tool.copy.zh.name) : tool.copy[locale].name,
    })),
  ].filter(tool => tool.key !== current);
}
