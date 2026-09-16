import type { JournalSourceArticle, JournalTranslation } from "./journal";

const durability = "https://4cs.gia.edu/en-us/blog/more-than-mohs-scale-gem-durability/";
const amethyst = "https://www.gia.edu/amethyst-care-cleaning";
const roseQuartz = "https://www.gia.edu/rose-quartz-care-cleaning";
const lapis = "https://www.gia.edu/lapis-lazuli-care-cleaning";

export const crystalCareArticle: JournalSourceArticle = {
  slug: "crystal-bracelet-care",
  publishedAt: "2026-09-16",
  updatedAt: "2026-09-16",
  relatedSlug: "five-element-bracelet-design",
  translations: {
    en: {
      title: "Can your crystal bracelet get wet? A care guide before the first rinse",
      description: "Water, sunlight or an ultrasonic cleaner? Learn what to check for amethyst, rose quartz and lapis beads, then make a care plan for your whole bracelet.",
      topic: "Crystal bracelets in everyday life",
      introduction: "You have picked the colors, arranged the beads and found a bracelet you want to wear often. Then comes a surprisingly practical question: can it stay on while you wash, or sit on a sunny windowsill? A bracelet sold as ‘crystal’ may contain several materials, treatments and a cord with its own requirements. Start with what is actually in your piece, rather than one cleaning rule for everything that looks like a polished stone.",
      takeaway: "A cleaning method suitable for a named gemstone is not automatically suitable for the finished bracelet. Identify the beads and ask the maker about the complete construction before soaking, heating or machine-cleaning it.",
      sections: [
        {
          id: "start-with-the-piece", title: "1. Name the bracelet's ingredients",
          paragraphs: ["Make a small record of the piece: bead names, any stated treatments, the cord or clasp, decorative spacers and the maker's care instructions. Keep the original listing or receipt with that note. If the description only says ‘purple crystal’ or ‘natural energy beads,’ it has not yet answered the material question. Color is a design choice, not a complete identification.", "A useful message to a seller is: ‘What are these beads, are any dyed, coated or filled, and which cleaning method do you recommend for this finished bracelet, including its string and spacers?’ Ask for a reply you can keep. A vague answer is a reason to seek clarification, not to choose the strongest cleaning method and hope for the best."],
        },
        {
          id: "hardness-is-not-everything", title: "2. A hardness number is not a water rating",
          paragraphs: ["GIA separates resistance to scratching, resistance to breaking or chipping, and stability under conditions such as heat, chemicals and light. Mohs hardness addresses the first of those. It does not certify an assembled bracelet for showers, immersion or a cleaning machine.", "Read a care guide as an answer to a specific question about a specific material. ‘How easily can this stone scratch?’ and ‘How should I clean this string of beads?’ are different questions. Before following an online demonstration, check whether it identifies the same material and construction as your own piece."],
          sources: [{ label: "GIA: the three parts of gemstone durability", href: durability }],
        },
        {
          id: "three-materials", title: "3. Three familiar beads, three checks",
          paragraphs: ["GIA's amethyst guide permits warm soapy water, advises against steam cleaning and notes that prolonged intense light can fade some amethyst. Its rose-quartz guide also permits warm soapy water but advises against both ultrasonic and steam cleaning. Neither is an instruction to soak every bracelet containing those stones.", "For lapis lazuli, GIA recommends warm soapy water with a preliminary test in an inconspicuous area because some dyes are unstable. The guide also notes that wax sealers can deteriorate with heat or solvents. For a mixed piece, ask the maker how these material-specific limits apply to the entire bracelet before choosing a method."],
          sources: [{ label: "GIA: amethyst care", href: amethyst }, { label: "GIA: rose quartz care", href: roseQuartz }, { label: "GIA: lapis lazuli care", href: lapis }],
        },
        {
          id: "whole-bracelet", title: "4. Make one plan for the whole piece",
          paragraphs: ["Imagine a bracelet with purple beads, blue accent beads and small metal spacers. Finding a care page for the purple beads answers only part of the question. Write the missing information beside each component instead of silently treating the entire piece as one material. The missing entry might be the blue bead's identity, a coating, or simply the maker's instructions for the string.", "Our practical approach is to ask for one compatible method for the assembled piece. You should not have to invent a different cleaning procedure for every bead while it is still on the same string. If no compatible procedure is confirmed, ask a jeweler or the maker to assess it. More effort or a more expensive machine is not a substitute for identification."],
        },
        {
          id: "care-note", title: "5. Keep a short care note you will actually use",
          paragraphs: ["A care note can travel with the bracelet when you give it as a gift or have it restrung. Separate confirmed instructions from open questions. That makes the note useful to someone who did not see the original sales conversation and prevents a guess from becoming an instruction through repetition."],
          table: { headings: ["Record", "What to put in it"], rows: [["Materials", "Names confirmed by the maker; keep uncertain names marked as uncertain."], ["Construction", "Cord, clasp and spacers, plus any treatment information provided."], ["Care", "The maker's method for the assembled bracelet, with the date of the reply."], ["Follow-up", "Who to contact if a bead, finish or string changes or needs repair."]] },
        },
        {
          id: "personal-ritual", title: "6. Give a personal ritual a material-safe form",
          paragraphs: ["If your bracelet marks an intention or a new chapter, you can pause with it, write down that intention or choose when to wear it. This editorial suggestion does not require sunlight, salt, soaking or heat. A meaningful moment does not need to double as a material treatment.", "The five-element labels in DestinyPixel's atelier organize an original symbolic design system. They do not replace the identity or care requirements of a physical bead. Keep the story that matters to you alongside a clear description of the object; neither needs to be confused with a promise about health or future events."],
        },
        {
          id: "design-with-care", title: "7. Take the care questions into your next design",
          paragraphs: ["Use the bracelet atelier to compare a palette and bead arrangement, then save the design as a starting point for a conversation with a maker. Alongside the visual, list the materials you intend to use and ask about the final size, construction and care. The on-screen preview cannot identify a seller's beads or certify a physical product.", "For a gift, think about the recipient's actual routine: when they would wear it, where they would keep it and whether they want a piece that needs special handling. Those answers can guide the design conversation before you buy anything. A good next step is a clear brief, not a basket full of cleaning products."],
        },
      ],
      action: { label: "Plan a bracelet in the atelier", href: "/atelier" },
    },
    zh: {
      title: "水晶手串能沾水吗？第一次清洗前，先看这几件事",
      description: "紫水晶、粉晶、青金石手串怎么养护？分清宝石与整条手串的清洗条件，核对水洗、日晒、蒸汽与超声波的适用范围。",
      topic: "手串与日常佩戴",
      introduction: "配色选好了，珠子也排出了喜欢的节奏，真正戴上手之后，却会遇到一个很具体的问题：洗手时能不能戴着？能不能放在窗边晒一晒？一条被叫作“水晶手串”的饰品，可能包含不同材质、处理方式和线材。先弄清自己这条手串的组成，比给所有看起来光滑漂亮的珠子套用同一种清洗方法更有用。",
      takeaway: "某种宝石可以采用的清洗方法，不自动适用于整条成品手串。浸泡、加热或使用清洗机器之前，先确认珠子身份，再向制作者核对包括线材和配件在内的养护方式。",
      sections: [
        {
          id: "start-with-the-piece", title: "1. 先写下这条手串由什么组成",
          paragraphs: ["留一份简短记录：珠子的名称、卖家说明的处理方式、线材或扣件、隔珠，以及成品养护要求。原商品说明或收据可以和记录放在一起。如果介绍里只有“紫色水晶”“天然能量珠”，材质问题仍然没有得到完整回答。颜色能帮助你做设计，却不能代替材料鉴定。", "可以直接问卖家：“这些珠子分别是什么材质？有没有染色、覆膜或填充？包括线和隔珠在内，这条成品应该怎么清洁？”把回复保存下来。如果回答很含糊，下一步是继续确认，而不是选择力度最大的清洗方法来试一试。"],
        },
        {
          id: "hardness-is-not-everything", title: "2. 硬度数字，不是防水等级",
          paragraphs: ["GIA 把耐刮擦、耐断裂或崩口，以及面对热、化学物质和光照等条件的稳定性分开讨论。莫氏硬度回答的是其中的耐刮擦问题，并不代表一条成品手串适合淋浴、浸泡或机器清洗。", "读养护说明时，把它当成针对具体材料、具体问题的回答。“这颗石头容不容易被刮伤”和“这一串珠子该怎么洗”是两回事。跟着网上的演示操作前，先确认对方处理的材质和结构，是否真的与你手上的物品相同。"],
          sources: [{ label: "GIA：宝石耐久性的三个方面", href: durability }],
        },
        {
          id: "three-materials", title: "3. 三种常见珠子，分别核对",
          paragraphs: ["GIA 的紫水晶指南允许使用温肥皂水，建议避免蒸汽清洗，并指出长期强光可能使部分紫水晶褪色。粉晶指南也允许温肥皂水，但建议避免超声波和蒸汽清洗。这些说明都不能直接改写成“含有这种珠子的手串，可以随便泡水”。", "青金石的指南建议使用温肥皂水，并先在不显眼处测试，因为某些染色处理并不稳定；其中还指出，蜡质封层可能受到热或溶剂的影响。混搭手串需要向制作者确认这些材质限制如何适用于整件饰品，再决定清洁方法。"],
          sources: [{ label: "GIA：紫水晶养护", href: amethyst }, { label: "GIA：粉晶养护", href: roseQuartz }, { label: "GIA：青金石养护", href: lapis }],
        },
        {
          id: "whole-bracelet", title: "4. 为整条手串确认一套方法",
          paragraphs: ["想象一条由紫色珠子、蓝色点缀珠和金属隔片组成的手串。找到紫色珠子的养护页面，只回答了部分问题。把每个部件尚未确认的信息写下来，不要默默把整条手串视作同一种材料。缺的可能是蓝色珠子的身份、表面处理，也可能只是线材的维护要求。", "我们建议向制作者索取适用于整条成品的清洁方法，而不是在同一根线上的每颗珠子之间临时拼凑操作。如果暂时无法确认一套兼容的方法，请制作者或珠宝专业人员评估。清洗得更用力，或者换一台更贵的机器，都不能代替材质确认。"],
        },
        {
          id: "care-note", title: "5. 留一张真正用得上的养护卡",
          paragraphs: ["送礼或重新穿线时，可以把这份记录一起交给对方。把已经确认的说明和待确认的问题分开，没参与过购买过程的人也能看懂。这样，一句尚未证实的猜测就不容易在反复转述后变成“店家说过的养护要求”。"],
          table: { headings: ["记录项", "建议填写的内容"], rows: [["材质", "制作者确认的珠子名称；尚不确定的名称保留标记。"], ["结构", "线材、扣件、隔珠，以及已提供的处理信息。"], ["养护", "适用于整条手串的方法，并记下答复日期。"], ["后续", "珠子、表面或线材出现变化、需要维修时可以联系谁。"]] },
        },
        {
          id: "personal-ritual", title: "6. 给仪式感一个照顾材质的形式",
          paragraphs: ["如果手串代表一个愿望或人生的新阶段，可以安静地拿着它片刻、写下自己的打算，或者选择一个有意义的佩戴时刻。这是我们的日常使用建议，不需要配合日晒、撒盐、浸泡或加热。有意义的一刻，不一定要同时成为一次材料处理。", "DestinyPixel 手串工坊里的五行标签，用来组织原创的象征设计。它们不代替实物珠子的身份与养护要求。把你在意的故事和物品的真实组成一起保存，也不需要把它们解释成健康或未来事件的保证。"],
        },
        {
          id: "design-with-care", title: "7. 下一次设计时，就把养护问题带进去",
          paragraphs: ["先在工坊比较配色与珠子排列，保存设计，再把它作为和制作者沟通的起点。除了效果图，还可以列出打算采用的材质，核对成品尺寸、结构和养护要求。屏幕上的预览不能鉴定某个卖家的珠子，也不能为实物品质作认证。", "如果是送人的手串，想想对方真实的生活习惯：什么时候戴、放在哪里、是否愿意照顾需要特殊维护的饰品。这些答案可以在购买前就帮助你和制作者调整方案。下一步最值得准备的是一份清楚的制作需求，而不是一篮子清洁用品。"],
        },
      ],
      action: { label: "去工坊设计一条手串", href: "/atelier?locale=zh" },
    },
  },
};

export const crystalCareRussian: JournalTranslation = {
  title: "Можно ли мочить браслет из камней? Что проверить перед чисткой",
  description: "Вода, солнечный свет или ультразвук? Уход за аметистом, розовым кварцем и лазуритом и вопросы мастеру о готовом браслете.",
  topic: "Браслеты в повседневной жизни",
  introduction: "Цвета выбраны, бусины сложились в красивый ритм, и браслет хочется носить часто. Затем возникает практический вопрос: можно ли оставить его на руке во время мытья или положить на солнечный подоконник? Украшение, которое продают как браслет из кристаллов, может сочетать разные материалы, обработки и нить со своими требованиями. Начните с состава своей вещи, а не с универсального правила для всех блестящих бусин.",
  takeaway: "Способ чистки отдельного камня не обязательно подходит готовому браслету. До замачивания, нагрева или машинной чистки уточните материалы и рекомендации мастера для всей конструкции.",
  sections: [
    {
      id: "start-with-the-piece", title: "1. Запишите состав браслета",
      paragraphs: ["Составьте короткую запись: названия бусин, заявленные обработки, нить или застежка, разделители и рекомендации мастера. Сохраните описание товара или чек вместе с ней. Слова «фиолетовый кристалл» или «натуральные энергетические бусины» еще не дают точного ответа о материале. Цвет помогает выбрать дизайн, но не заменяет идентификацию.", "Спросите продавца: «Из чего эти бусины? Есть ли окрашивание, покрытие или заполнение трещин? Как чистить готовый браслет вместе с нитью и разделителями?» Сохраните ответ. Если он расплывчатый, лучше уточнить сведения, чем выбирать самый интенсивный способ чистки наугад."],
    },
    {
      id: "hardness-is-not-everything", title: "2. Твердость не означает водостойкость",
      paragraphs: ["GIA различает стойкость к царапинам, сопротивление сколам и разрушению, а также устойчивость к теплу, химическим веществам и свету. Шкала Мооса относится к первому свойству. Она не подтверждает пригодность готового браслета для душа, погружения в воду или чистящей машины.", "Читайте инструкцию как ответ на определенный вопрос об определенном материале. «Легко ли поцарапать камень?» и «Как очистить эту нить бусин?» — разные вопросы. Прежде чем повторять демонстрацию из интернета, убедитесь, что речь идет о таком же материале и конструкции."],
      sources: [{ label: "GIA: три составляющие долговечности камня", href: durability }],
    },
    {
      id: "three-materials", title: "3. Три знакомых материала, разные проверки",
      paragraphs: ["Для аметиста GIA допускает теплую мыльную воду, не рекомендует пар и предупреждает о возможном выцветании при длительном интенсивном освещении. Для розового кварца также допускается теплая мыльная вода, но не ультразвук и не пар. Это не разрешение замачивать любой браслет с такими бусинами.", "Для лазурита GIA рекомендует теплую мыльную воду с предварительной пробой на незаметном участке из-за возможной нестойкости красителя. Восковые покрытия могут повреждаться от тепла или растворителей. Уточните у мастера, как ограничения отдельных материалов относятся ко всему смешанному браслету."],
      sources: [{ label: "GIA: уход за аметистом", href: amethyst }, { label: "GIA: уход за розовым кварцем", href: roseQuartz }, { label: "GIA: уход за лазуритом", href: lapis }],
    },
    {
      id: "whole-bracelet", title: "4. Один план для всей вещи",
      paragraphs: ["Представьте фиолетовые бусины с синими акцентами и металлическими разделителями. Инструкция для фиолетовых бусин отвечает лишь на часть вопросов. Запишите неизвестное о каждом компоненте, не считая весь браслет единым материалом. Возможно, нужно уточнить синие бусины, покрытие или требования к нити.", "Наш практический подход — запросить совместимый способ для готовой конструкции. Не стоит придумывать отдельную процедуру для каждой бусины, пока все они на одной нити. Если подходящий метод не подтвержден, попросите мастера или ювелира оценить вещь. Более дорогая машина или большие усилия не заменят идентификацию."],
    },
    {
      id: "care-note", title: "5. Короткая памятка, которой удобно пользоваться",
      paragraphs: ["Передавайте памятку вместе с подарком или при замене нити. Отделяйте подтвержденные рекомендации от открытых вопросов. Так ее поймет человек, который не участвовал в покупке, а догадка после нескольких пересказов не станет якобы точной инструкцией продавца."],
      table: { headings: ["Раздел", "Что записать"], rows: [["Материалы", "Подтвержденные названия; неопределенность оставляйте явно обозначенной."], ["Конструкция", "Нить, застежка, разделители и сведения об обработках."], ["Уход", "Рекомендация мастера для всего браслета и дата ответа."], ["Помощь", "Контакт для вопросов об изменениях бусин, покрытия, нити или ремонте."]] },
    },
    {
      id: "personal-ritual", title: "6. Личный ритуал без обработки материала",
      paragraphs: ["Если браслет напоминает о намерении или новом этапе, можно ненадолго остановиться с ним, записать свое намерение или выбрать особый момент для ношения. Этот наш совет не требует солнца, соли, замачивания или нагрева. Значимый момент не обязан быть процедурой обработки вещи.", "Названия пяти элементов в мастерской DestinyPixel организуют авторскую символическую систему дизайна. Они не заменяют сведений о реальных бусинах и их уходе. Сохраните рядом личную историю и ясное описание предмета, не превращая их в обещание здоровья или будущих событий."],
    },
    {
      id: "design-with-care", title: "7. Учтите уход уже в следующем дизайне",
      paragraphs: ["Сравните палитру и порядок бусин в мастерской, сохраните дизайн и используйте его для разговора с мастером. Вместе с изображением составьте список предполагаемых материалов, уточните размер, конструкцию и уход. Экранный макет не определяет состав бусин продавца и не подтверждает качество физического изделия.", "Для подарка подумайте о привычках получателя: когда он будет носить браслет, где хранить и готов ли к специальному уходу. Эти ответы помогут обсудить дизайн еще до покупки. Полезный следующий шаг — понятное техническое задание, а не корзина чистящих средств."],
    },
  ],
  action: { label: "Спланировать браслет в мастерской", href: "/atelier?locale=ru" },
};
