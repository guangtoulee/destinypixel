import animalNames from "./compatibility/animal-names.json";
import { getPillarSlug } from "./archetype-assets";
import { toTraditional, type JournalLocale } from "./journal-locales";

export const stems = "甲乙丙丁戊己庚辛壬癸";
export const branches = "子丑寅卯辰巳午未申酉戌亥";
export const dayPillarCycle = Array.from({ length: 60 }, (_, i) => stems[i % 10] + branches[i % 12]);
export const elementNames = { en: ["Wood", "Fire", "Earth", "Metal", "Water"], zh: ["木", "火", "土", "金", "水"], ru: ["Дерево", "Огонь", "Земля", "Металл", "Вода"] };
const branchElements = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
const animals = { en: ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat / Sheep", "Monkey", "Rooster", "Dog", "Pig / Boar"], zh: ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"], ru: ["Крыса", "Бык", "Тигр", "Кролик", "Дракон", "Змея", "Лошадь", "Коза / Овца", "Обезьяна", "Петух", "Собака", "Свинья / Кабан"] };
const stemRu = ["Цзя", "И", "Бин", "Дин", "У", "Цзи", "Гэн", "Синь", "Жэнь", "Гуй"];
const branchRu = ["цзы", "чоу", "инь", "мао", "чэнь", "сы", "у", "вэй", "шэнь", "ю", "сюй", "хай"];
export function pillarArticleSlug(pillar: string) {
  if (!dayPillarCycle.includes(pillar)) throw new Error(`Invalid day pillar: ${pillar}`);
  return `${getPillarSlug(pillar).replace("_", "-")}-day-pillar`;
}
export function pillarArticleHref(pillar: string, locale: JournalLocale) { return `/journal/${pillarArticleSlug(pillar)}${locale === "en" ? "" : `?locale=${locale}`}`; }
export function pillarLibraryHref(locale: JournalLocale) { return `/journal/day-pillars${locale === "en" ? "" : `?locale=${locale}`}`; }
export function pillarName(pillar: string, locale: JournalLocale) {
  const name = animalNames[pillar as keyof typeof animalNames];
  if (!name) throw new Error(`Missing animal name: ${pillar}`);
  return locale === "zh-TW" ? toTraditional(name.zh) : name[locale];
}
export function pillarFacts(pillar: string, locale: JournalLocale) {
  if (!dayPillarCycle.includes(pillar)) throw new Error(`Invalid day pillar: ${pillar}`);
  const language = locale === "zh-TW" ? "zh" : locale;
  const s = stems.indexOf(pillar[0]), b = branches.indexOf(pillar[1]);
  const format = (value: string) => locale === "zh-TW" ? toTraditional(value) : value;
  const yinYang = language === "zh" ? ["阳", "阴"] : language === "ru" ? ["Ян", "Инь"] : ["Yang", "Yin"];
  return {
    number: dayPillarCycle.indexOf(pillar) + 1,
    pinyin: getPillarSlug(pillar).split("_").map(v => v[0].toUpperCase() + v.slice(1)).join(" "),
    russian: `${stemRu[s]}-${branchRu[b]}`,
    stem: pillar[0], branch: pillar[1], stemElement: Math.floor(s / 2), branchElement: branchElements[b],
    master: format(`${yinYang[s % 2]}${language === "zh" ? "" : " "}${elementNames[language][Math.floor(s / 2)]}`),
    animal: format(animals[language][b]), branchElementName: elementNames[language][branchElements[b]],
  };
}
const en = {
  title: "60 BaZi Day Pillars: Personality, Love & Animal Cards",
  heading: "Sixty Day Pillars.\nFind the story behind yours.",
  description: "Browse all 60 BaZi Day Pillars, from Jia Zi to Gui Hai. Explore each stem and branch, Day Master element, personality, love, career and original animal card.",
  intro: "Know your Day Pillar? Find it below. Each illustrated guide connects the Chinese calendar name with an original animal portrait, relationship patterns and work themes. If you only know your birthday, start with the free calculator.",
  calculate: "Find my Day Pillar", browse: "Browse all 60 Day Pillars", read: "Read this portrait", related: "Compare related Day Pillars", collection: "THE DAY PILLAR COLLECTION", group: "In cycle order", art: "Original DestinyPixel animal card", count: "60 illustrated guides · Free to read", same: "Compare the same Day Master", note: "A Day Pillar combines a Heavenly Stem with an Earthly Branch. The day animal is separate from your birth-year zodiac. These portraits explore traditional symbols through original stories, rather than predicting a fixed personality or future.",
};
const zh: typeof en = {
  title: "六十甲子日柱详解：性格、感情、事业与动物卡", heading: "六十种日柱，\n找到你的那一篇。", description: "从甲子到癸亥，查阅六十甲子日柱的天干地支、日主五行、性格、感情与事业主题，配上 DestinyPixel 原创动物卡。", intro: "已经知道日柱，可以直接在下面找。每篇图文把干支名称、五行组合与原创动物意象连起来，读性格中的反差，也看相处和工作中的具体情境。只知道生日，就从免费日柱查询开始。", calculate: "免费查我的日柱", browse: "浏览六十日柱图文", read: "阅读这篇日柱详解", related: "对照阅读相关日柱", collection: "六十甲子 · 日柱图文库", group: "按六十甲子顺序查阅", art: "DestinyPixel 原创动物卡", count: "60 篇图文 · 免费阅读", same: "对照相同日主的日柱", note: "日柱由一个天干和一个地支组成。日支生肖与出生年份的生肖是两回事。这里用传统象征和原创故事帮助观察自己，不把一个日柱当作性格或未来的定论。",
};
const ru: typeof en = {
  title: "60 столпов дня Бацзы: характер, любовь и карточки", heading: "Шестьдесят столпов дня.\nНайдите свою историю.", description: "Все 60 столпов дня Бацзы от Цзя-цзы до Гуй-хай: небесные стволы, земные ветви, элемент личности, отношения, работа и авторские карточки животных.", intro: "Уже знаете свой столп дня? Найдите его в каталоге. Каждый иллюстрированный портрет связывает календарное имя с авторским образом, темами отношений и работы. Если известна только дата рождения, начните с бесплатного расчёта.", calculate: "Узнать свой столп дня", browse: "Все 60 столпов дня", read: "Прочитать портрет", related: "Сравните другие столпы дня", collection: "КОЛЛЕКЦИЯ СТОЛПОВ ДНЯ", group: "По порядку цикла", art: "Авторская карточка DestinyPixel", count: "60 портретов · Бесплатное чтение", same: "Сравнить столпы с тем же элементом личности", note: "Столп дня соединяет небесный ствол и земную ветвь. Животное дня отличается от знака года рождения. Портреты исследуют традиционные символы через авторские истории и не устанавливают характер или будущее человека.",
};
export function pillarLibraryCopy(locale: JournalLocale): typeof en {
  return locale === "zh-TW" ? Object.fromEntries(Object.entries(zh).map(([k,v]) => [k,toTraditional(v)])) as typeof en : locale === "zh" ? zh : locale === "ru" ? ru : en;
}
