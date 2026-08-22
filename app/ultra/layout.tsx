import type { Metadata, Viewport } from "next";
import "../xingpan/xingpan.css";
import "./ultra.css";

export const metadata: Metadata = {
  title: "ULTRA 命运意识｜真实八字算法 × DeepSeek AI",
  description:
    "DestinyPixel Ultra：以真太阳时、四柱八字、大运坐标与 DeepSeek 心理解析驱动的 3D 命运意识系统。",
  alternates: { canonical: "/ultra" },
  openGraph: {
    type: "website",
    url: "/ultra",
    title: "ULTRA 命运意识｜DestinyPixel",
    description: "真实排盘算法进入 3D 命运中枢，让每一个时间节点拥有自己的声音。",
  },
  twitter: {
    card: "summary_large_image",
    title: "ULTRA 命运意识｜DestinyPixel",
    description: "真太阳时 × 四柱大运 × DeepSeek 节点意识。",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#02050e",
};

export default function UltraLayout({ children }: { children: React.ReactNode }) {
  return children;
}
