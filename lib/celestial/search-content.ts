import type { ReportLocale } from "@/lib/report-i18n";
import { toTraditional } from "@/lib/journal-locales";

// Public, server-rendered instructions. Keep these separate from private readings.
export const celestialContentUpdatedAt = "2026-09-29";
export type CelestialKind = "astrology" | "tarot";
type SearchContent = {
  title: string; intro: string; stepsTitle: string; steps: string[];
  sections: { title: string; text: string }[];
  faqTitle: string; faqs: { q: string; a: string }[];
  relatedTitle: string; related: { label: string; path: string }[];
};
const en: Record<CelestialKind, SearchContent> = {
  astrology: {
    title: "How to read your natal birth chart",
    intro: "A birth chart, also called a natal chart, maps the sky for a birth time and place. Start with your Sun, Moon and rising sign, then explore the planets, twelve houses and aspect lines. This free calculator uses the tropical zodiac and Whole Sign houses; a detailed AI reading is optional.",
    stepsTitle: "Calculate your chart in three steps",
    steps: [
      "Enter your birth date, the local clock time on your birth record, and your birthplace. Choose a listed city or enter coordinates and its IANA time zone. Do not convert the time to UTC yourself.",
      "Create the chart and check your Sun, Moon and Ascendant. Hover over a planet or aspect to preview it; click to keep the highlight. On a phone, tap instead.",
      "Explore placements and the reading glossary, then request a detailed interpretation if you want one. Sign in or register only when you choose to save the chart and its existing reading.",
    ],
    sections: [
      { title: "Sun, Moon and rising sign: your Big Three", text: "In astrological interpretation, the Sun symbolizes identity and direction; the Moon relates to emotional needs and familiar responses. The rising sign, or Ascendant, is the zodiac sign rising on the eastern horizon at birth and is traditionally read as your way of meeting the world. They describe different themes in the same chart, not three competing personality labels. The Moon is calculated from the birth instant, not simply from your birthday month." },
      { title: "Planets, zodiac signs and twelve houses", text: "A useful reading order is planet → sign → house: the theme, its style and its area of life. Venus, for example, is associated with affection and values; its sign adds a style, and its house gives a context. Whole Sign houses give each zodiac sign one complete house, beginning with the rising sign. An empty house does not mean that part of your life is missing. The Midheaven is shown separately and need not sit in the tenth house." },
      { title: "Aspects: what the lines and angles mean", text: "The chart shows conjunctions (0°), sextiles (60°), squares (90°), trines (120°) and oppositions (180°). Orb is the difference from the exact angle; this calculator uses a maximum 6° for these major aspects. A square is traditionally read as tension to work with, a trine as an easier flow, and an opposition as a polarity to balance. None is a verdict of good or bad luck. Tap a line to identify its planets before reading the interpretation." },
    ],
    faqTitle: "Birth chart calculator questions",
    faqs: [
      { q: "Can I calculate my rising sign without a birth time?", a: "Not reliably. The Ascendant and houses depend on the birth time and place. A guessed noon chart can produce a different rising sign, different houses and sometimes a different Moon sign. This tool requires a time; it does not recover an unknown time. Check a birth record before treating its output as your exact chart." },
      { q: "Is this a free birth chart with a full interpretation?", a: "The interactive chart and placement explanations are free without an account. Optional AI interpretation covers the Sun, Moon and Ascendant, other planets, all twelve houses, up to twelve closest major aspects, and life themes. Free AI usage limits apply. An account is needed only to save and revisit a reading; reopening a saved report does not request a new AI reading." },
      { q: "Is this the same as a BaZi chart or relationship synastry?", a: "No. This page calculates one person's Western natal chart. BaZi uses the Chinese calendar's Four Pillars; our separate compatibility tool compares two people using five-element relationships and selected planetary comparisons. That tool is not a full house-overlay synastry chart. Use the appropriate tool for the question you have." },
    ],
    relatedTitle: "Continue exploring",
    related: [
      { label: "Prepare birth date, time and place", path: "/journal/prepare-birth-date-time-place" },
      { label: "Compare two people: BaZi and planetary compatibility", path: "/compatibility" },
      { label: "Find your BaZi Day Pillar", path: "/discover" },
      { label: "Free online tarot for a specific question", path: "/tarot" },
    ],
  },
  tarot: {
    title: "Free online tarot: choose a spread, then choose your cards",
    intro: "Use a complete 78-card Rider–Waite–Smith deck for a one-card draw, a three-card reading, a relationship spread, a choice between two paths or a Celtic Cross. You shuffle and pick the cards yourself. Read their upright or reversed meanings immediately, or add your question for an optional AI interpretation.",
    stepsTitle: "How to do an online tarot reading",
    steps: [
      "Choose a spread and decide whether to include reversed cards. Start with one card for a focused prompt, or three for the path here, the present situation and a possible next step.",
      "Shuffle, choose an empty position and pick a face-down card. Tap once to extend it, then tap again to place it, or drag it onto the table. You can return or replace cards before finishing.",
      "Reveal cards one at a time. Tap an open card to see its name, orientation and short meaning. For a detailed reading, enter a question title; extra context is optional. Save to your account if you want to revisit the layout and reading.",
    ],
    sections: [
      { title: "Which tarot spread should I choose?", text: "A one-card draw keeps attention on one theme. Three cards connect the path here, your current situation and a possible next step. The five-card relationship spread explores a connection; the five-card two-paths spread helps compare alternatives. The ten-card Celtic Cross provides more positions and context, but more cards do not guarantee a better answer. Use the free table when you want to arrange your own layout." },
      { title: "Upright and reversed tarot card meanings", text: "The 78 cards include 22 Major Arcana and 56 Minor Arcana across Wands, Cups, Swords and Pentacles. Major cards are commonly read as broader themes, while the suits offer everyday situations and responses. A reversed card can suggest a blocked, inward or excessive expression of its theme; it is not automatically a bad omen. Read the card together with its position and your question. The brief meanings here are our editorial interpretations of the card symbols." },
      { title: "Love tarot and questions that leave room to act", text: "Instead of asking “What is my partner secretly thinking?”, try “What can I do to make our next conversation clearer?” For a choice, explain the two options and what matters to you. A useful question names the situation and leaves you a role in it. You can leave the extra context blank; relevant details help the interpretation address your situation more specifically, not predict it more accurately. Avoid names or identifying details you do not want to share." },
    ],
    faqTitle: "Online tarot reading questions",
    faqs: [
      { q: "Is online tarot free without registration?", a: "Yes. Shuffling, selecting, laying out and revealing cards, and reading their short meanings do not require an account. Optional AI interpretation has free usage limits. Register or sign in if you choose to save a layout and its reading. An existing saved reading can be reopened without generating it again." },
      { q: "Does AI choose my cards or change the result?", a: "No. The browser shuffles the deck using cryptographic randomness; the cards do not change to fit your question. You select the cards and decide when to reveal them. AI receives the revealed cards, their positions and orientations, plus your question and optional context only when you request a reading." },
      { q: "Can tarot give a definite yes or no or predict a reunion?", a: "This tool does not calculate a reliable probability, reveal another person's thoughts or guarantee a future event. A spread can offer symbolic prompts to explore your concerns and choices. For a relationship question, read the result alongside actual conversations and observable behaviour rather than as a verdict about the other person." },
    ],
    relatedTitle: "Choose another way to explore",
    related: [
      { label: "Free natal chart: Sun, Moon and rising sign", path: "/astrology" },
      { label: "BaZi and planetary relationship compatibility", path: "/compatibility" },
      { label: "Chinese fortune sticks and number lookup", path: "/sticks" },
      { label: "How to ask a clear oracle question", path: "/journal/how-to-ask-fortune-sticks" },
    ],
  },
};
const zh: Record<CelestialKind, SearchContent> = {
  astrology: {
    title: "星盘怎么看：从太阳、月亮、上升开始",
    intro: "出生星盘，也叫本命盘，是按照出生时间和地点绘制的天体位置图。先看太阳、月亮与上升星座，再看行星落在哪个星座、哪一宫，以及彼此的相位。本工具免费计算热带黄道、整宫制星盘，详细 AI 解读可以按需开启。",
    stepsTitle: "三步查询自己的星盘",
    steps: ["填写公历出生日期、出生记录上的当地钟表时间与出生地点。可以选择城市，也可输入经纬度和 IANA 时区；不用自己换算成 UTC。", "生成星盘后先核对太阳、月亮、上升。电脑上移过星体或相位线预览，点击保持高亮；手机直接点选。", "查看行星位置和入门说明，需要时再生成详细解读。想保存星盘和已经生成的解读时，再注册或登录即可。"],
    sections: [
      { title: "太阳星座、月亮星座和上升分别代表什么？", text: "在占星的象征解读中，太阳通常对应自我认同与方向，月亮对应情绪需要与熟悉的反应方式。上升是出生时东方地平线升起的黄道星座，常用来讨论一个人面对外界的方式。三者是同一张盘的不同侧面，不是三个互相争夺的性格标签。月亮的位置按出生时刻计算，并不能仅凭出生月份确定。" },
      { title: "行星落座、十二宫和空宫怎么读？", text: "可以按“行星 → 星座 → 宫位”的顺序读：什么主题、怎样表达、在哪个生活领域展开。例如金星常关联感情与价值，落座补充表达方式，宫位提供场景。整宫制把每个星座完整地分给一个宫，上升星座所在处为第一宫。空宫不代表缺少那方面的人生；天顶单独标注，不一定落在第十宫。" },
      { title: "相位夹角、容许度和连线代表什么？", text: "本盘展示合相 0°、六合 60°、刑相 90°、拱相 120° 与对冲 180°。容许度是实际夹角离标准角度的差值，这里统一采用最大 6°。传统解读常把刑相理解为需要磨合的张力，拱相理解为较顺畅的联系，对冲理解为两端的平衡；它们都不直接等于好运或坏运。先点选连线看清连接了哪两颗星，再结合宫位阅读。" },
    ],
    faqTitle: "星盘查询常见问题",
    faqs: [
      { q: "不知道出生时间，能查上升星座吗？", a: "不能可靠确定。上升和宫位依赖出生时间、地点；随便填中午可能得到不同的上升与宫位，有时连月亮星座也会变化。本工具要求填写时间，不提供未知时辰反推。最好先查出生记录，不要把猜测时间生成的盘当成准确本命盘。" },
      { q: "免费星盘解读包括哪些内容？需要注册吗？", a: "星盘计算、交互图和基础位置说明无需注册。可选的 AI 详解包括太阳、月亮、上升、其他行星、十二宫、最多十二组最接近标准角度的主要相位，以及生活主题综合解读；免费 AI 有使用额度限制。仅在保存时需要注册或登录，重新打开已保存的解读不会再调用 AI。" },
      { q: "星盘、八字和双人合盘有什么区别？", a: "这里计算一个人的西方出生星盘。八字用中国历法的年、月、日、时四柱；本站另有情感匹配工具，比较两人的五行关系与部分行星关系。情感匹配不是包含宫位叠加的完整西方双人合盘，请按想了解的问题选择工具。" },
    ],
    relatedTitle: "继续探索",
    related: [{ label: "出生日期、时间和地点怎样准备", path: "/journal/prepare-birth-date-time-place" }, { label: "双人八字五行与行星情感匹配", path: "/compatibility" }, { label: "免费日柱查询与六十动物卡", path: "/discover" }, { label: "带着一个问题，体验在线塔罗", path: "/tarot" }],
  },
  tarot: {
    title: "在线塔罗怎么玩：先选牌阵，再亲手抽牌",
    intro: "完整 78 张韦特塔罗牌，支持单张牌、三张牌、感情牌阵、二选一牌阵和凯尔特十字。自己洗牌、挑牌、逐张翻开，即可查看正位与逆位的基础牌义；想进一步结合自己的问题，再开启可选的 AI 详解。",
    stepsTitle: "三步完成一次塔罗抽牌",
    steps: ["选择牌阵，决定是否加入逆位。只想聚焦一个主题可以抽单张；想梳理来路、当下与可能的下一步，可以选三张牌。", "洗牌后选中空牌位，再从背面牌堆挑牌。点一下探出一部分，再点一下放上牌桌，也可以直接拖过去；需要时可以换牌或放回。", "逐张翻开，点已翻开的牌查看名称、正逆位与简单解释。需要详解时填写问题标题，详细情况可选填。想保留牌面和解读，可保存到账号。"],
    sections: [
      { title: "单张、三张、感情和凯尔特十字，怎么选？", text: "单张牌适合一个明确主题。三张牌把走到这里的来路、当下状态、可能的下一步放在一起。五张感情牌阵用于梳理一段关系；五张二选一牌阵用于比较两个方向。十张凯尔特十字提供更多牌位和背景，但牌多不等于答案更准确。想自己定义位置，也可以进入自由牌桌摆放。" },
      { title: "正位、逆位和大小阿卡纳是什么意思？", text: "78 张牌分为 22 张大阿卡纳和 56 张小阿卡纳，小阿卡纳包含权杖、圣杯、宝剑、星币四组。大牌常讨论较大的主题，小牌更贴近日常情境与反应。逆位可以理解为受阻、内化或过度表达，并不自动代表坏事。把牌义与所在牌位、提问一起读，才不会只盯住单张牌的名字。本站基础牌义是围绕牌面象征编写的简明解读。" },
      { title: "感情塔罗怎么问，才更容易得到具体解读？", text: "与其问“对方心里到底在想什么”，不如问“我能怎样让下一次沟通更清楚”。面对选择，可以写明两个选项和你最在意的事情。一个好问题说明了处境，也给自己留下行动空间。详细情况可以不写；相关背景越清楚，解读越能贴合问题，但不代表预测更准确。请避免填写不想分享的姓名或身份资料。" },
    ],
    faqTitle: "在线塔罗常见问题",
    faqs: [
      { q: "塔罗抽牌免费吗？不登录能玩吗？", a: "可以。洗牌、选牌、排阵、翻牌与简明牌义都无需账号。可选 AI 解读有免费使用额度限制。只有想保存牌局与解读时才需要注册或登录，打开已有记录不用重新生成解读。" },
      { q: "AI 会帮我选牌，或者根据问题换牌吗？", a: "不会。浏览器用加密随机数洗牌，不根据问题改变牌面。选哪张、何时翻开由你操作。只有点详解后，已翻开的牌、位置、正逆位、问题及可选背景才会发送给 AI。" },
      { q: "塔罗能直接判断是或否、会不会复合吗？", a: "本工具不计算可靠的事件概率，不能读取另一人的想法，也不能保证未来结果。牌阵可以作为探索担忧和选择的象征性提示；感情问题仍需要结合实际交流与可观察的行为，不把牌面当成对另一人的定论。" },
    ],
    relatedTitle: "换一个角度，继续探索",
    related: [{ label: "免费星盘：太阳、月亮与上升查询", path: "/astrology" }, { label: "八字五行与行星情感匹配", path: "/compatibility" }, { label: "在线求签与签号查询", path: "/sticks" }, { label: "如何把求问写成一个清楚的问题", path: "/journal/how-to-ask-fortune-sticks" }],
  },
};
const ru: Record<CelestialKind, SearchContent> = {
  astrology: {
    title: "Как читать свою натальную карту",
    intro: "Натальная карта показывает положение небесных тел для времени и места рождения. Начните с Солнца, Луны и асцендента, затем изучите планеты, двенадцать домов и аспекты. Бесплатный калькулятор использует тропический зодиак и полнознаковые дома. Подробное толкование ИИ можно запросить отдельно.",
    stepsTitle: "Три шага к карте рождения",
    steps: ["Укажите дату, местное время из записи о рождении и место. Выберите город или введите координаты и часовой пояс IANA. Самостоятельно переводить время в UTC не нужно.", "Постройте карту и проверьте Солнце, Луну и асцендент. Наведите курсор на планету или аспект для предварительного просмотра, нажмите для закрепления. На телефоне достаточно касания.", "Изучите положения и пояснения к терминам, затем при желании запросите подробное толкование. Вход или регистрация нужны только для сохранения карты и уже полученного текста."],
    sections: [
      { title: "Солнце, Луна и асцендент: три разных темы", text: "В астрологической символике Солнце связывают с самоощущением и направлением, Луну — с эмоциональными потребностями и привычными реакциями. Асцендент — знак зодиака, восходящий на восточном горизонте в момент рождения; его традиционно связывают со способом взаимодействия с миром. Это разные стороны одной карты, а не три взаимоисключающих типа личности. Знак Луны рассчитывается для момента рождения, а не только по месяцу." },
      { title: "Планеты, знаки и двенадцать домов", text: "Удобный порядок чтения: планета → знак → дом, то есть тема, способ её выражения и сфера жизни. Например, Венеру связывают с привязанностью и ценностями; знак добавляет стиль, а дом — контекст. В полнознаковой системе каждый знак занимает целый дом, начиная со знака асцендента. Пустой дом не означает отсутствия соответствующей сферы жизни. Середина неба отмечается отдельно и не обязательно находится в десятом доме." },
      { title: "Аспекты: линии, углы и орбис", text: "На карте отмечены соединения (0°), секстили (60°), квадраты (90°), трины (120°) и оппозиции (180°). Орбис — отклонение от точного угла; для этих аспектов калькулятор использует предел 6°. Квадрат традиционно читают как напряжение, трин — как более свободную связь, оппозицию — как два полюса, требующих равновесия. Это не приговор об удаче или неудаче. Нажмите на линию, чтобы определить планеты, а затем прочитайте толкование." },
    ],
    faqTitle: "Вопросы о расчёте натальной карты",
    faqs: [
      { q: "Можно ли узнать асцендент без времени рождения?", a: "Надёжно — нет. Асцендент и дома зависят от времени и места. Произвольно выбранный полдень может изменить асцендент, дома, а иногда и знак Луны. Инструмент требует указать время и не восстанавливает неизвестное. Проверьте запись о рождении, прежде чем считать карту точной." },
      { q: "Бесплатна ли карта с подробной расшифровкой?", a: "Интерактивная карта и пояснения положений бесплатны и доступны без регистрации. По желанию ИИ разбирает Солнце, Луну, асцендент, другие планеты, двенадцать домов, до двенадцати ближайших к точному углу основных аспектов и жизненные темы. Для ИИ действуют лимиты бесплатного использования. Аккаунт нужен только для сохранения; открытие сохранённого текста не запускает ИИ заново." },
      { q: "Это карта Ба-цзы или синастрия двух людей?", a: "Нет, здесь рассчитывается западная натальная карта одного человека. Ба-цзы использует четыре столпа китайского календаря. Отдельный инструмент совместимости сравнивает отношения пяти элементов и некоторые планетарные связи двух людей; это не полная синастрия с наложением домов. Выберите инструмент под свой вопрос." },
    ],
    relatedTitle: "Продолжить исследование",
    related: [{ label: "Как подготовить дату, время и место рождения", path: "/journal/prepare-birth-date-time-place" }, { label: "Совместимость: Ба-цзы и планетарные связи", path: "/compatibility" }, { label: "Узнать свой столп дня Ба-цзы", path: "/discover" }, { label: "Бесплатное Таро онлайн для конкретного вопроса", path: "/tarot" }],
  },
  tarot: {
    title: "Таро онлайн: выберите расклад и вытяните карты сами",
    intro: "Полная колода Райдера — Уэйта — Смит из 78 карт: одна карта, три карты, отношения, выбор между двумя путями или Кельтский крест. Вы сами тасуете и выбираете карты. Сразу читайте значения прямого и перевёрнутого положения или добавьте вопрос для необязательного толкования ИИ.",
    stepsTitle: "Как сделать расклад Таро онлайн",
    steps: ["Выберите расклад и решите, нужны ли перевёрнутые карты. Одна карта помогает сосредоточиться на теме; три — рассмотреть путь к ситуации, настоящее и возможный следующий шаг.", "Перемешайте колоду, выберите пустую позицию и карту рубашкой вверх. Первое нажатие немного выдвигает её, второе кладёт на стол. Можно перетащить карту, вернуть или заменить её.", "Открывайте карты по одной. Нажмите на открытую карту, чтобы увидеть название, ориентацию и краткое значение. Для подробного толкования введите вопрос; дополнительный контекст необязателен. Расклад и текст можно сохранить в аккаунте."],
    sections: [
      { title: "Какой расклад выбрать?", text: "Одна карта удерживает внимание на одной теме. Три карты связывают путь к ситуации, настоящее и возможный следующий шаг. Пять карт на отношения помогают рассмотреть связь, а пять карт на два пути — сравнить варианты. Десять позиций Кельтского креста добавляют контекст, но больше карт не означает более верный ответ. На свободном столе можно создать собственную схему." },
      { title: "Прямые и перевёрнутые карты, старшие и младшие арканы", text: "В колоде 22 старших и 56 младших арканов; младшие делятся на Жезлы, Кубки, Мечи и Пентакли. Старшие арканы обычно читают как крупные темы, масти — как повседневные ситуации и реакции. Перевёрнутая карта может указывать на сдержанное, внутреннее или чрезмерное выражение темы, а не обязательно на плохое предзнаменование. Учитывайте позицию карты и вопрос. Краткие значения здесь — наши редакционные интерпретации символов." },
      { title: "Таро на любовь: вопрос, с которым можно действовать", text: "Вместо «О чём мой партнёр тайно думает?» попробуйте «Что я могу сделать, чтобы следующий разговор был яснее?». Для выбора опишите оба варианта и то, что для вас важно. Хороший вопрос обозначает ситуацию и оставляет вам роль в ней. Контекст можно не заполнять; подробности делают толкование более конкретным, но не повышают точность предсказания. Не указывайте имена и личные сведения, которыми не хотите делиться." },
    ],
    faqTitle: "Вопросы о Таро онлайн",
    faqs: [
      { q: "Можно ли бесплатно сделать расклад без регистрации?", a: "Да. Тасование, выбор, размещение, открытие карт и краткие значения доступны без аккаунта. Для необязательного толкования ИИ действуют бесплатные лимиты. Вход нужен, если вы хотите сохранить расклад и текст. Сохранённое толкование можно открыть без повторной генерации." },
      { q: "ИИ выбирает карты или подстраивает их под вопрос?", a: "Нет. Браузер перемешивает колоду с помощью криптографической случайности; карты не меняются под вопрос. Вы выбираете и открываете их сами. Только по запросу ИИ получает открытые карты, позиции, ориентации, вопрос и необязательный контекст." },
      { q: "Может ли расклад точно ответить «да/нет» или предсказать примирение?", a: "Инструмент не рассчитывает надёжную вероятность, не читает чужие мысли и не гарантирует будущие события. Расклад предлагает символические темы для размышления о заботах и выборе. В отношениях сопоставляйте его с реальными разговорами и наблюдаемым поведением, а не считайте вердиктом о другом человеке." },
    ],
    relatedTitle: "Попробовать другой взгляд",
    related: [{ label: "Натальная карта: Солнце, Луна и асцендент", path: "/astrology" }, { label: "Совместимость по Ба-цзы и планетам", path: "/compatibility" }, { label: "Китайский жребий и поиск по номеру", path: "/sticks" }, { label: "Как задать оракулу ясный вопрос", path: "/journal/how-to-ask-fortune-sticks" }],
  },
};

function traditional(value: SearchContent): SearchContent {
  // These objects contain only UI copy and ASCII paths; preserve paths verbatim.
  return JSON.parse(toTraditional(JSON.stringify(value))) as SearchContent;
}
const zhTW = { astrology: traditional(zh.astrology), tarot: traditional(zh.tarot) };
export function celestialSearchContent(kind: CelestialKind, locale: ReportLocale): SearchContent {
  return ({ en, zh, "zh-TW": zhTW, ru })[locale][kind];
}
