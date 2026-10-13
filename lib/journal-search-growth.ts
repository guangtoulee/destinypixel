import { baziCompatibilityArticle, baziCompatibilityRussian } from "./journal-bazi-compatibility";
import { fortuneStickEditionsArticle, fortuneStickEditionsRussian } from "./journal-fortune-stick-editions";
import { birthTimeArticle } from "./compatibility/birth-time-article";
import type { JournalSourceArticle, JournalTranslation } from "./journal";

type Edition = {
  title: string; description: string; topic: string; introduction: string; takeaway: string;
  sections: [string, string][]; action: { label: string; href: string };
};
type Entry = { slug: string; relatedSlug: string; sources: { label: string; href: string }[]; en: Edition; zh: Edition; ru: Edition };

// Original, task-focused guides. Section order is shared across complete editions.
const entries: Entry[] = [
  {
    slug: "compatibility-without-birth-time", relatedSlug: "bazi-vs-chinese-zodiac-compatibility",
    sources: [{ label: "IANA · Time Zone Database / 时区资料 / База часовых поясов", href: "https://www.iana.org/time-zones" }, { label: "DestinyPixel · Birth details / 出生资料 / Данные рождения", href: "/journal/prepare-birth-date-time-place" }],
    ...birthTimeArticle,
  },
  {
    slug: "how-to-ask-fortune-sticks", relatedSlug: "fortune-stick-number-and-edition",
    sources: [{ label: "DestinyPixel · Fortune sticks / 抽签使用说明 / Оракул палочек", href: "/sticks" }, { label: "DestinyPixel · Guanyin collection guide / 观音签指南 / Коллекция Гуаньинь", href: "/learn/guanyin-fortune-sticks" }],
    en: {
      title: "How to ask a fortune-stick question: love, work and change",
      description: "Turn a vague fortune-stick question into a useful one. Practical love and career examples, a simple draw routine, and how to turn a reading into a next step.",
      topic: "A question worth bringing", introduction: "You open the oracle and suddenly cannot decide what to ask. Will everything work out? Do they love me? Is this the right path? Those questions carry real feelings, but they give a symbolic reading very little context. You do not need special words or a perfect ritual. Start with the situation in front of you, one uncertainty and something you can actually notice or do after reading.",
      takeaway: "A useful question names one situation and one next step. The result can prompt reflection; it cannot supply facts about another person or guarantee an outcome.",
      sections: [
        ["Start with one situation, not your whole future", "Write down what has happened in a plain sentence before you draw: we keep postponing a conversation about moving, or I have an offer but have not clarified the working hours. Then ask what deserves your attention next. This gives you a way to read the imagery without stretching every line to fit everything in your life. It also helps you notice when an interpretation has wandered away from the question. You can keep identifying details out of the text; names, addresses and private messages are usually unnecessary for this kind of reflection. Specific does not have to mean personally revealing."],
        ["For love: move from mind-reading to conversation", "Instead of asking whether someone secretly loves you, try: what do I need to clarify before asking where this relationship is going? Or: how can I explain my need for reassurance without speaking for my partner? These versions do not promise a hidden answer. They return attention to what you can say, ask and observe. For example, write the sentence you have been avoiding, then check whether it invites an honest response or already contains an accusation. A reading cannot establish someone else’s feelings, loyalty or intentions. Their own words and consistent actions remain the evidence you need in the relationship."],
        ["For work: identify the missing fact", "A question such as should I accept this role can feel impossible because several questions are bundled together. Try asking what you need to clarify before deciding. After the reading, list the concrete facts still missing: expected hours, responsibilities, reporting arrangements or how success will be assessed. Choose one fact to obtain from the relevant person or document. The symbolic text may help you articulate a concern, but it cannot verify an employer’s promises or calculate whether an offer is financially suitable. Keep the actual decision attached to real terms and your own circumstances rather than treating an encouraging phrase as a recommendation."],
        ["For change: make the next step small enough to see", "When everything feels unsettled, a question about the rest of your life invites an answer too large to use. Narrow it to a near-term action: what am I overlooking before I make this move, or what could help me test this new routine for a week? A useful outcome might be a conversation, a practical check or a small experiment. It need not be a dramatic revelation. Write down what you expect to learn and when you will review it. The point is to reduce the distance between reflection and action, while leaving room for new information to change your view."],
        ["Draw once, then read the source note", "On DestinyPixel, select a collection and topic, keep one question in mind and let the draw finish. You can then request an optional AI interpretation for the question. First read the numbered text and its source note: the site combines selected traditional material with modern symbolic readings rather than reproducing every temple edition. A traditional verse, a translation, a modern adaptation and an AI explanation are different layers. If you already hold a temple slip, check its named collection and wording before matching the number online. The next guide explains why the number alone is not enough to identify the text."],
        ["What if you dislike the answer?", "Pause before drawing again just to obtain a more comfortable line. Notice what bothered you and separate the image in the text from a fact about your situation. Write three short notes: the question I brought, the phrase that caught my attention and one thing I can check or discuss. You may decide that the reading is not useful; there is no need to force it to fit. Revisit the situation when circumstances change, rather than treating repeated draws as a way to make reality agree. This question-writing routine is DestinyPixel’s practical suggestion, not a claim about a universal temple ritual."],
      ], action: { label: "Bring one question to the oracle", href: "/sticks" },
    },
    zh: {
      title: "求签怎么问问题？感情、事业与人生变化的六个实用步骤",
      description: "不知道抽签时该问什么？用感情与工作实例，把模糊问题改成可沟通、可核实的问题，再把签文转成一个实际行动。",
      topic: "把问题说清楚", introduction: "打开签堂，反而不知道问什么：一切会好吗？他爱我吗？这条路对不对？这些问题背后有真实的情绪，却很难给象征性解读一个清楚的落点。不需要特别的措辞，先说清眼前的处境、一件不确定的事，以及看完以后能观察或做的一小步。",
      takeaway: "一次只问一个处境中的一个问题。签文可以引发思考，不能替你查明别人的想法，也不能保证结果。",
      sections: [
        ["先说一个处境，不问整个未来", "抽之前，用普通话写一句发生了什么，例如：我们一直拖着没谈搬家的事；我收到了工作邀请，但还不清楚工作时间。然后再问接下来该留意什么。这样读签时就不必把每一句硬套到整个人生，也更容易发现解释有没有偏离问题。描述具体，不代表要提交姓名、地址和私人聊天记录；通常不需要这些信息。"],
        ["问感情：从猜心转向沟通", "与其问“对方是不是偷偷爱我”，可以问：“谈关系下一步之前，我还需要说清什么？”或者：“我怎样表达需要被回应，而不替对方下结论？”这类问法把关注点放回能说、能问、能观察的事情。试着写下你一直没说出口的那句话，看看它是在邀请回答，还是已经包含指责。签文无法证实一个人的感情、忠诚和意图，这些仍需要对方自己的表达与持续行动。"],
        ["问事业：找出缺的那条信息", "“我该不该接受这份工作”常常把很多问题挤在一起。可以先问：“作决定前，我还需要核实什么？”看完后列出缺的信息：工作时间、职责、汇报关系，或评价表现的方式，再挑一项去向相关人员或文件求证。象征文字可以帮你说清担忧，但不能核实雇主承诺，也不能替你判断收入安排是否适合自己。实际选择还是要回到真实条件。"],
        ["问变化：把下一步缩小到看得见", "生活一团乱时，问一辈子往哪里走，很容易得到大到无法使用的回答。不如改成：“搬家前，我可能忽略了什么？”或“接下来一周，我怎样试行这个新习惯？”有用的结果可能只是一次谈话、一次核查或一个小实验，不必是惊天启示。写清想了解什么，以及什么时候回顾，让反思与行动接起来，也允许新信息改变自己的看法。"],
        ["抽一签，再看来源说明", "在本站选择签系与主题，带着一个问题完成抽签，再按需请求AI解释。先读签文旁的来源说明：本站包含部分传统资料和现代象征解读，不是每座庙本的完整复制。传统原文、译文、现代改写、AI解释是不同层次。如果手里已有寺庙签纸，应先确认签系与文字，再按号码查找。下一篇指南会说明为什么签号相同，内容也可能不同。"],
        ["不喜欢答案时，先不要急着重抽", "留意到底是哪句话让你不舒服，把象征画面与现实事实分开。记三件事：我带来的问题、吸引我注意的句子、接下来能核实或讨论的一件事。觉得没帮助，也可以承认不适合，不必强行对号入座。等处境有变化再回看，比反复抽到满意为止更容易看清自己在意什么。这套提问练习是本站的实用建议，不代表所有寺庙都采用同一种仪式。"],
      ], action: { label: "带着一个问题进入签堂", href: "/sticks?locale=zh" },
    },
    ru: {
      title: "Как задать вопрос оракулу палочек: любовь, работа и перемены",
      description: "Практические примеры вопросов об отношениях и работе: как уточнить ситуацию, прочитать источник текста и выбрать небольшой следующий шаг.",
      topic: "Сформулировать свой вопрос", introduction: "Вы открыли оракул и растерялись: всё ли получится, любит ли он меня, верно ли я иду? За этими словами стоят настоящие чувства, но символическому чтению не хватает контекста. Начните с одной ситуации, одной неопределённости и небольшого действия, которое возможно после чтения. Особые слова и идеальный ритуал не нужны.",
      takeaway: "Полезный вопрос описывает одну ситуацию и ближайший шаг. Чтение может помочь размышлению, но не раскрывает чужие мысли и не гарантирует результат.",
      sections: [
        ["Одна ситуация вместо всего будущего", "Сначала запишите, что произошло: вы откладываете разговор о переезде или получили предложение работы без ясного графика. Затем спросите, на что обратить внимание дальше. Так меньше соблазна подгонять каждую строку под всю жизнь и легче заметить, что интерпретация ушла в сторону. Конкретность не требует раскрывать личное: имена, адреса и переписка для такого размышления обычно не нужны."],
        ["В любви: от чтения мыслей к разговору", "Вместо вопроса о тайных чувствах попробуйте: что стоит прояснить перед разговором о будущем отношений? Или: как объяснить потребность в поддержке, не отвечая за партнёра? Запишите избегаемую фразу и проверьте, приглашает ли она ответить или уже обвиняет. Чтение не устанавливает верность, чувства или намерения другого человека. Его слова и последовательные поступки остаются необходимыми свидетельствами."],
        ["В работе: найдите недостающий факт", "Вопрос о принятии предложения часто объединяет сразу несколько неизвестных. Спросите, что нужно уточнить до решения. После чтения перечислите реальные пробелы: график, обязанности, кому подчиняться, как оценивается работа. Выберите один пункт и получите ответ у соответствующего человека или в документе. Символический текст помогает сформулировать тревогу, но не проверяет обещания работодателя и не определяет финансовую пригодность предложения."],
        ["В переменах: достаточно маленький шаг", "Когда всё неопределённо, вопрос обо всей жизни даёт слишком большой ответ. Лучше спросить, что вы упускаете перед переездом или как попробовать новый распорядок в течение недели. Результатом может стать разговор, проверка или небольшой эксперимент. Запишите, что хотите узнать и когда вернётесь к оценке. Это связывает размышление с действием и оставляет возможность изменить мнение после новых сведений."],
        ["Вытяните палочку и прочитайте источник", "На DestinyPixel выберите коллекцию и тему, сосредоточьтесь на одном вопросе и дождитесь окончания. Затем при желании запросите объяснение ИИ. Сначала прочитайте пометку об источнике: библиотека сочетает отдельные традиционные материалы с современными символическими текстами. Оригинал, перевод, адаптация и объяснение ИИ — разные слои. Если у вас храмовый листок, сверяйте название коллекции и слова, а не только номер."],
        ["Если ответ не понравился", "Не спешите тянуть снова ради приятной строки. Отметьте, что задело, и отделите образ от факта. Запишите исходный вопрос, привлёкшую внимание фразу и одно дело для проверки или обсуждения. Можно признать, что чтение вам не помогло: подгонять его не требуется. Возвращайтесь, когда ситуация изменится. Это практическое упражнение DestinyPixel, а не утверждение о едином ритуале всех храмов."],
      ], action: { label: "Перейти к оракулу палочек", href: "/sticks?locale=ru" },
    },
  },

];

function translation(entry: Entry, locale: "en" | "zh" | "ru"): JournalTranslation {
  const copy = entry[locale];
  const sourceLabels: Record<string, Record<"en" | "zh" | "ru", string>> = {
    "https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm": { en: "Hong Kong Observatory: stems and branches", zh: "香港天文台：天干与地支", ru: "Гонконгская обсерватория: стволы и ветви" },
    "https://www.iana.org/time-zones": { en: "IANA: Time Zone Database", zh: "IANA：时区数据库", ru: "IANA: база часовых поясов" },
    "/compatibility": { en: "DestinyPixel: current comparison method", zh: "DestinyPixel：当前配对方法", ru: "DestinyPixel: метод сравнения" },
    "/sticks": { en: "DestinyPixel: collections and source notes", zh: "DestinyPixel：签系与来源说明", ru: "DestinyPixel: коллекции и источники" },
    "/learn/guanyin-fortune-sticks": { en: "Guanyin collection guide", zh: "观音签资料范围（英文）", ru: "Коллекция Гуаньинь (на английском)" },
    "/journal/prepare-birth-date-time-place": { en: "Prepare your birth details", zh: "准备出生日期、时间与地点", ru: "Подготовка данных рождения" },
  };
  return { ...copy, sections: copy.sections.map(([title, paragraph], index) => ({
    id: `step-${index + 1}`, title, paragraphs: [paragraph],
    ...(index === copy.sections.length - 1 ? { sources: entry.sources.map(source => ({ ...source, label: sourceLabels[source.href]?.[locale] ?? source.label, href: source.href.startsWith("/journal/") || source.href === "/compatibility" || source.href === "/sticks" ? `${source.href}${locale === "en" ? "" : `?locale=${locale}`}` : source.href })) } : {}),
  })) };
}

export const searchGrowthArticles: JournalSourceArticle[] = [...entries.map(entry => ({
  slug: entry.slug, relatedSlug: entry.relatedSlug, publishedAt: "2026-09-20", updatedAt: entry.slug === "compatibility-without-birth-time" ? "2026-09-30" : "2026-09-20",
  translations: { en: translation(entry, "en"), zh: translation(entry, "zh") },
})), baziCompatibilityArticle, fortuneStickEditionsArticle];
export const searchGrowthRussian: Record<string, JournalTranslation> = { ...Object.fromEntries(entries.map(entry => [entry.slug, translation(entry, "ru")])), [fortuneStickEditionsArticle.slug]: fortuneStickEditionsRussian, [baziCompatibilityArticle.slug]: baziCompatibilityRussian };
