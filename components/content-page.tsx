import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  CirclePlay,
  Clock3,
  Mail,
  Menu,
  Sparkles,
} from "lucide-react";
import { localeInfo, siteLocales, type SiteLocale } from "@/content/zhangshengjun-i18n";
import {
  contentSlugs,
  getContentPage,
  localePath,
  type ContentPage as ContentPageData,
  type ContentSlug,
} from "@/lib/platform-content";
import { createContentJsonLd } from "@/lib/site-metadata";
import BrandSymbol from "./brand-symbol";
import styles from "./content-page.module.css";

const interfaceCopy: Record<
  SiteLocale,
  {
    home: string;
    menu: string;
    close: string;
    read: string;
    sources: string;
    note: string;
    film: string;
    transcript: string;
    related: string;
    contact: string;
    preparing: string;
    rights: string;
  }
> = {
  "zh-cn": {
    home: "返回首页",
    menu: "打开导航",
    close: "关闭导航",
    read: "继续阅读",
    sources: "资料说明",
    note: "编者按",
    film: "播放主题影像",
    transcript: "影像章节与文字稿",
    related: "继续探索",
    contact: "提交资料与合作线索",
    preparing: "内容与产品持续筹备中",
    rights: "永泰方壶岩 · 张圣君母殿文化网站",
  },
  "zh-hant": {
    home: "返回首頁",
    menu: "打開導覽",
    close: "關閉導覽",
    read: "繼續閱讀",
    sources: "資料說明",
    note: "編者按",
    film: "播放主題影像",
    transcript: "影像章節與文字稿",
    related: "繼續探索",
    contact: "提交資料與合作線索",
    preparing: "內容與產品持續籌備中",
    rights: "永泰方壺巖 · 張聖君母殿文化網站",
  },
  en: {
    home: "Back to home",
    menu: "Open navigation",
    close: "Close navigation",
    read: "Continue reading",
    sources: "Source note",
    note: "Editorial note",
    film: "Play featured film",
    transcript: "Film chapters and transcript",
    related: "Continue exploring",
    contact: "Share a source or partnership lead",
    preparing: "New stories and editions are in development",
    rights: "Fanghu Rock · Lord Zhang Cultural Website",
  },
};

function pagePath(locale: SiteLocale, slug: ContentSlug) {
  return localePath(locale, `/${slug}`);
}

function ContentHeader({ locale, active }: { locale: SiteLocale; active: ContentSlug }) {
  const copy = interfaceCopy[locale];
  const page = getContentPage(locale, active);
  return (
    <header className={styles.header}>
      <Link className={styles.brand} href={localePath(locale)} aria-label={copy.home}>
        <span className={styles.brandMark}>
          <BrandSymbol />
        </span>
        <span>
          <strong>{locale === "en" ? "LORD ZHANG" : locale === "zh-hant" ? "張聖君" : "张圣君"}</strong>
          <small>{locale === "en" ? "FANGHU ROCK ORIGIN" : locale === "zh-hant" ? "永泰方壺巖 · 母殿" : "永泰方壶岩 · 母殿"}</small>
        </span>
      </Link>

      <nav className={styles.desktopNav} aria-label={copy.menu}>
        {contentSlugs.map((slug) => {
          const navPage = getContentPage(locale, slug);
          return (
            <Link key={slug} href={pagePath(locale, slug)} aria-current={slug === active ? "page" : undefined}>
              {navPage.navLabel}
            </Link>
          );
        })}
      </nav>

      <div className={styles.headerTools}>
        <nav className={styles.languages} aria-label="Language">
          {siteLocales.map((siteLocale) => (
            <Link
              key={siteLocale}
              href={pagePath(siteLocale, active)}
              hrefLang={localeInfo[siteLocale].htmlLang}
              aria-current={siteLocale === locale ? "page" : undefined}
            >
              {localeInfo[siteLocale].shortLabel}
            </Link>
          ))}
        </nav>
        <details className={styles.mobileMenu}>
          <summary aria-label={copy.menu}>
            <Menu size={21} aria-hidden="true" />
          </summary>
          <div>
            <p>{page.title}</p>
            {contentSlugs.map((slug) => {
              const navPage = getContentPage(locale, slug);
              return (
                <Link key={slug} href={pagePath(locale, slug)} aria-current={slug === active ? "page" : undefined}>
                  {navPage.navLabel}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              );
            })}
            <nav className={styles.mobileLanguages} aria-label="Language">
              {siteLocales.map((siteLocale) => (
                <Link
                  key={siteLocale}
                  href={pagePath(siteLocale, active)}
                  hrefLang={localeInfo[siteLocale].htmlLang}
                  aria-current={siteLocale === locale ? "page" : undefined}
                >
                  {localeInfo[siteLocale].label}
                </Link>
              ))}
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}

function ContentCardView({
  card,
  locale,
  index,
}: {
  card: ContentPageData["cards"][number];
  locale: SiteLocale;
  index: number;
}) {
  const inner = (
    <>
      {card.image ? (
        <div className={styles.cardImage}>
          <Image src={card.image} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" />
        </div>
      ) : null}
      <div className={styles.cardCopy}>
        <span>{card.eyebrow}</span>
        <p>{String(index + 1).padStart(2, "0")}</p>
        <h3>{card.title}</h3>
        <p>{card.text}</p>
        {card.href ? <ArrowRight size={18} aria-hidden="true" /> : null}
      </div>
    </>
  );

  if (card.href) {
    const external = card.href.startsWith("mailto:");
    return (
      <a className={styles.card} href={card.href} lang={localeInfo[locale].htmlLang} rel={external ? undefined : "noreferrer"}>
        {inner}
      </a>
    );
  }
  return <article className={styles.card}>{inner}</article>;
}

export default function ContentPage({ page }: { page: ContentPageData }) {
  const copy = interfaceCopy[page.locale];
  const schemas = createContentJsonLd(page);
  const relatedSlugs = contentSlugs.filter((slug) => slug !== page.slug).slice(0, 3);

  return (
    <main className={styles.shell} lang={page.htmlLang}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, "\\u003c") }}
      />
      <ContentHeader locale={page.locale} active={page.slug} />

      <section className={styles.hero}>
        <Image
          src={page.heroImage}
          alt={page.heroAlt}
          fill
          priority
          loading="eager"
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroTexture} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <span>{page.eyebrow}</span>
          <h1>{page.title}</h1>
          <p>{page.lede}</p>
          <a href="#story">
            {copy.read}
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
        <div className={styles.heroIndex} aria-hidden="true">
          {String(contentSlugs.indexOf(page.slug) + 1).padStart(2, "0")}
        </div>
      </section>

      <section className={styles.factBand} aria-label={page.description}>
        {page.stats.map(([value, label]) => (
          <article key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>

      {page.video ? (
        <section className={styles.filmSection} id="story">
          <div className={styles.filmIntro}>
            <span>FEATURED FILM · 01</span>
            <h2>{page.video.name}</h2>
            <p>{page.video.description}</p>
            <div>
              <CirclePlay size={20} aria-hidden="true" />
              <span>{copy.film}</span>
              <Clock3 size={16} aria-hidden="true" />
              <span>00:40</span>
            </div>
          </div>
          <video
            className={styles.video}
            controls
            playsInline
            preload="metadata"
            poster={page.video.thumbnailUrl}
          >
            <source
              src="/zhangshengjun/video/hero-cinematic-mobile.mp4"
              type="video/mp4"
              media="(max-width: 720px)"
            />
            <source src={page.video.contentUrl} type="video/mp4" />
          </video>
        </section>
      ) : null}

      <section className={styles.story} id={page.video ? "chapters" : "story"}>
        <div className={styles.storyRail}>
          <span>{page.video ? copy.transcript : page.eyebrow}</span>
          <strong>{page.sections.length.toString().padStart(2, "0")}</strong>
          <p>{page.description}</p>
        </div>
        <div className={styles.sections}>
          {page.sections.map((section) => (
            <article key={`${section.number}-${section.title}`} className={styles.section}>
              <span>{section.number}</span>
              <h2>{section.title}</h2>
              {section.text.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.note ? (
                <aside>
                  <BookOpenText size={19} aria-hidden="true" />
                  <div>
                    <strong>{copy.note}</strong>
                    <p>{section.note}</p>
                  </div>
                </aside>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className={styles.cardsBand}>
        <div className={styles.bandHeading}>
          <span>{page.slug === "shop" ? "IN DEVELOPMENT" : "CURATED INDEX"}</span>
          <h2>{page.slug === "shop" ? copy.preparing : copy.related}</h2>
        </div>
        <div className={styles.cards}>
          {page.cards.map((card, index) => (
            <ContentCardView key={card.title} card={card} locale={page.locale} index={index} />
          ))}
        </div>
      </section>

      <section className={styles.nextBand}>
        <div>
          <Sparkles size={25} aria-hidden="true" />
          <span>{copy.related}</span>
          <h2>
            {page.locale === "en"
              ? "Follow the story across places, rituals, and images."
              : page.locale === "zh-hant"
                ? "沿山川、科儀與影像，繼續走近千年神公。"
                : "沿山川、科仪与影像，继续走近千年神公。"}
          </h2>
        </div>
        <nav>
          {relatedSlugs.map((slug) => {
            const related = getContentPage(page.locale, slug);
            return (
              <Link key={slug} href={pagePath(page.locale, slug)}>
                <span>{related.eyebrow}</span>
                <strong>{related.navLabel}</strong>
                <ArrowRight size={19} aria-hidden="true" />
              </Link>
            );
          })}
        </nav>
      </section>

      <footer className={styles.footer}>
        <Link href={localePath(page.locale)} className={styles.footerBrand}>
          <BrandSymbol />
          <span>{copy.rights}</span>
        </Link>
        <a href="mailto:info@zhangshengjun.org">
          <Mail size={17} aria-hidden="true" />
          {copy.contact}
        </a>
        <p>© 2026 · zhangshengjun.org</p>
      </footer>

      <Link className={styles.backHome} href={localePath(page.locale)} aria-label={copy.home}>
        <ArrowLeft size={18} aria-hidden="true" />
      </Link>
    </main>
  );
}
