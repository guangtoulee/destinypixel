import type { Metadata } from "next";
import { Year2027Experience } from "@/components/year2027/experience";
import { absoluteUrl, canonicalPagePath, makePageMetadata, siteName } from "@/lib/seo";

type PageProps = { searchParams?: Promise<{ locale?: string | string[] }> };

const pageCopy = {
  en: { title: "2027 Zodiac Star Rankings & Free Bazi Year Ahead", description: "Explore all 12 zodiac signs with transparent editorial stars, understand Tai Sui, and create a free January–December 2027 Bazi and astrology reflection calendar. No login needed." },
  zh: { title: "2027 十二生肖星级排行榜与免费八字流年手册", description: "查看十二生肖综合、事业、感情与财运编辑星级，读懂本命年与太岁关系，再生成免费 2027 年 1—12 月八字与星盘手册。无需登录，保留未知时辰选项。" },
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const locale = params?.locale === "zh" ? "zh" : "en";
  const { title, description } = pageCopy[locale];
  const metadata = makePageMetadata({
    path: "/2027", title, description, locale,
    keywords: ["2027 Bazi", "2027 astrology", "2027 year ahead", "free personal calendar", "2027 八字", "2027 年度运势", "2027 星盘"],
  });
  const image = { url: "/2027/opengraph-image", width: 1200, height: 630, alt: "DestinyPixel · 2027 Year Ahead · Bazi & Astrology" };
  return {
    ...metadata,
    openGraph: { ...metadata.openGraph, images: [image], alternateLocale: [locale === "zh" ? "en_US" : "zh_CN"] },
    twitter: { ...metadata.twitter, images: [image.url] },
  };
}

export default async function Year2027Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialLang = params?.locale === "zh" ? "zh" : "en";
  const { title, description } = pageCopy[initialLang];
  const metadata = makePageMetadata({ path: "/2027", title, description, locale: initialLang });
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${absoluteUrl(canonicalPagePath("/2027", initialLang))}#application`,
    name: initialLang === "zh" ? "2027 流年手册" : "2027 Year Ahead",
    description: metadata.description,
    url: absoluteUrl(canonicalPagePath("/2027", initialLang)),
    inLanguage: initialLang === "zh" ? "zh-Hans" : "en",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: siteName, url: absoluteUrl("/") },
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <Year2027Experience initialLang={initialLang} />
  </>;
}
