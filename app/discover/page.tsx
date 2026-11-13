import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import BirthdayCardFinder from "@/components/birthday-card-finder";
import DiscoveryLanguages from "@/components/discovery-languages";
import { ProductSearchContent } from "@/components/product-search-content";
import SectionReading from "@/components/section-reading";
import { AmbientAstrolabe, SiteFooterV2, SiteHeaderV2 } from "@/components/v2/site-chrome";
import { getPillarImagePath } from "@/lib/archetype-assets";
import { getDayPillarCards } from "@/lib/day-pillar-cards";
import { pillarLibraryCopy, pillarLibraryHref } from "@/lib/day-pillar-library";
import { discoveryAlternates, discoveryHref, getDiscoveryCopy } from "@/lib/discovery";
import { journalLanguageTags } from "@/lib/journal-locales";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { absoluteUrl } from "@/lib/seo";
import styles from "@/components/discovery.module.css";

type Props = { searchParams?: Promise<{ locale?: string; pillar?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const locale = normalizeReportLocale(params?.locale ?? "en");
  const copy = getDiscoveryCopy(locale);
  const cards = getDayPillarCards(locale);
  const requestedCard = params?.pillar ? cards.find(card => card.slug === params.pillar) : undefined;

  const baseHref = discoveryHref(locale);
  const shareUrl = requestedCard
    ? `${baseHref}${locale === "en" ? "?" : "&"}pillar=${requestedCard.slug}`
    : baseHref;
  const title = requestedCard
    ? `${requestedCard.pillar} · ${requestedCard.name} | DestinyPixel`
    : copy.title;
  const description = requestedCard
    ? `${requestedCard.essence.slice(0, 145)}…`
    : copy.description;
  const image = requestedCard ? requestedCard.image : getPillarImagePath("癸卯");

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: baseHref, languages: discoveryAlternates() },
    openGraph: {
      type: "website",
      title,
      description,
      url: shareUrl,
      images: [
        {
          url: image,
          width: 896,
          height: 1200,
          alt: requestedCard ? `${requestedCard.pillar} · ${requestedCard.name}` : copy.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function Discover({ searchParams }: Props) {
  const params = await searchParams;
  const locale = normalizeReportLocale(params?.locale ?? "en");
  const copy = getDiscoveryCopy(locale);
  const cards = getDayPillarCards(locale);
  const initialCard = cards.find(card => card.slug === params?.pillar);

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: copy.title,
    description: copy.description,
    url: absoluteUrl(discoveryHref(locale)),
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
        current="discover"
        basePath="/discover"
        languageSlot={<DiscoveryLanguages locale={locale} />}
      />

      <div className={styles.hero}>
        <section className={styles.intro}>
          <p className={styles.label}>{copy.eyebrow}</p>
          <h1>{copy.heading}</h1>
          <p className={styles.lead}>{copy.intro}</p>
          <ul className={styles.features}>
            {copy.features.map(x => (
              <li key={x}>
                <Check size={14} />
                {x}
              </li>
            ))}
          </ul>
          <div className={styles.preview}>
            {["癸卯", "丙午", "辛巳"].map(p => {
              const c = cards.find(x => x.pillar === p)!;
              return (
                <figure key={p}>
                  <Image
                    src={c.image}
                    alt={c.name}
                    width={896}
                    height={1200}
                    sizes="(max-width:650px) 28vw, 130px"
                  />
                  <figcaption>{c.name}</figcaption>
                </figure>
              );
            })}
          </div>
        </section>

        <BirthdayCardFinder
          key={`${locale}:${initialCard?.slug ?? "finder"}`}
          cards={cards}
          copy={copy.finder}
          locale={locale}
          initialCard={initialCard}
        />
      </div>

      <p className={styles.libraryBanner}>
        <a href={pillarLibraryHref(locale)}>{pillarLibraryCopy(locale).browse} →</a>
      </p>

      <section className={styles.steps}>
        <h2>{copy.nextTitle}</h2>
        <div>
          {copy.steps.map((step, i) => (
            <article key={step.title}>
              <span>0{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.faq}>
        <h2>{copy.faqTitle}</h2>
        <div>
          {copy.faqs.map(x => (
            <details key={x.q}>
              <summary>{x.q}</summary>
              <p>{x.a}</p>
            </details>
          ))}
        </div>
      </section>

      <SectionReading section="discover" locale={locale} />
      <ProductSearchContent product="discovery" locale={locale} />
      <SiteFooterV2 locale={locale} />
    </main>
  );
}
