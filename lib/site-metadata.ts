import type { Metadata } from "next";
import type { SiteLocale } from "@/content/zhangshengjun-i18n";
import type { ContentPage } from "@/lib/platform-content";

export const SITE_URL = "https://www.zhangshengjun.org";
export const SITE_UPDATED_AT = new Date("2026-07-30T00:00:00+08:00");

export const metadataByLocale: Record<
  SiteLocale,
  {
    path: string;
    locale: string;
    title: string;
    siteName: string;
    description: string;
    imageAlt: string;
    twitterDescription: string;
  }
> = {
  "zh-cn": {
    path: "/",
    locale: "zh_CN",
    title: "永泰方壶岩·张圣君母殿 | 千年神公 闾山法主",
    siteName: "永泰方壶岩·张圣君母殿",
    description:
      "永泰方壶岩·张圣君母殿官方网站，呈现张圣君亦道亦佛的信仰底蕴、从凡人到神明的传奇叙事，以及跨越海峡与海外的法主公信仰网络。",
    imageAlt: "永泰方壶岩母殿山水圣境",
    twitterDescription: "千年神公，闾山法主。探寻张圣君信仰的血缘地与法源地。",
  },
  "zh-hant": {
    path: "/zh-hant",
    locale: "zh_TW",
    title: "永泰方壺巖·張聖君母殿 | 千年神公 閭山法主",
    siteName: "永泰方壺巖·張聖君母殿",
    description:
      "永泰方壺巖·張聖君母殿官方網站，呈現張聖君亦道亦佛的信仰底蘊、從凡人到神明的傳奇敘事，以及跨越海峽與海外的法主公信仰網絡。",
    imageAlt: "永泰方壺巖母殿山水聖境",
    twitterDescription: "千年神公，閭山法主。探尋張聖君信仰的血緣地與法源地。",
  },
  en: {
    path: "/en",
    locale: "en_US",
    title: "Fanghu Rock Mother Temple | Lord Zhang, the Millennium Divine Lord",
    siteName: "Fanghu Rock Mother Temple · Lord Zhang",
    description:
      "The official cultural website of Fanghu Rock Mother Temple, tracing Lord Zhang's journey from mortal woodcutter to Fazhu Gong and the living devotional network linking Fujian, Taiwan, and overseas communities.",
    imageAlt: "The sacred mountain landscape of Fanghu Rock Mother Temple in Yongtai",
    twitterDescription:
      "Discover Lord Zhang, the Lushan Dharma Master, and the sacred origin of a millennium-old tradition at Fanghu Rock.",
  },
};

const languageAlternates = {
  "zh-CN": "/",
  "zh-Hant": "/zh-hant",
  en: "/en",
  "x-default": "/",
};

function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function createSiteMetadata(locale: SiteLocale): Metadata {
  const copy = metadataByLocale[locale];
  const alternateLocales = Object.values(metadataByLocale)
    .filter((item) => item.locale !== copy.locale)
    .map((item) => item.locale);

  return {
    title: copy.title,
    description: copy.description,
    applicationName: copy.siteName,
    creator: copy.siteName,
    publisher: copy.siteName,
    alternates: {
      canonical: absoluteUrl(copy.path),
      languages: Object.fromEntries(
        Object.entries(languageAlternates).map(([language, path]) => [language, absoluteUrl(path)]),
      ),
    },
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      type: "website",
      locale: copy.locale,
      alternateLocale: alternateLocales,
      url: absoluteUrl(copy.path),
      siteName: copy.siteName,
      title: copy.title,
      description: copy.description,
      images: [
        {
          url: "/zhangshengjun/fanghu-hero.jpg",
          width: 1821,
          height: 864,
          alt: copy.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.twitterDescription,
      images: ["/zhangshengjun/fanghu-hero.jpg"],
    },
  };
}

export function createContentMetadata(page: ContentPage): Metadata {
  const localizedPaths = {
    "zh-CN": `/${page.slug}`,
    "zh-Hant": `/zh-hant/${page.slug}`,
    en: `/en/${page.slug}`,
    "x-default": `/${page.slug}`,
  };
  const path = page.locale === "zh-cn" ? `/${page.slug}` : `/${page.locale}/${page.slug}`;
  const siteCopy = metadataByLocale[page.locale];

  return {
    title: `${page.title} | ${siteCopy.siteName}`,
    description: page.description,
    alternates: {
      canonical: absoluteUrl(path),
      languages: Object.fromEntries(
        Object.entries(localizedPaths).map(([language, localizedPath]) => [
          language,
          absoluteUrl(localizedPath),
        ]),
      ),
    },
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      type: "article",
      locale: siteCopy.locale,
      url: absoluteUrl(path),
      siteName: siteCopy.siteName,
      title: page.title,
      description: page.description,
      images: [
        {
          url: page.heroImage,
          width: 1600,
          height: 1000,
          alt: page.heroAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [page.heroImage],
    },
  };
}

export function createOrganizationJsonLd(locale: SiteLocale) {
  const copy = metadataByLocale[locale];
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: copy.siteName,
    url: SITE_URL,
    logo: absoluteUrl("/icon.svg"),
    description: copy.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: locale === "en" ? "Yongtai County, Fuzhou" : "福州市永泰县",
      addressRegion: locale === "en" ? "Fujian" : "福建省",
      addressCountry: "CN",
    },
  };
}

export function createWebsiteJsonLd(locale: SiteLocale) {
  const copy = metadataByLocale[locale];
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: copy.siteName,
    description: copy.description,
    inLanguage: locale === "zh-cn" ? "zh-CN" : locale === "zh-hant" ? "zh-Hant" : "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function createContentJsonLd(page: ContentPage) {
  const path = page.locale === "zh-cn" ? `/${page.slug}` : `/${page.locale}/${page.slug}`;
  const url = absoluteUrl(path);
  const homePath = page.locale === "zh-cn" ? "/" : `/${page.locale}`;
  const schemas: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${url}#page`,
      url,
      name: page.title,
      description: page.description,
      inLanguage: page.htmlLang,
      dateModified: "2026-07-30",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: absoluteUrl(page.heroImage),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: page.locale === "en" ? "Home" : page.locale === "zh-hant" ? "首頁" : "首页",
          item: absoluteUrl(homePath),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: page.navLabel,
          item: url,
        },
      ],
    },
  ];

  if (page.video) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: page.video.name,
      description: page.video.description,
      thumbnailUrl: [absoluteUrl(page.video.thumbnailUrl)],
      uploadDate: page.video.uploadDate,
      duration: page.video.duration,
      contentUrl: absoluteUrl(page.video.contentUrl),
      inLanguage: page.htmlLang,
    });
  }

  return schemas;
}
