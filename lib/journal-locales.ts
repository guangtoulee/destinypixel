import OpenCC from "opencc-js/cn2t";

export const journalLocales = ["en", "zh", "zh-TW", "ru"] as const;
export type JournalLocale = typeof journalLocales[number];
export const journalLanguageTags = { en: "en", zh: "zh-Hans", "zh-TW": "zh-Hant", ru: "ru" } as const;
export const journalLanguageLabels = { en: "EN", zh: "简体", "zh-TW": "繁體", ru: "Русский" } as const;
export const journalOgLocales = { en: "en_US", zh: "zh_CN", "zh-TW": "zh_TW", ru: "ru_RU" } as const;
// Convert characters first. The broad regional phrase dictionary can corrupt
// ordinary prose (for example, 真实例子 becomes 真例項子).
const traditionalCharacters = OpenCC.Converter({ from: "cn", to: "tw" });
export function toTraditional(value: string) {
  return traditionalCharacters(value).replaceAll("反饋", "回饋").replaceAll("香港天文臺", "香港天文台");
}
const en = {"home":"Home","tools":"Tools","journal":"Journal","mainNav":"Main navigation","language":"Article language","footer":"Clear distinctions between symbols, calculations and personal judgment.","footerNav":"Footer navigation","all":"All articles","toolDirectory":"Tool directory","contact":"Contact","breadcrumb":"Breadcrumb","published":"Published","updated":"Updated","contents":"IN THIS GUIDE","sections":"Article sections","takeaway":"START HERE","sources":"PRIMARY SOURCES","try":"Try it with a clear idea of what to expect.","related":"CONTINUE READING","eyebrow":"THE DESTINYPIXEL JOURNAL","heading":"A little more understanding.\nA more thoughtful next step.","intro":"Explore the 60 Day Pillars, prepare your birth details and try five-element bracelet design. Read in English, Simplified Chinese, Traditional Chinese or Russian, with sources and practical examples.","list":"Original articles","read":"Read the guide","editorial":"HOW THESE GUIDES ARE MADE","editorialBody":"Instructions are checked against the tools. Calendar and material-care facts link to primary sources. Our symbolic card stories offer prompts for reflection.","title":"Journal: Bazi Day Pillars, Birth Charts & Five Elements","description":"Explore DestinyPixel’s multilingual guides to the 60 Bazi Day Pillars, birth details and five-element bracelet design, with practical examples and sources."};
const zh = {"home":"首页","tools":"玄学工具","journal":"文章","mainNav":"主导航","language":"文章语言","footer":"把象征、计算与个人判断分清楚。","footerNav":"页脚导航","all":"全部文章","toolDirectory":"工具目录","contact":"联系反馈","breadcrumb":"面包屑导航","published":"发布于","updated":"更新于","contents":"文章目录","sections":"文章章节","takeaway":"先记住这一点","sources":"相关原始来源","try":"带着清楚的预期，动手试一次。","related":"继续阅读","eyebrow":"DESTINYPIXEL 原创文章","heading":"让每一次探索，\n多一点理解。","intro":"从六十日柱到出生资料与五行配色，结合实际例子理解工具与卡片故事。提供英语、简体中文、繁体中文和俄语版本，附可核对的来源。","list":"原创文章列表","read":"阅读文章","editorial":"我们怎样写这些文章","editorialBody":"操作步骤根据工具核对；历法与材质养护知识链接到原始来源。原创卡片故事则用来提出自我观察的问题。","title":"玄学与日常：六十日柱、出生图谱与五行指南","description":"阅读 DestinyPixel 多语言原创指南，理解六十甲子日柱、核对出生资料，探索五行手串设计，附具体例子与来源。"};
const ru: typeof en = {"home":"Главная","tools":"Инструменты (EN)","journal":"Статьи","mainNav":"Основная навигация","language":"Язык статьи","footer":"Символы, расчёты и личные выводы — у каждого своя роль.","footerNav":"Навигация внизу страницы","all":"Все статьи","toolDirectory":"Каталог инструментов (EN)","contact":"Связаться с нами","breadcrumb":"Путь к странице","published":"Опубликовано","updated":"Обновлено","contents":"В ЭТОЙ СТАТЬЕ","sections":"Разделы статьи","takeaway":"С ЧЕГО НАЧАТЬ","sources":"ПЕРВОИСТОЧНИКИ","try":"Попробуйте инструмент, зная, чего от него ожидать.","related":"ЧИТАЙТЕ ДАЛЬШЕ","eyebrow":"ЖУРНАЛ DESTINYPIXEL","heading":"Больше понимания.\nБолее осмысленный следующий шаг.","intro":"Знакомьтесь с 60 столпами дня, готовьте данные рождения и создавайте браслеты в палитре пяти элементов. Статьи доступны на английском, русском и двух вариантах китайского, с примерами и ссылками на источники.","list":"Авторские статьи","read":"Читать статью","editorial":"КАК МЫ ГОТОВИМ СТАТЬИ","editorialBody":"Инструкции сверяются с инструментами. Сведения о календаре и уходе за материалами сопровождаются первоисточниками. Авторские образы карточек помогают задавать вопросы для самоанализа.","title":"Ба-цзы: столпы дня, карта рождения и пять элементов","description":"Статьи DestinyPixel о 60 столпах дня в Ба-цзы, подготовке данных рождения и создании браслетов пяти элементов. Понятные примеры и проверяемые источники."};
const traditional = Object.fromEntries(Object.entries(zh).map(([key, value]) => [key, toTraditional(value)])) as typeof zh;
traditional.tools = "玄學工具（簡體）";
traditional.toolDirectory = "工具目錄（簡體）";
traditional.published = "發表於";
traditional.contact = "聯絡我們";
traditional.breadcrumb = "麵包屑導覽";
export const journalUi = { en, zh, "zh-TW": traditional, ru };
export function journalHomeHref(locale: JournalLocale) { return locale === "en" ? "/" : `/?locale=${locale}`; }
// The tool directory currently has English and Simplified Chinese editions only.
export function journalToolsHref(locale: JournalLocale) { return locale === "zh" || locale === "zh-TW" ? "/tools?locale=zh" : "/tools"; }
