import type { Metadata } from "next";
import { makePageMetadata } from "@/lib/seo";
import StudyExperience from "@/components/english-study/study-experience";

export const metadata: Metadata = makePageMetadata({
  path: "/english",
  title: "Bright Steps · 每天学懂一点英语",
  description:
    "面向初中生的核心词汇、语境运用与 DeepSeek AI 辅导。先回想，再理解，自己用一次；另有面向不同年龄的词汇自测。",
});

export default function EnglishPage() {
  return <StudyExperience />;
}
