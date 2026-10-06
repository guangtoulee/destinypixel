import { currentHomeReportOffer } from "@/lib/product-facts-server";
import { homeOffers } from "@/lib/home-offer";
import { destinySupportEmail } from "@/lib/support-contact";
import type { Metadata } from "next";
import HomeGateway from "@/components/home-gateway";
import DestinyWhiteExperience from "@/components/destiny-white-experience";
import { birthFormFeedback } from "@/lib/birth-form-feedback";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { absoluteUrl, makePageMetadata, routeSeo, siteName } from "@/lib/seo";

export const maxDuration = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  return makePageMetadata({ ...routeSeo.home, locale: params?.locale });
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ locale?: string; error?: string }>;
}) {
  const params = await searchParams;
  const initialLocale = normalizeReportLocale(params?.locale ?? "en");
  const reportOffer = currentHomeReportOffer();
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${absoluteUrl("/")}#website`,
      name: siteName,
      url: absoluteUrl("/"),
      inLanguage: ["en", "zh-CN", "zh-TW", "ru"],
      publisher: {
        "@id": `${absoluteUrl("/")}#organization`,
      },
      potentialAction: {
        "@type": "ReadAction",
        target: [
          absoluteUrl("/discover"),
          absoluteUrl("/compatibility"),
          absoluteUrl("/atelier"),
          absoluteUrl("/sticks"),
        ],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${absoluteUrl("/")}#organization`,
      name: siteName,
      url: absoluteUrl("/"),
      logo: absoluteUrl("/icon.svg"),
      email: destinySupportEmail,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: destinySupportEmail,
        availableLanguage: ["English", "Simplified Chinese", "Traditional Chinese", "Russian"],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: siteName,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      url: absoluteUrl("/"),
      description: routeSeo.home.description,
      publisher: {
        "@id": `${absoluteUrl("/")}#organization`,
      },
      offers: homeOffers(reportOffer, initialLocale, absoluteUrl(initialLocale === "en" ? "/#report" : `/?locale=${initialLocale}#report`)),
      featureList: [
        "AI birth chart and Bazi fusion report",
        "Free relationship compatibility with Bazi and tropical birth charts",
        "Deterministic interactive Birth Totem geometry",
        "Symbolic animal archetype cards",
        "Natal astrology context",
        "Palm reading studio",
        "Face reading studio",
        "Tarot and Liuyao-inspired question oracle",
        "Guanyin, Guandi, Yuelao, and wealth temple sticks",
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <HomeGateway locale={initialLocale} reportOffer={reportOffer}><DestinyWhiteExperience reportOnly reportOffer={reportOffer} initialLocale={initialLocale} initialError={birthFormFeedback(params?.error, initialLocale)} /></HomeGateway>
    </>
  );
}
