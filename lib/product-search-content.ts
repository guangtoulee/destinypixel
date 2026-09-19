import { toTraditional } from "@/lib/journal-locales";
import type { ContentLocale, ReportLocale } from "@/lib/report-i18n";

export type SearchProduct = "sticks" | "compatibility";

export type ProductSearchCopy = {
  eyebrow: string;
  title: string;
  intro: string[];
  sections: {
    title: string;
    body: string;
    items?: { title: string; body: string }[];
    ordered?: boolean;
  }[];
  note: string;
  faqTitle: string;
  faqs: { question: string; answer: string }[];
  relatedTitle: string;
  related: { title: string; description: string; href: string }[];
};

const sticks: Record<ContentLocale, ProductSearchCopy> = {
  en: {
    eyebrow: "A little context for your reading",
    title: "Chinese fortune sticks, explained simply.",
    intro: [
      "Chinese fortune sticks, also called Kau Cim, connect a numbered draw with a verse or symbolic reading. Here you can draw a stick online for free, or look up a number you already have, then consider what the imagery brings to your question.",
      "DestinyPixel combines traditional material available for some entries with its own modern symbolic readings. This is not a complete, word-for-word archive of a particular temple’s lots. Read the source note beside your result: matching numbers do not always mean matching texts across temples or traditions.",
    ],
    sections: [
      {
        title: "Choose a tradition",
        body: "The five collections on this site offer different starting points for reflection. These are the number ranges used here.",
        items: [
          { title: "Guanyin · 100 sticks", body: "Family, peace of mind and care." },
          { title: "Guandi · 100 sticks", body: "Work, commitments and responsibility." },
          { title: "Yuelao · 60 sticks", body: "Love, closeness and communication." },
          { title: "Five Wealth Gods · 60 sticks", body: "Work resources, spending and priorities." },
          { title: "Wong Tai Sin · 100 sticks", body: "Change, timing and your next step." },
        ],
      },
      {
        title: "Draw, or find your number",
        body: "You do not need a birth chart to begin.",
        ordered: true,
        items: [
          { title: "Hold one question", body: "Choose a collection and topic. You can write your question or keep it in mind." },
          { title: "Draw one stick", body: "Let the draw finish. If you already have a number, open the number lookup for that collection." },
          { title: "Read it in context", body: "Read the verse or symbolic text, its explanation and the source note. Use the optional AI reading to explore your question further." },
        ],
      },
      {
        title: "Give your question room",
        body: "A useful question brings attention to something you can observe or change. Try one of these:",
        items: [
          { title: "Before a work decision", body: "“What should I clarify before accepting this role?”" },
          { title: "When love feels uncertain", body: "“What conversation are we avoiding?”" },
          { title: "At a turning point", body: "“What can I prepare before taking the next step?”" },
        ],
      },
    ],
    note: "Treat the result as a cultural and reflective experience. It cannot confirm another person’s feelings or predict what will happen; let real information and your own judgment guide important decisions.",
    faqTitle: "Questions about the sticks",
    faqs: [
      { question: "Will a number from a temple give me the same text here?", answer: "Not necessarily. Numbering and verses can differ by temple and edition. Select the same tradition, then compare the title, text and source note with your original slip. This site does not reproduce every temple edition." },
      { question: "Are the English readings literal translations?", answer: "Not throughout. Some entries have localized traditional material; others offer DestinyPixel’s modern symbolic interpretation. A traditional Chinese verse may be available in the Chinese version without a line-by-line translation in the English version. The result’s source note explains the distinction." },
      { question: "Should I keep drawing until I like the answer?", answer: "You can draw again, but a new number does not make an answer more reliable. It is often more useful to keep one reading, write down what it brings to mind and revisit it after something in your situation changes." },
    ],
    relatedTitle: "Another way to explore",
    related: [
      { title: "Compare your relationship", description: "See two birth charts through BaZi and astrology.", href: "/compatibility" },
      { title: "Find your day-pillar animal", description: "A free birthday card from the 60-character collection.", href: "/day-pillar" },
      { title: "A guide to Guanyin fortune sticks", description: "Learn how to ask a question and read the source behind a lot.", href: "/learn/guanyin-fortune-sticks" },
    ],
  },
  zh: {
    eyebrow: "读签之前，多了解一点",
    title: "在线抽签，也可以读得明白。",
    intro: [
      "抽签以签号连接签诗或象征意象，让人围绕眼前的一件事静心思考。在这里，你可以免费在线抽签，也可以选择签系、输入已有签号查阅签意，再结合自己的处境阅读解释。",
      "DestinyPixel 收录了部分有来源的传统内容，也提供本站整理的现代象征解读，并非某座寺庙完整、逐字的签诗档案。请留意结果旁的来源说明；不同庙本、不同签系的同一个号码，未必对应同一篇签文。",
    ],
    sections: [
      {
        title: "先选想问的方向",
        body: "五种签系提供不同的思考入口。以下数量为本站使用的签号范围。",
        items: [
          { title: "观音灵签 · 100 签", body: "家人、平安与心里的牵挂。" },
          { title: "关帝灵签 · 100 签", body: "事业、承诺与责任。" },
          { title: "月老灵签 · 60 签", body: "感情、亲近与沟通。" },
          { title: "五路财神 · 60 签", body: "工作资源、收支与取舍。" },
          { title: "黄大仙灵签 · 100 签", body: "变化、时机与下一步。" },
        ],
      },
      {
        title: "摇签与查签，怎么用？",
        body: "不需要先排八字，也不需要填写出生资料。",
        ordered: true,
        items: [
          { title: "专注一件事", body: "选好签系与主题，可以写下问题，也可以留在心里。" },
          { title: "抽取一支签", body: "等待摇签完成；如果已经有签号，展开当前签系的查签入口。" },
          { title: "结合处境读签", body: "依次读签文、白话解释与来源说明，再按需使用 AI 解签，探索与你的问题有关的提醒。" },
        ],
      },
      {
        title: "让问题更具体一点",
        body: "比起追问一个绝对答案，更有用的问题会指向你能够观察、沟通或调整的事。",
        items: [
          { title: "准备换工作", body: "“接受这份工作之前，我还需要问清什么？”" },
          { title: "关系有点僵", body: "“我们一直回避的是哪一次沟通？”" },
          { title: "遇到新机会", body: "“迈出下一步之前，我能先做好哪些准备？”" },
        ],
      },
    ],
    note: "把签意当作文化体验与自我思考的线索。它不能证实别人的心意，也不能预测事情必然怎样发展；重要选择仍需要现实信息和自己的判断。",
    faqTitle: "关于抽签，你可能想知道",
    faqs: [
      { question: "寺庙抽到的签号，在这里一定能查到原文吗？", answer: "不一定。不同庙本的编号、题名与诗句可能有差异。先选择相同签系，再核对题名、文字与来源说明；本站不包含所有寺庙版本的逐字原文。" },
      { question: "英文版都是传统签诗的直译吗？", answer: "不是。部分条目提供传统内容的本地化表达，其他条目使用本站的现代象征解读。中文版有传统签诗的号码，英文版也可能呈现现代释义而非逐句翻译，请以该条结果的来源说明为准。" },
      { question: "要一直抽到喜欢的答案为止吗？", answer: "可以重新抽，但换一个签号不会让答案更可靠。不妨先留住一支签，写下它让你注意到的事，等现实情况有了变化再回看。" },
    ],
    relatedTitle: "换个角度，继续了解",
    related: [
      { title: "看看你们的情感匹配", description: "结合八字与星盘，比较两个人的相处方式。", href: "/compatibility" },
      { title: "免费测你的日柱动物", description: "从公历生日找到六十种动物意象中的一张卡。", href: "/day-pillar" },
      { title: "读读五行与意象故事", description: "在专栏里了解出生图谱与性格意象。", href: "/journal" },
    ],
  },
  ru: {
    eyebrow: "Немного о вашем толковании",
    title: "Китайские гадательные палочки — понятным языком.",
    intro: [
      "В традиции китайских гадательных палочек, известной как Кау Чим, выпавший номер связывают со стихом или символическим толкованием. Здесь можно бесплатно вытянуть палочку онлайн либо найти уже известный номер и подумать, как его образы связаны с вашим вопросом.",
      "DestinyPixel сочетает доступные традиционные тексты с собственными современными толкованиями. Это не полный дословный архив какого-либо храма. Читайте примечание об источнике: один и тот же номер в разных храмах или традициях может означать разные тексты.",
    ],
    sections: [
      {
        title: "Выберите традицию",
        body: "Пять коллекций предлагают разные темы для размышления. Ниже указаны диапазоны номеров на этом сайте.",
        items: [
          { title: "Гуаньинь · 100 палочек", body: "Семья, спокойствие и забота." },
          { title: "Гуаньди · 100 палочек", body: "Работа, обязательства и ответственность." },
          { title: "Юэлао · 60 палочек", body: "Любовь, близость и общение." },
          { title: "Пять богов богатства · 60 палочек", body: "Ресурсы, расходы и приоритеты." },
          { title: "Вон Тай Син · 100 палочек", body: "Перемены, время и следующий шаг." },
        ],
      },
      {
        title: "Вытяните или найдите номер",
        body: "Для начала не нужна карта рождения.",
        ordered: true,
        items: [
          { title: "Сосредоточьтесь на одном вопросе", body: "Выберите коллекцию и тему. Вопрос можно записать или оставить при себе." },
          { title: "Вытяните палочку", body: "Дождитесь результата. Если номер уже известен, откройте поиск по номеру в нужной коллекции." },
          { title: "Сопоставьте с ситуацией", body: "Прочитайте текст, пояснение и примечание об источнике. При желании используйте ИИ, чтобы подробнее обсудить свой вопрос." },
        ],
      },
      {
        title: "Задайте конкретный вопрос",
        body: "Полезный вопрос обращает внимание на то, что можно заметить или изменить. Например:",
        items: [
          { title: "Перед сменой работы", body: "«Что нужно уточнить, прежде чем принять предложение?»" },
          { title: "Когда в любви есть сомнения", body: "«Какого разговора мы избегаем?»" },
          { title: "Перед новым этапом", body: "«Что я могу подготовить перед следующим шагом?»" },
        ],
      },
    ],
    note: "Это знакомство с культурной традицией и повод для размышления. Результат не подтверждает чужие чувства и не предсказывает события; важные решения принимайте на основе фактов и собственного суждения.",
    faqTitle: "Вопросы о палочках",
    faqs: [
      { question: "Совпадёт ли текст с палочкой, полученной в храме?", answer: "Не обязательно: нумерация и стихи зависят от храма и издания. Выберите ту же традицию и сравните название, текст и источник с вашим листком. На сайте представлены не все храмовые версии." },
      { question: "Все переводы дословные?", answer: "Нет. Часть записей содержит локализованный традиционный материал, часть — современные символические толкования DestinyPixel. Китайская версия может показывать исходный стих, тогда как русская — его современную интерпретацию. Различие указано в примечании об источнике." },
      { question: "Нужно ли тянуть, пока ответ не понравится?", answer: "Повторить можно, но другой номер не делает ответ достовернее. Попробуйте записать мысли после одного толкования и вернуться к ним, когда в ситуации что-то изменится." },
    ],
    relatedTitle: "Посмотрите с другой стороны",
    related: [
      { title: "Сравнить отношения", description: "Две карты рождения через Ба-цзы и астрологию.", href: "/compatibility" },
      { title: "Найти животное своего дня", description: "Бесплатная карточка из коллекции 60 образов.", href: "/day-pillar" },
      { title: "Читать журнал DestinyPixel", description: "Пять элементов, карта рождения и истории образов.", href: "/journal" },
    ],
  },
};

const compatibility: Record<ContentLocale, ProductSearchCopy> = {
  en: {
    eyebrow: "Understand the comparison",
    title: "BaZi compatibility meets your birth charts.",
    intro: [
      "A Chinese zodiac match usually starts with birth-year animals. This free BaZi and astrology compatibility tool goes further: it calculates both sets of Four Pillars, compares day elements and places the two birth charts side by side.",
      "The result explores four themes: personality, communication, affection and everyday rhythm. Your 60-animal portraits bring the day pillars to life, while the explanations offer concrete differences to discuss together—not a prediction of whether a relationship will last.",
    ],
    sections: [
      {
        title: "Start with your two animals",
        body: "Each day pillar maps to one of DestinyPixel’s 60 original animal portraits. The BaZi comparison looks at the two day-stem elements and their symbolic nourishing, controlling or shared relationship. The four-pillar chart also shows the relative distribution of its eight visible elements—not a full Day Master strength or useful-element assessment.",
      },
      {
        title: "Then compare four themes",
        body: "The Sun informs personality; Mercury, communication; Venus and cross-chart Moon–Venus links, affection; the Moon and Mars, everyday rhythm. Each score combines BaZi symbolism (30%) and tropical astrology (70%). Their equal-weight average uses our 60–100 editorial scale, not a relationship success rate. Rising signs, houses and marriage dates are not assessed.",
      },
      {
        title: "Bring accurate birth details",
        body: "This version needs each person’s date, known local birth time and a supported birth city. Historical time zones are used, with a solar-time correction for BaZi. Do not guess a missing time or pick a different city to bypass the form. If you only know a date, the free day-pillar card is a simpler starting point.",
      },
    ],
    note: "The calculated comparison stays separate from the optional DeepSeek interpretation. AI turns the supplied chart patterns into relationship reflections; it does not determine or change the scores.",
    faqTitle: "A little more about the method",
    faqs: [
      { question: "Why can people with the same zodiac animal get different results?", answer: "A birth-year animal is only one part of a Four Pillars chart. The day pillar, other pillars and calculated planetary positions can differ. The comparison uses those additional details, so it is not a fixed lookup table for twelve animals." },
      { question: "Does a nourishing five-element link guarantee harmony?", answer: "No. Nourishing, controlling and shared-element links are traditional symbolic relationships, not measurements of how two people treat each other. A nourishing link can prompt a discussion about giving and receiving; a controlling link can prompt one about boundaries. Neither decides the future of your relationship." },
    ],
    relatedTitle: "Prepare, discover, reflect",
    related: [
      { title: "A guide to BaZi love compatibility", description: "Understand what five-element relationships can bring to a conversation.", href: "/learn/bazi-love-compatibility" },
      { title: "Prepare your birth details", description: "A practical guide to date, time, place and time zones.", href: "/journal/prepare-birth-date-time-place" },
      { title: "Meet your day-pillar animal", description: "Explore your own personality and relationship themes first.", href: "/day-pillar" },
      { title: "Draw a relationship fortune stick", description: "Try the Yuelao collection with one question on your mind.", href: "/sticks?type=yuelao" },
    ],
  },
  zh: {
    eyebrow: "读懂这份适配结果",
    title: "从八字五行到星盘，看见两个人的相处方式。",
    intro: [
      "生肖配对通常从出生年份的属相出发。这里的免费八字与星盘情感匹配，会排出双方四柱，比较日干五行，并把两个人的星盘信息放在一起阅读，让相处中的共鸣与差异更具体。",
      "结果围绕性格底色、沟通方式、感情表达和日常节奏四个维度展开。六十日柱动物让这些象征更容易理解，也提供可以一起聊的话题；它并不预测一段关系能否长久。",
    ],
    sections: [
      {
        title: "先认识你们的日柱动物",
        body: "每个日柱对应 DestinyPixel 六十种原创动物意象之一。八字部分比较双方日干五行的相生、相克或同气关系，再展示四个天干与四个地支本气的相对分布。这不是完整的日主强弱、喜用神判断，也不能用五行数量直接判定婚姻好坏。",
      },
      {
        title: "再看四种相处维度",
        body: "性格参考太阳；沟通参考水星；感情表达参考金星及双方月亮与金星的交叉关系；日常节奏参考月亮和火星。每个维度结合八字象征关系（30%）与回归黄道星盘（70%），四项等权平均后呈现为本站的 60–100 分编辑尺度，不是关系成功率。本版不比较上升、宫位，也不预测结婚日期。",
      },
      {
        title: "用真实资料，开始比较",
        body: "当前版本需要双方公历生日、已知的当地出生时间，以及列表支持的出生城市。系统使用历史时区规则，八字另作真太阳时校正。不知道时间时请不要随意填一个，也不要用其他城市代替；如果只知道生日，可以先从免费的日柱意象卡开始。",
      },
    ],
    note: "计算结果与 DeepSeek 解读分别处理。AI 根据已计算的图谱，组织成更贴近日常相处的文字，不决定也不修改契合分数。",
    faqTitle: "关于方法，再了解一点",
    faqs: [
      { question: "同样的生肖，为什么匹配结果会不同？", answer: "出生年份的生肖只是四柱中的一部分。日柱、其他柱以及计算出的行星位置都可能不同。本工具会使用这些信息，所以结果不是十二生肖之间的一张固定配对表。" },
      { question: "五行相生，就说明一定合适吗？", answer: "不是。相生、相克与同气是传统象征关系，并不衡量两个人在现实中怎样对待彼此。相生可以提示你们聊聊给予与承接，相克可以提示边界与磨合；它们都不能替你决定一段感情的未来。" },
    ],
    relatedTitle: "准备资料，再多了解一点",
    related: [
      { title: "出生日期、时间与地点怎么填", description: "了解出生资料、时区与校准的实用指南。", href: "/journal/prepare-birth-date-time-place" },
      { title: "先认识自己的日柱动物", description: "免费了解性格底色与感情里的习惯。", href: "/day-pillar" },
      { title: "为心里的事求一支姻缘签", description: "进入月老签系，把注意力放在一个具体问题上。", href: "/sticks?type=yuelao" },
    ],
  },
  ru: {
    eyebrow: "Как читать сравнение",
    title: "Совместимость по Ба-цзы и картам рождения.",
    intro: [
      "Обычное сравнение по китайскому зодиаку начинается с животных года рождения. Бесплатный инструмент DestinyPixel рассчитывает четыре столпа каждого человека, сравнивает элементы дня и сопоставляет две натальные карты.",
      "Результат охватывает характер, общение, проявления любви и повседневный ритм. Наши 60 образов животных помогают представить столпы дня через понятные истории и найти темы для разговора. Это не прогноз долговечности отношений.",
    ],
    sections: [
      {
        title: "Сначала — ваши два животных",
        body: "Каждому столпу дня соответствует один из 60 авторских образов DestinyPixel. Сравнение Ба-цзы рассматривает элементы стволов дня: их символическую поддержку, сдерживание или совпадение. Также показано относительное распределение восьми видимых элементов четырёх столпов. Это не полный анализ силы карты или полезных элементов.",
      },
      {
        title: "Затем — четыре темы отношений",
        body: "Солнце связано с характером; Меркурий — с общением; Венера и перекрёстные связи Луны с Венерой — с любовью; Луна и Марс — с повседневным ритмом. Каждый раздел сочетает Ба-цзы (30%) и тропическую астрологию (70%). Четыре раздела имеют равный вес на авторской шкале 60–100: это не вероятность успеха. Асцендент, дома и даты брака не оцениваются.",
      },
      {
        title: "Подготовьте точные данные",
        body: "Нужны дата, известное местное время и город рождения каждого человека из доступного списка. Учитываются исторические часовые пояса; для Ба-цзы применяется солнечная поправка. Не подставляйте выдуманное время или другой город. Если известна только дата, начните с бесплатной карточки столпа дня.",
      },
    ],
    note: "Расчёт и интерпретация DeepSeek разделены. ИИ объясняет уже рассчитанные карты через повседневные ситуации и не определяет и не меняет баллы.",
    faqTitle: "Ещё немного о методе",
    faqs: [
      { question: "Почему у людей одного животного года разные результаты?", answer: "Животное года — лишь часть четырёх столпов. Столп дня, другие столпы и положения планет могут различаться. Инструмент учитывает эти детали, а не использует фиксированную таблицу для двенадцати животных." },
      { question: "Гарантирует ли поддержка элементов гармонию?", answer: "Нет. Поддержка, сдерживание и совпадение элементов — традиционные символические связи, а не оценка реальных поступков. Поддержка может стать поводом поговорить об отдаче и принятии, сдерживание — о границах. Ни одна связь не определяет будущее пары." },
    ],
    relatedTitle: "Подготовьтесь и продолжите знакомство",
    related: [
      { title: "Подготовить данные рождения", description: "Практическое руководство по дате, времени, месту и часовым поясам.", href: "/journal/prepare-birth-date-time-place" },
      { title: "Найти животное своего дня", description: "Сначала изучите собственный характер и привычки в любви.", href: "/day-pillar" },
      { title: "Вытянуть палочку об отношениях", description: "Задайте один конкретный вопрос коллекции Юэлао.", href: "/sticks?type=yuelao" },
    ],
  },
};

const productCopy: Record<SearchProduct, Record<ContentLocale, ProductSearchCopy>> = { sticks, compatibility };

export function getProductSearchContent(product: SearchProduct, locale: ReportLocale): ProductSearchCopy {
  const source = productCopy[product][locale === "zh-TW" ? "zh" : locale];
  const localized: ProductSearchCopy = locale === "zh-TW"
    ? JSON.parse(toTraditional(JSON.stringify(source))) as ProductSearchCopy
    : source;

  return {
    ...localized,
    related: localized.related.map((link) => {
      const isDayPillar = link.href === "/day-pillar";
      const linkLocale = isDayPillar
        ? locale === "zh" || locale === "zh-TW" ? "zh" : "en"
        : locale;
      const languageNote = isDayPillar && locale === "ru" ? " (English)"
        : isDayPillar && locale === "zh-TW" ? "（簡體中文）" : "";

      return {
        ...link,
        title: `${link.title}${languageNote}`,
        href: link.href.startsWith("/learn/") ? link.href
          : `${link.href}${link.href.includes("?") ? "&" : "?"}locale=${linkLocale}`,
      };
    }),
  };
}
