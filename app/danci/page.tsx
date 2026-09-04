import type { Metadata } from "next";
import DanciExperience from "@/components/danci-experience";

export const metadata: Metadata = {
  title: "Recall Base 初中英语单词训练 | DestinyPixel",
  description:
    "A mission-based middle-school vocabulary trainer with textbook levels, active recall, spelling, listening, correction, and spaced review.",
};

export default function DanciPage() {
  return <DanciExperience />;
}
