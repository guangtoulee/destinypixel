import type { Gender } from "@/lib/ai/report";
import {
  languagePromptRules,
  outputLanguageNames,
  type ReportLocale,
} from "@/lib/report-i18n";
import {
  getTransitMonthDisplay,
  transitMonthSections,
  transitPromptMarkers,
} from "@/lib/report-timing";

export type ReportGenerationContext = {
  reportId: string;
  locale: ReportLocale;
  gender: Gender;
  birth: {
    name: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    trueSolarTime: string;
  };
  profile: {
    pillar: string;
    pillarDisplay: string;
    nameEn: string;
    nameCn: string;
    displayName: string;
    essenceEn: string;
    careerStyleEn: string;
    wealthEn: string;
    loveModeEn: string;
    growthEn: string;
    healthEn?: string;
  };
  bazi: {
    dayMaster: string;
    dayMasterDisplay: string;
    mappedPlanet: string;
    mappedPlanetCn: string;
    mappedPlanetDisplay: string;
    pillars: {
      year: string;
      month: string;
      day: string;
      hour: string;
    };
    pillarsDisplay: Record<
      "year" | "month" | "day" | "hour",
      {
        pillarLabel: string;
        stemLabel: string;
        branchLabel: string;
        stemMeaning: string;
        branchMeaning: string;
        totemName: string;
        animal: string;
        pinyin: string;
        roleTitle: string;
        roleMicroBadge: string;
      }
    >;
    elementBalance: Record<string, number>;
    missingElements: string[];
    tenGods: unknown;
    luck?: {
      targetYear: number;
      previousYear: number;
      currentYearPillar: string;
      previousYearPillar: string;
      currentYearPillarDisplay: string;
      previousYearPillarDisplay: string;
      direction: "forward" | "reverse";
      directionLabel: string;
      startAge: number;
      startYear: number;
      calculationNote: string;
      tenYearLuck: Array<{
        index: number;
        pillar: string;
        pillarDisplay: string;
        startAge: number;
        endAge: number;
        startYear: number;
        endYear: number;
      }>;
      activeTenYearLuck?: {
        index: number;
        pillar: string;
        pillarDisplay: string;
        startAge: number;
        endAge: number;
        startYear: number;
        endYear: number;
      };
    };
  };
  astrology: {
    sunSign: string;
    sunSignCn: string;
    placements: Array<{
      body: string;
      bodyCn: string;
      sign: string;
      signCn: string;
      degreeInSign: number;
      longitude: number;
    }>;
    majorAspects: Array<{
      bodies: [string, string];
      type: string;
      orb: number;
    }>;
  };
};

const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL ??
  "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

type ChatMessage = { role: "system" | "user"; content: string };

function shortContext(context: ReportGenerationContext) {
  const nonChineseContext = context.locale !== "zh";

  return JSON.stringify({
    outputLanguage: outputLanguageNames[context.locale],
    birth: context.birth,
    gender: context.gender,
    dayPillarArchetype: {
      pillar: nonChineseContext ? context.profile.pillarDisplay : context.profile.pillar,
      name: context.profile.displayName,
      essence: context.profile.essenceEn,
      careerStyle: context.profile.careerStyleEn,
      wealthSignal: context.profile.wealthEn,
      relationshipMode: context.profile.loveModeEn,
      growth: context.profile.growthEn,
      health: context.profile.healthEn,
    },
    bazi: nonChineseContext
      ? {
          dayMaster: context.bazi.dayMasterDisplay,
          mappedPlanet: context.bazi.mappedPlanetDisplay,
          pillars: context.bazi.pillarsDisplay,
          elementBalance: context.bazi.elementBalance,
          missingElements: context.bazi.missingElements,
          luck: context.bazi.luck,
          tenGods:
            "Calculated internally; use displayed stem and branch roles without Chinese characters.",
        }
      : context.bazi,
    astrology: {
      sunSign:
        context.locale === "zh"
          ? `${context.astrology.sunSignCn}/${context.astrology.sunSign}`
          : context.astrology.sunSign,
      placements: context.astrology.placements.map((placement) => ({
        body: placement.body,
        sign: placement.sign,
        degreeInSign: placement.degreeInSign,
        longitude: placement.longitude,
      })),
      majorAspects: context.astrology.majorAspects,
    },
    annualTimingWindows: transitMonthSections.map((section) => {
      const display = getTransitMonthDisplay(section, context.locale);

      return {
        marker: section.marker,
        title: display.title,
        range: display.range,
        note:
          context.locale === "zh"
            ? "按中国节气月令理解这个时间窗。"
            : context.locale === "ru"
              ? "Используй это как примерное григорианское временное окно."
              : "Use this as an approximate Gregorian timing window.",
      };
    }),
  });
}

export function buildNatalMessages(context: ReportGenerationContext): ChatMessage[] {
  const languageRule = languagePromptRules[context.locale];

  return [
    {
      role: "system",
      content: [
        "You are DestinyPixel's senior Bazi x Western Astrology consultant for premium overseas users.",
        languageRule,
        `The final output language is ${outputLanguageNames[context.locale]}. Except for the required ASCII section markers, every visible word must follow that language.`,
        "Write with a mysterious but commercially clear tone.",
        "Use the supplied Bazi and astrology context only. Do not invent houses, medical diagnoses, fixed events, or guaranteed outcomes.",
        "Return plain text only. No Markdown, no JSON, no bullets unless a section asks for compact dimensions.",
        "You must use these exact markers and this order: [DAY_MASTER], [OUTER_PERSONA], [DEEP_SELF], [CAREER], [LOVE], [GROWTH], [HEALTH].",
        "Each section should feel like a premium life-book chapter: about 260-360 English words, equivalent to roughly 420-620 Chinese characters in density.",
        "Write each section as 2-3 short paragraphs separated by blank lines. The first paragraph is the core verdict, the middle paragraph is concrete analysis, and the final paragraph is practical guidance.",
        "Every section must include at least two concrete anchors from the supplied Bazi/energy structure and astrology context, then end with practical psychological guidance.",
        "Career, Love, Growth, and Health are separate modules. Do not merge them into one paragraph.",
      ].join(" "),
    },
    {
      role: "user",
      content: `Context: ${shortContext(context)}`,
    },
  ];
}

export function buildTransitMessages(
  context: ReportGenerationContext,
): ChatMessage[] {
  const languageRule = languagePromptRules[context.locale];

  return [
    {
      role: "system",
      content: [
        "You are DestinyPixel's annual transit strategist.",
        languageRule,
        `The final output language is ${outputLanguageNames[context.locale]}. Except for the required ASCII section markers, every visible word must follow that language.`,
        "Write for an overseas paid report with direct, practical guidance.",
        "Use the natal Bazi and astrology context as the anchor. Transit timing must be based on context.bazi.luck, especially targetYear, currentYearPillar, previousYearPillar, and activeTenYearLuck. Do not invent exact future events, medical claims, lottery/investment promises, or fear-based predictions.",
        "Return plain text only. No Markdown and no JSON.",
        `You must use these exact markers and this order: ${transitPromptMarkers.map((marker) => `[${marker}]`).join(", ")}.`,
        "[OVERVIEW] is the annual overview. It should be about 260-360 English words, or 420-620 Chinese characters, and must explicitly name the active ten-year luck cycle, target year, previous year residue, and the main psychological strategy for the year.",
        "The twelve MONTH sections are not generic seasons. They are solar-term/monthly timing windows. For Chinese output, write them as solar-term months; for English or Russian output, use the approximate Gregorian date range from annualTimingWindows.",
        "Each MONTH section should be concise but substantial: about 90-130 English words, or 150-230 Chinese characters. Use 2 short paragraphs separated by a blank line: first a concrete timing judgment, then practical guidance.",
        "Every MONTH section must feel different. Mention either the target year, the active ten-year luck cycle, the annual pillar, the prior-year residue, or the supplied planetary resonance. Avoid repeating the same advice.",
        "Keep the first sentence useful immediately so streaming feels responsive before the full section finishes.",
      ].join(" "),
    },
    {
      role: "user",
      content: `Context: ${shortContext(context)}`,
    },
  ];
}

export function fallbackNatalText(context: ReportGenerationContext) {
  if (context.locale === "zh") {
    return [
      "[DAY_MASTER]",
      `${context.profile.displayName} 是这张命盘的核心原型。日柱为 ${context.profile.pillarDisplay}，日主为 ${context.bazi.dayMasterDisplay}，太阳星座为 ${context.astrology.sunSignCn}。`,
      "[OUTER_PERSONA]",
      `天干层描述外在形象与社会节奏。日主映射星体为 ${context.bazi.mappedPlanetDisplay}，它显示你被他人看见时的气场、欲望与行动方式。`,
      "[DEEP_SELF]",
      `地支层来自四个动物场域：${Object.values(context.bazi.pillarsDisplay).map((pillar) => pillar.totemName).join("、")}。它们揭示潜意识、依恋模式与本能反应。`,
      "[CAREER]",
      `事业适合寻找可复利的专业位置，并把 ${context.bazi.mappedPlanetDisplay} 的驱力转成稳定输出。`,
      "[LOVE]",
      "感情需要重视边界与稳定沟通，不要让敏感度替代理性确认。",
      "[GROWTH]",
      "成长重点是训练薄弱元素对应的心理肌肉，把直觉转化为可执行的节奏。",
      "[HEALTH]",
      "健康侧重作息、恢复力与情绪节律；任何身体问题都应以专业医疗建议为准。",
    ].join("\n\n");
  }

  if (context.locale === "ru") {
    return [
      "[DAY_MASTER]",
      `${context.profile.displayName} — ядро этой карты. Дневной столп: ${context.profile.pillarDisplay}; дневной мастер: ${context.bazi.dayMasterDisplay}; солнечный знак: ${context.astrology.sunSign}.`,
      "[OUTER_PERSONA]",
      `Небесные стволы описывают внешний образ и социальный ритм. Планета дневного мастера — ${context.bazi.mappedPlanetDisplay}; она показывает, как вас считывают другие люди.`,
      "[DEEP_SELF]",
      `Земные ветви образуют внутреннее поле: ${Object.values(context.bazi.pillarsDisplay).map((pillar) => pillar.totemName).join(", ")}. Это слой инстинкта, памяти и привязанности.`,
      "[CAREER]",
      `Карьера требует роли с накопительным эффектом, где импульс ${context.bazi.mappedPlanetDisplay} становится устойчивым вкладом.`,
      "[LOVE]",
      "Любовь выигрывает от ясных границ, честного темпа сближения и спокойной проверки ожиданий.",
      "[GROWTH]",
      "Рост начинается с тренировки слабых стихий как психологических мышц: через привычки, выбор и повторение.",
      "[HEALTH]",
      "Здоровье связано с восстановлением, сном и эмоциональным ритмом; это не медицинский диагноз.",
    ].join("\n\n");
  }

  return [
    "[DAY_MASTER]",
    `${context.profile.displayName} is the core archetype of this chart: ${context.profile.essenceEn} The Bazi engine identifies ${context.profile.pillarDisplay} as the Day Pillar and ${context.bazi.dayMasterDisplay} as the Day Master, while the Western layer places the Sun in ${context.astrology.sunSign}.`,
    "[OUTER_PERSONA]",
    `The heavenly stems form the public face of the chart: ${Object.values(context.bazi.pillarsDisplay).map((pillar) => pillar.stemLabel).join(", ")}. Your Day Master maps to ${context.bazi.mappedPlanetDisplay}, which describes how people first register your will, taste, tempo, and social pressure.`,
    "[DEEP_SELF]",
    `The earthly branches form the inner weather: ${Object.values(context.bazi.pillarsDisplay).map((pillar) => pillar.totemName).join(", ")}. These animal fields point to memory, instinct, attachment, and the emotional logic beneath your decisions.`,
    "[CAREER]",
    context.profile.careerStyleEn,
    "[LOVE]",
    context.profile.loveModeEn,
    "[GROWTH]",
    context.profile.growthEn,
    "[HEALTH]",
    context.profile.healthEn ??
      "Protect rhythm, recovery, and nervous-system bandwidth before chasing peak output.",
  ].join("\n\n");
}

export function fallbackTransitText(context: ReportGenerationContext) {
  const luck = context.bazi.luck;
  const targetYear = luck?.targetYear ?? new Date().getFullYear();
  const previousYear = luck?.previousYear ?? targetYear - 1;
  const activeLuck = luck?.activeTenYearLuck;

  if (context.locale === "zh") {
    const currentPillar = luck?.currentYearPillarDisplay ?? "当前流年";
    const previousPillar = luck?.previousYearPillarDisplay ?? "去年流年";
    const decade = activeLuck
      ? `${activeLuck.pillarDisplay}（${activeLuck.startYear}-${activeLuck.endYear}）`
      : "当前十年大运";

    return [
      "[OVERVIEW]",
      `${targetYear} 年的年度节奏，要放在 ${decade} 的长周期里看。${currentPillar} 不是孤立的一年，它会承接 ${previousYear} 年 ${previousPillar} 留下的惯性，把你推到一个需要重新分配体力、关系、金钱和注意力的位置。此处的重点不是追逐热闹，而是判断哪些选择真正能进入长期结构。`,
      `对 ${context.profile.displayName} 而言，今年最重要的策略是把敏感度变成秩序，把灵感变成可复用的方法。每个月的节气月令会像一条细密的时间线，提醒你什么时候启动，什么时候收束，什么时候该把外部机会转回内在修复。`,
      ...transitMonthSections.flatMap((section, index) => {
        const display = getTransitMonthDisplay(section, context.locale);
        const tone = index < 3 ? "启动与试探" : index < 6 ? "表达与承压" : index < 9 ? "修正与筛选" : "沉淀与整合";

        return [
          `[${section.marker}]`,
          `${display.title}（${display.range}）进入 ${tone} 的窗口。${currentPillar} 与 ${decade} 会把这一段时间的主题落到具体生活里：你需要观察自己是在主动选择，还是被外界节奏牵着走。`,
          `建议把本月当作一个小型实验：只保留最关键的目标、最必要的关系沟通和最能恢复体力的习惯。不要为了证明自己而扩大消耗，把有效选择写下来，月底再复盘它是否真的让你更稳定。`,
        ];
      }),
    ].join("\n\n");
  }

  if (context.locale === "ru") {
    const currentPillar = luck?.currentYearPillarDisplay ?? "текущий годовой столп";
    const previousPillar = luck?.previousYearPillarDisplay ?? "прошлый годовой столп";
    const decade = activeLuck
      ? `${activeLuck.pillarDisplay} (${activeLuck.startYear}-${activeLuck.endYear})`
      : "текущий десятилетний цикл";

    return [
      "[OVERVIEW]",
      `${targetYear} год читается через ${currentPillar} и ${decade}. Это не изолированный год: он завершает инерцию ${previousYear} года (${previousPillar}) и показывает, где нужно беречь силы, деньги, внимание и отношения.`,
      `Для архетипа ${context.profile.displayName} главный ход года — превратить чувствительность в порядок, а интуицию в повторяемую практику. Месячные окна ниже помогают увидеть, когда начинать, когда редактировать выбор и когда возвращаться к восстановлению.`,
      ...transitMonthSections.flatMap((section, index) => {
        const display = getTransitMonthDisplay(section, context.locale);
        const tone =
          index < 3
            ? "запуска"
            : index < 6
              ? "проявления"
              : index < 9
                ? "отбора"
                : "интеграции";

        return [
          `[${section.marker}]`,
          `${display.title} открывает окно ${tone}. Свяжите этот период с годовым полем ${targetYear} и циклом ${decade}: задача месяца — понять, где вы выбираете осознанно, а где просто реагируете на чужой темп.`,
          "Практически стоит оставить одну главную цель, один честный разговор и один ритм восстановления. В конце месяца проверьте, стало ли больше устойчивости, ясности и внутреннего согласия.",
        ];
      }),
    ].join("\n\n");
  }

  const currentPillar = luck?.currentYearPillarDisplay ?? "the current annual pillar";
  const previousPillar = luck?.previousYearPillarDisplay ?? "last year's pillar";
  const decade = activeLuck
    ? `${activeLuck.pillarDisplay} (${activeLuck.startYear}-${activeLuck.endYear})`
    : "the active ten-year luck cycle";

  return [
    "[OVERVIEW]",
    `${targetYear} is read through ${currentPillar} and ${decade}. This is not a generic annual forecast: it carries the residue of ${previousYear} (${previousPillar}) into a year where attention, money, relationships, and body rhythm need cleaner allocation.`,
    `For the ${context.profile.nameEn} archetype, the central strategy is to turn sensitivity into structure and intuition into repeatable practice. The monthly windows below show when to initiate, when to edit, and when to return to recovery before pressure becomes waste.`,
    ...transitMonthSections.flatMap((section, index) => {
      const display = getTransitMonthDisplay(section, context.locale);
      const tone =
        index < 3
          ? "initiation"
          : index < 6
            ? "expression"
            : index < 9
              ? "refinement"
              : "integration";

      return [
        `[${section.marker}]`,
        `${display.title} opens a ${tone} window. Read this period through ${targetYear} and ${decade}: the useful question is where you are making a clear choice, and where you are simply reacting to someone else's speed.`,
        "Keep one primary goal, one honest conversation, and one recovery rhythm. At the end of the window, review whether your choices created more steadiness, clearer value, and less emotional leakage.",
      ];
    }),
  ].join("\n\n");
}

function fallbackStream(text: string) {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

export async function streamDeepSeekText({
  messages,
  fallbackText,
}: {
  messages: ChatMessage[];
  fallbackText: string;
}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return fallbackStream(fallbackText);
  }

  try {
    const upstreamController = new AbortController();
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        temperature: 0.42,
        max_tokens: Number(process.env.DEEPSEEK_STREAM_MAX_TOKENS ?? 5200),
        stream: true,
        messages,
      }),
      cache: "no-store",
      signal: upstreamController.signal,
    });

    if (!response.ok || !response.body) {
      return fallbackStream(fallbackText);
    }

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const reader = response.body.getReader();
    let isCancelled = false;

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done || isCancelled) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();

              if (!trimmed.startsWith("data:")) continue;

              const data = trimmed.slice(5).trim();
              if (data === "[DONE]") continue;

              try {
                const payload = JSON.parse(data) as {
                  choices?: Array<{ delta?: { content?: string } }>;
                };
                const content = payload.choices?.[0]?.delta?.content;

                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch {
                continue;
              }
            }
          }
        } catch {
          if (!isCancelled) {
            controller.enqueue(encoder.encode(`\n\n${fallbackText}`));
          }
        } finally {
          if (!isCancelled) {
            controller.close();
          }
          reader.releaseLock();
        }
      },
      async cancel() {
        isCancelled = true;
        upstreamController.abort();

        try {
          await reader.cancel();
        } catch {
          // The upstream reader may already be closed by the platform.
        }
      },
    });
  } catch {
    return fallbackStream(fallbackText);
  }
}
