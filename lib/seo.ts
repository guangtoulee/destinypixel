import type { Metadata } from "next";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://www.destinypixel.com";

export const siteName = "DestinyPixel";

export const defaultSeoDescription =
  "A multidimensional birth map for self-understanding: symbolic animal archetypes, natal astrology, palm reading, face reading, Tarot, and Liuyao-inspired question guidance.";

export const seoKeywordClusters = [
  "birth chart reading",
  "natal chart reading",
  "free birth chart",
  "AI astrology reading",
  "personal astrology report",
  "current transits astrology",
  "tarot reading online",
  "yes no tarot",
  "temple sticks oracle",
  "Guanyin oracle sticks",
  "Guandi oracle sticks",
  "Yuelao love oracle",
  "Wong Tai Sin oracle sticks",
  "AI temple stick interpretation",
  "palm reading online",
  "AI palm reading",
  "face reading online",
  "physiognomy reading",
  "Bazi calculator",
  "Four Pillars of Destiny",
  "Chinese astrology reading",
  "day pillar animal",
  "five elements personality",
  "five elements colors",
  "crystal bracelet",
  "gemstone bracelet",
  "energy bracelet",
  "2026 astrology forecast",
  "2026 fortune reading",
  "compatibility reading",
  "spiritual self discovery",
  "inner guidance",
  "八字排盘",
  "八字流年",
  "大运流年",
  "日柱",
  "五行",
  "五行穿搭",
  "五行颜色",
  "水晶手串",
  "能量手串",
  "星盘",
  "星座运势",
  "塔罗占卜",
  "观音灵签",
  "关帝灵签",
  "月老灵签",
  "财神灵签",
  "黄大仙灵签",
  "AI解签",
  "灵签解签",
  "手相分析",
  "面相分析",
  "六爻起卦",
  "问事占卜",
  "合盘",
  "натальная карта онлайн",
  "астрологический прогноз",
  "таро онлайн",
  "хиромантия онлайн",
  "китайская астрология",
];

export const routeSeo = {
  home: {
    path: "/",
    title: "DestinyPixel | AI Birth Chart, Bazi Archetypes & Inner Guidance",
    description: defaultSeoDescription,
    keywords: [
      "multidimensional birth map",
      "birth energy map",
      "Bazi astrology fusion",
      "AI spiritual guidance",
      "psychological astrology",
      "命运地图",
      "出生能量图",
    ],
  },
  learn: {
    path: "/learn",
    title: "DestinyPixel Guide | Birth Charts, Tarot, Palm Reading & Bazi Timing",
    description:
      "A plain-language guide to the DestinyPixel system and the most searched paths in astrology, Bazi, Tarot, palm reading, face reading, and question-based oracle readings.",
    keywords: [
      "astrology guide",
      "tarot guide",
      "Bazi guide",
      "palm reading guide",
      "玄学搜索",
      "AI命理解读",
    ],
  },
  palm: {
    path: "/palm",
    title: "AI Palm Reading Online | DestinyPixel Palm Studio",
    description:
      "Upload or take a palm photo for a direct, conversational palm reading focused on life rhythm, relationships, work patterns, and practical next steps.",
    keywords: [
      "AI palm reading",
      "palmistry online",
      "palm lines reading",
      "hand reading",
      "手相分析",
      "掌纹分析",
    ],
  },
  face: {
    path: "/face",
    title: "AI Face Reading Online | DestinyPixel Face Studio",
    description:
      "A symbolic face reading studio for expression, facial zones, social signals, pressure patterns, and grounded self-reflection.",
    keywords: [
      "AI face reading",
      "face reading online",
      "physiognomy",
      "facial reading",
      "面相分析",
      "五官面相",
    ],
  },
  oracle: {
    path: "/oracle",
    title: "Question Oracle | Tarot Cards & Liuyao-Inspired Time Reading",
    description:
      "Ask one clear question and receive a visual Tarot and hexagram-style reading with direct guidance for love, career, money, timing, and decisions.",
    keywords: [
      "tarot reading online",
      "yes no tarot",
      "love tarot",
      "career tarot",
      "Liuyao oracle",
      "六爻起卦",
      "问事占卜",
    ],
  },
  sticks: {
    path: "/sticks",
    title: "Temple Sticks Oracle | Guanyin, Guandi, Yuelao, Wealth & Wong Tai Sin",
    description:
      "Draw one temple stick or search an offline stick number: Guanyin for protection, Guandi for career, Yuelao for love, Five Wealth Gods for money, and Wong Tai Sin for timing.",
    keywords: [
      "temple sticks oracle",
      "Guanyin sticks",
      "Guandi sticks",
      "Yuelao oracle",
      "wealth oracle",
      "Wong Tai Sin sticks",
      "AI stick interpretation",
      "观音灵签",
      "关帝灵签",
      "月老灵签",
      "五路财神灵签",
      "黄大仙灵签",
    ],
  },
  insights: {
    path: "/insights",
    title: "DestinyPixel Insight Studios | Palm, Face & Question Readings",
    description:
      "Open a focused insight studio when you need a smaller mirror: palm reading, face reading, or a one-question Tarot and Liuyao-inspired oracle.",
    keywords: [
      "AI fortune reading",
      "spiritual insight tools",
      "tarot palm face reading",
      "玄学工具",
      "AI占卜",
    ],
  },
  atelier: {
    path: "/atelier",
    title: "Celestial Atelier | Five Elements Colors & Crystal Bracelet Workshop",
    description:
      "Build a symbolic crystal bracelet from five-element color guidance: choose gemstones, bead size, wrist style, and receive an energy balance analysis.",
    keywords: [
      "five elements colors",
      "crystal bracelet builder",
      "gemstone energy bracelet",
      "Bazi colors",
      "五行穿搭",
      "水晶手串定制",
      "能量手串",
      "灵石工坊",
    ],
  },
  black: {
    path: "/black",
    title: "DestinyPixel Black | Cosmic Birth Map Interface",
    description:
      "The dark cosmic version of DestinyPixel for users who prefer a deep-space birth map and high-contrast mystical interface.",
    keywords: ["dark astrology app", "cosmic birth map", "deep space UI"],
  },
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export function languageAlternates(path: string) {
  return {
    en: `${path}?locale=en`,
    zh: `${path}?locale=zh`,
    ru: `${path}?locale=ru`,
    "x-default": path,
  };
}

export function makePageMetadata({
  path,
  title,
  description,
  keywords = [],
  noindex = false,
}: {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  noindex?: boolean;
}): Metadata {
  return {
    title,
    description,
    keywords: [...seoKeywordClusters, ...keywords],
    alternates: {
      canonical: path,
      languages: languageAlternates(path),
    },
    openGraph: {
      type: "website",
      url: path,
      title,
      description,
      siteName,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${siteName} multidimensional birth map`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
