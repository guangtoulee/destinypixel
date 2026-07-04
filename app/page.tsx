import type { Metadata } from "next";
import DestinyWhiteExperience from "@/components/destiny-white-experience";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { absoluteUrl, makePageMetadata, routeSeo, siteName } from "@/lib/seo";

export const maxDuration = 60;

export const metadata: Metadata = makePageMetadata(routeSeo.home);

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ locale?: string }>;
}) {
  const params = await searchParams;
  const initialLocale = normalizeReportLocale(params?.locale ?? "en");
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: absoluteUrl("/"),
      inLanguage: ["en", "zh-CN", "ru"],
      potentialAction: {
        "@type": "ReadAction",
        target: [
          absoluteUrl("/"),
          absoluteUrl("/palm"),
          absoluteUrl("/oracle"),
          absoluteUrl("/sticks"),
        ],
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
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "AI birth chart and Bazi fusion report",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DestinyWhiteExperience initialLocale={initialLocale} />
    </>
  );
}
