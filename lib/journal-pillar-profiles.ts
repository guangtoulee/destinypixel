import type { JournalSourceArticle, JournalTranslation } from "./journal";
import { dayPillarCycle, pillarFacts, pillarName, pillarArticleSlug, elementNames } from "./day-pillar-library";
import { getDayPillarInsight } from "./day-pillar-insights";
import { pillarPractices } from "./day-pillar-practices";

type Language = "en" | "zh" | "ru";
const labels = {
  en: { topic: "BaZi Day Pillar portraits", meaning: "The stem, branch and five elements", personality: "Personality: the strength and its tension", love: "Love and communication", career: "Work and career themes", practice: "A scene to try in everyday life", method: "Finding your Day Pillar and reading it in context", headings: ["Part of the portrait", "Meaning"], rows: ["Cycle position", "Heavenly Stem / Day Master", "Earthly Branch / day animal", "Branch's principal element"], action: "Find my Day Pillar for free", source: "Hong Kong Observatory: stems and branches", guide: "How the Day Pillar calculation works", match: "Five elements in relationship compatibility" },
  zh: { topic: "六十甲子 · 日柱详解", meaning: "天干、地支与五行组合", personality: "性格底色：长处里的另一面", love: "感情与相处方式", career: "事业与工作中的发力点", practice: "把这幅画像放进一个生活场景", method: "怎样查自己的日柱，又该怎样理解", headings: ["组成", "含义"], rows: ["六十甲子序号", "天干／日主", "地支／日支生肖", "地支本气五行"], action: "免费查我的日柱", source: "香港天文台：天干地支", guide: "日柱是什么，怎样按日期查询", match: "五行相生相克与感情适配" },
  ru: { topic: "Портреты столпов дня Бацзы", meaning: "Ствол, ветвь и пять элементов", personality: "Характер: сила и внутреннее противоречие", love: "Любовь и общение", career: "Работа и развитие способностей", practice: "Небольшая практика для повседневной жизни", method: "Как узнать свой столп дня и понять его место в карте", headings: ["Часть портрета", "Значение"], rows: ["Позиция в цикле", "Небесный ствол / элемент личности", "Земная ветвь / животное дня", "Основной элемент ветви"], action: "Бесплатно узнать свой столп дня", source: "Обсерватория Гонконга: стволы и ветви", guide: "Как рассчитывается столп дня", match: "Пять элементов и совместимость в отношениях" },
};

function elementReading(pillar: string, locale: Language) {
  const f = pillarFacts(pillar, locale), s = f.stemElement, b = f.branchElement;
  const stem = elementNames[locale][s], branch = elementNames[locale][b];
  if (locale === "zh") {
    const relation = s === b ? `天干与地支本气同属${stem}，这里的意象强调同一种力量的延续。` : (b + 1) % 5 === s ? `${branch}生${stem}，地支本气在相生循环中支持日主。` : (s + 1) % 5 === b ? `${stem}生${branch}，日主与地支本气形成向外表达、转化的相生意象。` : (s + 2) % 5 === b ? `${stem}克${branch}，传统关系里的“克”表示制约和调节，不能直接翻译成坏运气。` : `${branch}克${stem}，这一层关系可用边界、压力与调整来理解，不代表一定发生冲突。`;
    return `${pillar}的日主是${f.master.replace(" ", "")}，日支为${f.animal}。${relation}这里仅比较两项主元素，没有展开地支内部的天干、季节旺衰与其他三柱，不能由此判断整个八字的喜忌。`;
  }
  if (locale === "ru") {
    const relation = s === b ? `Оба относятся к одному элементу: ${stem}. Это образ повторения одной темы.` : (b + 1) % 5 === s ? `В порождающем цикле ${branch} поддерживает ${stem}: элемент ветви питает элемент личности.` : (s + 1) % 5 === b ? `В порождающем цикле ${stem} поддерживает ${branch}: здесь можно увидеть образ выражения и отдачи.` : (s + 2) % 5 === b ? `В сдерживающем цикле ${stem} ограничивает ${branch}. Сдерживание означает также регулирование, а не неизбежную неудачу.` : `В сдерживающем цикле ${branch} ограничивает ${stem}. Это тема границ и адаптации, а не обещание конфликта.`;
    return `${f.russian}: элемент личности — ${f.master}, животное дня — ${f.animal}. ${relation} Сравнение учитывает только основные элементы. Скрытые стволы, сезон и остальные три столпа требуют отдельного разбора; по этой паре нельзя определить благоприятные элементы всей карты.`;
  }
  const relation = s === b ? `Both principal elements are ${stem}, repeating one symbolic theme.` : (b + 1) % 5 === s ? `${branch} generates ${stem} in the generating cycle: the branch's main element supports the Day Master.` : (s + 1) % 5 === b ? `${stem} generates ${branch} in the generating cycle, an image of expression and output from the Day Master.` : (s + 2) % 5 === b ? `${stem} controls ${branch} in the regulating cycle. Here, control includes shaping and restraint; it is not a prediction of bad luck.` : `${branch} controls ${stem} in the regulating cycle, suggesting a symbolic tension around boundaries and adjustment rather than an inevitable conflict.`;
  return `${f.pinyin} pairs a ${f.master} Day Master with the ${f.animal} branch. ${relation} This introductory comparison uses the branch's principal element only. Hidden stems, season and the other three pillars need a fuller reading; this pair alone does not establish a chart's favorable elements.`;
}

function profile(pillar: string, locale: Language): JournalTranslation {
  const f = pillarFacts(pillar, locale), name = pillarName(pillar, locale), reading = getDayPillarInsight(pillar, locale)!;
  const copy = labels[locale], scenario = pillarPractices[pillar][locale === "en" ? 0 : locale === "zh" ? 1 : 2];
  const title = locale === "en" ? `${f.pinyin} Day Pillar (${pillar}): ${name}, Love & Personality` : locale === "zh" ? `${pillar}日柱详解：${name}的性格、感情与事业` : `${f.russian} (${pillar}): характер, любовь и работа — ${name}`;
  const intro = locale === "en" ? `${reading.headline} In DestinyPixel's ${f.pinyin} portrait, ${name} explores a particular tension in how you act, connect and work. Start with the traditional calendar pair, then compare its story with a real situation of your own.` : locale === "zh" ? `${reading.headline}在 DestinyPixel 的${pillar}日柱画像里，「${name}」把这一层反差变成可以观察的动物意象。从干支与五行读起，再把性格、感情和工作里的主题放回自己的真实经历。` : `${reading.headline} В портрете ${f.russian} образ «${name}» помогает исследовать действия, отношения и работу. Начните с традиционного календарного сочетания, затем сопоставьте историю с конкретным собственным опытом.`;
  const description = locale === "en" ? `${f.pinyin} (${pillar}) is ${f.master} over ${f.animal}. Explore ${name}: personality, love, career, five-element symbolism and an everyday practice.` : locale === "zh" ? `${pillar}日柱是${f.master.replace(" ", "")}坐${f.animal}，代表怎样的性格与感情习惯？结合「${name}」原创卡片，读五行组合、事业主题和具体相处练习。` : `${f.russian} (${pillar}): ${f.master}, ${f.animal}. Авторский образ «${name}», характер, любовь, работа, символика пяти элементов и практика общения.`;
  const method = locale === "en" ? [
    `Use your Gregorian birth date in the free calculator to check whether ${f.pinyin} is your Day Pillar. This is the animal of the day, not the zodiac animal of your birth year. The simple finder uses the civil calendar date; time and birthplace can matter when a full solar-time chart is close to a day boundary. Do not guess a birth hour to make two results agree.`,
    `${name} is DestinyPixel's original illustrated character, not a historical translation of ${pillar}. These editorial portraits adapt our original card notes with AI-assisted wording and translation. Their personality and relationship themes are prompts for reflection, not a personality diagnosis or a fixed marriage, income or future prediction. A partner's whole chart and your actual communication matter more than a single animal label.`,
  ] : locale === "zh" ? [
    `在免费查询中输入公历生日，可以核对自己是否为${pillar}日柱。这里查的是出生那一天的日支生肖，不是出生年份的属相。简版按民用日历日期计算；午夜附近，完整排盘结合出生时间、地点和太阳时校准后可能不同，不要为了让两个结果一致而编造出生时刻。`,
    `「${name}」是 DestinyPixel 的原创动物角色，不是${pillar}的古籍直译。画像以原创卡片笔记为基础，借助 AI 整理表达与翻译。性格和相处主题供自我观察，不是人格诊断，也不凭一个日柱断定婚姻、收入或未来。理解两人关系，还要看完整资料与实际沟通。`,
  ] : [
    `Введите григорианскую дату рождения в бесплатный калькулятор, чтобы проверить свой столп ${f.russian}. Это животное дня, а не знак года рождения. Простой расчёт следует гражданской дате. В полной карте время, место и солнечная поправка могут изменить результат у границы суток. Не придумывайте час рождения ради совпадения двух результатов.`,
    `«${name}» — авторский персонаж DestinyPixel, а не исторический перевод ${pillar}. Портреты основаны на наших заметках к карточкам; AI помогает редактировать и переводить текст. Темы характера и отношений служат размышлению, а не диагностике или предсказанию брака, дохода и будущего. Для понимания пары важны полные данные и реальное общение.`,
  ];
  const question = locale === "en" ? "Treat this scene as an experiment: what did you notice, what did you assume, and what changed after you asked or acted? Keep the part that fits your experience and leave room for a different answer." : locale === "zh" ? "把这个场景当作一次小练习：你观察到了什么，又猜测了什么？问清或行动之后，什么变了？留下符合自己经验的部分，也允许答案与画像不同。" : "Рассматривайте сцену как небольшой опыт: что вы заметили, что предположили и что изменилось после вопроса или действия? Оставляйте то, что соответствует вашему опыту, допуская и другой ответ.";
  const query = locale === "en" ? "" : `?locale=${locale}`;
  return {
    title, description, topic: copy.topic, introduction: intro, takeaway: reading.headline,
    sections: [
      { id: "stem-branch", title: copy.meaning, paragraphs: [elementReading(pillar, locale)], table: { headings: copy.headings, rows: [[copy.rows[0], `${f.number} / 60`], [copy.rows[1], `${f.stem} · ${f.master}`], [copy.rows[2], `${f.branch} · ${f.animal}`], [copy.rows[3], f.branchElementName]] } },
      { id: "personality", title: copy.personality, paragraphs: [reading.personality] },
      { id: "love", title: copy.love, paragraphs: [reading.love] },
      { id: "career", title: copy.career, paragraphs: [reading.career] },
      { id: "everyday-practice", title: copy.practice, paragraphs: [scenario, question] },
      { id: "calculation-and-context", title: copy.method, paragraphs: method, sources: [
        { label: copy.source, href: "https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm" },
        { label: copy.guide, href: `/journal/what-is-a-day-pillar${query}` },
        { label: copy.match, href: `/journal/five-elements-relationship-compatibility${query}` },
      ] },
    ], action: { label: copy.action, href: `/discover${query}` },
  };
}

// The existing Jia Zi long-form guide keeps its URL and verified birthday sources.
export const pillarProfileArticles: JournalSourceArticle[] = dayPillarCycle.filter(p => p !== "甲子").map(pillar => ({
  slug: pillarArticleSlug(pillar), pillar, kind: "portrait", relatedSlug: "what-is-a-day-pillar", publishedAt: "2026-09-23", updatedAt: "2026-09-23",
  translations: { en: profile(pillar, "en"), zh: profile(pillar, "zh") },
}));
export const pillarProfileRussian: Record<string, JournalTranslation> = Object.fromEntries(dayPillarCycle.filter(p => p !== "甲子").map(p => [pillarArticleSlug(p), profile(p, "ru")]));
