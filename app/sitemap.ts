import type { MetadataRoute } from "next";
import { absoluteUrl, languageAlternates, routeSeo } from "@/lib/seo";

const publicRoutes = [
  { path: routeSeo.home.path, priority: 1, changeFrequency: "weekly" },
  { path: routeSeo.tools.path, priority: 0.9, changeFrequency: "monthly" },
  { path: routeSeo.learn.path, priority: 0.82, changeFrequency: "weekly" },
  { path: routeSeo.insights.path, priority: 0.74, changeFrequency: "weekly" },
  { path: routeSeo.palm.path, priority: 0.7, changeFrequency: "weekly" },
  { path: routeSeo.face.path, priority: 0.68, changeFrequency: "weekly" },
  { path: routeSeo.oracle.path, priority: 0.72, changeFrequency: "weekly" },
  { path: routeSeo.sticks.path, priority: 0.71, changeFrequency: "weekly" },
  { path: routeSeo.atelier.path, priority: 0.73, changeFrequency: "weekly" },
  { path: routeSeo.tuteng.path, priority: 0.88, changeFrequency: "monthly" },
  { path: routeSeo.black.path, priority: 0.42, changeFrequency: "monthly" },
  { path: "/xingpan", priority: 0.86, changeFrequency: "monthly" },
  { path: "/ultra", priority: 0.9, changeFrequency: "monthly" },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const primaryRoutes: MetadataRoute.Sitemap = publicRoutes.flatMap((route) => {
    const languages = languageAlternates(route.path);
    const variants = languages
      ? [...new Set(Object.values(languages))]
      : [route.path];

    return variants.map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: languages
        ? {
            languages: Object.fromEntries(
              Object.entries(languages).map(([language, href]) => [language, absoluteUrl(href)]),
            ),
          }
        : undefined,
    }));
  });

  return primaryRoutes;
}
