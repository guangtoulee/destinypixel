import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Whole 中国｜源自塞尔维亚的功能含片",
  description:
    "Whole Sleep 褪黑素睡眠含片与 Whole Gastro 餐后钙镁含片中国品牌官网。了解产品、品牌故事与中国市场进展。",
  keywords: [
    "Whole",
    "功能糖果",
    "褪黑素含片",
    "餐后含片",
    "Packom",
    "塞尔维亚糖果",
  ],
  alternates: {
    canonical: "https://www.destinypixel.com/canddy",
  },
  icons: {
    icon: "/canddy/favicon.png",
  },
  openGraph: {
    title: "Whole 中国｜把功能，做成一颗好吃的糖",
    description: "源自塞尔维亚的功能含片，为夜晚与餐后两个日常时刻而来。",
    type: "website",
    locale: "zh_CN",
    url: "https://www.destinypixel.com/canddy",
    images: [
      {
        url: "https://www.destinypixel.com/canddy/og.png",
        width: 1730,
        height: 909,
        alt: "Whole Sleep 与 Whole Gastro 产品展示",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Whole 中国｜把功能，做成一颗好吃的糖",
    description: "源自塞尔维亚的功能含片，为夜晚与餐后两个日常时刻而来。",
    images: ["https://www.destinypixel.com/canddy/og.png"],
  },
};

export default function CanddyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
