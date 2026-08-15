import type { Metadata, Viewport } from "next";

import { SiteFooter, SiteHeader } from "./components";
import "./jake.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.destinypixel.com"),
  title: {
    default: "Jake Vitamincandy 中文官网｜无糖维生素糖果与薄荷糖",
    template: "%s｜Jake Vitamincandy 中文官网",
  },
  description:
    "Jake Vitamincandy 中文品牌与产品信息站。了解塞尔维亚 Packom International 的无糖维生素糖果、Jake Mints 与 Infinity 长效薄荷糖。",
  keywords: [
    "Jake Vitamincandy",
    "无糖糖果",
    "维生素糖果",
    "无糖薄荷糖",
    "塞尔维亚糖果",
    "Packom International",
  ],
  alternates: {
    canonical: "/jake",
  },
  openGraph: {
    title: "Jake Vitamincandy 中文官网｜无糖，也可以很有味道",
    description: "来自塞尔维亚的无糖维生素糖果、清新薄荷糖与 Infinity 长效系列。",
    url: "/jake",
    siteName: "Jake Vitamincandy 中文官网",
    locale: "zh_CN",
    type: "website",
    images: [
      {
        url: "/jake/og.png",
        width: 1200,
        height: 630,
        alt: "Jake Vitamincandy 中文官网 - 无糖，也可以很有味道",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jake Vitamincandy 中文官网",
    description: "无糖维生素糖果、清新薄荷糖与 Infinity 长效系列。",
    images: ["/jake/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/jake/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f8fa",
  width: "device-width",
  initialScale: 1,
};

export default function JakeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="jake-site">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
