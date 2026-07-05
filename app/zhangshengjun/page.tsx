import type { Metadata } from "next";
import ZhangShengJunExperience from "@/components/zhangshengjun-experience";

export const metadata: Metadata = {
  title: "永泰方壶岩·张圣君母殿 | 千年神公 闾山法主",
  description:
    "永泰方壶岩·张圣君母殿官方网站，呈现张圣君亦道亦佛的信仰底蕴、从凡人到神明的传奇叙事，以及跨越海峡与海外的法主公信仰网络。",
  alternates: {
    canonical: "https://zhangshengjun.org/",
  },
  openGraph: {
    type: "website",
    url: "https://zhangshengjun.org/",
    title: "永泰方壶岩·张圣君母殿",
    description:
      "探寻闾山法主公的发祥地：方壶岩母殿、神公传奇、游田信俗、两岸进香与影音文创。",
    images: [
      {
        url: "https://zhangshengjun.org/zhangshengjun/fanghu-hero.jpg",
        width: 1798,
        height: 875,
        alt: "永泰方壶岩母殿山水圣境",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "永泰方壶岩·张圣君母殿",
    description:
      "千年神公，闾山法主，农业保护神。探寻张圣君信仰的血缘地与法源地。",
    images: ["https://zhangshengjun.org/zhangshengjun/fanghu-hero.jpg"],
  },
};

export default function ZhangShengJunPage() {
  return <ZhangShengJunExperience />;
}
