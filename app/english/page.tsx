import type { Metadata } from "next";
import { makePageMetadata } from "@/lib/seo";
import EnglishLearningExperience from "@/components/english-learning-experience";

export const metadata: Metadata = makePageMetadata({
  path: "/english",
  title: "Bright Steps English | DestinyPixel",
  description:
    "An adaptive English diagnostic, PEP textbook sync, practice, and word-game space for learners at any age.",
});

export default function EnglishPage() {
  return <EnglishLearningExperience />;
}
