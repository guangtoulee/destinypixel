import type { Metadata } from "next";
import TotemExperience from "@/components/totem/totem-experience";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { absoluteUrl, makePageMetadata, routeSeo, siteName } from "@/lib/seo";

export const metadata: Metadata = makePageMetadata(routeSeo.tuteng);

export default async function TutengPage({
  searchParams,
}: {
  searchParams?: Promise<{ locale?: string }>;
}) {
  const params = await searchParams;
  const locale = normalizeReportLocale(params?.locale ?? "en");
  const maxBirthDate = new Date(Date.now() + 8 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Birth Totem · 本命灵构",
      alternateName: "Totem Matrix",
      url: absoluteUrl(routeSeo.tuteng.path),
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      isAccessibleForFree: true,
      inLanguage: ["en", "zh-CN", "zh-TW", "ru"],
      description: routeSeo.tuteng.description,
      creator: {
        "@type": "Organization",
        name: siteName,
        url: absoluteUrl("/"),
      },
      featureList: [
        "Deterministic SVG generated from Four Pillars",
        "Interactive pillar, element, Ten-God, and resonance layers",
        "Optional post-birth calibration that does not alter natal data",
        "Privacy-safe local PNG and SVG export",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: "DestinyPixel Birth Totem visualization system",
      description:
        "An original symbolic visualization and reflection system. It is not an established traditional Bazi doctrine or a scientifically validated ability test.",
      creator: {
        "@type": "Organization",
        name: siteName,
      },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TotemExperience
        initialLocale={locale}
        maxBirthDate={maxBirthDate}
      />
    </>
  );
}
