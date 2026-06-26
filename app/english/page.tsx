import type { Metadata } from "next";
import EnglishLearningExperience from "@/components/english-learning-experience";

export const metadata: Metadata = {
  title: "Bright Steps English | DestinyPixel",
  description:
    "A lightweight English diagnostic and daily practice space for Chinese middle-school learners.",
};

export default function EnglishPage() {
  return <EnglishLearningExperience />;
}
