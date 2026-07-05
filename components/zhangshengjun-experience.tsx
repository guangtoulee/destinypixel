import Image from "next/image";
import {
  ArrowDown,
  BookOpenText,
  ChevronRight,
  CirclePlay,
  Flame,
  Globe2,
  Landmark,
  MapPinned,
  Menu,
  Mountain,
  Play,
  ScrollText,
  Shield,
  Sparkles,
  Swords,
  Trees,
} from "lucide-react";
import styles from "./zhangshengjun-experience.module.css";

const navItems = [
  { label: "首页", href: "#home" },
  { label: "母殿溯源", href: "#fanghu" },
  { label: "神公传奇", href: "#legend" },
  { label: "信俗法相", href: "#heritage" },
  { label: "两岸四海", href: "#global" },
  { label: "影音文库", href: "#media" },
];

const legendCards = [
  {
    icon: Trees,
    title: "少而有志",
    tag: "乡野奇童",
    text: "相传张圣君出身闽中山乡，幼年家贫，采薪、放牧、制售锄柄，因而被乡人称为“张锄柄”。他急公好义，习武护弱，传奇由凡俗乡野开始。",
  },
  {
    icon: Sparkles,
    title: "食桃悟道",
    tag: "方壶法源",
    text: "在方壶山水之间，张圣君遇仙对弈、忍苦食桃，由此豁然开悟。方壶岩也因此兼具生活地、悟道地与法源地的神圣意义。",
  },
  {
    icon: Swords,
    title: "降妖济世",
    tag: "闾山法主",
    text: "传说他学成闾山正法，仗剑镇邪、祈雨护田、引水灌溉，并在石牛山斗法降伏邪祟，被百姓尊为农业保护神。",
  },
  {
    icon: Flame,
    title: "坐化升天",
    tag: "千年神公",
    text: "地方传说中，张圣君最终于九龙潭巨石上盘坐羽化，由凡人入神明。此后法主公信仰在福建、台湾及海外华人社会持续流布。",
  },
];

const originPoints = [
  {
    icon: Mountain,
    title: "一池三台七洞",
    text: "丹霞岩壁、飞瀑云岚与山中洞府共同构成方壶岩的圣迹空间。天池、仙桃坪、雷洞等地貌，让自然奇观与神公传说彼此嵌合。",
  },
  {
    icon: Landmark,
    title: "母殿原点",
    text: "网站叙事以永泰方壶岩母殿为原点展开：先确立血缘地与法源地，再连接金沙、石牛山及两岸宫庙网络。",
  },
  {
    icon: ScrollText,
    title: "契子信俗",
    text: "方壶岩保留“认契父”的民间信俗，信众以文本契约与仪式关系建立神人羁绊，祈愿一生平安、家业长兴。",
  },
];

const heritageDetails = [
  ["黑面圆眼", "驱邪逐疫的威慑力，也回应斗法传说中烟火熏面、双目圆瞪的民间想象。"],
  ["披发跣足", "呈现施法救民时的战斗状态，强调下界护佑、涉险济世的神格气质。"],
  ["手执宝剑", "象征法主镇邪、护境安民；与闾山科仪中的法器意象相互呼应。"],
  ["麻蛇法索", "以蛇形绳索、法索等符号连接闾山法脉，突出亦道亦佛的复合信仰底色。"],
];

const globalRoutes = [
  { place: "永泰方壶岩母殿", note: "法脉原点" },
  { place: "闽清金沙祖殿", note: "坐化圣迹" },
  { place: "德化石牛山", note: "斗法传说" },
  { place: "台北大稻埕法主公庙", note: "台湾信俗节点" },
  { place: "宜兰晋安宫", note: "两岸进香节点" },
  { place: "东南亚华人社群", note: "海外传播" },
];

const mediaCards = [
  {
    eyebrow: "短视频系列 01",
    title: "深山樵夫，少而有志",
    text: "以闽中山路、锄柄、少年习武为视觉线索，建立凡人起点的亲近感。",
    image: "/zhangshengjun/peach-awakening.jpg",
  },
  {
    eyebrow: "短视频系列 02",
    title: "仙人对弈，食桃悟道",
    text: "用东方奇幻的镜头语言表现方壶岩的悟道瞬间，适合做首批出海内容。",
    image: "/zhangshengjun/peach-awakening.jpg",
  },
  {
    eyebrow: "短视频系列 03",
    title: "游田祈福，活态非遗",
    text: "聚焦方壶岩与闽中乡土的游田、契子、进香场景，拉近年轻观众距离。",
    image: "/zhangshengjun/ritual-procession.jpg",
  },
];

function SectionIntro({
  eyebrow,
  title,
  children,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div className={`${styles.sectionIntro} ${align === "left" ? styles.sectionIntroLeft : ""}`}>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
    </div>
  );
}

export default function ZhangShengJunExperience() {
  return (
    <main className={styles.shell}>
      <section className={styles.hero} id="home">
        <Image
          src="/zhangshengjun/fanghu-hero.jpg"
          alt="永泰方壶岩母殿山水圣境"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroVeil} />

        <header className={styles.header}>
          <a className={styles.brand} href="#home" aria-label="返回首页">
            <span className={styles.brandMark}>法</span>
            <span>
              <strong>永泰方壶岩</strong>
              <small>张圣君母殿</small>
            </span>
          </a>

          <nav className={styles.nav} aria-label="张圣君网站导航">
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <a className={styles.watchLink} href="#media">
            <CirclePlay size={18} aria-hidden="true" />
            观看影像
          </a>

          <details className={styles.mobileMenu}>
            <summary aria-label="打开导航">
              <Menu size={22} aria-hidden="true" />
            </summary>
            <div>
              {navItems.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
          </details>
        </header>

        <div className={styles.heroContent}>
          <p className={styles.heroKicker}>千年神公 · 闾山法主 · 农业保护神</p>
          <h1>
            <span>永泰方壶岩</span>
            <span>张圣君母殿</span>
          </h1>
          <p className={styles.heroCopy}>
            探寻张圣君信仰的血缘地与法源地：从闽中山水间的农家子弟，到跨越海峡与海外的法主公信仰网络。
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryLink} href="#fanghu">
              开启溯源之旅
              <ArrowDown size={18} aria-hidden="true" />
            </a>
            <a className={styles.secondaryLink} href="#legend">
              了解神公传奇
              <ChevronRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className={styles.heroPeek}>
          <span>母殿原点</span>
          <span>神公传奇</span>
          <span>信俗非遗</span>
          <span>两岸四海</span>
        </div>
      </section>

      <section className={styles.origin} id="fanghu">
        <SectionIntro eyebrow="Sacred Origin" title="天下法主，根在方壶">
          永泰方壶岩是本网站的叙事原点。这里承载张圣君青年时期生活、悟道与学法的传说，也是连接闽中祖庭、两岸宫庙与海外华人社群的母殿核心。
        </SectionIntro>

        <div className={styles.originLayout}>
          <div className={styles.terrainPanel} aria-label="方壶岩圣迹示意">
            <div className={styles.terrainGlow} />
            <div className={`${styles.route} ${styles.routeOne}`} />
            <div className={`${styles.route} ${styles.routeTwo}`} />
            <div className={`${styles.route} ${styles.routeThree}`} />
            <div className={`${styles.mapNode} ${styles.nodeMain}`}>
              <MapPinned size={24} aria-hidden="true" />
              <strong>方壶岩母殿</strong>
              <span>血缘地 · 法源地</span>
            </div>
            <div className={`${styles.mapNode} ${styles.nodeA}`}>仙桃坪</div>
            <div className={`${styles.mapNode} ${styles.nodeB}`}>雷洞</div>
            <div className={`${styles.mapNode} ${styles.nodeC}`}>斗鬼洞</div>
            <div className={`${styles.mapNode} ${styles.nodeD}`}>天池</div>
          </div>

          <div className={styles.originCards}>
            {originPoints.map((point) => {
              const Icon = point.icon;
              return (
                <article className={styles.pointCard} key={point.title}>
                  <Icon size={22} aria-hidden="true" />
                  <h3>{point.title}</h3>
                  <p>{point.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.legend} id="legend">
        <SectionIntro eyebrow="Legend Timeline" title="从“张锄柄”到千年神公">
          以四个关键叙事节点，呈现张圣君由凡入圣的生命轨迹。官网第一版采用“相传、地方传说”的稳健表述，为后续史料校勘留出空间。
        </SectionIntro>

        <div className={styles.legendShowcase}>
          <div className={styles.legendImage}>
            <Image
              src="/zhangshengjun/peach-awakening.jpg"
              alt="张圣君食桃悟道的电影感场景"
              fill
              sizes="(max-width: 1080px) 100vw, 46vw"
            />
          </div>
          <div className={styles.timelineGrid}>
            {legendCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <article className={styles.timelineCard} key={card.title}>
                  <div className={styles.timelineNumber}>{String(index + 1).padStart(2, "0")}</div>
                  <Icon size={22} aria-hidden="true" />
                  <span>{card.tag}</span>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.heritage} id="heritage">
        <div className={styles.splitSection}>
          <div>
            <SectionIntro eyebrow="Living Heritage" title="黑面披发，仗剑镇邪" align="left">
              张圣君的经典武身法相，将闾山法脉、降妖传说、驱邪避疫和农业护佑凝结为一尊可被民众亲近、敬畏与托付的神明形象。
            </SectionIntro>
            <div className={styles.detailList}>
              {heritageDetails.map(([title, text]) => (
                <article key={title}>
                  <Shield size={20} aria-hidden="true" />
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className={styles.imageFrame}>
            <Image
              src="/zhangshengjun/dharma-iconography.jpg"
              alt="张圣君黑面披发执剑法相概念图"
              fill
              sizes="(max-width: 1080px) 100vw, 54vw"
            />
          </div>
        </div>

        <div className={styles.ritualBand}>
          <Image
            src="/zhangshengjun/ritual-procession.jpg"
            alt="张圣君游田进香仪式"
            width={1774}
            height={887}
          />
          <div>
            <span>Rituals & Intangible Heritage</span>
            <h3>游田祈福，护佑五谷</h3>
            <p>
              张圣君作为农业保护神的身份，最鲜活地呈现在游田、进香、契子与乡土节庆之中。网站将以图文、短视频和文库资料持续记录这些活态传承。
            </p>
          </div>
        </div>
      </section>

      <section className={styles.global} id="global">
        <SectionIntro eyebrow="Global Network" title="法水长流，同源同心">
          从永泰方壶岩出发，张圣君信仰连接闽中祖庭、台湾宫庙与海外华人社群。官网以“万香归宗”为核心叙事，呈现两岸同根与四海传承。
        </SectionIntro>

        <div className={styles.networkBoard}>
          <div className={styles.networkCore}>
            <Globe2 size={54} aria-hidden="true" />
            <strong>方壶岩母殿</strong>
            <span>万香归宗</span>
          </div>
          <div className={styles.routeList}>
            {globalRoutes.map((route) => (
              <article key={route.place}>
                <MapPinned size={20} aria-hidden="true" />
                <div>
                  <h3>{route.place}</h3>
                  <p>{route.note}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.media} id="media">
        <SectionIntro eyebrow="Media Center" title="法主视界：短视频与文创矩阵">
          面向年轻群体和海外传播，首页预留短视频、纪录片、文创资讯与学术文库入口。真实视频素材到位后，可直接替换当前图像封面。
        </SectionIntro>

        <div className={styles.mediaGrid}>
          {mediaCards.map((item) => (
            <article className={styles.mediaCard} key={item.title}>
              <div className={styles.mediaThumb}>
                <Image src={item.image} alt={item.title} fill sizes="(max-width: 1080px) 100vw, 33vw" />
                <button type="button" aria-label={`播放${item.title}`}>
                  <Play size={19} fill="currentColor" aria-hidden="true" />
                </button>
              </div>
              <span>{item.eyebrow}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className={styles.archiveCta}>
          <div>
            <BookOpenText size={28} aria-hidden="true" />
            <h3>文库与史料</h3>
            <p>
              后续可收录宋元明清文献、地方志、道坛抄本、非遗申报材料与两岸交流记录，形成面向研究者的开放资料库。
            </p>
          </div>
          <a className={styles.primaryLinkDark} href="mailto:info@zhangshengjun.org">
            联系共建
            <ChevronRight size={18} aria-hidden="true" />
          </a>
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          <strong>永泰方壶岩·张圣君母殿</strong>
          <p>福建省福州市永泰县盘谷乡方壶山</p>
        </div>
        <div className={styles.footerLinks}>
          <a href="#fanghu">母殿溯源</a>
          <a href="#heritage">信俗非遗</a>
          <a href="#media">影音文库</a>
        </div>
        <p>© {new Date().getFullYear()} 永泰方壶岩张圣君母殿管理委员会 / 福建张圣君信仰文化研究会</p>
      </footer>
    </main>
  );
}
