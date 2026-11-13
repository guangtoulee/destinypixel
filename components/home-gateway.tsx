import type { ReactNode } from "react";
import Image from "next/image";
import { AmbientAstrolabe, SiteFooterV2, SiteHeaderV2 } from "@/components/v2/site-chrome";
import {
  HeroMotionShowcase,
  HomeQuickLauncher,
  type PillarMiniPreview,
} from "@/components/v2/home-hero-interactive";
import { getPillarImagePath } from "@/lib/archetype-assets";
import { getPillarDisplay } from "@/lib/bazi-totems";
import { getDayPillarCards } from "@/lib/day-pillar-cards";
import { dayPillarCycle } from "@/lib/day-pillar-library";
import { homeOfferCopy, type HomeReportOffer } from "@/lib/home-offer";
import { journalLanguageTags, toTraditional } from "@/lib/journal-locales";
import type { ReportLocale } from "@/lib/report-i18n";
import { journeyCopy, sectionHref } from "@/lib/section-journeys";
import styles from "./section-journeys.module.css";

type ObservatoryCopy = {
  badge: string;
  headline: string;
  sublead: string;
  atlasLink: string;
  yearLink: string;
  actsEyebrow: string;
  actsTitle: string;
  actsLead: string;
  acts: [
    {
      roman: string;
      tag: string;
      title: string;
      subtitle: string;
      cards: [
        {
          key: "discover";
          path: "/discover";
          kicker: string;
          title: string;
          desc: string;
          meta: string;
          cta: string;
        },
        {
          key: "astrology";
          path: "/astrology";
          kicker: string;
          title: string;
          desc: string;
          meta: string;
          cta: string;
        },
        {
          key: "tuteng";
          path: "/tuteng";
          kicker: string;
          title: string;
          desc: string;
          meta: string;
          cta: string;
        },
      ];
    },
    {
      roman: string;
      tag: string;
      title: string;
      subtitle: string;
      cards: [
        {
          key: "tarot";
          path: "/tarot";
          kicker: string;
          title: string;
          desc: string;
          meta: string;
          cta: string;
        },
        {
          key: "sticks";
          path: "/sticks";
          kicker: string;
          title: string;
          desc: string;
          meta: string;
          cta: string;
        },
        {
          key: "iching";
          path: "/iching";
          kicker: string;
          title: string;
          desc: string;
          meta: string;
          cta: string;
        },
      ];
    },
    {
      roman: string;
      tag: string;
      title: string;
      subtitle: string;
      cards: [
        {
          key: "compatibility";
          path: "/compatibility";
          kicker: string;
          title: string;
          desc: string;
          meta: string;
          cta: string;
        },
        {
          key: "year2027";
          path: "/2027";
          kicker: string;
          title: string;
          desc: string;
          meta: string;
          cta: string;
        },
        {
          key: "journal";
          path: "/journal";
          kicker: string;
          title: string;
          desc: string;
          meta: string;
          cta: string;
        },
      ];
    },
  ];
  fusionEyebrow: string;
};

const homeV2Copy: Record<"en" | "zh" | "ru", ObservatoryCopy> = {
  en: {
    badge: "EAST–WEST SYMBOLIC OBSERVATORY",
    headline: "Begin with your birth date,\nor the question before you.",
    sublead:
      "60 Chinese Day Pillar archetypes, tropical natal charts, a sunset Mountain-Lake Tarot table, temple fortune sticks, and three-coin I Ching—crafted for calm reflection.",
    atlasLink: "Explore all 60 Day Pillar portraits",
    yearLink: "2027 · Free Year Ahead Guide",
    actsEyebrow: "THREE-ACT OBSERVATORY",
    actsTitle: "Three quiet rooms, depending on what you carry today",
    actsLead:
      "Read your native rhythm through birth astronomy, bring one concrete question to a divination sanctuary, or compare two charts side by side.",
    acts: [
      {
        roman: "ACT I",
        tag: "Birth Signature",
        title: "Know Your Native Rhythm",
        subtitle: "Astronomical & calendrical portraits calculated from your birth date.",
        cards: [
          {
            key: "discover",
            path: "/discover",
            kicker: "60 GanZhi Archetypes",
            title: "Day Pillar Portrait",
            desc: "Find your stem-and-branch animal character, elemental temperament, and relational blind spots from date alone.",
            meta: "Free · Instant · Shareable card",
            cta: "Find my Day Pillar",
          },
          {
            key: "astrology",
            path: "/astrology",
            kicker: "Western Tropical Wheel",
            title: "Natal Birth Chart",
            desc: "Sun, Moon, Rising, planetary houses, and aspect lines rendered on a twilight celestial wheel.",
            meta: "City & birth time · Interactive wheel",
            cta: "Open birth chart",
          },
          {
            key: "tuteng",
            path: "/tuteng",
            kicker: "Sacred Five-Element Geometry",
            title: "Birth Totem Mandala",
            desc: "Generate a deterministic geometric sigil driven by your Four Pillars elemental balance.",
            meta: "3D WebGL & SVG · Deterministic",
            cta: "Generate totem",
          },
        ],
      },
      {
        roman: "ACT II",
        tag: "Present Inquiry",
        title: "Sit With One Honest Question",
        subtitle: "Interactive ritual tables designed for unhurried contemplation.",
        cards: [
          {
            key: "tarot",
            path: "/tarot",
            kicker: "Sunset Mountain-Lake Table",
            title: "Tarot Sanctuary & 78-Card Atlas",
            desc: "Draw from a fluid 78-card curved ribbon over a twilight lake—Single, Three-Card, Love, Career, or Free Table—and save a tall keepsake bookmark.",
            meta: "60fps ribbon · Waite & Pollack notes",
            cta: "Enter Tarot table",
          },
          {
            key: "sticks",
            path: "/sticks",
            kicker: "Five Temple Traditions",
            title: "Spiritual Fortune Sticks",
            desc: "Shake the bamboo cylinder for Guanyin, Yuelao, Guandi, Mazu, or Caishen—or look up a slip number you drew at a shrine.",
            meta: "100 slips · Classical verse & plain note",
            cta: "Draw or look up a stick",
          },
          {
            key: "iching",
            path: "/iching",
            kicker: "Zhouyi · Six Lines",
            title: "I Ching Hexagram Studio",
            desc: "Toss three bronze coins six times or cast by Plum Blossom numbers to read primary, moving, and changed hexagrams.",
            meta: "64 hexagrams · Shareable cast URL",
            cta: "Cast hexagram",
          },
        ],
      },
      {
        roman: "ACT III",
        tag: "Bonds & Cycles",
        title: "Compare Charts & Read Deeply",
        subtitle: "Two-person synastry, annual timing, and source-grounded essays.",
        cards: [
          {
            key: "compatibility",
            path: "/compatibility",
            kicker: "Dual-System Synastry",
            title: "Relationship Compatibility",
            desc: "Place two birth charts together across BaZi Day Masters and Western planetary aspects to name attraction and friction.",
            meta: "Two dates · Free full comparison",
            cta: "Compare two charts",
          },
          {
            key: "year2027",
            path: "/2027",
            kicker: "Annual Almanac",
            title: "2027 Year Ahead Guide",
            desc: "See how the upcoming annual stem-branch cycle interacts with your Day Master, work rhythm, and energy.",
            meta: "EN & 中文 · Personalized chapters",
            cta: "Read 2027 guide",
          },
          {
            key: "journal",
            path: "/journal",
            kicker: "Reference & Essays",
            title: "Celestial Journal & Guides",
            desc: "Clear introductions to the 60 Day Pillars, Tarot symbolism, Hexagram lines, and East–West reading ethics.",
            meta: "4 languages · Source-cited",
            cta: "Browse the journal",
          },
        ],
      },
    ],
    fusionEyebrow: "COMPLETE EAST–WEST SYNTHESIS",
  },
  zh: {
    badge: "东方星历 · 中西命理与问事观星台",
    headline: "从出生那一刻的气质开始，\n或带着眼前的一桩心事落座。",
    sublead:
      "将六十甲子日柱意象、西方回归星盘、暮色山湖塔罗桌、五系古庙灵签与周易六爻收入同一卷现代星历。安静推演，只作映照，不下判决。",
    atlasLink: "浏览全部六十甲子意象图鉴",
    yearLink: "2027 丁未流年免费手册",
    actsEyebrow: "三幕观星动线 · THREE-ACT OBSERVATORY",
    actsTitle: "按你此刻的心境，走进对应的观照空间",
    actsLead:
      "想了解天生底色可先查生日意象与星盘；心里正悬着具体抉择，直接去山湖牌桌、签筒或铜钱案前起一课；想看两人相处，则合参双人命盘。",
    acts: [
      {
        roman: "第一幕 · ACT I",
        tag: "本命星历",
        title: "识得天生底色与节律",
        subtitle: "以天文历法与干支五行为坐标，描绘你的内在原型与能量结构。",
        cards: [
          {
            key: "discover",
            path: "/discover",
            kicker: "六十甲子日柱原型",
            title: "生日意象卡 · 六十日柱",
            desc: "只需公历生日，即刻算出你的日柱干支与动物意象，读懂性格质地、关系盲点与日常养气方向。",
            meta: "免费秒查 · 本地推算 · 可存图分享",
            cta: "查我的生日意象",
          },
          {
            key: "astrology",
            path: "/astrology",
            kicker: "西方回归黄道星盘",
            title: "本命星盘 · 宫位与相位",
            desc: "输入出生时刻与城市，在暮色星盘仪上直观查看日月上升、十大行星落宫与核心相位连线。",
            meta: "支持全球城市 · 交互式星轮",
            cta: "开启本命星盘",
          },
          {
            key: "tuteng",
            path: "/tuteng",
            kicker: "四柱五行神圣几何",
            title: "本命几何灵构 · 图腾",
            desc: "依据生辰四柱的木火土金水强弱比例，实时演算专属于你的三维灵构印记与对称纹章。",
            meta: "WebGL 实时渲染 · 唯一几何纹章",
            cta: "生成本命灵构",
          },
        ],
      },
      {
        roman: "第二幕 · ACT II",
        tag: "当下问事",
        title: "为一桩具体心事落座起课",
        subtitle: "保留仪式感与手感反馈，让你在洗牌、摇签与掷币间理清思绪。",
        cards: [
          {
            key: "tarot",
            path: "/tarot",
            kicker: "暮色山湖动态牌桌",
            title: "山湖塔罗 · 78 张弧形牌阵与牌义典籍",
            desc: "在保留夕照山湖的静谧牌桌上，体验丝滑的 78 张弧形扇面抽牌；支持单张、三张、感情、事业与自由摆牌，并可生成书签长图珍藏。",
            meta: "60fps 扇形抽牌 · 韦特与经典源注",
            cta: "进入山湖牌桌",
          },
          {
            key: "sticks",
            path: "/sticks",
            kicker: "五系古庙签诗与解签",
            title: "灵签问事 · 摇签与签号直查",
            desc: "收录观音百签、月老、关帝、妈祖与财神灵签。可诚心摇签求问，也可直接输入你在庙里抽到的签号查阅古诗与白话解析。",
            meta: "五系签谱 · 抽签与签号速查同屏",
            cta: "诚心求签 / 查签号",
          },
          {
            key: "iching",
            path: "/iching",
            kicker: "周易六十四卦 · 动爻之变",
            title: "易经六爻 · 三钱起卦与梅花易数",
            desc: "六次掷出古铜钱观察阴阳老少与动爻变卦，或以时间、数字起梅花卦，并附卦辞、彖传与处事权衡提示。",
            meta: "本卦变卦同参 · 支持链接复盘",
            cta: "起一课周易六爻",
          },
        ],
      },
      {
        roman: "第三幕 · ACT III",
        tag: "合盘与典籍",
        title: "双人合参、流年冷暖与深度阅读",
        subtitle: "把单点好奇延展为关系理解、年度节奏与可溯源的命理知识库。",
        cards: [
          {
            key: "compatibility",
            path: "/compatibility",
            kicker: "八字日主 × 星盘相位合参",
            title: "中西双系关系合盘",
            desc: "同时对比两人的八字五行互补与西方星盘行星引力，坦诚呈现默契来源、磨合课题与沟通支点。",
            meta: "双人生日 · 免费完整合盘对照",
            cta: "测算双人合盘",
          },
          {
            key: "year2027",
            path: "/2027",
            kicker: "年度干支流年特辑",
            title: "2027 流年节律免费手册",
            desc: "结合流年干支气场与你的本命日主，梳理未来一年的事业发力期、人际分寸与身心蓄力节奏。",
            meta: "免费长文手册 · 按日主定制视角",
            cta: "阅读 2027 手册",
          },
          {
            key: "journal",
            path: "/journal",
            kicker: "源流考据与实用指南",
            title: "深度专栏 · 日柱、塔罗与易学",
            desc: "拒绝故弄玄虚的恐吓话术，用清晰现代的语言拆解六十日柱、塔罗图像学、六爻动变与中西命理异同。",
            meta: "四语专栏 · 经典文献可查",
            cta: "进入深度专栏",
          },
        ],
      },
    ],
    fusionEyebrow: "中西合参 · 完整本命深度图谱",
  },
  ru: {
    badge: "ВОСТОЧНО-ЗАПАДНАЯ СИМВОЛИЧЕСКАЯ ОБСЕРВАТОРИЯ",
    headline: "Начните с даты рождения\nили с вопроса, который важен сейчас.",
    sublead:
      "60 архетипов столпа дня Бацзы, тропическая натальная карта, стол Таро у горного озера, храмовые жребии и гексаграммы И цзин — пространство спокойного самоанализа.",
    atlasLink: "Все 60 образов столпа дня",
    yearLink: "Гид на 2027 год (EN)",
    actsEyebrow: "ТРИ ЗАЛА ОБСЕРВАТОРИИ",
    actsTitle: "Выберите зал под ваше сегодняшнее состояние",
    actsLead:
      "Изучите врождённый ритм по дате рождения, задайте конкретный вопрос за ритуальным столом или сопоставьте две карты совместимости.",
    acts: [
      {
        roman: "АКТ I",
        tag: "Врождённый ритм",
        title: "Познайте свою природу",
        subtitle: "Календарные и астрономические портреты по дате и времени рождения.",
        cards: [
          {
            key: "discover",
            path: "/discover",
            kicker: "60 архетипов Гань-Чжи",
            title: "Портрет столпа дня",
            desc: "Узнайте свой символический образ животного и стихии, сильные черты и точки роста только по дате рождения.",
            meta: "Бесплатно · Мгновенно · Локально",
            cta: "Найти столп дня",
          },
          {
            key: "astrology",
            path: "/astrology",
            kicker: "Тропический зодиак",
            title: "Натальная карта",
            desc: "Солнце, Луна, Асцендент, дома и аспекты планет на интерактивном сумеречном колесе.",
            meta: "Город и время · Интерактивное колесо",
            cta: "Открыть карту",
          },
          {
            key: "tuteng",
            path: "/tuteng",
            kicker: "Геометрия пяти стихий",
            title: "Тотемная мандала рождения",
            desc: "Детерминированная трёхмерная печать, построенная по балансу пяти элементов ваших Четырёх Столпов.",
            meta: "3D WebGL · Уникальная геометрия",
            cta: "Создать тотем",
          },
        ],
      },
      {
        roman: "АКТ II",
        tag: "Вопрос момента",
        title: "Сформулируйте один честный вопрос",
        subtitle: "Тактильные ритуальные инструменты для неспешного размышления.",
        cards: [
          {
            key: "tarot",
            path: "/tarot",
            kicker: "Сумеречный стол у озера",
            title: "Таро горного озера · 78 карт",
            desc: "Тяните карты из плавной веерной дуги на фоне закатных гор, открывайте расклады и сохраняйте памятную закладку.",
            meta: "60fps веер · Традиция Уэйта",
            cta: "Войти в зал Таро",
          },
          {
            key: "sticks",
            path: "/sticks",
            kicker: "Пять храмовых традиций",
            title: "Храмовые жребии",
            desc: "Встряхните бамбуковый цилиндр Гуаньинь, Юэлао или Гуаньди либо найдите толкование по номеру жребия.",
            meta: "100 жребиев · Стихи и разбор",
            cta: "Вытянуть или найти №",
          },
          {
            key: "iching",
            path: "/iching",
            kicker: "Чжоу И · Шесть черт",
            title: "Гексаграммы И цзин",
            desc: "Бросьте три бронзовые монеты шесть раз или постройте гексаграмму методом Цветка сливы с учётом меняющихся черт.",
            meta: "64 гексаграммы · Ссылка на расклад",
            cta: "Бросить монеты",
          },
        ],
      },
      {
        roman: "АКТ III",
        tag: "Связи и циклы",
        title: "Синастрия, ритм года и библиотека",
        subtitle: "Сопоставление двух карт, годовые циклы и глубокие статьи.",
        cards: [
          {
            key: "compatibility",
            path: "/compatibility",
            kicker: "Двойная синастрия",
            title: "Совместимость в отношениях",
            desc: "Соедините столпы Бацзы и западные аспекты двух людей, чтобы увидеть точки притяжения и бережного диалога.",
            meta: "Две даты · Полный разбор бесплатно",
            cta: "Сравнить две карты",
          },
          {
            key: "year2027",
            path: "/2027",
            kicker: "Годовой альманах",
            title: "Гид на 2027 год",
            desc: "Обзор грядущего цикла для вашего дневного элемента, работы и восстановления сил (на английском языке).",
            meta: "Бесплатный гид · По элементу дня",
            cta: "Открыть гид 2027",
          },
          {
            key: "journal",
            path: "/journal",
            kicker: "Эссе и справочник",
            title: "Журнал DestinyPixel",
            desc: "Ясные статьи о 60 столпах дня, символике Таро, линиях И цзин и культуре чтения знаков без фатализма.",
            meta: "4 языка · Проверенные источники",
            cta: "Читать журнал",
          },
        ],
      },
    ],
    fusionEyebrow: "ПОЛНЫЙ ВОСТОЧНО-ЗАПАДНЫЙ СИНТЕЗ",
  },
};

function getObservatoryCopy(locale: ReportLocale): ObservatoryCopy {
  if (locale === "zh-TW") {
    return JSON.parse(toTraditional(JSON.stringify(homeV2Copy.zh))) as ObservatoryCopy;
  }
  return locale === "zh" ? homeV2Copy.zh : locale === "ru" ? homeV2Copy.ru : homeV2Copy.en;
}

function shortenSnippet(text: string, maxChars: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;
  return `${clean.slice(0, maxChars).replace(/[.,;，。；、\s]+$/, "")}…`;
}

export default function HomeGateway({
  locale,
  reportOffer,
  children,
}: {
  locale: ReportLocale;
  reportOffer: HomeReportOffer;
  children: ReactNode;
}) {
  const c = journeyCopy(locale);
  const offer = homeOfferCopy(locale);
  const v2 = getObservatoryCopy(locale);

  const cards = getDayPillarCards(locale);
  const snippetLimit = locale === "zh" || locale === "zh-TW" ? 56 : 112;
  const previews: Record<string, PillarMiniPreview> = {};
  const pillarMeta: Record<string, { master: string; animal: string; cycleIndex: number }> = {};

  cards.forEach((card, index) => {
    const display = getPillarDisplay(card.pillar, locale);
    const master = locale === "zh-TW" ? toTraditional(display.stemMeaning) : display.stemMeaning;
    const animal = locale === "zh-TW" ? toTraditional(display.animal) : display.animal;
    previews[card.pillar] = {
      pillar: card.pillar,
      slug: card.slug,
      name: card.name,
      image: card.image,
      master,
      animal,
      snippet: shortenSnippet(card.essence, snippetLimit),
    };
    pillarMeta[card.pillar] = {
      master,
      animal,
      cycleIndex: index + 1,
    };
  });

  // Ensure any pillar in dayPillarCycle has fallback metadata
  dayPillarCycle.forEach((pillar, idx) => {
    if (!pillarMeta[pillar]) {
      const display = getPillarDisplay(pillar, locale);
      pillarMeta[pillar] = {
        master: locale === "zh-TW" ? toTraditional(display.stemMeaning) : display.stemMeaning,
        animal: locale === "zh-TW" ? toTraditional(display.animal) : display.animal,
        cycleIndex: idx + 1,
      };
    }
  });

  const yearHref = locale === "zh" || locale === "zh-TW" ? "/2027?locale=zh" : "/2027";

  return (
    <main className={styles.home} lang={journalLanguageTags[locale]} data-server-localized>
      <AmbientAstrolabe tone="parchment" />
      <SiteHeaderV2 locale={locale} basePath="/" />

      <section className={styles.hero}>
        <div className={styles.heroCopyCol}>
          <p className={styles.eyebrowPill}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            <span>{v2.badge}</span>
          </p>
          <h1 className={styles.heroHeadline}>{v2.headline}</h1>
          <p className={styles.lead}>{v2.sublead}</p>

          <HomeQuickLauncher locale={locale} pillars={Object.values(previews)} />

          <div className={styles.heroSecondaryLinks}>
            <a className={styles.inlineAtlasLink} href={sectionHref("/journal/day-pillars", locale)}>
              <span>{v2.atlasLink}</span>
              <span aria-hidden="true">→</span>
            </a>
            <a
              className={styles.inlineAtlasLink}
              href={yearHref}
              hrefLang={yearHref.includes("locale=zh") ? "zh-Hans" : "en"}
              data-analytics-tool="year_2027"
              data-analytics-location="home"
            >
              <span>{v2.yearLink}</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <HeroMotionShowcase locale={locale} pillarMeta={pillarMeta} />
      </section>

      <section className={styles.observatorySection} aria-labelledby="observatory-heading">
        <div className={styles.observatoryHeader}>
          <p className={styles.kicker}>{v2.actsEyebrow}</p>
          <h2 id="observatory-heading">{v2.actsTitle}</h2>
          <p className={styles.observatoryLead}>{v2.actsLead}</p>
        </div>

        <div className={styles.actsStack}>
          {v2.acts.map(act => (
            <div key={act.roman} className={styles.actBlock}>
              <div className={styles.actRibbon}>
                <div className={styles.actTitleGroup}>
                  <span className={styles.actRoman}>{act.roman}</span>
                  <span className={styles.actTag}>{act.tag}</span>
                  <h3>{act.title}</h3>
                </div>
                <p className={styles.actSubtitle}>{act.subtitle}</p>
              </div>

              <div className={styles.bentoRow}>
                {act.cards.map(card => {
                  const href =
                    card.key === "year2027" ? yearHref : sectionHref(card.path, locale);
                  const isFeatured = card.key === "tarot" || card.key === "discover";
                  return (
                    <a
                      key={card.key}
                      href={href}
                      className={styles.bentoCard}
                      data-realm={card.key}
                      data-featured={isFeatured || undefined}
                      data-home-path={card.key}
                    >
                      <div className={styles.bentoArtwork} aria-hidden="true">
                        {card.key === "discover" ? (
                          <div className={styles.artDiscover}>
                            <Image
                              src={getPillarImagePath("丙午")}
                              alt=""
                              width={120}
                              height={160}
                              sizes="120px"
                            />
                            <div className={styles.ganzhiOrbit}>
                              <span>甲子</span>
                              <span>丙午</span>
                              <span>癸卯</span>
                              <span>庚戌</span>
                            </div>
                          </div>
                        ) : card.key === "astrology" ? (
                          <svg viewBox="0 0 180 110" className={styles.artSvg}>
                            <circle cx="90" cy="55" r="44" stroke="currentColor" strokeWidth="1" opacity="0.55" />
                            <circle cx="90" cy="55" r="30" stroke="currentColor" strokeWidth="0.9" strokeDasharray="3 4" />
                            <line x1="34" y1="55" x2="146" y2="55" stroke="currentColor" strokeWidth="0.75" opacity="0.4" />
                            <line x1="90" y1="7" x2="90" y2="103" stroke="currentColor" strokeWidth="0.75" opacity="0.4" />
                            <polygon points="90,23 117,71 63,71" fill="none" stroke="#c59449" strokeWidth="1.15" />
                            <circle cx="90" cy="23" r="3.5" fill="#c59449" />
                            <circle cx="117" cy="71" r="3" fill="#6f4f9b" />
                            <circle cx="63" cy="71" r="3" fill="#6f4f9b" />
                          </svg>
                        ) : card.key === "tuteng" ? (
                          <svg viewBox="0 0 180 110" className={styles.artSvg}>
                            <polygon points="90,11 126,28 134,67 109,97 71,97 46,67 54,28" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
                            <polygon points="90,21 118,55 90,89 62,55" fill="none" stroke="#c59449" strokeWidth="1.2" />
                            <circle cx="90" cy="55" r="14" fill="none" stroke="#6f4f9b" strokeWidth="1.1" />
                            <circle cx="90" cy="55" r="3.5" fill="#c59449" />
                          </svg>
                        ) : card.key === "tarot" ? (
                          <div className={styles.artTarotFan}>
                            <span className={styles.tarotMiniCard} data-pos="left">☽</span>
                            <span className={styles.tarotMiniCard} data-pos="center">✦</span>
                            <span className={styles.tarotMiniCard} data-pos="right">☉</span>
                          </div>
                        ) : card.key === "sticks" ? (
                          <div className={styles.artSticks}>
                            <Image
                              src="/shrine/oracle-vessel-20260917.webp"
                              alt=""
                              width={92}
                              height={116}
                              sizes="92px"
                            />
                          </div>
                        ) : card.key === "iching" ? (
                          <div className={styles.artHexagram}>
                            <i data-line="yang" />
                            <i data-line="yin" />
                            <i data-line="moving" />
                            <i data-line="yang" />
                            <i data-line="yin" />
                            <i data-line="yang" />
                          </div>
                        ) : card.key === "compatibility" ? (
                          <div className={styles.artSynastry}>
                            <Image
                              src={getPillarImagePath("乙卯")}
                              alt=""
                              width={72}
                              height={96}
                              sizes="72px"
                            />
                            <span className={styles.synastryRing}>∞</span>
                            <Image
                              src={getPillarImagePath("庚戌")}
                              alt=""
                              width={72}
                              height={96}
                              sizes="72px"
                            />
                          </div>
                        ) : card.key === "year2027" ? (
                          <div className={styles.artYearBadge}>
                            <span>丁未</span>
                            <strong>2027</strong>
                          </div>
                        ) : (
                          <div className={styles.artJournal}>
                            <span>LX · LXXVIII · LXIV</span>
                            <small>MANUSCRIPT FOLIOS</small>
                          </div>
                        )}
                      </div>

                      <div className={styles.bentoContent}>
                        <p className={styles.bentoKicker}>{card.kicker}</p>
                        <h4>{card.title}</h4>
                        <p className={styles.bentoDesc}>{card.desc}</p>
                        <div className={styles.bentoFooter}>
                          <small>{card.meta}</small>
                          <strong>
                            <span>{card.cta}</span>
                            <span aria-hidden="true">↗</span>
                          </strong>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.reportIntro} aria-labelledby="fusion-report-heading">
        <div>
          <p className={styles.kicker}>{v2.fusionEyebrow}</p>
          <h2 id="fusion-report-heading">{c.report}</h2>
          <p>{c.reportNote}</p>
          <p className={styles.offer}>
            {reportOffer.available && reportOffer.amount
              ? offer.note.replace("{price}", reportOffer.amount)
              : offer.unavailable}{" "}
            <a href={sectionHref("/product-facts", locale)}>{offer.details} ↗</a>
          </p>
        </div>
        <a className={styles.primary} href="#report">
          <span>{c.report}</span>
          <span aria-hidden="true">↓</span>
        </a>
      </section>

      <div className={styles.reportChamber}>{children}</div>

      <SiteFooterV2 locale={locale} />
    </main>
  );
}
