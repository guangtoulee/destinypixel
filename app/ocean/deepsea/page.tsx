import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OCEAN_COOKIE_NAME, verifyOceanSession } from "@/lib/ocean-access";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "探渊·寻珍 中国深海考古展 · 标注图修订版 R2" },
  description: "国家海洋考古博物馆（青岛）中国深海考古展：依用户标注修订的入口拱门、弧幕、考古场景、文物展示与三维场馆。",
  alternates: { canonical: "/ocean/deepsea" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: { title: "探渊·寻珍 中国深海考古展", description: "私密方案审阅", url: "/ocean/deepsea", images: [] },
  twitter: { title: "探渊·寻珍 中国深海考古展", description: "私密方案审阅", images: [] },
};

export default async function DeepseaPage() {
  if (!verifyOceanSession((await cookies()).get(OCEAN_COOKIE_NAME)?.value)) redirect("/ocean/access?next=deepsea");
  return (
    <main style={{ width: "100%", height: "100dvh", overflow: "hidden" }}>
      <iframe src="/ocean/deepsea/presentation.html" title="探渊·寻珍 中国深海考古展标注图修订版 R2" allowFullScreen style={{ width: "100%", height: "100%", border: 0, display: "block" }} />
    </main>
  );
}
