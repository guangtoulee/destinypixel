import {
  contentLocale,
  languagePromptRules,
  normalizeReportLocale,
  outputLanguageNames,
  type ContentLocale,
  type ReportLocale,
} from "@/lib/report-i18n";
import {
  getStickSign,
  stickTypeOrder,
  type StickSign,
  type StickType,
} from "@/lib/sticks/catalog";

export type StickInterpretRequestBody = {
  type?: string;
  locale?: string;
  number?: number;
  topic?: string;
  question?: string;
  sign?: StickSign;
};

type ChatMessage = { role: "system" | "user"; content: string };

const stickSectionHeadings: Record<ContentLocale, string[]> = {
  en: [
    "Main sign",
    "What it means for your question",
    "Hidden risk",
    "Best next step",
  ],
  zh: ["主要签意", "对应你的问题", "隐藏风险", "下一步"],
  ru: [
    "Главный знак",
    "Для вашего вопроса",
    "Скрытый риск",
    "Следующий шаг",
  ],
};

export function normalizeStickType(value: unknown): StickType {
  if (typeof value === "string" && stickTypeOrder.includes(value as StickType)) {
    return value as StickType;
  }

  return "guanyin";
}

export function normalizeStickLocale(value: unknown): ReportLocale {
  return normalizeReportLocale(typeof value === "string" ? value : "en");
}

export function normalizeStickNumber(value: unknown, type: StickType) {
  const parsed = Number(value);
  const total = getStickSign(type, 1, "en").total;

  if (!Number.isFinite(parsed)) return 1;
  return Math.min(Math.max(Math.round(parsed), 1), total);
}

export function buildStickMessages({
  locale,
  type,
  sign,
  topic,
  question,
}: {
  locale: ReportLocale;
  type: StickType;
  sign: StickSign;
  topic: string;
  question: string;
}): ChatMessage[] {
  const languageRule = languagePromptRules[locale];
  const sectionHeadings = stickSectionHeadings[contentLocale(locale)];

  return [
    {
      role: "system",
      content: [
        "You are DestinyPixel's temple-stick interpretation consultant.",
        languageRule,
        `The final output language is ${outputLanguageNames[locale]}.`,
        "Write in plain, conversational language. Be direct and practical, not mystical fog.",
        "Use the supplied stick system, stick number, traditional verse or source note, user's topic, and user's question.",
        "If the traditional verse is marked as pending verification, be honest: say the interpretation is based on the stick number, theme, and user's question rather than a fully verified verse.",
        "Do not guarantee outcomes, medical recovery, legal success, investment profit, pregnancy, death, disaster, or fixed fate.",
        "Include about 20-30% constructive-negative content: what may be wrong, delayed, unrealistic, or self-deceptive.",
        "Return plain text only. No Markdown symbols, no tables.",
        `Use these exact section headings and no other headings: ${sectionHeadings.join(" / ")}.`,
        "Do not translate the section headings into any other language.",
        "Each section should be 90-160 Chinese characters or 70-120 English/Russian words. Keep it useful and specific.",
      ].join(" "),
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          type,
          outputLanguage: outputLanguageNames[locale],
          topic,
          question,
          sign,
          safety:
            "Symbolic reflective reading only. User keeps responsibility for choices.",
        },
        null,
        2,
      ),
    },
  ];
}

export function fallbackStickText({
  locale,
  sign,
  topic,
  question,
}: {
  locale: ReportLocale;
  sign: StickSign;
  topic: string;
  question: string;
}) {
  if (contentLocale(locale) === "zh") {
    return [
      "主要签意",
      `${sign.title} 的核心提示是：先看手里已经出现的条件，再判断下一步。${sign.plain}`,
      "对应你的问题",
      `你问的是「${question || topic || "当前这件事"}」。这支签不鼓励只凭情绪冲动推进，它更像让你把事实、资源、对方态度和自己的真实承受力重新摆到桌面上。`,
      "隐藏风险",
      "最大的问题不是完全没机会，而是你可能把希望投射到不够稳定的人或条件上。若细节反复变化、成本越来越高、对方只给口头承诺，就要谨慎。",
      "下一步",
      sign.advice,
    ].join("\n\n");
  }

  if (locale === "ru") {
    return [
      "Главный знак",
      `${sign.title}: ${sign.plain}`,
      "Для вашего вопроса",
      `Ваш вопрос: ${question || topic || "эта ситуация"}. Знак просит не давить эмоцией, а проверить факты, ресурсы и реальную готовность другой стороны.`,
      "Скрытый риск",
      "Риск не в полном отсутствии шанса, а в том, что вы можете вложить надежду в нестабильные условия.",
      "Следующий шаг",
      sign.advice,
    ].join("\n\n");
  }

  return [
    "Main sign",
    `${sign.title}: ${sign.plain}`,
    "What it means for your question",
    `Your question is: ${question || topic || "this situation"}. The sign asks you to check facts, available resources, and the other side's reliability before pushing harder.`,
    "Hidden risk",
    "The risk is not that nothing can work. The risk is investing hope into unstable conditions or unclear promises.",
    "Best next step",
    sign.advice,
  ].join("\n\n");
}
