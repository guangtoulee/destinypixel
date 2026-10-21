import type { JournalSourceArticle } from "@/lib/journal";

const stems = "https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm";
const museum = "https://www.chnmuseum.cn/zp/zpml/kgfjp/202111/t20211116_252286.shtml";
const calendar = "https://www.hko.gov.hk/tc/gts/time/calendar/pdf/files/2027.pdf";
const boundary = "https://www.hko.gov.hk/tc/education/astronomy-and-time/time-service/00506-what-year-is-it-today.html";
const sanming = "https://zh.wikisource.org/wiki/三命通會/卷二";
const xing = "https://www.shidianguji.com/zh/book/SK1610/chapter/1kf5v6ol1zcpx";
const liuren = "https://zh.wikisource.org/wiki/六壬大全/1";

/** Only the English and Simplified Chinese editions are authored for this release. */
export const taiSuiArticle: JournalSourceArticle = {
  slug: "ben-ming-nian-tai-sui",
  relatedSlug: "bazi-vs-chinese-zodiac-compatibility",
  publishedAt: "2026-10-21",
  updatedAt: "2026-10-21",
  image: { src: "/journal/tai-sui/relations-2027-en.svg", width: 640, height: 1260 },
  translations: {
    zh: {
      title: "本命年一定不好吗？把值、冲、刑、害、破太岁讲清楚",
      description: "本命年不等于全年倒霉。用原创图解和对照表，读懂生肖、四柱、大运与流年的关系，核对2027丁未年的值、冲、刑、害、破及流派差异。",
      topic: "生肖、太岁与八字",
      answer: "不一定。本命年只表示出生年的生肖地支与当年的地支相同，不能凭这一项判定一整年的好坏。",
      introduction: "同一年出生的人那么多，总不能生肖一轮到，大家就集体进入困难模式。升职的、搬家的、照常上班的，都可能属同一个生肖。问题不在于你够不够小心，而在于我们是不是让一个生肖标签，承担了它回答不了的问题。",
      openingParagraphs: ["“本命年”“犯太岁”“冲太岁”常被一起提起，却不完全是一回事。先把名词、年界和判断范围分清楚，再来谈传统命理怎样看一年。你可以保留喜欢的民俗，也可以把红袜子穿得很开心；都不必先接受一份全年倒霉通知书。"],
      takeaway: "生肖是年支，不是完整年柱，更不是完整八字。2027丁未年常见对照为羊值、牛冲、鼠害、狗破；丑未戌刑另有条件和口径，标签会重叠，不能相加成灾难分数。",
      sections: [
        {
          id: "animal-and-pillars",
          title: "1. 生肖是年支，连完整年柱都还不是",
          paragraphs: [
            "十二生肖与十二地支对应：例如未对应羊，丑对应牛。年柱则由一个天干加一个地支组成，所以丁未中的“丁”和“未”都属于年柱，生肖羊只取其中的“未”。同属羊，可能是乙未、丁未、己未、辛未或癸未，不等于同一个年柱。",
            "四柱是年、月、日、时四组干支，共八个字；传统子平命理通常以日干作为“日主”来组织关系。年生肖提供的信息范围很窄，不能替代月令、日主及其余干支。也不宜把“年柱占多少”写成固定百分比：判断不是把八个字平均切成八块，再给生肖分一块蛋糕。"
          ],
          figures: [{ src: "/journal/tai-sui/chart-context-zh.svg", width: 640, height: 1180, alt: "原创结构图：生肖是年柱的地支；年、月、日、时构成原局，日干为日主；原局与大运、流年合看。", caption: "DestinyPixel 原创教学图。展示信息层级，不代表各项权重，也不是一张个人命盘。", afterParagraph: 1 }],
          sources: [{ label: "中国国家博物馆：十二生肖陶俑与地支对应", href: museum }, { label: "香港天文台：天干地支、六十组合与八字", href: stems }]
        },
        {
          id: "whole-chart",
          title: "2. 原局、大运、流年，传统上怎样一起看？",
          paragraphs: [
            "原局是出生时的四柱结构。传统解读会围绕日主，看出生季节、干支之间的生克合冲、藏干等关系，再讨论旺衰、格局和喜忌；不同流派的取法并不完全一致。大运是依其规则排出的阶段性干支，通常以约十年为一阶段，起运年龄与顺逆另有排法；流年则是当年的干支。它们不是三张各自宣判的成绩单。",
            "可以用一个现代比喻帮助理解：原局像一套已有的舞台布置，大运像这一幕的大环境，流年像当年走进场景的新角色。要看彼此怎样发生关系，而不是只看新角色名字里有没有一个“冲”。这只是教学比喻，不是古籍公式，也不证明命运真由这套模型决定。",
            "《三命通会》卷二把大运、日主与太岁放在一起讨论，连干支再遇，也并非只写成同一种结果。引用原典，是说明传统内部本就有合看的思路；其中的吉凶断语属于历史命理观念，不是经科学验证的预测。本文不采用“年柱固定占一小部分、流年固定占另一部分”的权重，也不给一个生肖推导完整个人结论。"
          ],
          sources: [{ label: "《三命通会》卷二：论大运、论太岁、总论岁运（公开文本）", href: sanming }]
        },
        {
          id: "five-terms",
          title: "3. 值、冲、刑、害、破：五个词不是五张罚单",
          paragraphs: [
            "日常所说的“犯太岁”，常把出生年支与流年支的若干关系收在一个大标题下。它与完整命理文本中的太岁论法并不等同。下表解释的是常见生肖层面的用语；“刑”“害”“破”是传统术语，不是司法判决、伤害预告或财物损坏通知。"
          ],
          table: { headings: ["说法", "常见含义", "阅读时留意"], rows: [
            ["值太岁", "出生年支与流年支相同，通常称本命年。", "同支不等于完整干支相同；更不自动等于凶。"],
            ["冲太岁", "年支与流年支构成六冲，如丑未冲。", "传统有变动、对立等象义，不能直接指定失业或分手。"],
            ["刑太岁", "涉及相刑关系，包括特定组合与常见自刑说法。", "须说明是哪组、哪些支、什么条件，不能一律套同一强度。"],
            ["害太岁", "年支与流年支构成六害，如子未害。", "常被用于讨论牵制或不协调，不是有人必然害你。"],
            ["破太岁", "按所用支破体系形成相破，如未戌破。", "有调整、离散等传统象义，各体系重视程度不同。"]
          ] },
          sources: [{ label: "《三命通会》卷二：六害、三刑、冲击", href: sanming }, { label: "《六壬大全》卷一：破、害、刑、冲（相邻术数体系的用例）", href: liuren }]
        },
        {
          id: "2027-table",
          title: "4. 2027丁未年：到底涉及哪些生肖？",
          paragraphs: [
            "把流年支固定为“未”，再逐项查关系，就比背一句“今年有几个生肖犯太岁”可靠。下表采用常见的生肖对照口径；刑这一行特意保留条件，不把不同派别压成唯一答案。"
          ],
          figures: [{ src: "/journal/tai-sui/relations-2027-zh.svg", width: 640, height: 1260, alt: "2027丁未关系图：未羊值，丑牛冲，子鼠害，戌狗破；丑牛、未羊、戌狗另涉及三刑组，须看条件与流派。", caption: "DestinyPixel 原创关系示意。连线是术语对照，不是风险大小或发生概率。", afterParagraph: 0 }],
          table: { headings: ["关系", "2027生肖／地支", "重叠与限定"], rows: [
            ["值", "羊／未", "未遇未是同支；不能因此写成未未自刑。"],
            ["冲", "牛／丑", "丑未六冲；牛也可能列入下方三刑讨论。"],
            ["刑", "丑牛、未羊、戌狗这一组", "牛、狗常被生肖表另列为刑的相关生肖；是否两支即论、三支齐全成局及作用方向，需交代所用口径。"],
            ["害", "鼠／子", "子未六害。"],
            ["破", "狗／戌", "未戌相破；狗也涉及三刑组的讨论。"]
          ] },
          sources: [{ label: "香港天文台：2027丁未肖羊年公农历对照表", href: calendar }, { label: "《三命通会》卷二：核对丑未冲、子未害", href: sanming }, { label: "《六壬大全》卷一：“破”条的未戌对应", href: liuren }]
        },
        {
          id: "xing-differences",
          title: "5. 丑未戌三刑，为什么值得多说两句？",
          paragraphs: [
            "《三命通会·论三刑》列出丑刑戌、戌刑未、未刑丑，并讨论组合和其他干支条件；它也明确提醒：“凡见刑，不可便以凶论。”实际解读中，有的口径会讨论两支之间的刑，有的更重视三支齐全及岁运引动。若只知道一个出生生肖，就不能假定其余两支已经在个人四柱或大运里，更不能把所有这些说法都宣称为各派共识。",
            "争议不是现代人临时加的补丁。同篇记录的分类名称就有差异；相邻的六壬传统文本，还对“未刑丑”的解释提出不同意见。六壬与八字不是同一套完整推演法，引用它是让读者看见文献差异，而不是拿它替所有八字流派拍板。",
            "另一个容易混淆的点：常见自刑列的是辰、午、酉、亥，即龙、马、鸡、猪；未羊不在这组里。所以2027属羊可以称值太岁，却不能顺手再贴一个“因为本命年，所以必然自刑”的标签。"
          ],
          sources: [{ label: "《三命通会·论三刑》：识典古籍完整篇章与条件说明", href: xing }, { label: "《六壬大全》卷一：“刑”条保留的不同解释", href: liuren }]
        },
        {
          id: "how-many",
          title: "6. 每年固定三四个生肖“犯太岁”吗？",
          paragraphs: [
            "不是固定名额。先要问统计包含哪些关系、怎样处理刑，再把重复生肖去掉。五种关系不等于五个不同生肖；一个生肖同时出现两个术语，也不是坏事概率翻倍。按上面的2027口径，常见涉及生肖去重后是羊、牛、鼠、狗；其中三刑如何列示，仍须带着上一节的限定一起读。",
            "换一年，流年支变了，关系组合和重叠也会变；有些列表只列值、冲，有些加入刑、害、破，有些又把其他神煞放进来。看到两个名单不同，先核对它们用了什么规则，而不是猜哪张表“漏报”了你的生肖。生肖表是入口，不是全年事件的点名册。"
          ]
        },
        {
          id: "year-boundary",
          title: "7. 春节换生肖，还是立春换年柱？先说明你在问什么",
          paragraphs: [
            "民俗过年和农历纪年，通常从春节、即正月初一谈起；香港天文台的官方农历编算以正月初一香港时间零时换年。八字排盘的常见约定则以立春交节瞬间换年柱，本站也采用这个约定。两条边界用途不同，不该悄悄混用。",
            "2027年的香港历表列立春为2月4日、正月初一为2月6日；前者是一个交节瞬间，显示到其他时区时应换算当地日期和时间，不能一律写成2月4日零点。本站2027手册从公历1月开始，因此1月及立春之前仍保留丙午年主线，过立春再进入丁未，并不把全年十二个月都硬塞进“羊年”。",
            "若生日就在年界附近，先确认原始出生日期、当地时间与出生地，再看采用哪种年界。并非把手机日历上的年份减一，就能解决所有边界问题。"
          ],
          sources: [{ label: "香港天文台：今夕是何年？说明正月初一与立春两种约定", href: boundary }, { label: "香港天文台：2027公农历及节气日期", href: calendar }]
        },
        {
          id: "use-it-well",
          title: "8. 把“今年要小心”换成一个能执行的问题",
          paragraphs: [
            "下面是原创假设案例，不是某位用户的命盘或古籍断例。小林属牛，原本就计划2027换工作。看到“冲”，不必马上撤回简历，也不必把每次面试不顺都记在太岁头上。可以把“变动”当作一个检查提示：新合同的试用期、现金缓冲和交接安排，哪些还没核对？这些核对对任何生肖都实用。",
            "另一位假设人物小周属羊，担心本命年会拖累感情。比起反复问“会不会分手”，更有用的是约一次不赶时间的谈话：今年双方最在意的生活安排是什么？生肖不能代替对方回答。这里的行动建议是现代编辑练习，不是从某个生肖推算出的必然事件。",
            "如果喜欢穿红、拜太岁或祈福，可以把它理解为自己珍视的文化实践；选择与否不应被恐惧绑架。你不需要购买化解套餐来获得安全感，也不必因为没有做某个仪式就责怪自己。现实中的健康、财务或关系问题，仍应依据事实采取行动并寻求合适帮助。"
          ]
        },
        {
          id: "next-reading",
          title: "9. 星级、个人手册和一盏平安灯，各自能给你什么？",
          paragraphs: [
            "2027生肖星级榜是公开说明依据的现代编辑评分，用来组织传统象义与日常提醒，可并列，不是统计概率、科学预测或个人八字结论；本命年也不默认排低。先看评分口径，再看哪条提醒值得留下。",
            "免费个人年度手册加入出生资料后，提供有限的八字与西方星盘参照，两套视角分别说明依据；当前八字部分不评估旺衰、喜用或大运，不等于本文所说的完整传统命理合看。未知出生时辰可以如实选择，不补成中午，不生成时柱；不稳定的边界项目会略去。全年阅读仍从1月开始，八字年柱按立春切换。",
            "也可以去太岁平安页，为自己点亮一盏灯，留下一句温暖祝愿。这是文化祝愿与自我安定的小仪式，不收集心愿，不保证消灾改运。读懂一个概念、整理一项计划、把呼吸放慢一点，都比先给自己判一年输赢更从容。"
          ],
          links: [{ text: "2027生肖星级榜", href: "/2027?locale=zh#zodiac-ranking" }, { text: "免费个人年度手册", href: "/2027?locale=zh#your-year" }, { text: "太岁平安页", href: "/taisui?locale=zh" }],
          sources: [{ label: "本站2027年度手册：方法、免费流程与边界", href: "/2027?locale=zh" }]
        }
      ],
      action: { label: "打开免费2027个人手册 · 出生时辰可未知", href: "/2027?locale=zh#your-year" }
    },
    en: {
      title: "Is Your Chinese Zodiac Year Unlucky? Tai Sui, Clashes and 2027 Explained",
      description: "Your zodiac year is not a sentence of bad luck. Explore Tai Sui terms, the 2027 Goat-year relationships, Four Pillars and calendar boundaries with original diagrams and tables.",
      topic: "Chinese zodiac, Tai Sui & BaZi",
      answer: "Not necessarily. Ben ming nian means your birth-year branch matches the year's branch. That single match cannot decide how your entire year will go.",
      introduction: "Millions of people share a birth-year animal. Surely they cannot all enter hard mode when its turn comes around. Some change jobs, some move house, and many simply continue their routines. The problem is not whether you have been careful enough. It is whether one zodiac label has been asked to answer a much larger question.",
      openingParagraphs: ["Ben ming nian, fan Tai Sui and clash with Tai Sui often appear together, but they are not interchangeable. Let's untangle the vocabulary, the calendar and the scope of a reading. You can enjoy a red bracelet or a family custom without first accepting a twelve-month bad-luck notice."],
      takeaway: "A zodiac animal identifies the year branch, not the whole year pillar or birth chart. For Ding-Wei 2027, common tables list Goat as matching, Ox as clashing, Rat as harming and Dog as breaking. The Ox–Goat–Dog xing group needs conditions and school-specific explanation; overlapping labels are not cumulative disaster points.",
      sections: [
        {
          id: "animal-and-pillars",
          title: "1. Your animal is the year branch—even the year pillar contains more",
          paragraphs: [
            "The twelve animals correspond to twelve Earthly Branches: Wei is Goat, Chou is Ox. A year pillar combines a Heavenly Stem with an Earthly Branch. In Ding-Wei, both Ding and Wei belong to the pillar; the animal tells you only Wei. Goat years can be Yi-Wei, Ding-Wei, Ji-Wei, Xin-Wei or Gui-Wei. Sharing the animal does not mean sharing the whole pillar.",
            "The Four Pillars pair stems and branches for the year, month, day and hour: eight characters in all. Traditional Zi Ping BaZi generally takes the day stem as its Day Master. A year animal is a narrow entry point, unable to replace the birth season, Day Master or other characters. There is no sound reason to turn that limitation into a fixed percentage. Reading a chart is not cutting eight equal slices of cake and handing the zodiac one slice."
          ],
          figures: [{ src: "/journal/tai-sui/chart-context-en.svg", width: 640, height: 1180, alt: "Original diagram: the zodiac animal is the branch within the year pillar; year, month, day and hour form the natal structure, with the day stem as Day Master; natal structure, major phases and annual pillar are read together.", caption: "Original DestinyPixel teaching diagram. It shows levels of information, not numerical weights or a personal chart.", afterParagraph: 1 }],
          sources: [{ label: "National Museum of China: zodiac figurines and the twelve branches", href: museum }, { label: "Hong Kong Observatory: stems, branches and the Eight Characters", href: stems }]
        },
        {
          id: "whole-chart",
          title: "2. Natal structure, major phases and the year: a joint reading",
          paragraphs: [
            "The natal structure is the Four Pillars at birth. Traditional readers consider the Day Master, season, relationships among stems and branches, hidden stems and other features before discussing strength, chart patterns and favourable or unfavourable influences. Schools differ in their methods. Da yun refers to traditionally derived major stem-branch phases, usually about ten years each; starting age and direction have their own conventions. Liu nian is the annual stem-branch pillar. These are not three independent report cards.",
            "Here is a modern teaching metaphor: the natal structure is an existing stage set, a major phase is the wider setting of an act, and the annual pillar is a character entering the scene. The question is how they interact, not whether the newcomer has the word 'clash' on a badge. This metaphor is ours, not an ancient formula or evidence that the model controls events.",
            "Volume Two of San Ming Tong Hui discusses major phases, the Day Master and Tai Sui together, with differing outcomes even when a stem-branch combination recurs. The source documents a traditional approach; its fortune statements are historical beliefs, not scientifically validated predictions. This article assigns no fixed percentages to year pillars or annual influences, and it does not derive a complete personal judgment from an animal."
          ],
          sources: [{ label: "San Ming Tong Hui, Volume Two: major phases, Tai Sui and annual interactions (Chinese text)", href: sanming }]
        },
        {
          id: "five-terms",
          title: "3. Five Tai Sui terms do not mean five penalty notices",
          paragraphs: [
            "In everyday zodiac guides, fan Tai Sui often serves as an umbrella for certain relationships between a birth-year branch and the annual branch. That shorthand is less extensive than a full traditional discussion of Tai Sui. The table explains the common animal-based vocabulary. The English words 'punishment', 'harm' and 'break' name symbolic categories; they do not announce a court case, an injury or a broken possession."
          ],
          table: { headings: ["Term", "Common meaning", "What to check"], rows: [
            ["Zhi · same branch", "The birth-year branch repeats in the year; commonly called ben ming nian.", "Matching branches need not mean matching whole pillars, or an adverse year."],
            ["Chong · clash", "One of the six opposing branch pairs, such as Chou–Wei.", "Traditional movement or opposition imagery cannot specify a job loss or breakup."],
            ["Xing · punishment", "A particular xing relationship or group, including specified self-xing cases.", "Name the group and conditions; readings do not all assign the same significance."],
            ["Hai · harm", "One of the six hai pairs, such as Zi–Wei.", "Symbolic friction is not proof that someone intends to harm you."],
            ["Po · break", "A branch-breaking relationship under the chosen scheme, such as Wei–Xu.", "Different systems give this category different emphasis."]
          ] },
          sources: [{ label: "San Ming Tong Hui, Volume Two: hai, xing and chong", href: sanming }, { label: "Liu Ren Da Quan, Volume One: po, hai, xing and chong in a related divination tradition", href: liuren }]
        },
        {
          id: "2027-table",
          title: "4. Which animals are involved in Ding-Wei 2027?",
          paragraphs: [
            "Start with Wei, the year's branch, and check each relationship. That is more informative than memorising a claim that a fixed number of animals 'offend Tai Sui'. This table follows a common zodiac-guide convention. The xing row keeps its qualifications visible rather than presenting one school's practice as universal."
          ],
          figures: [{ src: "/journal/tai-sui/relations-2027-en.svg", width: 640, height: 1260, alt: "2027 Ding-Wei relationship diagram: Goat–Wei matches, Ox–Chou clashes, Rat–Zi harms and Dog–Xu breaks; Ox, Goat and Dog also form the xing group, subject to conditions and differing school interpretations.", caption: "Original DestinyPixel relationship diagram. Connections identify terminology, not risk levels or probabilities.", afterParagraph: 0 }],
          table: { headings: ["Relationship", "2027 animal / branch", "Overlap and limits"], rows: [
            ["Same branch", "Goat / Wei", "Wei meets Wei. This alone does not make it self-xing."],
            ["Clash", "Ox / Chou", "Chou–Wei is a clash pair. Ox can also appear in the xing discussion."],
            ["Xing", "Ox–Chou, Goat–Wei, Dog–Xu group", "Ox and Dog are often separately listed in animal guides. State whether a reading uses a pair, requires all three, or considers a particular direction and context."],
            ["Harm", "Rat / Zi", "Zi–Wei is a hai pair."],
            ["Break", "Dog / Xu", "Wei–Xu is a po pair. Dog also belongs to the xing group."]
          ] },
          sources: [{ label: "Hong Kong Observatory: 2027 Ding-Wei, Year of the Goat calendar", href: calendar }, { label: "San Ming Tong Hui, Volume Two: Chou–Wei and Zi–Wei", href: sanming }, { label: "Liu Ren Da Quan, Volume One: the po entry includes Wei–Xu", href: liuren }]
        },
        {
          id: "xing-differences",
          title: "5. Why the Ox–Goat–Dog xing group needs a footnote",
          paragraphs: [
            "The xing chapter of San Ming Tong Hui lists Chou xing Xu, Xu xing Wei and Wei xing Chou, then discusses combinations and other chart conditions. It explicitly cautions against treating the appearance of xing as automatically adverse. Some readings discuss pairs; others emphasise the full three-branch group and its activation through phases or years. Knowing someone's year animal does not establish that the other branches occur in their natal chart or major phase. These approaches cannot all be presented as one unanimous rule.",
            "Disagreement is not a footnote invented for the internet. The same chapter records different category names. A related Liu Ren text even disputes the Wei–Chou xing formulation. Liu Ren and BaZi are distinct divination systems; that source demonstrates disagreement in the literature, rather than settling a rule for every BaZi school.",
            "One more useful distinction: the familiar self-xing list contains Chen, Wu, You and Hai—Dragon, Horse, Rooster and Pig. Wei, the Goat branch, is absent. In 2027 a Goat can be described as matching the annual branch; 'therefore it must also punish itself' does not follow."
          ],
          sources: [{ label: "San Ming Tong Hui: complete xing chapter and its qualifications (Shidian Guji)", href: xing }, { label: "Liu Ren Da Quan, Volume One: differing interpretation in the xing entry", href: liuren }]
        },
        {
          id: "how-many",
          title: "6. Is it always three or four animals each year?",
          paragraphs: [
            "There is no fixed quota. First establish which relationships a list includes and how it treats xing; then remove repeated animals. Five categories do not mean five distinct signs. Two labels attached to one sign do not double a measured probability of trouble. Under the 2027 convention above, the commonly involved animals are Goat, Ox, Rat and Dog, with the xing qualifications from the previous section still attached.",
            "In a different branch-year, the combinations and their overlaps change. Some guides list only matching and clashing signs; others add xing, hai and po, or include other symbolic markers. When two lists differ, compare their rules before assuming one has forgotten your animal. A zodiac table is an introduction, not an attendance register for future events."
          ]
        },
        {
          id: "year-boundary",
          title: "7. Lunar New Year or Lichun? Say which boundary you mean",
          paragraphs: [
            "Popular New Year customs and the official lunar calendar usually refer to Lunar New Year's Day. The Hong Kong Observatory changes the lunar year's stem-branch designation at midnight Hong Kong time on the first day of the first lunar month. A common BaZi convention changes the year pillar at the precise Lichun, or Start of Spring, instant. DestinyPixel uses that BaZi convention. The two boundaries serve different purposes and should remain explicit.",
            "The 2027 Hong Kong calendar places Lichun on 4 February and Lunar New Year's Day on 6 February. Lichun is an instant; converting it to another time zone can change its local date and time. It is not automatically midnight on 4 February everywhere. Our 2027 guide begins in January, so January and the period before Lichun retain the Bing-Wu year pillar; Ding-Wei begins at the boundary. Twelve Gregorian months are not forced into a single Goat-year label.",
            "For a birth near a year boundary, check the recorded local date, time and birthplace, then the chosen convention. Subtracting one from the year on your phone does not resolve every boundary case."
          ],
          sources: [{ label: "Hong Kong Observatory: lunar New Year and Lichun conventions explained (Chinese)", href: boundary }, { label: "Hong Kong Observatory: 2027 lunar dates and solar terms", href: calendar }]
        },
        {
          id: "use-it-well",
          title: "8. Give 'be careful this year' an actual next step",
          paragraphs: [
            "Consider Lin, a fictional teaching example, not a user chart or a case from a classic. Lin is an Ox and already plans to change jobs in 2027. Reading 'clash' need not mean withdrawing an application or blaming every difficult interview on Tai Sui. Movement can become a prompt to check the probation clause, cash buffer and handover plan. Those checks are useful for every zodiac animal.",
            "Another fictional person, Jo, is a Goat worried that a zodiac year will damage their relationship. A better question than 'Will we break up?' is 'What living arrangements matter most to each of us this year?' The answer comes from the partner. These are modern editorial exercises, not events calculated from an animal or instructions recovered from an ancient text.",
            "If wearing red, visiting a temple or offering a blessing matters to you, it can remain a valued cultural practice. Participation should not be driven by threats. You do not need to buy a remedy package, and skipping a ritual is no reason to blame yourself when life is difficult. Actual health, financial or relationship concerns still call for evidence, practical action and appropriate help."
          ]
        },
        {
          id: "next-reading",
          title: "9. A star ranking, a personal guide and a small moment of peace",
          paragraphs: [
            "Our 2027 zodiac star ranking uses a disclosed modern editorial rubric to organise traditional imagery and everyday prompts. Ties are allowed, and your own zodiac year is not automatically ranked low. Its stars are not statistical probabilities, scientifically validated forecasts or a complete personal BaZi reading. Read the method before deciding which prompt to keep.",
            "The free personal Year Ahead guide adds birth details for limited, separately explained BaZi and Western astrology perspectives. Its current BaZi section does not assess chart strength, favourable elements or major phases; it is not the full traditional synthesis discussed here. You may mark the birth time unknown: no noon is invented, no hour pillar is supplied, and unstable boundary items are omitted. The calendar still starts in January and changes its BaZi year pillar at Lichun.",
            "Or visit Tai Sui Peace and light a small lamp for yourself. It is a cultural wish and a quiet personal moment, with no wishes collected and no promise to change fate. Understanding one term, clarifying one plan or taking a slower breath can leave you more room to meet the year."
          ],
          links: [{ text: "2027 zodiac star ranking", href: "/2027#zodiac-ranking" }, { text: "free personal Year Ahead guide", href: "/2027#your-year" }, { text: "Tai Sui Peace", href: "/taisui" }],
          sources: [{ label: "DestinyPixel Year Ahead: method, free workflow and limits", href: "/2027" }]
        }
      ],
      action: { label: "Open your free 2027 guide · birth time optional", href: "/2027#your-year" }
    }
  }
};
