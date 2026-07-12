import type { PromptCategory, PromptFeedItem } from "@/lib/ai/prompt";

const categorySlugs: Record<PromptCategory, string> = {
  "人像时尚": "portrait-fashion",
  "产品商业": "product-commercial",
  "视频叙事": "video-storytelling",
  "平面设计": "graphic-design",
  "插画三维": "illustration-3d",
  "建筑空间": "architecture-space",
  "风景旅行": "landscape-travel",
  "工具工作流": "tools-workflow",
  "视觉创意": "visual-ideas",
};

export function promptItemLink(item: PromptFeedItem) {
  const kind = item.sourceType === "x" && !item.imageUrl && !item.videoUrl ? "article" : "case";
  return `/prompt/${kind}/${encodeURIComponent(item.id)}`;
}

export function promptCategoryLink(category: PromptCategory) {
  return `/prompt/category/${categorySlugs[category]}`;
}
