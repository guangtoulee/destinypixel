import type { ReactNode } from "react";
import type { ReportLocale } from "@/lib/report-i18n";
import {
  celestialCopy,
  celestialHref,
  celestialLocales,
} from "@/lib/celestial/copy";
import { absoluteUrl } from "@/lib/seo";
import { journalLanguageTags } from "@/lib/journal-locales";
import "./celestial.css";
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
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    description,
    url: absoluteUrl(celestialHref(path, locale)),
    inLanguage: journalLanguageTags[locale],
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
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
      <div className="cel-shell">
        <header className="cel-header">
          <a href={celestialHref("/", locale)} className="cel-brand">
            <span>✧</span>DestinyPixel
          </a>
          <div className="cel-header-right">
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
        </header>
        <section className="cel-hero">
          <div>
            <p className="cel-kicker">
              {astro ? c.astroEyebrow : c.tarotEyebrow}
            </p>
            <h1>{astro ? c.astroHeading : c.tarotHeading}</h1>
            <p className="cel-hero-intro">
              {astro ? c.astroIntro : c.tarotIntro}
            </p>
          </div>
          <div className="cel-hero-aside">{c.free}</div>
        </section>
        {children}
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
