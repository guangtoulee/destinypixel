import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "近代沉舰考古专题展 · 三维场馆" },
  description: "浏览近代沉舰考古专题展的三维场馆模型，查看序厅、历史展区、核心沉舰、科技保护展区和尾厅。",
  alternates: { canonical: "/blender" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "近代沉舰考古专题展 · 三维场馆",
    description: "30×30米展馆的可交互三维白模。",
    url: "/blender",
    images: ["/blender/assets/poster.jpg"],
  },
};

export default function ShipwreckMuseumPage() {
  return (
    <main style={{ width: "100%", height: "100dvh", overflow: "hidden" }}>
      <iframe
        src="/blender/viewer.html"
        title="近代沉舰考古专题展三维场馆查看器"
        allow="fullscreen"
        allowFullScreen
        style={{ width: "100%", height: "100%", border: 0, display: "block" }}
      />
    </main>
  );
}
