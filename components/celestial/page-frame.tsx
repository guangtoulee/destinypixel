import { tarotLearningHref } from "@/lib/tarot-learning/paths";
import { tarotLearningCopy } from "@/lib/tarot-learning/copy";
import type { ReactNode } from "react";
import type { ReportLocale } from "@/lib/report-i18n";
import {
  celestialCopy,
  celestialHref,
  celestialLocales,
} from "@/lib/celestial/copy";
import { recordCopy, memberAccountHref } from "@/lib/celestial/record-copy";
import { absoluteUrl } from "@/lib/seo";
import { journalLanguageTags } from "@/lib/journal-locales";
import { CelestialSearchContent } from "./search-content";
import { celestialContentUpdatedAt } from "@/lib/celestial/search-content";
import SectionNavigation from "@/components/section-navigation";
import SectionReading from "@/components/section-reading";
import SiteFunctionLinks from "@/components/site-function-links";
import { topicCopy } from "@/lib/topic-journeys";
import "./celestial.css";
import "./tarot-workspace.css";
import { TarotHeader, TarotNavigation } from "@/components/tarot-navigation";
import { tarotWorkspaceCopy } from "@/lib/tarot-workspace-copy";
import { TarotScene } from "./tarot-scene";
export function CelestialPageFrame({
  kind,
  locale,
  children,
}: {
  kind: "astrology" | "tarot";
  locale: ReportLocale;
  children: ReactNode;
}) {
  const c = celestialCopy(locale),
    astro = kind === "astrology",
    path = `/${kind}`,
    title = astro ? c.astroTitle : c.tarotTitle,
    description = astro ? c.astroDescription : c.tarotDescription;
  const tableCopy = tarotWorkspaceCopy(locale);
  const url = absoluteUrl(celestialHref(path, locale));
  const schema = {
    "@context": "https://schema.org",
    "@graph": [{
    "@type": "WebApplication",
    "@id": `${url}#tool`,
    name: title,
    description,
    url: absoluteUrl(celestialHref(path, locale)),
    inLanguage: journalLanguageTags[locale],
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    }, {
      "@type": "WebPage", "@id": `${url}#page`, url, name: title, description,
      inLanguage: journalLanguageTags[locale], dateModified: celestialContentUpdatedAt,
      mainEntity: { "@id": `${url}#tool` }, breadcrumb: { "@id": `${url}#breadcrumb` },
    }, {
      "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: c.home, item: absoluteUrl(celestialHref("/", locale)) },
        { "@type": "ListItem", position: 2, name: astro ? c.astrology : c.tarot, item: url },
      ],
    }],
  };
  return (
    <main
      className={`cel-page ${astro ? "cel-astrology-page" : "cel-tarot-page"}`}
      lang={journalLanguageTags[locale]}
      data-server-localized
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      {!astro && <TarotScene />}
      <div className="cel-shell">
        {astro ? <header className="cel-header">
          <a href={celestialHref("/", locale)} className="cel-brand">
            <span>✧</span>DestinyPixel
          </a>
          <div className="cel-header-right">
            <a href={memberAccountHref(locale)}>{recordCopy(locale).account}</a>
            <a href={celestialHref(astro ? "/tarot" : "/astrology", locale)}>
              {astro ? c.tarot : c.astrology} ↗
            </a>
            <nav aria-label="Language">
              {celestialLocales.map((l) => (
                <a
                  key={l}
                  href={celestialHref(path, l)}
                  aria-current={l === locale ? "page" : undefined}
                >
                  {{ en: "EN", zh: "简", "zh-TW": "繁", ru: "RU" }[l]}
                </a>
              ))}
            </nav>
          </div>
        </header> : <TarotHeader locale={locale} path="/tarot"/>}
        <nav className="cel-breadcrumb"><a href={celestialHref("/", locale)}>{c.home}</a><span aria-hidden="true">/</span><span aria-current="page">{astro ? c.astrology : c.tarot}</span></nav>
        {astro ? <SectionNavigation locale={locale} current={kind} /> : <TarotNavigation locale={locale} current="table"/>}
        <section className="cel-hero">
          <div>
            <p className="cel-kicker">
              {astro ? c.astroEyebrow : tableCopy.eyebrow}
            </p>
            <h1>{astro ? c.astroHeading : tableCopy.title}</h1>
            <p className="cel-hero-intro">
              {astro ? c.astroIntro : tableCopy.intro}
            </p>
            {astro && <a className="cel-button cel-topic-action" href="#topic-tool">{topicCopy(locale).sections[kind].action}<span aria-hidden="true">↓</span></a>}
          </div>
          <div className="cel-hero-aside">{astro ? c.free : tableCopy.note}</div>
        </section>
        <div id="topic-tool" className="cel-topic-tool" tabIndex={-1}>{children}</div>
        {!astro && <section className="cel-method"><a className="cel-button" href={tarotLearningHref(undefined,locale)}>{tarotLearningCopy(locale).title} →</a><p>{tarotLearningCopy(locale).intro}</p></section>}
        <CelestialSearchContent kind={kind} locale={locale} />
        <section className="cel-method">
          <details>
            <summary>{c.method}</summary>
            <p>{astro ? c.astroMethod : c.tarotMethod}</p>
            {astro && (
              <p>
                <a
                  href="https://github.com/cosinekitty/astronomy"
                  target="_blank"
                  rel="noreferrer"
                >
                  Astronomy Engine ↗
                </a>{" "}
                · Tropical / Whole Sign
              </p>
            )}
          </details>
        </section>
        {!astro && (
          <p className="cel-art-credit">
            {c.artCredit}{" "}
            <a href="/tarot/attribution.json" target="_blank" rel="noreferrer">
              {c.source} ↗
            </a>
          </p>
        )}
        <section className="cel-faq">
          {(astro ? c.astroFaqs : c.tarotFaqs).map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
        <SectionReading section={kind} locale={locale} />
        {astro ? <SiteFunctionLinks current={kind} locale={locale} /> : <details className="tarot-other-themes"><summary>{tableCopy.others} <span aria-hidden="true">↗</span></summary><SiteFunctionLinks current={kind} locale={locale} /></details>}
        <footer className="cel-footer">
          <a href={celestialHref("/", locale)}>DestinyPixel</a>
          <nav>
            <a href={celestialHref("/astrology", locale)}>{c.astrology}</a>
            <a href={celestialHref("/tarot", locale)}>{c.tarot}</a>
            <a href={celestialHref("/compatibility", locale)}>
              {locale.startsWith("zh")
                ? locale === "zh-TW"
                  ? "感情適配"
                  : "感情适配"
                : locale === "ru"
                  ? "Совместимость"
                  : "Compatibility"}
            </a>
            <a href={celestialHref("/sticks", locale)}>
              {locale.startsWith("zh")
                ? locale === "zh-TW"
                  ? "靈籤"
                  : "灵签"
                : locale === "ru"
                  ? "Жребий"
                  : "Temple sticks"}
            </a>
          </nav>
        </footer>
      </div>
    </main>
  );
}
