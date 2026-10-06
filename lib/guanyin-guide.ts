import type { SeoGuide } from "./seo-guides";
import { journalLocales, journalLanguageTags, toTraditional, type JournalLocale } from "./journal-locales";
import { absoluteUrl } from "./seo";

export const guanyinGuidePath = "/learn/guanyin-fortune-sticks";
// First added in 12fffdf (2026-09-17); this revision does not reset publication.
export const guanyinPublishedAt = "2026-09-17";
export const guanyinUpdatedAt = "2026-10-02";
export const guanyinSources = {
  collection: "https://www.shoushanyan.org.tw/",
  practice: "https://www.shoushanyan.org.tw/?act=menuinfo&cmd=list&ml_id=20251103028",
} as const;
export type GuanyinSection = {
  id: string;
  title: string;
  paragraphs: string[];
  steps?: string[];
  source?: { key: keyof typeof guanyinSources; label: string };
};
type GuideCopy = {
  title: string; description: string; h1: string; intro: string; scope: string;
  cta: string; ctaNote: string; endCta: string; disclaimer: string;
  sections: GuanyinSection[];
  related: { label: string; slug: string }[];
};
const en: GuideCopy = {
  title: "Guanyin Fortune Sticks: Versions & How to Read | DestinyPixel",
  description: "Reading a 100-stick Guanyin result? Check the edition, understand the poem and compare online draws with temple practice, with two clearly labeled examples.",
  h1: "How to read Guanyin fortune sticks: poems, numbers and versions",
  intro: "To read a Guanyin fortune stick, first match the number to its own collection, then read the whole poem alongside your question. A number is a lookup key, not a meaning on its own. If you have a temple slip, keep its original wording and temple name: another website’s entry with the same number may not be the same text.",
  scope: "DestinyPixel offers a 100-number Guanyin-inspired experience. It mixes selected traditional entries with original modern reflections; it is not a complete transcription of a temple’s 100-stick book. Check each result’s source note. Changing the interface language does not always give a translation of the corresponding Chinese verse.",
  cta: "Open the Guanyin sticks tool", ctaNote: "Draw a stick or look up a number, then check the source note.",
  endCta: "Ready to try? Bring one specific question and use the result to consider a practical next step.",
  disclaimer: "This guide and our tool offer symbolic reflection, not medical, legal or financial advice. Neither a poem, a favorable label nor an AI interpretation guarantees an outcome.",
  sections: [
    { id: "versions", title: "Does “100 Guanyin sticks” mean one universal version?", paragraphs: [
      "No. In a 100-stick collection, the numbers index that collection’s entries; they do not identify a universal Chinese fortune-stick text. Shoushanyan Guanyin Temple, for example, describes its collection as sixty-cycle sticks. The name Guanyin alone is therefore insufficient to identify the book you need.",
      "Before comparing two results, check the temple or publisher, collection title, number and opening words. Then separate the poem from its story title, fortune grade, commentary and translation. A different explanation need not be a different poem; different opening words are a reason to stop treating the entries as interchangeable.",
      "For a temple draw, use that temple’s booklet or ask its staff when the text does not match. This guide does not provide a crosswalk between editions, and DestinyPixel’s number lookup cannot authenticate your temple slip.",
    ], source: { key: "collection", label: "Shoushanyan Guanyin Temple: its sixty-cycle collection (Chinese)" } },
    { id: "reading", title: "How to read a fortune-stick poem, step by step", paragraphs: [
      "The method below is an editorial reading exercise, not a ritual instruction or the only traditional way to interpret a stick. Keep the poem, the edition’s commentary and your own conclusions separate.",
    ], steps: [
      "Record the question and source. Write what you are considering and over what period, then note the collection, number and full wording. A question such as “What should I check before accepting this job?” gives the reading a clear context.",
      "Read the whole scene. Identify who or what is acting, what is blocked and what changes. Do not turn one image—rain, a boat or a flower—into a fixed prediction without reading the surrounding lines.",
      "Check unfamiliar words and stories in that edition. If a historical allusion or translation is unclear, leave it unresolved rather than inventing a story. A fortune grade is a summary label, not a measured probability.",
      "Form a tentative interpretation, then check reality. Write one possible message, an alternative reading and one small action you can verify. Decisions still need facts, consent and appropriate professional advice.",
    ] },
    { id: "examples", title: "Two interpretation examples using an invented image", paragraphs: [
      "Original teaching example—not an ancient poem, a temple quotation or a numbered stick: “A boat waits while the tide turns.” We wrote this image solely to show how interpretation works.",
      "Work question: “What should I check before accepting this job?” One reading is to prepare while waiting for missing information: ask for the written duties and schedule. Another is that waiting has become avoidance: set a date to decide once the facts arrive. The image does not say you will get the job or that you should resign.",
      "Relationship question: “How can I reopen a difficult conversation?” One reading is to choose a calmer moment and ask whether the other person is willing to talk. Another is to notice whether postponing the conversation keeps the problem unresolved. It does not reveal someone else’s feelings or predict a reunion; their response matters more than the metaphor.",
    ] },
    { id: "online-temple", title: "Online fortune sticks and temple draws: what differs?", paragraphs: [
      "Look at who provides the service, which text it uses and what procedure it describes. Online does not automatically mean independent of a temple: Shoushanyan’s own online service includes confirmation with divination blocks. That is an example of one temple’s procedure, not a rule we apply to every Guanyin tradition.",
      "DestinyPixel is a separate symbolic tool. It does not perform a temple ritual on your behalf, transmit a request to a temple or claim temple endorsement. Its modern reflections and optional AI commentary are not proof of traditional provenance. For an in-person visit, follow the particular temple’s guidance.",
    ], source: { key: "practice", label: "Shoushanyan Guanyin Temple: its online draw procedure (Chinese)" } },
    { id: "try", title: "Try the online tool without losing track of the source", paragraphs: [
      "Open the Guanyin tool in your language. Choose one concrete question, draw a result or use the number lookup, and read its source note before its interpretation. If the note identifies an original modern reflection, treat it as that—even when its number matches a temple draw.",
      "You can read the result without requesting AI. If you choose an additional AI interpretation, treat it as another proposed reading, not authentication. Our suggestion is to write down a useful next step before drawing again; this is a reflection habit, not a universal religious prohibition on redrawing.",
    ] },
  ],
  related: [ { label: "How to ask a clear fortune-stick question", slug: "how-to-ask-fortune-sticks" }, { label: "Why the number and edition belong together", slug: "fortune-stick-number-and-edition" } ],
};
const zh: GuideCopy = {
  title: "观音灵签怎么读：百签、版本与解签示例 | DestinyPixel",
  description: "拿到观音灵签，先核对签本再读签诗。了解百签的编号、庙本差异、线上求签与寺庙流程，并用两个明确标注的原创例子练习解读。",
  h1: "观音灵签怎么读：先认签本，再读签诗",
  intro: "读观音灵签，先在对应签本中核对签号，再结合所问之事读完整首签诗。签号是查找入口，本身不是答案。若你拿着寺庙的签纸，请保留原文和寺庙名称；网上同号的条目，未必就是同一首诗。",
  scope: "DestinyPixel 提供 100 个编号的观音主题体验，混合部分传统条目与本站原创现代短签，并不是某座寺庙百签本的完整抄录。请逐条查看来源说明。切换界面语言，也不一定得到对应中文签诗的译文。",
  cta: "打开观音灵签工具", ctaNote: "可以抽签或按号查签，请先读结果中的来源说明。",
  endCta: "准备好尝试了吗？带着一个具体问题，把阅读落到一件可以核实的小事上。",
  disclaimer: "本文与工具用于象征性思考，不构成医疗、法律或财务建议。签诗、吉凶标签及 AI 解读都不保证结果。",
  sections: [
    { id: "versions", title: "“观音一百签”是不是通用的同一版本？", paragraphs: [
      "不是。百签本的编号对应的是该签本中的条目，并非全体中国灵签共用的编号系统。例如，寿山岩观音寺在官网介绍的是六十甲子签诗。因此，仅凭“观音”二字，还不能确定你要找哪一本。",
      "比较两份结果前，先核对寺庙或出版者、签本名称、签号和起句，再区分签诗、典故标题、吉凶等级、解说与译文。解说不同，未必代表诗不同；起句不同，就不宜直接当成同一条。",
      "如果你是在寺庙求得一签，遇到文字不一致，应以该寺提供的签本为起点，或向寺方询问。本文不提供各版本之间的签号对照表，本站按号查询也不能替寺庙签纸鉴定出处。",
    ], source: { key: "collection", label: "寿山岩观音寺官网：六十甲子签诗介绍（繁体中文）" } },
    { id: "reading", title: "怎样一步步读签诗？", paragraphs: [
      "下面是一套本站建议的阅读练习，不是仪轨说明，也不声称是唯一的传统解法。请把原诗、签本解说和自己的判断分开。",
    ], steps: [
      "记录问题与出处：写明正在考虑的事情及时间范围，同时留下签本、签号和全文。例如“接受这份工作前，我还需要确认什么？”比泛问一生运势更有明确语境。",
      "先看完整画面：谁在行动，哪里受阻，什么发生了变化？不要脱离上下句，把雨、船或花等单个意象直接套成固定预言。",
      "回到该版本查字义与典故：不认识的故事、翻译不清的地方，可以暂时存疑，不补编情节。吉凶等级只是概括标签，不是测量得出的成功概率。",
      "提出暂定解释，再核对现实：写出一种可能的提醒、另一种解释，以及一件可验证的小行动。做决定仍需要事实、相关人的同意和适当的专业意见。",
    ] },
    { id: "examples", title: "两个解读示例：用一个虚构意象练习", paragraphs: [
      "原创教学例子——不是古代签诗、寺庙引文或任何编号的签：“一艘船等候潮水转向。”这个意象由本站为演示阅读方法而写。",
      "工作问题：“接受这份工作前，我还需要确认什么？”一种读法是等待信息时做好准备：向对方索取书面的职责与工作安排。另一种读法是留意自己是否以等待回避决定：约定信息到齐后的决定日期。这个意象没有说你一定被录用，也没有叫你辞职。",
      "关系问题：“怎样重新开始一场困难的对话？”一种读法是选平静的时机，并先问对方是否愿意谈。另一种读法是看看反复拖延是否让问题一直悬着。它不能透露对方心意，也不预告复合；对方的真实回应比比喻更重要。",
    ] },
    { id: "online-temple", title: "线上求签与寺庙求签，差别在哪里？", paragraphs: [
      "要看服务由谁提供、使用哪套文本、说明了什么流程。线上不必然等于非寺方服务：寿山岩观音寺自己的线上求签就包含掷筊确认。这是该寺的一个具体流程，不能套成所有观音信仰场所的共同规则。",
      "DestinyPixel 是独立的象征体验工具，不代你完成寺庙仪式，不向寺庙传递祈求，也不声称获寺方认可。本站现代短签与可选的 AI 解说不能证明传统出处。实际到寺庙参拜时，请遵循当地寺方指引。",
    ], source: { key: "practice", label: "寿山岩观音寺：线上求签流程（繁体中文）" } },
    { id: "try", title: "使用工具时，怎样保留来源线索？", paragraphs: [
      "打开相应语言的观音灵签工具，带着一个具体问题抽签，或使用按号查签。先读来源，再看解释。如果标注为原创现代短签，就按现代作品阅读，即使编号恰好和寺庙抽到的一样。",
      "阅读结果不需要请求 AI；若选择追加 AI 解读，请把它看成另一种解释建议，而非出处鉴定。我们建议先记下一项有用的行动再决定是否重抽；这是思考习惯，不是宗教上普遍禁止重抽的戒律。",
    ] },
  ],
  related: [ { label: "怎样把求签问题问清楚", slug: "how-to-ask-fortune-sticks" }, { label: "为什么签号与签本要一起核对", slug: "fortune-stick-number-and-edition" } ],
};
const ru: GuideCopy = {
  title: "Палочки Гуаньинь: как читать стих и сверять версии | DestinyPixel",
  description: "Как читать результат из набора 100 палочек Гуаньинь: сверка сборника, смысл стиха, отличия онлайн-сервиса от храма и два учебных примера.",
  h1: "Как читать палочки Гуаньинь: стихи, номера и версии",
  intro: "Сначала найдите номер палочки Гуаньинь в том сборнике, к которому он относится, затем прочитайте весь стих с учётом своего вопроса. Номер — указатель, а не самостоятельный ответ. Если у вас храмовый листок, сохраните его текст и название храма: запись с тем же номером на другом сайте может содержать другой текст.",
  scope: "В DestinyPixel есть 100 номеров в инструменте по мотивам палочек Гуаньинь. В нём сочетаются отдельные традиционные тексты и наши авторские современные размышления; это не полная копия храмового сборника из 100 стихов. Проверяйте примечание об источнике каждого результата. Смена языка интерфейса не всегда даёт перевод соответствующего китайского стиха.",
  cta: "Открыть палочки Гуаньинь", ctaNote: "Вытяните палочку или найдите номер, затем прочитайте примечание об источнике.",
  endCta: "Хотите попробовать? Сформулируйте конкретный вопрос и выберите небольшой следующий шаг, который можно проверить на практике.",
  disclaimer: "Статья и инструмент предназначены для символического размышления, а не для медицинских, юридических или финансовых рекомендаций. Стих, благоприятная оценка и толкование ИИ не гарантируют исхода.",
  sections: [
    { id: "versions", title: "Существует ли единая версия «100 палочек Гуаньинь»?", paragraphs: [
      "Нет. Номера в наборе из 100 палочек отсылают к записям этого сборника, а не к единому для всех китайских гадательных текстов указателю. Например, храм Гуаньинь Шоушаньянь описывает свой сборник как палочки шестидесятилетнего цикла. Поэтому одного имени Гуаньинь недостаточно, чтобы определить нужную книгу.",
      "Перед сравнением результатов сверьте храм или издателя, название сборника, номер и первые слова. Отделяйте сам стих от названия связанной истории, оценки удачи, комментария и перевода. Разные объяснения не обязательно означают разные стихи; разные первые строки — причина не считать записи взаимозаменяемыми.",
      "Для храмового жребия начните с книги именно этого храма или спросите его сотрудников, если тексты не совпадают. Здесь нет таблицы соответствий между версиями, а наш поиск по номеру не подтверждает происхождение вашего храмового листка.",
    ], source: { key: "collection", label: "Храм Шоушаньянь: сборник шестидесятилетнего цикла (на китайском)" } },
    { id: "reading", title: "Как прочитать стих: четыре шага", paragraphs: [
      "Это предложенное редакцией упражнение в чтении, а не инструкция к ритуалу и не единственный традиционный способ толкования. Разделяйте стих, комментарий издания и собственные выводы.",
    ], steps: [
      "Запишите вопрос и источник. Укажите ситуацию и срок, затем сборник, номер и полный текст. Вопрос «Что проверить, прежде чем принять эту работу?» задаёт понятный контекст.",
      "Прочитайте всю сцену. Кто действует, что мешает и что меняется? Не превращайте отдельный образ — дождь, лодку или цветок — в неизменное предсказание без окружающих строк.",
      "Проверьте незнакомые слова и истории по этому изданию. Если намёк на исторический сюжет или перевод непонятен, оставьте вопрос открытым, не придумывайте историю. Оценка удачи — краткая характеристика, а не измеренная вероятность.",
      "Предложите предварительное толкование и сверьте его с фактами. Запишите возможную мысль, альтернативное прочтение и одно проверяемое действие. Для решений по-прежнему нужны факты, согласие участников и уместная профессиональная консультация.",
    ] },
    { id: "examples", title: "Два толкования одного вымышленного образа", paragraphs: [
      "Авторский учебный пример — не древний стих, не цитата из храма и не палочка с номером: «Лодка ждёт, пока сменится прилив». Мы придумали этот образ только для объяснения метода чтения.",
      "Вопрос о работе: «Что проверить, прежде чем принять эту работу?» Одно прочтение — готовиться, пока не хватает информации: запросить письменное описание обязанностей и график. Другое — заметить, не стало ли ожидание способом избегать решения, и назначить срок после получения фактов. Образ не обещает трудоустройства и не призывает увольняться.",
      "Вопрос об отношениях: «Как вернуться к трудному разговору?» Одно прочтение — выбрать спокойный момент и спросить, готов ли другой человек поговорить. Другое — проверить, не оставляет ли постоянная отсрочка проблему нерешённой. Это не раскрывает чужих чувств и не предсказывает воссоединения: реальный ответ человека важнее метафоры.",
    ] },
    { id: "online-temple", title: "Чем онлайн-палочки отличаются от храмового жребия?", paragraphs: [
      "Смотрите, кто предоставляет сервис, какие тексты использует и какую процедуру описывает. Онлайн не обязательно означает вне храма: собственный сервис Шоушаньяня включает подтверждение с помощью гадательных блоков. Это процедура конкретного храма, а не правило для всех традиций Гуаньинь.",
      "DestinyPixel — отдельный символический инструмент. Он не совершает храмовый ритуал за вас, не передаёт просьбы храму и не заявляет о храмовом одобрении. Авторские современные тексты и необязательное толкование ИИ не подтверждают традиционного происхождения. При личном посещении следуйте указаниям конкретного храма.",
    ], source: { key: "practice", label: "Храм Шоушаньянь: процедура онлайн-жребия (на китайском)" } },
    { id: "try", title: "Как пользоваться инструментом и не потерять источник?", paragraphs: [
      "Откройте палочки Гуаньинь на своём языке. Сформулируйте один конкретный вопрос, вытяните палочку или найдите номер и прочитайте примечание об источнике до толкования. Если это авторское современное размышление, так его и воспринимайте, даже когда номер совпадает с храмовым.",
      "Результат можно читать без запроса к ИИ. Если вы выберете дополнительное толкование ИИ, считайте его ещё одним вариантом прочтения, а не подтверждением подлинности. Мы предлагаем записать полезный следующий шаг до нового жребия; это привычка для размышления, а не всеобщий религиозный запрет на повторное вытягивание.",
    ] },
  ],
  related: [ { label: "Как задать ясный вопрос перед жребием", slug: "how-to-ask-fortune-sticks" }, { label: "Зачем сверять и номер, и издание", slug: "fortune-stick-number-and-edition" } ],
};
const traditionalText = (value: string) => toTraditional(value).replaceAll("簽", "籤").replaceAll("壽山岩", "壽山巖").replaceAll("複合", "復合");
// Convert prose only: preserve stable IDs, slugs and source keys.
const traditional: GuideCopy = {
  ...Object.fromEntries(Object.entries(zh).filter(([, value]) => typeof value === "string").map(([key, value]) => [key, traditionalText(value as string)])) as Omit<GuideCopy, "sections" | "related">,
  sections: zh.sections.map(s => ({ ...s, title: traditionalText(s.title), paragraphs: s.paragraphs.map(traditionalText), steps: s.steps?.map(traditionalText), source: s.source ? { ...s.source, label: traditionalText(s.source.label) } : undefined })),
  related: zh.related.map(link => ({ ...link, label: traditionalText(link.label) })),
};
export const guanyinGuideCopy: Record<JournalLocale, GuideCopy> = { en, zh, "zh-TW": traditional, ru };
export function guanyinLocale(value?: string | string[]): JournalLocale {
  return typeof value === "string" && journalLocales.includes(value as JournalLocale) ? value as JournalLocale : "en";
}
export function guanyinHref(locale: JournalLocale) { return guanyinGuidePath + (locale === "en" ? "" : `?locale=${locale}`); }
export function guanyinToolHref(locale: JournalLocale) { return `/sticks?locale=${locale}&type=guanyin`; }
export function guanyinAlternates() {
  return Object.fromEntries([...journalLocales.map(l => [journalLanguageTags[l], absoluteUrl(guanyinHref(l))]), ["x-default", absoluteUrl(guanyinGuidePath)]]);
}
export const guanyinSeoGuide: SeoGuide = {
  section: "learn", slug: "guanyin-fortune-sticks", title: en.title, description: en.description,
  updatedAt: guanyinUpdatedAt, h1: en.h1, paragraphs: [en.intro, en.scope], faqs: [],
  cta: { label: en.cta, href: guanyinToolHref("en") }, disclaimer: en.disclaimer,
  related: en.related.map(item => ({ label: item.label, href: `/journal/${item.slug}` })),
};
