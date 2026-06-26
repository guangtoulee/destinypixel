import type { Gender } from "@/lib/ai/report";
import {
  languagePromptRules,
  outputLanguageNames,
  type ReportLocale,
} from "@/lib/report-i18n";

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
        "Each section should be concise and sharp: about 110-170 English words, equivalent to roughly 160-240 Chinese characters in density.",
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
        "You must use these exact markers and this order: [SPRING], [SUMMER], [AUTUMN], [WINTER].",
        "Each seasonal section must explicitly mention the target year or the active ten-year luck cycle. Do not write generic timeless seasons; the advice must change when the year pillar or ten-year luck changes.",
        "Each seasonal section should be about 90-140 English words, or an equivalent concise length in the requested language, direct, practical, and suitable for typewriter streaming.",
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
      "[SPRING]",
      `${targetYear} 年春季先看 ${currentPillar} 与 ${decade} 的交会。它不是泛泛的新开始，而是从 ${previousYear} 年 ${previousPillar} 留下的惯性里重新定速：先恢复身体秩序，再打开新的目标。`,
      "[SUMMER]",
      `${targetYear} 年夏季强调表达与曝光。${context.profile.displayName} 需要清晰的舞台，但十年大运要求你把能量集中到一个真正能累积影响力的位置，不要分散给太多对象。`,
      "[AUTUMN]",
      `${targetYear} 年秋季适合修正关系、财务和承诺结构。流年干支会把前半年的选择带回现实检验，越是感到沉重，越需要简化规则。`,
      "[WINTER]",
      `${targetYear} 年冬季进入整合。把流年给你的提醒沉淀进 ${decade} 的长期主题里，减少噪音，保存洞察，把有效选择变成系统。`,
    ].join("\n\n");
  }

  if (context.locale === "ru") {
    const currentPillar = luck?.currentYearPillarDisplay ?? "текущий годовой столп";
    const previousPillar = luck?.previousYearPillarDisplay ?? "прошлый годовой столп";
    const decade = activeLuck
      ? `${activeLuck.pillarDisplay} (${activeLuck.startYear}-${activeLuck.endYear})`
      : "текущий десятилетний цикл";

    return [
      "[SPRING]",
      `Весна ${targetYear} года читается через ${currentPillar} и ${decade}. Это не общий сезонный совет: сначала завершите инерцию ${previousYear} года (${previousPillar}), затем восстановите ритм и выберите одну ясную цель.`,
      "[SUMMER]",
      `Лето ${targetYear} года требует выражения. Архетип ${context.profile.displayName} нуждается в сцене, но десятилетний цикл просит не распыляться: выбирайте аудиторию, где вашу ценность легче признать.`,
      "[AUTUMN]",
      `Осень ${targetYear} года проверяет договоренности, деньги и эмоциональные обязательства. Если структура тяжелеет, упрощайте правила, а не усиливайте давление.`,
      "[WINTER]",
      `Зима ${targetYear} года собирает опыт в систему. Верните решения года к теме ${decade}: меньше шума, больше восстановления и более точный выбор темпа.`,
    ].join("\n\n");
  }

  const currentPillar = luck?.currentYearPillarDisplay ?? "the current annual pillar";
  const previousPillar = luck?.previousYearPillarDisplay ?? "last year's pillar";
  const decade = activeLuck
    ? `${activeLuck.pillarDisplay} (${activeLuck.startYear}-${activeLuck.endYear})`
    : "the active ten-year luck cycle";

  return [
    "[SPRING]",
    `Spring ${targetYear} is read through ${currentPillar} and ${decade}. This is not a generic restart: first complete the residue of ${previousYear} (${previousPillar}), then choose one visible goal, one relationship boundary, and one health rhythm that can survive pressure.`,
    "[SUMMER]",
    `Summer ${targetYear} asks for expression. Your ${context.profile.nameEn} archetype needs a clean channel for visibility, creativity, and social signal, but the decade cycle asks you not to scatter yourself. Pick the room where your value is easiest to recognize.`,
    "[AUTUMN]",
    `Autumn ${targetYear} is for editing. Review contracts, money patterns, and emotional obligations through the pressure of the annual pillar. When something feels heavy, simplify the structure before forcing more effort.`,
    "[WINTER]",
    `Winter ${targetYear} brings integration. Return the year's lessons to ${decade}: reduce noise, strengthen recovery, and preserve the choices that kept your destiny legible under pressure.`,
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
        max_tokens: 1700,
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
