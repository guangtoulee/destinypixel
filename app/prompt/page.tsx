import type { Metadata } from "next";
import PromptExperience from "@/components/prompt-experience";
import { makePageMetadata, routeSeo } from "@/lib/seo";

export const maxDuration = 60;

export const metadata: Metadata = makePageMetadata(routeSeo.prompt);

export default function PromptPage() {
  return <PromptExperience />;
}
