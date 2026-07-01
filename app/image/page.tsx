import type { Metadata } from "next";
import ImageStudio from "@/components/image-studio";

export const metadata: Metadata = {
  title: "Image Studio | DestinyPixel",
  description:
    "Generate 1K and 2K visual assets with Grok Imagine, with optional prompt refinement.",
};

export const maxDuration = 60;

export default function ImagePage() {
  return <ImageStudio />;
}
