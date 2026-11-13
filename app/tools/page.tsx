import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, BookOpen, Compass, HeartHandshake, Sparkles, SunMoon } from "lucide-react";
import { AmbientAstrolabe, SiteFooterV2, SiteHeaderV2 } from "@/components/v2/site-chrome";
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
    directory: "Tool directory",
    eyebrow: "East–West Symbolic Observatory",
    title: "Every reading room, clearly explained.",
    intro:
      "Explore birth astronomy and Four Pillars portraits, sit with one concrete question at a divination table, or compare two charts side by side. See what each room requires before you begin.",
    browse: "Browse all rooms",
    guideCta: "Read how it works",
    prepare: "Bring",
    result: "Receive",
    open: "Enter room",
    noteTitle: "New here? Begin with one quiet entry point.",
    note:
      "Start with your birth date alone in the 60 Day Pillar portrait, bring a present question to the Mountain-Lake Tarot table or Temple Fortune Sticks, or compare two birthdays in Synastry.",
    noteCta: "Steps & symbolic boundaries",
    sticksGuide: "Guanyin fortune sticks",
    compatibilityGuide: "BaZi love compatibility",
    oracleGuide: "I Ching vs Tarot",
    palmGuide: "Chinese vs Western palmistry",
    groups: {
      birth: {
        title: "Birth maps & archetypes",
        number: "01",
        description:
          "Begin with your birth date (and optional birth time & city) to explore 60 GanZhi archetypes, tropical natal wheels, and Five-Element geometry.",
      },
      insight: {
        title: "Divination & observation",
        number: "02",
        description:
          "Bring one focused question to the 78-card Tarot table, five temple stick traditions, three-coin I Ching, or symbolic observation studios.",
      },
      relationships: {
        title: "Synastry & annual cycles",
        number: "03",
        description:
          "Compare two birth charts across BaZi Day Masters and Western planetary aspects, or read your personalized 2027 annual rhythm.",
      },
    },
  },
  zh: {
    directory: "全站工具目录",
    eyebrow: "东方星历 · 中西命理与问事全览",
    title: "全站星历与问事空间一览。",
    intro:
      "从六十甲子日柱、回归星盘与本命几何灵构，到山湖塔罗、五系古庙灵签、周易六爻与双人合盘。先看清每项体验需要准备什么，再从容落座。",
    browse: "浏览全部空间",
    guideCta: "阅读使用指南（英文）",
    prepare: "需要准备",
    result: "你将获得",
    open: "进入体验",
    noteTitle: "第一次来，不妨从最轻的一步开始。",
    note:
      "只记得公历生日，可以先查六十日柱意象卡；心里正悬着具体抉择，可以进入山湖塔罗或灵签小殿；想看两人相处模式，可直接测算中西双系合盘。",
    noteCta: "查看推演方法与使用边界",
    sticksGuide: "Guanyin fortune sticks",
    compatibilityGuide: "BaZi love compatibility",
    oracleGuide: "I Ching vs Tarot",
    palmGuide: "Chinese vs Western palmistry",
    groups: {
      birth: {
        title: "本命星历与图谱",
        number: "01",
        description:
          "从公历出生日期（及可选的出生时刻与城市）出发，查看六十甲子意象、西方回归星盘、三维几何灵构与中西融合深度图谱。",
      },
      insight: {
        title: "当下问事与观相",
        number: "02",
        description:
          "带着一件具体心事进入暮色山湖塔罗桌、五系灵签、周易六爻或手相面相观察室，作为梳理直觉与处境的镜子。",
      },
      relationships: {
        title: "双人合盘与流年",
        number: "03",
        description:
          "将两份生辰放在一起合参八字五行与星盘相位，或结合流年干支阅读新一年的发力与休整节律。",
      },
    },
  },
};

const groups: { key: ToolGroup; icon: typeof Compass }[] = [
  { key: "birth", icon: SunMoon },
  { key: "insight", icon: Compass },
  { key: "relationships", icon: HeartHandshake },
];

export default async function ToolsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale: DirectoryLocale = params?.locale === "zh" ? "zh" : "en";
  const text = copy[locale];
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${siteName} · ${text.directory}`,
    description: text.intro,
    url: absoluteUrl(locale === "zh" ? "/tools?locale=zh" : "/tools"),
    inLanguage: locale === "zh" ? "zh-Hans" : "en",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: directoryTools.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.copy[locale].name,
        url: absoluteUrl(directoryToolHref(tool, locale)),
      })),
    },
  };

  return (
    <main className={styles.page} lang={locale === "zh" ? "zh-Hans" : "en"}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <AmbientAstrolabe tone="parchment" />
      <SiteHeaderV2 locale={locale} current="tools" basePath="/tools" locales={["en", "zh"]} />

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>
            <Sparkles size={15} aria-hidden="true" />
            {text.eyebrow}
          </p>
          <h1>{text.title}</h1>
          <p className={styles.intro}>{text.intro}</p>
          <div className={styles.heroActions}>
            <a className={styles.primary} href="#directory">
              {text.browse}
              <ArrowDown size={16} aria-hidden="true" />
            </a>
            <Link className={styles.textLink} href="/learn" hrefLang="en">
              {text.guideCta}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className={styles.heroMap} aria-hidden="true">
          <div className={styles.mapOrbit} />
          <div className={styles.mapCore}>
            <Sparkles size={34} strokeWidth={1.25} />
          </div>
          {groups.map(({ key, icon: Icon }) => (
            <div key={key} className={styles.mapLabel} data-group={key}>
              <Icon size={19} strokeWidth={1.5} />
              <span>{text.groups[key].title}</span>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.content} id="directory">
        <nav className={styles.groupNavigation} aria-label={text.directory}>
          {groups.map(({ key, icon: Icon }) => (
            <a href={`#${key}`} key={key}>
              <Icon size={16} aria-hidden="true" />
              {text.groups[key].title}
              <span>{directoryTools.filter(tool => tool.group === key).length}</span>
            </a>
          ))}
        </nav>

        {groups.map(({ key, icon: Icon }) => (
          <section key={key} className={styles.group} data-group={key} id={key} aria-labelledby={`${key}-title`}>
            <div className={styles.groupHeading}>
              <span className={styles.groupNumber}>{text.groups[key].number}</span>
              <div>
                <h2 id={`${key}-title`}>{text.groups[key].title}</h2>
                <p>{text.groups[key].description}</p>
              </div>
            </div>
            <div className={styles.grid}>
              {directoryTools
                .filter(tool => tool.group === key)
                .map(tool => {
                  const item = tool.copy[locale];
                  return (
                    <Link
                      className={styles.card}
                      href={directoryToolHref(tool, locale)}
                      key={tool.key}
                      data-analytics-tool={tool.key}
                      data-analytics-location="tools"
                    >
                      <div className={styles.cardTop}>
                        <span className={styles.toolIcon}>
                          <Icon size={19} aria-hidden="true" />
                        </span>
                      </div>
                      <h3>{item.name}</h3>
                      <p className={styles.description}>{item.description}</p>
                      <dl className={styles.toolDetails}>
                        <div>
                          <dt>{text.prepare}</dt>
                          <dd>{item.prepare}</dd>
                        </div>
                        <div>
                          <dt>{text.result}</dt>
                          <dd>{item.result}</dd>
                        </div>
                      </dl>
                      <span className={styles.cardAction}>
                        {text.open}
                        <ArrowRight size={16} aria-hidden="true" />
                      </span>
                    </Link>
                  );
                })}
            </div>
          </section>
        ))}

        <aside className={styles.startNote}>
          <BookOpen size={26} aria-hidden="true" />
          <div>
            <h2>{text.noteTitle}</h2>
            <p>{text.note}</p>
            <div className={styles.startNoteLinks}>
              <Link href={locale === "zh" ? "/product-facts?locale=zh" : "/product-facts"}>
                {text.noteCta}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
              {locale === "en" ? (
                <Link href="/learn/guanyin-fortune-sticks" hrefLang="en">
                  {text.sticksGuide}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              ) : null}
              {locale === "en" ? (
                <Link href="/learn/bazi-love-compatibility" hrefLang="en">
                  {text.compatibilityGuide}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              ) : null}
              {locale === "en" ? (
                <Link href="/insights/i-ching-vs-tarot" hrefLang="en">
                  {text.oracleGuide}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              ) : null}
              {locale === "en" ? (
                <Link href="/learn/chinese-palm-reading-vs-western" hrefLang="en">
                  {text.palmGuide}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      <SiteFooterV2 locale={locale} />
    </main>
  );
}
