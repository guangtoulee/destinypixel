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
        "Write with a mysterious but commercially clear tone.",
        "Use the supplied Bazi and astrology context only. Do not invent houses, medical diagnoses, fixed events, or guaranteed outcomes.",
        "Return plain text only. No Markdown, no JSON, no bullets unless a section asks for compact dimensions.",
        "You must use these exact markers and this order: [DAY_MASTER], [OUTER_PERSONA], [DEEP_SELF], [LIFE_DIMENSIONS].",
        "Each section should be concise and sharp: about 150-220 English words, equivalent to roughly 200-300 Chinese characters in density.",
        "Life Dimensions must include compact labeled insights for Career, Love, Growth, and Health.",
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
        "Write for an overseas paid report with direct, practical guidance.",
        "Use the natal Bazi and astrology context as the anchor. Do not invent exact future events, medical claims, lottery/investment promises, or fear-based predictions.",
        "Return plain text only. No Markdown and no JSON.",
        "You must use these exact markers and this order: [SPRING], [SUMMER], [AUTUMN], [WINTER].",
        "Each seasonal section should be about 120-170 English words, direct, practical, and suitable for typewriter streaming.",
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
      "[LIFE_DIMENSIONS]",
      "事业：寻找可复利的专业位置。感情：重视边界与稳定沟通。成长：训练薄弱元素对应的心理肌肉。健康：优先保护作息、恢复力与情绪节律。",
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
      "[LIFE_DIMENSIONS]",
      "Карьера: выбирайте роль с накопительным эффектом. Любовь: держите ясные границы. Рост: тренируйте слабые стихии как психологические мышцы. Здоровье: берегите сон, восстановление и эмоциональный ритм.",
    ].join("\n\n");
  }

  return [
    "[DAY_MASTER]",
    `${context.profile.displayName} is the core archetype of this chart: ${context.profile.essenceEn} The Bazi engine identifies ${context.profile.pillarDisplay} as the Day Pillar and ${context.bazi.dayMasterDisplay} as the Day Master, while the Western layer places the Sun in ${context.astrology.sunSign}.`,
    "[OUTER_PERSONA]",
    `The heavenly stems form the public face of the chart: ${Object.values(context.bazi.pillarsDisplay).map((pillar) => pillar.stemLabel).join(", ")}. Your Day Master maps to ${context.bazi.mappedPlanetDisplay}, which describes how people first register your will, taste, tempo, and social pressure.`,
    "[DEEP_SELF]",
    `The earthly branches form the inner weather: ${Object.values(context.bazi.pillarsDisplay).map((pillar) => pillar.totemName).join(", ")}. These animal fields point to memory, instinct, attachment, and the emotional logic beneath your decisions.`,
    "[LIFE_DIMENSIONS]",
    `Career: ${context.profile.careerStyleEn} Love: ${context.profile.loveModeEn} Growth: ${context.profile.growthEn} Health: ${context.profile.healthEn ?? "Protect rhythm, recovery, and nervous-system bandwidth before chasing peak output."}`,
  ].join("\n\n");
}

export function fallbackTransitText(context: ReportGenerationContext) {
  if (context.locale === "zh") {
    return [
      "[SPRING]",
      `春季适合校准节奏。以 ${context.bazi.dayMasterDisplay} 为核心，先恢复身体秩序，再打开新的目标。`,
      "[SUMMER]",
      `夏季强调表达。${context.profile.displayName} 需要清晰的舞台，但不要把能量分散给太多对象。`,
      "[AUTUMN]",
      "秋季适合修正关系、财务和承诺结构。越是感到沉重，越需要简化规则。",
      "[WINTER]",
      "冬季进入整合。减少噪音，保存洞察，把一年里真正有效的选择沉淀为长期系统。",
    ].join("\n\n");
  }

  if (context.locale === "ru") {
    return [
      "[SPRING]",
      `Весна подходит для настройки ритма. Начните с дневного мастера ${context.bazi.dayMasterDisplay} и восстановите порядок до расширения.`,
      "[SUMMER]",
      `Лето требует выражения. Архетип ${context.profile.displayName} нуждается в ясной сцене, но не в рассеивании энергии.`,
      "[AUTUMN]",
      "Осень создана для редактирования договоренностей, денег и эмоциональных обязательств. Если что-то тяжелеет, упрощайте структуру.",
      "[WINTER]",
      "Зима приносит интеграцию. Сократите шум, восстановите силы и превратите инсайты года в устойчивую систему.",
    ].join("\n\n");
  }

  return [
    "[SPRING]",
    `Spring favors calibration. Start with the Day Master ${context.bazi.dayMasterDisplay} and rebuild your rhythm before expanding. Use this season to choose one visible goal, one relationship boundary, and one health habit that can survive pressure.`,
    "[SUMMER]",
    `Summer asks for expression. Your ${context.profile.nameEn} archetype needs a clean channel for visibility, creativity, and social signal. Do not scatter energy across too many audiences; pick the room where your value is easiest to recognize.`,
    "[AUTUMN]",
    `Autumn is for editing. Review contracts, money patterns, and emotional obligations. The branch layer suggests that your unconscious timing matters: when something feels heavy, simplify the structure before forcing more effort.`,
    "[WINTER]",
    `Winter brings integration. Reduce noise, strengthen recovery, and preserve the insight gained through the year. The best transit work is not prediction; it is learning which choices keep your destiny legible under pressure.`,
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
