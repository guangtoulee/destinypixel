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
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash";

type ChatMessage = { role: "system" | "user"; content: string };

function shortContext(context: ReportGenerationContext) {
  const nonChineseContext = context.locale === "en" || context.locale === "ru";

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
        context.locale === "zh" || context.locale === "zh-TW"
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
          context.locale === "zh" || context.locale === "zh-TW"
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
        "Write like a serious psychological timing consultant, not like a horoscope column.",
        "The tone must be direct, specific, slightly sharp, and useful. Avoid soft Barnum-effect statements such as 'you are sensitive but strong', 'you have hidden potential', or 'you need balance' unless you immediately tie them to a concrete element, animal field, planet, sign, or aspect from the context.",
        "Make 20-30% of the interpretation constructive-negative: blind spots, likely mistakes, avoidance patterns, money/relationship risks, and places where the user may overestimate themselves. Do not flatter the user.",
        "Do not teach Bazi terminology. Do not explain ten gods, day-master strength, stems/branches theory, or use phrases like '乙木强弱'. Translate the technical layer into plain conclusions. If you need the Chinese layer, speak only through the five elements, animal archetype, time cycle, and observable behavior.",
        "Use the supplied Bazi and astrology context only. Do not invent houses, medical diagnoses, fixed events, or guaranteed outcomes.",
        "Return plain text only. No Markdown, no JSON, no bullets unless a section asks for compact dimensions.",
        "You must use these exact markers and this order: [DAY_MASTER], [OUTER_PERSONA], [DEEP_SELF], [CAREER], [LOVE], [GROWTH], [HEALTH].",
        "Each section should be substantial but not wordy: about 220-320 English words, equivalent to roughly 360-560 Chinese characters in density.",
        "Write each section as 2-3 short paragraphs separated by blank lines. Start with a clear verdict in the first sentence. The middle paragraph gives evidence from the chart. The final paragraph gives practical guidance and one explicit warning.",
        "Every section must include at least two concrete anchors from the supplied context: five-element distribution, missing elements, animal archetype, mapped planet, Sun sign, major aspects, or timing cycle.",
        "Prefer observable conclusions: how the person acts under stress, how they make money, what they avoid, what kind of partner or work environment exposes their weakness, and what to do next.",
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
        "Write for an overseas paid report with direct, practical guidance. Do not sound like a generic zodiac forecast.",
        "Use plain conclusions, not Bazi lessons. Avoid ten-god jargon and day-master strength language in the visible output. Translate the technical layer into five elements, annual pressure, money/relationship/body rhythm, and decisions.",
        "Make 20-30% of the reading constructive-negative: overreach, wrong timing, emotional leakage, weak boundaries, bad spending, relationship projection, and health-rhythm neglect. Keep it useful rather than frightening.",
        "Use the natal Bazi and astrology context as the anchor. Transit timing must be based on context.bazi.luck, especially targetYear, currentYearPillar, previousYearPillar, and activeTenYearLuck. Do not invent exact future events, medical claims, lottery/investment promises, or fear-based predictions.",
        "Return plain text only. No Markdown and no JSON.",
        `You must use these exact markers and this order: ${transitPromptMarkers.map((marker) => `[${marker}]`).join(", ")}.`,
        "[OVERVIEW] is the annual overview. It should be about 240-340 English words, or 380-600 Chinese characters, and must explicitly name the active ten-year luck cycle, target year, previous year residue, the main opportunity, and the main trap of the year.",
        "The twelve MONTH sections are not generic seasons. They are solar-term/monthly timing windows. For Chinese output, write them as solar-term months; for English or Russian output, use the approximate Gregorian date range from annualTimingWindows.",
        "Each MONTH section should be concise but substantial: about 90-140 English words, or 150-250 Chinese characters. Use 2 short paragraphs separated by a blank line: first a concrete timing judgment, then practical guidance plus a warning.",
        "Every MONTH section must feel different. Mention either the target year, the active ten-year luck cycle, the annual pillar, the prior-year residue, the five-element weather, or the supplied planetary resonance. Avoid repeating the same advice.",
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
  if (context.locale === "zh" || context.locale === "zh-TW") {
    const totems = Object.values(context.bazi.pillarsDisplay)
      .map((pillar) => pillar.totemName)
      .join("、");
    const elementBalance = Object.entries(context.bazi.elementBalance)
      .sort((left, right) => right[1] - left[1])
      .map(([element, value]) => `${element} ${value}`)
      .join("、");
    const missingElements = context.bazi.missingElements.length
      ? context.bazi.missingElements.join("、")
      : "没有完全缺位的元素";
    const aspectSummary = context.astrology.majorAspects
      .slice(0, 4)
      .map(
        (aspect) =>
          `${aspect.bodies[0]}-${aspect.bodies[1]} ${aspect.type}（容许度 ${aspect.orb.toFixed(1)}°）`,
      )
      .join("；");

    return [
      "[DAY_MASTER]",
      `${context.profile.displayName} 是这份内在地图的核心动物画像。直接说结论：你对气氛、关系变化和别人没说出口的部分反应很快，通常比周围人更早察觉问题，但也容易把“看见问题”误当成“必须由我解决”。太阳落在 ${context.astrology.sunSignCn}，映射星体是 ${context.bazi.mappedPlanetDisplay}，两套信号叠加后，直觉、想象和心理穿透力会变强，现实压力大时却可能先在脑中反复推演，而不是马上切断无效选择。`,
      `五行分布为 ${elementBalance}，${missingElements}。这意味着你的优势不是平均用力，而是把最强的感受力变成判断标准，再用偏弱元素补执行结构。你真正的盲点是容易为复杂的人和关系寻找解释，迟迟不肯承认某件事已经不值得投入。实操上，任何重要决定都写下三个可验证事实、一个截止时间和一条退出条件；如果事实连续两次不支持期待，就停止替别人补故事。`,
      "[OUTER_PERSONA]",
      `你的外在形象不是单纯温和，而是“先观察、再靠近、确认安全后才真正投入”。四个出生坐标 ${Object.values(context.bazi.pillarsDisplay).map((pillar) => pillar.pillarLabel).join("、")} 让别人同时感到细腻、克制和一定距离感；${context.bazi.mappedPlanetDisplay} 的影响又会让你的表达带有深度和保留。熟悉你的人觉得这是分寸感，不熟悉的人却可能把它误读成犹豫、难以表态，甚至认为你心里另有打算。`,
      `你在社交和工作中最大的损耗，是为了保持体面而把真正要求说得太晚。重要合作不要只说方向，要明确交付物、价格、责任人和时间；亲密关系也不要靠暗示测试对方。你的第一印象不需要变得热闹，只需要更清楚。警惕一种模式：表面答应配合，内心已经不舒服，最后用拖延或突然退出表达拒绝。早一点说“不”，反而更可靠。`,
      "[DEEP_SELF]",
      `你的深层自我由 ${totems} 四个动物场域共同组成。它们不是四种互相矛盾的人格，而是你在家庭、社会、自我和未来压力下切换的本能反应。你需要先确认环境是否可信，才会释放真正的创造力；一旦长期处在粗糙、强压、只讲结果却不给边界的环境里，你会先过度适应，随后突然失去热情。${aspectSummary || "主要相位共同强调了感受、行动与边界之间的拉扯"}，说明这种内耗并非单纯懒惰，而是你对风险和关系后果评估过多。`,
      `问题在于，你有时会把谨慎包装成“还没准备好”，把害怕被评价包装成“我想再完善一点”。这会让真正重要的作品、报价和表达迟迟不落地。给自己设一个七成完成线：达到七成就先交付、先测试、先让现实反馈进来；剩下三成根据真实反馈修改。不要再用持续准备换取虚假的安全感，也不要期待别人主动理解你没有说出口的需求。`,
      "[CAREER]",
      `事业上，你适合做需要洞察、审美、研究、整合和长期信任的工作，不适合长期被困在只拼速度、只靠重复消耗的岗位。${context.bazi.mappedPlanetDisplay} 与 ${context.astrology.sunSignCn} 的组合，能让你看到别人忽略的细节并把不同体系连起来；这对咨询、内容、设计、教育、策略、品牌、心理服务或复杂产品很有价值。真正能赚钱的不是灵感本身，而是你把洞察整理成方法、产品和稳定交付的能力。`,
      `你的职业风险也很明确：容易同时开太多方向，前期投入大量情绪和创意，却没有报价、流程、复购和归档，最后看起来很忙，资产却没有留下。未来三个月只保留一个主产品、一个获客渠道和一个可量化指标；每次交付都沉淀模板、案例和客户反馈。不要因为怕失去机会而接下边界模糊的合作，也不要以“关系不错”为理由长期低价。善意可以赠送一次，商业规则必须从第二次开始。`,
      "[LOVE]",
      `感情里最大的优势是感受力，最大的风险也是感受力。你能迅速捕捉对方的情绪、需求和脆弱处，因此很容易形成深度连接；但当关系不够稳定时，你也会提前替对方解释，甚至把对方偶尔的热情当成长期承诺。${context.astrology.sunSignCn} 的太阳节律会强化浪漫投射，而动物场域中的依恋本能又让你不愿轻易承认投入落空，于是模糊关系可能被你维持得比必要时间更久。`,
      `判断一段关系，不看对方说得多动人，只看三个事实：是否持续投入时间、是否愿意承担现实责任、发生冲突后是否真正修正。你需要的伴侣不是最会制造情绪高潮的人，而是能说清楚、做得到、尊重独处和边界的人。警惕“我再理解一点，对方就会变好”的想法；理解不能替代责任。表达需求时不要绕成测试题，直接说明底线和期待，给对方选择，也给自己离开的权利。`,
      "[GROWTH]",
      `你的成长重点不是继续增加感受，而是让感受进入秩序。五行里偏弱的部分，可以当作需要训练的心理肌肉：火对应决定和曝光，金对应边界和复盘，土对应稳定与完成，木对应长期规划，水对应信息流动与真实表达。当前分布 ${elementBalance} 已经说明，你不缺看见可能性的能力，真正需要补的是把可能性筛选成少数选择，并承受选择之后必然失去其他可能。`,
      `建议建立三个固定动作：每周砍掉一件不再重要的事；每月完成一个可以公开展示的成果；每季度检查一次人际和财务边界。成长不是把自己变成更“正能量”的人，而是减少自我欺骗。警惕用学习、研究、疗愈和寻找新体系逃避执行，当一个答案已经足以行动时，继续收集答案就是拖延。你需要的不是更多启发，而是更少、更稳定、更可重复的动作。`,
      "[HEALTH]",
      `健康层面更值得关注的是作息、恢复力和情绪节律，而不是追求短期高强度。你对环境和关系压力的吸收较快，连续应付人群、信息和多任务后，身体可能先表现为睡眠变浅、注意力涣散、胃口或肌肉紧张等普通压力信号。这里不是医学诊断，但这些信号不应被解释成“我再坚持一下就好”；它们更像系统在提醒你，恢复已经被透支。`,
      `最有效的保养不是复杂仪式，而是固定睡眠窗口、规律饮水和进食、每周数次低到中等强度运动，以及每天一段没有信息输入的安静时间。情绪很满时先走路、洗澡、呼吸或写下来，再处理重要对话。若任何不适持续、加重或影响生活，应及时咨询合格医生。警惕把身心疲惫浪漫化成敏感天赋；真正的敏锐必须建立在身体有余量的基础上。`,
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
    `${context.profile.displayName} is the core animal portrait of this map. The verdict: you read emotional weather quickly, but you can also absorb other people's urgency as if it were your own. The Sun in ${context.astrology.sunSign} amplifies imagination and empathy; the risk is weak boundaries when life becomes noisy.`,
    "[OUTER_PERSONA]",
    `Your public face is filtered through ${context.bazi.mappedPlanetDisplay}. People may notice depth, taste, and psychological pressure before they notice simple friendliness. The upside is magnetism; the downside is that you may look harder to read than you intend. In work and love, say the practical thing earlier.`,
    "[DEEP_SELF]",
    `The animal fields are ${Object.values(context.bazi.pillarsDisplay).map((pillar) => pillar.totemName).join(", ")}. They point to instinct, memory, attachment, and pressure responses. You are not built for crude environments, but you can also hide behind sensitivity when the real task is delivery.`,
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

  if (context.locale === "zh" || context.locale === "zh-TW") {
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildStreamRecovery(
  emittedText: string,
  fallbackText: string,
  requiredMarkers: string[],
) {
  const visibleText = emittedText.trim();

  if (visibleText.length < 120) {
    return fallbackText;
  }

  const missingMarkers = requiredMarkers.filter(
    (marker) => !visibleText.includes(`[${marker}]`),
  );

  if (missingMarkers.length === 0) {
    return "";
  }

  return missingMarkers
    .map((marker) => {
      const pattern = new RegExp(
        `\\[${escapeRegExp(marker)}\\]\\s*([\\s\\S]*?)(?=\\n\\s*\\[[A-Z0-9_]+\\]|$)`,
      );
      const section = fallbackText.match(pattern)?.[1]?.trim();

      return section ? `[${marker}]\n\n${section}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
}

export async function streamDeepSeekText({
  messages,
  fallbackText,
  requiredMarkers = [],
}: {
  messages: ChatMessage[];
  fallbackText: string;
  requiredMarkers?: string[];
}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return fallbackStream(fallbackText);
  }

  try {
    const upstreamController = new AbortController();
    const configuredTimeout = Number(process.env.DEEPSEEK_TIMEOUT_MS ?? 50000);
    const timeoutMs = Math.min(
      52000,
      Math.max(35000, Number.isFinite(configuredTimeout) ? configuredTimeout : 50000),
    );
    const timeout = setTimeout(() => upstreamController.abort(), timeoutMs);
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        thinking: { type: "disabled" },
        temperature: 0.42,
        max_tokens: Number(process.env.DEEPSEEK_STREAM_MAX_TOKENS ?? 5200),
        stream: true,
        messages,
      }),
      cache: "no-store",
      signal: upstreamController.signal,
    });

    if (!response.ok || !response.body) {
      clearTimeout(timeout);
      return fallbackStream(fallbackText);
    }

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const reader = response.body.getReader();
    let isCancelled = false;

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        let buffer = "";
        let emittedText = "";

        const emitContent = (content: string) => {
          emittedText += content;
          controller.enqueue(encoder.encode(content));
        };

        const processLine = (line: string) => {
          const trimmed = line.trim();

          if (!trimmed.startsWith("data:")) return;

          const data = trimmed.slice(5).trim();
          if (!data || data === "[DONE]") return;

          try {
            const payload = JSON.parse(data) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const content = payload.choices?.[0]?.delta?.content;

            if (content) emitContent(content);
          } catch {
            // Ignore malformed heartbeat lines while keeping the stream alive.
          }
        };

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done || isCancelled) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              processLine(line);
            }
          }
          buffer += decoder.decode();
          if (buffer.trim()) processLine(buffer);
        } catch {
          // A timeout or upstream disconnect is recovered below section by section.
        } finally {
          clearTimeout(timeout);
          if (!isCancelled) {
            const recovery = buildStreamRecovery(
              emittedText,
              fallbackText,
              requiredMarkers,
            );

            if (recovery) {
              emitContent(`${emittedText.trim() ? "\n\n" : ""}${recovery}`);
            }
            controller.close();
          }
          try {
            reader.releaseLock();
          } catch {
            // The reader can already be released when the client disconnects.
          }
        }
      },
      async cancel() {
        isCancelled = true;
        clearTimeout(timeout);
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
