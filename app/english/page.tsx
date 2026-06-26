import type { Metadata } from "next";
import EnglishLearningExperience from "@/components/english-learning-experience";

export const metadata: Metadata = {
  title: "Bright Steps English | DestinyPixel",
  description:
    "An adaptive English diagnostic, practice, and word-game space for learners at any age.",
};

export default function EnglishPage() {
  return <EnglishLearningExperience />;
}
