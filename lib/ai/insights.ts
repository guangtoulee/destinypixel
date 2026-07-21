import {
  languagePromptRules,
  normalizeReportLocale,
  outputLanguageNames,
  type ReportLocale,
} from "@/lib/report-i18n";

export type InsightMode = "palm" | "face" | "oracle";

export type InsightRequestBody = {
  mode: InsightMode;
  locale?: string;
  payload?: Record<string, unknown>;
};

type ChatMessage = { role: "system" | "user"; content: string };

export function normalizeInsightMode(value: unknown): InsightMode {
  if (value === "face" || value === "oracle" || value === "palm") return value;

  return "palm";
}

export function normalizeInsightLocale(value: unknown): ReportLocale {
  return normalizeReportLocale(typeof value === "string" ? value : "en");
}

const symbolicReference = {
  palm: {
    frame:
      "Read the palm as a symbolic map of temperament, stress pattern, affection style, decision rhythm, work endurance, and recovery needs.",
    anchors:
      "Use major lines (heart, head, life, fate), hand side, palm texture, finger proportion, mounts, and special markings. Do not make medical, legal, fertility, lifespan, or guaranteed event claims.",
    method:
      "The uploaded/selfie image is only a local reference preview. The model receives only the user's confirmed observations, so phrase analysis as 'from the confirmed palm signs'.",
  },
  face: {
    frame:
      "Read the face as a symbolic and conversational reflection of expression, emotional habits, social presentation, pressure response, and relationship style.",
    anchors:
      "Use three zones (forehead/midface/lower face), five features (brows, eyes, nose, mouth, jaw), symmetry, tension, expression, and user-confirmed notes. Avoid protected traits, identity, ethnicity, age guessing, attractiveness scoring, health diagnosis, or criminality claims.",
    method:
      "The uploaded/selfie image is only a local reference preview. The model receives only user-confirmed observations, so never claim to directly see the photo.",
  },
  oracle: {
    frame:
      "One question, one reading. Combine a time-cast six-line hexagram pattern with a three-card tarot spread to create a practical decision mirror.",
    anchors:
      "Use the six lines strictly from bottom (line 1) to top (line 6). Coin totals 6 and 8 are yin, 7 and 9 are yang; 6 and 9 are moving lines. Read lines 1-3 as the lower trigram and lines 4-6 as the upper trigram. Use each tarot card's exact full-deck name, spread role, upright/reversed orientation, and supplied orientation keywords.",
    method:
      "Give a clear tendency, conditions, timing window, risk, and next action. Avoid absolute guarantees, lottery claims, medical/legal certainty, or fear-based predictions.",
  },
} satisfies Record<InsightMode, { frame: string; anchors: string; method: string }>;

const modeLabels: Record<InsightMode, Record<ReportLocale, string>> = {
  palm: {
    en: "Palm Reading Studio",
    zh: "手相专区",
    ru: "Студия хиромантии",
  },
  face: {
    en: "Face Reading Studio",
    zh: "面相专区",
    ru: "Студия чтения лица",
  },
  oracle: {
    en: "Question Oracle",
    zh: "问事专区",
    ru: "Оракул вопроса",
  },
};

const outputInstructions: Record<InsightMode, string[]> = {
  palm: [
    "Use these exact section headers in the target language: Main verdict, Personality pattern, Relationship pattern, Work and money rhythm, Hidden risk, Practical adjustment.",
    "Each section should be oral, direct, and detailed: 120-180 Chinese characters or 90-130 English/Russian words.",
    "Include 20-30% constructive-negative content: likely blind spots, emotional habits, money leaks, over-giving, avoidance, or poor timing.",
    "Do not teach palmistry terminology for its own sake. Use technical terms only when they support a clear conclusion.",
  ],
  face: [
    "Use these exact section headers in the target language: Main verdict, Social impression, Inner pressure pattern, Relationship communication, Career expression, Practical adjustment.",
    "Each section should be oral, direct, and detailed: 120-180 Chinese characters or 90-130 English/Russian words.",
    "Include 20-30% constructive-negative content: defensive expression, people-pleasing, rigid presentation, emotional leakage, or weak boundaries.",
    "Do not infer identity, ethnicity, age, health, beauty level, morality, or criminality. This is symbolic reflection, not biometric judgment.",
  ],
  oracle: [
    "Use these exact section headers in the target language: Direct answer, Hexagram signal, Tarot mirror, Hidden risk, Best timing, Action plan.",
    "Each section should be oral, direct, and detailed: 120-180 Chinese characters or 90-130 English/Russian words.",
    "Give a clear tendency rather than vague comfort. Say what should be done, avoided, delayed, or verified.",
    "Mention both the six-line/time-cast signal and all three tarot cards. Respect every card's upright or reversed orientation; never silently flip, replace, or redraw a card. Do not guarantee outcomes.",
  ],
};

export function buildInsightMessages({
  mode,
  locale,
  payload,
}: {
  mode: InsightMode;
  locale: ReportLocale;
  payload: Record<string, unknown>;
}): ChatMessage[] {
  const reference = symbolicReference[mode];
  const languageRule = languagePromptRules[locale];

  return [
    {
      role: "system",
      content: [
        `You are DestinyPixel's ${modeLabels[mode][locale]} consultant.`,
        languageRule,
        `The final output language is ${outputLanguageNames[locale]}.`,
        "Your style is warm, oral, specific, and direct. You are allowed to be constructively sharp; avoid empty Barnum-effect comfort.",
        "Return plain text only. Do not use Markdown syntax, hash headings, bold markers, tables, or bullet lists. Section headings must be bare text lines.",
        "Do not pretend to see an image. If the user uploaded or captured a photo, it was used only as a local preview reference; you only receive confirmed observations and structured inputs.",
        reference.frame,
        reference.anchors,
        reference.method,
        ...outputInstructions[mode],
      ].join(" "),
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          mode,
          outputLanguage: outputLanguageNames[locale],
          confirmedInputs: payload,
          safety:
            "This is a reflective symbolic reading for entertainment, self-observation, and practical decision support, not medical, legal, financial, or psychological diagnosis.",
        },
        null,
        2,
      ),
    },
  ];
}

export function fallbackInsightText({
  mode,
  locale,
  payload,
}: {
  mode: InsightMode;
  locale: ReportLocale;
  payload: Record<string, unknown>;
}) {
  if (locale === "zh") {
    if (mode === "oracle") {
      return [
        "直接答案",
        "这件事现在不适合只凭情绪推进。时间卦和塔罗的共同指向是：先把问题缩小，再做一次现实验证。你真正要问的不是“会不会成”，而是“我现在有没有足够条件承接它”。",
        "卦象信号",
        `你起问的时间是 ${String(payload.questionTime ?? "当前时间")}。六爻结构显示这件事有推进力，但中间层有阻滞，说明人、资源或信息并没有完全对齐。先处理卡住的那一环，结果会比硬推更稳。`,
        "塔罗镜像",
        "三张牌更像一个提醒：现状有欲望，阻碍是判断不够冷静，建议是先拿到可验证信息。不要被一句承诺、一个情绪高点或短期利益带走。",
        "行动计划",
        "接下来三天内只做一件事：列出最关键的事实证据。七到十四天内再做决定。若对方回避细节、时间反复变化，或者成本持续增加，就先暂停。",
      ].join("\n\n");
    }

    if (mode === "face") {
      return [
        "主要结论",
        "从你确认的面部观察点看，你给人的第一印象不是单纯温和，而是带着判断和自我保护。优势是有分寸，短板是别人可能觉得你不容易靠近。",
        "社交印象",
        "如果眉眼或下颌线条偏紧，你在压力下会先控制表情，而不是表达需求。这会让你显得可靠，但也容易把不满压到后面一次性爆发。",
        "关系沟通",
        "你需要练习更早说出真实想法。不要等到情绪满格才沟通，那时别人听到的是攻击，不是需求。",
        "实操调整",
        "照片只能帮助你回看结构和神态，不能代替真实相处。接下来可以试着在重要关系里提前说一句：我现在需要确认一件事。",
      ].join("\n\n");
    }

    return [
      "主要结论",
      "从你确认的手相观察点看，你的能量不是一路外放型，而是需要先建立安全感再持续输出。优点是耐力和感受力，问题是容易把消耗当成责任。",
      "性格模式",
      "如果智慧线较长或掌纹细密，你会习惯反复思考，做事不算鲁莽，但也容易因为想太多错过最佳启动点。你的直觉需要配合行动节奏，否则会变成内耗。",
      "关系模式",
      "感情线若偏弯或有细碎干扰，说明你对关系中的细节很敏感。优势是会照顾人，风险是对方一句话就能影响你的状态。",
      "实操调整",
      "接下来最该练的是边界和节奏。把你愿意付出的范围说清楚，把不能承受的消耗提前停下，这比继续忍耐更能改善运势。",
    ].join("\n\n");
  }

  if (locale === "ru") {
    return [
      "Главный вывод",
      "По подтвержденным признакам это чтение показывает не судьбу как приговор, а ваш текущий способ реагировать на давление. Сильная сторона — чувствительность к деталям; риск — расходовать силы там, где нужна граница.",
      "Практический вывод",
      "Сначала проверьте факты, затем действуйте. Если ситуация требует от вас постоянного угадывания чужих мотивов, сделайте паузу и запросите ясность.",
    ].join("\n\n");
  }

  return [
    "Main verdict",
    "Based on the confirmed signals, this is not a fixed fate reading. It is a practical mirror for how you handle pressure, attachment, decision speed, and recovery. The strength is sensitivity to detail; the risk is spending energy where a boundary is needed.",
    "Practical adjustment",
    "Do not move only because the moment feels charged. Confirm the facts, reduce the question to one next action, and watch whether the other side brings clarity or keeps you guessing.",
  ].join("\n\n");
}
