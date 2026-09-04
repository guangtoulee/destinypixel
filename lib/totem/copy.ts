import type { ElementName } from "@/lib/core/mappings";
import { contentLocale, type ReportLocale } from "@/lib/report-i18n";
import type {
  FunctionModuleKey,
  PillarKey,
  ResonanceKey,
  StructureState,
  TotemLayer,
  TotemMetricKey,
  TotemPart,
} from "@/lib/totem/types";

const zh = {
  languageLabel: "语言",
  backHome: "返回 DestinyPixel",
  product: "本命灵构",
  productEn: "Birth Totem",
  original: "DestinyPixel 原创解释系统",
  heroEyebrow: "BIRTH STRUCTURE · GENERATIVE SYMBOL",
  heroTitle: "看见你的本命灵构",
  heroLead:
    "输入出生坐标，四柱、五行、阴阳与十神会先在本地变成一枚可探索的几何生命。它不是定论，而是一张关于倾向、阻力与练习通路的结构图。",
  heroQuote: "看见你出生时留下的第一道形状。",
  philosophy: "关系给图腾能量，练习给图腾布线，选择决定能量流向何处。",
  disclaimer:
    "本命灵构是 DestinyPixel 的原创八字图形化解释层，不是传统命理中的既有图腾学说，也不是科学认证的能力测验。",
  form: {
    title: "输入出生坐标",
    lead: "沿用本站八字引擎、城市时区和真太阳时校正。计算在本地立即完成。",
    name: "称呼（可选）",
    namePlaceholder: "仅用于本页显示",
    date: "出生日期",
    time: "出生时间",
    gender: "生理性别",
    female: "女",
    male: "男",
    city: "出生城市",
    cityPlaceholder: "请选择城市",
    submit: "生成本命初相",
    privacy: "姓名、日期、时间和地点不会写入分享链接，也不会因生成图腾而发送给 AI。",
    cityNote: "首版使用站内已校准城市；接近时辰边界的海外出生记录应谨慎解释。",
    errors: {
      missing: "请完整填写日期、时间、性别和城市。",
      range: "请输入 1900 年至今的有效日期与时间。",
      future: "出生日期不能晚于今天。",
      city: "请选择列表中的城市。",
      calculate: "这组出生信息暂时无法排盘，请检查后重试。",
    },
  },
  ritual: {
    title: "初相正在接通",
    stages: ["校准太阳时", "定位四重坐标", "展开藏线", "接通能量端口"],
    skip: "跳过显形",
  },
  phases: { natal: "本命初相", current: "当下今相" },
  phaseNote: {
    natal: "只显示出生结构，不受校相影响。",
    current: "出生结构不变，只改变后天练习线路的通透状态。",
  },
  layers: {
    overview: "灵构总览",
    pillars: "四柱结构",
    elements: "五行流动",
    functions: "十神模块",
    resonance: "能力共振",
  } satisfies Record<TotemLayer, string>,
  toolbar: {
    zoomIn: "放大",
    zoomOut: "缩小",
    reset: "重置视图",
    png: "保存高清 PNG",
    svg: "导出 SVG",
    share: "分享",
    exporting: "正在生成",
    shared: "已打开系统分享",
    copied: "结果链接已复制，仅含衍生结构，不含姓名、日期、时间和地点",
    exportError: "导出失败，请换用现代浏览器重试。",
  },
  chart: {
    title: "可交互本命图腾",
    instruction: "点击结构查看来源；用 Tab、Enter 或空格也可探索。",
    fingerprint: "结构指纹",
    trueSolar: "真太阳时",
    derivedShare: "隐私分享 · 仅衍生结构",
    pillars: "四柱",
  },
  metricsTitle: "四个结构维度",
  metricsLead: "复杂不等于强，简单也不等于弱。四个维度分别计算。",
  metrics: {
    complexity: { label: "复杂度", note: "结构、支路与功能种类" },
    connectivity: { label: "连通度", note: "线路是否真正接通" },
    stability: { label: "稳定度", note: "能量能否持续输出" },
    depth: { label: "深度", note: "支撑接近表层还是核心" },
  } satisfies Record<TotemMetricKey, { label: string; note: string }>,
  resonanceTitle: "能力共振轨道",
  resonanceLead:
    "这里显示的是较容易形成的通路，不是智力排名或职业判定。点击一个端口，会同时点亮它的结构来源。",
  calibration: {
    eyebrow: "OPTIONAL CALIBRATION",
    title: "把后天练习接进图腾",
    lead:
      "按你最近半年的真实状态调整八项滑杆。低值只表示当前少用或受阻，高值也可能意味着过载。",
    low: "暂少",
    middle: "稳定",
    high: "高频",
    apply: "生成当下今相",
    reset: "清除校相",
    applied: "今相已接通，可与初相切换比较。",
  },
  inspector: {
    emptyTitle: "选择一段结构",
    emptyLead: "每个主要节点、线段和环都能解释其来源与现实含义。",
    source: "命理来源",
    shape: "为何是这种形状",
    fluent: "顺畅时",
    imbalance: "受阻或过载时",
    practice: "通相练习",
    close: "关闭解释",
  },
  states: {
    connected: "已接通",
    latent: "潜在线路",
    tension: "受阻",
    overload: "过载",
  } satisfies Record<StructureState, string>,
  footer:
    "出生结构提供起点，后天经验决定线路如何被使用。请把结果当成观察工具，而不是给自己定型。",
};

const en: typeof zh = {
  languageLabel: "Language",
  backHome: "Back to DestinyPixel",
  product: "Birth Totem",
  productEn: "Totem Matrix",
  original: "An original DestinyPixel interpretation system",
  heroEyebrow: "BIRTH STRUCTURE · GENERATIVE SYMBOL",
  heroTitle: "See the first shape your birth left behind",
  heroLead:
    "Enter your birth coordinates. The Four Pillars, five elements, polarity, and Ten Gods become an explorable geometric life form—locally and immediately. It is a map of tendencies, friction, and practice routes, not a verdict.",
  heroQuote: "See the first shape your birth left behind.",
  philosophy: "Relationships supply energy. Practice wires the routes. Choice directs the flow.",
  disclaimer:
    "Birth Totem is DestinyPixel’s original visual interpretation layer. It is neither an established school of traditional Bazi nor a scientifically validated ability test.",
  form: {
    title: "Enter birth coordinates",
    lead: "Uses the site’s existing Bazi engine, city time zones, and true-solar-time correction.",
    name: "Display name (optional)",
    namePlaceholder: "Shown only on this page",
    date: "Birth date",
    time: "Birth time",
    gender: "Sex",
    female: "Female",
    male: "Male",
    city: "Birth city",
    cityPlaceholder: "Select a city",
    submit: "Generate natal form",
    privacy: "Name, date, time, and location are never put in the share link or sent to AI for this visualization.",
    cityNote: "Version one uses calibrated cities in our index. Treat overseas records near an hour boundary cautiously.",
    errors: {
      missing: "Complete the date, time, sex, and city fields.",
      range: "Enter a valid date and time from 1900 through today.",
      future: "Birth date cannot be in the future.",
      city: "Select a city from the list.",
      calculate: "This birth record could not be calculated. Check the fields and try again.",
    },
  },
  ritual: {
    title: "Connecting the natal form",
    stages: ["Correcting solar time", "Locating four coordinates", "Unfolding hidden routes", "Connecting energy ports"],
    skip: "Skip reveal",
  },
  phases: { natal: "Natal Form", current: "Current Form" },
  phaseNote: {
    natal: "Birth structure only; calibration cannot alter it.",
    current: "The birth structure stays fixed while practiced routes change state.",
  },
  layers: {
    overview: "Totem overview",
    pillars: "Four Pillars",
    elements: "Element flow",
    functions: "Function modules",
    resonance: "Ability resonance",
  },
  toolbar: {
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Reset view",
    png: "Save HD PNG",
    svg: "Export SVG",
    share: "Share",
    exporting: "Exporting",
    shared: "System share opened",
    copied: "Result link copied; it contains derived structure, not name, date, time, or location",
    exportError: "Export failed. Try again in a modern browser.",
  },
  chart: {
    title: "Interactive Birth Totem",
    instruction: "Select a structure for its source. Tab, Enter, and Space work too.",
    fingerprint: "Structure fingerprint",
    trueSolar: "True solar time",
    derivedShare: "Private share · derived structure only",
    pillars: "Pillars",
  },
  metricsTitle: "Four structural dimensions",
  metricsLead: "Complex does not mean strong; simple does not mean weak. Each dimension is calculated separately.",
  metrics: {
    complexity: { label: "Complexity", note: "Number of structures and functions" },
    connectivity: { label: "Connectivity", note: "Whether routes actually connect" },
    stability: { label: "Stability", note: "Whether output can be sustained" },
    depth: { label: "Depth", note: "Surface signal or core rule" },
  },
  resonanceTitle: "Ability resonance orbit",
  resonanceLead:
    "These are routes that may connect more readily—not an intelligence rank or career verdict. Select a port to reveal its contributing structures.",
  calibration: {
    eyebrow: "OPTIONAL CALIBRATION",
    title: "Wire practice into the form",
    lead: "Rate your real experience over the last six months. Low means less-used or blocked; high can also mean overloaded.",
    low: "Less used",
    middle: "Steady",
    high: "Frequent",
    apply: "Generate current form",
    reset: "Clear calibration",
    applied: "Current form connected. Toggle it against the natal form.",
  },
  inspector: {
    emptyTitle: "Select a structure",
    emptyLead: "Every major node, route, and ring can explain its source and practical meaning.",
    source: "Source",
    shape: "Why this shape",
    fluent: "When flowing",
    imbalance: "When blocked or overloaded",
    practice: "Practice route",
    close: "Close explanation",
  },
  states: {
    connected: "Connected",
    latent: "Latent",
    tension: "Strained",
    overload: "Overloaded",
  },
  footer:
    "Birth structure supplies a starting point; lived experience decides how the routes are used. Treat this as an observation tool, not a fixed identity.",
};

const ru: typeof zh = {
  ...en,
  languageLabel: "Язык",
  backHome: "Назад в DestinyPixel",
  product: "Тотем рождения",
  productEn: "Birth Totem",
  original: "Авторская система интерпретации DestinyPixel",
  heroEyebrow: "СТРУКТУРА РОЖДЕНИЯ · ГЕНЕРАТИВНЫЙ СИМВОЛ",
  heroTitle: "Увидьте первую форму, оставленную рождением",
  heroLead:
    "Введите координаты рождения. Четыре Столпа, пять элементов, инь-ян и Десять Богов сразу превращаются в интерактивную геометрическую форму. Это карта склонностей и практики, а не приговор.",
  heroQuote: "Увидьте первую форму, оставленную рождением.",
  philosophy: "Отношения дают энергию. Практика соединяет линии. Выбор задаёт направление.",
  disclaimer:
    "Тотем рождения — авторский визуальный слой DestinyPixel, а не традиционная школа Бацзы и не научно подтверждённый тест способностей.",
  form: {
    ...en.form,
    title: "Введите координаты рождения",
    lead: "Используются существующий движок Бацзы, часовые пояса и коррекция истинного солнечного времени.",
    name: "Имя на экране (необязательно)",
    namePlaceholder: "Только для этой страницы",
    date: "Дата рождения",
    time: "Время рождения",
    gender: "Пол",
    female: "Женский",
    male: "Мужской",
    city: "Город рождения",
    cityPlaceholder: "Выберите город",
    submit: "Создать начальную форму",
    privacy: "Имя, дата, время и место не попадают в ссылку и не отправляются ИИ.",
    cityNote: "Первая версия использует проверенные города из внутреннего списка.",
    errors: {
      missing: "Заполните дату, время, пол и город.",
      range: "Введите корректные дату и время, начиная с 1900 года.",
      future: "Дата рождения не может быть в будущем.",
      city: "Выберите город из списка.",
      calculate: "Не удалось рассчитать данные. Проверьте поля и повторите.",
    },
  },
  ritual: {
    title: "Соединяем начальную форму",
    stages: ["Коррекция солнечного времени", "Четыре координаты", "Скрытые линии", "Энергетические порты"],
    skip: "Пропустить проявление",
  },
  phases: { natal: "Начальная форма", current: "Текущая форма" },
  phaseNote: {
    natal: "Только структура рождения; калибровка её не меняет.",
    current: "Основа остаётся прежней, меняется состояние практикуемых линий.",
  },
  layers: {
    overview: "Общий вид",
    pillars: "Четыре Столпа",
    elements: "Поток элементов",
    functions: "Функциональные модули",
    resonance: "Резонанс способностей",
  },
  toolbar: {
    zoomIn: "Увеличить",
    zoomOut: "Уменьшить",
    reset: "Сбросить вид",
    png: "Сохранить PNG",
    svg: "Экспорт SVG",
    share: "Поделиться",
    exporting: "Экспорт",
    shared: "Открыто системное меню",
    copied: "Ссылка на результат скопирована; в ней нет имени, даты, времени или места",
    exportError: "Не удалось экспортировать. Используйте современный браузер.",
  },
  chart: {
    title: "Интерактивный тотем рождения",
    instruction: "Нажмите на структуру. Также доступны Tab, Enter и пробел.",
    fingerprint: "Отпечаток структуры",
    trueSolar: "Солнечное время",
    derivedShare: "Приватная ссылка · только производная структура",
    pillars: "Столпы",
  },
  metricsTitle: "Четыре измерения структуры",
  metricsLead: "Сложность не равна силе, а простота — слабости. Показатели рассчитываются отдельно.",
  metrics: {
    complexity: { label: "Сложность", note: "Количество структур и функций" },
    connectivity: { label: "Связность", note: "Какие линии действительно соединены" },
    stability: { label: "Стабильность", note: "Насколько устойчив выход энергии" },
    depth: { label: "Глубина", note: "Поверхностный сигнал или внутреннее правило" },
  },
  resonanceTitle: "Орбита резонансов",
  resonanceLead: "Это склонности к соединению, а не рейтинг интеллекта или выбор профессии.",
  calibration: {
    eyebrow: "НЕОБЯЗАТЕЛЬНАЯ КАЛИБРОВКА",
    title: "Добавьте линии практики",
    lead: "Оцените реальный опыт последних шести месяцев. Высокое значение тоже может означать перегрузку.",
    low: "Редко",
    middle: "Стабильно",
    high: "Часто",
    apply: "Создать текущую форму",
    reset: "Очистить калибровку",
    applied: "Текущая форма подключена. Сравните её с начальной.",
  },
  inspector: {
    emptyTitle: "Выберите структуру",
    emptyLead: "Каждый важный узел, маршрут и контур объясняет источник и практический смысл.",
    source: "Источник",
    shape: "Почему такая форма",
    fluent: "При свободном потоке",
    imbalance: "При блокировке или перегрузке",
    practice: "Практика",
    close: "Закрыть объяснение",
  },
  states: {
    connected: "Соединено",
    latent: "Скрыто",
    tension: "Напряжено",
    overload: "Перегружено",
  },
  footer: "Структура рождения — это начало; жизненный опыт определяет использование линий. Это инструмент наблюдения, а не ярлык.",
};

export type TotemCopy = typeof zh;

export function getTotemCopy(locale: ReportLocale): TotemCopy {
  const normalized = contentLocale(locale);
  if (normalized === "zh") return zh;
  if (normalized === "ru") return ru;
  return en;
}

export const elementNames: Record<"zh" | "en" | "ru", Record<ElementName, string>> = {
  zh: { Wood: "木", Fire: "火", Earth: "土", Metal: "金", Water: "水" },
  en: { Wood: "Wood", Fire: "Fire", Earth: "Earth", Metal: "Metal", Water: "Water" },
  ru: { Wood: "Дерево", Fire: "Огонь", Earth: "Земля", Metal: "Металл", Water: "Вода" },
};

export const pillarNames: Record<"zh" | "en" | "ru", Record<PillarKey, string>> = {
  zh: { year: "年柱 · 祖源外壳", month: "月柱 · 成长驱动", day: "日柱 · 本命核心", hour: "时柱 · 未来出口" },
  en: { year: "Year · origin shell", month: "Month · social drive", day: "Day · natal core", hour: "Hour · future outlet" },
  ru: { year: "Год · внешняя оболочка", month: "Месяц · социальный импульс", day: "День · ядро", hour: "Час · будущий выход" },
};

export const functionNames: Record<"zh" | "en" | "ru", Record<FunctionModuleKey, string>> = {
  zh: { agency: "自我驱动", expression: "表达创造", exchange: "资源交换", structure: "秩序决断", insight: "学习洞察" },
  en: { agency: "Agency", expression: "Expression", exchange: "Exchange", structure: "Structure", insight: "Insight" },
  ru: { agency: "Инициатива", expression: "Выражение", exchange: "Обмен", structure: "Порядок", insight: "Понимание" },
};

export const resonanceNames: Record<"zh" | "en" | "ru", Record<ResonanceKey, string>> = {
  zh: {
    language: "语言表达",
    logic: "数学逻辑",
    visual: "视觉空间",
    kinesthetic: "身体运动",
    musical: "音乐节奏",
    interpersonal: "人际感知",
    intrapersonal: "内省觉察",
    naturalistic: "自然观察",
  },
  en: {
    language: "Language",
    logic: "Logic",
    visual: "Visual space",
    kinesthetic: "Movement",
    musical: "Musical rhythm",
    interpersonal: "Interpersonal",
    intrapersonal: "Self-reflection",
    naturalistic: "Nature observation",
  },
  ru: {
    language: "Язык",
    logic: "Логика",
    visual: "Пространство",
    kinesthetic: "Движение",
    musical: "Ритм",
    interpersonal: "Отношения",
    intrapersonal: "Саморефлексия",
    naturalistic: "Наблюдение природы",
  },
};

function localeKey(locale: ReportLocale): "zh" | "en" | "ru" {
  return contentLocale(locale);
}

function partTitle(part: TotemPart, locale: ReportLocale) {
  const key = localeKey(locale);
  if (part.resonance) return resonanceNames[key][part.resonance];
  if (part.functionModule && part.kind === "function-port") return functionNames[key][part.functionModule];
  if (part.pillar && (part.kind === "pillar-stem" || part.kind === "pillar-branch" || part.kind === "hidden-stem")) {
    const suffix =
      key === "zh"
        ? part.kind === "pillar-stem"
          ? "天干主笔"
          : part.kind === "pillar-branch"
            ? "地支关节"
            : "藏干支路"
        : key === "ru"
          ? part.kind === "pillar-stem"
            ? "верхняя линия"
            : part.kind === "pillar-branch"
              ? "земной узел"
              : "скрытая ветвь"
          : part.kind === "pillar-stem"
            ? "stem stroke"
            : part.kind === "pillar-branch"
              ? "branch joint"
              : "hidden route";
    return `${pillarNames[key][part.pillar]} · ${suffix}`;
  }
  const kindNames = {
    zh: { boundary: "出生外壳", core: "本命轴", "element-flow": "元素关系线", "practice-line": "后天练习线" },
    en: { boundary: "Birth shell", core: "Natal axis", "element-flow": "Element relation", "practice-line": "Practice route" },
    ru: { boundary: "Оболочка рождения", core: "Ось ядра", "element-flow": "Связь элементов", "practice-line": "Линия практики" },
  } as const;
  return kindNames[key][part.kind as keyof (typeof kindNames)["zh"]] ?? part.id;
}

export function getPartAriaLabel(part: TotemPart, locale: ReportLocale) {
  return `${partTitle(part, locale)} · ${getTotemCopy(locale).states[part.state]}`;
}

export type PartExplanation = {
  title: string;
  source: string;
  shape: string;
  fluent: string;
  imbalance: string;
  practice: string;
};

export function explainTotemPart(part: TotemPart, locale: ReportLocale): PartExplanation {
  const key = localeKey(locale);
  const title = partTitle(part, locale);
  const element = part.element ? elementNames[key][part.element] : "";
  const pillar = part.pillar ? pillarNames[key][part.pillar] : "";
  const module = part.functionModule ? functionNames[key][part.functionModule] : "";
  const resonance = part.resonance ? resonanceNames[key][part.resonance] : "";
  const tenGodList = part.tenGods?.join(key === "en" ? ", " : "、") ?? part.tenGod ?? "";
  const relationPillars = part.relationPillars
    ?.map((pillarKey) => pillarNames[key][pillarKey])
    .join(key === "en" ? " ↔ " : " ↔ ");
  const relationLabels = {
    zh: {
      "same-symbol": "同干或同支重复",
      "stem-combination": "天干五合",
      "branch-harmony": "地支六合",
      "branch-clash": "地支六冲",
      "same-element": "同五行呼应",
      "producing-cycle": "五行相生",
      "controlling-cycle": "五行相克",
      diffusion: "未形成直接生合",
    },
    en: {
      "same-symbol": "a repeated stem or branch",
      "stem-combination": "a Heavenly-Stem combination",
      "branch-harmony": "an Earthly-Branch harmony",
      "branch-clash": "an Earthly-Branch clash",
      "same-element": "a shared element",
      "producing-cycle": "the producing cycle",
      "controlling-cycle": "the controlling cycle",
      diffusion: "no direct producing or combining relation",
    },
    ru: {
      "same-symbol": "повтор ствола или ветви",
      "stem-combination": "сочетание Небесных стволов",
      "branch-harmony": "гармония Земных ветвей",
      "branch-clash": "столкновение Земных ветвей",
      "same-element": "общий элемент",
      "producing-cycle": "цикл порождения",
      "controlling-cycle": "цикл контроля",
      diffusion: "отсутствие прямого порождения или сочетания",
    },
  } as const;
  const relationDetail = part.relationDetail
    ? relationLabels[key][part.relationDetail]
    : part.relation ?? "structural";

  if (key === "zh") {
    const source = part.kind === "boundary"
      ? "来自四柱地支索引、五行分布与稳定结构种子；它是整张初相的外部容器。"
      : part.kind === "core"
      ? `来自日主 ${part.stem ?? ""}，五行属${element}，${part.polarity === "Yang" ? "阳性外放" : "阴性内收"}。`
      : part.kind === "element-flow"
        ? `连接${relationPillars ?? "两组柱位"}；依据明干、地支与五行关系判定为“${relationDetail}”。`
        : part.kind === "function-port"
          ? `由十神 ${tenGodList || "未显"} 聚合成“${module}”功能模块；明干与藏干位置共同决定端口亮度。`
          : part.kind === "resonance-port" || part.kind === "practice-line"
            ? `由${module || "相关功能"}与${element || "相关五行"}共同参与“${resonance}”通路。`
            : `${pillar}${part.stem ? `，天干或藏干为 ${part.stem}` : ""}${part.branch ? `，地支为 ${part.branch}` : ""}${part.tenGod ? `，十神为 ${part.tenGod}` : ""}${element ? `，五行属${element}` : ""}。`;
    const shape = part.kind === "boundary"
      ? "外壳半径由四个地支、五行视觉权重和稳定哈希共同生成，所以不同命盘会改变轮廓，而不是只换颜色。"
      : part.kind === "core"
        ? "十个日干使用十种不同的核心笔画语法；阴阳只改变曲直与虚实，不代表好坏。"
        : part.kind === "hidden-stem"
          ? `支路数量严格对应地支藏干。${part.state === "connected" ? "这条藏干也在明干出现，因此端点更亮。" : "它未透到表层，因此停在内圈。"}`
          : part.kind === "pillar-branch"
            ? "地支决定关节位置、容器大小与藏线槽位；月柱另形成承重环。"
            : part.kind === "pillar-stem"
              ? "天干变成主笔画；阳干更直、更外放，阴干更弯、更内收。"
              : part.kind === "element-flow"
                ? "实线表示较顺的生扶，断续线表示制约、冲或尚未稳定接通。"
                : part.kind === "function-port"
                  ? "端口大小来自该功能在明干与藏干中的聚合权重，与整体复杂度无关。"
                  : "外部轨道是能力参与端口，连接线指回实际参与它的功能与五行结构。";
    const fluentByModule: Record<FunctionModuleKey, string> = {
      agency: "能较早察觉自己的意愿，并把边界转成行动，不必靠持续对抗证明自己。",
      expression: "想法能被组织成语言、画面、节奏或作品，输出具有连续性。",
      exchange: "能看清时间、资源与关系中的交换条件，并把判断落实到现实安排。",
      structure: "压力会被转成优先级、规则和决断，而不是只剩紧绷或服从。",
      insight: "信息能够沉淀成方法和判断，观察不会停在反复揣测。",
    };
    const fluent = part.kind === "boundary"
      ? "边界能稳定容纳不同功能，不需要靠增加结构数量来证明力量。"
      : part.kind === "element-flow"
      ? part.relation === "support"
        ? "两端可以互相供能，行动通常不必频繁重启。"
        : part.relation === "echo"
          ? "重复结构能形成专注、熟练度和持续推进。"
          : "能看见摩擦的来源，并为不同要求安排先后顺序。"
      : part.resonance
        ? `“${resonance}”能调用多条来源，不必只靠单一习惯硬撑。`
        : fluentByModule[part.functionModule ?? "insight"];
    const imbalance = part.state === "overload"
      ? "能量过度集中时，会挤压其他线路：熟练可能变成控制、重复或停不下来的输出。"
      : part.state === "tension"
        ? "两种要求同时拉扯时，常见表现是启动困难、反复修改，或先承担压力再表达需要。"
        : part.state === "latent"
          ? "线路存在但暂未接到表层；压力下可能绕远路、借别人完成，或误以为自己没有这项能力。"
          : "顺畅并不等于永远充足；若持续透支，已接通线路也会出现迟钝和机械重复。";
    const practice = part.resonance
      ? `连续两周为“${resonance}”安排一次小而可完成的练习，并记录开始前后的耗能差异。`
      : part.functionModule === "expression"
        ? "把一次想法压缩成可交付的小作品，先完成闭环，再追求风格。"
        : part.functionModule === "agency"
          ? "在一个低风险选择里先说清“我的需求、我的拒绝”，再行动。"
          : part.functionModule === "exchange"
            ? "为一项投入写下时间、成本、回报与退出条件，减少含糊交换。"
            : part.functionModule === "structure"
              ? "把一件压力任务拆成明确边界、截止时间和第一步，避免只靠意志硬顶。"
              : "每天固定十分钟记录事实、解释与感受，把观察从反刍变成可验证判断。";
    return { title, source, shape, fluent, imbalance, practice };
  }

  if (key === "ru") {
    return {
      title,
      source: part.kind === "boundary"
        ? "Внешний контейнер рассчитан из четырёх ветвей, распределения элементов и стабильного структурного ключа."
        : part.kind === "element-flow"
          ? `Связь ${relationPillars ?? "двух столпов"}: ${relationDetail}.`
          : part.kind === "function-port"
            ? `Модуль «${module}» объединяет Десять Богов: ${tenGodList || "нет явного проявления"}.`
          : part.resonance
        ? `Маршрут «${resonance}» соединяет модуль «${module}» и элемент ${element}.`
        : `${pillar || "Структурный слой"}${part.stem ? `, ствол ${part.stem}` : ""}${part.branch ? `, ветвь ${part.branch}` : ""}${element ? `, элемент ${element}` : ""}.`,
      shape: part.kind === "hidden-stem"
        ? "Число внутренних линий точно следует скрытым стволам земной ветви."
        : "Форма строится из фиксированных правил и стабильного хеша, поэтому повторный расчёт не меняет геометрию.",
      fluent: part.resonance
        ? `Несколько источников могут поддерживать маршрут «${resonance}», а не одна привычка.`
        : "Энергия переводится в наблюдаемое действие без постоянного перезапуска.",
      imbalance: part.state === "overload"
        ? "Слишком сильная концентрация вытесняет другие способы действия и превращает навык в повторение."
        : "При напряжении линия может уходить в обход, задерживать старт или требовать лишнего контроля.",
      practice: `Выберите одно небольшое повторяемое действие для «${resonance || module || title}» на две недели и отмечайте расход энергии.`,
    };
  }

  return {
    title,
    source: part.kind === "boundary"
      ? "The outer container is calculated from all four branches, the element distribution, and a stable structural seed."
      : part.kind === "core"
      ? `Day Master ${part.stem ?? ""}, ${element}, with ${part.polarity?.toLowerCase()} directionality.`
      : part.kind === "element-flow"
        ? `${relationPillars ?? "Two pillars"} are linked through ${relationDetail}, derived from their visible stems, branches, and elements.`
        : part.kind === "function-port"
          ? `${module} aggregates ${tenGodList || "no strongly visible Ten God"}; visible and hidden positions set the port intensity.`
        : part.resonance
          ? `${resonance} draws on ${module || "several functions"} and ${element || "several elements"}.`
          : `${pillar || "Structural layer"}${part.stem ? `; stem ${part.stem}` : ""}${part.branch ? `; branch ${part.branch}` : ""}${part.tenGod ? `; Ten God ${part.tenGod}` : ""}${element ? `; ${element}` : ""}.`,
    shape: part.kind === "boundary"
      ? "The shell radius combines four branch indices, visual element weights, and a stable keyed hash—so charts change silhouette, not merely color."
      : part.kind === "core"
        ? "Each Day Stem uses a distinct core-stroke grammar. Yin and Yang change curvature and direction, not worth."
        : part.kind === "hidden-stem"
          ? "The number of inner routes exactly matches the branch’s hidden stems; visible correspondence makes a terminal brighter."
          : part.kind === "element-flow"
            ? "Continuous routes show support; interrupted routes show constraint, clash, or energy that has not stabilized."
            : "Its size and position come from explicit structural weights and the deterministic fingerprint."
    ,
    fluent: part.resonance
      ? `${resonance} can recruit several sources instead of relying on one habit under pressure.`
      : part.functionModule === "expression"
        ? "Ideas become language, image, rhythm, or finished output with a repeatable cadence."
        : part.functionModule === "agency"
          ? "Desire and boundaries become action without constant confrontation."
          : part.functionModule === "exchange"
            ? "Resources, time, and relationship terms are made explicit and coordinated."
            : part.functionModule === "structure"
              ? "Pressure becomes priorities, rules, and timely decisions."
              : "Observation settles into a usable model instead of endless interpretation.",
    imbalance: part.state === "overload"
      ? "Concentration can crowd out other routes; competence becomes control, repetition, or output that cannot stop."
      : part.state === "latent"
        ? "The route exists but is not reaching the surface consistently; this is not absence or a fixed limit."
        : "Competing demands can delay action, trigger repeated revisions, or make control substitute for clarity.",
    practice: part.resonance
      ? `Give ${resonance} one small, finishable practice each week for two weeks, then compare effort before and after.`
      : "Choose one low-risk situation, name the desired outcome and constraint, then complete one observable step.",
  };
}
