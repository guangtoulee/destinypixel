import type { JournalSourceArticle, JournalTranslation } from "@/lib/journal";

const editions: Record<"en" | "zh" | "ru", JournalTranslation> = {
  en: {
    title: "Five Elements Compatibility: Does a Clash Mean a Bad Match?",
    description: "Read BaZi five-element compatibility through support, restraint and everyday examples. Understand element proportions and scores when a birth time is unknown.",
    topic: "BaZi, five elements & relationships",
    introduction: "You like each other. Then a compatibility reading says one person's element ‘controls’ the other's, and suddenly an ordinary disagreement feels like evidence against the relationship. Before giving that word so much power, look at what is actually being compared. In BaZi, Wood, Fire, Earth, Metal and Water belong to a traditional symbolic framework. A link between two elements is one part of a reading, not the whole story of two people. Here is how to understand the link without letting it do your thinking for you.",
    takeaway: "A controlling cycle is not a breakup verdict, and a nourishing cycle is not a guarantee of harmony. First identify which elements the result uses; then compare its interpretation with a specific situation you have actually lived.",
    sections: [
      {
        id: "what-a-clash-means", title: "Does a controlling element mean you are incompatible?",
        paragraphs: ["No. The word describes a relationship within the five-element model; it does not establish whether a couple will be happy. In this article, ‘clash’ is the everyday worry that two elements do not fit. It is not the separate technical BaZi concept of a clash between Earthly Branches. A traditional chart contains more than a pair of element labels, and DestinyPixel's comparison is a deliberately limited symbolic model.", "Think of the distinction as a useful question: where do we encourage each other, and where do we set limits? That is our editorial way of using the imagery, not a translation that makes every difficult relationship healthy. Whether a limit is welcome depends on the people involved. An element label never excuses pressure, disrespect or deciding for a partner."],
      },
      {
        id: "two-cycles", title: "The five-element compatibility chart: support and restraint",
        paragraphs: ["Wuxing is commonly called the five elements, but ‘five phases’ also captures its emphasis on interaction and change. The traditional generating cycle describes one phase producing the next; the controlling cycle describes restraint. The arrows below have a direction: Water nourishes Wood, while Wood does not nourish Water in that cycle. Two people sharing an element form a third case, not a missing arrow."],
        table: { headings: ["Element", "Nourishes →", "Controls →"], rows: [["Wood", "Fire", "Earth"], ["Fire", "Earth", "Metal"], ["Earth", "Metal", "Water"], ["Metal", "Water", "Wood"], ["Water", "Wood", "Fire"]] },
        sources: [{ label: "Internet Encyclopedia of Philosophy: Wuxing, especially section 4", href: "https://iep.utm.edu/wuxing/" }],
      },
      {
        id: "which-element", title: "Which element are you comparing: year or Day Master?",
        paragraphs: ["A ‘Wood person’ can mean different things on different websites. An element attached to your birth year's animal is not automatically your Day Master, the Heavenly Stem of your birth day. Another system may use the paired designation called Na Yin. Before comparing results, check which label each tool is using. Otherwise, the same person can appear to change elements simply because the question has changed.", "DestinyPixel's relationship panel compares the two Day Master elements. Its separate distribution counts each available pillar's visible stem and the main element assigned to its branch. With a known time there are four pillars; with an unknown time the hour pillar is absent, and a year or month pillar that changes during that local day is omitted too. An omitted pillar is missing information, not an element with a count of zero. A small bar does not, by itself, identify a beneficial element, diagnose a deficiency or tell you which partner to choose. The free date lookup can identify a civil-date day element; read its date-boundary note.", "Why compare proportions rather than raw counts? In a made-up counting example, three Wood entries out of six and four out of eight are both 50%. Four entries do not automatically mean a stronger Wood person. This illustrates the normalization used in the distribution comparison; it is not a pair of calculated birth charts. The other elements also matter to that comparison, and neither a percentage nor a count measures Day Master strength or useful elements."],
        sources: [{ label: "Find your Day Pillar and Day Master", href: "/discover" }, { label: "Hong Kong Observatory: stems, branches and the 60-pair cycle", href: "https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm" }],
      },
      {
        id: "nourishing-but-frustrating", title: "Water and Wood: why ‘supportive’ can still feel frustrating",
        paragraphs: ["Here is an invented scene, not a prediction about everyone with these elements. One partner comes home excited about a project. The other wants to help and immediately suggests a better plan, three contacts and a deadline. The first partner gets quieter. In the Water → Wood image, you might call this an attempt to nourish growth. In the actual conversation, the intended support arrived before anyone asked what was needed.", "Try a different opening: ‘Do you want encouragement, ideas, or help doing one thing?’ The excited partner can answer: ‘Encouragement first. I will ask for advice when I have worked out the idea.’ Notice what changes when the form of support is agreed. If this scene does not resemble you, leave it aside; the element pairing is not evidence that it must secretly apply."],
      },
      {
        id: "controlling-but-cooperative", title: "Wood and Earth: can a controlling pair work well together?",
        paragraphs: ["Imagine another fictional couple planning a weekend away. One keeps adding destinations; the other wants a budget and enough time to rest. The Wood → Earth relationship supplies a metaphor for expansion meeting limits. Either person could play either role in real life. A Day Master label cannot tell us who is the adventurous one, who handles money, or who should get the final say.", "They might agree on one fixed budget, one activity each and an afternoon left open. The question becomes ‘Which limit protects something we both care about?’ rather than ‘Which person is wrong for the other?’ A useful boundary is discussed, not imposed because of a chart. Watch whether the agreement works for both of you; do not count an unpleasant experience as proof that the elements were right."],
      },
      {
        id: "animals-and-score", title: "Where the 60 animal cards and the compatibility score fit",
        paragraphs: ["Your Day Pillar is a stem-and-branch pair. DestinyPixel gives each of the 60 pairs an original animal portrait, so the five day elements and the 60 cards are different layers. Two people can share a day element and have different cards. The card offers an image and a story to discuss; it is not an additional species of Chinese zodiac, a scientific personality category or a reason to assume two animals cannot get along.", "The directional five-element panel and the overall score answer different questions. Water → Wood identifies which element nourishes the other; swapping Person A and Person B does not reverse the traditional cycle. The score summarizes selected comparisons and cannot establish who should lead, give more or change first. It uses the site's deliberately chosen 60–100 scale, not a probability of staying together. The available birth details determine which calculation is used, as the table below shows."],
        sources: [{ label: "Free compatibility tool and its calculation method", href: "/compatibility" }, { label: "BaZi compatibility versus year-animal matching", href: "/journal/bazi-vs-chinese-zodiac-compatibility" }],
      },
      {
        "id": "birth-time-and-score",
        "title": "Known or unknown birth time: which five-element comparison will you see?",
        "paragraphs": [
          "One unknown time is enough to switch the pair to date-based scoring. The person with a recorded time keeps their calculated details; the other does not acquire a guessed hour. The date-based portrait uses the local civil date and a midnight day boundary. Near midnight it can differ from a chart corrected to solar time, so it should not be presented as a recovered complete chart.",
          "Both modes use the same 60–100 display range, but combine different information. A changed number after adding a verified time is not evidence that your relationship has improved or worsened. The weights are DestinyPixel’s editorial choices, not a universal rule of traditional BaZi compatibility or a measured chance of a successful relationship."
        ],
        "table": {
          "headings": [
            "What you are reading",
            "Both times known",
            "One or both times unknown"
          ],
          "rows": [
            [
              "Available BaZi pillars",
              "Four per person.",
              "Missing hour pillars and uncertain year/month pillars are excluded."
            ],
            [
              "Day-element connection",
              "Both Day Master elements; direction shown separately.",
              "Unknown-time person: civil-date day element. Known-time person: calculated Day Master."
            ],
            [
              "Score",
              "Four equal dimensions; each uses 30% BaZi and 70% selected planetary comparison.",
              "50% day-element affinity + 50% similarity of available-element proportions. No planetary aspect score."
            ],
            [
              "Element distribution",
              "Four stems and four branch main elements per person.",
              "Only available pillars; compare proportions, not unequal raw totals."
            ],
            [
              "Sky and missing information",
              "Selected planetary placements and comparisons; no rising signs or houses in this tool.",
              "Unknown-time possible signs are sampled hourly and shown separately. No inferred exact degrees, aspects, rising sign or houses."
            ]
          ]
        },
        "sources": [
          {
            "label": "Unknown birth time: date boundaries and possible signs",
            "href": "/journal/compatibility-without-birth-time"
          },
          {
            "label": "Current product inputs and calculation facts",
            "href": "/product-facts"
          }
        ]
      },
      {
        id: "read-together", title: "Read your result together in three steps",
        paragraphs: ["With both people's consent, enter their Gregorian birth dates and select their actual birth cities from the supported list. Supply a recorded local time where known; otherwise select the unknown-time option for that person. Cities are still required so the local day can be interpreted correctly. Do not guess noon or convert a vague family recollection into a precise hour merely to unlock the full comparison.", "Begin with the elements and their direction, then check the information limits before reading the number. The calculated comparison appears first, then DeepSeek commentary loads separately. That text explains the supplied derived chart information; it does not calculate the score, retrieve a missing birth time or independently validate the reading. If the AI explanation is unavailable, the element comparison remains readable."],
        steps: ["Check the labels: identify both Day Master elements and which way the arrow points. Read the animal portraits as the site's own imagery.", "Choose one recent moment: when did help feel helpful, or a limit feel frustrating? Let each person describe their own experience before using the chart's language.", "Agree on one small experiment: ask before offering advice, choose a time to revisit a discussion, or divide a task differently. Afterwards, judge the experiment by what happened."],
        sources: [{ label: "What if a birth time is unknown?", href: "/journal/compatibility-without-birth-time" }],
      },
      {
        id: "common-questions", title: "Two common questions about element matches",
        paragraphs: ["Are two people with the same element automatically a good match? No. Shared symbolism may suggest an easy point of recognition, but it does not establish identical needs or habits. Two people can both value independence and still disagree about how often to spend time together. Ask what the word means to each of you.", "Can the right partner ‘fix’ a missing element? This tool cannot establish that. Its simple element counts do not assess Day Master strength or useful elements, and no result obliges another person to complete you. Use the comparison to open a conversation about the relationship you have, rather than shopping for an element to fill a bar on a chart."],
      },
    ],
    action: { label: "Compare our BaZi elements — birth times optional", href: "/compatibility" },
  },
  zh: {
    title: "五行相克就不适合在一起吗？看懂八字配对里的相生相克",
    description: "五行相克就不适合在一起吗？看懂相生相克表、日主五行与日常相处例子，分清已知和未知出生时辰时的元素比例、配对分数与解读范围。",
    topic: "八字五行与两个人的相处",
    introduction: "本来相处得不错，测完却看到一句“你的五行克对方”，连一次普通争执也突然变得可疑：是不是从根上就不合适？先别让一个“克”字替两个人下结论。木、火、土、金、水属于传统的象征体系，两种五行之间的关系，只是解读的一部分。弄清工具比较的到底是什么，再把它放回真实生活，往往比盯着一个高低分更有收获。",
    takeaway: "相克不是分手判决，相生也不是幸福保证。先核对比较的是哪一层五行，再找一件真实发生的事，看看这些意象能不能帮助你们把话说清楚。",
    sections: [
      {
        id: "what-a-clash-means", title: "五行相克，是不是代表两个人不合适？",
        paragraphs: ["不能只凭这一个关系判断。相克描述的是五行模型里的制约关系，不直接给出一段感情的结局。本文讨论的是日干五行之间的生克，也不要把它与地支相冲混为一谈。传统命局不只有两个五行标签；DestinyPixel提供的也是有明确范围的象征性比较，而非完整传统合婚。", "可以把这组意象变成两个问题：我们在哪些地方鼓励彼此，又在哪些地方需要设边界？这是本站用来展开对话的现代解释，并不意味着所有摩擦都有益。边界是否合适，要听双方怎么说；任何五行标签都不能替强迫、不尊重或擅自替伴侣决定找理由。"],
      },
      {
        id: "two-cycles", title: "五行相生相克表：先看方向，再谈感受",
        paragraphs: ["五行包含木、火、土、金、水，也可以理解为传统思想中彼此作用、变化的五种阶段。相生描述生成，相克描述制约。下面的箭头有方向：水生木，并不等于木也生水。两人同属一种五行，则属于同气关系，不是表里漏了一条箭头。"],
        table: { headings: ["五行", "相生 →", "相克 →"], rows: [["木", "火", "土"], ["火", "土", "金"], ["土", "金", "水"], ["金", "水", "木"], ["水", "木", "火"]] },
        sources: [{ label: "哲学网络百科全书：五行，尤其第4节（英文）", href: "https://iep.utm.edu/wuxing/" }],
      },
      {
        id: "which-element", title: "你说的“属木”，是年命还是日主？",
        paragraphs: ["不同页面里的“木命”，可能根本不在说同一层东西。出生年份生肖附带的五行，不一定就是出生日天干对应的日主五行；有些页面还采用纳音称呼。比较两个结果之前，先看清各自在用哪个标签。同一个人换了页面就“变了五行”，有时只是比较口径变了。", "DestinyPixel的感情匹配面板比较双方的日干五行，另行统计可用柱的天干与地支本气对应的五行。时辰已知时有四柱；时辰未知时不计时柱，出生地当天若跨越会改变年柱或月柱的节气，对应不确定柱也会排除。缺失一根柱是资料不足，不等于那根柱的五行含量为零。某根柱状条少，并不能单独确定喜用神、说明你有什么缺陷，或告诉你该选什么伴侣。免费的日期查询可以给出民用日期对应的日主，使用前请看换日边界说明。", "为什么比较比例，而不是直接比较数量？举一个人为设定的计数例子：六个计数里有三个木，与八个计数里有四个木，占比都是50%；不能仅凭“四个比三个多”就认定后者木更旺。这只是解释分布比较如何归一化，不是两份实际出生图谱。比较时还会看其他五行的比例，数量或占比都不等于日主旺衰与喜用神分析。"],
        sources: [{ label: "免费查询日柱与日主五行", href: "/discover?locale=zh" }, { label: "香港天文台：干支与六十循环（英文）", href: "https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm" }],
      },
      {
        id: "nourishing-but-frustrating", title: "水生木：为什么明明是相生，还是越帮越烦？",
        paragraphs: ["先看一个虚构情境，不代表所有水木组合都会如此。一方兴冲冲地说起新计划，另一方立刻给方案、找联系人、安排截止日期。说计划的人却越来越沉默。放进“水生木”的意象里，可以把它读成想帮助对方成长；放进实际对话里，却可能是还没问对方需要什么，就开始帮忙。", "不妨换个开头：“你现在想听鼓励、听建议，还是让我帮你做一件事？”另一方也可以说明：“先鼓励我一下，等想清楚了我再问建议。”观察约定好支持的方式之后，相处是否更舒服。如果这个例子完全不像你们，就把它放下，不必因为五行相同而硬找对应。"],
      },
      {
        id: "controlling-but-cooperative", title: "木克土：有制约的组合，也能好好合作吗？",
        paragraphs: ["再想象一对计划周末出游的伴侣：一个不断增加目的地，另一个想控制预算，也想留时间休息。“木克土”可以提供一个扩展与限制相遇的比喻。真实生活里，谁都可能扮演这两种角色；日主标签不能替我们判断谁爱冒险、谁负责钱，更不能决定谁有最后发言权。", "他们可以约定一个固定预算、各选一项活动，再留一个自由的下午。问题从“谁克谁”变成“哪条限制保护了我们都在意的东西”。有用的边界需要讨论，不能凭命盘强加。之后看安排是否照顾了双方，而不是一有不愉快就认定“五行果然说中了”。"],
      },
      {
        id: "animals-and-score", title: "六十动物和配对分数，分别放在哪里看？",
        paragraphs: ["日柱由一个天干和一个地支组成。DestinyPixel给六十种组合各配了一张原创动物画像，所以五种日主五行与六十张动物卡是不同层次。两人日干五行相同，也可能拿到不同的卡。卡片提供能聊起来的意象与故事，不是额外一套传统生肖、科学性格分类，也不能按动物在自然界的关系判断两人是否适合。", "有方向的五行面板与总分回答的是不同问题。水生木，说明哪种五行生成另一种；调换甲乙两人的录入顺序，不会把传统的相生方向倒过来。总分是若干比较项的汇总，不能据此决定谁应该主导、付出更多或先改变。本站主动采用60—100分的编辑尺度，它不是在一起的成功概率。使用哪一种计算方法，取决于双方提供了哪些出生资料，见下表。"],
        sources: [{ label: "免费感情匹配与计算方法", href: "/compatibility?locale=zh" }, { label: "八字合婚与生肖配对有什么区别", href: "/journal/bazi-vs-chinese-zodiac-compatibility?locale=zh" }],
      },
      {
        "id": "birth-time-and-score",
        "title": "知道或不知道出生时辰，五行配对结果有什么不同？",
        "paragraphs": [
          "只要一方勾选时辰未知，这一对就使用日期版评分。已知时刻者仍保留其计算资料，另一方不会被补上一个猜出的时辰。日期版画像按出生地民用日期、午夜换日来读；出生在午夜附近时，它可能与经过太阳时校正的图谱不同，不能当作找回了完整命盘。",
          "两种模式都显示在60—100分之间，但组合的资料不同。补入核实后的时刻，分数改变，不代表你们的关系突然变好或变差。权重是DestinyPixel的编辑方法，不是传统八字合婚的统一标准，也不是实测的感情成功率。"
        ],
        "table": {
          "headings": [
            "比较内容",
            "双方时刻已知",
            "一方或双方时辰未知"
          ],
          "rows": [
            [
              "可用八字柱",
              "每人四柱。",
              "缺失时柱及不确定的年／月柱不计。"
            ],
            [
              "日干五行关系",
              "比较双方日主，另保留生克方向。",
              "以民用日期日主为起点；已知时刻者保留其计算图谱。"
            ],
            [
              "分数构成",
              "四个维度等权；每项为30%八字＋70%指定行星比较。",
              "日干五行关系50%＋可用柱五行比例相似度50%；不算行星相位分。"
            ],
            [
              "五行分布",
              "每人四个天干、四个地支本气。",
              "仅统计可用柱，比较比例而非不同总数下的原始计数。"
            ],
            [
              "星盘与缺失信息",
              "指定行星位置与关系；此工具不计算上升与宫位。",
              "未知时刻者的可能星座逐小时取样、单独展示，不推断精确度数、相位、上升或宫位。"
            ]
          ]
        },
        "sources": [
          {
            "label": "未知时辰：换日边界与可能星座的完整说明",
            "href": "/journal/compatibility-without-birth-time?locale=zh"
          },
          {
            "label": "当前工具的输入要求与计算事实",
            "href": "/product-facts?locale=zh"
          }
        ]
      },
      {
        id: "read-together", title: "用三个步骤，一起读这份结果",
        paragraphs: ["取得双方同意后，填写各自的公历出生日期，并从支持列表选择真实出生城市。知道时刻的，按原记录填写当地时间；不知道的，单独勾选该人的“时辰未知”。城市仍然必填，用来确定出生地的当地一天。不要为了进入完整模式补一个午时，也不要把家人模糊的回忆填成一个貌似精确的钟点。", "先读五行关系与方向，再看资料限制，最后看分数。页面先显示计算结果，再单独加载DeepSeek解读。AI文字解释已经提供的衍生图谱，不负责计算分数、找回出生时辰，也不是对结果的独立验证。即使AI解读暂时不可用，五行比较结果仍可以阅读。"],
        steps: ["核对标签：分别找出双方日主五行，读清箭头从谁指向谁。动物画像按本站原创意象来读。", "选一件最近的事：什么时候帮助让你感到被支持，什么时候限制让你感到不舒服？先各自说经历，再借用图谱里的语言。", "约定一个小尝试：提建议前先问一声、约定重新讨论的时间，或换一种分工。之后根据实际发生的变化判断是否有用。"],
        sources: [{ label: "不知道出生时辰，能比较哪些内容？", href: "/journal/compatibility-without-birth-time?locale=zh" }],
      },
      {
        id: "common-questions", title: "关于五行配对，另外两个常见疑问",
        paragraphs: ["两人五行一样，就一定合适吗？也不能这么判断。相似意象可能让人容易产生共鸣，却不代表需要和习惯相同。两个人都重视独立，仍可能对多久见一次面有不同期待。先问问对方：“独立对你来说，具体是什么样？”", "找对伴侣，能补上自己缺的五行吗？这个工具不能作出这种判断。简单的元素计数不等于日主旺衰或喜用神分析，也没有任何结果能要求别人负责把你补完整。把比较用来了解正在发生的关系，比按柱状图缺口挑伴侣更有讨论价值。"],
      },
    ],
    action: { label: "免费比较我们的八字五行，时辰可选", href: "/compatibility?locale=zh" },
  },
  ru: {
    title: "Совместимость по пяти элементам: означает ли контроль плохую пару?",
    description: "Совместимость пяти элементов бацзы: порождение, контроль и примеры общения. Как читать пропорции элементов и оценку, если время рождения неизвестно.",
    topic: "Бацзы, пять элементов и отношения",
    introduction: "Вам хорошо вместе. Но в расчёте совместимости написано, что элемент одного человека «контролирует» элемент другого, и обычная ссора вдруг кажется подтверждением несовместимости. Прежде чем придавать этому слову такую власть, разберитесь, что именно сравнивается. Дерево, Огонь, Земля, Металл и Вода относятся к традиционной символической системе. Связь двух элементов — лишь часть чтения, а не вся история двух людей. Посмотрим, как понять её и при этом сохранить собственное суждение.",
    takeaway: "Цикл контроля не предписывает расставание, а цикл порождения не гарантирует гармонию. Сначала уточните, какие элементы сравнивает результат, затем сопоставьте толкование с конкретной ситуацией из вашей жизни.",
    sections: [
      {
        id: "what-a-clash-means", title: "Означает ли контроль элемента несовместимость?",
        paragraphs: ["Нет. Это название связи внутри модели пяти элементов, а не доказательство того, что пара будет несчастлива. Здесь мы обсуждаем взаимодействие элементов Небесных стволов дня, а не отдельное техническое понятие столкновения Земных ветвей. Традиционная карта содержит гораздо больше двух обозначений; сравнение DestinyPixel также имеет чётко ограниченный символический характер.", "Можно превратить образ в два вопроса: где мы поддерживаем друг друга и где нам нужны границы? Это наш современный способ начать разговор, а не утверждение, что любой конфликт полезен. Подходит ли ограничение, решают сами люди. Название элемента не оправдывает давление, неуважение или решения, принятые за партнёра."],
      },
      {
        id: "two-cycles", title: "Таблица пяти элементов: порождение и контроль",
        paragraphs: ["У-син обычно переводят как «пять элементов», но выражение «пять фаз» тоже передаёт идею взаимодействия и перемен. Традиционный цикл порождения описывает появление следующей фазы, а цикл контроля — сдерживание. Стрелки направлены: Вода порождает Дерево, но в этом цикле Дерево не порождает Воду. Одинаковый элемент у двух людей — отдельный случай, а не пропущенная стрелка."],
        table: { headings: ["Элемент", "Порождает →", "Контролирует →"], rows: [["Дерево", "Огонь", "Землю"], ["Огонь", "Землю", "Металл"], ["Земля", "Металл", "Воду"], ["Металл", "Воду", "Дерево"], ["Вода", "Дерево", "Огонь"]] },
        sources: [{ label: "Internet Encyclopedia of Philosophy: У-син, раздел 4 (англ.)", href: "https://iep.utm.edu/wuxing/" }],
      },
      {
        id: "which-element", title: "Какой элемент вы сравниваете: года или Господина дня?",
        paragraphs: ["Выражение «человек Дерева» на разных сайтах может означать разное. Элемент животного года рождения не обязательно совпадает с элементом Господина дня — Небесного ствола дня рождения. В другой системе может использоваться обозначение На Инь. Прежде чем сравнивать результаты, проверьте, какой именно показатель использует каждый инструмент. Иногда человек будто бы меняет элемент только потому, что изменился вопрос.", "Панель отношений DestinyPixel сравнивает элементы двух Господинов дня. Отдельно подсчитываются видимые стволы и основные элементы ветвей доступных столпов. При известном времени столпов четыре; при неизвестном столп часа отсутствует. Если в течение местного дня солнечный сезонный рубеж меняет столп года или месяца, неопределённый столп тоже исключается. Отсутствующий столп означает недостаток сведений, а не нулевое содержание его элемента. Низкий столбик сам по себе не определяет полезный элемент, личный недостаток или подходящего партнёра. Бесплатный расчёт по дате показывает элемент дня по гражданскому календарю; прочитайте пояснение о смене суток.", "Зачем сравнивать доли, а не количества? В условном примере три единицы Дерева из шести и четыре из восьми дают одинаковые 50%. Само число четыре не делает второго человека «сильнее по Дереву». Это арифметическая иллюстрация нормализации, а не две рассчитанные карты рождения. При сравнении учитываются также доли остальных элементов; ни доля, ни количество не заменяют оценку силы Господина дня и полезных элементов."],
        sources: [{ label: "Узнать столп дня и элемент Господина дня", href: "/discover?locale=ru" }, { label: "Гонконгская обсерватория: стволы, ветви и цикл из 60 пар (англ.)", href: "https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm" }],
      },
      {
        id: "nourishing-but-frustrating", title: "Вода и Дерево: почему поддержка иногда раздражает",
        paragraphs: ["Вот вымышленная ситуация, а не прогноз для всех с такими элементами. Один партнёр увлечённо рассказывает о новом проекте. Другой сразу предлагает улучшенный план, полезные контакты и срок выполнения. Первый постепенно замолкает. Образ Вода → Дерево можно прочесть как желание помочь росту. Но в самом разговоре помощь появилась раньше, чем вопрос о том, какая поддержка нужна.", "Попробуйте начать иначе: «Тебе сейчас нужны ободрение, идеи или помощь с конкретным делом?» В ответ можно сказать: «Сначала просто поддержи меня. За советом я обращусь, когда обдумаю идею». Посмотрите, что изменится после такого уточнения. Если история совсем на вас не похожа, оставьте её: сочетание элементов не доказывает, что она обязательно должна подходить."],
      },
      {
        id: "controlling-but-cooperative", title: "Дерево и Земля: может ли пара с контролем сотрудничать?",
        paragraphs: ["Представьте другую вымышленную пару, которая планирует выходные. Один добавляет новые места в маршрут, другой хочет определить бюджет и оставить время на отдых. Дерево → Земля даёт метафору расширения, встречающего ограничение. В жизни любой из партнёров может оказаться в любой роли. Элемент дня не сообщает, кто любит приключения, кто распоряжается деньгами и за кем последнее слово.", "Можно согласовать общий бюджет, по одному занятию для каждого и свободный день или вечер. Тогда вопрос звучит так: «Какая граница защищает то, что важно нам обоим?» Полезную границу обсуждают, а не навязывают ссылкой на карту. Проверьте, устраивает ли договорённость обоих. Не превращайте каждый неприятный момент в подтверждение того, что элементы якобы всё предсказали."],
      },
      {
        id: "animals-and-score", title: "Как связаны 60 животных и оценка совместимости",
        paragraphs: ["Столп дня — сочетание ствола и ветви. DestinyPixel сопоставляет каждой из 60 комбинаций авторский образ животного: поэтому пять элементов дня и 60 карточек — разные уровни. У людей с одним элементом могут быть разные карточки. Образ помогает начать обсуждение, но не является дополнительным видом китайского зодиака или научной классификацией личности. Отношения животных в природе ничего не решают за пару.", "Направление связи элементов и общий балл отвечают на разные вопросы. Вода → Дерево показывает, какой элемент порождает другой; перестановка людей в форме не обращает традиционный цикл вспять. Балл обобщает выбранные сравнения, но не определяет, кто должен руководить, больше отдавать или первым меняться. Мы используем редакционную шкалу 60–100, а не вероятность сохранения отношений. Метод расчёта зависит от доступных сведений о рождении; различия показаны ниже."],
        sources: [{ label: "Бесплатный инструмент и метод сравнения", href: "/compatibility?locale=ru" }, { label: "Бацзы и совместимость по животному года", href: "/journal/bazi-vs-chinese-zodiac-compatibility?locale=ru" }],
      },
      {
        "id": "birth-time-and-score",
        "title": "Известно ли время рождения: что меняется в сравнении элементов?",
        "paragraphs": [
          "Если время неизвестно хотя бы у одного человека, пара получает оценку по датам. Человек с записанным временем сохраняет свои рассчитанные сведения; второму не приписывается угаданный час. Образ по дате использует местную гражданскую дату со сменой суток в полночь. Вблизи полуночи он может отличаться от карты с поправкой на солнечное время и не заменяет восстановленную полную карту.",
          "Оба режима показывают балл в диапазоне 60–100, но объединяют разные сведения. Изменение числа после ввода проверенного времени не означает, что отношения улучшились или ухудшились. Веса — редакционный метод DestinyPixel, а не единый стандарт традиционной совместимости бацзы и не измеренная вероятность успешных отношений."
        ],
        "table": {
          "headings": [
            "Что сравнивается",
            "Оба времени известны",
            "Одно или оба времени неизвестны"
          ],
          "rows": [
            [
              "Доступные столпы бацзы",
              "Четыре у каждого.",
              "Отсутствующие часы и неопределённые год/месяц исключены."
            ],
            [
              "Связь элементов дня",
              "Элементы обоих Господинов дня; направление показано отдельно.",
              "Элементы гражданской даты; у человека с известным временем сохраняется рассчитанная карта."
            ],
            [
              "Расчёт балла",
              "Четыре равных измерения, каждое: 30% бацзы и 70% выбранного планетарного сравнения.",
              "50% связи элементов дня + 50% сходства долей доступных элементов. Без оценки планетарных аспектов."
            ],
            [
              "Распределение элементов",
              "Четыре ствола и четыре основных элемента ветвей у каждого.",
              "Только доступные столпы; сравниваются доли, а не несопоставимые суммы."
            ],
            [
              "Небо и недостающие сведения",
              "Выбранные положения и связи планет; инструмент не рассчитывает Асцендент и дома.",
              "Возможные знаки при неизвестном времени определяются почасовыми выборками и показаны отдельно. Точные градусы, аспекты, Асцендент и дома не выводятся."
            ]
          ]
        },
        "sources": [
          {
            "label": "Неизвестное время: границы суток и возможные знаки",
            "href": "/journal/compatibility-without-birth-time?locale=ru"
          },
          {
            "label": "Актуальные требования к данным и методы инструментов",
            "href": "/product-facts?locale=ru"
          }
        ]
      },
      {
        id: "read-together", title: "Три шага для совместного чтения результата",
        paragraphs: ["С согласия обоих укажите даты рождения по григорианскому календарю и выберите реальные города рождения из поддерживаемого списка. Известное местное время перенесите из записи; для человека без такого времени отдельно отметьте соответствующий вариант в форме. Город по-прежнему обязателен: он определяет границы местного дня. Не подставляйте полдень и не превращайте расплывчатое семейное воспоминание в точный час ради полного режима.", "Начните со связи элементов и её направления, затем проверьте ограничения исходных сведений и только после этого смотрите балл. Сначала появляется рассчитанное сравнение, затем отдельно загружается пояснение DeepSeek. Этот текст объясняет переданные производные данные карты; он не рассчитывает оценку, не восстанавливает время рождения и не подтверждает результат независимо. Если пояснение ИИ недоступно, сравнение элементов остаётся доступным."],
        steps: ["Проверьте обозначения: найдите элементы обоих Господинов дня и направление стрелки. Читайте карточки животных как авторские образы сайта.", "Выберите недавний эпизод: когда помощь ощущалась поддержкой, а ограничение раздражало? Пусть каждый сначала расскажет о своём опыте без объяснений из карты.", "Договоритесь о маленьком опыте: спрашивать перед советом, назначать время возвращения к разговору или иначе делить задачи. Затем оцените, что произошло на деле."],
        sources: [{ label: "Что можно узнать без времени рождения?", href: "/journal/compatibility-without-birth-time?locale=ru" }],
      },
      {
        id: "common-questions", title: "Ещё два вопроса о сочетаниях элементов",
        paragraphs: ["Одинаковый элемент автоматически означает хорошую пару? Нет. Общий образ может быть понятен обоим, но не доказывает одинаковые потребности и привычки. Два человека могут ценить независимость и всё же по-разному представлять частоту встреч. Спросите, что независимость означает для каждого в конкретной ситуации.", "Может ли партнёр восполнить недостающий элемент? Этот инструмент не позволяет сделать такой вывод. Простой подсчёт не оценивает силу Господина дня или полезные элементы; никакой результат не обязывает другого человека делать вас «целым». Сравнение полезнее как начало разговора о существующих отношениях, чем как поиск человека для заполнения пустого столбика."],
      },
    ],
    action: { label: "Сравнить элементы бацзы — время рождения необязательно", href: "/compatibility?locale=ru" },
  },
};

export const fiveElementsArticle: JournalSourceArticle = {
  slug: "five-elements-relationship-compatibility",
  relatedSlug: "bazi-vs-chinese-zodiac-compatibility",
  publishedAt: "2026-09-23",
  updatedAt: "2026-10-20",
  zhTwReplacements: [["配對錶", "配對表"], ["計數里", "計數裡"], ["小嚐試", "小嘗試"], ["錄入", "輸入"], ["信息", "資訊"]],
  translations: { en: editions.en, zh: editions.zh },
};
export const fiveElementsRussian = editions.ru;
