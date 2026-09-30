// One product guide, revised when unknown-time support launched. Original URL
// and publication date remain in journal-search-growth.ts.
type Edition = { title: string; description: string; topic: string; introduction: string; takeaway: string; sections: [string, string][]; action: { label: string; href: string } };
export const birthTimeArticle: Record<"en" | "zh" | "ru", Edition> = {
  en: {
    title: "BaZi compatibility without a birth time: what you can compare",
    description: "Compare two birthdays without guessing noon. What date-based BaZi keeps, what it omits, and why its score differs from a timed chart.",
    topic: "Birth time optional",
    introduction: "Both birthdays are known, but one birth time is missing. You can now mark either person’s time as unknown and compare your day-pillar animals and five elements. This is a limited date-based comparison, not a recovered birth time or a complete natal chart.",
    takeaway: "Enter both dates and supported cities; mark each unknown time separately. No noon is inserted. Missing hour pillars and uncertain solar-term pillars stay empty.",
    sections: [
      ["How do I fill in the form?", "Enter each person’s Gregorian date and supported birth city. Use the local clock time from a birth record, or select the unknown-time checkbox. One or both times may be missing. The city still determines historical time-zone rules and the actual span of that date. Do not substitute your current city or a different supported city to pass the form. You do not need to upload a certificate, names or private messages. If a relative remembers a range, preserve that uncertainty: the current form supports a recorded time or unknown time, not interval rectification."],
      ["Which pillars remain?", "The unknown-time portrait uses the local civil date, with midnight as the day boundary. It does not assume noon or infer a corrected solar birth instant. The hour pillar is omitted. Year and month pillars are checked at both ends of the local day using the full engine’s solar-term convention. If either changes within the day, it is marked uncertain and excluded too. An ordinary date usually leaves three pillars; a boundary date can leave fewer. This is an explicit convention, not a claim that all traditional schools use the same day boundary."],
      ["Why is the date-based score different?", "Two equally weighted themes contribute: the symbolic connection between the day-stem elements and the similarity of element proportions among available pillars. An absent pillar contributes nothing. With one known time, the two people can have different amounts of information, so counts are normalized to proportions. The 60–100 scale is an editorial index, not a relationship success probability or a full assessment of chart strength. Do not compare it directly with the timed score: the full method averages four themes, each blending BaZi at 30% and planetary comparisons at 70%."],
      ["Why might the Moon have two signs?", "For an unknown time, the Sun, Moon, Mercury, Venus and Mars are sampled hourly through the real local day, including both boundaries and daylight-saving changes. A crossing can show more than one possible sign. These are approximate sampled possibilities, not confirmed natal positions; a short crossing between samples could be missed. No exact degrees, cross-chart aspects, rising sign or houses are inferred. These possibilities are displayed separately and never enter the date-based score. A partner with a supplied time retains their clearly labelled calculated positions."],
      ["What changes if I find the time later?", "A birth record can resolve the hour, the solar-term boundary and the planetary positions. Two known times enable the full method again. Solar-time correction can also change a day portrait near midnight. A changed animal or score does not automatically mean a software error: first check whether the input and method changed. Confirm the original calendar, AM or PM, and birthplace. Do not pre-convert to Beijing time, invent minutes from a remembered range or select the hour giving the most flattering result."],
      ["How can we use the result together?", "AI explains the calculated patterns; it does not set the score or recover a missing hour from a convincing story. Choose a practical question: how can one partner ask for quiet without sounding rejecting? How can the person who likes immediate action include the other in a decision? Check the reflection against real behaviour. No element pairing establishes someone’s private feelings, loyalty or a relationship’s future. Better birth information makes the calculation more specific; it does not make symbolic interpretation a scientific prediction."]
    ],
    action: { label: "Compare two birthdays — birth time optional", href: "/compatibility" }
  },
  zh: {
    title: "不知道出生时辰也能合盘吗？日期版八字匹配怎么用",
    description: "双方可分别选择时辰未知，不补午时。了解日期版保留哪些信息、节气交界与星座范围怎么处理，以及为什么不能与完整盘直接比分数。",
    topic: "出生时辰可选填",
    introduction: "双方生日都知道，却有一个人不记得出生时间。现在可以分别勾选“出生时辰未知”，从日柱动物与五行关系开始比较。未知仍会明确标注：这是范围有限的日期版相处图谱，不是找回了出生时间，也不是补齐了完整星盘。",
    takeaway: "填写双方公历生日与支持的出生城市，分别标记未知时辰。不默认按午时算；缺失时柱和节气交界无法确定的柱都会留空。",
    sections: [
      ["表单具体怎么填？", "每个人分别填公历生日与出生城市。有记录就填当地钟表时间，没有就勾选时辰未知；一方未知、双方未知都可以。城市仍用于历史时区与当天实际范围，不是现在居住的城市，也不要为通过表单而随意换成其他城市。无需上传出生证明、姓名或私密聊天记录。亲属只记得一个时间范围时，先保留范围，不要编出精确分钟。当前支持已知时刻或未知时辰，不提供时间区间校正。"],
      ["八字会保留哪些部分？", "未知时辰者按出生地民用日期、午夜换日取得日柱意象，不补中午，也不推断真太阳出生时刻。时柱直接留空。系统检查当地一天两端的年柱、月柱，沿用完整引擎的节气约定；若某柱在这一天切换，就标为未确定并排除。普通日期通常保留三柱，节气交界可能更少。这是本站明确采用的历法约定，不代表所有传统流派的换日规则都一样。"],
      ["日期版分数是怎么来的？", "日干五行互动、可用柱的五行相对分布两项等权平均，呈现为本站 60–100 分的象征性指数。缺失柱不分配任何元素；一方时间已知、另一方未知时，资料量可能不同，因此按比例比较。这不是日主强弱、喜用神分析或关系成功率。完整资料版为四个维度，每项八字占 30%、星盘占 70%，不能把两种模式的分数直接拿来判断哪次更准。"],
      ["为什么月亮可能显示两个星座？", "未知时间时，对出生地实际一天逐小时取样，并检查两端，兼顾夏令时变化。太阳、月亮、水星、金星或火星若经过星座边界，可能显示不止一种。这是近似可能范围，不是已确认的本命位置；取样间短暂越界仍可能遗漏。不据此推断精确度数、双方相位、上升或宫位，也不计入日期版分数。另一方时间已知时，其行星位置会单独标明依据。"],
      ["找到出生时间后，会不会变结果？", "可能。记录可以确定时柱、节气交界与行星位置；双方时间齐全后恢复完整比较。太阳时校正也可能令午夜附近的日柱意象改变。动物或分数变了，应先看输入与计算方法是否变化。核对原记录的公历或农历、上午下午和出生地，不要先转北京时间再重复校正，更不要选分数最好看的时刻当答案。"],
      ["怎样变成有用的相处讨论？", "AI 解释计算所得的图谱，不决定分数，也不能从很像你的文字反推出时辰。可以聊一个现实问题：一方想马上行动时，怎样让另一方有参与感？一方需要安静时，怎样表达才不会被听成拒绝？把提示与真实行为对照。五行组合不能证明对方的隐秘想法、忠诚或感情结局。补齐资料使计算更具体，不会把象征性解读变成科学预测。"]
    ],
    action: { label: "开始日期版情感匹配", href: "/compatibility?locale=zh" }
  },
  ru: {
    title: "Совместимость Ба-цзы без времени рождения: что можно сравнить",
    description: "Две даты без подстановки полудня: доступные столпы, границы сезонов, возможные знаки и отличие баллов от полной карты.",
    topic: "Время необязательно",
    introduction: "Обе даты известны, а время одного человека нет. Теперь его можно отметить неизвестным и сравнить животных дня и пять элементов. Это ограниченное сравнение по датам, не восстановление часа и не полная натальная карта.",
    takeaway: "Укажите даты и поддерживаемые города; неизвестное время отметьте отдельно. Полдень не подставляется. Час и неопределённые столпы на границе сезона исключаются.",
    sections: [
      ["Как заполнить форму?", "Для каждого нужны григорианская дата и город рождения. Введите местное время из записи или отметьте его отсутствие. Это работает для одного или обоих людей. Город определяет исторический часовой пояс и реальные границы суток; нынешний город его не заменяет. Не выбирайте другой город ради прохождения формы. Документы, имена и личные сообщения загружать не нужно. Известный диапазон не превращайте в выдуманную минуту: форма поддерживает точное время либо его отсутствие, не ректификацию интервала."],
      ["Какие столпы остаются?", "Образ дня основан на местной календарной дате с границей в полночь, без предполагаемого полудня или солнечного момента рождения. Час отсутствует. Год и месяц проверяются на обоих концах суток по солнечным сезонам; меняющийся столп отмечается неопределённым и исключается. Обычно остаются три столпа, на границе может быть меньше. Это оговорённая конвенция сайта, не универсальное правило всех школ."],
      ["Почему индекс отличается?", "Равный вес имеют символическая связь элементов дня и сходство относительных долей элементов доступных столпов. Отсутствующий столп не получает выдуманный элемент. При разном объёме данных доли нормализуются. Шкала 60–100 — авторский индекс, не оценка силы карты и не вероятность успеха. Не сравнивайте его напрямую с полным режимом: там четыре темы, каждая сочетает Ба-цзы (30%) и планетные сравнения (70%)."],
      ["Почему у Луны могут быть два знака?", "Для неизвестного времени Солнце, Луна, Меркурий, Венера и Марс проверяются почасово по реальным местным суткам, включая границы и перевод часов. При переходе возможны два знака. Это приблизительная выборка, не подтверждённые натальные положения; короткий переход между точками может быть пропущен. Точные градусы, аспекты, асцендент и дома не выводятся. Возможные знаки не входят в индекс. Для партнёра с известным временем положения отмечены отдельно."],
      ["Если время найдётся позже?", "Запись может определить час, границу сезона и планеты. С двумя временами включается полный режим. Солнечная поправка способна изменить образ дня около полуночи: изменившийся балл или животное не обязательно означает ошибку, ведь изменились данные и метод. Уточните календарь, утро или вечер и исходное место. Не переводите время заранее в пекинское и не выбирайте самый приятный результат вместо проверки записи."],
      ["Как обсудить результат?", "ИИ объясняет вычисленную структуру, не задаёт баллы и не восстанавливает час из убедительного текста. Обсудите привычки: как включить партнёра в решение, если хочется действовать сразу? Как попросить тишины без впечатления отказа? Сопоставляйте подсказки с поступками. Элементы не доказывают тайные чувства, верность или будущее пары. Полные данные делают расчёт конкретнее, но не превращают символическую интерпретацию в научное предсказание."]
    ],
    action: { label: "Сравнить даты без обязательного времени", href: "/compatibility?locale=ru" }
  }
};
