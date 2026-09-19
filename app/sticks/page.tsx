import type { Metadata } from "next";
import { ProductSearchContent } from "@/components/product-search-content";
import { journalLanguageTags } from "@/lib/journal-locales";
import SpiritualSticksExperience from "@/components/spiritual-sticks-experience";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { absoluteUrl, canonicalPagePath, makePageMetadata, routeSeo } from "@/lib/seo";
import { stickTypeOrder, type StickType } from "@/lib/sticks/catalog";

export const maxDuration = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const metadata = makePageMetadata({ ...routeSeo.sticks, locale: params?.locale });
  return { ...metadata,
    openGraph: { ...metadata.openGraph, images: [{ url: "/shrine/oracle-vessel-20260917.webp", width: 960, height: 1280, alt: "DestinyPixel Chinese fortune sticks" }] },
    twitter: { ...metadata.twitter, card: "summary_large_image", images: ["/shrine/oracle-vessel-20260917.webp"] },
  };
}

function normalizeStickType(value?: string): StickType {
  if (stickTypeOrder.includes(value as StickType)) return value as StickType;
  return "guanyin";
}

export default async function SticksPage({
  searchParams,
}: {
  searchParams?: Promise<{ locale?: string; type?: string }>;
}) {
  const params = await searchParams;
  const locale = normalizeReportLocale(params?.locale ?? "en");
  const metadata = makePageMetadata({ ...routeSeo.sticks, locale });
  const schema = {
    "@context": "https://schema.org", "@type": "WebApplication",
    name: (metadata.title as { absolute: string }).absolute,
    description: metadata.description, url: absoluteUrl(canonicalPagePath("/sticks", locale)),
    inLanguage: journalLanguageTags[locale], applicationCategory: "LifestyleApplication", operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  return (<>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <SpiritualSticksExperience
      initialLocale={locale}
      initialType={normalizeStickType(params?.type)}
    ><ProductSearchContent product="sticks" locale={locale} /></SpiritualSticksExperience>
    </>
  );
}
