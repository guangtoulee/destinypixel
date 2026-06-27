import type { Metadata } from "next";
import MazuExperience from "@/components/mazu-experience";

export const metadata: Metadata = {
  title: "Mazu | DestinyPixel",
  description:
    "A refined story gateway to Mazu, the Fujian sea goddess whose living myth protects travelers, families, and people far from home.",
};

export default function MazuPage() {
  return <MazuExperience />;
}
