import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OCEAN_COOKIE_NAME, verifyOceanSession } from "@/lib/ocean-access";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "近代沉舰考古专题展 · 展览设计方案" },
  description: "国家海洋考古博物馆（青岛）近代沉舰考古专题展：设计方案、空间效果、平面与交互式三维场馆。",
  alternates: { canonical: "/ocean" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: { title: "近代沉舰考古专题展 · 展览设计方案", description: "私密方案审阅", url: "/ocean", images: [] },
  twitter: { title: "近代沉舰考古专题展 · 展览设计方案", description: "私密方案审阅", images: [] },
};

export default async function OceanPage() {
  if (!verifyOceanSession((await cookies()).get(OCEAN_COOKIE_NAME)?.value)) redirect("/ocean/access");
  return (
    <main style={{ width: "100%", height: "100dvh", overflow: "hidden" }}>
      <iframe src="/ocean/presentation.html" title="近代沉舰考古专题展设计方案" allow="fullscreen" allowFullScreen style={{ width: "100%", height: "100%", border: 0, display: "block" }} />
    </main>
  );
}
