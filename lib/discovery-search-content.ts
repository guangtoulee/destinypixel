import type { ContentLocale } from "./report-i18n";
import type { ProductSearchCopy } from "./product-search-content";

/** Public, date-only calculator guidance; no visitor birth details in this copy. */
export const discoverySearchContent: Record<ContentLocale, ProductSearchCopy> = {
  en: {
    eyebrow: "BAZI DAY PILLAR · DAY MASTER · FIVE ELEMENTS",
    title: "What does a Day Pillar calculator tell you?",
    intro: [
      "A BaZi Day Pillar is the Heavenly Stem and Earthly Branch assigned to a calendar day. Enter a Gregorian birth date above to see that pair, its Day Master element and day animal, together with one of DestinyPixel’s 60 original character cards. The free calculation runs in your browser without an account.",
      "Your familiar Chinese zodiac animal usually comes from your birth year. This tool looks at the day instead, so a person born in a Dragon year can have a Rabbit day. Neither animal replaces the other: they describe different parts of the traditional calendar chart.",
    ],
    sections: [
      { title: "Day Pillar or Day Master?", body: "The Day Pillar contains two characters. The Day Master is only the first: the day’s Heavenly Stem, associated with one of five elements and Yin or Yang. For example, 丙寅 (Bing Yin) has 丙, Yang Fire, as its Day Master and 寅, Tiger, as its day branch. A day element is not a measurement of your whole chart’s balance." },
      { title: "Read the result in three layers", body: "Start with the calendar result, then explore the interpretation. The animal illustration is a memorable introduction, not an additional astronomical calculation.", items: [
        { title: "The calculated pair", body: "See your Day Pillar, Day Master and day animal directly below the card name." },
        { title: "The character portrait", body: "Read personality, relationship and work themes. Notice a specific example that fits your life, and one that does not." },
        { title: "The wider picture", body: "Known birth time and place let the full birth map add the other pillars and time correction. They can matter near a day boundary." },
      ], ordered: true },
      { title: "Try an example before your own birthday", body: "Enter 1 January 1990: this tool’s calendar-date calculation returns 丙寅, Bing Yin — a Yang Fire Day Master with the Tiger day branch. The example shows how to read the fields; it is not a prediction about everyone born on that date." },
    ],
    note: "Method: Gregorian date → lunar-javascript day stem and branch at a noon reference point. Noon anchors the calendar date; it is not an assumed birth time. This preview uses a civil-midnight day boundary and no birthplace or solar-time adjustment. Card names and interpretations are original editorial content, separate from the calendar calculation.",
    sources: [{ title: "Hong Kong Observatory: Heavenly Stems and Earthly Branches", href: "https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm" }],
    faqTitle: "Before using your Day Pillar result",
    faqs: [
      { question: "Can I find my Day Master without a birth time?", answer: "You can get a calendar-date preview here. If you were born close to midnight, check the recorded local time, birthplace and day-boundary convention before treating that preview as a calibrated BaZi result. We do not invent an hour pillar." },
      { question: "Why can two BaZi calculators give different Day Pillars?", answer: "First check Gregorian versus lunar input, the date and the city. Calculators may differ in civil time versus solar time and in whether the day changes at 23:00 or midnight. This date-only tool uses midnight; a full chart can use additional corrections. Compare the methods before deciding one result is wrong." },
      { question: "Is my Day Master the element I am missing?", answer: "No. It is the element associated with the day’s stem. It does not by itself identify a missing or favorable element, Day Master strength, or a suitable gemstone. Those are different questions requiring additional chart context and interpretation." },
    ],
    relatedTitle: "Take the next step",
    related: [
      { title: "Compare two birth charts", description: "Use known times and cities for our BaZi and astrology relationship comparison.", href: "/compatibility" },
      { title: "Ask a question with fortune sticks", description: "A different experience when you have a question rather than birth details.", href: "/sticks" },
    ],
  },
  zh: {
    eyebrow: "日柱查询 · 日主五行 · 六十甲子",
    title: "日柱查询能看什么？先分清日柱、日主和生肖",
    intro: [
      "日柱是公历某一天对应的天干与地支组合。在上方输入公历生日，就能免费查看日柱、日主五行和日支生肖，再认识对应的六十动物意象卡。查询在浏览器内完成，无需注册。",
      "平时说的属龙、属兔，通常指年支生肖；这里查询的是日支。属龙的人也可能出生在兔日，它们分别来自年柱和日柱，并不矛盾。动物卡帮助你记住意象，传统的干支名称也会一起显示。",
    ],
    sections: [
      { title: "日柱与日主有什么区别？", body: "日柱有两个字，前面的天干就是日主，也称日元。例如丙寅日，丙是日主，对应阳火；寅是日支，对应虎。日主五行只是一个参照点，不等于整张八字的五行分布，也不能单凭它判断身强身弱或喜用神。" },
      { title: "分三层看懂查询结果", body: "先看历法字段，再阅读象征性的性格故事。卡片名字和画面是本站原创，不是额外计算出的一颗星或一种生肖。", items: [
        { title: "看干支", body: "卡名下会直接显示日柱、日主五行与日支生肖，方便与其他排盘结果核对。" },
        { title: "看意象", body: "阅读性格、感情和事业的不同侧面，想一个符合自己的例子，也想一个不符合的例子。" },
        { title: "看完整资料", body: "已知出生时间与地点时，可继续查看完整出生图谱。尤其在午夜附近，时间校准可能改变对应日期。" },
      ], ordered: true },
      { title: "先用一个日期试试", body: "输入公历 1990 年 1 月 1 日，本工具按日历日期计算得到丙寅：日主丙，阳火；日支寅，虎。这个例子用于说明结果字段，并不意味着同一天出生的人具有相同的经历或命运。" },
    ],
    note: "计算方式：使用 lunar-javascript 将公历日期换算为日干支，以当天中午作为日期锚点，不把中午当作你的出生时间。本页按民用午夜换日，不做出生地或太阳时校正；完整图谱另行处理时间资料。卡名和性格文字属于原创解读，与历法计算分开。",
    sources: [{ title: "香港天文台：天干与地支（英文）", href: "https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm" }],
    faqTitle: "查询日柱前，常见的三个问题",
    faqs: [
      { question: "不知道出生时间，可以查询日主吗？", answer: "可以先得到按公历日期计算的初步结果。如果出生在午夜附近，应核对当地出生时间、地点和换日规则，再把它作为校准后的八字结果。本站不会为你补造一个时柱。" },
      { question: "为什么两个排盘工具的日柱不同？", answer: "先核对填的是公历还是农历、日期和出生地是否一致，再比较工具采用民用时间还是真太阳时，以及在 23 点还是零点换日。本工具按日期和零点换日计算；完整排盘可能采用额外校正，不能只看结果不同就认定某一个错误。" },
      { question: "日主五行就是我缺的五行吗？", answer: "不是。日主五行来自日干，不等于缺什么、喜什么，也不能直接据此选补运手串。这些涉及完整命盘和不同解释方法，是另外的问题。" },
    ],
    relatedTitle: "带着结果，继续探索",
    related: [
      { title: "八字五行与星盘感情配对", description: "双方出生时间与城市已知时，比较沟通与爱的表达方式。", href: "/compatibility" },
      { title: "在线抽签与解签", description: "如果眼前有具体心事，也可以从一个问题开始，不需要出生资料。", href: "/sticks" },
    ],
  },
  ru: {
    eyebrow: "БАЦЗЫ · СТОЛП ДНЯ · ЭЛЕМЕНТ ЛИЧНОСТИ",
    title: "Как узнать свой столп дня и элемент личности?",
    intro: [
      "Столп дня в Бацзы — сочетание Небесного ствола и Земной ветви, соответствующее календарному дню. Введите дату рождения по григорианскому календарю: вы увидите столп дня, элемент личности и животное дня, а также одну из 60 авторских карточек DestinyPixel. Бесплатный расчёт выполняется в браузере без регистрации.",
      "Привычное животное китайского зодиака обычно относится к году рождения. Здесь определяется животное дня: например, человек года Дракона может родиться в день Кролика. Это разные части календарной карты, а не взаимоисключающие знаки.",
    ],
    sections: [
      { title: "Столп дня и Господин дня — не одно и то же", body: "Столп состоит из двух иероглифов. Господин дня, или элемент личности, определяется первым — Небесным стволом дня. Например, в 丙寅 (Бин Инь) ствол 丙 означает Огонь Ян, а ветвь 寅 — Тигра. Один элемент дня не описывает баланс всей карты и не определяет её силу." },
      { title: "Три уровня результата", body: "Сначала рассмотрите календарные данные, затем символическое толкование. Иллюстрация помогает запомнить образ; это не отдельный астрономический расчёт.", items: [
        { title: "Календарное сочетание", body: "Под названием карточки указаны столп дня, элемент личности и животное дня — их можно сравнить с другой картой." },
        { title: "Портрет характера", body: "Прочтите о характере, отношениях и работе. Найдите в своей жизни пример, который подходит, и пример, который не подходит." },
        { title: "Полная карта", body: "Известные время и место рождения позволяют добавить другие столпы и поправки времени. Это особенно существенно около границы суток." },
      ], ordered: true },
      { title: "Попробуйте на примере", body: "Введите 1 января 1990 года. В этом расчёте по календарной дате результат — 丙寅, Бин Инь: элемент личности Огонь Ян и ветвь дня Тигр. Пример объясняет поля результата, а не предсказывает одинаковую жизнь всем людям этой даты рождения." },
    ],
    note: "Метод: григорианская дата преобразуется в ствол и ветвь дня библиотекой lunar-javascript. Полдень служит опорной точкой даты, а не предполагаемым временем рождения. Здесь сутки меняются в гражданскую полночь; место рождения и солнечная поправка не учитываются. Названия карточек и толкования — авторский материал, отдельный от календарного расчёта.",
    sources: [{ title: "Гонконгская обсерватория: Небесные стволы и Земные ветви (EN)", href: "https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm" }],
    faqTitle: "Перед интерпретацией результата",
    faqs: [
      { question: "Можно ли узнать элемент личности без времени рождения?", answer: "Здесь можно получить предварительный результат по календарной дате. При рождении около полуночи проверьте местное время, город и правило смены суток перед уточнённым расчётом Бацзы. Отсутствующий столп часа мы не придумываем." },
      { question: "Почему разные калькуляторы Бацзы дают разные столпы дня?", answer: "Сначала проверьте календарь, дату и город. Затем сравните использование гражданского или солнечного времени и смену суток в 23:00 либо в полночь. Здесь используется полночь; полная карта может учитывать дополнительные поправки. Разница результатов сама по себе ещё не указывает на ошибку." },
      { question: "Элемент личности — это недостающая стихия?", answer: "Нет. Он определяется стволом дня и сам по себе не показывает недостающие или полезные элементы, силу Господина дня либо подходящий камень. Для этих вопросов нужны другие части карты и отдельная интерпретация." },
    ],
    relatedTitle: "Продолжить знакомство",
    related: [
      { title: "Совместимость по Бацзы и натальным картам", description: "Сравните общение и выражение чувств, если известны время и города рождения обоих.", href: "/compatibility" },
      { title: "Гадание Гуаньинь и другие храмовые жребии", description: "Другой способ рассмотреть конкретный вопрос без данных рождения.", href: "/sticks" },
    ],
  },
};
