import type { Gender } from "@/lib/ai/report";

export type ReportGenerationContext = {
  reportId: string;
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
    nameEn: string;
    nameCn: string;
    essenceEn: string;
    careerStyleEn: string;
    wealthEn: string;
    loveModeEn: string;
    growthEn: string;
    healthEn?: string;
  };
  bazi: {
    dayMaster: string;
    mappedPlanet: string;
    mappedPlanetCn: string;
    pillars: {
      year: string;
      month: string;
      day: string;
      hour: string;
    };
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
  return JSON.stringify({
    birth: context.birth,
    gender: context.gender,
    dayPillarArchetype: context.profile,
    bazi: context.bazi,
    astrology: {
      sunSign: `${context.astrology.sunSign} / ${context.astrology.sunSignCn}`,
      placements: context.astrology.placements,
      majorAspects: context.astrology.majorAspects,
    },
  });
}

export function buildNatalMessages(context: ReportGenerationContext): ChatMessage[] {
  return [
    {
      role: "system",
      content: [
        "You are DestinyPixel's senior Bazi x Western Astrology consultant for premium overseas users.",
        "Write in polished professional English with a mysterious but commercially clear tone.",
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
  return [
    {
      role: "system",
      content: [
        "You are DestinyPixel's annual transit strategist.",
        "Write in polished professional English for an overseas paid report.",
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
  return [
    "[DAY_MASTER]",
    `${context.profile.nameEn} is the core archetype of this chart: ${context.profile.essenceEn} The Bazi engine identifies ${context.bazi.pillars.day} as the Day Pillar and ${context.bazi.dayMaster} as the Day Master, while the Western layer places the Sun in ${context.astrology.sunSign}. Read together, this describes a person whose identity is not just a zodiac sign or a pillar label, but a fusion of elemental instinct and planetary self-expression.`,
    "[OUTER_PERSONA]",
    `The heavenly stems form the public face of the chart: ${Object.values(context.bazi.pillars).map((pillar) => pillar[0]).join(", ")}. Your Day Master maps to ${context.bazi.mappedPlanet}, which describes how people first register your will, taste, tempo, and social pressure. This layer is about presentation, ambition, and the way you negotiate visibility.`,
    "[DEEP_SELF]",
    `The earthly branches form the inner weather: ${Object.values(context.bazi.pillars).map((pillar) => pillar[1]).join(", ")}. These animal fields point to memory, instinct, attachment, and the emotional logic beneath your decisions. The strongest insight is to treat the branches as living psychological terrain rather than decorative symbols.`,
    "[LIFE_DIMENSIONS]",
    `Career: ${context.profile.careerStyleEn} Love: ${context.profile.loveModeEn} Growth: ${context.profile.growthEn} Health: ${context.profile.healthEn ?? "Protect rhythm, recovery, and nervous-system bandwidth before chasing peak output."}`,
  ].join("\n\n");
}

export function fallbackTransitText(context: ReportGenerationContext) {
  return [
    "[SPRING]",
    `Spring favors calibration. Start with the Day Master ${context.bazi.dayMaster} and rebuild your rhythm before expanding. Use this season to choose one visible goal, one relationship boundary, and one health habit that can survive pressure.`,
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
