import type { Metadata, Viewport } from "next";
import "./xingpan.css";

export const metadata: Metadata = {
  title: "命运中枢｜八字 × 星盘 3D 命运可视化",
  description:
    "DestinyPixel 赛博命理实验：将中国八字、六十甲子与西方星盘转译为可交互的三维粒子命运图谱。",
  alternates: { canonical: "/xingpan" },
  openGraph: {
    type: "website",
    url: "/xingpan",
    title: "命运中枢｜DestinyPixel",
    description: "进入你的 3D 命运中枢，看见时间、星环与人生节点如何彼此牵引。",
  },
  twitter: {
    card: "summary_large_image",
    title: "命运中枢｜DestinyPixel",
    description: "八字 × 星盘 × 3D 粒子命运图谱。",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#030611",
};

export default function XingpanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
