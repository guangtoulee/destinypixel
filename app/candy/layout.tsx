import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Whole China｜源自塞尔维亚的功能含片",
  description:
    "Whole Sleep 褪黑素睡眠含片与 Whole Gastro 餐后钙镁含片中国品牌官网。Explore products, our Serbian story and the China launch.",
  keywords: [
    "Whole",
    "功能糖果",
    "褪黑素含片",
    "餐后含片",
    "Packom",
    "塞尔维亚糖果",
    "functional pastilles",
    "melatonin pastilles",
  ],
  alternates: {
    canonical: "https://www.destinypixel.com/candy",
  },
  icons: {
    icon: "/candy/favicon.png",
  },
  openGraph: {
    title: "Whole 中国｜把功能，做成一颗好吃的糖",
    description: "源自塞尔维亚的功能含片，为夜晚与餐后两个日常时刻而来。",
    type: "website",
    locale: "zh_CN",
    url: "https://www.destinypixel.com/candy",
    images: [
      {
        url: "https://www.destinypixel.com/candy/og.png",
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
    images: ["https://www.destinypixel.com/candy/og.png"],
  },
};

export default function CandyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
