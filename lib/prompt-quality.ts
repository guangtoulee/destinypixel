import type { PromptFeedItem } from "@/lib/ai/prompt";

export const promptArticleLimits = {
  home: 6,
  archive: 24,
  indexed: 12,
} as const;

export function isTextPromptArticle(item: PromptFeedItem) {
  return item.sourceType === "x" && !item.imageUrl && !item.videoUrl;
}

export function promptArticleQualityScore(item: PromptFeedItem) {
  if (!isTextPromptArticle(item)) return -100;

  const text = `${item.title} ${item.description} ${item.prompt}`;
  const promptLength = item.prompt.trim().length;
  if (
    promptLength < 180 ||
    /(\b\d{2,}\s+AI tools|save you .*hours|\$[\d,]+\/?month|link in bio|subscribe|course|giveaway|only two prompts|million views)/i.test(text)
  ) {
    return -100;
  }

  const metrics = item.metrics;
  let score = 0;

  score += metrics.score >= 2000 ? 5 : metrics.score >= 800 ? 4 : metrics.score >= 400 ? 3 : metrics.score >= 150 ? 1 : 0;
  score += metrics.views >= 50000 ? 3 : metrics.views >= 15000 ? 2 : metrics.views >= 5000 ? 1 : 0;
  score += metrics.bookmarks >= 300 ? 3 : metrics.bookmarks >= 100 ? 2 : metrics.bookmarks >= 30 ? 1 : 0;

  if (/(prompt|workflow|tutorial|how to|case study|breakdown|comparison|compare|\bvs\.?\b|storyboard|camera|shot)/i.test(text)) score += 2;
  if (/(release|launch|update|new model|available|testflight|version|v\d+(?:\.\d+)?|2\.0|3\.1|4k)/i.test(text)) score += 2;
  if (/\b(?:seedance|veo|kling|runway|midjourney|gpt.?image|grok imagine|flux|comfyui)\b/i.test(text)) score += 1;
  if (promptLength >= 500) score += 1;
  if (/(illegal|broke the internet|hard to believe|wild|insane|game.?changer|nobody expects)/i.test(text)) score -= 1;

  return score;
}

export function isHighQualityPromptArticle(item: PromptFeedItem) {
  return promptArticleQualityScore(item) >= 10;
}

export function curatePromptArticles(
  items: PromptFeedItem[],
  limit: number = promptArticleLimits.archive,
) {
  return items
    .filter(isHighQualityPromptArticle)
    .sort((left, right) => {
      if (left.isPinned !== right.isPinned) return left.isPinned ? -1 : 1;
      const dateDifference = new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      if (dateDifference) return dateDifference;
      return promptArticleQualityScore(right) - promptArticleQualityScore(left);
    })
    .slice(0, limit);
}
