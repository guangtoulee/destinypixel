import promptRadarSnapshot from "@/data/prompt-radar.json";
import {
  normalizePromptFeedItem,
  type PromptCategory,
  type PromptFeedItem,
} from "@/lib/ai/prompt";

export type PromptCategoryProfile = {
  name: PromptCategory;
  slug: string;
  eyebrow: string;
  description: string;
  focus: string;
  accent: "acid" | "mint" | "pink" | "paper";
};

export const promptCategoryProfiles: PromptCategoryProfile[] = [
  {
    name: "人像时尚",
    slug: "portrait-fashion",
    eyebrow: "PORTRAIT / FASHION",
    description: "从人物设定、服装材质到镜头距离，拆解可复刻的人像与时尚 Prompt。",
    focus: "先锁定人物身份与服装轮廓，再用光线、焦段和动作消除“普通写真感”。",
    accent: "pink",
  },
  {
    name: "产品商业",
    slug: "product-commercial",
    eyebrow: "PRODUCT / CAMPAIGN",
    description: "产品静物、品牌广告与商业视觉案例，强调材质、卖点和版式用途。",
    focus: "产品必须先于氛围被看见；材质反射、空间尺度和品牌留白决定成片是否能用。",
    accent: "acid",
  },
  {
    name: "视频叙事",
    slug: "video-storytelling",
    eyebrow: "MOTION / STORY",
    description: "围绕 Seedance、Kling、Veo 等模型的动作、运镜、节奏与连续性方法。",
    focus: "把一段描述拆成起始状态、动作变化、镜头响应和结束画面，连续性比形容词更重要。",
    accent: "mint",
  },
  {
    name: "平面设计",
    slug: "graphic-design",
    eyebrow: "GRAPHIC / TYPE",
    description: "海报、社交媒体、信息图与中文排版案例，关注信息层级和可交付性。",
    focus: "先规定信息层级和文字安全区，再谈视觉风格；无法落版的漂亮画面不是完整设计。",
    accent: "paper",
  },
  {
    name: "插画三维",
    slug: "illustration-3d",
    eyebrow: "ILLUSTRATION / 3D",
    description: "角色插画、材质实验、三维物件和风格化世界观的生成方法。",
    focus: "轮廓语言、材质规则和世界观要互相支持，避免把互不相干的风格词堆在一起。",
    accent: "mint",
  },
  {
    name: "建筑空间",
    slug: "architecture-space",
    eyebrow: "SPACE / ARCHITECTURE",
    description: "建筑、室内与空间叙事案例，强调尺度、动线、材料和环境光。",
    focus: "空间生成先交代尺度参照、结构关系与主要材质，再用人物或物件建立真实比例。",
    accent: "paper",
  },
  {
    name: "风景旅行",
    slug: "landscape-travel",
    eyebrow: "LANDSCAPE / TRAVEL",
    description: "自然风景、城市漫游和旅行影像 Prompt，保留天气、时间与在场感。",
    focus: "地点只是起点，决定画面的往往是天气、时刻、观察位置和一处具体生活迹象。",
    accent: "acid",
  },
  {
    name: "工具工作流",
    slug: "tools-workflow",
    eyebrow: "TOOLS / WORKFLOW",
    description: "AI 视觉工具、节点流程与生产方法，记录从想法到可交付结果的路径。",
    focus: "关注输入、模型分工、交接格式和失败回退，而不只记录“用了什么工具”。",
    accent: "pink",
  },
  {
    name: "视觉创意",
    slug: "visual-ideas",
    eyebrow: "VISUAL / CONCEPT",
    description: "难以归入单一媒介的视觉概念、实验影像和跨模型创意。",
    focus: "先找到一个能用一句话说清的视觉矛盾，再让风格、构图与技术为它服务。",
    accent: "pink",
  },
];

export const promptSnapshotItems = promptRadarSnapshot.items.map((item) =>
  normalizePromptFeedItem(item as Omit<Partial<PromptFeedItem>, "metrics">),
);

export function isPromptArticle(item: PromptFeedItem) {
  return item.sourceType === "x" && !item.imageUrl && !item.videoUrl;
}

export function promptItemHref(item: PromptFeedItem) {
  return `/prompt/${isPromptArticle(item) ? "article" : "case"}/${encodeURIComponent(item.id)}`;
}

export function getPromptItem(id: string) {
  return promptSnapshotItems.find((item) => item.id === id);
}

export function getPromptCategoryProfile(slug: string) {
  return promptCategoryProfiles.find((profile) => profile.slug === slug);
}

export function getPromptCategoryProfileByName(name: PromptCategory) {
  return promptCategoryProfiles.find((profile) => profile.name === name);
}

export function promptCategoryHref(category: PromptCategory) {
  const profile = getPromptCategoryProfileByName(category);
  return profile ? `/prompt/category/${profile.slug}` : "/prompt";
}

function editorialCandidates() {
  const visual = promptSnapshotItems
    .filter((item) => !isPromptArticle(item) && Boolean(item.imageUrl || item.videoUrl))
    .sort((left, right) => right.metrics.score - left.metrics.score)
    .slice(0, 28);
  const articles = promptSnapshotItems
    .filter((item) => isPromptArticle(item) && item.prompt.length >= 280 && item.sourceUrl)
    .sort((left, right) => right.metrics.score - left.metrics.score)
    .slice(0, 16);

  return [...visual, ...articles];
}

const indexablePromptIds = new Set(editorialCandidates().map((item) => item.id));

export function isIndexablePromptItem(item: PromptFeedItem) {
  return indexablePromptIds.has(item.id);
}

export function getIndexablePromptItems() {
  return promptSnapshotItems.filter((item) => indexablePromptIds.has(item.id));
}

export function getPromptSeoTitle(item: PromptFeedItem) {
  const hasChinese = /[\u3400-\u9fff]/.test(item.title);
  const model = item.modelHints[0] || item.tags[0] || "AI 视觉";
  const title = item.title.replace(/\s+/g, " ").trim();
  return hasChinese ? title : `${model} ${item.category}案例：${title}`;
}

function stableChoice<T>(item: PromptFeedItem, choices: readonly T[]) {
  const value = Array.from(item.id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return choices[value % choices.length];
}

export function buildPromptEditorial(item: PromptFeedItem) {
  const profile = getPromptCategoryProfileByName(item.category);
  const model = item.modelHints[0] || (item.contentType === "video" ? "主流视频模型" : "主流图像模型");
  const opening = stableChoice(item, [
    "这条内容值得留下的，不是表面的风格词，而是它提供了一条可以继续实验的画面路径。",
    "先别急着照抄整段 Prompt：真正有用的是主体、空间和镜头之间的约束关系。",
    "它最有价值的部分，是把一个模糊想法推进到了可以被模型执行的程度。",
  ] as const);
  const execution = item.contentType === "video"
    ? `用 ${model} 复刻时，建议先单独生成稳定首帧，再把动作拆成“开始、变化、收束”三段；每段只保留一个主要运动。`
    : `用 ${model} 复刻时，先固定主体和构图，再逐次替换光线、色调或材质中的一个变量，这样更容易判断哪项描述真正起作用。`;

  return {
    summary: `${opening}${profile ? ` ${profile.focus}` : ""}`,
    execution,
    checks: [
      `主体：${item.description || item.prompt.slice(0, 100)}`,
      `视觉方向：${item.style}；${item.lighting}`,
      `镜头与构图：${item.camera}；${item.composition}`,
      `交付约束：${item.aspectRatio}，${item.negativePrompt}`,
    ],
    modelAdvice: `${item.modelHints.join(" / ") || model}。先用原始 Prompt 建立基准结果，再根据模型对自然语言、镜头运动或文字排版的能力做局部改写。`,
  };
}

export function relatedPromptItems(item: PromptFeedItem, limit = 4) {
  return promptSnapshotItems
    .filter((candidate) => candidate.id !== item.id && candidate.category === item.category)
    .sort((left, right) => {
      const leftModelMatch = left.modelHints.some((model) => item.modelHints.includes(model)) ? 1 : 0;
      const rightModelMatch = right.modelHints.some((model) => item.modelHints.includes(model)) ? 1 : 0;
      return rightModelMatch - leftModelMatch || right.metrics.score - left.metrics.score;
    })
    .slice(0, limit);
}
