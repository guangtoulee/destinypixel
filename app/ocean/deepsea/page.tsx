import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OCEAN_COOKIE_NAME, verifyOceanSession } from "@/lib/ocean-access";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "探渊·寻珍 中国深海考古展 · 视觉重设计 R3" },
  description: "国家海洋考古博物馆（青岛）中国深海考古展：依据建筑条件重做连续叙事墙、顶面灯光、考古场景与宝船结构切片的三维展览。",
  alternates: { canonical: "/ocean/deepsea" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: { title: "探渊·寻珍 中国深海考古展", description: "私密方案审阅", url: "/ocean/deepsea", images: [] },
  twitter: { title: "探渊·寻珍 中国深海考古展", description: "私密方案审阅", images: [] },
};

export default async function DeepseaPage() {
  if (!verifyOceanSession((await cookies()).get(OCEAN_COOKIE_NAME)?.value)) redirect("/ocean/access?next=deepsea");
  return (
    <main style={{ width: "100%", height: "100dvh", overflow: "hidden" }}>
      <iframe src="/ocean/deepsea/presentation.html" title="探渊·寻珍 中国深海考古展视觉重设计 R3" allowFullScreen style={{ width: "100%", height: "100%", border: 0, display: "block" }} />
    </main>
  );
}
