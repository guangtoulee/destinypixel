import type { JournalSourceArticle, JournalTranslation } from "./journal";

const calendarSource = "https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm";

// Revision of the existing guide, not a second page for the same search intent.
// Calendar facts, our scoring method, and fictional conversation examples are distinct.
export const baziCompatibilityArticle: JournalSourceArticle = {
  slug: "bazi-vs-chinese-zodiac-compatibility",
  relatedSlug: "compatibility-without-birth-time",
  publishedAt: "2026-09-20",
  updatedAt: "2026-10-13",
  zhTwReplacements: [["配對錶", "配對表"], ["曆法", "歷法"]],
  translations: {
    en: {
      title: "BaZi vs Chinese Zodiac Compatibility: What Are You Comparing?",
      description: "Go beyond birth-year animals: compare BaZi five elements, understand scores with or without birth times, and turn a reading into a useful conversation.",
      topic: "Love & the five elements",
      introduction: "A Chinese zodiac table calls you a perfect match. At home, one of you wants to settle every disagreement immediately; the other needs a quiet evening first. Which description should you believe? Start by asking what the table actually compares. A birth-year animal, a Four Pillars reading and a compatibility calculator use different amounts of information. Here is how to read those differences without letting a number speak for your partner.",
      takeaway: "Chinese zodiac matching usually compares birth-year animals. BaZi adds the month, day and hour. On DestinyPixel, one unknown birth time also changes the scoring method: the date-based result uses two BaZi themes, with no planetary aspect score.",
      sections: [
        {
          id: "step-1", title: "1. What does a Chinese zodiac compatibility table compare?",
          paragraphs: ["A familiar zodiac table pairs the animal associated with one birth year with another. It is a memorable cultural introduction, but it cannot distinguish people with the same year animal and different birth months, days or hours. An apparent match in that table does not explain how two particular people handle affection, disagreement or everyday responsibilities.", "Near the start of a year, check the calendar convention before assuming that two calculators disagree. DestinyPixel’s full birth calculation changes the year pillar at LiChun, the start of spring. That boundary is not interchangeable with Lunar New Year. First establish which labels are being compared; only then consider their symbolic reading."],
        },
        {
          id: "step-2", title: "2. What does BaZi add beyond the year animal?",
          paragraphs: ["BaZi, or the Eight Characters, combines a stem and a branch for each of the year, month, day and hour. The Hong Kong Observatory explains this calendar structure and the sixty-pair cycle. Its calendar reference does not validate predictions about relationships.", "In a BaZi reading, the day stem provides a reference for the five elements: wood, fire, earth, metal and water. Different dates can give two people different day elements even when their year animals match. Our calculator compares the day elements and the relative distribution of elements in available pillars. It does not perform every technique used in traditional marriage readings, determine favourable elements or diagnose the strength of a chart from simple counts."],
          sources: [{ label: "Hong Kong Observatory: stems, branches and the Eight Characters", href: calendarSource }],
        },
        {
          id: "step-3", title: "3. Do supporting elements mean an easier relationship?",
          paragraphs: ["Within the five-element vocabulary, a generating relationship suggests support; a controlling relationship suggests shaping or limits. These are symbolic relationships, not verdicts about good and bad partners. For example, wood nourishing fire can open a discussion about who encourages an idea and how that encouragement is received. It does not prove that either person always gives or always takes.", "A useful question is more concrete: “When I offer advice, do you feel supported or corrected?” The answer comes from your partner. You can also ask when help becomes pressure, or what a respectful boundary would sound like. Our separate five-elements relationship guide explores these metaphors in more detail; an element label alone cannot establish someone’s behaviour."],
          links: [{ text: "five-elements relationship guide", href: "/journal/five-elements-relationship-compatibility" }],
        },
        {
          id: "step-4", title: "4. Where do the sixty animal cards fit?",
          paragraphs: ["DestinyPixel gives the sixty day-pillar combinations original animal portraits, names and stories. They make a calendar pattern easier to remember. They are not sixty ancient personality diagnoses, and the artwork adds no hidden points to the compatibility score. The year animal and the day-pillar portrait answer different calendar questions.", "Each person can choose one card description that resembles a real experience and one that does not. Let your partner describe their own experience before interpreting their card for them. Sharing an image does not establish shared values; different images do not establish conflict. The useful part is the story you can discuss together."],
        },
        {
          id: "step-5", title: "5. How does the free BaZi compatibility calculator score a pair?",
          paragraphs: ["The method depends on whether both birth times are supplied. Enter each person’s Gregorian date and supported birth city, then provide the recorded local time or mark that person’s time as unknown. You can mark either person independently. The city is still needed for time-zone rules; a missing hour is never filled with noon.", "For an unknown time, the day portrait uses the local civil date and a midnight boundary. The hour pillar stays absent; a year or month pillar that changes across that local day is also omitted. The partner with a known time keeps their calculated pillars. Element counts are compared as proportions so different amounts of available information are not treated as equal raw counts. See the birth-time guide for input steps and boundary cases."],
          table: { headings: ["Input mode", "What contributes to the score"], rows: [
            ["Both birth times supplied", "Four equally weighted themes: personality, communication, affection and daily rhythm. Each blends 30% BaZi with 70% selected planetary comparisons. Day-element affinity supplies the first three BaZi components; element distribution supplies the rhythm component."],
            ["One or both times unknown", "Two equally weighted themes: day-element connection (50%) and the relative distribution of available pillar elements (50%). Missing pillars are excluded. Planetary aspects do not contribute."],
            ["Possible signs shown for an unknown time", "Hourly samples of the Sun, Moon, Mercury, Venus and Mars across the local day. These are approximate possibilities, not confirmed birth positions, and carry no weight in the date-based score."],
          ] },
          links: [{ text: "birth-time guide", href: "/journal/compatibility-without-birth-time" }],
          sources: [{ label: "DestinyPixel: current inputs and comparison method", href: "/compatibility" }, { label: "DestinyPixel: public product facts", href: "/product-facts" }],
        },
        {
          id: "score-limits", title: "6. What does a score of 80 actually mean?",
          paragraphs: ["It means a position on DestinyPixel’s editorial 60–100 scale. It does not mean an 80% chance of a lasting relationship, and 60 is not a failing grade. Both the weights and the positive lower bound are design choices, not measured relationship statistics. Similar element proportions also do not establish that either person’s individual chart is balanced or complete.", "Do not compare an 80 from the date-based mode directly with an 80 from the full mode. The ingredients differ. Finding a missing birth time can change the method and, near a day boundary, the day portrait itself; it does not mean your relationship changed overnight. AI explains supplied patterns and does not choose the score, recover a missing birth time or establish another person’s feelings. Neither mode calculates rising signs, houses or a marriage date in this compatibility tool."],
        },
        {
          id: "example", title: "7. A fictional couple: support that feels like pressure",
          paragraphs: ["Imagine Alex and Sam, a fictional couple for this exercise, not a published chart or customer report. Alex has a recorded birth time; Sam knows only the date. They mark Sam’s time unknown, so the result uses the two-theme date-based method. Suppose their displayed day-element connection is wood nourishing fire. We have assigned that connection to illustrate how to read it, not calculated it from invented birthdays.", "Alex sees “support” and thinks of sending Sam advice about a project every evening. Sam experiences those messages as another task after work. The symbol has not resolved the disagreement; it has named a question. Instead of “Our elements say I help you,” Alex asks, “Would listening first help more than suggestions?” Sam can ask for ten minutes to describe the problem before choosing whether to hear ideas. Their actual response, rather than a higher score, tells them whether the change helps."],
        },
        {
          id: "step-6", title: "8. Turn the reading into one useful conversation",
          paragraphs: ["Read the input mode and missing information before the interpretation. A date-based comparison can still offer a starting point, provided both people know what is absent. These conversation steps are DestinyPixel’s editorial exercise, not a traditional ritual or a test of whether the chart is correct.", "Keep the question small enough to revisit: after a difficult workday, would you prefer company, questions or quiet first? If the reading does not fit, say so. Respect, consent, shared plans and consistent behaviour remain things to learn directly from each other."],
          steps: ["Check the dates, birthplace selections and known/unknown time settings together.", "Each person names one description that fits a specific experience and one that does not.", "Agree on one small action, such as naming a time to resume a paused conversation.", "After a week, discuss what happened and adjust the agreement without trying to improve the score."],
        },
      ],
      action: { label: "Compare two birthdays — birth time optional", href: "/compatibility" },
    },
    zh: {
      title: "生肖配对和八字合婚有什么区别？五行与匹配分数怎么看",
      description: "生肖配对只看什么，八字合婚多看什么？比较已知与未知时辰的两种评分，理解五行、60动物卡与相处方式，读懂免费匹配结果。",
      topic: "感情与五行",
      introduction: "生肖表上写着“很般配”，真正相处却是一个人想立刻讲清楚，另一个人想先安静一晚。到底该信哪一种描述？先看配对表究竟比较了什么：年生肖、四柱八字和匹配工具使用的信息并不相同。弄清这些区别，才能把结果读成一次交流的起点，而不是让一个数字替伴侣说话。",
      takeaway: "生肖配对通常比较出生年的动物；八字进一步看月、日、时。本站只要有一方时辰未知，就会改用两项八字主题评分，星盘相位不参与日期版分数。",
      sections: [
        {
          id: "step-1", title: "1. 生肖配对表到底在比较什么？",
          paragraphs: ["常见配对表从双方出生年的动物出发。它好记、好分享，适合作为文化入口，却区分不了同属一个生肖、出生月份、日期或时辰不同的人。表上写着合适，并不能说明这两个人怎样表达感情、处理分歧或分担日常事务。", "出生日期靠近换年时，先核对历法规则，再判断两个工具是否矛盾。本站完整出生计算以立春作为年柱边界，不与农历正月初一混用。先确认双方比较的是哪些标签，再读标签背后的象征含义。"],
        },
        {
          id: "step-2", title: "2. 八字比年生肖多看了什么？",
          paragraphs: ["年、月、日、时各有一个天干和一个地支，合起来就是八个字。香港天文台介绍了这种历法结构与六十干支循环；这份历法资料并不是对感情预测的验证。", "八字解读以日干作为理解木、火、土、金、水的一个参照。同年生肖的人，日干五行仍可能不同。本站工具比较双方日干五行，以及可用柱中五行的相对分布，并未执行传统合婚的全部技法，也不会用简单数量统计判定喜用神或日主强弱。"],
          sources: [{ label: "香港天文台：天干、地支与八字", href: calendarSource }],
        },
        {
          id: "step-3", title: "3. 五行相生，就一定更好相处吗？",
          paragraphs: ["在五行语言里，“相生”带出支持与滋养，“相克”带出塑造与限制。这是象征关系，不能直接判成好伴侣或坏伴侣。例如“木生火”可以引出谁在鼓励一个想法、对方怎样接受鼓励的话题，但不能证明某个人永远付出、另一个人永远索取。", "更具体的问题是：“我提建议的时候，你觉得被支持，还是被纠正？”答案要由对方来讲。还可以讨论帮助从何时开始变成压力，以及怎样表达边界才让双方舒服。五行与相处方式指南会继续展开这些比喻；仅凭元素标签，无法确认一个人的真实行为。"],
          links: [{ text: "五行与相处方式指南", href: "/journal/five-elements-relationship-compatibility?locale=zh" }],
        },
        {
          id: "step-4", title: "4. 60动物卡与生肖是什么关系？",
          paragraphs: ["DestinyPixel 为六十种日柱组合设计了原创动物意象、名称和故事，让历法组合更容易记住。它们不是六十种古代人格诊断，画面也不会额外加上隐藏分数。出生年的生肖和出生当天的日柱卡，描述的是不同层次的历法信息。", "各自挑一条符合真实经历的卡片描述，再挑一条不符合的。先让伴侣讲自己的体验，不要替对方宣布“你就是这样的人”。意象相似不等于价值观相同，意象不同也不能证明存在冲突；有用的是两个人愿意展开的那段讨论。"],
        },
        {
          id: "step-5", title: "5. 免费八字匹配到底怎么算分？",
          paragraphs: ["评分方法取决于双方是否都提供了出生时辰。分别填写公历生日、支持的出生城市，再填记录中的当地时间，或为该人勾选“时辰未知”。两个人可以分别选择。城市仍用于确定时区规则，缺失的时间不会被填成午时。", "时辰未知者按当地民用日期、午夜换日取得日柱，不计算缺失时柱；年柱或月柱若在当地这一天跨节气变化，也会留空。时辰已知者保留按其时间算出的柱。双方的信息量可能不同，所以五行按占比比较，而不是直接比较原始数量。具体填写步骤与边界情况见未知出生时辰指南。"],
          table: { headings: ["输入情况", "哪些内容参与评分"], rows: [
            ["双方时辰都已知", "性格、沟通、感情表达、日常节奏四项等权平均。每项由30%八字与70%指定行星比较组成；前三项的八字部分来自日干五行关系，日常节奏的八字部分来自五行分布。"],
            ["一方或双方时辰未知", "只比较两项：日干五行互动占50%，可用柱的五行相对分布占50%。缺失柱排除，星盘相位不参与评分。"],
            ["未知时辰者显示的可能星座", "在当地一天内逐小时取样太阳、月亮、水星、金星、火星。它们是近似可能范围，不是已确认的出生位置，也不参与日期版评分。"],
          ] },
          links: [{ text: "未知出生时辰指南", href: "/journal/compatibility-without-birth-time?locale=zh" }],
          sources: [{ label: "DestinyPixel：当前输入与匹配方法", href: "/compatibility?locale=zh" }, { label: "DestinyPixel：公开产品事实", href: "/product-facts?locale=zh" }],
        },
        {
          id: "score-limits", title: "6. 80分究竟代表什么？",
          paragraphs: ["它代表本站60—100编辑尺度上的一个位置，不代表关系长久的概率是80%，60分也不是“不及格”。计算权重与正向分数下限都是本站的设计选择，不是统计验证过的感情规律。双方五行占比相似，也不等于各自命盘已经平衡或资料完整。", "日期版的80分，不能与完整资料版的80分直接比高低，因为计算内容不同。后来找到出生时间，方法可能改变；靠近日界时，日柱意象也可能改变。这不意味着关系一夜之间变了。AI解释已提供的图谱，不决定分数、不找回失落时辰，也不能证实对方心意。本合盘工具的两种模式都不计算上升、宫位或婚期。"],
        },
        {
          id: "example", title: "7. 一个虚构例子：好意为什么会变成压力？",
          paragraphs: ["假设安与宁是一对伴侣，这是阅读练习，不是公开命盘或真实用户报告。安有出生时间记录，宁只知道日期。他们为宁选择“时辰未知”，因此使用两项等权的日期版方法。再假设页面显示“木生火”：这个关系是为了演示读法而设定的，没有根据编造的生日排盘。", "安看到“支持”，想到自己每晚都会给宁发项目建议；宁却觉得下班后又多了一项任务。五行比喻没有替他们解决争执，只是让问题浮现。安不再说“我们的五行说明我是在帮你”，而是问：“先听你说，是不是比直接给建议更有用？”宁可以提出先讲十分钟，再决定要不要听建议。下一次的真实感受，才是判断这个改变是否有帮助的依据。"],
        },
        {
          id: "step-6", title: "8. 怎样把匹配结果用到一次对话里？",
          paragraphs: ["先看本次输入模式与缺失信息，再读解释。日期版也能提供讨论起点，前提是双方知道没有算哪些内容。下面是本站原创的交流练习，不是传统仪式，也不是验证命盘对错的测试。", "问题可以小到下班不顺时，想先有人陪、有人问，还是安静一下。描述不符合就直接说不符合。尊重、双方意愿、共同计划与持续行动，仍需要从相处中了解。"],
          steps: ["一起核对生日、出生城市，以及每人的已知或未知时辰设置。", "各自选一条符合具体经历的描述，再选一条不符合的。", "约定一件小事，例如暂停争论时说清何时回来继续谈。", "一周后回顾发生了什么，再调整约定，不以提高匹配分数为目标。"],
        },
      ],
      action: { label: "免费比较两人生日，时辰可选", href: "/compatibility?locale=zh" },
    },
  },
};

export const baziCompatibilityRussian: JournalTranslation = {
  title: "Совместимость по бацзы и китайскому зодиаку: что сравнивают?",
  description: "Чем бацзы отличается от сравнения животных года? Пять элементов, расчёт с известным и неизвестным временем рождения и понятное чтение баллов.",
  topic: "Отношения и пять элементов",
  introduction: "Таблица китайского зодиака обещает прекрасную пару. Но после ссоры одному хочется сразу всё обсудить, а другому нужен тихий вечер. Какому описанию верить? Сначала выясните, что именно сравнивается. Животное года, четыре столпа и калькулятор совместимости используют разный объём сведений. Понимание этой разницы помогает обсуждать результат, не позволяя числу отвечать за партнёра.",
  takeaway: "Китайский зодиак обычно сопоставляет животных года. Бацзы добавляет месяц, день и час. На DestinyPixel неизвестное время хотя бы одного человека меняет метод: индекс по датам использует две темы бацзы без оценки планетных аспектов.",
  sections: [
    {
      id: "step-1", title: "1. Что сравнивает таблица китайского зодиака?",
      paragraphs: ["Обычная таблица сопоставляет животных двух лет рождения. Это запоминающееся знакомство с культурой, но оно не различает людей одного знака с разными месяцами, днями и часами рождения. Такое совпадение не объясняет, как конкретная пара выражает чувства, разрешает разногласия и делит повседневные обязанности.", "Вблизи начала года уточните календарное правило, прежде чем считать два калькулятора противоречащими друг другу. В полном расчёте DestinyPixel годовой столп меняется в Личунь, начало весны. Эта граница не совпадает по смыслу с лунным Новым годом. Сначала установите, какие обозначения сравниваются, затем переходите к символической интерпретации."],
    },
    {
      id: "step-2", title: "2. Что бацзы добавляет к животному года?",
      paragraphs: ["Бацзы, или восемь знаков, состоит из ствола и ветви для года, месяца, дня и часа. Гонконгская обсерватория описывает эту календарную структуру и цикл из шестидесяти сочетаний. Календарная справка не подтверждает предсказания об отношениях.", "Ствол дня служит одной из отправных точек для пяти элементов: дерева, огня, земли, металла и воды. У людей с одинаковым животным года элементы дня могут различаться. Наш калькулятор сопоставляет элементы дня и относительные доли элементов доступных столпов. Он не выполняет все методы традиционного брачного разбора, не определяет благоприятные элементы и не устанавливает силу карты по простому подсчёту."],
      sources: [{ label: "Гонконгская обсерватория: стволы, ветви и восемь знаков", href: calendarSource }],
    },
    {
      id: "step-3", title: "3. Означает ли поддержка элементов лёгкие отношения?",
      paragraphs: ["В языке пяти элементов порождение связано с поддержкой, а контроль — с формированием и ограничениями. Это символические отношения, а не приговор о хорошем или плохом партнёре. Например, образ дерева, питающего огонь, позволяет спросить, кто поддерживает идею и как эта помощь воспринимается. Он не доказывает, что один человек всегда отдаёт, а другой только получает.", "Полезнее спросить прямо: «Когда я советую, ты чувствуешь поддержку или замечание?» Ответ даёт партнёр. Можно обсудить, когда помощь становится давлением и как обозначить границу уважительно. Отдельное руководство о пяти элементах подробнее раскрывает эти метафоры; один элемент не устанавливает реальное поведение человека."],
      links: [{ text: "руководство о пяти элементах", href: "/journal/five-elements-relationship-compatibility?locale=ru" }],
    },
    {
      id: "step-4", title: "4. Как связаны с этим шестьдесят животных?",
      paragraphs: ["DestinyPixel даёт шестидесяти сочетаниям столпа дня авторские изображения животных, имена и истории. Так календарное сочетание легче запомнить. Это не шестьдесят древних диагнозов личности, а иллюстрация не добавляет скрытых баллов. Животное года и образ столпа дня относятся к разным частям календаря.", "Каждый может выбрать одно описание, похожее на конкретный опыт, и одно неподходящее. Сначала выслушайте партнёра, а не объясняйте ему, кто он такой по карте. Похожие образы не доказывают общие ценности; разные не доказывают конфликт. Польза появляется в разговоре, который они помогают начать."],
    },
    {
      id: "step-5", title: "5. Как бесплатный калькулятор совместимости бацзы считает баллы?",
      paragraphs: ["Метод зависит от того, указано ли время рождения обоих. Для каждого введите григорианскую дату и поддерживаемый город рождения, затем записанное местное время либо отметку о неизвестном времени. Отметки независимы. Город всё ещё нужен для правил часового пояса; отсутствующий час не заменяется полуднем.", "Для неизвестного времени образ дня определяется по местной гражданской дате с границей в полночь. Часовой столп отсутствует; годовой или месячный тоже исключается, если меняется в течение этих местных суток на границе солнечного периода. У партнёра с известным временем сохраняются рассчитанные столпы. Элементы сравниваются по долям, а не по исходному количеству, поскольку объём сведений может различаться. Порядок ввода и пограничные случаи описаны в руководстве о неизвестном времени рождения."],
      table: { headings: ["Исходные данные", "Что входит в оценку"], rows: [
        ["Время известно у обоих", "Четыре равновесные темы: характер, общение, выражение чувств и повседневный ритм. В каждой 30% от бацзы и 70% от выбранных планетных сравнений. В первых трёх темах часть бацзы — связь элементов дня, в ритме — распределение элементов."],
        ["Время одного или обоих неизвестно", "Две темы с равным весом: связь элементов дня (50%) и относительное распределение элементов доступных столпов (50%). Отсутствующие столпы исключены. Планетные аспекты в баллы не входят."],
        ["Возможные знаки при неизвестном времени", "Почасовые выборки Солнца, Луны, Меркурия, Венеры и Марса за местные сутки. Это приблизительные варианты, а не подтверждённые положения при рождении. Они не участвуют в оценке по датам."],
      ] },
      links: [{ text: "руководстве о неизвестном времени рождения", href: "/journal/compatibility-without-birth-time?locale=ru" }],
      sources: [{ label: "DestinyPixel: текущие данные и метод сравнения", href: "/compatibility?locale=ru" }, { label: "DestinyPixel: факты о продуктах", href: "/product-facts?locale=ru" }],
    },
    {
      id: "score-limits", title: "6. Что на самом деле означает оценка 80?",
      paragraphs: ["Это положение на авторской шкале DestinyPixel от 60 до 100. Оно не означает 80% вероятности долгих отношений, а 60 не является провалом. Веса и положительная нижняя граница выбраны редакцией, а не выведены из статистики отношений. Сходство долей элементов также не устанавливает сбалансированность или полноту каждой отдельной карты.", "Нельзя напрямую сравнивать 80 в режиме по датам с 80 в полном режиме: используются разные составляющие. Найденное время рождения может изменить метод, а вблизи границы суток — и образ дня. Это не значит, что отношения изменились за ночь. ИИ объясняет переданные данные, но не выбирает баллы, не восстанавливает час рождения и не устанавливает чувства другого человека. Ни один режим этого инструмента совместимости не рассчитывает асцендент, дома или дату брака."],
    },
    {
      id: "example", title: "7. Вымышленная пара: когда забота ощущается как давление",
      paragraphs: ["Представим Алекса и Сэм — вымышленную пару для упражнения, а не опубликованные карты или отчёт клиентов. У Алекса время рождения записано, Сэм знает только дату. Они отмечают время Сэм как неизвестное, поэтому применяется метод по датам с двумя темами. Допустим, показана связь «дерево питает огонь». Мы задали её для объяснения чтения, а не рассчитали по придуманным дням рождения.", "Алекс читает о поддержке и вспоминает, как каждый вечер отправляет Сэм советы по проекту. Для Сэм эти сообщения ощущаются как дополнительная работа. Символ не разрешил спор, но помог сформулировать вопрос. Вместо «Наши элементы говорят, что я помогаю» Алекс спрашивает: «Может, сначала лучше послушать, чем советовать?» Сэм может попросить десять минут на рассказ и лишь потом решить, нужны ли идеи. О пользе перемены скажет реальный отклик, а не более высокий балл."],
    },
    {
      id: "step-6", title: "8. Как превратить результат в полезный разговор?",
      paragraphs: ["Сначала прочитайте режим расчёта и перечень недостающих сведений, затем интерпретацию. Сравнение по датам тоже может стать отправной точкой, если оба понимают его ограничения. Следующие шаги — авторское упражнение DestinyPixel, а не традиционный ритуал или проверка истинности карты.", "Выберите небольшой вопрос: после тяжёлого рабочего дня вам сначала нужны компания, вопросы или тишина? Если описание не подходит, скажите об этом. Уважение, согласие, общие планы и последовательность поступков по-прежнему узнаются в общении друг с другом."],
      steps: ["Вместе проверьте даты, выбранные города и отметки об известном или неизвестном времени.", "Каждый называет описание, похожее на конкретный опыт, и описание, которое не подходит.", "Договоритесь об одном небольшом действии: например, называйте время возвращения к прерванному разговору.", "Через неделю обсудите результат и измените договорённость при необходимости, не пытаясь повысить баллы."],
    },
  ],
  action: { label: "Сравнить даты — время рождения необязательно", href: "/compatibility?locale=ru" },
};
