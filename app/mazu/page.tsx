import type { Metadata } from "next";
import { makePageMetadata } from "@/lib/seo";
import MazuExperience from "@/components/mazu-experience";

export const metadata: Metadata = makePageMetadata({
  path: "/mazu",
  title: "Mazu | DestinyPixel",
  description:
    "A refined story gateway to Mazu, the Fujian sea goddess whose living myth protects travelers, families, and people far from home.",
});

export default function MazuPage() {
  return <MazuExperience />;
}
