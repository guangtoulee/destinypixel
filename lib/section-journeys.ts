import type { ReportLocale } from "./report-i18n";
import { toTraditional } from "./journal-locales";

export const sectionKeys = ["discover", "sticks", "compatibility"] as const;
export type SectionKey = (typeof sectionKeys)[number] | "atelier";

export function sectionHref(path: string, locale: ReportLocale) {
  return locale === "en" ? path : `${path}?locale=${locale}`;
}

type Section = { name: string; title: string; body: string; action: string; result: string; next: string };
type Copy = {
  eyebrow: string;
  title: string;
  intro: string;
  paths: string;
  nav: string;
  guides: string;
  more: string;
  journal: string;
  learn: string;
  report: string;
  reportNote: string;
  sections: Record<SectionKey, Section>;
};

const en: Copy = {
  eyebrow: "CELESTIAL MANUSCRIPT · EAST & WEST OBSERVATORY",
  title: "Read the pattern of your birth.\nReflect on what asks today.",
  intro: "Meet your 60-cycle Day Pillar portrait, open the Mountain-Lake Tarot table, draw a temple fortune stick, cast I Ching lines, or compare two birth charts with honest calculation boundaries.",
  paths: "Three chapters of inquiry",
  nav: "Explore DestinyPixel",
  guides: "Read a little further",
  more: "All tools",
  journal: "Journal",
  learn: "How it works",
  report: "Explore your full birth map",
  reportNote: "Already met your birthday archetype? Add your local birth time and city to calibrate true solar time across Four Pillars BaZi and tropical astrology. Free previews and the optional full report are clearly explained upfront.",
  sections: {
    discover: {
      name: "60 Day Pillars",
      title: "A birthday. An archetype. Your story.",
      body: "Find your calendar stem-branch pair and its original animal card. Explore all 60 illustrated portraits covering temperament, intimacy and creative work.",
      action: "Find my free card",
      result: "Date only · free · no account",
      next: "Find your pair, read its full portrait, then compare another Day Pillar in the 60-part cycle.",
    },
    sticks: {
      name: "Fortune Sticks",
      title: "One question. A quiet sanctuary.",
      body: "Choose from Guanyin, Yuelao, Guandi, Caishen or Wong Tai Sin traditions. Draw a numbered sign or look up a number you already hold.",
      action: "Draw a sign",
      result: "Number, classical verse and reflection",
      next: "Read the sign in its own temple tradition, then use the guides to frame a grounded next step.",
    },
    compatibility: {
      name: "Synastry",
      title: "Two people. Two complementary lenses.",
      body: "Compare BaZi pillars and tropical birth-chart patterns with transparent notes on what is known from dates alone and what shifts with birth time.",
      action: "Compare two birthdays",
      result: "Birth times optional",
      next: "Start with the calculated comparison, then use the guides to talk through differences without turning a score into a verdict.",
    },
    atelier: {
      name: "Bracelet atelier",
      title: "Make a little meaning, bead by bead.",
      body: "Choose colors, stones and a comfortable size. See your bracelet take shape and save an image of your design.",
      action: "Design my bracelet",
      result: "A visual design · no purchase required",
      next: "Choose your palette, add or remove beads, then download your design. Five-element colors are symbolic inspiration, not a health treatment.",
    },
  },
};

const zh: Copy = {
  eyebrow: "东方星历古卷 · 命理图谱与问事观心",
  title: "以星历照见本色，\n借意象回应心事。",
  intro: "从六十甲子日柱意象、本命星盘与几何灵构认识先天节律；在山湖塔罗、五系灵签与六爻铜钱中梳理眼前抉择；再以双人合盘与流年手册观照关系与时序。",
  paths: "三幕探索长卷",
  nav: "探索 DestinyPixel",
  guides: "接着读，把脉络弄明白",
  more: "全部工具",
  journal: "深度专栏",
  learn: "使用指南",
  report: "校准真太阳时 · 生成完整出生图谱",
  reportNote: "已经查过生日意象？补充出生时辰与城市，即可合参八字四柱、五行平衡与西方回归星盘。免费工具与可选完整报告的边界在开始前一目了然。",
  sections: {
    discover: {
      name: "六十日柱",
      title: "一个生日，一张意象，一段故事。",
      body: "查出你的干支日柱与原创动物意象卡，细读性格反差、亲密关系与事业发力点。六十篇完整图文皆可免费查阅。",
      action: "免费测我的意象卡",
      result: "只需日期 · 免费 · 无需账号",
      next: "先查出日柱，读自己的完整画像，再对照另一篇，认识干支意象之间的微妙差别。",
    },
    sticks: {
      name: "灵签问事",
      title: "一事一问，留一刻静心凝神。",
      body: "涵盖观音、月老、关帝、五路财神与黄大仙灵签；可在线摇筒抽签，也可直接查解已抽到的签号。",
      action: "进入灵签小殿",
      result: "签号、传统签诗与现代解意",
      next: "先在对应签系中读懂签诗典故，再看怎样收束问题、辨认版本，把启发带回现实处境。",
    },
    compatibility: {
      name: "关系合盘",
      title: "两个人，不止一种相处视角。",
      body: "结合八字干支与西方出生星盘比较互动模式。哪些依据公历日期即可成立，哪些受出生时辰影响，全部清晰注明。",
      action: "比较两人的生日",
      result: "时辰可选未知",
      next: "先看双盘计算对照，再借助专栏讨论差异；任何分数都不是一段关系的判决。",
    },
    atelier: {
      name: "手串工坊",
      title: "一颗一颗，配出自己的颜色。",
      body: "挑选颜色、石材与合适的尺寸，看手串逐渐成形，再保存设计图。",
      action: "设计我的手串",
      result: "可视化设计 · 无需购买",
      next: "选色、加珠或移除，再下载设计图。五行颜色是象征灵感，不是健康疗法。",
    },
  },
};

const ru: Copy = {
  eyebrow: "НЕБЕСНЫЙ МАНУСКРИПТ · КАРТЫ РОЖДЕНИЯ И ОРАКУЛЫ",
  title: "Прочтите узор своего рождения.\nОткликнитесь на вопрос дня.",
  intro: "Откройте свой образ среди 60 столпов дня Бацзы, разложите карты Таро у горного озера, вытяните храмовый жребий, бросьте монеты И цзин или сравните две карты рождения.",
  paths: "Три главы исследования",
  nav: "Разделы DestinyPixel",
  guides: "Продолжите чтение",
  more: "Все инструменты",
  journal: "Журнал",
  learn: "Как пользоваться",
  report: "Исследовать полную карту рождения",
  reportNote: "Уже нашли свой образ дня? Добавьте время и город рождения для точного расчёта Бацзы и натальной карты. Условия бесплатных инструментов и полного отчёта прозрачны с самого начала.",
  sections: {
    discover: {
      name: "60 столпов дня",
      title: "День рождения. Образ. Ваша история.",
      body: "Найдите календарную пару ствола и ветви и её авторскую карточку. Все 60 иллюстрированных портретов о характере, любви и работе открыты бесплатно.",
      action: "Найти свою карточку",
      result: "Только дата · бесплатно · без аккаунта",
      next: "Найдите свою пару, прочтите полный портрет и сравните его с другим столпом дня.",
    },
    sticks: {
      name: "Гадательные палочки",
      title: "Один вопрос. Время тишины.",
      body: "Выберите традицию Гуаньинь, Юэлао или Гуаньди, вытяните жребий онлайн или найдите уже известный номер с подробным контекстом.",
      action: "Вытянуть знак",
      result: "Номер, стих и тема для размышления",
      next: "Прочтите знак в выбранной традиции. Статьи помогут уточнить вопрос и разобраться в редакциях текстов.",
    },
    compatibility: {
      name: "Совместимость",
      title: "Два человека. Две системы координат.",
      body: "Сравните столпы Бацзы и натальные карты. Честно отмечаем, какие выводы опираются на дату, а какие требуют точного времени рождения.",
      action: "Сравнить две даты",
      result: "Время можно не знать",
      next: "Начните с расчёта, затем обсудите различия с помощью статей. Балл не выносит приговор отношениям.",
    },
    atelier: {
      name: "Мастерская браслетов",
      title: "Создавайте свой образ, бусина за бусиной.",
      body: "Выберите цвета, камни и удобный размер. Соберите браслет на экране и сохраните изображение своего дизайна.",
      action: "Создать браслет",
      result: "Визуальный проект · без покупки",
      next: "Выберите палитру, добавьте или уберите бусины и скачайте рисунок. Цвета пяти элементов — символическое вдохновение, не лечение.",
    },
  },
};

export function journeyCopy(locale: ReportLocale): Copy {
  return locale === "zh-TW"
    ? (JSON.parse(toTraditional(JSON.stringify(zh))) as Copy)
    : locale === "zh"
      ? zh
      : locale === "ru"
        ? ru
        : en;
}

export const sectionGuides: Record<SectionKey, string[]> = {
  discover: ["what-is-a-day-pillar", "jia-zi-day-pillar", "gui-hai-day-pillar"],
  sticks: ["how-to-ask-fortune-sticks", "fortune-stick-number-and-edition", "yuelao-love-fortune-conversation"],
  compatibility: ["compatibility-without-birth-time", "bazi-vs-chinese-zodiac-compatibility", "five-elements-relationship-compatibility"],
  atelier: ["five-element-bracelet-design", "crystal-bracelet-care", "five-elements-relationship-compatibility"],
};
