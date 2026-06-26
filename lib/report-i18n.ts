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
    heroEyebrow: "Inner map ready · AI guidance streams after first paint",
    heroLede:
      "Your report loads like a calm reflective product: the birth-time energy model and sky resonance model finish first, then the guidance book streams into modular panels. Annual timing is generated only when you ask for it.",
    identity: {
      dayPillar: "Core Animal Portrait",
      solar: "Solar Rhythm",
      mapping: "Planetary Resonance",
    },
    meta: {
      trueSolar: "Solar correction",
      male: "Male",
      female: "Female",
    },
    bazi: {
      eyebrow: "Birth Energy Map",
      title: "Four Coordinates & Totems",
      description:
        "The upper signal describes visible drive. The animal field reveals instinct, memory, and emotional climate beneath it.",
      heavenlyStem: "Upper Signal",
      earthlyBranch: "Animal Field",
      elementalSignature: "Energy signature",
      elementBalance: "Element Balance",
    },
    tabs: {
      natal: "Inner Map",
      transits: "Annual Timing",
      aria: "Report modules",
    },
    natalPanel: {
      eyebrow: "Guidance Book",
      title: "Your foundational inner map",
    },
    transitPanel: {
      eyebrow: "Timing Book",
      title: "Seasonal guidance, generated on demand",
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
      dayMaster: { title: "Core Pattern", kicker: "Inner Core" },
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
      year: { title: "Year Coordinate", microBadge: "Ancestral & Early Life" },
      month: { title: "Month Coordinate", microBadge: "Career & Social Persona" },
      day: { title: "Core Coordinate", microBadge: "Core Self & Inner Ego" },
      hour: { title: "Hour Coordinate", microBadge: "Legacy & Late Life" },
    },
  },
  zh: {
    back: "返回",
    heroEyebrow: "内在地图已生成 · AI 指引将在首屏后流式加载",
    heroLede:
      "报告采用更像心理产品的加载方式：出生时间能量模型与天空共振模型先完成基础地图，随后引导之书进入模块化流式输出。年度节奏只在你主动打开时生成。",
    identity: {
      dayPillar: "核心动物画像",
      solar: "太阳节律",
      mapping: "行星共振",
    },
    meta: {
      trueSolar: "时间校准",
      male: "男性",
      female: "女性",
    },
    bazi: {
      eyebrow: "出生能量图",
      title: "四重坐标与图腾",
      description:
        "上层信号描述外显驱力，动物场域揭示其下方的本能、记忆与情绪气候。",
      heavenlyStem: "上层信号",
      earthlyBranch: "动物场域",
      elementalSignature: "能量签名",
      elementBalance: "五行分布",
    },
    tabs: {
      natal: "内在地图",
      transits: "年度节奏",
      aria: "报告模块",
    },
    natalPanel: {
      eyebrow: "指引之书",
      title: "你的基础内在地图",
    },
    transitPanel: {
      eyebrow: "时机之书",
      title: "按需生成的四季指引",
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
      dayMaster: { title: "核心模式", kicker: "内在核心" },
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
      year: { title: "年坐标", microBadge: "家族记忆与早年气候" },
      month: { title: "月坐标", microBadge: "事业节奏与社会面具" },
      day: { title: "核心坐标", microBadge: "自我核心与内在心理" },
      hour: { title: "时坐标", microBadge: "长期愿景与晚期能量" },
    },
  },
  ru: {
    back: "Назад",
    heroEyebrow: "Внутренняя карта готова · AI-гид загружается потоково",
    heroLede:
      "Отчет загружается как спокойный продукт для рефлексии: модель энергии рождения и модель небесного резонанса сначала строят карту, затем книга внутреннего ориентира появляется в модульных панелях. Годовой ритм создается только по запросу.",
    identity: {
      dayPillar: "Главный животный портрет",
      solar: "Солнечный ритм",
      mapping: "Планетарный резонанс",
    },
    meta: {
      trueSolar: "Солнечная коррекция",
      male: "Мужской",
      female: "Женский",
    },
    bazi: {
      eyebrow: "Карта энергии рождения",
      title: "Четыре координаты и тотемы",
      description:
        "Верхний сигнал показывает видимый импульс. Животное поле раскрывает инстинкт, память и эмоциональный климат под ним.",
      heavenlyStem: "Верхний сигнал",
      earthlyBranch: "Животное поле",
      elementalSignature: "Энергетическая подпись",
      elementBalance: "Баланс стихий",
    },
    tabs: {
      natal: "Внутренняя карта",
      transits: "Годовой ритм",
      aria: "Модули отчета",
    },
    natalPanel: {
      eyebrow: "Книга внутреннего ориентира",
      title: "Ваша базовая внутренняя карта",
    },
    transitPanel: {
      eyebrow: "Книга времени",
      title: "Сезонный ориентир по запросу",
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
      dayMaster: { title: "Ядерный паттерн", kicker: "Внутреннее ядро" },
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
      year: { title: "Годовая координата", microBadge: "Родовая память и ранние годы" },
      month: { title: "Месячная координата", microBadge: "Рабочий ритм и социальная роль" },
      day: { title: "Ключевая координата", microBadge: "Ядро личности и внутреннее Я" },
      hour: { title: "Часовая координата", microBadge: "Долгий вектор и поздняя энергия" },
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
