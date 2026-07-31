import type { SiteLocale } from "@/content/zhangshengjun-i18n";

export const contentSlugs = ["legend", "lushan", "news", "videos", "shop"] as const;
export type ContentSlug = (typeof contentSlugs)[number];

export type ContentSection = {
  number: string;
  title: string;
  text: string[];
  note?: string;
};

export type ContentCard = {
  eyebrow: string;
  title: string;
  text: string;
  image?: string;
  href?: string;
};

export type ContentPage = {
  slug: ContentSlug;
  locale: SiteLocale;
  htmlLang: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  lede: string;
  heroImage: string;
  heroAlt: string;
  stats: Array<[string, string]>;
  sections: ContentSection[];
  cards: ContentCard[];
  video?: {
    name: string;
    description: string;
    duration: string;
    uploadDate: string;
    contentUrl: string;
    thumbnailUrl: string;
    transcript: string[];
  };
};

const sharedImages = {
  legend: "/zhangshengjun/woodcutter-origin-v2.jpg",
  lushan: "/zhangshengjun/dharma-iconography.jpg",
  news: "/zhangshengjun/ritual-procession.jpg",
  videos: "/zhangshengjun/mythic-lacquer-hero-v3.jpg",
  shop: "/zhangshengjun/reference-bible/master-prop-material-board.jpg",
};

const simplified: Record<ContentSlug, Omit<ContentPage, "locale" | "htmlLang" | "slug">> = {
  legend: {
    navLabel: "神公传奇",
    eyebrow: "FROM MORTAL TO DIVINE",
    title: "张圣君：从山野樵夫到千年神公",
    description:
      "梳理张圣君从月洲出生、盘谷成长、方壶悟道、石牛显法到金沙坐化的完整成神叙事，并保留族谱、古籍与科仪文献中的差异。",
    lede:
      "张圣君并非生而为神。贫寒、劳作、奇遇与护民功德，共同塑造了这位兼具农业守护、驱邪治疫、商贸信用与闾山法脉身份的复合型神祇。",
    heroImage: sharedImages.legend,
    heroAlt: "闽中山野中的青年樵夫张圣君",
    stats: [
      ["1024 / 1139", "两套出生纪年"],
      ["45载", "科仪叙事中的济世生涯"],
      ["五地", "月洲、盘谷、方壶、石牛、金沙"],
    ],
    sections: [
      {
        number: "01",
        title: "凡尘起步：土地经验塑造的神格",
        text: [
          "族谱叙事常称张圣君生于北宋天圣二年（1024年），四岁丧父，随母迁居盘谷。少年时放牧、采薪、制作锄柄，乡人因而称他“张锄柄”。",
          "这种底层生活并非传奇的装饰。它解释了他成神后为何始终与农田、水利、疫病和普通人的生计相连，也让“由凡入圣”成为最具共情力的信仰核心。",
        ],
        note: "生卒纪年存在文献差异，官网并列材料，不将信仰史压缩成唯一答案。",
      },
      {
        number: "02",
        title: "食桃悟道：山川中的命运转折",
        text: [
          "《游宦纪闻》《夷坚志》《三山志》分别保留了遇仙对弈、获赠仙桃或仙笋、绝粒与预言祸福等线索。民间则把仙桃坪、棋盘石等真实地貌视为故事发生的现场。",
          "方壶岩因此同时承担青年生活地、悟道地与法源地三重意义。它不是神话的背景，而是信仰叙事可以步入、触摸和反复讲述的山川本体。",
        ],
      },
      {
        number: "03",
        title: "斩妖济世：把恐惧转化为护民神力",
        text: [
          "斩蛇、斗五通鬼、祈雨、治疫与引水护田，是张圣君神格权威的主要来源。神迹回应的并非抽象妖魔，而是山林兽害、旱灾、瘟疫与农耕社会最现实的风险。",
          "宝剑、麻蛇法索、黑面圆眼与披发跣足，最终把这些地方记忆凝结为极具辨识度的武身法相。",
        ],
      },
      {
        number: "04",
        title: "坐化升天：由一人功德到跨海香火",
        text: [
          "科仪系统多称南宋淳熙十年（1183年），张圣君于闽清金沙九龙潭巨石上坐化。此后，地方志、道坛抄本、朝廷封号与百姓口述共同推动他的神格演变。",
          "香火随福建移民进入台湾与东南亚，在港口、商贸中心和乡村社会获得新的职能，形成跨越千年的活态信仰网络。",
        ],
      },
    ],
    cards: [
      { eyebrow: "出生记忆", title: "永泰月洲", text: "凡人履历与张氏族谱的地理起点。", image: sharedImages.legend },
      { eyebrow: "血缘地与法源地", title: "永泰方壶岩", text: "生活、悟道、学法与契子信俗重叠的母殿原点。", image: "/zhangshengjun/fanghu-hero.jpg" },
      { eyebrow: "坐化圣迹", title: "闽清金沙", text: "九龙潭传说与迎神游田延续神公的农业神格。", image: sharedImages.news },
    ],
  },
  lushan: {
    navLabel: "闾山法脉",
    eyebrow: "LUSHAN LINEAGE",
    title: "亦道亦佛：法主公信仰的双轮法脉",
    description:
      "理解张圣君与闾山大法院、五雷法、瑜伽教法及闽台民间科仪的关系，解读宝剑、法索与武身法相背后的文化系统。",
    lede:
      "张圣君信仰不是单一宗教标签可以概括的体系。道教雷法、地方巫法与佛教瑜伽教法在闽地长期交汇，形成“亦道亦佛”的实践传统。",
    heroImage: sharedImages.lushan,
    heroAlt: "黑面披发、执剑与麻蛇法索的张圣君武身法相",
    stats: [
      ["双轮", "闾山教与瑜伽教"],
      ["五雷", "护境驱邪的法术意象"],
      ["四职", "祈雨、治疫、镇邪、度世"],
    ],
    sections: [
      {
        number: "01",
        title: "闾山大法院：地方社会中的法脉想象",
        text: [
          "民间传说将张圣君与许旌阳、闾山大法院及五雷心法相连。高山、雷洞、石壁与雷暴等自然意象，也持续强化其“监雷法主”的地方认知。",
          "这里的“法”首先是一套面向现实生活的实践：祈雨、治病、收魂、护境和驱邪，都是传统乡村回应风险的文化方式。",
        ],
      },
      {
        number: "02",
        title: "瑜伽双轮：跨越道佛边界的民间传统",
        text: [
          "相关研究认为，唐代密教瑜伽法南传后与闾山巫法交融，在福建形成具有地方特色的教法。张圣君因此既有雷霆威仪，也保留慈悲济世的价值取向。",
          "“亦道亦佛”不是概念拼贴，而是长期科仪实践与地方生活共同塑造的复合身份。",
        ],
      },
      {
        number: "03",
        title: "器物密码：一把剑与一根法索",
        text: [
          "法剑象征执法、镇邪与公义；蛇形麻索则连接降蛇神迹、通天护法和闾山科仪。披发跣足展示施法时的战斗状态，也保留行走山野的亲民气质。",
          "网站中的器物设定为当代数字艺术重构，并非文物实拍。它们用于建立稳定的影像视觉母版，避免将复杂传统简化为泛化仙侠符号。",
        ],
      },
    ],
    cards: [
      { eyebrow: "镇邪法器", title: "五雷法剑", text: "以旧铁包浆、窄身直刃与云头护手表达克制的威仪。", image: "/zhangshengjun/reference-bible/generated/prop-ritual-sword-sheet.jpg" },
      { eyebrow: "法脉符号", title: "麻蛇法索", text: "麻纤维、朱砂结与铁环构成最具辨识度的器物语言。", image: "/zhangshengjun/reference-bible/generated/prop-dharma-rope-sheet.jpg" },
      { eyebrow: "视觉研究", title: "武身衣冠", text: "以生活痕迹和闽地材料建立可信的神公形象。", image: "/zhangshengjun/reference-bible/generated/costume-ornament-sheet.jpg" },
    ],
  },
  news: {
    navLabel: "文化资讯",
    eyebrow: "FIELD NOTES & NEWS",
    title: "香火仍在发生：资讯、田野与研究笔记",
    description:
      "发布永泰方壶岩母殿动态、张圣君信俗田野记录、两岸进香交流、学术研究与数字文化项目进展。",
    lede:
      "新闻不只记录活动日期，也要解释一场仪式为何发生、一处山石如何成为圣迹，以及两岸香路怎样在今天继续延伸。",
    heroImage: sharedImages.news,
    heroAlt: "神轿与信众巡行田野的迎神游田仪式",
    stats: [
      ["田野", "仪式与地方社会"],
      ["文献", "古籍、方志与科仪"],
      ["当代", "影像、交流与数字化"],
    ],
    sections: [
      {
        number: "专题 · 01",
        title: "何为“圣迹营造”？",
        text: [
          "民间信仰景观并非静态陈列。传说附着、文人书写、地方志确认与科仪反复演绎，让岩洞、石壁、古树与庙宇成为可感知的文化地理体系。",
          "方壶岩的仙桃坪、雷洞、斗鬼洞与斗法石钉，正体现“地以神显、神由地生”的机制：自然地貌承载神迹，神迹又反过来强化地方认同。",
        ],
        note: "首期策展笔记 · 2026年7月",
      },
      {
        number: "专题 · 02",
        title: "迎神游田：一条会移动的圣路",
        text: [
          "夏至前后，神像由庙宇进入村巷与田垄，日常生产空间被临时转化为神圣路径。仪式既祈求避虫防旱、五谷丰登，也组织值年、筹资、仪仗与社区协作。",
          "网站后续将建立活动日历、图集与口述史栏目，逐步补充可核验的时间、地点、人物与来源。",
        ],
      },
    ],
    cards: [
      { eyebrow: "景观研究", title: "山川即是圣殿", text: "从仙桃坪到法索石，辨识神迹如何嵌入真实地貌。", image: "/zhangshengjun/reference-bible/generated/material-fanghu-lacquer-rock-sheet.jpg" },
      { eyebrow: "活态非遗", title: "游田的农业逻辑", text: "仪式时间、巡行路线与乡村协作共同构成活态传承。", image: sharedImages.news },
      { eyebrow: "开放征集", title: "寻找地方记忆", text: "欢迎提供老照片、庙志、科仪抄本与进香记录的线索。", image: "/zhangshengjun/fanghu-hero.jpg", href: "mailto:info@zhangshengjun.org" },
    ],
  },
  videos: {
    navLabel: "影音馆",
    eyebrow: "FILM & VISUAL ARCHIVE",
    title: "法主视界：让千年叙事进入当代影像",
    description:
      "观看张圣君主题影像《法主降临》，浏览角色、法器与方壶山水视觉设定，并了解后续纪录片与知识视频计划。",
    lede:
      "首支四十秒概念短片以黑漆山骨、朱砂雷痕、法索、仙桃与水纹稻田串联“显现、悟道、镇邪、归宗”四幕，横竖版分别适配桌面与移动设备。",
    heroImage: sharedImages.videos,
    heroAlt: "黑漆山骨与朱砂雷痕构成的张圣君神话影像",
    stats: [
      ["40秒", "四幕概念主片"],
      ["横 / 竖", "双端画幅适配"],
      ["7组", "角色、法器与场景设定"],
    ],
    sections: [
      {
        number: "01",
        title: "漆裂成山，法主显现",
        text: ["黑漆表面裂开成为闽中群山，朱砂雷痕沿岩层游走，人物并非从云端降临，而是从真实山骨中显现。"],
      },
      {
        number: "02",
        title: "法索擦镜，食桃悟道",
        text: ["麻蛇法索完成第一次视觉转场，半颗仙桃、棋石与山中雾气把叙事带回凡人命运的转折点。"],
      },
      {
        number: "03",
        title: "雷环化剑，剑锋入水",
        text: ["雷法能量收束为剑，剑锋切入水面，把斩妖镇邪的力量转译为祈雨、治水与护田。"],
      },
      {
        number: "04",
        title: "水纹成田，万香归宗",
        text: ["水纹扩展为层叠稻田，巡游与香火由方壶向海峡两岸延伸，完成由个人传奇到共同文化记忆的转换。"],
      },
    ],
    cards: [
      { eyebrow: "视觉母版", title: "角色锁定", text: "统一面部、发式、体态与武身衣冠，保证跨镜头连续性。", image: "/zhangshengjun/reference-bible/master-character-lock-board.jpg" },
      { eyebrow: "器物母版", title: "法器与材质", text: "把剑、索、仙桃、棋石与漆艺山骨纳入同一材质体系。", image: sharedImages.shop },
      { eyebrow: "后续计划", title: "知识影像系列", text: "系统介绍张圣君、闾山派、方壶圣迹与闽台信俗。", image: "/zhangshengjun/reference-bible/master-story-props-board.jpg" },
    ],
    video: {
      name: "法主降临：黑漆山骨中的千年神公",
      description: "四幕概念影像串联张圣君显现、悟道、镇邪与万香归宗。",
      duration: "PT40S",
      uploadDate: "2026-07-29",
      contentUrl: "/zhangshengjun/video/hero-cinematic-wide.mp4",
      thumbnailUrl: sharedImages.videos,
      transcript: [
        "漆裂成山，法主显现。",
        "法索擦镜，食桃悟道。",
        "雷环化剑，剑锋入水。",
        "水纹成田，万香归宗。",
      ],
    },
  },
  shop: {
    navLabel: "文创计划",
    eyebrow: "CULTURAL EDITIONS",
    title: "法主文创：从器物研究到数字日常",
    description:
      "张圣君文化数字作品与文创计划预告，包括电子屏保、动态视频壁纸、每日黄历、数字符箓艺术及实体文化衍生品。",
    lede:
      "这里暂时不是交易页面，而是一间公开的数字工坊。所有产品先经过史料梳理、视觉设定与文化说明，再进入授权、定价和正式发布阶段。",
    heroImage: sharedImages.shop,
    heroAlt: "张圣君法剑、法索、仙桃与方壶山水材质设定",
    stats: [
      ["数字优先", "适配手机与电子屏"],
      ["来源说明", "区分史料、传说与艺术重构"],
      ["筹备中", "暂未开放交易"],
    ],
    sections: [
      {
        number: "01",
        title: "数字屏保与动态壁纸",
        text: [
          "从方壶飞瀑、黑漆山骨、朱砂雷痕与五雷法剑中提炼克制、可长期观看的动态构图，提供横屏、竖屏与超宽屏规格。",
          "首批版本将优先测试色彩、循环衔接、耗电与 OLED 防烧屏表现。",
        ],
      },
      {
        number: "02",
        title: "每日黄历与文化日历",
        text: [
          "以节气、农事与地方信俗为线索，建立现代可读的日历产品。内容将标明资料来源，避免把不同地区、不同科仪系统混为一谈。",
        ],
      },
      {
        number: "03",
        title: "数字符箓与器物艺术",
        text: [
          "以法剑、法索、雷纹和山川印记为创作语言，开发收藏级数字画面。产品定位为文化艺术与视觉设计，不宣称医疗、改运或其他无法验证的功效。",
        ],
        note: "正式销售、价格与支付功能尚未开启。",
      },
    ],
    cards: [
      { eyebrow: "DIGITAL · 01", title: "方壶雷雨动态屏保", text: "飞瀑、雷隙与山雾形成无缝循环的数字山水。", image: "/zhangshengjun/reference-bible/generated/material-fanghu-lacquer-rock-sheet.jpg" },
      { eyebrow: "DIGITAL · 02", title: "五雷法剑电子壁纸", text: "为手机、平板与桌面屏幕设计的器物特写系列。", image: "/zhangshengjun/reference-bible/generated/prop-ritual-sword-sheet.jpg" },
      { eyebrow: "CALENDAR · 01", title: "节气与信俗日历", text: "从农业节律出发，连接游田、庆诞与地方文化知识。", image: "/zhangshengjun/reference-bible/generated/props-field-procession-kit-v2.jpg" },
    ],
  },
};

function traditionalize(page: ContentPage): ContentPage {
  const substitutions: Array<[RegExp, string]> = [
    [/张/g, "張"], [/圣/g, "聖"], [/闾/g, "閭"], [/显/g, "顯"], [/发/g, "發"],
    [/传/g, "傳"], [/统/g, "統"], [/术/g, "術"], [/东/g, "東"], [/台/g, "臺"],
    [/湾/g, "灣"], [/与/g, "與"], [/万/g, "萬"], [/归/g, "歸"], [/图/g, "圖"],
    [/书/g, "書"], [/场/g, "場"], [/体/g, "體"], [/为/g, "為"], [/后/g, "後"],
    [/里/g, "裡"], [/复/g, "複"], [/数/g, "數"], [/据/g, "據"], [/应/g, "應"],
    [/开/g, "開"], [/会/g, "會"], [/护/g, "護"], [/实/g, "實"], [/处/g, "處"],
    [/时/g, "時"], [/动/g, "動"], [/录/g, "錄"], [/历/g, "曆"], [/价/g, "價"],
    [/线/g, "線"], [/络/g, "絡"], [/还/g, "還"], [/将/g, "將"], [/别/g, "別"],
    [/并/g, "並"], [/过/g, "過"], [/这/g, "這"], [/个/g, "個"], [/从/g, "從"],
    [/进/g, "進"], [/层/g, "層"], [/产/g, "產"], [/农/g, "農"], [/资/g, "資"],
  ];
  const convert = (value: string) =>
    substitutions.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), value);
  return {
    ...page,
    locale: "zh-hant",
    htmlLang: "zh-Hant",
    navLabel: convert(page.navLabel),
    title: convert(page.title),
    description: convert(page.description),
    lede: convert(page.lede),
    heroAlt: convert(page.heroAlt),
    stats: page.stats.map(([value, label]) => [convert(value), convert(label)]),
    sections: page.sections.map((section) => ({
      ...section,
      title: convert(section.title),
      text: section.text.map(convert),
      note: section.note ? convert(section.note) : undefined,
    })),
    cards: page.cards.map((card) => ({
      ...card,
      eyebrow: convert(card.eyebrow),
      title: convert(card.title),
      text: convert(card.text),
    })),
    video: page.video
      ? {
          ...page.video,
          name: convert(page.video.name),
          description: convert(page.video.description),
          transcript: page.video.transcript.map(convert),
        }
      : undefined,
  };
}

const englishSummaries: Record<
  ContentSlug,
  Pick<ContentPage, "navLabel" | "title" | "description" | "lede" | "heroAlt" | "stats">
> = {
  legend: {
    navLabel: "The Divine Lord",
    title: "Lord Zhang: From Mountain Woodcutter to a Millennium Divine Lord",
    description: "Trace Lord Zhang's journey through Yuezhou, Pangu, Fanghu Rock, Shiniu Mountain, and Jinsha while comparing differing textual traditions.",
    lede: "Lord Zhang was not born divine. Poverty, labor, revelation, and a lifetime of service shaped a guardian associated with farming, healing, commerce, and Lushan ritual.",
    heroAlt: "The young woodcutter Lord Zhang in the mountains of central Fujian",
    stats: [["1024 / 1139", "Two birth traditions"], ["45 years", "A life of service"], ["Five places", "A sacred life map"]],
  },
  lushan: {
    navLabel: "Lushan Lineage",
    title: "Beyond One Tradition: The Twin Lineages of Fazhu Gong",
    description: "Explore Lord Zhang's relationship with Lushan ritual, thunder rites, Yogacara-derived traditions, ritual objects, and iconography.",
    lede: "The tradition cannot be reduced to one label. Daoist thunder rites, local ritual practice, and Buddhist-derived teachings converged in Fujian over centuries.",
    heroAlt: "The martial iconography of Lord Zhang with sword and ritual rope",
    stats: [["Twin paths", "Lushan and Yogic rites"], ["Five Thunders", "A protective visual language"], ["Four roles", "Rain, healing, protection, deliverance"]],
  },
  news: {
    navLabel: "Stories",
    title: "A Living Tradition: News, Field Notes, and Research",
    description: "Updates from Fanghu Rock, field notes on ritual practice, cross-strait pilgrimage, research, and the site's digital culture program.",
    lede: "Good cultural reporting records more than dates. It explains why a ritual happens, how a rock becomes sacred, and how an incense route continues in the present.",
    heroAlt: "A ritual procession carrying the divine palanquin through fields",
    stats: [["Fieldwork", "Ritual and community"], ["Sources", "Gazetteers and liturgy"], ["Today", "Film and exchange"]],
  },
  videos: {
    navLabel: "Films",
    title: "Fazhu Films: A Millennium Story in Contemporary Images",
    description: "Watch The Descent of Fazhu and explore the character, ritual-object, and Fanghu landscape studies behind the film.",
    lede: "A forty-second concept film connects manifestation, awakening, protection, and return through black lacquer mountains, cinnabar thunder, ritual rope, peach, and rice-field water.",
    heroAlt: "Lord Zhang emerging from black lacquer mountains and cinnabar thunder",
    stats: [["40 seconds", "A four-act concept film"], ["Wide / vertical", "Responsive compositions"], ["Seven studies", "Character, props, and landscape"]],
  },
  shop: {
    navLabel: "Editions",
    title: "Fazhu Editions: From Material Study to Digital Ritual Art",
    description: "A preview of cultural editions including screen art, motion wallpapers, seasonal calendars, digital talisman art, and physical objects.",
    lede: "This is an open digital workshop, not yet a storefront. Each edition begins with source research, visual development, and a clear account of artistic interpretation.",
    heroAlt: "A visual study of Lord Zhang's sword, ritual rope, peach, and Fanghu materials",
    stats: [["Digital first", "For personal screens"], ["Source notes", "Research and interpretation"], ["In development", "Commerce not yet active"]],
  },
};

function englishize(source: ContentPage): ContentPage {
  const summary = englishSummaries[source.slug];
  const sectionTitles: Record<ContentSlug, string[]> = {
    legend: ["A Mortal Beginning", "The Peach of Awakening", "Protection and Service", "From Life to Living Tradition"],
    lushan: ["The Lushan Ritual World", "Twin Currents Across Traditions", "The Sword and Ritual Rope"],
    news: ["How a Sacred Landscape Is Made", "The Field Procession as a Moving Sacred Route"],
    videos: ["Lacquer Opens into Mountains", "Ritual Rope to Peach Awakening", "Thunder Becomes a Sword", "Water Becomes Fields"],
    shop: ["Digital Screen Art", "Seasonal and Cultural Calendars", "Ritual-Object Art Editions"],
  };
  const sectionBodies: Record<ContentSlug, string[]> = {
    legend: [
      "Genealogical traditions describe an orphan who herded cattle, gathered firewood, and made hoe handles. This life close to land and labor helps explain his later role as a protector of farming communities.",
      "Early texts preserve related but distinct accounts of immortals, a peach or bamboo shoot, fasting, and prophecy. At Fanghu Rock, the story is attached to a landscape that pilgrims can enter.",
      "Snake-slaying, rainmaking, healing, and irrigation transformed local fears of drought, epidemic, and wilderness into a protective sacred presence.",
      "Jinsha's Jiulong Pool marks the tradition of his transcendence. Migration later carried Fazhu Gong devotion to Taiwan and Southeast Asia.",
    ],
    lushan: [
      "Popular tradition connects Lord Zhang with the Lushan ritual world, thunder rites, protection, rainmaking, healing, and the practical needs of local communities.",
      "Research describes the convergence of Lushan practice with Buddhist-derived Yogic ritual currents. The result is a lived tradition that crosses neat institutional boundaries.",
      "The sword represents protection and justice. The serpent-like ritual rope links the snake legend with ritual authority. Our digital studies are contemporary interpretations, not photographs of historical artifacts.",
    ],
    news: [
      "Stories, inscriptions, gazetteers, and repeated ritual performance turn caves, rocks, trees, and temples into a cultural geography that can be visited and remembered.",
      "Around the summer solstice, the palanquin moves from temple to village and field. The route expresses hopes for harvest while organizing shared labor and community memory.",
    ],
    videos: [
      "A black lacquer surface fractures into the mountains of Fujian as cinnabar lines carry the force of thunder.",
      "The ritual rope wipes across the lens and leads to the peach, game stones, and the mortal moment of awakening.",
      "A ring of thunder contracts into a sword; its point enters water, translating power into rain, irrigation, and protection.",
      "Ripples become terraced fields and the incense route extends from Fanghu Rock across the Taiwan Strait.",
    ],
    shop: [
      "Looping landscapes and ritual-object compositions are being designed for phones, desktop screens, and large displays.",
      "A source-led calendar will connect seasons, farming rhythms, temple observances, and regional cultural notes without collapsing local differences.",
      "Digital editions will use the sword, rope, thunder patterns, and mountain marks as visual language. They are cultural artworks and make no medical or supernatural claims.",
    ],
  };
  return {
    ...source,
    ...summary,
    locale: "en",
    htmlLang: "en",
    sections: source.sections.map((section, index) => ({
      ...section,
      title: sectionTitles[source.slug][index],
      text: [sectionBodies[source.slug][index]],
      note: section.note ? "Editorial note: sources and interpretations are identified separately." : undefined,
    })),
    cards: source.cards.map((card, index) => ({
      ...card,
      eyebrow: ["RESEARCH", "LANDSCAPE", "LIVING TRADITION"][index] ?? "ARCHIVE",
      title: ["Visual Study", "Sacred Geography", "Field Archive"][index] ?? card.title,
      text: [
        "A close reading of objects, materials, and visual conventions.",
        "A place-based account linking narrative, memory, and landscape.",
        "An expanding archive of ritual, migration, and contemporary practice.",
      ][index] ?? card.text,
    })),
    video: source.video
      ? {
          ...source.video,
          name: "The Descent of Fazhu",
          description: "A four-act concept film of manifestation, awakening, protection, and return.",
          transcript: ["Lacquer opens into mountains.", "Ritual rope reveals awakening.", "Thunder becomes a sword.", "Water becomes fields; all incense returns to its source."],
        }
      : undefined,
  };
}

export function getContentPage(locale: SiteLocale, slug: ContentSlug): ContentPage {
  const source: ContentPage = {
    ...simplified[slug],
    slug,
    locale: "zh-cn",
    htmlLang: "zh-CN",
  };
  if (locale === "zh-hant") return traditionalize(source);
  if (locale === "en") return englishize(source);
  return source;
}

export function localePath(locale: SiteLocale, path = "") {
  const prefix = locale === "zh-cn" ? "" : `/${locale}`;
  return `/zhangshengjun${prefix}${path || "/"}`;
}
