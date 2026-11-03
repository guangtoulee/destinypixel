// Keep original section anchors when inserting the worked walkthrough.
// Original URL and publication date remain in journal-search-growth.ts.
export const birthTimeSectionIds = ["free-comparison", "step-1", "worked-example", "read-the-result", "step-2", "step-3", "step-4", "ai-and-saving", "step-5", "step-6"];
type Edition = { title: string; description: string; topic: string; introduction: string; takeaway: string; sections: [string, string, ...string[]][]; action: { label: string; href: string } };
export const birthTimeArticle: Record<"en" | "zh" | "ru", Edition> = {
  "en": {
    "title": "BaZi compatibility without birth time: a free calculator guide",
    "description": "Use the free BaZi compatibility calculator when one birth time is unknown. Follow a worked example, read missing pillars, and check AI and saving limits.",
    "topic": "Birth time optional",
    "introduction": "You know both birthdays, but only one birth time. DestinyPixel’s free BaZi compatibility calculator lets you mark either time as unknown; no registration or payment is required. Keep the time you do know. This guide follows a fictional pair from the form to the result, showing how to read a limited date-based comparison without mistaking it for a complete natal chart.",
    "takeaway": "Enter both dates and supported cities; mark each unknown time separately. No noon is inserted. Missing hour pillars and uncertain solar-term pillars stay empty.",
    "sections": [
      [
        "What is free, and what happens after I submit?",
        "The symbolic score, two animal portraits, five-element comparison and short DeepSeek reading are free, subject to usage limits. First the calculated result appears; the page then automatically requests the AI explanation. You can read the calculated sections while that text is loading. There is no separate AI-start button on this couple tool, and you do not need to buy an individual birth report to unlock this result.",
        "The form asks for permission to use both people’s birth details. Dates, local times and cities go to the site’s calculation service; the AI request contains the derived chart, not raw birthdays, cities or names. The animal descriptions are DestinyPixel’s original metaphors built around Chinese astrology, while the AI text is a separate interpretation. Neither is evidence of how a particular partner will behave."
      ],
      [
        "How do I fill in the form?",
        "Enter each person’s Gregorian date and supported birth city. Use the local clock time from a birth record, or select the unknown-time checkbox. One or both times may be missing. The city still determines historical time-zone rules and the actual span of that date. Do not substitute your current city or a different supported city to pass the form. You do not need to upload a certificate, names or private messages. If a relative remembers a range, preserve that uncertainty: the current form supports a recorded time or unknown time, not interval rectification."
      ],
      [
        "Worked example: one recorded time, one unknown",
        "These are fictional inputs for learning the controls, not a customer report. For Person A, enter 15 May 1990 (1990-05-15), 09:30 local time and Beijing. Leave A’s unknown-time box unchecked. For Person B, enter 22 August 1992 (1992-08-22) and Shanghai, then check “I don’t know the birth time.” B’s time field becomes disabled: leave it that way rather than entering 12:00. Confirm permission and choose “Reveal our connection.”",
        "With the current calculation, the result is labelled “Date-based comparison.” A’s day is 庚辰, The Armored Dragon; B’s is 庚午, The Blade Horse. Both day elements are Metal. The animal names are site-specific illustrations, not the people’s year zodiac signs or a traditional marriage verdict. A’s known time remains part of A’s portrait even though the pair uses the date-based scoring method."
      ],
      [
        "Read the example from data to discussion",
        "Open “Four Pillars” on each portrait. A has 庚午 / 辛巳 / 庚辰 / 庚辰 for year / month / day / hour. B has 壬申 / 戊申 / 庚午, with the hour shown as “Not calculated.” This ordinary date retains B’s year and month; a solar-term boundary date can behave differently. Then expand “Your five-element landscape.” The chart shows Metal at 50% for each: four of A’s eight counted stem/branch elements and three of B’s six. Equal percentages do not mean equal information or identical personalities.",
        "Next, read the two date-mode themes: “Day-element connection” and “Available element distribution.” The sky section labels A’s signs as based on the supplied time and B’s as sampled possibilities. Even if B has only one listed Moon sign, that does not recover an exact birth time or justify an Ascendant. For discussion, try: “When we both think we are right, how do we leave room for the other person?” That is an original conversation prompt, not a finding that these fictional people argue."
      ],
      [
        "Which pillars remain?",
        "The unknown-time portrait uses the local civil date, with midnight as the day boundary. It does not assume noon or infer a corrected solar birth instant. The hour pillar is omitted. Year and month pillars are checked at both ends of the local day using the full engine’s solar-term convention. If either changes within the day, it is marked uncertain and excluded too. An ordinary date usually leaves three pillars; a boundary date can leave fewer. This is an explicit convention, not a claim that all traditional schools use the same day boundary."
      ],
      [
        "Why is the date-based score different?",
        "Two equally weighted themes contribute: the symbolic connection between the day-stem elements and the similarity of element proportions among available pillars. An absent pillar contributes nothing. With one known time, the two people can have different amounts of information, so counts are normalized to proportions. The 60–100 scale is an editorial index, not a relationship success probability or a full assessment of chart strength. Do not compare it directly with the timed score: the full method averages four themes, each blending BaZi at 30% and planetary comparisons at 70%."
      ],
      [
        "Why might the Moon have two signs?",
        "For an unknown time, the Sun, Moon, Mercury, Venus and Mars are sampled hourly through the real local day, including both boundaries and daylight-saving changes. A crossing can show more than one possible sign. These are approximate sampled possibilities, not confirmed natal positions; a short crossing between samples could be missed. No exact degrees, cross-chart aspects, rising sign or houses are inferred. These possibilities are displayed separately and never enter the date-based score. A partner with a supplied time retains their clearly labelled calculated positions."
      ],
      [
        "If AI is unavailable, can I still read or save the result?",
        "Yes, you can still read the calculated score, portraits and comparison when only the AI explanation is unavailable or its free limit has been reached. That message does not mean the birth-time calculation failed. If no result appears and the form itself shows an error, check the dates, cities, permission and any time not marked unknown; follow a wait message before trying again. Repeatedly submitting will not reveal a missing hour.",
        "This compatibility tool currently has no account-save or shareable-report feature. Signing in will not place this couple reading in your saved records. If you want to revisit the conversation, keep your own private note or screenshot with both people’s agreement; bookmarking the tool only keeps its address. The separate natal-chart and Tarot tools offer account saving, but that does not apply here. The product facts page lists the current differences."
      ],
      [
        "What changes if I find the time later?",
        "A birth record can resolve the hour, the solar-term boundary and the planetary positions. Two known times enable the full method again. Solar-time correction can also change a day portrait near midnight. A changed animal or score does not automatically mean a software error: first check whether the input and method changed. Confirm the original calendar, AM or PM, and birthplace. Do not pre-convert to Beijing time, invent minutes from a remembered range or select the hour giving the most flattering result."
      ],
      [
        "How can we use the result together?",
        "AI explains the calculated patterns; it does not set the score or recover a missing hour from a convincing story. Choose a practical question: how can one partner ask for quiet without sounding rejecting? How can the person who likes immediate action include the other in a decision? Check the reflection against real behaviour. No element pairing establishes someone’s private feelings, loyalty or a relationship’s future. Better birth information makes the calculation more specific; it does not make symbolic interpretation a scientific prediction."
      ]
    ],
    "action": {
      "label": "Try the free compatibility calculator",
      "href": "/compatibility"
    }
  },
  "zh": {
    "title": "不知道出生时辰也能合盘吗？免费八字配对实例教程",
    "description": "一方不知道出生时辰，免费八字合盘怎么填、怎么看？用虚构实例说明已知资料与缺失时柱、五行对比，以及 AI 解读和记录保存的实际范围。",
    "topic": "出生时辰可选填",
    "introduction": "双方生日都知道，却只有一个人记得出生时间。DestinyPixel 的免费八字配对可以分别勾选时辰未知，无需注册或付费；已知的时间照常保留。这篇指南用一组虚构资料，从填写表单走到阅读结果，说明日期版能够比较什么，也避免把缺少时辰的相处图谱当成完整星盘。",
    "takeaway": "填写双方公历生日与支持的出生城市，分别标记未知时辰。不默认按午时算；缺失时柱和节气交界无法确定的柱都会留空。",
    "sections": [
      [
        "哪些免费？提交后会发生什么？",
        "象征性评分、两张动物画像、五行对比和简短 DeepSeek 解读均可免费使用，请求受使用限额约束。先显示计算结果，页面随后自动请求 AI 解读；文字生成期间，可以先看已算好的部分。当前合盘页不需要另外点一次 AI 按钮，也不需要购买个人出生报告才能看到这次配对结果。",
        "表单要求确认已获得双方同意。生日、当地时间与城市提交给本站计算服务；发送给 AI 的是衍生图谱，不包含原始生日、城市或姓名。动物描述是本站围绕八字创作的比喻，AI 文字则是另一层解读，都不能当作某个伴侣必然如何行动的证据。"
      ],
      [
        "表单具体怎么填？",
        "每个人分别填公历生日与出生城市。有记录就填当地钟表时间，没有就勾选时辰未知；一方未知、双方未知都可以。城市仍用于历史时区与当天实际范围，不是现在居住的城市，也不要为通过表单而随意换成其他城市。无需上传出生证明、姓名或私密聊天记录。亲属只记得一个时间范围时，先保留范围，不要编出精确分钟。当前支持已知时刻或未知时辰，不提供时间区间校正。"
      ],
      [
        "操作实例：一个时间已知，另一个未知",
        "以下为演示操作的虚构资料，不是真实用户报告。第一人“你”填公历 1990-05-15、当地时间 09:30、北京，不勾选未知时辰。第二人“TA”填公历 1992-08-22、上海，勾选“不知道出生时辰”；此时时间框不可填写，保持这样，不要补成 12:00。确认同意后，点击“看看我们的相处图谱”。",
        "按当前计算，结果标注“日期版相处图谱”。第一人的日柱是庚辰，对应披甲战龙；第二人是庚午，对应烈火战马，双方日干五行都是金。动物名是本站专属意象，不是两人的年生肖，也不是传统婚配结论。虽然这对组合采用日期版评分，第一人已经填写的时间仍保留在其个人图谱中。"
      ],
      [
        "按资料、对比、讨论的顺序读这组结果",
        "分别展开画像下方的“八字四柱”。第一人的年、月、日、时依次是庚午／辛巳／庚辰／庚辰；第二人为壬申／戊申／庚午，时柱显示“不计算”。这个普通日期能保留第二人的年、月柱，遇到节气交界则未必如此。再展开“你们的五行分布”，其中双方金元素都为 50%：第一人统计八个天干地支元素，其中四个为金；第二人只有六个，其中三个为金。同样的百分比，不代表资料量相同，更不代表性格相同。",
        "然后看日期版的两项主题：“日干五行互动”和“已知五行分布”。星空部分分别标明第一人“按填写的出生时间”、第二人“逐小时取样 · 可能星座”。即使第二人的月亮只列出一个星座，也不能反推出准确时刻或上升。可以把讨论落在一句话：“当我们都觉得自己有道理时，怎样给对方留出表达空间？”这是本站原创的对话练习，不是算出了这两个虚构人物一定会争吵。"
      ],
      [
        "八字会保留哪些部分？",
        "未知时辰者按出生地民用日期、午夜换日取得日柱意象，不补中午，也不推断真太阳出生时刻。时柱直接留空。系统检查当地一天两端的年柱、月柱，沿用完整引擎的节气约定；若某柱在这一天切换，就标为未确定并排除。普通日期通常保留三柱，节气交界可能更少。这是本站明确采用的历法约定，不代表所有传统流派的换日规则都一样。"
      ],
      [
        "日期版分数是怎么来的？",
        "日干五行互动、可用柱的五行相对分布两项等权平均，呈现为本站 60–100 分的象征性指数。缺失柱不分配任何元素；一方时间已知、另一方未知时，资料量可能不同，因此按比例比较。这不是日主强弱、喜用神分析或关系成功率。完整资料版为四个维度，每项八字占 30%、星盘占 70%，不能把两种模式的分数直接拿来判断哪次更准。"
      ],
      [
        "为什么月亮可能显示两个星座？",
        "未知时间时，对出生地实际一天逐小时取样，并检查两端，兼顾夏令时变化。太阳、月亮、水星、金星或火星若经过星座边界，可能显示不止一种。这是近似可能范围，不是已确认的本命位置；取样间短暂越界仍可能遗漏。不据此推断精确度数、双方相位、上升或宫位，也不计入日期版分数。另一方时间已知时，其行星位置会单独标明依据。"
      ],
      [
        "AI 没出来还能看吗？登录能保存吗？",
        "如果只是 AI 解读暂时不可用或达到免费限额，已计算的评分、动物画像和对比仍可阅读；这不等于出生资料计算失败。如果完全没有结果，而表单显示错误，再检查生日、城市、同意选项和未勾选未知的时间；遇到等待提示，稍后再试。反复提交也不会找回一个原本缺失的时辰。",
        "当前合盘工具没有账户保存或可分享的报告功能，登录后也不会把这份双人结果加入历史记录。想回顾讨论，可以在双方同意下自行留一份私密笔记或截图；收藏工具网址只会保存入口。独立星盘和塔罗工具有账户保存，但合盘不沿用这项功能。产品事实页列出了各工具当前的区别。"
      ],
      [
        "找到出生时间后，会不会变结果？",
        "可能。记录可以确定时柱、节气交界与行星位置；双方时间齐全后恢复完整比较。太阳时校正也可能令午夜附近的日柱意象改变。动物或分数变了，应先看输入与计算方法是否变化。核对原记录的公历或农历、上午下午和出生地，不要先转北京时间再重复校正，更不要选分数最好看的时刻当答案。"
      ],
      [
        "怎样变成有用的相处讨论？",
        "AI 解释计算所得的图谱，不决定分数，也不能从很像你的文字反推出时辰。可以聊一个现实问题：一方想马上行动时，怎样让另一方有参与感？一方需要安静时，怎样表达才不会被听成拒绝？把提示与真实行为对照。五行组合不能证明对方的隐秘想法、忠诚或感情结局。补齐资料使计算更具体，不会把象征性解读变成科学预测。"
      ]
    ],
    "action": {
      "label": "试试免费八字情感匹配",
      "href": "/compatibility?locale=zh"
    }
  },
  "ru": {
    "title": "Совместимость Ба-цзы без времени рождения: бесплатный расчёт",
    "description": "Как пользоваться бесплатным калькулятором Ба-цзы, если один час неизвестен: пример ввода, чтение столпов, ограничения ИИ и сохранения результата.",
    "topic": "Время необязательно",
    "introduction": "Вы знаете обе даты, но время рождения только одного человека. Бесплатный калькулятор совместимости Ба-цзы DestinyPixel позволяет отдельно отметить неизвестное время; регистрация и оплата не нужны. Известное время оставьте. На вымышленном примере пройдём от формы до результата и разберём, как читать сравнение по датам, не принимая его за полную натальную карту.",
    "takeaway": "Укажите даты и поддерживаемые города; неизвестное время отметьте отдельно. Полдень не подставляется. Час и неопределённые столпы на границе сезона исключаются.",
    "sections": [
      [
        "Что бесплатно и что происходит после отправки?",
        "Символический индекс, два образа животных, сравнение пяти элементов и короткая интерпретация DeepSeek бесплатны; действуют ограничения на запросы. Сначала появляется расчёт, затем страница автоматически запрашивает текст ИИ. Пока он готовится, рассчитанные разделы уже можно читать. Отдельной кнопки запуска ИИ в этом инструменте нет. Покупать индивидуальный отчёт, чтобы открыть результат для пары, не требуется.",
        "Форма просит подтвердить согласие обоих людей. Даты, местное время и города передаются сервису расчёта сайта; ИИ получает вычисленную карту, без исходных дат, городов и имён. Животные — авторские метафоры DestinyPixel на основе китайской астрологии; текст ИИ — отдельная интерпретация. Ни то ни другое не доказывает, как поведёт себя конкретный партнёр."
      ],
      [
        "Как заполнить форму?",
        "Для каждого нужны григорианская дата и город рождения. Введите местное время из записи или отметьте его отсутствие. Это работает для одного или обоих людей. Город определяет исторический часовой пояс и реальные границы суток; нынешний город его не заменяет. Не выбирайте другой город ради прохождения формы. Документы, имена и личные сообщения загружать не нужно. Известный диапазон не превращайте в выдуманную минуту: форма поддерживает точное время либо его отсутствие, не ректификацию интервала."
      ],
      [
        "Пример: одно время известно, другое — нет",
        "Это вымышленные данные для знакомства с формой, не отчёт клиента. Для человека А введите 15 мая 1990 года (1990-05-15), местное время 09:30 и Beijing. Не отмечайте неизвестное время для А. Для человека Б укажите 22 августа 1992 года (1992-08-22) и Shanghai, затем отметьте «Время рождения неизвестно». Поле времени Б станет недоступным: оставьте его таким, не вводите 12:00. Подтвердите согласие и нажмите «Сравнить наши карты».",
        "При текущем расчёте результат отмечен как «Сравнение по датам». День А — 庚辰, Бронированный дракон; день Б — 庚午, Конь клинка. Элемент дня у обоих — Металл. Названия животных принадлежат системе образов сайта: это не годовые знаки зодиака и не традиционный вердикт о браке. Известное время А остаётся в его карте, хотя индекс пары рассчитывается по методу для неполных данных."
      ],
      [
        "От данных к сравнению и разговору",
        "Откройте «Четыре столпа» под каждым образом. Год, месяц, день и час А: 庚午 / 辛巳 / 庚辰 / 庚辰. У Б: 壬申 / 戊申 / 庚午; для часа указано «Не рассчитан». На этой обычной дате год и месяц Б определены; на границе солнечного сезона результат может быть иным. Далее откройте «Распределение пяти элементов»: у обоих 50% Металла: четыре из восьми учитываемых элементов стволов и ветвей у А и три из шести у Б. Равные доли не означают одинаковый объём данных или одинаковые характеры.",
        "Далее прочитайте две темы: «Связь элементов дня» и «Доступное распределение элементов». В разделе планет знаки А помечены как рассчитанные по указанному времени, а знаки Б — как почасовая выборка возможных положений. Даже один указанный знак Луны у Б не восстанавливает точное время или асцендент. Для разговора попробуйте вопрос: «Когда мы оба уверены в своей правоте, как дать другому возможность высказаться?» Это авторское упражнение, а не вывод, что вымышленные люди обязательно ссорятся."
      ],
      [
        "Какие столпы остаются?",
        "Образ дня основан на местной календарной дате с границей в полночь, без предполагаемого полудня или солнечного момента рождения. Час отсутствует. Год и месяц проверяются на обоих концах суток по солнечным сезонам; меняющийся столп отмечается неопределённым и исключается. Обычно остаются три столпа, на границе может быть меньше. Это оговорённая конвенция сайта, не универсальное правило всех школ."
      ],
      [
        "Почему индекс отличается?",
        "Равный вес имеют символическая связь элементов дня и сходство относительных долей элементов доступных столпов. Отсутствующий столп не получает выдуманный элемент. При разном объёме данных доли нормализуются. Шкала 60–100 — авторский индекс, не оценка силы карты и не вероятность успеха. Не сравнивайте его напрямую с полным режимом: там четыре темы, каждая сочетает Ба-цзы (30%) и планетные сравнения (70%)."
      ],
      [
        "Почему у Луны могут быть два знака?",
        "Для неизвестного времени Солнце, Луна, Меркурий, Венера и Марс проверяются почасово по реальным местным суткам, включая границы и перевод часов. При переходе возможны два знака. Это приблизительная выборка, не подтверждённые натальные положения; короткий переход между точками может быть пропущен. Точные градусы, аспекты, асцендент и дома не выводятся. Возможные знаки не входят в индекс. Для партнёра с известным временем положения отмечены отдельно."
      ],
      [
        "Если ИИ недоступен, можно ли прочитать и сохранить результат?",
        "Да, рассчитанный индекс, образы и сравнение остаются доступными, если недоступна только интерпретация ИИ или исчерпан её бесплатный лимит. Это сообщение не означает, что расчёт карты не удался. Если результата вообще нет, а ошибку показывает форма, проверьте даты, города, согласие и время, которое не отмечено неизвестным. При просьбе подождать повторите позже. Повторные отправки не восстановят неизвестный час.",
        "В инструменте совместимости сейчас нет сохранения в аккаунт или отдельной ссылки на отчёт. Вход в аккаунт не добавит этот результат пары в историю. Для возвращения к разговору можно с согласия обоих оставить личную заметку или снимок экрана; закладка сохраняет только адрес инструмента. Отдельные инструменты натальной карты и Таро поддерживают сохранение в аккаунт, но здесь эта функция не действует. Актуальные различия перечислены на странице фактов о продуктах."
      ],
      [
        "Если время найдётся позже?",
        "Запись может определить час, границу сезона и планеты. С двумя временами включается полный режим. Солнечная поправка способна изменить образ дня около полуночи: изменившийся балл или животное не обязательно означает ошибку, ведь изменились данные и метод. Уточните календарь, утро или вечер и исходное место. Не переводите время заранее в пекинское и не выбирайте самый приятный результат вместо проверки записи."
      ],
      [
        "Как обсудить результат?",
        "ИИ объясняет вычисленную структуру, не задаёт баллы и не восстанавливает час из убедительного текста. Обсудите привычки: как включить партнёра в решение, если хочется действовать сразу? Как попросить тишины без впечатления отказа? Сопоставляйте подсказки с поступками. Элементы не доказывают тайные чувства, верность или будущее пары. Полные данные делают расчёт конкретнее, но не превращают символическую интерпретацию в научное предсказание."
      ]
    ],
    "action": {
      "label": "Открыть бесплатный калькулятор совместимости",
      "href": "/compatibility?locale=ru"
    }
  }
};
