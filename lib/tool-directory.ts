export type DirectoryLocale = "en" | "zh";
export type ToolGroup = "birth" | "insight" | "relationships";
type ToolCopy = { name: string; description: string; prepare: string; result: string };
export type DirectoryTool = { key: string; path: string; group: ToolGroup; localized: boolean; copy: Record<DirectoryLocale, ToolCopy> };

// DestinyPixel core: birth symbolism, divination, observation, relationships and annual cycles.
export const directoryTools: DirectoryTool[] = [
  {
    key: "day-pillar",
    path: "/day-pillar",
    group: "birth",
    localized: true,
    copy: {
      en: {
        name: "Free Day Pillar card",
        description: "Explore your BaZi Day Pillar and original animal portrait from your Gregorian birthday, without creating an account.",
        prepare: "Gregorian birth date only; no login needed",
        result: "A provisional day pillar using a midnight day boundary; add birth time and city for a full birth map",
      },
      zh: {
        name: "免费日柱意象卡",
        description: "只用公历生日，揭晓六十甲子中的专属动物意象卡与性格、感情观察，无需注册登录。",
        prepare: "仅需公历生日，无需登录",
        result: "按公历日期、午夜换日初算的日柱；补充出生时间与城市后，可校准完整出生图谱",
      },
    },
  },
  {
    key: "astrology",
    path: "/astrology",
    group: "birth",
    localized: true,
    copy: {
      en: {
        name: "Interactive birth chart",
        description: "Explore ten planets, rising sign, whole-sign houses, aspects and retrograde motion in a detailed tropical natal chart.",
        prepare: "Birth date, exact local birth time and birthplace",
        result: "An interactive chart, placement explanations and optional AI interpretation",
      },
      zh: {
        name: "本命星盘实验室",
        description: "探索十大星体、上升星座、整宫制宫位、相位连线与逆行状态，逐层读懂西方回归出生星盘。",
        prepare: "出生日期、准确的当地时间与出生地点",
        result: "可点选交互星盘、落座落宫解析与可选 AI 解读",
      },
    },
  },
  {
    key: "tuteng",
    path: "/tuteng",
    group: "birth",
    localized: true,
    copy: {
      en: {
        name: "Birth Totem",
        description: "Turn Four Pillars and five-element relationships into a deterministic interactive geometric mandala.",
        prepare: "Birth date, time, a listed city and gender option",
        result: "An explorable totem with layer-by-layer explanations and PNG / SVG export",
      },
      zh: {
        name: "本命灵构",
        description: "把四柱干支、五行生克、藏干与十神结构转化为可点选、可逐层拆解的几何星历图腾。",
        prepare: "出生日期、时间、列表中的城市及性别选项",
        result: "交互式几何图腾，支持导出高清 PNG 与矢量 SVG",
      },
    },
  },
  {
    key: "birth-map",
    path: "/",
    group: "birth",
    localized: true,
    copy: {
      en: {
        name: "Birth map",
        description: "Explore an integrated symbolic reading combining Four Pillars BaZi, five elements and tropical astrology.",
        prepare: "Name, birth date, time, city and gender option",
        result: "A personal reading with archetypes, seasonal rhythms and reflection prompts",
      },
      zh: {
        name: "完整出生能量图",
        description: "经真太阳时校准，将八字四柱、五行平衡与西方出生星盘合参，生成深度个人图谱。",
        prepare: "姓名、出生日期、时间、城市及性别选项",
        result: "包含原型意象、性格底色与自我观察提示的个人报告",
      },
    },
  },
  {
    key: "tarot",
    path: "/tarot",
    group: "insight",
    localized: true,
    copy: {
      en: {
        name: "Mountain-Lake Tarot studio",
        description: "Shuffle and choose from 78 cards on a quiet twilight table. Arrange them freely or follow a spread, then reveal and explore.",
        prepare: "A clear question, or simply a quiet moment to reflect",
        result: "A personal layout, upright and reversed card meanings, optional AI interpretation",
      },
      zh: {
        name: "山湖塔罗牌桌",
        description: "完整 78 张牌，在静谧山湖牌桌上亲手洗牌、选牌、摆阵与翻开，可自由摆桌或选用三牌阵、凯尔特十字。",
        prepare: "一个问题，或一段留给自己的安静时间",
        result: "自选牌阵、正逆位牌义对照与可选 AI 解读",
      },
    },
  },
  {
    key: "sticks",
    path: "/sticks",
    group: "insight",
    localized: true,
    copy: {
      en: {
        name: "Temple fortune sticks",
        description: "Draw a numbered sign across five Chinese oracle traditions or look up the number of one you have already drawn.",
        prepare: "A tradition; optionally a question or stick number",
        result: "Original sign verse, historical context and optional AI reflection",
      },
      zh: {
        name: "灵签问事小殿",
        description: "涵盖观音、月老、关帝、财神与黄大仙五系灵签；可在线诚心抽签，也可直接查解线下抽到的签号。",
        prepare: "选择签系；可填写具体心事或已有签号",
        result: "传统签诗、版本语境说明与可选 AI 问事解读",
      },
    },
  },
  {
    key: "iching",
    path: "/iching",
    group: "insight",
    localized: true,
    copy: {
      en: {
        name: "I Ching · six-line casting",
        description: "Toss three coins six times, enter your own lines, or explore clearly labelled Plum Blossom time and number methods.",
        prepare: "An optional question; your coin results, time or two counts",
        result: "Reproducible original and changed hexagrams, moving lines, and full trigram and hexagram articles",
      },
      zh: {
        name: "易经 · 六爻起卦",
        description: "模拟三枚铜钱六次摇卦、手动录入已有六爻，或使用明确标注的梅花易数时间与数字起卦。",
        prepare: "可选问题；铜钱结果、时间或两组计数",
        result: "可核对的本卦、动爻与之卦，以及八卦与六十四卦完整图文",
      },
    },
  },
  {
    key: "oracle",
    path: "/oracle",
    group: "insight",
    localized: true,
    copy: {
      en: {
        name: "Question Oracle",
        description: "Use Tarot and hexagram-inspired imagery to reflect on one specific situation from a fresh angle.",
        prepare: "One specific question, its time and topic",
        result: "A symbolic reading focused on that single question",
      },
      zh: {
        name: "一事一问",
        description: "融合塔罗意象与六爻时间脉络，为眼前的具体抉择提供梳理线索与观察角度。",
        prepare: "一个具体问题、提问时间和主题",
        result: "围绕这件事展开的结构化象征解读",
      },
    },
  },
  {
    key: "palm",
    path: "/palm",
    group: "insight",
    localized: true,
    copy: {
      en: {
        name: "Palm studio",
        description: "Explore palm symbols from your selected observations. An optional photo stays locally in your browser as a reference.",
        prepare: "Palm details and hand side; optional reference photo",
        result: "A reflective text reading, not a medical or personality diagnosis",
      },
      zh: {
        name: "手相观察室",
        description: "根据自己确认的三大主线与掌丘细节进行象征解读，可选照片仅保留在本地浏览器作对照参考。",
        prepare: "左右手、掌纹细节，可选本地参考照片",
        result: "用于自我观察的文字解读，不作任何医学诊断",
      },
    },
  },
  {
    key: "face",
    path: "/face",
    group: "insight",
    localized: true,
    copy: {
      en: {
        name: "Face studio",
        description: "Reflect on self-described facial details and expressions. An optional photo stays locally as a visual mirror.",
        prepare: "Facial observations; optional reference portrait",
        result: "A text reflection, not an automated assessment",
      },
      zh: {
        name: "面相观察室",
        description: "根据自己描述的神态与五官细节进行传统意象反思，可选照片仅作本地观察镜鉴。",
        prepare: "面部观察信息，可选本地参考照片",
        result: "文字自我观察提示，不作自动化人脸评判",
      },
    },
  },
  {
    key: "compatibility",
    path: "/compatibility",
    group: "relationships",
    localized: true,
    copy: {
      en: {
        name: "Relationship compatibility",
        description: "Compare BaZi and tropical birth charts side by side to explore communication, affection and everyday rhythm.",
        prepare: "Both birth dates; local birth times and cities optional",
        result: "Clear calculation boundaries, side-by-side comparisons and reflective prompts",
      },
      zh: {
        name: "双人关系合盘",
        description: "结合八字干支与西方星盘双重视角，探索两人的沟通方式、情感表达与日常相处节律。",
        prepare: "双方公历生日；出生时间与城市可选未知",
        result: "区分已知与未知时辰的计算对比、相处线索与简短解读",
      },
    },
  },
  {
    key: "year_2027",
    path: "/2027",
    group: "relationships",
    localized: true,
    copy: {
      en: {
        name: "2027 · Your year ahead",
        description: "Explore January–December 2027 through separate BaZi and birth-chart perspectives, with clear calculation limits.",
        prepare: "Birth date, supported birthplace and known time, or choose time unknown",
        result: "A free 12-month personal guide and reflection prompts; no login needed",
      },
      zh: {
        name: "2027 · 丁未流年手册",
        description: "从八字流年与星盘行运各自的依据出发，探索公历 1—12 月的个人节奏与太岁常识。",
        prepare: "公历生日、支持的出生地点；时辰可选未知",
        result: "免费的 12 个月个人流年日历与自省提示，无需登录",
      },
    },
  },
];

export function directoryToolHref(tool: DirectoryTool, locale: DirectoryLocale) {
  const path = tool.localized && locale === "zh" ? `${tool.path}?locale=zh` : tool.path;
  return tool.key === "birth-map" ? `${path}#report` : path;
}
