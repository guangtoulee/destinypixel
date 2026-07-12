import type { MetadataRoute } from "next";
import { absoluteUrl, routeSeo } from "@/lib/seo";
import {
  getIndexablePromptItems,
  promptCategoryProfiles,
  promptItemHref,
  promptSnapshotItems,
} from "@/lib/prompt-library";

const publicRoutes = [
  { path: routeSeo.home.path, priority: 1, changeFrequency: "weekly" },
  { path: routeSeo.learn.path, priority: 0.82, changeFrequency: "weekly" },
  { path: routeSeo.insights.path, priority: 0.74, changeFrequency: "weekly" },
  { path: routeSeo.palm.path, priority: 0.7, changeFrequency: "weekly" },
  { path: routeSeo.face.path, priority: 0.68, changeFrequency: "weekly" },
  { path: routeSeo.oracle.path, priority: 0.72, changeFrequency: "weekly" },
  { path: routeSeo.sticks.path, priority: 0.71, changeFrequency: "weekly" },
  { path: routeSeo.atelier.path, priority: 0.73, changeFrequency: "weekly" },
  { path: routeSeo.juben.path, priority: 0.76, changeFrequency: "weekly" },
  { path: routeSeo.prompt.path, priority: 0.78, changeFrequency: "daily" },
  { path: routeSeo.black.path, priority: 0.42, changeFrequency: "monthly" },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const primaryRoutes: MetadataRoute.Sitemap = publicRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates:
      route.path === routeSeo.prompt.path || route.path === routeSeo.juben.path
        ? undefined
        : {
            languages: {
              en: absoluteUrl(`${route.path}?locale=en`),
              zh: absoluteUrl(`${route.path}?locale=zh`),
              ru: absoluteUrl(`${route.path}?locale=ru`),
            },
          },
  }));

  const promptHubs: MetadataRoute.Sitemap = [
    "/prompt/articles",
    "/prompt/about",
    "/prompt/privacy",
    "/prompt/terms",
    ...promptCategoryProfiles
      .filter((profile) => promptSnapshotItems.some((item) => item.category === profile.name))
      .map((profile) => `/prompt/category/${profile.slug}`),
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: path.includes("category") || path.endsWith("articles") ? "daily" : "monthly",
    priority: path.includes("category") ? 0.72 : path.endsWith("articles") ? 0.74 : 0.4,
  }));

  const promptDetails: MetadataRoute.Sitemap = getIndexablePromptItems().map((item) => ({
    url: absoluteUrl(promptItemHref(item)),
    lastModified: new Date(item.importedAt || item.createdAt),
    changeFrequency: "monthly",
    priority: item.imageUrl || item.videoUrl ? 0.68 : 0.62,
  }));

  return [...primaryRoutes, ...promptHubs, ...promptDetails];
}
