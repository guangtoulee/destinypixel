import type { Metadata } from "next";
import DanciExperience from "@/components/danci-experience";

export const metadata: Metadata = {
  title: "Recall Base 七年级单词训练 | DestinyPixel",
  description:
    "A mission-based Grade 7 vocabulary trainer built around active recall, spelling, listening, correction, and spaced review.",
};

export default function DanciPage() {
  return <DanciExperience />;
}
