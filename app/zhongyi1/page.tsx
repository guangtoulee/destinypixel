import type { Metadata } from "next";
import HistoryExperience from "./HistoryExperience";

export const metadata: Metadata = {
  title: { absolute: "燕赵医脉 · 石家庄中医药史" },
  description: "穿行实时三维医脉长卷，从伏羲文化传说、台西考古线索，到易水医家与当代承续。独立历史文化互动演示。",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  alternates: { canonical: "/zhongyi1" },
  openGraph: { title: "燕赵医脉 · 石家庄中医药史", description: "六境一脉，走近燕赵中医药文化的时间长卷。", url: "/zhongyi1", locale: "zh_CN" },
};

export default function ZhongyiDemoPage() { return <HistoryExperience />; }
