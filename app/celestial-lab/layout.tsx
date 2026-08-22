import type { Metadata, Viewport } from "next";
import "./celestial-lab.css";

export const metadata: Metadata = {
  title: "天命合仪｜立体本命星盘 × 八字星盘化",
  description: "DestinyPixel 静态空间原型：四柱晶核、立体本命天球，以及 10 大运 × 10 流年的时间分舱。",
  alternates: { canonical: "/celestial-lab" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#020509",
};

export default function CelestialLabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
