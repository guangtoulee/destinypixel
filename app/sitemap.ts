import type { MetadataRoute } from "next";
import { absoluteUrl, languageAlternates, routeSeo } from "@/lib/seo";
import { journalArticles, journalHref } from "@/lib/journal";
import { seoGuidePath, seoGuides } from "@/lib/seo-guides";

/** Main-site product + content only. Test/side apps stay out of the index. */
const publicRoutes = [
  { path: routeSeo.home.path, priority: 1, changeFrequency: "weekly" as const },
  { path: routeSeo.tools.path, priority: 0.9, changeFrequency: "monthly" as const },
  { path: routeSeo.learn.path, priority: 0.82, changeFrequency: "weekly" as const },
  { path: routeSeo.insights.path, priority: 0.74, changeFrequency: "weekly" as const },
  { path: routeSeo.palm.path, priority: 0.7, changeFrequency: "weekly" as const },
  { path: routeSeo.face.path, priority: 0.68, changeFrequency: "weekly" as const },
  { path: routeSeo.oracle.path, priority: 0.72, changeFrequency: "weekly" as const },
  { path: routeSeo.sticks.path, priority: 0.71, changeFrequency: "weekly" as const },
  { path: routeSeo.atelier.path, priority: 0.73, changeFrequency: "weekly" as const },
  { path: routeSeo.tuteng.path, priority: 0.88, changeFrequency: "monthly" as const },
  { path: "/xingpan", priority: 0.86, changeFrequency: "monthly" as const },
  { path: "/ultra", priority: 0.9, changeFrequency: "monthly" as const },
];

function safeJournalRoutes(): MetadataRoute.Sitemap {
  try {
    return [undefined, ...journalArticles].flatMap((article) => {
      const languages = {
        en: absoluteUrl(journalHref("en", article?.slug)),
        "zh-Hans": absoluteUrl(journalHref("zh", article?.slug)),
        "x-default": absoluteUrl(journalHref("en", article?.slug)),
      };
      return (["en", "zh"] as const).map((locale) => ({
        url: absoluteUrl(journalHref(locale, article?.slug)),
        lastModified:
          article?.updatedAt ??
          journalArticles.map((item) => item.updatedAt).sort().at(-1),
        changeFrequency: article ? ("monthly" as const) : ("weekly" as const),
        priority: article ? 0.7 : 0.75,
        alternates: { languages },
      }));
    });
  } catch {
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  try {
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
                Object.entries(languages).map(([language, href]) => [
                  language,
                  absoluteUrl(href),
                ]),
              ),
            }
          : undefined,
      }));
    });

    const dayPillarLanguages = {
      en: absoluteUrl("/day-pillar"),
      "zh-Hans": absoluteUrl("/day-pillar?locale=zh"),
      "x-default": absoluteUrl("/day-pillar"),
    };
    const dayPillarRoutes: MetadataRoute.Sitemap = [
      dayPillarLanguages.en,
      dayPillarLanguages["zh-Hans"],
    ].map((url) => ({
      url,
      changeFrequency: "monthly" as const,
      priority: 0.85,
      alternates: { languages: dayPillarLanguages },
    }));

    const guideRoutes: MetadataRoute.Sitemap = seoGuides.map((guide) => ({
      url: absoluteUrl(seoGuidePath(guide)),
      changeFrequency: "monthly",
      priority: 0.78,
    }));
    return [...primaryRoutes, ...safeJournalRoutes(), ...dayPillarRoutes, ...guideRoutes];
  } catch {
    // Never 500 the sitemap — fall back to homepage only
    return [
      {
        url: absoluteUrl("/"),
        changeFrequency: "weekly",
        priority: 1,
      },
    ];
  }
}
