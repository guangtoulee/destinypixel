import type { MetadataRoute } from "next";
import { absoluteUrl, routeSeo } from "@/lib/seo";

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

  return publicRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: {
        en: absoluteUrl(`${route.path}?locale=en`),
        zh: absoluteUrl(`${route.path}?locale=zh`),
        ru: absoluteUrl(`${route.path}?locale=ru`),
      },
    },
  }));
}
