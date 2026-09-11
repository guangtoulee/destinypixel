import { destinySupportHref } from "@/lib/support-contact";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, BookOpen, Compass, Gem, Sparkles, SunMoon } from "lucide-react";
import { absoluteUrl, makePageMetadata, routeSeo, siteName } from "@/lib/seo";
import { directoryToolHref, directoryTools, type DirectoryLocale, type ToolGroup } from "@/lib/tool-directory";
import styles from "./tools.module.css";

type PageProps = { searchParams?: Promise<{ locale?: string }> };

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  return makePageMetadata({ ...routeSeo.tools, locale: params?.locale === "zh" ? "zh" : "en" });
}

const copy = {
  en: {
    home: "Home", guide: "Getting started", directory: "Tool directory", navigation: "Main navigation", language: "Directory language",
    eyebrow: "Astrology, divination and five-element design", title: "Explore your symbolic world.",
    intro: "Explore a birth map, reflect on a question or design a five-element bracelet. See what each experience needs before you begin.",
    browse: "Explore the tools", guideCta: "Read the beginner guide", prepare: "Bring", result: "Get", open: "Open tool",
    noteTitle: "New here? Start with one small task.",
    note: "Try a Birth Totem with your birth details, bring one specific question to the Oracle, or explore colors in the bracelet atelier.",
    noteCta: "See the steps and limitations", contact: "Contact", footer: "Birth symbolism, personal reflection and five-element inspiration.",
    groups: {
      birth: { title: "Birth maps & totems", number: "01", description: "Begin with your birth details. Explore a symbolic reading or the geometry of Four Pillars and five-element relationships." },
      insight: { title: "Divination & observation", number: "02", description: "Bring a question, draw a temple stick or reflect on the details you observe. Treat the readings as symbolic perspectives." },
      elements: { title: "Five-element design", number: "03", description: "Bring symbolic color relationships into a personal bracelet design. Choose gemstones and arrange each bead yourself." },
    },
  },
  zh: {
    home: "首页", guide: "使用指南（英文）", directory: "工具目录", navigation: "主导航", language: "目录语言",
    eyebrow: "命理图谱、灵签问事与五行手串", title: "从命理图谱，到五行手串。",
    intro: "看出生图谱、问一件具体的事，或设计一条五行手串。先了解每项体验需要什么，再开始探索。",
    browse: "浏览全部工具", guideCta: "阅读入门指南（英文）", prepare: "需要准备", result: "可以得到", open: "打开工具",
    noteTitle: "第一次来，从一件小事开始。",
    note: "有出生资料，可以试试本命灵构；有具体问题，可以进入一事一问；想把五行配色融入日常，可以从灵石手串工坊开始。",
    noteCta: "查看步骤与使用边界（英文）", contact: "联系反馈", footer: "从出生意象、自我观察到五行生活灵感。",
    groups: {
      birth: { title: "命理图谱", number: "01", description: "从出生资料出发，阅读象征性的个人解读，或探索四柱、五行关系构成的几何图腾。" },
      insight: { title: "问事与观相", number: "02", description: "带着具体问题抽签问事，或从自己确认的手相、面部细节出发，获得另一种观察角度。" },
      elements: { title: "五行手串", number: "03", description: "将五行配色融入个人手串设计，挑选宝石，亲手安排每一颗珠子的颜色与位置。" },
    },
  },
};

const groups: { key: ToolGroup; icon: typeof Compass }[] = [
  { key: "birth", icon: SunMoon }, { key: "insight", icon: Compass }, { key: "elements", icon: Gem },
];

export default async function ToolsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale: DirectoryLocale = params?.locale === "zh" ? "zh" : "en";
  const text = copy[locale];
  const homeHref = locale === "zh" ? "/?locale=zh" : "/";
  const schema = {
    "@context": "https://schema.org", "@type": "CollectionPage", name: `${siteName} · ${text.directory}`,
    description: text.intro, url: absoluteUrl(locale === "zh" ? "/tools?locale=zh" : "/tools"), inLanguage: locale === "zh" ? "zh-Hans" : "en",
    mainEntity: { "@type": "ItemList", itemListElement: directoryTools.map((tool, index) => ({ "@type": "ListItem", position: index + 1, name: tool.copy[locale].name, url: absoluteUrl(directoryToolHref(tool, locale)) })) },
  };
  return (
    <main className={styles.page} lang={locale === "zh" ? "zh-Hans" : "en"}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <header className={styles.header}>
        <Link className={styles.brand} href={homeHref}><span aria-hidden="true" />DestinyPixel</Link>
        <nav className={styles.navigation} aria-label={text.navigation}><Link href={homeHref}>{text.home}</Link><Link href="/learn" hrefLang="en">{text.guide}</Link><Link href={locale === "zh" ? "/journal?locale=zh" : "/journal"}>{locale === "zh" ? "原创文章" : "Journal"}</Link></nav>
        <nav className={styles.languages} aria-label={text.language}><Link href="/tools" hrefLang="en" lang="en" aria-current={locale === "en" ? "page" : undefined}>EN</Link><Link href="/tools?locale=zh" hrefLang="zh-Hans" lang="zh-Hans" aria-current={locale === "zh" ? "page" : undefined}>中文</Link></nav>
      </header>
      <section className={styles.hero}>
        <div><p className={styles.eyebrow}><Sparkles size={15} aria-hidden="true" />{text.eyebrow}</p><h1>{text.title}</h1><p className={styles.intro}>{text.intro}</p><div className={styles.heroActions}><a className={styles.primary} href="#directory">{text.browse}<ArrowDown size={16} aria-hidden="true" /></a><Link className={styles.textLink} href="/learn" hrefLang="en">{text.guideCta}<ArrowRight size={16} aria-hidden="true" /></Link></div></div>
        <div className={styles.heroMap} aria-hidden="true"><div className={styles.mapOrbit} /><div className={styles.mapCore}><Sparkles size={34} strokeWidth={1.25} /></div>{groups.map(({ key, icon: Icon }) => <div key={key} className={styles.mapLabel} data-group={key}><Icon size={19} strokeWidth={1.5} /><span>{text.groups[key].title}</span></div>)}</div>
      </section>
      <div className={styles.content} id="directory">
        <nav className={styles.groupNavigation} aria-label={text.directory}>{groups.map(({ key, icon: Icon }) => <a href={`#${key}`} key={key}><Icon size={16} aria-hidden="true" />{text.groups[key].title}<span>{directoryTools.filter((tool) => tool.group === key).length}</span></a>)}</nav>
        {groups.map(({ key, icon: Icon }) => <section key={key} className={styles.group} data-group={key} id={key} aria-labelledby={`${key}-title`}>
          <div className={styles.groupHeading}><span className={styles.groupNumber}>{text.groups[key].number}</span><div><h2 id={`${key}-title`}>{text.groups[key].title}</h2><p>{text.groups[key].description}</p></div></div>
          <div className={styles.grid}>{directoryTools.filter((tool) => tool.group === key).map((tool) => {
            const item = tool.copy[locale];
            return <Link className={styles.card} href={directoryToolHref(tool, locale)} key={tool.key} data-analytics-tool={tool.key} data-analytics-location="tools"><div className={styles.cardTop}><span className={styles.toolIcon}><Icon size={19} aria-hidden="true" /></span></div><h3>{item.name}</h3><p className={styles.description}>{item.description}</p><dl className={styles.toolDetails}><div><dt>{text.prepare}</dt><dd>{item.prepare}</dd></div><div><dt>{text.result}</dt><dd>{item.result}</dd></div></dl><span className={styles.cardAction}>{text.open}<ArrowRight size={16} aria-hidden="true" /></span></Link>;
          })}</div>
        </section>)}
        <aside className={styles.startNote}><BookOpen size={26} aria-hidden="true" /><div><h2>{text.noteTitle}</h2><p>{text.note}</p><Link href="/learn" hrefLang="en">{text.noteCta}<ArrowRight size={15} aria-hidden="true" /></Link></div></aside>
      </div>
      <footer className={styles.footer}><div><strong>DestinyPixel</strong><p>{text.footer}</p></div><nav aria-label={locale === "zh" ? "页脚导航" : "Footer navigation"}><Link href={homeHref}>{text.home}</Link><Link href="/learn" hrefLang="en">{text.guide}</Link><Link href={locale === "zh" ? "/journal?locale=zh" : "/journal"}>{locale === "zh" ? "原创文章" : "Journal"}</Link><a href={destinySupportHref}>{text.contact}</a></nav></footer>
    </main>
  );
}
