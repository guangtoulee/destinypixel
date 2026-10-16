import type { JournalSourceArticle, JournalTranslation } from "./journal";

// A reading exercise with deliberately assigned positions, not a customer's chart.
// Traditional symbolism is distinct from the verified calculator settings below.
const sunSource = "https://www.astro.com/astrowiki/en/Sun";
const moonSource = "https://www.astro.com/astrowiki/en/Moon";
const risingSource = "https://www.astro.com/astrowiki/en/Ascendant";
const housesSource = "https://www.astro.com/astrology/in_house1_e.htm";
const aspectsSource = "https://www.astro.com/astrowiki/en/Aspect";

export const sunMoonRisingArticle: JournalSourceArticle = {
  slug: "sun-moon-rising-signs-explained",
  relatedSlug: "prepare-birth-date-time-place",
  publishedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  zhTwReplacements: [["別隻看", "別只看"], ["合作伙伴", "合作夥伴"], ["鼠標", "滑鼠"], ["點擊", "點選"], ["註冊或登錄", "註冊或登入"], ["一起保存", "一起儲存"]],
  translations: {
    en: {
      title: "Sun, Moon and Rising Signs: How to Read Your Big Three Together",
      description: "Understand Sun, Moon and rising signs with one worked example. Add houses and aspects, check birth-time limits, then explore your own free natal chart.",
      topic: "Reading your birth chart",
      introduction: "You know your Sun sign, but its description never quite sounds like you. A birth chart adds more than two extra labels: it gives you different questions to ask about the same experience. What do you want to build? What helps you feel settled? How do you approach an unfamiliar room? Start there, then bring the three answers together.",
      takeaway: "In modern astrological interpretation, the Sun concerns identity and direction, the Moon emotional needs and familiar responses, and the rising sign how you approach the world. Read their signs together, then add houses and actual aspect angles. They are symbolic prompts, not a validated personality test.",
      sections: [
        {
          id: "three-questions", title: "1. Sun, Moon or rising: which one is the real you?",
          paragraphs: ["None needs to win. These are three parts of an astrological vocabulary, rather than three people competing inside you. The Sun and Moon are celestial bodies; the Ascendant is a calculated point where the eastern horizon meets the zodiac. Your rising sign is the sign containing that point. It is not another planet.", "Try the questions below before reading a long description. Write down a specific recent situation, including something that does not fit the suggested theme. Recognizing a sentence is a starting point for reflection, not evidence that a chart explains your personality."],
          table: { headings: ["Chart factor", "A question to explore"], rows: [
            ["Sun · identity and direction", "What am I trying to make, express or become proud of?"],
            ["Moon · needs and habitual responses", "What helps me settle after a demanding day? What do I do before thinking it through?"],
            ["Rising / Ascendant · approach", "How do I begin when a person, task or setting is unfamiliar?"],
          ] },
          sources: [{ label: "Astrodienst: Sun symbolism", href: sunSource }, { label: "Astrodienst: Moon symbolism", href: moonSource }, { label: "Astrodienst: Ascendant definition", href: risingSource }],
        },
        {
          id: "worked-example", title: "2. A fictional example: steady goals, space to breathe, a confident entrance",
          paragraphs: ["For this exercise, imagine Alex with a Taurus Sun at 14°, an Aquarius Moon at 16° and Leo rising at 8°. These positions are deliberately assigned to demonstrate reading, not calculated from a real birth or presented as a customer case. The story below is DestinyPixel’s own illustration of astrological themes.", "Alex volunteers to present a team project. The Leo-rising theme gives us a question about taking the first step: does Alex enjoy making an energetic introduction? The Taurus-Sun theme suggests asking what deserves patient effort: perhaps Alex wants the finished work to be reliable rather than rushed. The Aquarius-Moon theme invites a question about space and perspective: after the meeting, might Alex prefer thinking alone before discussing feelings?", "Read those as possibilities in one scene. A confident presentation does not mean wanting company all evening; wanting quiet does not mean disliking people. A useful experiment would be to arrange a review time in advance: “I want to get this right. Give me tonight to think, and let’s compare notes tomorrow.” If Alex instead prefers immediate discussion, keep that real observation rather than forcing the story to fit."],
        },
        {
          id: "add-houses", title: "3. Add the house: where does the theme show up?",
          paragraphs: ["A sign adds a style to a planet’s theme; a house adds a life context. DestinyPixel uses Whole Sign houses: the entire rising sign is house one, then each following sign is the next house. The exact Ascendant degree remains a separate point inside that first house. This differs from house systems that begin house one at the exact Ascendant degree.", "With Leo rising in our invented example, Taurus is house ten and Aquarius house seven. We can therefore explore Alex’s Sun through work and public contribution, and the Moon through one-to-one relationships. The question becomes more concrete: how can Alex pursue a dependable contribution while asking a collaborator or partner for enough breathing room? This is a reading exercise, not a prediction of an occupation or marriage.", "An empty house means that none of the displayed bodies occupies it, not that the corresponding part of life is absent. When two sites show different house numbers, compare their house systems and inputs first. DestinyPixel displays the Midheaven separately; in Whole Sign houses it need not coincide with the start of house ten."],
          sources: [{ label: "Astrodienst: house systems and chart angles", href: housesSource }, { label: "DestinyPixel: current natal-chart method", href: "/astrology" }],
        },
        {
          id: "read-aspects", title: "4. Read a line by its planets and angle, not its colour alone",
          paragraphs: ["The lines connect particular bodies. Identify the pair before reading the aspect name: a Sun–Moon connection raises a different question from a Venus–Mars connection. The major angles shown here are 0°, 60°, 90°, 120° and 180°. Astrological schools interpret them differently; a red line is not a warning that something bad must happen.", "Our assigned Sun and Moon are 88° apart around the shorter arc: 14° Taurus is longitude 44°, and 16° Aquarius is 316°. Their separation is 272° in one direction, or 88° in the other. That is 2° from a square’s exact 90° angle. This difference is the orb. DestinyPixel includes these major planetary aspects when the orb is at most 6°; it does not add Ascendant or Midheaven aspects to this list.", "For Alex, the square offers a question: can a wish for steady progress coexist with a need to step back and see things differently? The practical response could be a dependable schedule with room for independent thought. The angle does not tell us whether Alex will actually do that. A trine or sextile would also need to be interpreted through its planets and situation; it would not remove the need to communicate."],
          sources: [{ label: "Astrodienst: aspects and orbs", href: aspectsSource }],
        },
        {
          id: "birth-time", title: "5. What if you do not know your birth time?",
          paragraphs: ["Do not guess a time to obtain a more complete-looking wheel. The Ascendant depends on the moment and birthplace, so neither rising sign nor houses can be established from a date alone. The Moon can change signs during a local day; near a Sun-sign boundary, the date alone can also be insufficient. Reading the description that feels most like you does not recover a missing birth time.", "The current standalone natal-chart form requires a date, local time and birthplace. It has no unknown-time mode. Keep the original recorded clock time; do not convert it to UTC yourself. Use the birth-details checklist if a time is approximate, a place is missing, or daylight saving is uncertain. Comparing a documented time range is only a sensitivity check, not a way to prove the correct time.", "The separate compatibility tool does offer an unknown-time option for each person. That date-based comparison omits precise planetary aspects and does not provide an Ascendant or houses. Its approximate possible signs are not a substitute for a timed natal chart. The unknown-time compatibility guide explains that different task."],
          links: [{ text: "birth-details checklist", href: "/journal/prepare-birth-date-time-place" }, { text: "unknown-time compatibility guide", href: "/journal/compatibility-without-birth-time" }],
          sources: [{ label: "DestinyPixel: actual inputs and missing-time handling", href: "/product-facts" }],
        },
        {
          id: "use-your-chart", title: "6. Find the same pieces in your own chart",
          paragraphs: ["Open the free birth chart calculator and enter your recorded information. Until you submit your own details, the wheel is a demonstration, not your chart. This tool uses the tropical zodiac, so a sidereal chart from another system may show different signs even with matching birth data.", "The calculation produces positions, houses and angles before any AI reading. You can explore these yourself. On desktop, hovering previews a planet or aspect; clicking keeps the selection. On a phone, tap to select, then read the highlighted explanation. Use the planet list when symbols are crowded."],
          steps: ["Read the Sun, Moon and rising summary beneath the wheel; note the sign and degree for each.", "Select Sun and Moon in the planet list to see their house positions. Open Houses for the corresponding life themes.", "Open Aspects and select one Sun or Moon connection actually present. Check the pair and orb instead of assuming that two sign names guarantee an aspect.", "Write one sentence joining the themes, then add a real example and a counterexample from your experience."],
          links: [{ text: "free birth chart calculator", href: "/astrology" }],
          sources: [{ label: "Astronomy Engine: coordinate and time calculations", href: "https://github.com/cosinekitty/astronomy/blob/master/source/js/README.md" }],
        },
        {
          id: "ai-and-next-step", title: "7. When is the detailed AI reading useful?",
          paragraphs: ["Use it when you want help combining the chart’s many entries into readable chapters. The optional reading covers the core three, other planets, all twelve houses and up to twelve of the closest major aspects, followed by broader themes. The full calculated aspect list remains available in the chart. AI works from supplied chart factors; it cannot establish a missing time or turn symbolism into a verified forecast.", "After reading, choose one small question to take into your week: “When I need space, have I said when I will return to the conversation?” If you want to keep the result, sign in or register and save the chart with its generated interpretation. Reopening the saved record does not require generating the same AI text again. Calculation and exploration are free; optional AI usage is subject to the site’s current limits."],
          links: [{ text: "current limits", href: "/product-facts" }],
        },
      ],
      action: { label: "Explore my Sun, Moon and rising signs", href: "/astrology" },
    },
    zh: {
      title: "太阳、月亮、上升星座怎么看？用一个例子读懂星盘三要素",
      description: "为什么你不像自己的太阳星座？从一个虚构例子理解太阳、月亮和上升，再看宫位、相位与出生时间限制，动手读自己的免费星盘。",
      topic: "出生星盘入门",
      introduction: "知道自己是什么星座，却总觉得性格描述对不上？完整星盘提供的并不只是另外两个标签，而是观察同一件事的几个问题：你想做成什么，怎样才会安心，进入陌生场合时通常怎么开始。先分清这几件事，再把它们放进一个具体场景，星盘才不会只剩一串术语。",
      takeaway: "在现代占星解释中，太阳关注自我与方向，月亮关注情绪需求与习惯反应，上升关注面对世界的起手方式。先把三者一起读，再加上宫位和实际相位角度。这是一种象征性自我观察，不是经过验证的人格测验。",
      sections: [
        {
          id: "three-questions", title: "1. 太阳、月亮、上升，到底哪个才是我？",
          paragraphs: ["不必选一个获胜者。它们是占星语言里的不同部分，不是三个互相争夺主导权的人。太阳和月亮是天体；上升点是出生时东方地平线与黄道相交的位置，上升星座就是这个点所在的星座。上升不是另一颗行星。", "先拿下面的问题回想一件最近发生的事，再去读长篇解释。除了觉得贴切的部分，也记一个不符合的例子。读到熟悉的句子，可以成为观察的起点，但不能因此证明星盘解释了你的性格。"],
          table: { headings: ["星盘要素", "可以问自己的问题"], rows: [
            ["太阳：自我与方向", "我想完成、表达或为之自豪的是什么？"],
            ["月亮：需求与习惯反应", "忙了一天，什么能让我安定下来？我还没细想就会做出什么反应？"],
            ["上升：进入情境的方式", "面对陌生的人、任务或环境，我通常怎样开始？"],
          ] },
          sources: [{ label: "Astrodienst：太阳的占星象征", href: sunSource }, { label: "Astrodienst：月亮的占星象征", href: moonSource }, { label: "Astrodienst：上升点的定义", href: risingSource }],
        },
        {
          id: "worked-example", title: "2. 虚构例子：目标求稳，需要空间，出场却很大方",
          paragraphs: ["假设小安的太阳在金牛座14°，月亮在水瓶座16°，上升在狮子座8°。这些位置是为了演示阅读而设定的，不是从真实生日算出的星盘，也不是用户案例。下面的情境是本站根据占星主题创作的例子。", "小安主动提出替团队讲方案。用上升狮子的主题，可以问：他是不是喜欢先热情地把场子打开？用太阳金牛的主题，可以问：他最想认真打磨的是什么，是否希望成果扎实、经得住使用？用月亮水瓶的主题，再问：会议结束后，他会不会希望先独处、理清想法，再来聊感受？", "把三句话放进同一个场景，就不必解释成“外向还是内向”的二选一。汇报时自信，不等于晚上还想一直社交；想安静一会，也不等于不喜欢同伴。可以尝试约定一个复盘时间：“我想把这件事做好，今晚让我想一想，明天再一起对一下。”如果小安实际更喜欢立刻讨论，就保留这个真实观察，不必为了符合设定而硬套。"],
        },
        {
          id: "add-houses", title: "3. 再看第几宫：这个主题出现在哪里？",
          paragraphs: ["星座给天体主题添一种表达风格，宫位则给它一个生活场景。本站使用整宫制：上升所在的整个星座是第一宫，接下来的星座依次成为下一宫。上升点的精确度数仍单独保留在第一宫内。这与把上升精确度数作为第一宫起点的宫制不同。", "在这个上升狮子的虚构例子里，金牛是第十宫，水瓶是第七宫。于是可以把太阳主题放到工作与公共贡献里，把月亮主题放到一对一关系中，问题也就更具体：小安怎样在认真做好事情的同时，向合作伙伴或伴侣说明自己需要一点思考空间？这是读盘练习，不能由此推断职业或婚姻结果。", "空宫只是没有所显示的天体落入，并不代表相应的生活领域不存在。两个网站显示的宫位不同，先核对宫制和输入资料。本站天顶单独显示；在整宫制里，天顶不一定落在第十宫起点。"],
          sources: [{ label: "Astrodienst：宫制与星盘角点", href: housesSource }, { label: "DestinyPixel：当前出生星盘方法", href: "/astrology?locale=zh" }],
        },
        {
          id: "read-aspects", title: "4. 连线先认星体和角度，别只看红蓝颜色",
          paragraphs: ["一条相位线连接的是具体星体。先认清两端，再读相位名称：太阳与月亮的联系，和金星与火星的联系，问的不是同一件事。本站显示的主要角度是0°、60°、90°、120°和180°。不同占星流派的解释会有差异，一条红线不代表一定要发生坏事。", "例子中的太阳与月亮沿较短圆弧相距88°：金牛14°对应黄经44°，水瓶16°对应316°。往一个方向相差272°，换到短弧就是88°，距离刑相的标准90°还差2°。这个差值叫容许度。本站把容许度不超过6°的主要星体相位列出，但这张相位表不包含上升点或天顶相位。", "小安可以借这个刑相问自己：我想稳定推进事情，同时也需要退一步换角度思考，这两种需要怎样协调？实际安排可以是固定进度，加一段独立思考的时间。角度本身无法说明他会不会这样做。拱相、六合相也要结合具体星体与情境来读，不意味着可以省掉沟通。"],
          sources: [{ label: "Astrodienst：相位与容许度", href: aspectsSource }],
        },
        {
          id: "birth-time", title: "5. 不知道出生时间，哪些不能确定？",
          paragraphs: ["不要为了得到一张完整的圆盘而猜时间。上升点依赖出生时刻和地点，只有日期不能确定上升与宫位。月亮可能在当地一天之内换星座；太阳接近星座边界时，日期也可能不足以判断。选择一段“最像我”的描述，不能找回丢失的出生时刻。", "当前独立星盘表单需要日期、当地时间和出生地，还没有未知时辰模式。输入原始记录中的钟表时间，不必自己先换成UTC。时间只是大概、地点没找到，或不确定夏令时，可以先看出生资料核对指南。比较有依据的时间区间，只是检查结果对时间有多敏感，不能证明哪个时刻才是真实的。", "单独的情感匹配工具支持每人分别选择未知时辰。它的日期版排除精确行星相位，也不提供上升和宫位；显示的近似可能星座不能替代有出生时间的本命盘。未知时辰合盘指南说明了这个不同用途。"],
          links: [{ text: "出生资料核对指南", href: "/journal/prepare-birth-date-time-place?locale=zh" }, { text: "未知时辰合盘指南", href: "/journal/compatibility-without-birth-time?locale=zh" }],
          sources: [{ label: "DestinyPixel：实际输入与未知时辰处理", href: "/product-facts?locale=zh" }],
        },
        {
          id: "use-your-chart", title: "6. 在自己的星盘里，按这个顺序找",
          paragraphs: ["打开免费星盘查询，填入有记录依据的资料。提交自己的资料之前，页面圆盘只是演示星盘，不是你的星盘。本站采用热带黄道；另一套系统若采用恒星黄道，即使出生资料一致，显示的星座也可能不同。", "位置、宫位、角度先由计算得到，不需要等AI解读才能看。电脑上把鼠标移到星体或相位会预览高亮，点击可以保持选中；手机直接轻点，再阅读相应说明。符号挤在一起时，可以从下面的星体列表选择。"],
          steps: ["先读圆盘下的太阳、月亮、上升摘要，分别记下星座与度数。", "在星体列表选择太阳和月亮，查看所在宫位；打开宫位栏目，找到对应的生活主题。", "打开相位栏目，选择一条确实存在的太阳或月亮连线，核对两端和容许度，不凭星座名称猜相位。", "把几个主题连成一句话，再补上一个符合和一个不符合的真实经历。"],
          links: [{ text: "免费星盘查询", href: "/astrology?locale=zh" }],
          sources: [{ label: "Astronomy Engine：坐标与时间计算说明", href: "https://github.com/cosinekitty/astronomy/blob/master/source/js/README.md" }],
        },
        {
          id: "ai-and-next-step", title: "7. 什么时候需要详细AI解读？",
          paragraphs: ["想把多个位置串成可读的章节时，可以使用可选详解。它包括太阳、月亮、上升，其他星体，十二宫，以及至多十二组容许度最小的主要相位，再综合生活主题。计算得到的完整相位列表仍可在星盘中查看。AI根据已有星盘要素解释，不能确定缺失时间，也不能把象征文字变成已验证的预言。", "读完挑一个这周能用的小问题，例如：“我需要空间时，有没有告诉对方什么时候回来继续聊？”想保留结果，可以注册或登录，把星盘和已经生成的解读一起保存。再打开记录不必重新生成同一份AI文字。计算与浏览免费，可选AI使用受本站当前额度限制。"],
          links: [{ text: "当前额度", href: "/product-facts?locale=zh" }],
        },
      ],
      action: { label: "查看我的太阳、月亮与上升", href: "/astrology?locale=zh" },
    },
  },
};

export const sunMoonRisingRussian: JournalTranslation = {
  title: "Солнце, Луна и асцендент: как читать их вместе в натальной карте",
  description: "Что означают Солнце, Луна и асцендент? Разберите один вымышленный пример, добавьте дома и аспекты, проверьте время рождения и изучите свою карту.",
  topic: "Чтение натальной карты",
  introduction: "Вы знаете свой солнечный знак, но описание не очень на вас похоже? Натальная карта предлагает больше, чем ещё два ярлыка. Она позволяет задать разные вопросы об одной ситуации: что вы хотите создать, что помогает успокоиться и как вы начинаете общение в незнакомой обстановке. Сначала разделите эти вопросы, а затем соедините ответы.",
  takeaway: "В современной астрологической интерпретации Солнце связано с самоощущением и направлением, Луна — с эмоциональными потребностями и привычными реакциями, асцендент — с подходом к миру. Сначала читайте их вместе, затем добавляйте дома и реальные углы аспектов. Это символическое упражнение, а не проверенный тест личности.",
  sections: [
    {
      id: "three-questions", title: "1. Что точнее описывает меня: Солнце, Луна или асцендент?",
      paragraphs: ["Выбирать победителя не нужно. Это разные части астрологического языка, а не три человека, спорящих внутри вас. Солнце и Луна — небесные тела; асцендент — вычисляемая точка пересечения восточного горизонта с зодиаком. Восходящий знак — знак, в котором находится эта точка. Асцендент не является планетой.", "Прежде чем читать длинный разбор, ответьте на вопросы ниже на примере недавней ситуации. Запишите и то, что не соответствует предложенной теме. Узнавание себя в тексте может начать размышление, но не доказывает, что карта объясняет вашу личность."],
      table: { headings: ["Элемент карты", "Вопрос для размышления"], rows: [
        ["Солнце · самоощущение и направление", "Что я хочу создать или выразить? Чем хотел бы гордиться?"],
        ["Луна · потребности и привычные реакции", "Что помогает мне успокоиться после трудного дня? Как я реагирую, ещё не успев всё обдумать?"],
        ["Асцендент · подход", "Как я начинаю, когда человек, задача или обстановка мне незнакомы?"],
      ] },
      sources: [{ label: "Astrodienst: символика Солнца", href: sunSource }, { label: "Astrodienst: символика Луны", href: moonSource }, { label: "Astrodienst: определение асцендента", href: risingSource }],
    },
    {
      id: "worked-example", title: "2. Вымышленный пример: надёжный результат, личное пространство и уверенное начало",
      paragraphs: ["Для упражнения представим Алекса с Солнцем в 14° Тельца, Луной в 16° Водолея и асцендентом в 8° Льва. Положения заданы специально для примера, а не рассчитаны по реальному рождению. Это не история клиента. Ситуация ниже придумана редакцией DestinyPixel для объяснения астрологических тем.", "Алекс вызывается представить командный проект. Тема восходящего Льва позволяет спросить: нравится ли ему энергично начинать выступление? Тема Солнца в Тельце подсказывает вопрос о терпеливом труде: возможно, ему важно сделать надёжную работу, а не торопиться. Тема Луны в Водолее предлагает задуматься о пространстве и взгляде со стороны: может быть, после встречи ему нужно побыть одному, прежде чем обсуждать чувства?", "Соедините предположения в одной сцене. Уверенное выступление не означает желания общаться весь вечер, а потребность в тишине не равна неприязни к людям. Можно попробовать заранее договориться о времени обсуждения: «Мне хочется сделать это хорошо. Дай мне вечер подумать, а завтра сравним идеи». Если на деле Алекс предпочитает немедленный разговор, сохраните это наблюдение, не подгоняя его под пример."],
    },
    {
      id: "add-houses", title: "3. Добавьте дом: в какой области проявляется тема?",
      paragraphs: ["Знак добавляет стиль к теме планеты, а дом — жизненную область. DestinyPixel использует полнознаковую систему: весь восходящий знак становится первым домом, следующий знак — вторым и так далее. Точный градус асцендента остаётся отдельной точкой внутри первого дома. Это отличается от систем, где первый дом начинается с точного градуса асцендента.", "В нашем вымышленном примере с восходящим Львом Телец занимает десятый дом, Водолей — седьмой. Поэтому солнечную тему можно исследовать через работу и общественный вклад, а лунную — через отношения один на один. Вопрос становится конкретнее: как Алекс может добиваться надёжного результата и одновременно просить коллегу или партнёра о пространстве для размышления? Это упражнение, а не предсказание профессии или брака.", "Пустой дом означает лишь отсутствие в нём отображаемых небесных тел, а не отсутствие соответствующей области жизни. Если два сайта показывают разные дома, сначала сравните системы домов и исходные данные. Середина неба здесь отмечается отдельно: в полнознаковой системе она не обязана совпадать с началом десятого дома."],
      sources: [{ label: "Astrodienst: системы домов и угловые точки", href: housesSource }, { label: "DestinyPixel: метод построения натальной карты", href: "/astrology?locale=ru" }],
    },
    {
      id: "read-aspects", title: "4. Сначала планеты и угол, потом цвет линии",
      paragraphs: ["Линия соединяет определённые небесные тела. Найдите оба конца прежде, чем читать название аспекта: связь Солнца с Луной задаёт иной вопрос, чем связь Венеры с Марсом. Здесь отображаются основные углы 0°, 60°, 90°, 120° и 180°. Астрологические школы трактуют их по-разному; красная линия не означает неизбежного несчастья.", "В примере Солнце и Луна расположены на расстоянии 88° по короткой дуге: 14° Тельца соответствуют долготе 44°, а 16° Водолея — 316°. В одном направлении между ними 272°, в другом — 88°. До точного квадрата в 90° не хватает 2°. Это отклонение называется орбисом. DestinyPixel включает основные аспекты между небесными телами с орбисом не более 6°; аспекты к асценденту и Середине неба в этот список не входят.", "Квадрат предлагает Алексу вопрос: как совместить желание двигаться устойчиво с потребностью отстраниться и подумать иначе? Практическим ответом может стать понятный график с временем для самостоятельной работы. Угол не устанавливает, поступит ли он так. Трин и секстиль тоже нужно читать через конкретные планеты и обстоятельства: они не отменяют необходимость разговаривать."],
      sources: [{ label: "Astrodienst: аспекты и орбисы", href: aspectsSource }],
    },
    {
      id: "birth-time", title: "5. Что нельзя определить без времени рождения?",
      paragraphs: ["Не угадывайте время ради более полной картинки. Асцендент зависит от момента и места рождения, поэтому одной даты недостаточно для определения восходящего знака и домов. Луна может сменить знак в течение местного дня; у границы солнечных знаков даты тоже иногда недостаточно. Выбор самого похожего описания не восстанавливает неизвестное время.", "Отдельная форма натальной карты сейчас требует дату, местное время и место рождения. Режима без времени у неё нет. Вводите время из исходной записи, не переводя его самостоятельно в UTC. Если оно приблизительное, место не найдено или есть сомнения в летнем времени, прочитайте руководство по подготовке данных. Сравнение границ документированного интервала проверяет чувствительность расчёта, но не доказывает, какое время верно.", "В отдельном инструменте совместимости можно отметить неизвестное время для каждого человека. Режим по датам исключает точные планетарные аспекты и не даёт асцендент или дома. Его приблизительные возможные знаки не заменяют натальную карту с известным временем. Руководство по совместимости без времени объясняет именно эту другую задачу."],
      links: [{ text: "руководство по подготовке данных", href: "/journal/prepare-birth-date-time-place?locale=ru" }, { text: "Руководство по совместимости без времени", href: "/journal/compatibility-without-birth-time?locale=ru" }],
      sources: [{ label: "DestinyPixel: исходные данные и неизвестное время", href: "/product-facts?locale=ru" }],
    },
    {
      id: "use-your-chart", title: "6. Найдите эти элементы в своей карте",
      paragraphs: ["Откройте бесплатный калькулятор натальной карты и введите данные из своей записи. До отправки ваших данных круг показывает демонстрационный пример, а не вашу карту. Здесь используется тропический зодиак; сайт с сидерическим зодиаком может показать другие знаки при тех же исходных данных.", "Положения, дома и углы рассчитываются до обращения к ИИ, и их можно изучить самостоятельно. На компьютере наведение показывает планету или аспект, а нажатие закрепляет выбор. На телефоне коснитесь элемента и прочитайте выделенное пояснение. Если символы расположены тесно, выберите нужное небесное тело из списка."],
      steps: ["Прочитайте сводку Солнца, Луны и асцендента под кругом; запишите знак и градус каждого.", "Выберите Солнце и Луну в списке небесных тел и посмотрите номера домов. В разделе домов найдите соответствующие жизненные темы.", "В разделе аспектов выберите реально присутствующую связь Солнца или Луны. Проверьте пару и орбис: названия двух знаков сами по себе не гарантируют аспект.", "Соедините темы в одно предложение, затем добавьте реальный пример и случай, который ему не соответствует."],
      links: [{ text: "бесплатный калькулятор натальной карты", href: "/astrology?locale=ru" }],
      sources: [{ label: "Astronomy Engine: вычисления координат и времени", href: "https://github.com/cosinekitty/astronomy/blob/master/source/js/README.md" }],
    },
    {
      id: "ai-and-next-step", title: "7. Когда полезен подробный разбор ИИ?",
      paragraphs: ["Он может помочь связать множество элементов в последовательные главы. Дополнительный разбор охватывает основную тройку, остальные небесные тела, все двенадцать домов и до двенадцати основных аспектов с наименьшим орбисом, затем объединяет жизненные темы. Полный рассчитанный список аспектов остаётся в карте. ИИ объясняет переданные элементы; он не устанавливает неизвестное время и не превращает символику в проверенный прогноз.", "После чтения выберите небольшой вопрос на ближайшую неделю: «Когда мне нужно пространство, говорю ли я, когда вернусь к разговору?» Чтобы сохранить результат, войдите или зарегистрируйтесь и сохраните карту вместе с готовым толкованием. Повторное открытие записи не требует заново генерировать тот же текст. Расчёт и просмотр бесплатны; дополнительный разбор ИИ действует в рамках текущих лимитов сайта."],
      links: [{ text: "текущих лимитов", href: "/product-facts?locale=ru" }],
    },
  ],
  action: { label: "Изучить свои Солнце, Луну и асцендент", href: "/astrology?locale=ru" },
};
