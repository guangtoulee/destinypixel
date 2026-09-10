import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import {
  getIndexablePromptItems,
  promptCategoryProfiles,
  promptItemHref,
  promptSnapshotItems,
} from "@/lib/prompt-library";

// Prompt Radar keeps its crawl inventory separate from the metaphysics site.
export default function sitemap(): MetadataRoute.Sitemap {
  const promptHubs: MetadataRoute.Sitemap = [
    "/prompt",
    "/prompt/articles",
    "/prompt/about",
    "/prompt/privacy",
    "/prompt/terms",
    ...promptCategoryProfiles
      .filter((profile) => promptSnapshotItems.some((item) => item.category === profile.name))
      .map((profile) => `/prompt/category/${profile.slug}`),
  ].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === "/prompt" || path.includes("category") || path.endsWith("articles") ? "daily" : "monthly",
    priority: path === "/prompt" ? 0.78 : path.includes("category") ? 0.72 : path.endsWith("articles") ? 0.74 : 0.4,
  }));

  const promptDetails: MetadataRoute.Sitemap = getIndexablePromptItems().map((item) => ({
    url: absoluteUrl(promptItemHref(item)),
    lastModified: new Date(item.importedAt || item.createdAt),
    changeFrequency: "monthly",
    priority: item.imageUrl || item.videoUrl ? 0.68 : 0.62,
  }));

  return [...promptHubs, ...promptDetails];
}
