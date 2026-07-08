import type { Metadata } from "next";
import JubenExperience from "@/components/juben-experience";
import { makePageMetadata, routeSeo } from "@/lib/seo";

export const maxDuration = 60;

export const metadata: Metadata = makePageMetadata(routeSeo.juben);

export default function JubenPage() {
  return <JubenExperience />;
}
