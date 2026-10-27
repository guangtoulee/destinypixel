import "server-only";
import { seoGuides, seoGuidePath } from "./seo-guides";
import { journalArticles, journalArticleLocales, journalHref } from "./journal";
import type { JournalLocale } from "./journal-locales";
import { journalArticleTopics, type JournalTopic } from "./journal-topics";
import tarotCatalog from "./tarot-learning/catalog.json";
import hexagramCatalog from "./hexagram-learning/catalog.json";
import { tarotLearningSlug, tarotLearningHref } from "./tarot-learning/paths";
import { hexagramHref } from "./hexagram-learning/paths";
import { trigramIds, trigramSlug } from "./trigram-learning/identity";
import { getTrigramArticle } from "./trigram-learning/content";
import { trigramHref } from "./trigram-learning/paths";

export type JournalTopicEntry = { slug: string; title: string; description: string; href: string; topics: readonly JournalTopic[] };
/** The filter includes real article pages from the existing four article families. */
export function journalTopicEntries(locale: JournalLocale): JournalTopicEntry[] {
  return [
    ...journalArticles.filter(article => journalArticleLocales(article).includes(locale)).map(article => ({ slug: article.slug, title: article.translations[locale].title, description: article.translations[locale].description, href: journalHref(locale, article.slug), topics: journalArticleTopics(article) })),
    ...tarotCatalog[locale].map(article => ({ slug: tarotLearningSlug(article.cardId as Parameters<typeof tarotLearningSlug>[0]), title: article.title, description: article.hook, href: tarotLearningHref(article.cardId, locale)!, topics: ["tarot-reading"] as const })),
    ...hexagramCatalog[locale].map(article => ({ slug: article.id, title: article.title, description: article.plainSummary, href: hexagramHref(article.kingWenNumber, locale)!, topics: ["iching"] as const })),
    ...trigramIds.map(id => { const article = getTrigramArticle(id, locale)!; return { slug: trigramSlug(id), title: article.title, description: article.summary, href: trigramHref(id, locale), topics: ["iching"] as const }; }),
    ...(locale === "en" ? seoGuides.map(guide => ({ slug: guide.slug, title: guide.h1, description: guide.description, href: seoGuidePath(guide), topics: journalArticleTopics(guide) })) : []),
  ];
}
