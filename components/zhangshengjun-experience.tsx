"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowRight,
  BookOpenText,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  CirclePlay,
  Compass,
  Globe2,
  Handshake,
  MapPin,
  Menu,
  Pause,
  Play,
  Route,
  ScrollText,
  Shield,
  Sparkles,
  Sprout,
  ZoomIn,
  X,
} from "lucide-react";
import {
  localeInfo,
  localizedLabel,
  siteLocales,
  translate,
  type SiteLocale,
} from "@/content/zhangshengjun-i18n";
import BrandSymbol from "./brand-symbol";
import styles from "./zhangshengjun-experience.module.css";

const mirrorBasePath = "/zhangshengjun";

const navItemsSource = [
  { label: "神公传奇", href: "/legend" },
  { label: "闾山法脉", href: "/lushan" },
  { label: "文化资讯", href: "/news" },
  { label: "影音馆", href: "/videos" },
  { label: "文创计划", href: "/shop" },
];

const heroStatsSource = [
  ["千年+", "信仰传承"],
  ["五大谱系", "圣迹景观"],
  ["50余座", "台湾主祀宫庙"],
  ["两岸四海", "香火网络"],
];

const heroScenesSource = [
  {
    number: "01",
    label: "圣境方壶",
    eyebrow: "THE SACRED ORIGIN · FANGHU ROCK",
    title: "千年神公",
    accent: "根在方壶",
    text: "黑漆山骨、朱砂雷痕与一线飞瀑，共同托起张圣君信仰的血缘地与法源地。这里不是神话的背景，而是神话发生的山川本体。",
    image: "/zhangshengjun/mythic-lacquer-hero-v3.jpg",
    mobileImage: "/zhangshengjun/mythic-lacquer-hero-mobile-v3.jpg",
    alt: "黑漆岩壁、朱砂雷痕与飞瀑之间的张圣君法主形象",
    position: "center",
    thumbPosition: "72% center",
    mobilePosition: "center",
    href: "#fanghu",
    action: "进入方壶圣境",
  },
  {
    number: "02",
    label: "凡人入圣",
    eyebrow: "FROM MORTAL TO DIVINE",
    title: "生于山野",
    accent: "志在苍生",
    text: "从放牧、采薪和制作锄柄的贫寒少年，到急公好义、济困护民的法主公。千年香火的起点，是一个普通人的选择。",
    image: "/zhangshengjun/woodcutter-origin-v2.jpg",
    alt: "闽中山路上的青年樵夫张圣君",
    position: "55% center",
    thumbPosition: "44% center",
    href: "#legend",
    action: "追随成神之路",
  },
  {
    number: "03",
    label: "雷法镇邪",
    eyebrow: "THE LUSHAN DHARMA MASTER",
    title: "黑面仗剑",
    accent: "五雷正法",
    text: "披发、跣足、宝剑与麻蛇法索，把斩妖、祈雨、治疫与护境的神迹凝结为一尊极具力量的武身法相。",
    image: "/zhangshengjun/dharma-iconography.jpg",
    alt: "黑面披发、仗剑执法索的张圣君武身法相",
    position: "52% center",
    thumbPosition: "50% center",
    href: "#heritage",
    action: "解读法相密码",
  },
  {
    number: "04",
    label: "香火人间",
    eyebrow: "A LIVING HERITAGE",
    title: "神轿游田",
    accent: "万香归宗",
    text: "当神轿穿过村巷与田垄，信仰便从神殿回到日常生活；也由闽中山地跨越海峡，进入台湾与海外华人社群。",
    image: "/zhangshengjun/ritual-procession.jpg",
    alt: "张圣君神轿与信众巡行田垄的迎神游田仪式",
    position: "center",
    thumbPosition: "center",
    href: "#global",
    action: "沿香路走向四海",
  },
];

const originSitesSource = [
  {
    title: "方壶岩母殿",
    eyebrow: "信仰原点",
    text: "青年生活、悟道与学法传说在此重叠，使方壶岩兼具“血缘地”与“法源地”的双重神圣意义。",
    detail: "网站由此向外连接月洲出生地、金沙坐化地、石牛山显法地，以及台湾与东南亚香火网络。",
    className: "originNodeMain",
  },
  {
    title: "仙桃坪",
    eyebrow: "学法修行",
    text: "传说张圣君入山遇仙、观弈食桃，由凡入圣。天然山坪因故事附着，成为朝圣者可步入的悟道现场。",
    detail: "《游宦纪闻》《夷坚志》《三山志》对遇仙、食桃或仙笋、绝粒与预言祸福保留了不同叙述。",
    className: "originNodeA",
  },
  {
    title: "雷洞",
    eyebrow: "闾山法源",
    text: "高山雷暴与洞府空间共同强化“五雷正法”的地方想象，形成地貌、神力与科仪互相印证的圣迹。",
    detail: "闾山法与瑜伽教在民间叙事中呈双轮并行，也构成张圣君“亦道亦佛”的独特底色。",
    className: "originNodeB",
  },
  {
    title: "斗鬼洞",
    eyebrow: "除妖济世",
    text: "斗五通鬼、镇山魈的传说被嵌入岩洞与石钉，让抽象的降妖叙事转化为可见、可触、可讲述的地方物证。",
    detail: "方壶岩后殿石壁的斗法石钉等景观，体现“地以神显、神由地生”的圣迹营造逻辑。",
    className: "originNodeC",
  },
  {
    title: "天池",
    eyebrow: "山水圣境",
    text: "池、台、洞、峰与岩共同构成方壶山的自然谱系。水、雾、岩壁与飞瀑把神公传说安放在真实山川之中。",
    detail: "自然奇观不是故事的布景，而是信仰记忆持续发生的空间载体。",
    className: "originNodeD",
  },
];

const landscapeCategoriesSource = [
  ["01", "宗教场所", "庙宇、祖殿、故居与灵泉"],
  ["02", "学法修行", "仙桃坪、棋盘石与洞府"],
  ["03", "除妖济世", "斩蛇石、斗法石钉与剑痕"],
  ["04", "教派法器", "法索石、净水树与雷法意象"],
  ["05", "仪式展演", "游田、庆诞与寻根进香"],
];

const legendChaptersSource = [
  {
    number: "01",
    title: "凡尘起步",
    subtitle: "从永福少年到山中樵夫",
    image: "/zhangshengjun/woodcutter-origin-v2.jpg",
    alt: "宋代闽中山路上的青年樵夫",
    text: "张圣君并非生而为神。民间记忆中的他四岁丧父、家境贫寒，曾放牧、采薪、制作锄柄，因而被乡人称作“张锄柄”。",
    quote: "底层的土地经验，使他成神后始终与农事、水利、疫病和普通人的生计相连。",
    more: "族谱常见北宋天圣二年（1024年）生的记载；《张圣君履历咒》等科仪系统则有南宋绍兴九年（1139年）生、淳熙十年（1183年）坐化的叙述。官网保留差异，不把民间信仰史压缩成单一答案。",
    facts: ["永泰月洲：出生记忆", "盘谷乡野：成长与劳作", "急公好义：护民性格的起点"],
  },
  {
    number: "02",
    title: "食桃悟道",
    subtitle: "入山遇仙，法脉双轮",
    image: "/zhangshengjun/peach-awakening.jpg",
    alt: "张圣君在山中遇仙食桃悟道",
    text: "采薪途中遇仙人对弈、忍苦食下半颗仙桃，是凡人命运的转折。自此绝粒、通晓异文、预言祸福，踏上修道济世之路。",
    quote: "方壶岩不是一处背景，而是生活地、悟道地与法源地叠合而成的信仰原点。",
    more: "《游宦纪闻》侧重食桃顿悟，《夷坚志》保留仙桃或仙笋与“似狂非狂”的异人特质，《三山志》强调绝粒与预言应验。民间又把他与闾山大法院、许真君及瑜伽教法相连。",
    facts: ["仙人对弈：奇遇母题", "食桃绝粒：由凡入圣", "闾山与瑜伽：亦道亦佛"],
  },
  {
    number: "03",
    title: "斩妖济世",
    subtitle: "五雷正法，护境安民",
    image: "/zhangshengjun/dharma-iconography.jpg",
    alt: "张圣君黑面披发执剑的武身法相",
    text: "斩蛇、斗五通鬼、祈雨、治疫、引水护田，一连串神迹把地方社会对荒蛮、旱灾和疫病的恐惧，转化为可亲近的护民神力。",
    quote: "他所降伏的不只是妖怪，也是闽中先民面对自然风险时最具体的焦虑。",
    more: "德化石牛山的斩蛇石、方壶岩的斗鬼洞、漳州祈雨与尤溪治疫，共同塑造了保境神、农业神、医药救助者与闾山法宗的复合身份。",
    facts: ["石牛山：斩蛇显法", "方壶岩：斗五通鬼", "祈雨治疫：济世护民"],
  },
  {
    number: "04",
    title: "坐化升天",
    subtitle: "由人而神，香火千年",
    image: "/zhangshengjun/ritual-procession.jpg",
    alt: "张圣君神像巡行田野所延续的千年香火",
    text: "地方传说中，张圣君于闽清金沙九龙潭巨石上披发跣足、持剑捻诀，坐化升天。凡人功德由此凝结为法主公神格。",
    quote: "生于月洲，寄居盘谷，修道方壶，显法石牛，成神金沙。",
    more: "宋明以来，地方志书、文人笔记、道坛科仪、朝廷封号与百姓口述共同推动神格演变，使他成为农业、商贸、医药、驱邪与法术传承的多面守护者。",
    facts: ["金沙九龙潭：坐化圣迹", "大化真人：历代尊号", "法主公：民间亲昵称谓"],
  },
];

const dharmaFeaturesSource = [
  {
    title: "黑面圆眼",
    short: "威慑",
    text: "黑红面色与圆瞪双目，回应斗法烟熏的传说，也形成驱鬼逐疫、震慑邪祟的视觉力量。",
    className: "dharmaHotspotFace",
  },
  {
    title: "额前隆起",
    short: "神力",
    text: "额头大包既有斗法误伤的民间解释，也被信众视为慧根与法力喷薄的鲜明标记。",
    className: "dharmaHotspotForehead",
  },
  {
    title: "披发跣足",
    short: "亲民",
    text: "披发是施法时的战斗状态，赤足则保留行走山野、涉险救民的草根气质。",
    className: "dharmaHotspotFoot",
  },
  {
    title: "手执宝剑",
    short: "镇邪",
    text: "宝剑指向斩妖、护境与执法如山的神格，也延伸为民间对公义和信用的期待。",
    className: "dharmaHotspotSword",
  },
  {
    title: "麻蛇法索",
    short: "法脉",
    text: "蛇形法索把降伏妖蛇的神迹与闾山科仪法器相连，是最具辨识度的法主符号之一。",
    className: "dharmaHotspotRope",
  },
];

const divineRolesSource = [
  { icon: Sprout, title: "农业保护", text: "祈雨、引水、游田、护禾" },
  { icon: Handshake, title: "商业信用", text: "果商、药商与大稻埕茶商" },
  { icon: Shield, title: "法术宗师", text: "闾山法宗、驱邪与护境" },
  { icon: Sparkles, title: "医药救助", text: "寻药治疫、济困安民" },
];

const networkNodesSource = [
  {
    place: "方壶岩母殿",
    meta: "永泰 · 原点",
    text: "青年生活、悟道学法与契子信俗共同构成母殿的核心权重。",
    className: "networkNodeCore",
  },
  {
    place: "金沙堂祖殿",
    meta: "闽清 · 坐化",
    text: "九龙潭坐化圣迹与迎神游田，使金沙成为祭祀与农业信俗核心。",
    className: "networkNodeA",
  },
  {
    place: "石牛山",
    meta: "德化 · 显法",
    text: "斩蛇、斗法等地貌叙事强化法主公降妖护境的神格。",
    className: "networkNodeB",
  },
  {
    place: "大稻埕法主公庙",
    meta: "台北 · 商贸",
    text: "茶商与城市商业网络把法主公发展为航运、契约与诚信守护者。",
    className: "networkNodeC",
  },
  {
    place: "苏澳晋安宫",
    meta: "宜兰 · 移民",
    text: "清道光年间的移民信仰节点，见证闽台跨海迁徙与精神安顿。",
    className: "networkNodeD",
  },
  {
    place: "海外华人社群",
    meta: "东南亚 · 传播",
    text: "伴随福建移民与商贸网络，香火进入海外华人社区并持续本土化。",
    className: "networkNodeE",
  },
];

const archiveSourcesSource = [
  ["宋代笔记", "《游宦纪闻》", "遇仙食桃、预言祸福等早期叙事线索"],
  ["宋代志怪", "《夷坚志》", "仙缘、绝粒与异人形象的文本参照"],
  ["地方志书", "《三山志》", "张道人及其地方信仰的制度化记忆"],
  ["道坛抄本", "《张圣君履历咒》", "生卒、法脉与科仪身份的另一套叙事"],
];

const ritualStepsSource = [
  ["01", "请神出殿", "科仪开启"],
  ["02", "巡行村落", "连接家户"],
  ["03", "神轿游田", "祈丰护禾"],
  ["04", "回銮安座", "共同体重聚"],
];

const artifactAtlasSource = [
  {
    number: "00",
    eyebrow: "视觉母版",
    title: "法器与材质总谱",
    text: "法剑、法索、武身衣冠与黑漆山骨在同一张总板中建立比例、质感与色彩秩序，成为整套神公影像的视觉基准。",
    image: "/zhangshengjun/reference-bible/master-prop-material-board.jpg",
    position: "center",
  },
  {
    number: "01",
    eyebrow: "镇邪法器",
    title: "五雷法剑",
    text: "窄身直刃、云头护手与旧铁包浆，把雷法威仪收束为克制而有重量的器物形象。",
    image: "/zhangshengjun/reference-bible/generated/prop-ritual-sword-sheet.jpg",
    position: "center",
  },
  {
    number: "02",
    eyebrow: "闾山法脉",
    title: "麻蛇法索",
    text: "麻纤维、朱砂结与铁环构成蛇形法索，连接降蛇传说、护法意象与闾山科仪。",
    image: "/zhangshengjun/reference-bible/generated/prop-dharma-rope-sheet.jpg",
    position: "center",
  },
  {
    number: "03",
    eyebrow: "造像纹理",
    title: "武身衣冠",
    text: "黑衣、朱褐内衫、雷纹腰扣与法具筒，让披发跣足的武身法相拥有可信的生活痕迹。",
    image: "/zhangshengjun/reference-bible/generated/costume-ornament-sheet.jpg",
    position: "center",
  },
  {
    number: "04",
    eyebrow: "漆艺地貌",
    title: "方壶山骨",
    text: "黑漆岩层、朱砂雷隙、飞瀑与崖间母殿，把方壶山水转译为可触摸的神话材质。",
    image: "/zhangshengjun/reference-bible/generated/material-fanghu-lacquer-rock-sheet.jpg",
    position: "center",
  },
  {
    number: "05",
    eyebrow: "悟道信物",
    title: "仙桃与棋石",
    text: "半桃、棋子、棋盘石与樵具对应食桃悟道的关键叙事，也保留凡人劳作的真实触感。",
    image: "/zhangshengjun/reference-bible/generated/props-peach-go-tools-sheet.jpg",
    position: "center",
  },
  {
    number: "06",
    eyebrow: "活态信俗",
    title: "游田仪仗",
    text: "神轿、长幡、灯笼、香炉与层叠水田，共同构成神圣路径在乡村中移动的完整现场。",
    image: "/zhangshengjun/reference-bible/generated/props-field-procession-kit-v2.jpg",
    position: "center",
  },
];

function localizeRecords<T extends Record<string, unknown>>(items: T[], locale: SiteLocale) {
  return items.map((item) =>
    Object.fromEntries(
      Object.entries(item).map(([key, value]) => {
        if (typeof value === "string") return [key, translate(locale, value)];
        if (Array.isArray(value)) {
          return [
            key,
            value.map((entry) => (typeof entry === "string" ? translate(locale, entry) : entry)),
          ];
        }
        return [key, value];
      }),
    ) as T,
  );
}

function localizeRows<T extends string[]>(rows: T[], locale: SiteLocale) {
  return rows.map((row) => row.map((value) => translate(locale, value)) as T);
}

function updateParallax(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
  const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  event.currentTarget.style.setProperty("--mx", x.toFixed(3));
  event.currentTarget.style.setProperty("--my", y.toFixed(3));
}

function resetParallax(event: PointerEvent<HTMLElement>) {
  event.currentTarget.style.setProperty("--mx", "0");
  event.currentTarget.style.setProperty("--my", "0");
}

function BrandMark() {
  return (
    <span className={styles.brandMark} aria-hidden="true">
      <BrandSymbol />
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  children,
  tone = "light",
  align = "left",
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
}) {
  return (
    <div
      className={`${styles.sectionHeading} ${tone === "dark" ? styles.sectionHeadingDark : ""} ${
        align === "center" ? styles.sectionHeadingCenter : ""
      }`}
      data-reveal
    >
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}

function MoreDetails({ children, label = "展开深读" }: { children: ReactNode; label?: string }) {
  return (
    <details className={styles.moreDetails}>
      <summary>
        {label}
        <ChevronDown size={16} aria-hidden="true" />
      </summary>
      <div>{children}</div>
    </details>
  );
}

export default function ZhangShengJunExperience({ locale = "zh-cn" }: { locale?: SiteLocale }) {
  const localePrefix = locale === "zh-cn" ? "" : `/${locale}`;
  const content = useMemo(
    () => ({
      navItems: localizeRecords(navItemsSource, locale).map((item) => ({
        ...item,
        href: `${mirrorBasePath}${localePrefix}${item.href}`,
      })),
      heroStats: localizeRows(heroStatsSource, locale),
      heroScenes: localizeRecords(heroScenesSource, locale),
      originSites: localizeRecords(originSitesSource, locale),
      landscapeCategories: localizeRows(landscapeCategoriesSource, locale),
      legendChapters: localizeRecords(legendChaptersSource, locale),
      dharmaFeatures: localizeRecords(dharmaFeaturesSource, locale),
      divineRoles: localizeRecords(divineRolesSource, locale),
      networkNodes: localizeRecords(networkNodesSource, locale),
      archiveSources: localizeRows(archiveSourcesSource, locale),
      ritualSteps: localizeRows(ritualStepsSource, locale),
      artifactAtlas: localizeRecords(artifactAtlasSource, locale),
    }),
    [locale, localePrefix],
  );
  const {
    navItems,
    heroStats,
    heroScenes,
    originSites,
    landscapeCategories,
    legendChapters,
    dharmaFeatures,
    divineRoles,
    networkNodes,
    archiveSources,
    ritualSteps,
    artifactAtlas,
  } = content;
  const t = (source: string) => translate(locale, source);
  const [heroActive, setHeroActive] = useState(0);
  const [heroPlaying, setHeroPlaying] = useState(false);
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  const [heroInView, setHeroInView] = useState(true);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [filmOpen, setFilmOpen] = useState(false);
  const [artifactActive, setArtifactActive] = useState<number | null>(null);
  const [originActive, setOriginActive] = useState(0);
  const [legendActive, setLegendActive] = useState(0);
  const [dharmaActive, setDharmaActive] = useState(0);
  const [networkActive, setNetworkActive] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [headerCompact, setHeaderCompact] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const filmCloseRef = useRef<HTMLButtonElement>(null);
  const artifactCloseRef = useRef<HTMLButtonElement>(null);
  const legendRefs = useRef<(HTMLElement | null)[]>([]);
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    document.documentElement.lang = localeInfo[locale].htmlLang;
  }, [locale]);

  useEffect(() => {
    let frame = 0;

    const updateScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0);
        setHeaderCompact(window.scrollY > 72);
      });
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateScroll);
    };
  }, []);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    const updateMotionPreference = () => {
      setMotionAllowed(!motionPreference.matches && !connection?.saveData);
    };

    updateMotionPreference();
    motionPreference.addEventListener("change", updateMotionPreference);
    return () => motionPreference.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const hero = heroSectionRef.current;
    if (!hero) return;

    const heroObserver = new IntersectionObserver(
      ([entry]) => setHeroInView(entry.isIntersecting),
      { threshold: 0.02 },
    );
    heroObserver.observe(hero);
    return () => heroObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!filmOpen && artifactActive === null) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFilmOpen(false);
        setArtifactActive(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    window.requestAnimationFrame(() => {
      if (filmOpen) filmCloseRef.current?.focus();
      else artifactCloseRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [artifactActive, filmOpen]);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    if (filmOpen || !motionAllowed || !heroInView) {
      video.pause();
      return;
    }

    void video.play().catch(() => setHeroPlaying(false));
  }, [filmOpen, heroInView, motionAllowed]);

  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.setAttribute("data-visible", "true");
        });
      },
      { rootMargin: "0px 0px -10%", threshold: 0.12 },
    );

    document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));
    return () => revealObserver.disconnect();
  }, []);

  useEffect(() => {
    const legendObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = Number((visible.target as HTMLElement).dataset.legendIndex);
        if (!Number.isNaN(index)) setLegendActive(index);
      },
      { rootMargin: "-28% 0px -42%", threshold: [0.12, 0.3, 0.55] },
    );

    legendRefs.current.forEach((element) => {
      if (element) legendObserver.observe(element);
    });
    return () => legendObserver.disconnect();
  }, []);

  const closeMobileMenu = () => {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
  };

  const selectHeroScene = (index: number) => {
    setHeroActive(index);
    const video = heroVideoRef.current;
    if (!video) return;

    const chapterLength = Number.isFinite(video.duration) ? video.duration / heroScenes.length : 10.054;
    video.currentTime = index * chapterLength;
    void video.play().catch(() => setHeroPlaying(false));
  };

  const stepHeroScene = (direction: number) => {
    const next = (heroActive + direction + heroScenes.length) % heroScenes.length;
    selectHeroScene(next);
  };

  const syncHeroChapter = () => {
    const video = heroVideoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;

    const chapter = Math.min(
      heroScenes.length - 1,
      Math.floor(video.currentTime / (video.duration / heroScenes.length)),
    );
    setHeroActive(chapter);
  };

  const toggleHeroPlayback = () => {
    const video = heroVideoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play().catch(() => setHeroPlaying(false));
    } else {
      video.pause();
    }
  };

  const heroScene = heroScenes[heroActive];
  const activeArtifact = artifactActive === null ? null : artifactAtlas[artifactActive];

  const stepArtifact = (direction: number) => {
    setArtifactActive((current) => {
      const index = current ?? 0;
      return (index + direction + artifactAtlas.length) % artifactAtlas.length;
    });
  };

  return (
    <main
      className={`${styles.shell} ${locale === "en" ? styles.shellEnglish : ""}`}
      lang={localeInfo[locale].htmlLang}
    >
      <div className={styles.scrollProgress} aria-hidden="true">
        <span style={{ transform: `scaleX(${scrollProgress})` }} />
      </div>

      <header className={`${styles.header} ${headerCompact ? styles.headerCompact : ""}`}>
        <a className={styles.brand} href={`${mirrorBasePath}${localePrefix}/`} aria-label={t("返回首页")}>
          <BrandMark />
          <span className={styles.brandType}>
            <strong>{t("永泰方壶岩")}</strong>
            <small>{t("张圣君母殿 · FANGHU MOTHER TEMPLE")}</small>
          </span>
        </a>

        <nav className={styles.nav} aria-label={t("网站主导航")}>
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.headerTools}>
          <nav className={styles.languageSwitcher} aria-label={t("语言版本")}>
            {siteLocales.map((siteLocale) => (
              <a
                key={siteLocale}
                href={`${mirrorBasePath}${localeInfo[siteLocale].href}`}
                hrefLang={localeInfo[siteLocale].htmlLang}
                lang={localeInfo[siteLocale].htmlLang}
                aria-current={locale === siteLocale ? "page" : undefined}
                title={localeInfo[siteLocale].label}
              >
                {localeInfo[siteLocale].shortLabel}
              </a>
            ))}
          </nav>
          <a className={styles.headerAction} href={`${mirrorBasePath}${localePrefix}/videos`}>
            <CirclePlay size={17} aria-hidden="true" />
            {t("法主视界")}
          </a>
        </div>

        <details className={styles.mobileMenu} ref={mobileMenuRef}>
          <summary aria-label={t("打开导航菜单")}>
            <Menu size={22} aria-hidden="true" />
          </summary>
          <div>
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={closeMobileMenu}>
                {item.label}
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            ))}
            <nav className={styles.mobileLocaleSwitcher} aria-label={t("语言版本")}>
              {siteLocales.map((siteLocale) => (
                <a
                  key={siteLocale}
                  href={`${mirrorBasePath}${localeInfo[siteLocale].href}`}
                  hrefLang={localeInfo[siteLocale].htmlLang}
                  lang={localeInfo[siteLocale].htmlLang}
                  aria-current={locale === siteLocale ? "page" : undefined}
                >
                  {localeInfo[siteLocale].label}
                </a>
              ))}
            </nav>
          </div>
        </details>
      </header>

      <section
        ref={heroSectionRef}
        className={`${styles.hero} ${styles.parallaxArea}`}
        id="home"
        onPointerMove={updateParallax}
        onPointerLeave={resetParallax}
      >
        <div className={`${styles.heroSceneStack} ${styles.parallaxBack}`}>
          {heroScenes.map((scene, index) => (
            <div
              className={`${styles.heroScene} ${index === heroActive ? styles.heroSceneActive : ""}`}
              key={scene.number}
              aria-hidden={index !== heroActive}
            >
              <Image
                src={scene.image}
                alt={index === heroActive ? scene.alt : ""}
                fill
                loading="eager"
                fetchPriority={index === 0 ? "high" : undefined}
                sizes={scene.mobileImage ? "(max-width: 720px) 1px, 106vw" : "106vw"}
                className={scene.mobileImage ? styles.heroSceneDesktop : undefined}
                style={{ objectPosition: scene.position }}
              />
              {scene.mobileImage ? (
                <Image
                  src={scene.mobileImage}
                  alt=""
                  fill
                  loading="eager"
                  sizes="(max-width: 720px) 104vw, 1px"
                  className={styles.heroSceneMobile}
                  style={{ objectPosition: scene.mobilePosition }}
                />
              ) : null}
            </div>
          ))}
        </div>
        {motionAllowed ? (
          <div
            className={`${styles.heroVideoLayer} ${styles.parallaxBack} ${
              heroVideoReady ? styles.heroVideoLayerReady : ""
            }`}
            aria-hidden="true"
          >
            <video
              ref={heroVideoRef}
              className={styles.heroVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              tabIndex={-1}
              onCanPlay={() => setHeroVideoReady(true)}
              onPlay={() => setHeroPlaying(true)}
              onPause={() => setHeroPlaying(false)}
              onTimeUpdate={syncHeroChapter}
              onError={() => setHeroVideoReady(false)}
            >
              <source
                src="/zhangshengjun/video/hero-cinematic-mobile.mp4"
                type="video/mp4"
                media="(max-width: 720px)"
              />
              <source src="/zhangshengjun/video/hero-cinematic-wide.mp4" type="video/mp4" />
            </video>
          </div>
        ) : null}
        <Image
          src="/zhangshengjun/overlays/mist-layer.png"
          alt=""
          width={1400}
          height={520}
          className={`${styles.heroMist} ${styles.parallaxMid}`}
          loading="eager"
          aria-hidden="true"
        />
        <div className={`${styles.heroThunderArc} ${styles.parallaxFront}`} aria-hidden="true" />
        <div className={styles.heroShade} />
        <div className={styles.heroVertical} aria-hidden="true">
          THE SACRED ORIGIN · FUJIAN, CHINA
        </div>

        <div
          className={`${styles.heroContent} ${styles.parallaxContent}`}
          key={heroScene.number}
          aria-live="polite"
        >
          <p className={styles.heroLocation}>
            <MapPin size={15} aria-hidden="true" />
            {t("中国 · 福建 · 永泰")}
          </p>
          <p className={styles.heroStrap}>{heroScene.eyebrow}</p>
          <h1>
            {heroScene.title}
            <span>{heroScene.accent}</span>
          </h1>
          <p className={styles.heroCopy}>{heroScene.text}</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href={heroScene.href}>
              {heroScene.action}
              <ArrowDown size={18} aria-hidden="true" />
            </a>
            <a className={styles.secondaryAction} href="#media">
              <CirclePlay size={18} aria-hidden="true" />
              {t("进入法主视界")}
            </a>
          </div>
        </div>

        <div className={styles.heroDirector} aria-label={t("首屏视觉章节")}>
          <div className={styles.heroDirectorHeader}>
            <div>
              <span>40S CINEMATIC MYTH</span>
              <strong>{heroScene.label}</strong>
            </div>
            <div className={styles.heroDirectorControls}>
              <span>{heroScene.number} / {String(heroScenes.length).padStart(2, "0")}</span>
              <button type="button" onClick={() => stepHeroScene(-1)} aria-label={t("上一幕")}>
                <ChevronLeft size={19} aria-hidden="true" />
              </button>
              {motionAllowed ? (
                <button
                  type="button"
                  onClick={toggleHeroPlayback}
                  aria-label={heroPlaying ? t("暂停主片") : t("播放主片")}
                >
                  {heroPlaying ? <Pause size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}
                </button>
              ) : null}
              <button type="button" onClick={() => stepHeroScene(1)} aria-label={t("下一幕")}>
                <ChevronRight size={19} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className={styles.heroFilmstrip}>
            {heroScenes.map((scene, index) => (
              <button
                type="button"
                key={scene.number}
                className={index === heroActive ? styles.heroFilmstripActive : ""}
                onClick={() => selectHeroScene(index)}
                aria-pressed={index === heroActive}
                aria-label={localizedLabel(locale, "切换到", scene.label)}
              >
                <span className={styles.heroThumbnail}>
                  <Image
                    src={scene.image}
                    alt=""
                    fill
                    loading="eager"
                    unoptimized={index === 0}
                    sizes="132px"
                    style={{ objectPosition: scene.thumbPosition }}
                  />
                </span>
                <span>{scene.number}</span>
                <strong>{scene.label}</strong>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.signalBand} aria-label={t("张圣君信仰概览")}>
        {heroStats.map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section className={styles.origin} id="fanghu" data-watermark={t("方壶")}>
        <div className={styles.sectionInner}>
          <SectionHeading eyebrow="01 · SACRED ORIGIN" title={t("天下法主，根在方壶")}>
            {t("一池、三台、七洞、三峰、二十一岩。这里的山水不是传说的布景，而是“圣迹营造”的本体：自然地貌、神公叙事与日常信仰彼此嵌合。")}
          </SectionHeading>

          <div className={styles.originExperience} data-reveal>
            <div
              className={`${styles.originMap} ${styles.parallaxArea}`}
              onPointerMove={updateParallax}
              onPointerLeave={resetParallax}
            >
              <Image
                src="/zhangshengjun/fanghu-hero.jpg"
                alt={t("方壶岩圣迹交互地图背景")}
                fill
                sizes="(max-width: 980px) 100vw, 68vw"
                className={`${styles.originMapImage} ${styles.parallaxBack}`}
              />
              <Image
                src="/zhangshengjun/overlays/ink-mountain.png"
                alt=""
                width={1180}
                height={520}
                className={`${styles.originInk} ${styles.parallaxMid}`}
                aria-hidden="true"
              />
              <Image
                src="/zhangshengjun/overlays/mist-layer.png"
                alt=""
                width={1400}
                height={520}
                className={`${styles.originMist} ${styles.parallaxFront}`}
                loading="eager"
                aria-hidden="true"
              />
              <div className={styles.originRoute} aria-hidden="true" />
              {originSites.map((site, index) => (
                <button
                  type="button"
                  key={site.title}
                  className={`${styles.originNode} ${styles[site.className]} ${
                    originActive === index ? styles.originNodeActive : ""
                  }`}
                  onClick={() => setOriginActive(index)}
                  aria-pressed={originActive === index}
                >
                  <span />
                  {site.title}
                </button>
              ))}
              <div className={styles.originMapLabel}>
                <Compass size={18} aria-hidden="true" />
                {t("方壶圣迹图")}
              </div>
            </div>

            <aside className={styles.originStory} aria-live="polite">
              <span className={styles.storyIndex}>{String(originActive + 1).padStart(2, "0")}</span>
              <p>{originSites[originActive].eyebrow}</p>
              <h3>{originSites[originActive].title}</h3>
              <strong>{originSites[originActive].text}</strong>
              <p>{originSites[originActive].detail}</p>
              <div className={styles.originStoryRule} />
              <span className={styles.originStoryHint}>{t("点击图中圣迹继续探索")}</span>
            </aside>
          </div>

          <div className={styles.landscapeRail} data-reveal>
            {landscapeCategories.map(([number, title, text]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.legend} id="legend">
        <div className={styles.sectionInner}>
          <SectionHeading eyebrow="02 · LEGEND OF APOTHEOSIS" title={t("一个凡人，如何成为千年神公")} tone="dark">
            {t("这不是四张生平卡片，而是一条由贫寒、奇遇、修行、护民功德与地方记忆共同铺成的成神之路。继续滚动，四幕依次显现。")}
          </SectionHeading>

          <div className={styles.legendJourney}>
            <div className={styles.legendVisual} aria-live="polite">
              <div className={styles.legendImageStack}>
                {legendChapters.map((chapter, index) => (
                  <Image
                    key={chapter.number}
                    src={chapter.image}
                    alt={index === legendActive ? chapter.alt : ""}
                    fill
                    loading="eager"
                    sizes="(max-width: 980px) 100vw, 50vw"
                    className={`${styles.legendStageImage} ${index === legendActive ? styles.legendStageImageActive : ""}`}
                    style={{ objectPosition: index === 0 ? "38% center" : "center" }}
                    aria-hidden={index !== legendActive}
                  />
                ))}
                <div className={styles.legendVisualShade} />
                <div className={styles.legendVisualNumber}>{legendChapters[legendActive].number}</div>
                <div className={styles.legendVisualCaption}>
                  <span>CHAPTER {legendChapters[legendActive].number}</span>
                  <strong>{legendChapters[legendActive].title}</strong>
                </div>
              </div>
              <div className={styles.legendProgress}>
                {legendChapters.map((chapter, index) => (
                  <button
                    type="button"
                    key={chapter.number}
                    aria-label={localizedLabel(locale, "查看", chapter.title)}
                    aria-pressed={legendActive === index}
                    className={legendActive === index ? styles.legendProgressActive : ""}
                    onClick={() => legendRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" })}
                  >
                    <span />
                    {chapter.number}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.legendSteps}>
              {legendChapters.map((chapter, index) => (
                <article
                  key={chapter.number}
                  ref={(element) => {
                    legendRefs.current[index] = element;
                  }}
                  data-legend-index={index}
                  className={legendActive === index ? styles.legendStepActive : ""}
                >
                  <div className={styles.legendMobileImage}>
                    <Image
                      src={chapter.image}
                      alt={chapter.alt}
                      fill
                      loading={index === 0 ? "eager" : "lazy"}
                      sizes="(max-width: 720px) calc(100vw - 2rem), (max-width: 980px) calc(100vw - 3rem), 1px"
                    />
                  </div>
                  <span className={styles.legendStepNumber}>{chapter.number}</span>
                  <p className={styles.legendStepSubtitle}>{chapter.subtitle}</p>
                  <h3>{chapter.title}</h3>
                  <p className={styles.legendStepText}>{chapter.text}</p>
                  <blockquote>{chapter.quote}</blockquote>
                  <ul>
                    {chapter.facts.map((fact) => (
                      <li key={fact}>{fact}</li>
                    ))}
                  </ul>
                  <MoreDetails label={t("展开深读")}>
                    <p>{chapter.more}</p>
                  </MoreDetails>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.syncretic} aria-labelledby="syncretic-title">
        <Image
          src="/zhangshengjun/overlays/talisman-column.png"
          alt=""
          width={360}
          height={980}
          className={styles.syncreticTalisman}
          aria-hidden="true"
        />
        <div className={styles.syncreticInner} data-reveal>
          <p>THE DUAL TRADITION</p>
          <h2 id="syncretic-title">{t("亦道 · 亦佛")}</h2>
          <div className={styles.syncreticColumns}>
            <article>
              <span>{t("闾山法脉")}</span>
              <h3>{t("雷霆之威")}</h3>
              <p>{t("五雷正法、法索、宝剑与驱邪科仪，建立护境镇邪的行动力量。")}</p>
            </article>
            <div className={styles.syncreticCenter} aria-hidden="true">
              {t("双轮")}
            </div>
            <article>
              <span>{t("瑜伽教法")}</span>
              <h3>{t("慈悲度世")}</h3>
              <p>{t("治病、救苦、济民与普度叙事，让法术始终指向现实人生。")}</p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.heritage} id="heritage">
        <div className={styles.sectionInner}>
          <SectionHeading eyebrow="03 · ICONOGRAPHY & LIVING HERITAGE" title={t("一尊法相，藏着整套民间密码")} tone="dark">
            {t("黑面、披发、跣足、宝剑与麻蛇不是装饰，而是神迹、法脉与民众愿望共同留下的视觉档案。点击法相标记，逐一解读。")}
          </SectionHeading>

          <div className={styles.dharmaExperience} data-reveal>
            <div
              className={`${styles.dharmaPortrait} ${styles.parallaxArea}`}
              onPointerMove={updateParallax}
              onPointerLeave={resetParallax}
            >
              <Image
                src="/zhangshengjun/dharma-iconography.jpg"
                alt={t("张圣君黑面披发、手执宝剑与麻蛇法索的武身法相")}
                fill
                sizes="(max-width: 980px) 100vw, 62vw"
                className={styles.parallaxBack}
              />
              <div className={styles.dharmaShade} />
              {dharmaFeatures.map((feature, index) => (
                <button
                  type="button"
                  key={feature.title}
                  className={`${styles.dharmaHotspot} ${styles[feature.className]} ${
                    dharmaActive === index ? styles.dharmaHotspotActive : ""
                  }`}
                  onClick={() => setDharmaActive(index)}
                  aria-label={localizedLabel(locale, "解读", feature.title)}
                  aria-pressed={dharmaActive === index}
                >
                  <span>{index + 1}</span>
                </button>
              ))}
              <div className={styles.dharmaCaption}>{t("武身法相 · 降妖护民")}</div>
            </div>

            <aside className={styles.dharmaAnnotation} aria-live="polite">
              <div className={styles.dharmaAnnotationIndex}>0{dharmaActive + 1}</div>
              <p>{dharmaFeatures[dharmaActive].short}</p>
              <h3>{dharmaFeatures[dharmaActive].title}</h3>
              <p>{dharmaFeatures[dharmaActive].text}</p>
              <div className={styles.dharmaFeatureNav}>
                {dharmaFeatures.map((feature, index) => (
                  <button
                    type="button"
                    key={feature.title}
                    onClick={() => setDharmaActive(index)}
                    className={dharmaActive === index ? styles.dharmaFeatureNavActive : ""}
                    aria-label={localizedLabel(locale, "切换到", feature.title)}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </aside>
          </div>

          <div className={styles.roleBand} data-reveal>
            {divineRoles.map((role) => {
              const Icon = role.icon;
              return (
                <article key={role.title}>
                  <Icon size={24} aria-hidden="true" />
                  <div>
                    <h3>{role.title}</h3>
                    <p>{role.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.artifactAtlas} id="atlas">
        <Image
          src="/zhangshengjun/reference-bible/anchors/anchor-waterfall-temple.jpg"
          alt=""
          width={546}
          height={2048}
          className={styles.artifactAtlasEdge}
          aria-hidden="true"
        />
        <div className={styles.sectionInner}>
          <SectionHeading
            eyebrow="04 · RITUAL OBJECTS & VISUAL CANON"
            title={t("器象图谱：把法主世界看得更近")}
            tone="dark"
          >
            {t("宝剑、法索、衣冠、山骨、仙桃与游田仪仗，共同组成张圣君数字影像的器物语言。它们让神迹不只被讲述，也能被细看。")}
          </SectionHeading>

          <div className={styles.artifactLead} data-reveal>
            <button
              type="button"
              className={`${styles.artifactLeadVisual} ${styles.parallaxArea}`}
              onPointerMove={updateParallax}
              onPointerLeave={resetParallax}
              onClick={() => setArtifactActive(0)}
              aria-label={localizedLabel(locale, "查看", artifactAtlas[0].title)}
            >
              <Image
                src={artifactAtlas[0].image}
                alt={artifactAtlas[0].title}
                fill
                loading="eager"
                sizes="(max-width: 980px) 100vw, 68vw"
                className={styles.parallaxBack}
                style={{ objectPosition: artifactAtlas[0].position }}
              />
              <span className={styles.artifactImageShade} />
              <span className={styles.artifactZoom}>
                <ZoomIn size={18} aria-hidden="true" />
                {t("查看完整设定")}
              </span>
            </button>
            <div className={styles.artifactLeadCopy}>
              <p>VISUAL CANON · DIGITAL INTERPRETATION</p>
              <span>{artifactAtlas[0].eyebrow}</span>
              <h3>{t("一把剑，一根法索，一身山川气")}</h3>
              <p>{artifactAtlas[0].text}</p>
              <div className={styles.artifactCount}>
                <strong>07</strong>
                <span>{t("组器物与场景设定")}</span>
              </div>
              <small>{t("数字艺术设定 · 非文物实拍")}</small>
            </div>
          </div>

          <div className={styles.artifactGrid} data-reveal>
            {artifactAtlas.slice(1).map((artifact, index) => (
              <button
                type="button"
                className={`${styles.artifactTile} ${styles.parallaxArea}`}
                key={artifact.number}
                onPointerMove={updateParallax}
                onPointerLeave={resetParallax}
                onClick={() => setArtifactActive(index + 1)}
                aria-label={localizedLabel(locale, "查看", artifact.title)}
              >
                <Image
                  src={artifact.image}
                  alt={artifact.title}
                  fill
                  loading="eager"
                  sizes="(max-width: 720px) 100vw, (max-width: 1180px) 50vw, 33vw"
                  className={styles.parallaxBack}
                  style={{ objectPosition: artifact.position }}
                />
                <span className={styles.artifactImageShade} />
                <span className={styles.artifactTileIndex}>{artifact.number}</span>
                <span className={styles.artifactTileCopy}>
                  <small>{artifact.eyebrow}</small>
                  <strong>{artifact.title}</strong>
                  <em>{artifact.text}</em>
                </span>
                <ZoomIn className={styles.artifactTileZoom} size={20} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ritual} id="ritual">
        <Image
          src="/zhangshengjun/ritual-procession.jpg"
          alt={t("村民抬神轿行进在田垄之间的迎神游田仪式")}
          fill
          sizes="100vw"
          className={styles.ritualImage}
        />
        <div className={styles.ritualShade} />
        <div className={styles.ritualContent} data-reveal>
          <span>{t("活态非遗 · 迎神游田")}</span>
          <h2>{t("神轿走过田垄，日常山村成为神圣路径")}</h2>
          <p>
            {t("夏至前后，庙宇、村巷与农田被一条巡游路线重新连接。它既祈求风调雨顺，也通过值年组织、按户协作与仪仗分工，维系乡村共同体。")}
          </p>
          <MoreDetails label={t("展开仪式逻辑")}>
            <p>
              {t("农事节奏决定仪式时间，神像巡行把生产空间临时转化为圣境；村民共同筹资、分工与迎送，则让信仰成为活态的社会治理资源。")}
            </p>
          </MoreDetails>
        </div>
        <div className={styles.ritualRoute} data-reveal>
          {ritualSteps.map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.global} id="global" data-watermark={t("香路")}>
        <div className={styles.sectionInner}>
          <SectionHeading eyebrow="05 · CROSS-STRAIT INCENSE ROUTES" title={t("从一座母殿，到一张跨海香路")}>
            {t("自明清移民以来，法主公信仰由闽中山地进入台湾城市与港口，再随华人社群远播海外。点击节点，查看每一段香火如何落地。")}
          </SectionHeading>

          <div className={styles.networkExperience} data-reveal>
            <div className={styles.networkMap}>
              <div className={styles.networkRings} aria-hidden="true" />
              <div className={styles.networkAxis} aria-hidden="true" />
              {networkNodes.map((node, index) => (
                <button
                  type="button"
                  key={node.place}
                  className={`${styles.networkNode} ${styles[node.className]} ${
                    networkActive === index ? styles.networkNodeActive : ""
                  }`}
                  onClick={() => setNetworkActive(index)}
                  aria-pressed={networkActive === index}
                >
                  <span />
                  <strong>{node.place}</strong>
                  <small>{node.meta}</small>
                </button>
              ))}
              <div className={styles.networkMapTitle}>
                <Globe2 size={22} aria-hidden="true" />
                {t("万香归宗图")}
              </div>
            </div>

            <aside className={styles.networkStory} aria-live="polite">
              <span>{String(networkActive + 1).padStart(2, "0")} / {String(networkNodes.length).padStart(2, "0")}</span>
              <p>{networkNodes[networkActive].meta}</p>
              <h3>{networkNodes[networkActive].place}</h3>
              <p>{networkNodes[networkActive].text}</p>
              <div className={styles.networkMilestones}>
                <article>
                  <strong>1827</strong>
                  <span>{t("宜兰移民信仰线索")}</span>
                </article>
                <article>
                  <strong>2000—2001</strong>
                  <span>{t("台湾信众规模化寻根")}</span>
                </article>
                <article>
                  <strong>{t("今日")}</strong>
                  <span>{t("两岸与海外持续进香")}</span>
                </article>
              </div>
            </aside>
          </div>

          <div className={styles.networkStatement} data-reveal>
            <Route size={28} aria-hidden="true" />
            <p>{t("香路不只连接庙宇，也连接移民记忆、商贸信用、乡土身份与两岸共同的文化根脉。")}</p>
          </div>
        </div>
      </section>

      <section className={styles.media} id="media">
        <div className={styles.sectionInner}>
          <SectionHeading eyebrow="06 · MEDIA & ARCHIVE" title={t("让千年神公，进入今天的观看方式")}>
            {t("网站同时服务三种阅读：二十秒看见方壶、三分钟理解传奇、三十分钟进入史料。短视频、影像策展与文献目录由此汇合。")}
          </SectionHeading>

          <div className={styles.mediaMosaic} data-reveal>
            <article className={styles.mediaFeature}>
              <Image src="/zhangshengjun/mythic-lacquer-hero-v3.jpg" alt={t("张圣君漆艺神话短片概念画面")} fill sizes="(max-width: 980px) 100vw, 58vw" />
              <div className={styles.mediaShade} />
              <div>
                <span>{t("神话影像系列 · 01")}</span>
                <h3>{t("法主降临：黑漆山骨中的千年神公")}</h3>
                <p>{t("以漆器、朱砂、法索与闽中山水建立全新视觉母版，再由连续十秒镜头扩展成可交互的首页片头。")}</p>
                <button type="button" onClick={() => setFilmOpen(true)} aria-label={t("播放法主降临完整影像")}>
                  <CirclePlay size={19} aria-hidden="true" />
                  {t("播放 40 秒主片")}
                </button>
              </div>
            </article>
            <article className={styles.mediaSideTop}>
              <Image src="/zhangshengjun/woodcutter-origin-v2.jpg" alt={t("山中樵夫短视频概念画面")} fill sizes="(max-width: 980px) 100vw, 36vw" />
              <div className={styles.mediaShade} />
              <div>
                <span>{t("人物前传 · 02")}</span>
                <h3>{t("张锄柄：神明之前的普通人")}</h3>
              </div>
            </article>
            <article className={styles.mediaSideBottom}>
              <Image src="/zhangshengjun/ritual-procession.jpg" alt={t("迎神游田纪录影像概念画面")} fill sizes="(max-width: 980px) 100vw, 36vw" />
              <div className={styles.mediaShade} />
              <div>
                <span>{t("非遗现场 · 03")}</span>
                <h3>{t("游田：一条会移动的圣路")}</h3>
              </div>
            </article>
          </div>

          <div className={styles.archive} id="archive" data-reveal>
            <div className={styles.archiveIntro}>
              <BookOpenText size={34} aria-hidden="true" />
              <p>{t("文库与史料")}</p>
              <h3>{t("把传说放回文本，把文本放回田野")}</h3>
              <p>
                {t("文库将区分古籍原文、地方志、科仪抄本、田野记录与当代研究，并明确标示生卒年、封号等材料差异。")}
              </p>
              <a href="mailto:info@zhangshengjun.org">
                {t("提交史料线索")}
                <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>
            <div className={styles.archiveList}>
              {archiveSources.map(([type, title, text], index) => (
                <article key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <p>{type}</p>
                    <h4>{title}</h4>
                    <p>{text}</p>
                  </div>
                  <ScrollText size={21} aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {activeArtifact ? (
        <div
          className={styles.artifactModal}
          role="dialog"
          aria-modal="true"
          aria-label={`${t("器象图谱")} · ${activeArtifact.title}`}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setArtifactActive(null);
          }}
        >
          <div className={styles.artifactModalStage}>
            <button
              ref={artifactCloseRef}
              className={styles.artifactModalClose}
              type="button"
              onClick={() => setArtifactActive(null)}
              aria-label={t("关闭图鉴")}
            >
              <X size={22} aria-hidden="true" />
            </button>
            <div className={styles.artifactModalVisual}>
              <Image
                src={activeArtifact.image}
                alt={activeArtifact.title}
                fill
                loading="eager"
                sizes="(max-width: 980px) 100vw, 76vw"
              />
            </div>
            <aside className={styles.artifactModalCopy}>
              <span>{String((artifactActive ?? 0) + 1).padStart(2, "0")} / {String(artifactAtlas.length).padStart(2, "0")}</span>
              <p>{activeArtifact.eyebrow}</p>
              <h3>{activeArtifact.title}</h3>
              <p>{activeArtifact.text}</p>
              <small>{t("数字艺术设定 · 非文物实拍")}</small>
              <div>
                <button type="button" onClick={() => stepArtifact(-1)} aria-label={t("上一件")}>
                  <ChevronLeft size={21} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => stepArtifact(1)} aria-label={t("下一件")}>
                  <ChevronRight size={21} aria-hidden="true" />
                </button>
              </div>
            </aside>
          </div>
        </div>
      ) : null}

      {filmOpen ? (
        <div
          className={styles.filmModal}
          role="dialog"
          aria-modal="true"
          aria-label={t("法主降临完整影像")}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setFilmOpen(false);
          }}
        >
          <div className={styles.filmStage}>
            <button
              ref={filmCloseRef}
              className={styles.filmClose}
              type="button"
              onClick={() => setFilmOpen(false)}
              aria-label={t("关闭影像")}
            >
              <X size={22} aria-hidden="true" />
            </button>
            <video
              className={styles.filmPlayer}
              autoPlay
              controls
              playsInline
              preload="metadata"
              poster="/zhangshengjun/mythic-lacquer-hero-v3.jpg"
            >
              <source
                src="/zhangshengjun/video/hero-cinematic-mobile.mp4"
                type="video/mp4"
                media="(max-width: 720px)"
              />
              <source src="/zhangshengjun/video/hero-cinematic-wide.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      ) : null}

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <BrandMark />
          <div>
            <strong>{t("永泰方壶岩 · 张圣君母殿")}</strong>
            <p>{t("天下法主，根在方壶")}</p>
          </div>
        </div>
        <div className={styles.footerAddress}>
          <MapPin size={18} aria-hidden="true" />
          <span>{t("福建省福州市永泰县盘谷乡方壶山")}</span>
        </div>
        <nav aria-label={t("页脚导航")}>
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>
        <p className={styles.footerLegal}>
          © {new Date().getFullYear()} {t("永泰方壶岩张圣君母殿管理委员会 / 福建张圣君信仰文化研究会")}
        </p>
      </footer>
    </main>
  );
}
