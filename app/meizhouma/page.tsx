import type { Metadata } from "next";
import { makePageMetadata } from "@/lib/seo";
import MeizhouMaExperience from "@/components/meizhouma-experience";

export const metadata: Metadata = makePageMetadata({
  path: "/meizhouma",
  title: "Meizhou Ma | DestinyPixel",
  description:
    "A kinetic bilingual visual story for Meizhou Mazu, built around the Tianhou crown, ocean geometry, and modern Chinese myth.",
});

export default function MeizhouMaPage() {
  return <MeizhouMaExperience />;
}
