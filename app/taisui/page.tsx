import type { Metadata } from "next";
import { TaiSuiPeace } from "@/components/taisui/peace";
import { absoluteUrl, siteName } from "@/lib/seo";

type PageProps = { searchParams?: Promise<{ locale?: string | string[] }> };

const copy = {
  zh: {
    title: "太岁平安 · 为自己许个愿",
    description: "心中的念，比形式更重要。免费点亮一盏平安灯，把祝福送给自己，再读懂本命年、犯太岁与 2027 年度参照。无需姓名、生日或账户。",
  },
  en: {
    title: "Tai Sui Peace · A Little Light, a Wish for Yourself",
    description: "Light a free peace lamp and take a quiet moment for yourself. Explore a warm cultural blessing, a clear Tai Sui guide and your free 2027 calendar. No personal details or account needed.",
  },
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const locale = (await searchParams)?.locale === "zh" ? "zh" : "en";
  const { title, description } = copy[locale];
  const canonical = locale === "zh" ? "/taisui?locale=zh" : "/taisui";
  const image = { url: "/taisui/opengraph-image", width: 1200, height: 630, alt: "太岁平安 · A little light, a wish for peace · DestinyPixel" };
  return {
    title: { absolute: `${title} | ${siteName}` }, description,
    alternates: { canonical, languages: { en: "/taisui", "zh-Hans": "/taisui?locale=zh", "x-default": "/taisui" } },
    openGraph: { type: "website", title, description, url: canonical, siteName, locale: locale === "zh" ? "zh_CN" : "en_US", alternateLocale: [locale === "zh" ? "en_US" : "zh_CN"], images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
    robots: { index: true, follow: true },
  };
}

export default async function TaiSuiPage({ searchParams }: PageProps) {
  const locale = (await searchParams)?.locale === "zh" ? "zh" : "en";
  const canonical = absoluteUrl(locale === "zh" ? "/taisui?locale=zh" : "/taisui");
  const schema = { "@context": "https://schema.org", "@type": "WebPage", name: copy[locale].title, description: copy[locale].description, url: canonical, inLanguage: locale === "zh" ? "zh-Hans" : "en", isAccessibleForFree: true, publisher: { "@type": "Organization", name: siteName, url: absoluteUrl("/") } };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <TaiSuiPeace locale={locale} shareUrl={canonical} />
  </>;
}
