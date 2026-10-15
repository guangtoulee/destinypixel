import type { Metadata } from "next";
import BookJourney from "./BookJourney";

export const metadata: Metadata = {
  title: { absolute: "燕赵本草长卷 · 一部书的旅行" },
  description: "走进一间想象中的燕赵书坊，拾页、校序、刷印、赏器，收藏一页文化记忆。独立历史文化互动演示。",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  alternates: { canonical: "/zhongyi1" },
  openGraph: { title: "燕赵本草长卷 · 一部书的旅行", description: "一页有来处，书香有回声。历史文化互动演示。", url: "/zhongyi1", locale: "zh_CN", images: [{ url: "/zhongyi1/bookshop.webp", width: 1672, height: 941 }] },
};

export default function ZhongyiDemoPage() { return <BookJourney />; }
