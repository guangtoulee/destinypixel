import type { ContentLocale } from "@/lib/report-i18n";

export type EnergyElement = "Wood" | "Fire" | "Earth" | "Metal" | "Water";
export type StyleScene = "wealth" | "career" | "love" | "negotiation";

export type Gemstone = {
  id: string;
  element: EnergyElement;
  name: Record<ContentLocale, string>;
  aura: Record<ContentLocale, string>;
  meaning: Record<ContentLocale, string>;
  color: string;
  accent: string;
  texture: "clear" | "cloud" | "silk" | "grain" | "metallic" | "solid";
};

export const energyElements: EnergyElement[] = [
  "Wood",
  "Fire",
  "Earth",
  "Metal",
  "Water",
];

export const elementStyle = {
  Wood: {
    label: { en: "Wood", zh: "木", ru: "Дерево" },
    tone: { en: "growth", zh: "生长", ru: "рост" },
    colors: {
      en: ["sage green", "jade", "olive", "soft teal"],
      zh: ["鼠尾草绿", "翡翠绿", "橄榄绿", "青绿色"],
      ru: ["шалфейный", "нефритовый", "оливковый", "мягкая бирюза"],
    },
    wardrobe: {
      en: "Use green as the second layer: scarf, inner knit, tote, or shoes. It makes your signal more patient, collaborative, and easier to trust.",
      zh: "适合把绿色放在第二层：围巾、内搭、包、鞋。它会让你的气场更有生长感，也更容易显得愿意合作、可信、能长期推进。",
      ru: "Добавляйте зеленый вторым слоем: шарф, трикотаж, сумка, обувь. Он смягчает сигнал и делает образ более надежным.",
    },
    daily: {
      en: "Start with planning, learning, and outreach. Avoid forcing an instant answer.",
      zh: "今天适合计划、学习、铺关系，不适合硬逼一个立刻的结果。",
      ru: "День подходит для планирования, обучения и контактов. Не выжимайте мгновенный ответ.",
    },
  },
  Fire: {
    label: { en: "Fire", zh: "火", ru: "Огонь" },
    tone: { en: "visibility", zh: "显化", ru: "видимость" },
    colors: {
      en: ["coral", "rose red", "warm orange", "candlelight gold"],
      zh: ["珊瑚色", "玫瑰红", "暖橘", "烛光金"],
      ru: ["коралловый", "розово-красный", "теплый оранжевый", "золотой свет"],
    },
    wardrobe: {
      en: "Use fire colors as a controlled accent: lip color, pocket square, jewelry, nail color, or a small top layer. Too much fire reads as pressure.",
      zh: "火色适合做点睛：唇色、丝巾、首饰、指甲、上衣小面积。火太多会显得压迫，少量反而有存在感。",
      ru: "Огненный цвет лучше как акцент: губы, платок, украшение, ногти. Избыток выглядит давяще.",
    },
    daily: {
      en: "Good for presenting, publishing, flirting, and asking directly. Watch impatience.",
      zh: "今天适合展示、发布、表达好感、直接开口；注意别因为急而说重话。",
      ru: "Хорошо для презентаций, публикаций и прямых просьб. Следите за нетерпением.",
    },
  },
  Earth: {
    label: { en: "Earth", zh: "土", ru: "Земля" },
    tone: { en: "stability", zh: "稳定", ru: "стабильность" },
    colors: {
      en: ["sand", "oat", "camel", "warm stone"],
      zh: ["燕麦色", "沙色", "驼色", "暖石灰"],
      ru: ["песочный", "овсяный", "camel", "теплый камень"],
    },
    wardrobe: {
      en: "Use earth tones for meetings that need credibility: blazer, coat, structured bag, leather belt, or matte shoes.",
      zh: "土色适合用在需要稳重可信的场合：外套、西装、结构感包、皮带、哑光鞋。它补的是定力和落地感。",
      ru: "Земляные тона хороши для доверия: жакет, пальто, структурная сумка, ремень, матовая обувь.",
    },
    daily: {
      en: "Handle logistics, contracts, household tasks, and money discipline. Avoid emotional spending.",
      zh: "今天适合处理流程、合同、家庭事务和财务纪律；避免情绪性消费。",
      ru: "Подходит для логистики, договоров, быта и финансовой дисциплины. Не тратьте на эмоциях.",
    },
  },
  Metal: {
    label: { en: "Metal", zh: "金", ru: "Металл" },
    tone: { en: "precision", zh: "决断", ru: "точность" },
    colors: {
      en: ["pearl white", "silver", "champagne", "cool gray"],
      zh: ["珍珠白", "银色", "香槟色", "冷灰"],
      ru: ["жемчужно-белый", "серебро", "шампань", "холодный серый"],
    },
    wardrobe: {
      en: "Use clean whites, silver, sharp tailoring, and minimal accessories when you need authority without noise.",
      zh: "需要谈判、做决定、立规则时，用白、银、香槟和利落剪裁。金补的是边界、判断和压住场面的能力。",
      ru: "Белый, серебро и четкий крой дают авторитет без лишнего шума.",
    },
    daily: {
      en: "Edit, negotiate, cut excess, set boundaries. Do not over-explain.",
      zh: "今天适合修改、谈判、砍掉多余、设边界；不要解释过度。",
      ru: "Редактируйте, договаривайтесь, убирайте лишнее, ставьте границы. Не переобъясняйте.",
    },
  },
  Water: {
    label: { en: "Water", zh: "水", ru: "Вода" },
    tone: { en: "flow", zh: "流动", ru: "поток" },
    colors: {
      en: ["ink blue", "black", "deep navy", "ice blue"],
      zh: ["墨蓝", "黑色", "深海军蓝", "冰蓝"],
      ru: ["чернильно-синий", "черный", "темный navy", "ледяной голубой"],
    },
    wardrobe: {
      en: "Use dark blue, black, and translucent textures when you need calm strategy, listening, and emotional containment.",
      zh: "需要冷静、谈判、倾听、收住情绪时，用黑、墨蓝、深海军蓝和一点半透明质感。水补的是流动性和判断余地。",
      ru: "Темно-синий, черный и прозрачные фактуры подходят для спокойной стратегии и слушания.",
    },
    daily: {
      en: "Listen first, collect information, then move. Avoid reacting to the first emotional wave.",
      zh: "今天适合先听、先收集信息，再行动；别被第一波情绪带走。",
      ru: "Сначала слушайте и собирайте информацию, потом действуйте. Не реагируйте на первую волну.",
    },
  },
} satisfies Record<
  EnergyElement,
  {
    label: Record<ContentLocale, string>;
    tone: Record<ContentLocale, string>;
    colors: Record<ContentLocale, string[]>;
    wardrobe: Record<ContentLocale, string>;
    daily: Record<ContentLocale, string>;
  }
>;

export const sceneAdvice: Record<StyleScene, Record<ContentLocale, string>> = {
  wealth: {
    en: "Money: keep the main outfit low-noise and add one metal or earth accent. It reads as disciplined, not thirsty.",
    zh: "财运：主穿搭保持低噪音，加一个金或土的点睛色。看起来会更有纪律，不会显得急着求财。",
    ru: "Деньги: спокойная база и один акцент металла или земли. Это выглядит дисциплинированно.",
  },
  career: {
    en: "Career: use your target element near the upper body so people read it before they read the rest of the outfit.",
    zh: "事业：把要补的元素放在上半身附近，让别人第一眼就接收到你的主气场。",
    ru: "Карьера: держите нужную стихию у верхней части тела, чтобы ее считывали первой.",
  },
  love: {
    en: "Love: soften the palette. One warm accent is better than a full dramatic look.",
    zh: "感情：颜色要柔一点，一个暖色点缀比整套强戏剧感更容易让人靠近。",
    ru: "Любовь: смягчите палитру. Один теплый акцент лучше полного драматизма.",
  },
  negotiation: {
    en: "Negotiation: reduce pattern, sharpen lines, and keep the color story to two elements at most.",
    zh: "谈判：减少花纹，线条利落，颜色最多只讲两个元素。越复杂越容易失焦。",
    ru: "Переговоры: меньше принта, четче линии, не больше двух стихий в цвете.",
  },
};

export const gemstoneLibrary: Gemstone[] = [
  {
    id: "citrine",
    element: "Fire",
    name: { en: "Citrine", zh: "黄水晶", ru: "Цитрин" },
    aura: { en: "vitality · wealth", zh: "活力 · 聚财", ru: "сила · достаток" },
    meaning: {
      en: "Brightens action and commercial courage. Best used when the chart needs warmth and forward motion.",
      zh: "强化行动力和商业胆识，适合火弱、需要曝光和推进的人。",
      ru: "Усиливает действие и коммерческую смелость, особенно при нехватке тепла.",
    },
    color: "#d8aa45",
    accent: "#fff1ba",
    texture: "clear",
  },
  {
    id: "green-aventurine",
    element: "Wood",
    name: { en: "Green Aventurine", zh: "绿幽灵", ru: "Зеленый авантюрин" },
    aura: { en: "growth · luck", zh: "生长 · 机会", ru: "рост · шанс" },
    meaning: {
      en: "Adds room for growth, patience, and people luck. Useful when decisions feel too rigid.",
      zh: "补生长、耐心、人缘和机会感，适合木弱或思路太硬的时候。",
      ru: "Добавляет рост, терпение и социальную удачу, когда решения слишком жесткие.",
    },
    color: "#386f4b",
    accent: "#9bc7a5",
    texture: "cloud",
  },
  {
    id: "lapis",
    element: "Water",
    name: { en: "Lapis Lazuli", zh: "青金石", ru: "Лазурит" },
    aura: { en: "clarity · communication", zh: "清醒 · 表达", ru: "ясность · речь" },
    meaning: {
      en: "Supports calm speech, listening, and strategic distance. Good for negotiation and study.",
      zh: "帮助冷静表达、倾听和拉开判断距离，适合谈判、学习和做方案。",
      ru: "Поддерживает спокойную речь, слушание и стратегическую дистанцию.",
    },
    color: "#214785",
    accent: "#c7d9f1",
    texture: "grain",
  },
  {
    id: "clear-quartz",
    element: "Metal",
    name: { en: "Clear Quartz", zh: "白水晶", ru: "Горный хрусталь" },
    aura: { en: "clarity · focus", zh: "净化 · 专注", ru: "ясность · фокус" },
    meaning: {
      en: "Sharpens focus and cleans the signal. A good neutral amplifier for mixed designs.",
      zh: "增强清晰度、专注力和整体净化感，是混搭手串里很稳定的放大器。",
      ru: "Очищает сигнал и усиливает фокус, хороший нейтральный усилитель.",
    },
    color: "#f5f4ee",
    accent: "#d8d6cc",
    texture: "clear",
  },
  {
    id: "tiger-eye",
    element: "Earth",
    name: { en: "Tiger's Eye", zh: "虎眼石", ru: "Тигровый глаз" },
    aura: { en: "grounding · execution", zh: "落地 · 执行", ru: "опора · действие" },
    meaning: {
      en: "Adds grounded execution and risk awareness. Useful when plans are inspiring but scattered.",
      zh: "补落地、执行和风险意识，适合想法多但不够稳定的时候。",
      ru: "Дает опору, исполнение и чувство риска, когда план слишком рассыпан.",
    },
    color: "#7c5a32",
    accent: "#c99a4d",
    texture: "silk",
  },
  {
    id: "amethyst",
    element: "Water",
    name: { en: "Amethyst", zh: "紫水晶", ru: "Аметист" },
    aura: { en: "peace · intuition", zh: "安定 · 直觉", ru: "мир · интуиция" },
    meaning: {
      en: "Cools emotional noise and helps the wearer pause before reacting.",
      zh: "降低情绪噪音，让人先停顿再反应，适合压力大、睡眠浅、思绪多的人。",
      ru: "Охлаждает эмоциональный шум и помогает сделать паузу перед реакцией.",
    },
    color: "#7f54c5",
    accent: "#d7c8ff",
    texture: "cloud",
  },
  {
    id: "red-agate",
    element: "Fire",
    name: { en: "Red Agate", zh: "南红玛瑙", ru: "Красный агат" },
    aura: { en: "warmth · courage", zh: "鸿运 · 勇气", ru: "тепло · смелость" },
    meaning: {
      en: "Warms the field and increases willingness to be seen. Use sparingly when fire is already strong.",
      zh: "提升热度、勇气和被看见的能量。火本来很旺的人建议少量点缀。",
      ru: "Согревает поле и помогает быть видимым. При избытке огня используйте мало.",
    },
    color: "#e85b3a",
    accent: "#ffd0b7",
    texture: "cloud",
  },
  {
    id: "hematite",
    element: "Metal",
    name: { en: "Hematite", zh: "赤铁矿", ru: "Гематит" },
    aura: { en: "boundary · protection", zh: "边界 · 护场", ru: "границы · защита" },
    meaning: {
      en: "Strengthens boundaries and practical focus. Good for high-pressure work and negotiation.",
      zh: "加强边界感和现实专注，适合高压工作、谈判和需要压住场面的时候。",
      ru: "Укрепляет границы и практический фокус, хорошо для давления и переговоров.",
    },
    color: "#303137",
    accent: "#8b8d92",
    texture: "metallic",
  },
  {
    id: "aquamarine",
    element: "Water",
    name: { en: "Aquamarine", zh: "海蓝宝", ru: "Аквамарин" },
    aura: { en: "calm · flow", zh: "安抚 · 流动", ru: "спокойствие · поток" },
    meaning: {
      en: "Softens pressure and helps the wearer speak without emotional flooding.",
      zh: "适合补水的安抚型晶石，帮助人在压力里保持柔和表达，不被情绪淹没。",
      ru: "Смягчает давление и помогает говорить без эмоционального перегруза.",
    },
    color: "#9fd8df",
    accent: "#e9ffff",
    texture: "clear",
  },
  {
    id: "blue-quartz",
    element: "Water",
    name: { en: "Blue Quartz", zh: "蓝水晶", ru: "Голубой кварц" },
    aura: { en: "listening · recovery", zh: "倾听 · 修复", ru: "слушание · восстановление" },
    meaning: {
      en: "A gentle water stone for communication, sleep, and slower decisions.",
      zh: "偏温柔的水性石，适合沟通修复、睡眠放松，以及需要慢一点做决定的时候。",
      ru: "Мягкий водный камень для общения, сна и медленных решений.",
    },
    color: "#7fb5d6",
    accent: "#d9f3ff",
    texture: "cloud",
  },
  {
    id: "black-onyx",
    element: "Water",
    name: { en: "Black Onyx", zh: "黑曜石", ru: "Черный оникс" },
    aura: { en: "containment · shield", zh: "收敛 · 护场", ru: "сдержанность · щит" },
    meaning: {
      en: "Contains scattered emotion and gives a quiet boundary in crowded fields.",
      zh: "帮助收住散乱情绪，在复杂人际和高噪音环境里形成安静边界。",
      ru: "Сдерживает разбросанные эмоции и дает тихую границу.",
    },
    color: "#101116",
    accent: "#72757c",
    texture: "solid",
  },
  {
    id: "moonstone",
    element: "Water",
    name: { en: "Moonstone", zh: "月光石", ru: "Лунный камень" },
    aura: { en: "intuition · rhythm", zh: "直觉 · 节律", ru: "интуиция · ритм" },
    meaning: {
      en: "Supports intuitive timing and emotional rhythm, especially during transitions.",
      zh: "补直觉与情绪节律，适合换阶段、关系变化或需要慢慢找回感觉时佩戴。",
      ru: "Поддерживает интуитивный ритм, особенно в переходные периоды.",
    },
    color: "#d9e2dc",
    accent: "#f7fbff",
    texture: "clear",
  },
  {
    id: "malachite",
    element: "Wood",
    name: { en: "Malachite", zh: "孔雀石", ru: "Малахит" },
    aura: { en: "renewal · courage", zh: "更新 · 勇气", ru: "обновление · смелость" },
    meaning: {
      en: "Encourages growth after a hard stop and helps old patterns move again.",
      zh: "适合木弱或卡住很久的人，帮助旧模式重新流动，给自己一点重新开始的勇气。",
      ru: "Помогает росту после остановки и оживляет старые схемы.",
    },
    color: "#1f7a4c",
    accent: "#8ed1a7",
    texture: "grain",
  },
  {
    id: "jade",
    element: "Wood",
    name: { en: "Jade", zh: "翡翠", ru: "Нефрит" },
    aura: { en: "harmony · longevity", zh: "和合 · 长久", ru: "гармония · долговечность" },
    meaning: {
      en: "A steady wood stone for relationship repair, patience, and long-term cultivation.",
      zh: "温润稳定的木性石，适合关系修复、长期积累，以及需要耐心养成的目标。",
      ru: "Стабильный камень дерева для отношений, терпения и длительного роста.",
    },
    color: "#79b78d",
    accent: "#d5f1d7",
    texture: "cloud",
  },
  {
    id: "prehnite",
    element: "Wood",
    name: { en: "Prehnite", zh: "葡萄石", ru: "Пренит" },
    aura: { en: "gentle growth", zh: "柔性生长", ru: "мягкий рост" },
    meaning: {
      en: "Good for quiet planning, self-care, and rebuilding confidence without forcing speed.",
      zh: "适合柔性成长、慢慢恢复自信和执行力，不用硬逼自己立刻变强。",
      ru: "Для мягкого планирования и восстановления уверенности без давления.",
    },
    color: "#b7d98f",
    accent: "#edf8c9",
    texture: "clear",
  },
  {
    id: "green-phantom",
    element: "Wood",
    name: { en: "Green Phantom Quartz", zh: "绿幽灵聚宝盆", ru: "Зеленый фантом" },
    aura: { en: "career growth", zh: "事业生长", ru: "рост карьеры" },
    meaning: {
      en: "A focused growth stone for career expansion and building visible results.",
      zh: "偏事业生长的木性石，适合项目推进、资源积累和看得见的阶段性成果。",
      ru: "Для карьерного роста, ресурсов и видимого результата.",
    },
    color: "#4b8a59",
    accent: "#c2d9a9",
    texture: "grain",
  },
  {
    id: "garnet",
    element: "Fire",
    name: { en: "Garnet", zh: "石榴石", ru: "Гранат" },
    aura: { en: "vitality · devotion", zh: "气血 · 热情", ru: "жизненность · жар" },
    meaning: {
      en: "Adds warmth, stamina, and relational heat without being as sharp as bright red.",
      zh: "补气血感和热情，但比鲜红更沉稳，适合需要提升吸引力和行动耐力的人。",
      ru: "Добавляет тепло и выносливость без чрезмерной резкости.",
    },
    color: "#8d2431",
    accent: "#ffb1a7",
    texture: "clear",
  },
  {
    id: "sunstone",
    element: "Fire",
    name: { en: "Sunstone", zh: "太阳石", ru: "Солнечный камень" },
    aura: { en: "confidence · visibility", zh: "自信 · 显化", ru: "уверенность · видимость" },
    meaning: {
      en: "Helps the wearer show up, speak first, and take up appropriate space.",
      zh: "帮助人站出来、先开口、适度占据舞台，适合表达与曝光不足的时候。",
      ru: "Помогает проявляться, говорить первым и занимать место.",
    },
    color: "#e48a44",
    accent: "#ffe0a7",
    texture: "silk",
  },
  {
    id: "strawberry-quartz",
    element: "Fire",
    name: { en: "Strawberry Quartz", zh: "草莓晶", ru: "Клубничный кварц" },
    aura: { en: "charm · affection", zh: "桃花 · 亲和", ru: "обаяние · тепло" },
    meaning: {
      en: "A softer fire stone for charm, approachability, and romantic warmth.",
      zh: "柔一点的火性石，适合提升亲和力、桃花感和情绪温度。",
      ru: "Мягкий огонь для обаяния, близости и романтического тепла.",
    },
    color: "#df7c8b",
    accent: "#ffd6df",
    texture: "cloud",
  },
  {
    id: "carnelian",
    element: "Fire",
    name: { en: "Carnelian", zh: "红玉髓", ru: "Сердолик" },
    aura: { en: "action · drive", zh: "行动 · 推进", ru: "действие · импульс" },
    meaning: {
      en: "Turns hesitation into action and is useful when a design needs a brave focal bead.",
      zh: "把犹豫推向行动，适合作为整串里的勇气主珠或小面积点睛。",
      ru: "Переводит сомнение в действие, хорош как смелая центральная бусина.",
    },
    color: "#c6532f",
    accent: "#ffc08a",
    texture: "clear",
  },
  {
    id: "yellow-tiger-eye",
    element: "Earth",
    name: { en: "Yellow Tiger Eye", zh: "黄虎眼", ru: "Желтый тигровый глаз" },
    aura: { en: "focus · execution", zh: "专注 · 执行", ru: "фокус · исполнение" },
    meaning: {
      en: "A practical stone for focus, appetite for work, and measurable progress.",
      zh: "适合补专注、执行和现实推进力，让想法更容易落到可交付的结果上。",
      ru: "Для фокуса, рабочей энергии и измеримого движения.",
    },
    color: "#b98b34",
    accent: "#f3d084",
    texture: "silk",
  },
  {
    id: "smoky-quartz",
    element: "Earth",
    name: { en: "Smoky Quartz", zh: "茶晶", ru: "Раухтопаз" },
    aura: { en: "grounding · release", zh: "扎根 · 释放", ru: "заземление · отпускание" },
    meaning: {
      en: "Grounds mental overload and helps the wearer release unnecessary pressure.",
      zh: "帮助头脑落地、释放不必要压力，适合想太多、睡前还停不下来的人。",
      ru: "Заземляет перегруз и помогает отпускать лишнее давление.",
    },
    color: "#6b5549",
    accent: "#d1b8a7",
    texture: "clear",
  },
  {
    id: "yellow-jasper",
    element: "Earth",
    name: { en: "Yellow Jasper", zh: "黄碧玉", ru: "Желтая яшма" },
    aura: { en: "stability · stamina", zh: "稳定 · 耐力", ru: "стабильность · выносливость" },
    meaning: {
      en: "Adds steady endurance and a less anxious relationship with routine.",
      zh: "补稳定和耐力，适合需要长期坚持、减少焦虑和把日常过稳的人。",
      ru: "Добавляет устойчивость и спокойное отношение к режиму.",
    },
    color: "#c49a4e",
    accent: "#f5de9d",
    texture: "grain",
  },
  {
    id: "petrified-wood",
    element: "Earth",
    name: { en: "Petrified Wood", zh: "木化石", ru: "Окаменелое дерево" },
    aura: { en: "memory · patience", zh: "沉淀 · 耐心", ru: "память · терпение" },
    meaning: {
      en: "Good for slow wealth, family grounding, and long-cycle goals.",
      zh: "适合慢财、家庭稳定和长周期目标，提醒人不要只盯短期刺激。",
      ru: "Для медленного достатка, семьи и долгого цикла.",
    },
    color: "#9a7650",
    accent: "#ddc7a4",
    texture: "grain",
  },
  {
    id: "pyrite",
    element: "Metal",
    name: { en: "Pyrite", zh: "黄铁矿", ru: "Пирит" },
    aura: { en: "wealth · will", zh: "财富 · 意志", ru: "достаток · воля" },
    meaning: {
      en: "A metal-rich wealth signal for discipline, commercial confidence, and strong edges.",
      zh: "偏金的财富信号，补纪律、商业信心和清晰边界，适合做主珠或隔珠。",
      ru: "Металлический сигнал достатка, дисциплины и ясных границ.",
    },
    color: "#b99b45",
    accent: "#fff0a5",
    texture: "metallic",
  },
  {
    id: "silver-obsidian",
    element: "Metal",
    name: { en: "Silver Obsidian", zh: "银曜石", ru: "Серебряный обсидиан" },
    aura: { en: "mirror · boundary", zh: "照见 · 边界", ru: "зеркало · граница" },
    meaning: {
      en: "Reflects noise back outward and supports clean decisions in complicated rooms.",
      zh: "帮助把外界噪音反射出去，适合复杂场合里保持判断和边界。",
      ru: "Отражает шум наружу и поддерживает чистые решения.",
    },
    color: "#2d3138",
    accent: "#c6c8cd",
    texture: "metallic",
  },
  {
    id: "white-mother-pearl",
    element: "Metal",
    name: { en: "Mother of Pearl", zh: "白贝母", ru: "Перламутр" },
    aura: { en: "refinement · grace", zh: "精致 · 柔光", ru: "изящество · мягкий свет" },
    meaning: {
      en: "A softer metal for elegance, social polish, and gentle authority.",
      zh: "柔一点的金，适合精致感、社交礼貌和不强硬但有分寸的权威。",
      ru: "Мягкий металл для изящества, светской полировки и спокойного авторитета.",
    },
    color: "#f3eee5",
    accent: "#d8c6aa",
    texture: "silk",
  },
  {
    id: "rutilated-quartz",
    element: "Metal",
    name: { en: "Rutilated Quartz", zh: "钛晶", ru: "Рутиловый кварц" },
    aura: { en: "amplify · decision", zh: "放大 · 决断", ru: "усиление · решение" },
    meaning: {
      en: "A bright amplifier for decision power, wealth intention, and visible momentum.",
      zh: "放大决策力和财富意图，适合需要强主珠、强存在感的组合。",
      ru: "Яркий усилитель решения, достатка и видимого импульса.",
    },
    color: "#e3c267",
    accent: "#fff4bf",
    texture: "silk",
  },
];

export function strongestElement(balance: Record<string, number>): EnergyElement {
  return energyElements.reduce((best, element) =>
    Number(balance[element] ?? 0) > Number(balance[best] ?? 0) ? element : best,
  );
}

export function weakestElement(balance: Record<string, number>): EnergyElement {
  return energyElements.reduce((weakest, element) =>
    Number(balance[element] ?? 0) < Number(balance[weakest] ?? 0) ? element : weakest,
  );
}

export function targetElement(
  balance: Record<string, number>,
  missingElements: string[] = [],
): EnergyElement {
  const missing = energyElements.find((element) => missingElements.includes(element));

  return missing ?? weakestElement(balance);
}

export function getDailyElement(date = new Date()): EnergyElement {
  const seed = Math.floor(date.getTime() / 86_400_000);

  return energyElements[((seed % energyElements.length) + energyElements.length) % energyElements.length];
}

export function getGemstonesForElement(element: EnergyElement) {
  return gemstoneLibrary.filter((stone) => stone.element === element);
}

export function elementPercentages(balance: Record<string, number>) {
  const total = energyElements.reduce((sum, element) => sum + Number(balance[element] ?? 0), 0) || 1;

  return energyElements.map((element) => ({
    element,
    value: Number(balance[element] ?? 0),
    percent: Math.round((Number(balance[element] ?? 0) / total) * 100),
  }));
}
