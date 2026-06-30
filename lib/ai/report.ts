import type { AstroData } from "@/lib/engines/astrology";
import type { BaziData } from "@/lib/engines/bazi";
import { elementLabelsCn } from "@/lib/engines/bazi";
import type { PillarProfile } from "@/lib/pillars";
import {
  languagePromptRules,
  outputLanguageNames,
  planetLabels,
  type ReportLocale,
  zodiacLabels,
} from "@/lib/report-i18n";
import { getPillarDisplay, pillarOrder } from "@/lib/bazi-totems";

const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL ?? "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = "deepseek-v4-flash";
const DEFAULT_TIMEOUT_MS = 18_000;
const MIN_SECTION_CHARACTERS = 80;
const TARGET_SECTION_CHARACTERS = "250-300";

export type Gender = "male" | "female";

export type NatalBookSections = {
  dayMaster: string;
  outerPersona: string;
  deepSelf: string;
  career: string;
  love: string;
  growth: string;
  health: string;
};

export type AIReportSections = {
  character: string;
  wealth: string;
  transits: string;
};

export type AIReportContent = AIReportSections & {
  natalBook?: NatalBookSections;
  meta: {
    provider: "deepseek" | "initial" | "unavailable";
    model: string;
    generatedAt: string;
    gender?: Gender;
    locale?: ReportLocale;
    error?: string;
  };
};

type LegacyAIReportContent = {
  headline?: string;
  personality?: string;
  wealth?: string;
  timing?: string;
  synthesis?: string;
};

type DeepSeekChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const systemPrompt = `
你是 DestinyPixel 的命理融合解读师，擅长把中国八字与西方占星翻译成现代、清晰、可执行的自我洞察。

请提供精炼、一针见血的命理洞察。每个板块（性格、财富、流年）控制在 ${TARGET_SECTION_CHARACTERS} 字左右，直接给核心结论、短板风险和实操建议，去掉无意义的铺垫、讨好式赞美和啰嗦的文学描写。

规则：
1. 只能基于用户提供的 Context 写作，不编造不存在的宫位、相位、疾病、投资收益或确定事件。
2. 底层可以读取日主、四柱、十神和五行，但输出给用户时不要讲课，不要写“乙木强弱”“十神关系”等术语。把技术信息翻译成五行（金木水火土）、动物原型、行为模式、关系风险、财富方式和阶段建议。
3. 占星侧至少引用太阳星座、映射星体或主要相位中的关键点，但不要写成星座泛泛描述。
4. Bazi 与 Astrology 底层独立，只在解读层做交集和互补。
5. 语言要专业、克制、直接，不要玄虚恐吓，不要宿命论，不要巴纳姆效应式废话。每个板块必须有 20%-30% 的建设性负面判断：盲区、误判、拖延、过度消耗、关系投射、赚钱风险或自我欺骗。
6. 只能返回合法 JSON 对象，不能有 Markdown，不能有代码块，不能有额外解释。
7. JSON 必须且只能包含三个字符串字段：{ "character": "...", "wealth": "...", "transits": "..." }。
`.trim();

function formatElementBalance(bazi: BaziData) {
  return Object.entries(bazi.elementBalance).map(([element, value]) => ({
    element,
    elementCn: elementLabelsCn[element as keyof typeof elementLabelsCn],
    score: value,
  }));
}

function formatTenGods(bazi: BaziData) {
  return {
    stems: Object.fromEntries(
      Object.entries(bazi.tenGods.stems).map(([key, value]) => [
        key,
        `${value.stem}${value.tenGod}`,
      ]),
    ),
    hiddenStems: Object.fromEntries(
      Object.entries(bazi.tenGods.hiddenStems).map(([key, values]) => [
        key,
        values.map((value) => `${value.branch}${value.stem}${value.tenGod}`),
      ]),
    ),
  };
}

function buildDeepSeekContext({
  bazi,
  astro,
  profile,
  gender,
  locale,
}: {
  bazi: BaziData;
  astro: AstroData;
  profile: PillarProfile;
  gender?: Gender;
  locale?: ReportLocale;
}) {
  const mappedPlacement = astro.placements.find(
    (placement) => placement.body === bazi.mappedPlanet,
  );

  return {
    reportLanguage: locale ?? "zh",
    product: "DestinyPixel Bazi x Astrology Fusion Report",
    gender: gender ?? "unspecified",
    fusionRule:
      "底层八字与星盘独立计算；这里只做前端/报告层的交集、共振与互补解读。",
    bazi: {
      dayMaster: bazi.dayMaster,
      mappedPlanet: `${bazi.dayMaster}=${bazi.mappedPlanetCn}/${bazi.mappedPlanet}`,
      pillars: bazi.pillars,
      dayPillarArchetype: {
        pillar: bazi.pillars.day,
        nameCn: profile.name.cn,
        nameEn: profile.name.en,
        essence: profile.essence.cn,
        careerStyle: profile.career.style.cn,
        wealthSignal: profile.career.wealth.cn,
        relationshipMode: profile.love.mode.cn,
        growth: profile.growth.cn,
      },
      elementBalance: formatElementBalance(bazi),
      missingElements: bazi.missingElements.map(
        (element) => elementLabelsCn[element],
      ),
      tenGods: formatTenGods(bazi),
      luck: bazi.luck,
      trueSolarTime: bazi.trueSolarTime,
    },
    astrology: {
      ephemerisMode: astro.ephemerisMode,
      sunSign: `${astro.sunSignCn}/${astro.sunSign}`,
      mappedPlanetPlacement: mappedPlacement
        ? `${mappedPlacement.bodyCn}/${mappedPlacement.body} in ${mappedPlacement.signCn}/${mappedPlacement.sign} ${mappedPlacement.degreeInSign}°`
        : "No exact placement found for mapped planet",
      placements: astro.placements.map((placement) => ({
        body: `${placement.bodyCn}/${placement.body}`,
        sign: `${placement.signCn}/${placement.sign}`,
        degreeInSign: placement.degreeInSign,
        longitude: placement.longitude,
      })),
      majorAspects: astro.majorAspects,
    },
  };
}

function parseJsonObject(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error("DeepSeek response did not contain a JSON object.");
    }

    return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
  }
}

function validateSections(value: unknown): AIReportSections {
  if (!value || typeof value !== "object") {
    throw new Error("DeepSeek response JSON is not an object.");
  }

  const candidate = value as Partial<Record<keyof AIReportSections, unknown>>;

  return {
    character: requireSectionText(candidate.character, "character"),
    wealth: requireSectionText(candidate.wealth, "wealth"),
    transits: requireSectionText(candidate.transits, "transits"),
  };
}

function requireSectionText(value: unknown, key: keyof AIReportSections) {
  if (typeof value !== "string") {
    throw new Error(`DeepSeek response missing valid "${key}" text.`);
  }

  const text = value.trim();

  if (text.length < MIN_SECTION_CHARACTERS) {
    throw new Error(
      `DeepSeek response "${key}" is too short: ${text.length}/${MIN_SECTION_CHARACTERS} characters.`,
    );
  }

  return text;
}

async function callDeepSeek({
  apiKey,
  context,
  signal,
  retryReason,
}: {
  apiKey: string;
  context: unknown;
  signal: AbortSignal;
  retryReason?: string;
}) {
  const requestedLocale =
    typeof context === "object" &&
    context !== null &&
    "reportLanguage" in context &&
    (context as { reportLanguage?: ReportLocale }).reportLanguage
      ? (context as { reportLanguage: ReportLocale }).reportLanguage
      : "zh";
  const languageRule = languagePromptRules[requestedLocale];
  const outputLanguage = outputLanguageNames[requestedLocale];

  return fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      temperature: retryReason ? 0.35 : 0.45,
      max_tokens: 1500,
      response_format: { type: "json_object" },
      stream: false,
      messages: [
        {
          role: "system",
          content: `${systemPrompt}\n\n输出语言规则：${languageRule}`,
        },
        {
          role: "user",
          content: JSON.stringify({
            context,
            writingContract: {
              language: outputLanguage,
              outputOnly: "strict-json",
              keys: ["character", "wealth", "transits"],
              targetLengthPerKey: `${TARGET_SECTION_CHARACTERS} characters in ${outputLanguage}`,
              minimumLengthPerKey: `${MIN_SECTION_CHARACTERS} characters in ${outputLanguage}`,
              qualityBar:
                "线上快速版报告：读取底层命理数据，但对用户只输出结论、五行倾向、星体锚点、风险提醒和行动建议；不要写教学式术语。",
            },
            retryInstruction: retryReason
              ? `上一轮输出未通过后台质量检查：${retryReason}。请重新生成严格 JSON，每个字段控制在 ${TARGET_SECTION_CHARACTERS} 个字符左右，并严格遵守输出语言规则。`
              : undefined,
          }),
        },
      ],
    }),
    cache: "no-store",
    signal,
  });
}

async function requestDeepSeekReport(context: unknown): Promise<AIReportSections> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured.");
  }

  const controller = new AbortController();
  const timeoutMs = Number(process.env.DEEPSEEK_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let lastValidationError = "";

    for (let attempt = 0; attempt < 1; attempt += 1) {
      const response = await callDeepSeek({
        apiKey,
        context,
        signal: controller.signal,
        retryReason: lastValidationError || undefined,
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(
          `DeepSeek request failed with ${response.status}: ${detail.slice(0, 240)}`,
        );
      }

      const payload = (await response.json()) as DeepSeekChatResponse;
      const content = payload.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("DeepSeek response did not include message content.");
      }

      try {
        return validateSections(parseJsonObject(content));
      } catch (error) {
        lastValidationError =
          error instanceof Error ? error.message : "Unknown validation failure.";
      }
    }

    throw new Error(lastValidationError || "DeepSeek response failed validation.");
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`DeepSeek request timed out after ${timeoutMs}ms.`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function fallbackSections({
  bazi,
  astro,
  profile,
  reason,
}: {
  bazi: BaziData;
  astro: AstroData;
  profile: PillarProfile;
  reason: string;
}): AIReportSections {
  const missing = bazi.missingElements
    .map((element) => elementLabelsCn[element])
    .join("、");
  const mappedPlacement = astro.placements.find(
    (placement) => placement.body === bazi.mappedPlanet,
  );
  const elementSummary = formatElementBalance(bazi)
    .map((item) => `${item.elementCn}${item.score}`)
    .join("、");
  const tenGodSummary = Object.entries(formatTenGods(bazi).stems)
    .map(([key, value]) => `${key}:${value}`)
    .join("；");
  const aspectSummary =
    astro.majorAspects.length > 0
      ? astro.majorAspects
          .map(
            (aspect) =>
              `${aspect.bodies.join("-")} ${aspect.type} orb ${aspect.orb}`,
          )
          .join("；")
      : "当前近似星历没有抓到强相位，解读会更重视太阳星座、十大星体落座与日主映射星体。";
  const mappedSignal = mappedPlacement
    ? `${mappedPlacement.bodyCn}${mappedPlacement.body}落在${mappedPlacement.signCn}${mappedPlacement.degreeInSign}度`
    : `${bazi.mappedPlanetCn}暂无精确落座`;

  return {
    character: [
      `命理特征点：DeepSeek 本轮没有完成长文生成，原因是：${reason}。但底层命盘已经完成计算：四柱为年柱${bazi.pillars.year}、月柱${bazi.pillars.month}、日柱${bazi.pillars.day}、时柱${bazi.pillars.hour}，日主为${bazi.dayMaster}，对应天干星体为${bazi.mappedPlanetCn}/${bazi.mappedPlanet}。你的日柱动物原型是${profile.name.cn}，其核心气质为“${profile.essence.cn}”。五行分布为${elementSummary}，${missing ? `暂缺${missing}` : "没有明显空缺"}；天干十神结构为${tenGodSummary}。占星层面，太阳落在${astro.sunSignCn}，${mappedSignal}，主要相位线索为${aspectSummary}。`,
      `心理动力分析：这个组合的重点不是把八字和星盘机械相加，而是看“日主如何被星体语言翻译”。${bazi.dayMaster}日主把人格核心放在细腻的自我调节、环境感知与生存策略上；${profile.name.cn}又让这种核心带有一种先观察、再靠近、再表达的节奏。太阳${astro.sunSignCn}会把自我认同推向更大的情绪场或意义场，使你不太适合只用直线效率衡量自己。若五行中存在缺口，它不会说明你“缺少某种命运”，而更像一种心理肌肉需要后天训练：缺的元素越明显，越容易在压力下变成盲区，也越容易通过星盘中的对应星体与相位找到补偿路径。`,
      `给用户的实操建议：在 DeepSeek 长文恢复前，你可以先把这份盘当作“自我校准地图”使用：第一，观察自己在压力下更像日主、太阳星座，还是映射星体在说话；第二，把五行最弱的部分转成生活训练，例如缺火则练习表达欲和决定速度，缺金则练习边界、规则和复盘，缺土则练习稳定节律，缺木则练习生长计划，缺水则练习情绪流动与直觉记录；第三，把${profile.name.cn}的成长方向“${profile.growth.cn}”作为未来三个月的行为主题。重新提交后，系统会继续尝试生成付费级深度 AI 解读。`,
    ].join("\n\n"),
    wealth: [
      `命理特征点：财富模式首先看日主、十神和五行结构。此盘日主${bazi.dayMaster}，四柱${Object.values(bazi.pillars).join("、")}，五行分布${elementSummary}，${missing ? `缺口集中在${missing}` : "五行没有明显断裂"}。十神天干结构为${tenGodSummary}，这决定了你获取资源时更依赖主动开拓、专业输出、关系协作、规则体系，还是长期蓄积。占星层面，太阳${astro.sunSignCn}说明你赚钱时不能只追求数字，还会被意义感、身份认同和情绪投入影响；${mappedSignal}则提示你的财富选择会受更深层的欲望、安全感或控制感牵引。`,
      `心理动力分析：财富不是单纯的“能不能赚”，而是你如何理解价值、如何承担风险、如何把天赋变成可交换的东西。若命局中水势较强，你往往有敏锐的信息嗅觉和情绪识别力，适合在内容、咨询、审美、策略、研究、跨文化沟通等领域建立优势；若火或金不足，则可能出现“想得很深但出手慢”“感受很准但定价不够硬”的问题。星盘主要相位会进一步说明你是通过扩张、合作、技术、表达还是长期结构来放大收益。没有强相位时，反而要回到最朴素的节律：你的资源来自可持续的个人系统，而不是一次爆发。`,
      `给用户的实操建议：你可以把财富策略拆成三层：第一层是稳定现金流，用最不消耗心神的技能换取基本安全感；第二层是可复利资产，包括作品、专业名声、客户关系、方法论和数据沉淀；第三层才是高波动机会。对这个盘来说，最重要的不是追逐风口，而是把直觉变成流程，把审美变成标准，把人情敏感变成可签约的服务边界。未来三个月建议固定记录“我今天创造了什么可复用价值”，每周复盘一次定价和交付边界。若 DeepSeek 长文生成恢复，系统会进一步把十神结构与星体相位拆成更具体的事业与金钱路径。`,
    ].join("\n\n"),
    transits: [
      `命理特征点：流年大运模块需要真实大运表与年度行运才能做精确时间判断；当前本地保底不会虚构年份事件。可确认的底层结构是：真太阳时为${bazi.trueSolarTime.time}，四柱为${Object.values(bazi.pillars).join("、")}，日柱原型${profile.name.cn}，太阳${astro.sunSignCn}，${mappedSignal}，主要相位线索为${aspectSummary}。这意味着阶段节奏应从“日主承压方式、五行缺口训练、太阳星座身份发展、映射星体的深层驱力”四条线一起看。`,
      `心理动力分析：你的时间感不是线性的。八字提供的是身体和现实层面的周期，星盘提供的是心理成熟与外部事件语气。当命局某个元素偏弱时，相关主题往往不是一次解决，而是反复以关系、工作、健康节律、创作瓶颈或选择焦虑的形式出现。太阳${astro.sunSignCn}会让你在某些阶段更容易被理想、情绪共鸣或意义感牵引；${bazi.mappedPlanetCn}作为日主映射星体，则像一条更深的地下河，推动你不断靠近真正有力量的选择。所谓运势，不是被动等待，而是识别当下哪一种心理课题正在要求你升级。`,
      `给用户的实操建议：短期先做三件事。第一，把未来 90 天分成三个 30 天主题：稳定作息和身体节律、清理关系和合作边界、推进一个可见成果。第二，每周用五行做复盘：木看成长，火看表达，土看稳定，金看边界，水看感受；哪一项缺席，下一周就主动补课。第三，不要在情绪最满的时候做重大承诺，也不要在能量最低的时候否定长期方向。等 DeepSeek 长文生成恢复后，系统会继续把大运骨架、年度行运和相位压力点合并成更具体的年度建议。`,
    ].join("\n\n"),
  };
}

export function normalizeAIReportContent(
  content: AIReportContent | LegacyAIReportContent,
): AIReportSections {
  const legacy = content as LegacyAIReportContent;

  return {
    character:
      "character" in content && typeof content.character === "string"
        ? content.character
        : legacy.personality ?? "",
    wealth: typeof content.wealth === "string" ? content.wealth : "",
    transits:
      "transits" in content && typeof content.transits === "string"
        ? content.transits
        : legacy.timing ?? "",
  };
}

export function createInitialAIReportContent({
  bazi,
  astro,
  profile,
  gender,
  locale,
}: {
  bazi: BaziData;
  astro: AstroData;
  profile: PillarProfile;
  gender: Gender;
  locale: ReportLocale;
}): AIReportContent {
  const sun = astro.placements.find((placement) => placement.body === "Sun");
  const dayDisplay = getPillarDisplay(bazi.pillars.day, locale);
  const sunSign = zodiacLabels[locale][sun?.sign ?? astro.sunSign] ?? astro.sunSign;
  const mappedPlanet = planetLabels[locale][bazi.mappedPlanet] ?? bazi.mappedPlanet;
  const pillarNames = pillarOrder
    .map((key) => getPillarDisplay(bazi.pillars[key], locale).pillarLabel)
    .join(locale === "zh" ? "、" : ", ");
  const branchNames = pillarOrder
    .map((key) => getPillarDisplay(bazi.pillars[key], locale).totemName)
    .join(locale === "zh" ? "、" : ", ");
  const base =
    locale === "zh"
      ? {
          dayMaster: `${profile.name.cn} 是这份报告的核心动物画像；它描述你的底层反应方式。太阳节律落在 ${sunSign}，会把这种底色推向更明显的自我表达和人生主题。`,
          outerPersona: `外在层来自四个出生坐标：${pillarNames}。映射星体为 ${mappedPlanet}，它会影响别人第一眼感受到的气场、压力感和行动速度。`,
          deepSelf: `深层自我来自四个动物场域：${branchNames}。它们不是标签，而是你在压力、亲密关系和选择犹豫时更容易暴露的本能模式。`,
          career: `事业模块会把 ${mappedPlanet}、五行分布和现实行为放在一起看，直接判断适合的发力方式、赚钱风险和消耗点。`,
          love: "感情模块会拆解吸引模式、边界感、投射风险与亲密关系里的重复课题。",
          growth: `成长模块会围绕 ${dayDisplay.stemMeaning} 对应的优势与短板，给出更直接的训练方向。`,
          health: "健康模块只提供节律与身心照护建议，不做医学诊断。",
        }
      : locale === "ru"
        ? {
            dayMaster: `${dayDisplay.totemName} — главный животный портрет отчета. Он описывает базовую реакцию под давлением, а солнечный ритм в ${sunSign} показывает, как эта основа становится заметной в жизни.`,
            outerPersona: `Внешний слой строится из четырех координат рождения: ${pillarNames}. Планета резонанса — ${mappedPlanet}; она показывает первое впечатление, темп действия и социальное давление.`,
            deepSelf: `Глубинное Я раскрывается через животные поля: ${branchNames}. Это не ярлыки, а реакции, которые чаще проявляются в стрессе, близости и сомнениях.`,
            career: `Карьера будет прочитана через ${mappedPlanet}, баланс стихий и реальные поведенческие риски: где есть сила, где утечка, где нужна граница.`,
            love:
              "Любовь будет разобрана как отдельный модуль: притяжение, границы, проекция и повторяющиеся сценарии близости.",
            growth: `Рост будет строиться вокруг дара и слабого места качества ${dayDisplay.stemMeaning}.`,
            health:
              "Здоровье будет описано только как ритм восстановления и забота о теле, без медицинских диагнозов.",
          }
        : {
            dayMaster: `${profile.name.en} is the core animal portrait behind this report. It describes your baseline reaction under pressure, while the Sun in ${sunSign} shows how that pattern becomes visible in identity and life direction.`,
            outerPersona: `Your social layer begins with four birth coordinates: ${pillarNames}. The resonant planet is ${mappedPlanet}, shaping first impression, pace, pressure, and public behavior.`,
            deepSelf: `Your deeper layer begins with the animal fields: ${branchNames}. These are not labels; they describe instincts that surface under stress, intimacy, and hesitation.`,
            career: `Career will be read through ${mappedPlanet}, the five-element balance, and real behavioral risks: where you have leverage, where you leak energy, and where boundaries matter.`,
            love:
              "Love will be treated as its own module: attraction, boundaries, projection, and repeated intimacy patterns.",
            growth: `Growth will focus on the gift and weak spot of ${dayDisplay.stemMeaning}.`,
            health:
              "Health will stay in the lane of rhythm, recovery, and body awareness, without medical diagnosis.",
          };

  return {
    character: base.dayMaster,
    wealth: base.career,
    transits:
      locale === "zh"
        ? "流年运势只在你打开对应标签时生成，避免微信和 Vercel 等待长请求。"
        : locale === "ru"
          ? "Годовые транзиты создаются только после открытия вкладки, чтобы браузер не ждал длинный запрос."
          : "Annual Transits are generated only when you open the Annual Transits tab, preventing the browser from waiting on a long request.",
    natalBook: base,
    meta: {
      provider: "initial",
      model: "client-streaming-shell",
      generatedAt: new Date().toISOString(),
      gender,
      locale,
    },
  };
}

export async function generateAIReportInsight({
  bazi,
  astro,
  profile,
  gender,
  locale,
}: {
  bazi: BaziData;
  astro: AstroData;
  profile: PillarProfile;
  gender?: Gender;
  locale?: ReportLocale;
}): Promise<AIReportContent> {
  const generatedAt = new Date().toISOString();
  const context = buildDeepSeekContext({ bazi, astro, profile, gender, locale });

  try {
    const sections = await requestDeepSeekReport(context);

    return {
      ...sections,
      meta: {
        provider: "deepseek",
        model: DEEPSEEK_MODEL,
        generatedAt,
        gender,
        locale,
      },
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown AI error.";

    return {
      ...fallbackSections({ bazi, astro, profile, reason }),
      meta: {
        provider: "unavailable",
        model: "local-structured-fallback",
        generatedAt,
        gender,
        locale,
        error: reason,
      },
    };
  }
}
