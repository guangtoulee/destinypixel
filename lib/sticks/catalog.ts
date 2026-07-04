import type { ReportLocale } from "@/lib/report-i18n";

export type StickType = "guanyin" | "guandi" | "yuelao" | "wealth" | "huangdaxian";

export type StickSign = {
  type: StickType;
  number: number;
  total: number;
  level: string;
  title: string;
  poem: string;
  plain: string;
  advice: string;
  sourceNote: string;
  isSeeded: boolean;
};

export const stickTypeOrder: StickType[] = [
  "guanyin",
  "guandi",
  "yuelao",
  "wealth",
  "huangdaxian",
];

export const stickTypeTotals: Record<StickType, number> = {
  guanyin: 100,
  guandi: 100,
  yuelao: 60,
  wealth: 60,
  huangdaxian: 100,
};

type LocalizedSeed = Record<
  ReportLocale,
  {
    level: string;
    title: string;
    poem: string;
    plain: string;
    advice: string;
    sourceNote: string;
  }
>;

const seeds: Partial<Record<StickType, Record<number, LocalizedSeed>>> = {
  guanyin: {
    33: {
      zh: {
        level: "中签",
        title: "石中藏玉",
        poem:
          "石藏无价玉和珍，只管他乡外客寻。宛如持灯更觅火，不如收拾枉劳心。",
        plain:
          "这支签的核心不是“没有宝”，而是宝物就在近处，只是你把注意力放到了远方。若问合作、感情或事业，先检查自己已经拥有的资源、关系和方案，不要舍近求远。",
        advice:
          "先暂停盲目外求。把现有线索重新整理一遍，尤其是身边的人、已有方案和被你忽略的旧资源。",
        sourceNote: "观音灵签第 33 签常见传统签诗；不同庙本可能有细微字句差异。",
      },
      en: {
        level: "Middle",
        title: "Jade Hidden In Stone",
        poem:
          "Precious jade is hidden in the stone; the seeker keeps searching far away. Carrying a lamp while looking for fire only wastes the heart.",
        plain:
          "The sign does not say the treasure is absent. It says the useful answer is already near you, but your attention is looking too far away.",
        advice:
          "Stop expanding the search for a moment. Re-check existing contacts, old plans, and resources you already control.",
        sourceNote:
          "Traditional Guanyin Stick 33 theme; wording varies across temple editions.",
      },
      ru: {
        level: "Средний",
        title: "Нефрит скрыт в камне",
        poem:
          "Драгоценный нефрит спрятан в камне; ищущий смотрит вдаль. Нести фонарь и искать огонь — пустая трата сердца.",
        plain:
          "Знак не говорит, что ценности нет. Он говорит, что ответ ближе, чем кажется, а внимание уходит слишком далеко.",
        advice:
          "Остановите внешний поиск и заново проверьте старые связи, планы и ресурсы, которые уже у вас есть.",
        sourceNote:
          "Традиционная тема 33-го жребия Гуаньинь; формулировки отличаются по храмовым версиям.",
      },
    },
  },
  guandi: {
    33: {
      zh: {
        level: "中平",
        title: "庄子慕道",
        poem:
          "不分南北与西东，眼底昏昏耳似聋。熟读黄庭经一卷，不论贵贱与穷通。",
        plain:
          "这签不太鼓励立刻争胜。它更像提醒你：眼前局面混杂，判断力容易被名利、面子或急躁带偏。先回到原则，再谈推进。",
        advice:
          "事业与合作上先把规则、责任、底线写清楚。若对方只给情绪或口头承诺，不要急着投入资源。",
        sourceNote: "关帝灵签第 33 签“庄子慕道”传统签诗样本；庙本可能略有差异。",
      },
      en: {
        level: "Steady",
        title: "Zhuangzi Seeks The Way",
        poem:
          "North, south, east, and west become unclear; the eyes are dim and the ears seem blocked. Return to the inner classic before judging rank, gain, or loss.",
        plain:
          "This sign is not about rushing to win. It warns that the field is noisy and judgment can be bent by status, pride, or impatience.",
        advice:
          "Clarify rules, responsibility, and bottom lines before moving resources. Do not trust only verbal enthusiasm.",
        sourceNote:
          "Traditional Guandi Stick 33 theme; wording varies across temple editions.",
      },
      ru: {
        level: "Ровно",
        title: "Чжуан-цзы ищет путь",
        poem:
          "Север, юг, восток и запад смешались; глаза мутны, уши словно глухи. Вернись к внутреннему канону, прежде чем судить о выгоде.",
        plain:
          "Знак не поддерживает спешную победу. Поле шумное, а суждение легко искажают статус, гордость или нетерпение.",
        advice:
          "Перед вложением ресурсов проясните правила, ответственность и границы. Одного энтузиазма мало.",
        sourceNote:
          "Традиционная тема 33-го жребия Гуаньди; храмовые тексты могут отличаться.",
      },
    },
  },
  yuelao: {
    33: {
      zh: {
        level: "上吉",
        title: "可以托付",
        poem:
          "可以托六尺之孤，可以寄百里之命，临大节而不可夺也。君子人与？君子人也。",
        plain:
          "这支签重在“可信”。若问感情，不是只看心动，而是看对方能否在关键时刻守信、承担、稳定地站在你这边。",
        advice:
          "不要只问对方爱不爱，要观察对方是否可靠、是否愿意承担现实责任。能托付，才值得推进。",
        sourceNote: "月老灵签第 33 签常见引文；源出传统经典语句，庙本解法有差异。",
      },
      en: {
        level: "Good",
        title: "Worthy Of Trust",
        poem:
          "One may entrust an orphan to such a person, entrust a distant command, and not be moved from integrity at the critical moment.",
        plain:
          "For love, this sign is not just about attraction. It asks whether the person can be trusted when reality becomes inconvenient.",
        advice:
          "Watch reliability, responsibility, and consistency. Do not advance a relationship on chemistry alone.",
        sourceNote:
          "Traditional Yuelao Stick 33 theme from a classical saying; interpretations vary.",
      },
      ru: {
        level: "Хорошо",
        title: "Достоин доверия",
        poem:
          "Такому человеку можно доверить сироту и дальнее поручение; в важный момент его честность не отнять.",
        plain:
          "В любви знак говорит не только о влечении, а о доверии, ответственности и устойчивости в неудобной реальности.",
        advice:
          "Смотрите на надежность и готовность брать ответственность. Одной химии недостаточно.",
        sourceNote:
          "Традиционная тема 33-го жребия Юэлао из классического изречения; толкования различаются.",
      },
    },
  },
  huangdaxian: {
    33: {
      zh: {
        level: "中吉",
        title: "孔明借东风",
        poem:
          "万事俱备欠东风，机缘未至勿强攻。若得天时相助力，转危成势一帆通。",
        plain:
          "这签讲的是条件快齐了，但还差一个关键时机。你不是完全没机会，而是现在硬推容易消耗，等到外部条件配合时会顺很多。",
        advice:
          "先补齐准备，不要急着宣布胜负。等关键人、关键消息或关键窗口出现，再果断行动。",
        sourceNote:
          "黄大仙签第 33 签常见题名为“孔明借东风”；此处为基于传统题名整理的签意样本，全文仍建议后续按庙本校对。",
      },
      en: {
        level: "Good",
        title: "Zhuge Liang Borrows The East Wind",
        poem:
          "Everything is ready except the east wind. Do not attack before the timing arrives; with the right wind, danger turns into momentum.",
        plain:
          "The sign says the opportunity is real, but one key condition is not yet in place. Forcing it too early wastes energy.",
        advice:
          "Prepare quietly. Wait for the key person, message, or timing window, then move decisively.",
        sourceNote:
          "Common Wong Tai Sin Stick 33 title; text here is an internally normalized interpretation and should be temple-edition checked later.",
      },
      ru: {
        level: "Хорошо",
        title: "Чжугэ Лян занимает восточный ветер",
        poem:
          "Все готово, не хватает восточного ветра. Не атакуйте до срока; с верным ветром опасность станет движением.",
        plain:
          "Возможность реальна, но ключевое условие еще не сложилось. Если давить раньше времени, силы уйдут впустую.",
        advice:
          "Готовьтесь спокойно. Ждите нужного человека, сообщения или окна времени, затем действуйте решительно.",
        sourceNote:
          "Распространенное название 33-го жребия Вонг Тай Сина; текст нормализован внутри и требует сверки с храмовой версией.",
      },
    },
  },
  wealth: {
    33: {
      zh: {
        level: "中吉",
        title: "守库生财",
        poem:
          "财帛入门莫贪多，先收旧账再开河。若能守正分轻重，细水长流胜急波。",
        plain:
          "财神签第 33 签偏向稳财，不偏向暴利。它提醒你：钱不是没有机会，而是先要堵住漏洞、收回旧账、稳定现金流。",
        advice:
          "先做预算、回款、成本控制，再谈扩张。短期高回报的诱惑要谨慎，尤其不要借钱冒进。",
        sourceNote:
          "财神签没有唯一通行庙本，此为 DestinyPixel 财运签库的内部签文样本。",
      },
      en: {
        level: "Good",
        title: "Guard The Storehouse",
        poem:
          "Do not chase more money before old accounts are gathered. Guard the right order; a steady stream beats a violent wave.",
        plain:
          "This wealth sign favors cash-flow repair over fast profit. Opportunity exists, but leaks must be closed first.",
        advice:
          "Budget, collect receivables, reduce waste, and avoid borrowing for aggressive expansion.",
        sourceNote:
          "The wealth-stick system is not a single canonical temple set; this is DestinyPixel's internal wealth oracle text.",
      },
      ru: {
        level: "Хорошо",
        title: "Охранять кладовую",
        poem:
          "Не гонитесь за большим доходом, пока старые счета не собраны. Верный порядок и тихий поток лучше резкой волны.",
        plain:
          "Денежный знак поддерживает восстановление потока, а не риск ради быстрой прибыли. Сначала закройте утечки.",
        advice:
          "Составьте бюджет, соберите долги, уменьшите лишние расходы и не расширяйтесь на заемные деньги.",
        sourceNote:
          "Система денежных жребиев не имеет единого канонического храмового набора; это внутренний текст DestinyPixel.",
      },
    },
  },
};

const fallbackLevels: Record<ReportLocale, string[]> = {
  en: ["Great Blessing", "Good", "Steady", "Blocked", "Wait"],
  zh: ["上吉", "中吉", "中平", "小阻", "待时"],
  ru: ["Большая удача", "Хорошо", "Ровно", "Препятствие", "Ждать"],
};

const generatedThemes: Record<
  StickType,
  Record<
    ReportLocale,
    Array<{
      title: string;
      image: string;
      focus: string;
      warning: string;
      action: string;
    }>
  >
> = {
  guanyin: {
    zh: [
      { title: "莲开见路", image: "莲心初开，雾散桥明", focus: "困局里有柔和转机", warning: "急着求成反而伤和气", action: "先把关系和情绪安顿好" },
      { title: "瓶水润心", image: "净瓶一滴，枯枝回青", focus: "修复比争胜更重要", warning: "旧怨未清会拖慢进展", action: "主动释放一个不必要的执念" },
      { title: "云中有灯", image: "云深不见路，灯在近人家", focus: "答案来自身边提醒", warning: "远处承诺未必真实", action: "先问可信的人，再做决定" },
      { title: "渡口回舟", image: "渡口风平，回舟可安", focus: "暂停不是失败", warning: "硬过河容易失衡", action: "把风险降到可承受范围" },
      { title: "柳枝拂尘", image: "柳枝轻拂，尘埃自落", focus: "问题需要温和整理", warning: "越解释越乱", action: "用简单事实说话" },
      { title: "山门暂闭", image: "山门暂闭，香火未迟", focus: "时机还需等待", warning: "焦躁会误判他人态度", action: "等一个明确回应" },
      { title: "月照归途", image: "月照归途，旧影成路", focus: "旧资源可以再用", warning: "不要忽略已经积累的善缘", action: "回看过去三个月的线索" },
      { title: "雨后清泉", image: "雨过石阶，清泉自来", focus: "压力后会出现新空间", warning: "短期低落不代表结局", action: "先恢复体力和秩序" },
    ],
    en: [
      { title: "Lotus Opens", image: "The lotus opens and a quiet bridge appears.", focus: "A gentle opening exists inside the difficulty.", warning: "Pushing too hard can damage trust.", action: "Stabilize emotion and relationship before acting." },
      { title: "Water From The Vase", image: "One drop from the vase revives a dry branch.", focus: "Repair matters more than winning.", warning: "Unresolved resentment slows the matter.", action: "Release one unnecessary attachment." },
      { title: "Lamp In The Cloud", image: "The road is hidden, but a lamp is close by.", focus: "The answer comes from nearby guidance.", warning: "Distant promises may not be solid.", action: "Ask a reliable person before deciding." },
      { title: "Boat At The Crossing", image: "The ferry waits while the river settles.", focus: "Pause is not failure.", warning: "Forcing the crossing creates imbalance.", action: "Reduce risk to a manageable size." },
      { title: "Willow Clears Dust", image: "A willow branch clears dust without noise.", focus: "The matter needs gentle sorting.", warning: "Over-explaining makes it worse.", action: "Speak through simple facts." },
      { title: "Closed Mountain Gate", image: "The gate is closed, but incense is not late.", focus: "Timing still needs patience.", warning: "Anxiety can misread other people.", action: "Wait for one clear response." },
      { title: "Moonlit Return", image: "The moon lights a path made by old shadows.", focus: "Old resources can become useful again.", warning: "Do not neglect accumulated goodwill.", action: "Review the last three months of clues." },
      { title: "Spring After Rain", image: "After rain, clear water gathers on stone.", focus: "Space appears after pressure.", warning: "A low mood is not a final verdict.", action: "Restore body rhythm and order first." },
    ],
    ru: [
      { title: "Лотос раскрывается", image: "Лотос раскрыт, и тихий мост виден в тумане.", focus: "В трудности есть мягкий выход.", warning: "Слишком сильное давление разрушит доверие.", action: "Сначала успокойте эмоции и отношения." },
      { title: "Вода из сосуда", image: "Одна капля оживляет сухую ветвь.", focus: "Восстановление важнее победы.", warning: "Старая обида замедляет дело.", action: "Отпустите одну лишнюю привязанность." },
      { title: "Лампа в облаке", image: "Дорога скрыта, но свет рядом.", focus: "Ответ приходит от близкого источника.", warning: "Дальние обещания ненадежны.", action: "Спросите надежного человека." },
      { title: "Лодка у переправы", image: "Лодка ждет, пока река успокоится.", focus: "Пауза не является поражением.", warning: "Насилие над сроками нарушит равновесие.", action: "Снизьте риск до управляемого." },
      { title: "Ива сметает пыль", image: "Ива очищает пыль без шума.", focus: "Нужно мягко разобрать ситуацию.", warning: "Лишние объяснения запутают дело.", action: "Говорите простыми фактами." },
      { title: "Закрытые горные врата", image: "Врата закрыты, но благовоние не опоздало.", focus: "Сроки требуют терпения.", warning: "Тревога искажает чужие сигналы.", action: "Дождитесь ясного ответа." },
      { title: "Лунная дорога домой", image: "Луна освещает путь старых следов.", focus: "Старые ресурсы снова полезны.", warning: "Не игнорируйте прежнюю добрую связь.", action: "Пересмотрите подсказки последних месяцев." },
      { title: "Источник после дождя", image: "После дождя вода собирается на камне.", focus: "После давления появится пространство.", warning: "Упадок настроения не финал.", action: "Сначала восстановите ритм тела." },
    ],
  },
  guandi: {
    zh: [
      { title: "刀藏鞘中", image: "青龙入鞘，威在不发", focus: "力量要收住才有用", warning: "急于证明会伤局面", action: "先立规则，再动资源" },
      { title: "帐前点将", image: "帐前灯明，诸事列阵", focus: "需要明确责任分工", warning: "含糊承诺不可依赖", action: "把权责写成文字" },
      { title: "义路分明", image: "义路如线，偏一步即斜", focus: "原则比情面重要", warning: "人情债会拖累判断", action: "按底线筛选合作" },
      { title: "马前小阻", image: "战马欲行，石在蹄前", focus: "阻力具体且可处理", warning: "忽略小问题会成大患", action: "先处理最小的卡点" },
      { title: "关门审信", image: "关门审信，火烛照章", focus: "信息要核实", warning: "传言或口头承诺不够", action: "核对合同、数字和身份" },
      { title: "旌旗暂卷", image: "旗卷风低，军心须定", focus: "暂守比强攻更稳", warning: "面子会让你误判时机", action: "把损失控制在小范围" },
      { title: "夜读春秋", image: "夜读春秋，心中有秤", focus: "判断要回到公正", warning: "情绪站队会偏离事实", action: "让第三方或数据参与判断" },
      { title: "过关得令", image: "关上得令，方可出兵", focus: "等授权和条件齐备", warning: "越权行动风险高", action: "确认许可后再推进" },
    ],
    en: [
      { title: "Blade In The Sheath", image: "The blade rests; power is strongest before release.", focus: "Strength works only when restrained.", warning: "Proving yourself too early damages the field.", action: "Set rules before moving resources." },
      { title: "Command At The Tent", image: "The command lamp is lit and roles line up.", focus: "Responsibility must be assigned clearly.", warning: "Vague promises are weak ground.", action: "Put duties and authority in writing." },
      { title: "The Righteous Road", image: "The road of duty is a thin straight line.", focus: "Principle matters more than favor.", warning: "Personal debt clouds judgment.", action: "Filter cooperation through bottom lines." },
      { title: "Stone Before The Horse", image: "The horse wants to move, but a stone blocks the hoof.", focus: "The obstacle is specific and solvable.", warning: "Small issues become large if ignored.", action: "Fix the smallest stuck point first." },
      { title: "Closed Gate Review", image: "A candle checks the written order.", focus: "Information needs verification.", warning: "Rumor and verbal promise are not enough.", action: "Check contract, numbers, and identity." },
      { title: "Rolled Banner", image: "The banner is rolled while morale steadies.", focus: "Defense is steadier than attack.", warning: "Face-saving can misread timing.", action: "Limit possible loss." },
      { title: "Reading At Night", image: "The old text becomes a scale in the heart.", focus: "Judgment must return to fairness.", warning: "Emotional allegiance distorts facts.", action: "Use data or a third party." },
      { title: "Order At The Pass", image: "Only with an order may the pass open.", focus: "Wait for authorization and conditions.", warning: "Acting beyond authority is risky.", action: "Confirm permission before moving." },
    ],
    ru: [
      { title: "Клинок в ножнах", image: "Клинок спит; сила держится до нужного часа.", focus: "Сила полезна, когда сдержана.", warning: "Раннее доказательство себя повредит делу.", action: "Сначала установите правила." },
      { title: "Приказ у шатра", image: "Лампа у шатра освещает строй.", focus: "Ответственность нужна явно.", warning: "Туманные обещания ненадежны.", action: "Запишите роли и полномочия." },
      { title: "Дорога долга", image: "Путь долга тонок и прям.", focus: "Принцип важнее личной услуги.", warning: "Долг перед людьми мутит суждение.", action: "Проверяйте союз по границам." },
      { title: "Камень перед конем", image: "Конь готов, но камень у копыта.", focus: "Препятствие конкретно и решаемо.", warning: "Малое станет большим, если игнорировать.", action: "Исправьте самый малый узел." },
      { title: "Проверка у ворот", image: "Свеча освещает письменный приказ.", focus: "Информацию надо проверять.", warning: "Слухов и устных слов мало.", action: "Проверьте договор, цифры и личность." },
      { title: "Свернутое знамя", image: "Знамя свернуто, войско успокаивается.", focus: "Оборона сейчас устойчивее атаки.", warning: "Сохранение лица исказит срок.", action: "Ограничьте возможный ущерб." },
      { title: "Ночное чтение", image: "Старая книга становится весами сердца.", focus: "Судить надо честно.", warning: "Эмоциональная сторона искажает факты.", action: "Привлеките данные или третью сторону." },
      { title: "Приказ на перевале", image: "Перевал откроется после приказа.", focus: "Ждите полномочий и условий.", warning: "Самовольный шаг рискован.", action: "Подтвердите разрешение." },
    ],
  },
  yuelao: {
    zh: [
      { title: "红线初牵", image: "红线轻动，未可猛拉", focus: "缘分可动但需慢", warning: "催促会让对方退缩", action: "给关系一点自然空间" },
      { title: "花影隔墙", image: "花在墙外，香先入庭", focus: "暧昧有信号但未落地", warning: "想象多于事实", action: "用一次清楚沟通确认" },
      { title: "旧结可解", image: "旧结在手，慢拆不断", focus: "旧关系可修但需诚意", warning: "翻旧账会伤复合", action: "先承认自己的部分" },
      { title: "双燕试飞", image: "双燕试飞，风向未定", focus: "关系在试探期", warning: "过早定义容易失真", action: "观察行动是否稳定" },
      { title: "灯下问心", image: "灯下问心，真意自明", focus: "要先看清自己的需求", warning: "寂寞会伪装成爱", action: "分清喜欢、依赖和不甘心" },
      { title: "桥边相候", image: "桥边有人，迟早见面", focus: "缘分需要时间窗口", warning: "错过沟通时机会拉远距离", action: "主动但不逼迫地表达" },
      { title: "桃花带雨", image: "桃花带雨，美中有湿", focus: "情感浓但容易敏感", warning: "小事会放大成不安", action: "把猜测换成提问" },
      { title: "月圆有缺", image: "月圆亦缺，缺处成圆", focus: "关系不能求完美", warning: "挑剔会消耗温度", action: "保留一个可商量空间" },
    ],
    en: [
      { title: "First Red Thread", image: "The red thread moves, but should not be pulled hard.", focus: "Connection can grow slowly.", warning: "Pressure makes the other side withdraw.", action: "Give the bond natural space." },
      { title: "Flowers Beyond The Wall", image: "The flower is outside the wall; fragrance arrives first.", focus: "There is a signal, but not a form.", warning: "Imagination may exceed facts.", action: "Confirm through one clear conversation." },
      { title: "Old Knot Loosens", image: "An old knot can be opened slowly.", focus: "A past bond can repair with sincerity.", warning: "Old accusations hurt reunion.", action: "Own your part first." },
      { title: "Two Swallows Test The Wind", image: "Two swallows fly while the wind is undecided.", focus: "The bond is in testing phase.", warning: "Defining too early distorts it.", action: "Watch whether action stays consistent." },
      { title: "Heart Under A Lamp", image: "Under the lamp, true intention becomes visible.", focus: "Know your own need first.", warning: "Loneliness can pretend to be love.", action: "Separate affection, dependence, and pride." },
      { title: "Waiting By The Bridge", image: "Someone waits by the bridge; meeting needs time.", focus: "Timing matters for connection.", warning: "Missing a communication window widens distance.", action: "Express interest without pressure." },
      { title: "Peach Blossom In Rain", image: "The blossom is beautiful but wet with rain.", focus: "Feeling is rich but sensitive.", warning: "Small things become anxiety.", action: "Turn guessing into questions." },
      { title: "Moon With A Gap", image: "The full moon still has a hidden gap.", focus: "Relationship cannot be perfect.", warning: "Criticism drains warmth.", action: "Leave room for negotiation." },
    ],
    ru: [
      { title: "Первая красная нить", image: "Нить двинулась, но ее нельзя тянуть резко.", focus: "Связь может расти медленно.", warning: "Давление оттолкнет другого.", action: "Дайте связи естественное пространство." },
      { title: "Цветы за стеной", image: "Цветок за стеной, аромат уже в саду.", focus: "Есть сигнал, но нет формы.", warning: "Воображение сильнее фактов.", action: "Подтвердите одним ясным разговором." },
      { title: "Старый узел", image: "Старый узел развязывают медленно.", focus: "Прошлую связь можно чинить искренне.", warning: "Старые обвинения вредят возвращению.", action: "Сначала признайте свою часть." },
      { title: "Две ласточки", image: "Две ласточки пробуют ветер.", focus: "Связь проходит испытание.", warning: "Раннее определение исказит ее.", action: "Смотрите на устойчивость действий." },
      { title: "Сердце под лампой", image: "Под лампой видно настоящее намерение.", focus: "Сначала поймите свою потребность.", warning: "Одиночество маскируется любовью.", action: "Разделите чувство, зависимость и гордость." },
      { title: "У моста", image: "У моста кто-то ждет; встрече нужно время.", focus: "Время важно для связи.", warning: "Пропуск разговора увеличит дистанцию.", action: "Проявитесь без давления." },
      { title: "Персик под дождем", image: "Цветок красив, но мокр от дождя.", focus: "Чувство богато, но чувствительно.", warning: "Малое станет тревогой.", action: "Меняйте догадки на вопросы." },
      { title: "Луна с пробелом", image: "Полная луна тоже имеет тень.", focus: "В отношениях нет совершенства.", warning: "Критика забирает тепло.", action: "Оставьте место для разговора." },
    ],
  },
  wealth: {
    zh: [
      { title: "财入正门", image: "正门有光，偏门有雾", focus: "正财路径更稳", warning: "偏财诱惑大但不实", action: "先做预算和回款" },
      { title: "仓廪渐满", image: "米入仓中，日积月盈", focus: "慢钱优于快钱", warning: "急投容易漏财", action: "把现金流排清楚" },
      { title: "水路通财", image: "水路初通，船不可满", focus: "流动性开始改善", warning: "摊子铺太大会沉", action: "小规模试水" },
      { title: "金印在匣", image: "金印在匣，待人启封", focus: "专业资质能生财", warning: "空想不如技能变现", action: "提升可收费能力" },
      { title: "算盘归位", image: "算盘归位，盈亏自明", focus: "账目清楚才有财", warning: "模糊成本会吞利润", action: "重新核算成本" },
      { title: "市口观风", image: "市口观风，人声未定", focus: "市场还在试探", warning: "追热点会被套", action: "先看需求真假" },
      { title: "贵人递账", image: "贵人递账，数字需明", focus: "合作可带财", warning: "亲友合作更要清楚", action: "分账规则提前定" },
      { title: "火炼真金", image: "火炼真金，杂质自分", focus: "压力会筛出真钱路", warning: "不能承压的项目该砍", action: "保留高质量收入源" },
    ],
    en: [
      { title: "Money Through The Main Gate", image: "The main gate is bright; side doors are misty.", focus: "Regular income is steadier.", warning: "Side profit may seduce but lack substance.", action: "Start with budget and receivables." },
      { title: "Storehouse Filling", image: "Grain enters the storehouse day by day.", focus: "Slow money beats fast money.", warning: "Rushed investment leaks wealth.", action: "Map your cash flow clearly." },
      { title: "Waterway Opens", image: "The waterway opens; the boat must not be overloaded.", focus: "Liquidity starts improving.", warning: "Over-expansion can sink the plan.", action: "Test on a small scale." },
      { title: "Seal In The Box", image: "A golden seal waits in its box.", focus: "Skill and credentials create money.", warning: "Fantasy cannot replace monetizable ability.", action: "Build something you can charge for." },
      { title: "Abacus Returns", image: "The abacus returns; profit and loss become clear.", focus: "Clear accounts protect wealth.", warning: "Vague costs swallow profit.", action: "Recalculate costs." },
      { title: "Watching The Market Wind", image: "At the marketplace, voices are not settled.", focus: "The market is still testing.", warning: "Chasing heat can trap you.", action: "Verify real demand first." },
      { title: "Account From A Helper", image: "A helper brings an account; numbers need clarity.", focus: "Cooperation can bring money.", warning: "Friends and family require clearer rules.", action: "Set split rules early." },
      { title: "Gold In Fire", image: "Fire tests real gold and separates impurity.", focus: "Pressure reveals true income paths.", warning: "Weak projects should be cut.", action: "Keep high-quality revenue sources." },
    ],
    ru: [
      { title: "Деньги через главные ворота", image: "Главные ворота светлы, боковые в тумане.", focus: "Основной доход устойчивее.", warning: "Быстрый доход может быть пустым.", action: "Начните с бюджета и оплат." },
      { title: "Кладовая наполняется", image: "Зерно входит в амбар день за днем.", focus: "Медленные деньги лучше быстрых.", warning: "Спешные вложения уводят деньги.", action: "Ясно распишите поток." },
      { title: "Водный путь открыт", image: "Путь воды открыт, лодку нельзя перегружать.", focus: "Ликвидность улучшается.", warning: "Слишком большой план утонет.", action: "Пробуйте малым объемом." },
      { title: "Печать в коробке", image: "Золотая печать ждет в ящике.", focus: "Навык и статус дают деньги.", warning: "Фантазии не заменят монетизацию.", action: "Развивайте то, за что платят." },
      { title: "Счеты на месте", image: "Счеты вернулись, прибыль и убыток видны.", focus: "Ясные счета берегут деньги.", warning: "Неясные расходы съедят прибыль.", action: "Пересчитайте затраты." },
      { title: "Ветер рынка", image: "На рынке голоса еще не установились.", focus: "Рынок только проверяет спрос.", warning: "Гонка за шумом ловит в ловушку.", action: "Проверьте реальный спрос." },
      { title: "Счет от помощника", image: "Помощник принес счет, цифры должны быть ясны.", focus: "Сотрудничество может дать доход.", warning: "С близкими нужны четкие правила.", action: "Договоритесь о долях заранее." },
      { title: "Золото в огне", image: "Огонь отделяет золото от примеси.", focus: "Давление показывает настоящий доход.", warning: "Слабые проекты надо резать.", action: "Оставьте качественные источники дохода." },
    ],
  },
  huangdaxian: {
    zh: [
      { title: "东风未至", image: "万事俱备，风在远山", focus: "条件将成但时机未到", warning: "提前行动会折损优势", action: "等关键窗口再动" },
      { title: "竹影移阶", image: "竹影移阶，午后方明", focus: "趋势正在慢慢转向", warning: "一时消息不可全信", action: "观察三次重复信号" },
      { title: "市桥逢雨", image: "市桥逢雨，行人暂避", focus: "出行或推进有小阻", warning: "临时变化会打乱节奏", action: "准备备用方案" },
      { title: "榜前静候", image: "榜前静候，姓名未显", focus: "考试竞争需等结果", warning: "焦虑不能提高胜算", action: "把能补的材料补齐" },
      { title: "云开一线", image: "云开一线，日色将生", focus: "转机开始露头", warning: "机会还很细，不能重押", action: "先做轻量试探" },
      { title: "客路回音", image: "客路回音，消息迟来", focus: "远方消息会延迟", warning: "误会来自信息不全", action: "主动确认时间表" },
      { title: "棋到中盘", image: "棋到中盘，胜负未分", focus: "事情进入关键中段", warning: "现在松懈会被反超", action: "稳住主线，不贪旁枝" },
      { title: "灯火过街", image: "灯火过街，前路可辨", focus: "有人会给出方向", warning: "只听好话会误事", action: "接受刺耳但真实的建议" },
    ],
    en: [
      { title: "East Wind Not Yet", image: "All is prepared, but the wind is still beyond the hills.", focus: "Conditions are forming, but timing is not ripe.", warning: "Acting too early weakens advantage.", action: "Move when the key window opens." },
      { title: "Bamboo Shadow Moves", image: "The bamboo shadow shifts; clarity comes later.", focus: "The trend is slowly turning.", warning: "One message is not enough.", action: "Watch for three repeated signals." },
      { title: "Rain At The Market Bridge", image: "Rain falls at the bridge and travelers pause.", focus: "Movement has small obstruction.", warning: "Sudden change can disturb rhythm.", action: "Prepare a backup plan." },
      { title: "Waiting Before The List", image: "The result board is quiet; the name is not shown yet.", focus: "Competition needs patience.", warning: "Anxiety does not raise odds.", action: "Complete what can still be improved." },
      { title: "A Line In The Clouds", image: "The cloud opens and the sun is almost born.", focus: "A turning point begins to show.", warning: "The opening is still thin.", action: "Test lightly before committing." },
      { title: "Echo On A Distant Road", image: "The far road replies late.", focus: "News from afar is delayed.", warning: "Incomplete information causes misunderstanding.", action: "Confirm the timeline." },
      { title: "Middle Game", image: "The chess game reaches the middle; outcome is not fixed.", focus: "The matter is in its critical middle phase.", warning: "Relaxing now loses ground.", action: "Hold the main line." },
      { title: "Lamp Across The Street", image: "A lamp crosses the street and the road becomes visible.", focus: "Someone may provide direction.", warning: "Only hearing pleasant words misleads.", action: "Accept useful hard advice." },
    ],
    ru: [
      { title: "Восточный ветер не пришел", image: "Все готово, но ветер еще за горами.", focus: "Условия складываются, но срок не созрел.", warning: "Ранний шаг ослабит преимущество.", action: "Двигайтесь в нужное окно." },
      { title: "Тень бамбука", image: "Тень бамбука движется; ясность позже.", focus: "Тренд медленно меняется.", warning: "Одного сообщения мало.", action: "Ждите три повторных сигнала." },
      { title: "Дождь у моста", image: "На мосту дождь, путники ждут.", focus: "Движению мешает малое препятствие.", warning: "Внезапность собьет ритм.", action: "Готовьте запасной план." },
      { title: "Перед списком", image: "Доска результатов молчит.", focus: "Конкуренция требует терпения.", warning: "Тревога не повышает шансы.", action: "Доделайте то, что можно улучшить." },
      { title: "Просвет в облаках", image: "Облако раскрыто, солнце близко.", focus: "Поворот начинает проявляться.", warning: "Окно еще тонкое.", action: "Пробуйте легко." },
      { title: "Эхо дальней дороги", image: "Дальняя дорога отвечает поздно.", focus: "Вести издалека задержатся.", warning: "Неполные сведения рождают ошибку.", action: "Подтвердите сроки." },
      { title: "Середина партии", image: "Игра в середине, победа не решена.", focus: "Дело в критической середине.", warning: "Расслабление отдаст позицию.", action: "Держите основную линию." },
      { title: "Лампа через улицу", image: "Лампа освещает дорогу.", focus: "Кто-то даст направление.", warning: "Только приятные слова вредят.", action: "Примите жесткий полезный совет." },
    ],
  },
};

function generatedSignText(type: StickType, number: number, locale: ReportLocale) {
  const themes = generatedThemes[type][locale];
  const theme = themes[(number - 1) % themes.length];
  const level = fallbackLevels[locale][(number + themes.length) % fallbackLevels[locale].length];
  const phase = Math.floor((number - 1) / themes.length) + 1;

  if (locale === "zh") {
    return {
      level,
      title: `${theme.title} · 第 ${number} 签`,
      poem: `${theme.image}。先看${theme.focus}，再防${theme.warning}。若能${theme.action}，此事便有转圜。`,
      plain: `${theme.focus}。这支签不主张只看表面吉凶，而是提醒你把当下处境拆成条件、时机、对方态度和自己的承受力。第 ${phase} 层象意更偏向“先稳后动”：先把可控部分收紧，再决定是否扩大行动。`,
      advice: `${theme.action}。同时留意：${theme.warning}。如果你问的是具体人或具体合作，先看对方是否给出清楚行动，而不是只听态度。`,
      sourceNote: "DestinyPixel 全号段整理签意；传统逐字签诗会继续校对后替换为正式庙本。",
    };
  }

  if (locale === "ru") {
    return {
      level,
      title: `${theme.title} · Stick ${number}`,
      poem: `${theme.image} First see: ${theme.focus}. Then guard against: ${theme.warning}. If you can ${theme.action.toLowerCase()}, the matter has room to turn.`,
      plain: `${theme.focus}. This sign is less about simple luck and more about separating conditions, timing, the other side's behavior, and your own capacity. Layer ${phase} of the sign leans toward stabilizing first, then acting.`,
      advice: `${theme.action}. Also watch this risk: ${theme.warning}. If the question involves a person or cooperation, trust clear action more than attitude.`,
      sourceNote:
        "DestinyPixel full-number normalized sign text; exact temple verses will continue to be manually verified and replaced.",
    };
  }

  return {
    level,
    title: `${theme.title} · Stick ${number}`,
    poem: `${theme.image} First see: ${theme.focus}. Then guard against: ${theme.warning}. If you can ${theme.action.toLowerCase()}, the matter has room to turn.`,
    plain: `${theme.focus}. This sign is less about simple luck and more about separating conditions, timing, the other side's behavior, and your own capacity. Layer ${phase} of the sign leans toward stabilizing first, then acting.`,
    advice: `${theme.action}. Also watch this risk: ${theme.warning}. If the question involves a person or cooperation, trust clear action more than attitude.`,
    sourceNote:
      "DestinyPixel full-number normalized sign text; exact temple verses will continue to be manually verified and replaced.",
  };
}

function fallbackText(type: StickType, number: number, locale: ReportLocale) {
  return generatedSignText(type, number, locale);
}

export function getStickSign(
  type: StickType,
  number: number,
  locale: ReportLocale,
): StickSign {
  const total = stickTypeTotals[type];
  const safeNumber = Math.min(Math.max(Math.round(number), 1), total);
  const seeded = seeds[type]?.[safeNumber]?.[locale];
  const sign = seeded ?? fallbackText(type, safeNumber, locale);

  return {
    type,
    number: safeNumber,
    total,
    ...sign,
    isSeeded: Boolean(seeded),
  };
}
