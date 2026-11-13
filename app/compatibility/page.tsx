import type { Metadata } from "next";
import CompatibilityExperience from "@/components/compatibility-experience";
import { ConnectionVisual } from "@/components/compatibility-home";
import { ProductSearchContent } from "@/components/product-search-content";
import SectionReading from "@/components/section-reading";
import { AmbientAstrolabe, SiteFooterV2, SiteHeaderV2 } from "@/components/v2/site-chrome";
import {
  compatibilityAlternates,
  compatibilityCopy,
  compatibilityHref,
  compatibilityLocales,
} from "@/lib/compatibility/copy";
import { journalLanguageTags } from "@/lib/journal-locales";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { absoluteUrl } from "@/lib/seo";
import styles from "@/components/compatibility.module.css";

type Props = { searchParams?: Promise<{ locale?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = normalizeReportLocale((await searchParams)?.locale || "en");
  const c = compatibilityCopy(locale);
  return {
    title: { absolute: c.title },
    description: c.description,
    alternates: { canonical: compatibilityHref(locale), languages: compatibilityAlternates() },
    openGraph: {
      type: "website",
      title: c.title,
      description: c.description,
      url: compatibilityHref(locale),
      images: ["/compatibility/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: c.title,
      description: c.description,
      images: ["/compatibility/opengraph-image"],
    },
  };
}

export default async function CompatibilityPage({ searchParams }: Props) {
  const locale = normalizeReportLocale((await searchParams)?.locale || "en");
  const c = compatibilityCopy(locale);
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: c.title,
    description: c.description,
    url: absoluteUrl(compatibilityHref(locale)),
    inLanguage: journalLanguageTags[locale],
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <main className={styles.page} lang={journalLanguageTags[locale]} data-server-localized>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <AmbientAstrolabe tone="parchment" />
      <SiteHeaderV2
        locale={locale}
        current="compatibility"
        basePath="/compatibility"
        locales={compatibilityLocales}
      />

      <div className={styles.v2Body}>
        <div className={styles.hero}>
          <section>
            <p className={styles.eyebrow}>{c.eyebrow}</p>
            <h1>{c.heading}</h1>
            <p className={styles.lead}>{c.intro}</p>
            <a href="#compare" className={styles.textLink}>
              {c.cta} ↗
            </a>
          </section>
          <ConnectionVisual labels={c} />
        </div>

        <CompatibilityExperience locale={locale} copy={c} />

        <section className={styles.method}>
          <details>
            <summary>{c.method}</summary>
            <p>{c.methodBody}</p>
          </details>
        </section>

        <section className={styles.faq}>
          <h2>{c.faqTitle}</h2>
          {c.faqs.map(f => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>

        <SectionReading section="compatibility" locale={locale} />
        <ProductSearchContent product="compatibility" locale={locale} />
      </div>

      <SiteFooterV2 locale={locale} />
    </main>
  );
}
