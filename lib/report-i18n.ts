export type ReportLocale = "en" | "zh" | "ru";

export const reportLanguageOptions: Array<{
  value: ReportLocale;
  label: string;
}> = [
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "ru", label: "Русский" },
];

export function normalizeReportLocale(value: string): ReportLocale {
  if (value === "zh" || value === "cn") return "zh";
  if (value === "ru") return "ru";

  return "en";
}

export const outputLanguageNames: Record<ReportLocale, string> = {
  en: "English",
  zh: "Simplified Chinese",
  ru: "Russian",
};

export const languagePromptRules: Record<ReportLocale, string> = {
  en: "Write only in fluent professional English. Do not use Chinese characters or Russian text.",
  zh: "只使用简体中文输出。不要夹杂英文解释，除非是必要的专有名词。",
  ru: "Пиши только на грамотном профессиональном русском языке. Не используй китайские иероглифы или английские пояснения, кроме необходимых названий бренда.",
};

export const reportCopy = {
  en: {
    back: "Back",
    heroEyebrow: "Natal shell ready · AI streams after first paint",
    heroLede:
      "Your report now loads like a premium product: the Bazi and Astrology engines finish first, then the Natal Book streams into modular panels. Annual Transits are generated only when you ask for them.",
    identity: {
      dayPillar: "Day Pillar Archetype",
      solar: "Solar Signature",
      mapping: "Stem Planet Mapping",
    },
    meta: {
      trueSolar: "True solar",
      male: "Male",
      female: "Female",
    },
    bazi: {
      eyebrow: "Bazi Chart",
      title: "Four Pillars & Totems",
      description:
        "Heavenly stems describe the visible drive. Earthly branches reveal the animal field beneath it.",
      heavenlyStem: "Heavenly Stem",
      earthlyBranch: "Earthly Branch",
      elementalSignature: "Elemental signature",
      elementBalance: "Element Balance",
    },
    tabs: {
      natal: "Natal Chart",
      transits: "Annual Transits",
      aria: "Report modules",
    },
    natalPanel: {
      eyebrow: "Natal Book",
      title: "Your foundational fusion map",
    },
    transitPanel: {
      eyebrow: "Transit Book",
      title: "Seasonal timing, generated on demand",
    },
    transitContext: {
      targetYear: "Reading year",
      previousYear: "Previous year",
      tenYearLuck: "Ten-year luck",
      direction: "Luck direction",
      starts: "Starts",
    },
    status: {
      idleNatal: "Preparing stream",
      idleTransit: "Open tab to generate",
      loading: "Streaming insights...",
      ready: "Insight ready",
      error: "Local fallback shown",
      queued: "Queued",
      generating: "Generating insights...",
    },
    accordion: {
      dayMaster: { title: "Day Master", kicker: "Natal Core" },
      outerPersona: { title: "Outer Persona", kicker: "Social Mask" },
      deepSelf: { title: "Deep Self", kicker: "Inner Psychology" },
      career: { title: "Career", kicker: "Life Dimension" },
      love: { title: "Love", kicker: "Life Dimension" },
      growth: { title: "Growth", kicker: "Life Dimension" },
      health: { title: "Health", kicker: "Life Dimension" },
    },
    seasons: {
      spring: { title: "Spring", kicker: "Initiation" },
      summer: { title: "Summer", kicker: "Expression" },
      autumn: { title: "Autumn", kicker: "Refinement" },
      winter: { title: "Winter", kicker: "Integration" },
    },
    vip: {
      title: "VIP Transit Consultation",
      description:
        "A human astrologer can refine these seasonal signals into exact dates, decisions, and relationship windows.",
      action: "Book Session",
    },
    pillarRoles: {
      year: { title: "Year Pillar", microBadge: "Ancestral & Early Life" },
      month: { title: "Month Pillar", microBadge: "Career & Social Persona" },
      day: { title: "Day Pillar", microBadge: "Core Self & Inner Ego" },
      hour: { title: "Hour Pillar", microBadge: "Legacy & Late Life" },
    },
  },
  zh: {
    back: "返回",
    heroEyebrow: "命盘壳已生成 · AI 在首屏后流式加载",
    heroLede:
      "报告现在采用商业化产品加载方式：八字与星盘引擎先完成基础命盘，随后 Natal Book 进入模块化流式输出。流年运势只在你主动打开时生成。",
    identity: {
      dayPillar: "日柱动物原型",
      solar: "太阳星座",
      mapping: "天干映射星体",
    },
    meta: {
      trueSolar: "真太阳时",
      male: "男性",
      female: "女性",
    },
    bazi: {
      eyebrow: "八字命盘",
      title: "四柱与图腾",
      description:
        "天干描述外显驱力，地支揭示其下方的动物场域与本能结构。",
      heavenlyStem: "天干",
      earthlyBranch: "地支",
      elementalSignature: "元素签名",
      elementBalance: "五行分布",
    },
    tabs: {
      natal: "基础命盘",
      transits: "流年运势",
      aria: "报告模块",
    },
    natalPanel: {
      eyebrow: "命之书",
      title: "你的基础融合图谱",
    },
    transitPanel: {
      eyebrow: "运之书",
      title: "按需生成的四季节奏",
    },
    transitContext: {
      targetYear: "测算年份",
      previousYear: "去年流年",
      tenYearLuck: "十年大运",
      direction: "大运方向",
      starts: "起运",
    },
    status: {
      idleNatal: "准备流式生成",
      idleTransit: "打开后开始生成",
      loading: "正在流式生成...",
      ready: "洞察已生成",
      error: "显示本地兜底内容",
      queued: "等待生成",
      generating: "正在生成洞察...",
    },
    accordion: {
      dayMaster: { title: "命盘核心", kicker: "日主原型" },
      outerPersona: { title: "外在形象", kicker: "社会面具" },
      deepSelf: { title: "深层自我", kicker: "内核心理" },
      career: { title: "事业", kicker: "人生维度" },
      love: { title: "感情", kicker: "人生维度" },
      growth: { title: "成长", kicker: "人生维度" },
      health: { title: "健康", kicker: "人生维度" },
    },
    seasons: {
      spring: { title: "春季", kicker: "启动" },
      summer: { title: "夏季", kicker: "表达" },
      autumn: { title: "秋季", kicker: "修正" },
      winter: { title: "冬季", kicker: "整合" },
    },
    vip: {
      title: "VIP 流年咨询",
      description:
        "人工咨询师可以把这些季节信号细化为具体日期、决策窗口与关系节奏。",
      action: "预约咨询",
    },
    pillarRoles: {
      year: { title: "年柱", microBadge: "祖运与早年" },
      month: { title: "月柱", microBadge: "事业与社会外在" },
      day: { title: "日柱", microBadge: "自我核心与内核心理" },
      hour: { title: "时柱", microBadge: "子孙与晚运" },
    },
  },
  ru: {
    back: "Назад",
    heroEyebrow: "Карта готова · ИИ загружается потоково",
    heroLede:
      "Отчет загружается как премиальный продукт: механики Ба-цзы и астрологии сначала строят базовую карту, затем книга рождения появляется в модульных панелях. Годовые транзиты создаются только по запросу.",
    identity: {
      dayPillar: "Архетип дневного столпа",
      solar: "Солнечная сигнатура",
      mapping: "Планета небесного ствола",
    },
    meta: {
      trueSolar: "Истинное солнечное время",
      male: "Мужской",
      female: "Женский",
    },
    bazi: {
      eyebrow: "Карта Ба-цзы",
      title: "Четыре столпа и тотемы",
      description:
        "Небесные стволы показывают видимый импульс. Земные ветви раскрывают животное поле под ним.",
      heavenlyStem: "Небесный ствол",
      earthlyBranch: "Земная ветвь",
      elementalSignature: "Стихийная сигнатура",
      elementBalance: "Баланс стихий",
    },
    tabs: {
      natal: "Натальная карта",
      transits: "Годовые транзиты",
      aria: "Модули отчета",
    },
    natalPanel: {
      eyebrow: "Книга рождения",
      title: "Ваша базовая карта синтеза",
    },
    transitPanel: {
      eyebrow: "Книга транзитов",
      title: "Сезонный ритм по запросу",
    },
    transitContext: {
      targetYear: "Год чтения",
      previousYear: "Прошлый год",
      tenYearLuck: "Десятилетний цикл",
      direction: "Направление",
      starts: "Старт",
    },
    status: {
      idleNatal: "Подготовка потока",
      idleTransit: "Откройте вкладку для генерации",
      loading: "Идет потоковая генерация...",
      ready: "Инсайт готов",
      error: "Показан локальный резерв",
      queued: "В очереди",
      generating: "Генерация инсайтов...",
    },
    accordion: {
      dayMaster: { title: "Дневной мастер", kicker: "Ядро карты" },
      outerPersona: { title: "Внешний образ", kicker: "Социальная маска" },
      deepSelf: { title: "Глубинное Я", kicker: "Внутренняя психология" },
      career: { title: "Карьера", kicker: "Сфера жизни" },
      love: { title: "Любовь", kicker: "Сфера жизни" },
      growth: { title: "Рост", kicker: "Сфера жизни" },
      health: { title: "Здоровье", kicker: "Сфера жизни" },
    },
    seasons: {
      spring: { title: "Весна", kicker: "Запуск" },
      summer: { title: "Лето", kicker: "Выражение" },
      autumn: { title: "Осень", kicker: "Уточнение" },
      winter: { title: "Зима", kicker: "Интеграция" },
    },
    vip: {
      title: "Премиальная консультация по транзитам",
      description:
        "Живой астролог может уточнить сезонные сигналы до дат, решений и окон отношений.",
      action: "Записаться",
    },
    pillarRoles: {
      year: { title: "Годовой столп", microBadge: "Наследие и ранние годы" },
      month: { title: "Месячный столп", microBadge: "Карьера и социальная роль" },
      day: { title: "Дневной столп", microBadge: "Ядро личности и эго" },
      hour: { title: "Часовой столп", microBadge: "Наследие и поздние годы" },
    },
  },
} as const;

export const elementLabels: Record<ReportLocale, Record<string, string>> = {
  en: {
    Wood: "Wood",
    Fire: "Fire",
    Earth: "Earth",
    Metal: "Metal",
    Water: "Water",
  },
  zh: {
    Wood: "木",
    Fire: "火",
    Earth: "土",
    Metal: "金",
    Water: "水",
  },
  ru: {
    Wood: "Дерево",
    Fire: "Огонь",
    Earth: "Земля",
    Metal: "Металл",
    Water: "Вода",
  },
};

export const zodiacLabels: Record<ReportLocale, Record<string, string>> = {
  en: {
    Aries: "Aries",
    Taurus: "Taurus",
    Gemini: "Gemini",
    Cancer: "Cancer",
    Leo: "Leo",
    Virgo: "Virgo",
    Libra: "Libra",
    Scorpio: "Scorpio",
    Sagittarius: "Sagittarius",
    Capricorn: "Capricorn",
    Aquarius: "Aquarius",
    Pisces: "Pisces",
  },
  zh: {
    Aries: "白羊座",
    Taurus: "金牛座",
    Gemini: "双子座",
    Cancer: "巨蟹座",
    Leo: "狮子座",
    Virgo: "处女座",
    Libra: "天秤座",
    Scorpio: "天蝎座",
    Sagittarius: "射手座",
    Capricorn: "摩羯座",
    Aquarius: "水瓶座",
    Pisces: "双鱼座",
  },
  ru: {
    Aries: "Овен",
    Taurus: "Телец",
    Gemini: "Близнецы",
    Cancer: "Рак",
    Leo: "Лев",
    Virgo: "Дева",
    Libra: "Весы",
    Scorpio: "Скорпион",
    Sagittarius: "Стрелец",
    Capricorn: "Козерог",
    Aquarius: "Водолей",
    Pisces: "Рыбы",
  },
};

export const planetLabels: Record<ReportLocale, Record<string, string>> = {
  en: {
    Sun: "Sun",
    Moon: "Moon",
    Mercury: "Mercury",
    Venus: "Venus",
    Mars: "Mars",
    Jupiter: "Jupiter",
    Saturn: "Saturn",
    Uranus: "Uranus",
    Neptune: "Neptune",
    Pluto: "Pluto",
  },
  zh: {
    Sun: "太阳",
    Moon: "月亮",
    Mercury: "水星",
    Venus: "金星",
    Mars: "火星",
    Jupiter: "木星",
    Saturn: "土星",
    Uranus: "天王星",
    Neptune: "海王星",
    Pluto: "冥王星",
  },
  ru: {
    Sun: "Солнце",
    Moon: "Луна",
    Mercury: "Меркурий",
    Venus: "Венера",
    Mars: "Марс",
    Jupiter: "Юпитер",
    Saturn: "Сатурн",
    Uranus: "Уран",
    Neptune: "Нептун",
    Pluto: "Плутон",
  },
};
