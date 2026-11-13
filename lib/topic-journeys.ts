import type { ReportLocale } from "./report-i18n";
import { toTraditional } from "./journal-locales";
import { journeyCopy, sectionGuides } from "./section-journeys";
import { directoryTools } from "./tool-directory";

// Primary V2 navigation exposes the six core symbolic realms; "atelier" stays in TopicKey for legacy route compatibility.
export const topicKeys = ["discover", "tarot", "sticks", "astrology", "iching", "compatibility"] as const;
export type TopicKey = (typeof topicKeys)[number] | "atelier";

const en = {
  tarot: {
    name: "Tarot",
    action: "Open the card table",
    next: "Try a three-card reading on the Mountain-Lake table, learn to frame a clear question, then explore relationship themes without treating the cards as a verdict.",
  },
  astrology: {
    name: "Astrology",
    action: "Create my birth chart",
    next: "Read your Sun, Moon and rising signs together, check your birth coordinates, and understand what changes when a birth time is unknown.",
  },
  iching: {
    name: "I Ching",
    action: "Cast six lines",
    next: "Toss three coins or enter your own lines. Compare the original and changed hexagrams, then study the eight trigrams and all 64 hexagrams.",
  },
  functions: "Explore the rest of DestinyPixel",
  functionsIntro: "Move between birth symbolism, Mountain-Lake Tarot, I Ching casting, temple fortune sticks, and two-person compatibility.",
};

const zh: typeof en = {
  tarot: {
    name: "山湖塔罗",
    action: "进入塔罗牌桌",
    next: "从三张牌的实例读起，练习把问题说清楚，再探索关系与抉择主题；牌面是映照心绪的镜子，而非判决。",
  },
  astrology: {
    name: "本命星盘",
    action: "绘制我的出生星盘",
    next: "把太阳、月亮、上升放在一起合参，核对出生经纬与时区，再了解未知时辰会影响哪些宫位判断。",
  },
  iching: {
    name: "易经六爻",
    action: "开始起卦",
    next: "模拟三枚铜钱摇卦或录入已有六爻，核对本卦、动爻与之卦；再深入阅读八卦与六十四卦原文解义。",
  },
  functions: "继续探索全站星历工具",
  functionsIntro: "从六十日柱、本命星盘与几何灵构，到山湖塔罗、六爻起卦、灵签问事与双人合盘，自由切换视角。",
};

const ru: typeof en = {
  tarot: {
    name: "Таро",
    action: "Открыть карточный стол",
    next: "Начните с расклада на три карты, уточните свой вопрос и исследуйте темы выбора и отношений без фатализма.",
  },
  astrology: {
    name: "Натальная карта",
    action: "Построить карту рождения",
    next: "Прочитайте Солнце, Луну и асцендент вместе, проверьте данные рождения и узнайте, что меняется при неизвестном времени.",
  },
  iching: {
    name: "И цзин",
    action: "Построить шесть черт",
    next: "Бросьте три монеты или введите свои черты. Сравните исходную и изменённую гексаграммы, затем изучите восемь триграмм и все 64 гексаграммы.",
  },
  functions: "Другие обсерватории DestinyPixel",
  functionsIntro: "Переходите между столпами дня, натальной астрологией, Таро, гексаграммами И цзин, храмовыми палочками и совместимостью.",
};

export function topicCopy(locale: ReportLocale) {
  const base = journeyCopy(locale);
  const extra =
    locale === "zh-TW"
      ? (JSON.parse(toTraditional(JSON.stringify(zh))) as typeof en)
      : locale === "zh"
        ? zh
        : locale === "ru"
          ? ru
          : en;
  return {
    ...base,
    ...extra,
    sections: {
      ...base.sections,
      tarot: extra.tarot,
      astrology: extra.astrology,
      iching: extra.iching,
    },
  };
}

export const topicGuides: Record<TopicKey, string[]> = {
  ...sectionGuides,
  tarot: ["how-to-read-three-card-tarot", "how-to-ask-fortune-sticks", "yuelao-love-fortune-conversation", "pamela-colman-smith-tarot-artist"],
  astrology: ["sun-moon-rising-signs-explained", "prepare-birth-date-time-place", "compatibility-without-birth-time"],
  iching: [], // Dedicated trigram and hexagram libraries supply this topic's reading links.
};

const russianNames: Record<string, string> = {
  year_2027: "2027 · Your free year ahead (English)",
  astrology: "Карта рождения",
  tarot: "Карточный стол Таро",
  iching: "И цзин · шесть черт",
  compatibility: "Совместимость",
  "birth-map": "Полная карта рождения",
  tuteng: "Тотем рождения",
  "day-pillar": "Бесплатная карточка столпа дня",
  oracle: "Оракул одного вопроса",
  sticks: "Гадательные палочки",
  palm: "Наблюдение за ладонью",
  face: "Наблюдение за лицом",
  atelier: "Мастерская браслетов",
};

export function siteFunctions(locale: ReportLocale, current: TopicKey) {
  const c = topicCopy(locale);
  return [
    { key: "discover", path: "/discover", fragment: "", name: c.sections.discover.name },
    ...directoryTools.map(tool => ({
      key: tool.key,
      path: tool.path,
      fragment: tool.key === "birth-map" ? "#report" : "",
      name:
        locale === "ru"
          ? russianNames[tool.key]
          : locale === "zh-TW"
            ? `${toTraditional(tool.copy.zh.name)}${tool.key === "year_2027" ? "（簡體中文）" : ""}`
            : tool.copy[locale].name,
    })),
  ].filter(tool => tool.key !== current);
}
