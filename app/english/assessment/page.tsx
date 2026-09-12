import type { Metadata } from "next";
import StudyExperience from "@/components/english-study/study-experience";

export const metadata: Metadata = {
  title: "词汇自测 | Bright Steps",
  description: "面向不同年龄的英语词义识别快测。查看本次样本表现与待复习词汇，了解下一步该练什么。",
};

export default function EnglishAssessmentPage() {
  return <StudyExperience initialView="assessment" />;
}
