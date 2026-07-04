import type { ReportLocale } from "@/lib/report-i18n";

export type StickType = "guanyin" | "guandi" | "yuelao" | "wealth" | "huangdaxian";

export type StickSign = {
  type: StickType;
  number: number;
  total: number;
  level: string;
  title: string;
  poem: string;
  plain: string;
  advice: string;
  sourceNote: string;
  isSeeded: boolean;
};

export const stickTypeOrder: StickType[] = [
  "guanyin",
  "guandi",
  "yuelao",
  "wealth",
  "huangdaxian",
];

export const stickTypeTotals: Record<StickType, number> = {
  guanyin: 100,
  guandi: 100,
  yuelao: 60,
  wealth: 60,
  huangdaxian: 100,
};

type LocalizedSeed = Record<
  ReportLocale,
  {
    level: string;
    title: string;
    poem: string;
    plain: string;
    advice: string;
    sourceNote: string;
  }
>;

const seeds: Partial<Record<StickType, Record<number, LocalizedSeed>>> = {
  guanyin: {
    33: {
      zh: {
        level: "中签",
        title: "石中藏玉",
        poem:
          "石藏无价玉和珍，只管他乡外客寻。宛如持灯更觅火，不如收拾枉劳心。",
        plain:
          "这支签的核心不是“没有宝”，而是宝物就在近处，只是你把注意力放到了远方。若问合作、感情或事业，先检查自己已经拥有的资源、关系和方案，不要舍近求远。",
        advice:
          "先暂停盲目外求。把现有线索重新整理一遍，尤其是身边的人、已有方案和被你忽略的旧资源。",
        sourceNote: "观音灵签第 33 签常见传统签诗；不同庙本可能有细微字句差异。",
      },
      en: {
        level: "Middle",
        title: "Jade Hidden In Stone",
        poem:
          "Precious jade is hidden in the stone; the seeker keeps searching far away. Carrying a lamp while looking for fire only wastes the heart.",
        plain:
          "The sign does not say the treasure is absent. It says the useful answer is already near you, but your attention is looking too far away.",
        advice:
          "Stop expanding the search for a moment. Re-check existing contacts, old plans, and resources you already control.",
        sourceNote:
          "Traditional Guanyin Stick 33 theme; wording varies across temple editions.",
      },
      ru: {
        level: "Средний",
        title: "Нефрит скрыт в камне",
        poem:
          "Драгоценный нефрит спрятан в камне; ищущий смотрит вдаль. Нести фонарь и искать огонь — пустая трата сердца.",
        plain:
          "Знак не говорит, что ценности нет. Он говорит, что ответ ближе, чем кажется, а внимание уходит слишком далеко.",
        advice:
          "Остановите внешний поиск и заново проверьте старые связи, планы и ресурсы, которые уже у вас есть.",
        sourceNote:
          "Традиционная тема 33-го жребия Гуаньинь; формулировки отличаются по храмовым версиям.",
      },
    },
  },
  guandi: {
    33: {
      zh: {
        level: "中平",
        title: "庄子慕道",
        poem:
          "不分南北与西东，眼底昏昏耳似聋。熟读黄庭经一卷，不论贵贱与穷通。",
        plain:
          "这签不太鼓励立刻争胜。它更像提醒你：眼前局面混杂，判断力容易被名利、面子或急躁带偏。先回到原则，再谈推进。",
        advice:
          "事业与合作上先把规则、责任、底线写清楚。若对方只给情绪或口头承诺，不要急着投入资源。",
        sourceNote: "关帝灵签第 33 签“庄子慕道”传统签诗样本；庙本可能略有差异。",
      },
      en: {
        level: "Steady",
        title: "Zhuangzi Seeks The Way",
        poem:
          "North, south, east, and west become unclear; the eyes are dim and the ears seem blocked. Return to the inner classic before judging rank, gain, or loss.",
        plain:
          "This sign is not about rushing to win. It warns that the field is noisy and judgment can be bent by status, pride, or impatience.",
        advice:
          "Clarify rules, responsibility, and bottom lines before moving resources. Do not trust only verbal enthusiasm.",
        sourceNote:
          "Traditional Guandi Stick 33 theme; wording varies across temple editions.",
      },
      ru: {
        level: "Ровно",
        title: "Чжуан-цзы ищет путь",
        poem:
          "Север, юг, восток и запад смешались; глаза мутны, уши словно глухи. Вернись к внутреннему канону, прежде чем судить о выгоде.",
        plain:
          "Знак не поддерживает спешную победу. Поле шумное, а суждение легко искажают статус, гордость или нетерпение.",
        advice:
          "Перед вложением ресурсов проясните правила, ответственность и границы. Одного энтузиазма мало.",
        sourceNote:
          "Традиционная тема 33-го жребия Гуаньди; храмовые тексты могут отличаться.",
      },
    },
  },
  yuelao: {
    33: {
      zh: {
        level: "上吉",
        title: "可以托付",
        poem:
          "可以托六尺之孤，可以寄百里之命，临大节而不可夺也。君子人与？君子人也。",
        plain:
          "这支签重在“可信”。若问感情，不是只看心动，而是看对方能否在关键时刻守信、承担、稳定地站在你这边。",
        advice:
          "不要只问对方爱不爱，要观察对方是否可靠、是否愿意承担现实责任。能托付，才值得推进。",
        sourceNote: "月老灵签第 33 签常见引文；源出传统经典语句，庙本解法有差异。",
      },
      en: {
        level: "Good",
        title: "Worthy Of Trust",
        poem:
          "One may entrust an orphan to such a person, entrust a distant command, and not be moved from integrity at the critical moment.",
        plain:
          "For love, this sign is not just about attraction. It asks whether the person can be trusted when reality becomes inconvenient.",
        advice:
          "Watch reliability, responsibility, and consistency. Do not advance a relationship on chemistry alone.",
        sourceNote:
          "Traditional Yuelao Stick 33 theme from a classical saying; interpretations vary.",
      },
      ru: {
        level: "Хорошо",
        title: "Достоин доверия",
        poem:
          "Такому человеку можно доверить сироту и дальнее поручение; в важный момент его честность не отнять.",
        plain:
          "В любви знак говорит не только о влечении, а о доверии, ответственности и устойчивости в неудобной реальности.",
        advice:
          "Смотрите на надежность и готовность брать ответственность. Одной химии недостаточно.",
        sourceNote:
          "Традиционная тема 33-го жребия Юэлао из классического изречения; толкования различаются.",
      },
    },
  },
  huangdaxian: {
    33: {
      zh: {
        level: "中吉",
        title: "孔明借东风",
        poem:
          "万事俱备欠东风，机缘未至勿强攻。若得天时相助力，转危成势一帆通。",
        plain:
          "这签讲的是条件快齐了，但还差一个关键时机。你不是完全没机会，而是现在硬推容易消耗，等到外部条件配合时会顺很多。",
        advice:
          "先补齐准备，不要急着宣布胜负。等关键人、关键消息或关键窗口出现，再果断行动。",
        sourceNote:
          "黄大仙签第 33 签常见题名为“孔明借东风”；此处为基于传统题名整理的签意样本，全文仍建议后续按庙本校对。",
      },
      en: {
        level: "Good",
        title: "Zhuge Liang Borrows The East Wind",
        poem:
          "Everything is ready except the east wind. Do not attack before the timing arrives; with the right wind, danger turns into momentum.",
        plain:
          "The sign says the opportunity is real, but one key condition is not yet in place. Forcing it too early wastes energy.",
        advice:
          "Prepare quietly. Wait for the key person, message, or timing window, then move decisively.",
        sourceNote:
          "Common Wong Tai Sin Stick 33 title; text here is an internally normalized interpretation and should be temple-edition checked later.",
      },
      ru: {
        level: "Хорошо",
        title: "Чжугэ Лян занимает восточный ветер",
        poem:
          "Все готово, не хватает восточного ветра. Не атакуйте до срока; с верным ветром опасность станет движением.",
        plain:
          "Возможность реальна, но ключевое условие еще не сложилось. Если давить раньше времени, силы уйдут впустую.",
        advice:
          "Готовьтесь спокойно. Ждите нужного человека, сообщения или окна времени, затем действуйте решительно.",
        sourceNote:
          "Распространенное название 33-го жребия Вонг Тай Сина; текст нормализован внутри и требует сверки с храмовой версией.",
      },
    },
  },
  wealth: {
    33: {
      zh: {
        level: "中吉",
        title: "守库生财",
        poem:
          "财帛入门莫贪多，先收旧账再开河。若能守正分轻重，细水长流胜急波。",
        plain:
          "财神签第 33 签偏向稳财，不偏向暴利。它提醒你：钱不是没有机会，而是先要堵住漏洞、收回旧账、稳定现金流。",
        advice:
          "先做预算、回款、成本控制，再谈扩张。短期高回报的诱惑要谨慎，尤其不要借钱冒进。",
        sourceNote:
          "财神签没有唯一通行庙本，此为 DestinyPixel 财运签库的内部签文样本。",
      },
      en: {
        level: "Good",
        title: "Guard The Storehouse",
        poem:
          "Do not chase more money before old accounts are gathered. Guard the right order; a steady stream beats a violent wave.",
        plain:
          "This wealth sign favors cash-flow repair over fast profit. Opportunity exists, but leaks must be closed first.",
        advice:
          "Budget, collect receivables, reduce waste, and avoid borrowing for aggressive expansion.",
        sourceNote:
          "The wealth-stick system is not a single canonical temple set; this is DestinyPixel's internal wealth oracle text.",
      },
      ru: {
        level: "Хорошо",
        title: "Охранять кладовую",
        poem:
          "Не гонитесь за большим доходом, пока старые счета не собраны. Верный порядок и тихий поток лучше резкой волны.",
        plain:
          "Денежный знак поддерживает восстановление потока, а не риск ради быстрой прибыли. Сначала закройте утечки.",
        advice:
          "Составьте бюджет, соберите долги, уменьшите лишние расходы и не расширяйтесь на заемные деньги.",
        sourceNote:
          "Система денежных жребиев не имеет единого канонического храмового набора; это внутренний текст DestinyPixel.",
      },
    },
  },
};

const fallbackLevels: Record<ReportLocale, string[]> = {
  en: ["Great Blessing", "Good", "Steady", "Blocked", "Wait"],
  zh: ["上吉", "中吉", "中平", "小阻", "待时"],
  ru: ["Большая удача", "Хорошо", "Ровно", "Препятствие", "Ждать"],
};

function fallbackText(type: StickType, number: number, locale: ReportLocale) {
  const level = fallbackLevels[locale][number % fallbackLevels[locale].length];

  if (locale === "zh") {
    return {
      level,
      title: `第 ${number} 签`,
      poem: "此签原文正在整理校对中，可先按签种、签号与问题生成临时解读。",
      plain:
        "这个签号已可检索，但传统签诗全文还没有录入。你可以先用它作为签号锚点，让 AI 结合你的问题给出临时分析；后续补齐签库后会显示正式签文。",
      advice:
        "若你手里有线下签文，可以把原文粘贴到问题里，AI 会结合原文和你的具体问题一起解读。",
      sourceNote: "签文待人工校对录入。",
    };
  }

  if (locale === "ru") {
    return {
      level,
      title: `Stick ${number}`,
      poem:
        "The original verse for this number is still being checked. You can use the number as an anchor for an AI interpretation.",
      plain:
        "This stick number is searchable, but the verified traditional verse has not been entered yet.",
      advice:
        "If you have the offline verse, paste it into your question so the AI can read it with your situation.",
      sourceNote: "Traditional verse pending manual verification.",
    };
  }

  return {
    level,
    title: `Stick ${number}`,
    poem:
      "The original verse for this number is still being checked. You can use the number as an anchor for an AI interpretation.",
    plain:
      "This stick number is searchable, but the verified traditional verse has not been entered yet.",
    advice:
      "If you have the offline verse, paste it into your question so the AI can read it with your situation.",
    sourceNote: "Traditional verse pending manual verification.",
  };
}

export function getStickSign(
  type: StickType,
  number: number,
  locale: ReportLocale,
): StickSign {
  const total = stickTypeTotals[type];
  const safeNumber = Math.min(Math.max(Math.round(number), 1), total);
  const seeded = seeds[type]?.[safeNumber]?.[locale];
  const sign = seeded ?? fallbackText(type, safeNumber, locale);

  return {
    type,
    number: safeNumber,
    total,
    ...sign,
    isSeeded: Boolean(seeded),
  };
}
