import type { Metadata } from "next";
import DanciExperience from "@/components/danci-experience";

export const metadata: Metadata = {
  title: "Neural Cache 单词查杀 | DestinyPixel",
  description:
    "A sci-fi vocabulary training game with root forging, spelling patches, and a word galaxy map for learners who dislike rote memorization.",
};

export default function DanciPage() {
  return <DanciExperience />;
}
