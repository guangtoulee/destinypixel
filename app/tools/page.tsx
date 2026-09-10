import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, BookOpen, Compass, Layers3, Sparkles } from "lucide-react";
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
    eyebrow: "A place to explore, create and practice", title: "Find your next starting point.",
    intro: "Choose by what you want to do. See what to prepare and what each tool produces before you begin.",
    browse: "Explore the tools", guideCta: "Read the beginner guide", prepare: "Bring", result: "Get", open: "Open tool", chinese: "Chinese interface",
    noteTitle: "New here? Start with one small task.",
    note: "Try a Birth Totem if you have your birth details, browse a prompt example for your next image, or choose a textbook unit for English practice.",
    noteCta: "See the steps and limitations", contact: "Contact", footer: "Tools for curiosity, creative work and steady practice.",
    groups: {
      discovery: { title: "Self-discovery", number: "01", description: "Symbolic perspectives, personal questions and visual experiments. Use the results as prompts for reflection." },
      creation: { title: "AI creation", number: "02", description: "Find a reference, develop a story and plan how to make it. These tools produce ideas and production text; video generation happens separately." },
      learning: { title: "English learning", number: "03", description: "Choose a starting point, practice without looking at the answer, and return for review. The learning interfaces use Chinese instructions." },
    },
  },
  zh: {
    home: "首页", guide: "使用指南（英文）", directory: "工具目录", navigation: "主导航", language: "目录语言",
    eyebrow: "探索自己，也探索新的创作与学习方式", title: "找到适合你的下一步。",
    intro: "按你想做的事选择工具。先看需要准备什么、能够得到什么，再开始。",
    browse: "浏览全部工具", guideCta: "阅读入门指南（英文）", prepare: "需要准备", result: "可以得到", open: "打开工具", chinese: "中文界面",
    noteTitle: "第一次来，从一件小事开始。",
    note: "有出生资料，可以试试本命灵构；正在准备创作，可以先找一个提示词案例；想练英语，可以从一个教材单元开始。",
    noteCta: "查看步骤与使用边界（英文）", contact: "联系反馈", footer: "为好奇心、创作和日常练习提供一个入口。",
    groups: {
      discovery: { title: "自我探索", number: "01", description: "从象征意象、具体问题和视觉体验出发，把结果当作自我观察的提示。" },
      creation: { title: "AI 创作", number: "02", description: "找参考、写故事，再规划制作方式。这些工具产出创意和制作文本，视频生成需要在其他工具中完成。" },
      learning: { title: "英语学习", number: "03", description: "选好起点，尝试不看答案回忆，再回来复习。学习工具使用中文引导。" },
    },
  },
};

const groups: { key: ToolGroup; icon: typeof Compass }[] = [
  { key: "discovery", icon: Compass }, { key: "creation", icon: Layers3 }, { key: "learning", icon: BookOpen },
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
        <nav className={styles.navigation} aria-label={text.navigation}><Link href={homeHref}>{text.home}</Link><Link href="/learn" hrefLang="en">{text.guide}</Link></nav>
        <nav className={styles.languages} aria-label={text.language}><Link href="/tools" hrefLang="en" lang="en" aria-current={locale === "en" ? "page" : undefined}>EN</Link><Link href="/tools?locale=zh" hrefLang="zh-Hans" lang="zh-Hans" aria-current={locale === "zh" ? "page" : undefined}>中文</Link></nav>
      </header>
      <section className={styles.hero}>
        <div><p className={styles.eyebrow}><Sparkles size={15} aria-hidden="true" />{text.eyebrow}</p><h1>{text.title}</h1><p className={styles.intro}>{text.intro}</p><div className={styles.heroActions}><a className={styles.primary} href="#directory">{text.browse}<ArrowDown size={16} aria-hidden="true" /></a><Link className={styles.textLink} href="/learn" hrefLang="en">{text.guideCta}<ArrowRight size={16} aria-hidden="true" /></Link></div></div>
        <div className={styles.heroMap} aria-hidden="true"><div className={styles.mapOrbit} /><div className={styles.mapCore}><Sparkles size={34} strokeWidth={1.25} /></div>{groups.map(({ key, icon: Icon }) => <div key={key} className={styles.mapLabel} data-group={key}><Icon size={19} strokeWidth={1.5} /><span>{text.groups[key].title}</span></div>)}</div>
      </section>
      <div className={styles.content} id="directory">
        <nav className={styles.groupNavigation} aria-label={text.directory}>{groups.map(({ key, icon: Icon }) => <a href={`#${key}`} key={key}><Icon size={16} aria-hidden="true" />{text.groups[key].title}<span>{directoryTools.filter((tool) => tool.group === key).length}</span></a>)}</nav>
        {groups.map(({ key, icon: Icon }) => <section key={key} className={styles.group} id={key} aria-labelledby={`${key}-title`}>
          <div className={styles.groupHeading}><span className={styles.groupNumber}>{text.groups[key].number}</span><div><h2 id={`${key}-title`}>{text.groups[key].title}</h2><p>{text.groups[key].description}</p></div></div>
          <div className={styles.grid}>{directoryTools.filter((tool) => tool.group === key).map((tool) => {
            const item = tool.copy[locale];
            return <Link className={styles.card} href={directoryToolHref(tool, locale)} key={tool.key} data-analytics-tool={tool.key} data-analytics-location="tools"><div className={styles.cardTop}><span className={styles.toolIcon}><Icon size={19} aria-hidden="true" /></span>{!tool.localized && <span className={styles.languageTag}>{text.chinese}</span>}</div><h3>{item.name}</h3><p className={styles.description}>{item.description}</p><dl className={styles.toolDetails}><div><dt>{text.prepare}</dt><dd>{item.prepare}</dd></div><div><dt>{text.result}</dt><dd>{item.result}</dd></div></dl><span className={styles.cardAction}>{text.open}<ArrowRight size={16} aria-hidden="true" /></span></Link>;
          })}</div>
        </section>)}
        <aside className={styles.startNote}><BookOpen size={26} aria-hidden="true" /><div><h2>{text.noteTitle}</h2><p>{text.note}</p><Link href="/learn" hrefLang="en">{text.noteCta}<ArrowRight size={15} aria-hidden="true" /></Link></div></aside>
      </div>
      <footer className={styles.footer}><div><strong>DestinyPixel</strong><p>{text.footer}</p></div><nav aria-label={locale === "zh" ? "页脚导航" : "Footer navigation"}><Link href={homeHref}>{text.home}</Link><Link href="/learn" hrefLang="en">{text.guide}</Link><a href="mailto:anyulee@foxmail.com">{text.contact}</a></nav></footer>
    </main>
  );
}
