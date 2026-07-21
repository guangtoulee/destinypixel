import { contentLocale } from "@/lib/report-i18n";
import type { ReportLocale } from "@/lib/report-i18n";

export type OracleLine = {
  index: number;
  value: 6 | 7 | 8 | 9;
  yang: boolean;
  moving: boolean;
};

export type TarotOrientation = "upright" | "reversed";

export type TarotCard = {
  id: string;
  arcana: "major" | "minor";
  number: string;
  symbol: string;
  en: string;
  zh: string;
  ru: string;
  upright: string;
  reversed: string;
};

export type TarotDraw = TarotCard & {
  orientation: TarotOrientation;
  meaning: string;
};

type Trigram = {
  key: string;
  en: string;
  zh: string;
  ru: string;
};

// Keys are always written from the bottom line upward: line 1, line 2, line 3.
const trigramsByBottomUpBits: Record<string, Trigram> = {
  "111": { key: "qian", en: "Qian / Heaven", zh: "乾 / 天", ru: "Цянь / Небо" },
  "110": { key: "dui", en: "Dui / Lake", zh: "兑 / 泽", ru: "Дуй / Озеро" },
  "101": { key: "li", en: "Li / Fire", zh: "离 / 火", ru: "Ли / Огонь" },
  "100": { key: "zhen", en: "Zhen / Thunder", zh: "震 / 雷", ru: "Чжэнь / Гром" },
  "011": { key: "xun", en: "Xun / Wind", zh: "巽 / 风", ru: "Сюнь / Ветер" },
  "010": { key: "kan", en: "Kan / Water", zh: "坎 / 水", ru: "Кань / Вода" },
  "001": { key: "gen", en: "Gen / Mountain", zh: "艮 / 山", ru: "Гэнь / Гора" },
  "000": { key: "kun", en: "Kun / Earth", zh: "坤 / 地", ru: "Кунь / Земля" },
};

const majorArcana: TarotCard[] = [
  ["fool", "0", "∞", "The Fool", "愚者", "Шут", "a fresh start, openness, a calculated leap", "recklessness, naivety, fear of starting"],
  ["magician", "I", "✦", "The Magician", "魔术师", "Маг", "initiative, skill, turning intent into action", "misused skill, scattered effort, manipulation"],
  ["high-priestess", "II", "☾", "The High Priestess", "女祭司", "Жрица", "intuition, hidden knowledge, patient observation", "ignored intuition, secrecy, emotional withdrawal"],
  ["empress", "III", "♀", "The Empress", "皇后", "Императрица", "growth, care, creativity, material nurture", "overgiving, stagnation, dependence on comfort"],
  ["emperor", "IV", "♔", "The Emperor", "皇帝", "Император", "structure, authority, boundaries, responsibility", "rigidity, control, misuse of authority"],
  ["hierophant", "V", "⚿", "The Hierophant", "教皇", "Иерофант", "tradition, guidance, shared values, learning", "dogma, hollow convention, rebellion without direction"],
  ["lovers", "VI", "♡", "The Lovers", "恋人", "Влюбленные", "alignment, intimacy, a values-based choice", "misalignment, avoidance, an unowned choice"],
  ["chariot", "VII", "↟", "The Chariot", "战车", "Колесница", "direction, disciplined momentum, self-command", "forced progress, aggression, loss of direction"],
  ["strength", "VIII", "♌", "Strength", "力量", "Сила", "courage, calm influence, instinct under control", "self-doubt, suppressed anger, depleted confidence"],
  ["hermit", "IX", "◇", "The Hermit", "隐士", "Отшельник", "reflection, discernment, independent truth", "isolation, overthinking, refusal of useful support"],
  ["wheel", "X", "◎", "Wheel of Fortune", "命运之轮", "Колесо фортуны", "a turning cycle, timing, changing conditions", "resistance to change, repeated patterns, poor timing"],
  ["justice", "XI", "⚖", "Justice", "正义", "Справедливость", "truth, accountability, proportionate consequences", "bias, denial, unfair terms, evasion"],
  ["hanged-man", "XII", "⌁", "The Hanged Man", "倒吊人", "Повешенный", "pause, a new angle, intentional surrender", "needless delay, martyrdom, refusal to reframe"],
  ["death", "XIII", "✕", "Death", "死神", "Смерть", "closure, release, irreversible transformation", "clinging, delayed ending, fear of necessary change"],
  ["temperance", "XIV", "☍", "Temperance", "节制", "Умеренность", "integration, moderation, patient adjustment", "imbalance, excess, incompatible ingredients"],
  ["devil", "XV", "♄", "The Devil", "恶魔", "Дьявол", "attachment, temptation, a visible binding pattern", "breaking a pattern, denial, hidden dependency"],
  ["tower", "XVI", "⌂", "The Tower", "高塔", "Башня", "disruption, exposed weakness, necessary reset", "avoided collapse, prolonged instability, fear of truth"],
  ["star", "XVII", "✶", "The Star", "星星", "Звезда", "renewal, honesty, realistic hope, guidance", "discouragement, weak faith, idealization"],
  ["moon", "XVIII", "☽", "The Moon", "月亮", "Луна", "uncertainty, dreams, intuition, incomplete information", "confusion lifting, self-deception, anxiety"],
  ["sun", "XIX", "☉", "The Sun", "太阳", "Солнце", "clarity, vitality, recognition, open success", "delayed joy, ego glare, unrealistic optimism"],
  ["judgement", "XX", "⌁", "Judgement", "审判", "Суд", "reckoning, awakening, an honest final call", "self-judgment, avoidance, failure to learn"],
  ["world", "XXI", "◉", "The World", "世界", "Мир", "completion, integration, earned expansion", "unfinished business, a missing final step, poor closure"],
].map(([id, number, symbol, en, zh, ru, upright, reversed]) => ({
  id,
  arcana: "major" as const,
  number,
  symbol,
  en,
  zh,
  ru,
  upright,
  reversed,
}));

const suits = [
  {
    id: "wands",
    en: "Wands",
    zh: "权杖",
    ru: "Жезлов",
    symbol: "┃",
    upright: "initiative, ambition, creative action",
    reversed: "delay, impulsiveness, scattered energy, burnout",
  },
  {
    id: "cups",
    en: "Cups",
    zh: "圣杯",
    ru: "Кубков",
    symbol: "♢",
    upright: "emotion, intuition, connection, receptivity",
    reversed: "emotional imbalance, fantasy, suppression, weak boundaries",
  },
  {
    id: "swords",
    en: "Swords",
    zh: "宝剑",
    ru: "Мечей",
    symbol: "⚔",
    upright: "thought, truth, decision, conflict",
    reversed: "confusion, avoidance, harsh thinking, unresolved conflict",
  },
  {
    id: "pentacles",
    en: "Pentacles",
    zh: "星币",
    ru: "Пентаклей",
    symbol: "⬟",
    upright: "resources, work, money, craft, the physical world",
    reversed: "instability, poor planning, overcontrol, material leakage",
  },
] as const;

const ranks = [
  { id: "ace", number: "A", en: "Ace", zh: "王牌", ru: "Туз", upright: "a seed and a clean opening", reversed: "a blocked or mishandled opening" },
  { id: "two", number: "II", en: "Two", zh: "二", ru: "Двойка", upright: "balance, choice, and pairing", reversed: "indecision or unstable balance" },
  { id: "three", number: "III", en: "Three", zh: "三", ru: "Тройка", upright: "growth, cooperation, and first results", reversed: "friction, weak teamwork, or stalled growth" },
  { id: "four", number: "IV", en: "Four", zh: "四", ru: "Четверка", upright: "structure, stability, and consolidation", reversed: "rigidity, restlessness, or a weak foundation" },
  { id: "five", number: "V", en: "Five", zh: "五", ru: "Пятерка", upright: "conflict, loss, and a necessary test", reversed: "recovery, avoidance, or lingering tension" },
  { id: "six", number: "VI", en: "Six", zh: "六", ru: "Шестерка", upright: "support, transition, and restored flow", reversed: "unequal exchange or a delayed transition" },
  { id: "seven", number: "VII", en: "Seven", zh: "七", ru: "Семерка", upright: "assessment, strategy, and a test of position", reversed: "poor strategy, self-doubt, or exposure" },
  { id: "eight", number: "VIII", en: "Eight", zh: "八", ru: "Восьмерка", upright: "movement, repetition, and developing mastery", reversed: "restriction, haste, or wasted effort" },
  { id: "nine", number: "IX", en: "Nine", zh: "九", ru: "Девятка", upright: "near-completion, resilience, and self-possession", reversed: "fatigue, defensiveness, or fragile confidence" },
  { id: "ten", number: "X", en: "Ten", zh: "十", ru: "Десятка", upright: "culmination, consequence, and a full cycle", reversed: "overload, incomplete closure, or a cycle breaking" },
  { id: "page", number: "P", en: "Page", zh: "侍从", ru: "Паж", upright: "learning, a message, and fresh curiosity", reversed: "immaturity, noise, or unreliable news" },
  { id: "knight", number: "N", en: "Knight", zh: "骑士", ru: "Рыцарь", upright: "pursuit, momentum, and committed movement", reversed: "rash pursuit, inconsistency, or stalled action" },
  { id: "queen", number: "Q", en: "Queen", zh: "王后", ru: "Королева", upright: "mature inner command and embodied understanding", reversed: "insecurity, overinvolvement, or distorted care" },
  { id: "king", number: "K", en: "King", zh: "国王", ru: "Король", upright: "authority, responsibility, and outward command", reversed: "domination, poor leadership, or inflexibility" },
] as const;

const minorArcana: TarotCard[] = suits.flatMap((suit) =>
  ranks.map((rank) => ({
    id: `${rank.id}-of-${suit.id}`,
    arcana: "minor" as const,
    number: rank.number,
    symbol: suit.symbol,
    en: `${rank.en} of ${suit.en}`,
    zh: `${suit.zh}${rank.zh}`,
    ru: `${rank.ru} ${suit.ru}`,
    upright: `${rank.upright}; ${suit.upright}`,
    reversed: `${rank.reversed}; ${suit.reversed}`,
  })),
);

export const tarotDeck: TarotCard[] = [...majorArcana, ...minorArcana];

export function hashOracleInput(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function resolveTrigram(linesBottomUp: Array<Pick<OracleLine, "yang">>) {
  const bits = linesBottomUp
    .slice(0, 3)
    .map((line) => (line.yang ? "1" : "0"))
    .join("");

  return trigramsByBottomUpBits[bits] ?? trigramsByBottomUpBits["000"];
}

export function localizeTrigram(trigram: Trigram, locale: ReportLocale) {
  return trigram[contentLocale(locale)];
}

export function localizeTarotCard(card: TarotCard, locale: ReportLocale) {
  return card[contentLocale(locale)];
}

export function castOracle({
  question,
  questionTime,
  birthDate,
  domain,
}: {
  question: string;
  questionTime: string;
  birthDate: string;
  domain: string;
}) {
  const seed = hashOracleInput(`${question}|${questionTime}|${birthDate}|${domain}`);
  const random = seededRandom(seed);
  const lines: OracleLine[] = Array.from({ length: 6 }, (_, index) => {
    const coinTotal = (6 + Number(random() >= 0.5) + Number(random() >= 0.5) + Number(random() >= 0.5)) as 6 | 7 | 8 | 9;

    return {
      index: index + 1,
      value: coinTotal,
      yang: coinTotal % 2 === 1,
      moving: coinTotal === 6 || coinTotal === 9,
    };
  });

  const shuffled = [...tarotDeck];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }

  const tarot: TarotDraw[] = shuffled.slice(0, 3).map((card) => {
    const orientation: TarotOrientation = random() < 0.5 ? "upright" : "reversed";

    return {
      ...card,
      orientation,
      meaning: orientation === "upright" ? card.upright : card.reversed,
    };
  });

  return {
    seed,
    lowerTrigram: resolveTrigram(lines.slice(0, 3)),
    upperTrigram: resolveTrigram(lines.slice(3, 6)),
    lines,
    movingLines: lines.filter((line) => line.moving).map((line) => line.index),
    tarot,
  };
}
