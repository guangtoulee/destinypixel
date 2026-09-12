import type { Metadata } from "next";
import EnglishLearningExperience from "@/components/english-learning-experience";
import Link from "next/link";

export const metadata: Metadata = {
  title: "旧版英语练习 | Bright Steps",
  description: "保留原有的词卡、教材主题练习、听力和阅读入口。",
  robots: { index: false, follow: true },
};

export default function ClassicEnglishPage() {
  return <>
    <div lang="zh-CN" style={{ padding: "14px 22px", background: "#edf3dd", color: "#31563e", fontSize: 13, lineHeight: 1.8 }}>
      旧版练习 · 原来的测评分档仅供选择练习起点，不代表词汇总量；教材词包尚未覆盖全册。
      {" "}<Link href="/english" style={{ textDecoration: "underline", fontWeight: 600 }}>进入新版学习</Link>
    </div>
    <EnglishLearningExperience />
  </>;
}
