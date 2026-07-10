export type PromptLanguage = "zh" | "en";

export type PromptContentType = "image" | "video" | "prompt" | "case";

export type PromptSourceType = "x" | "community" | "manual" | "seed" | "api";

export type PromptMetrics = {
  likes: number;
  reposts: number;
  replies: number;
  quotes: number;
  bookmarks: number;
  views: number;
  score: number;
};

export type PromptFeedItem = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  negativePrompt: string;
  imageUrl?: string;
  videoUrl?: string;
  sourceUrl?: string;
  sourceType: PromptSourceType;
  authorName?: string;
  authorHandle?: string;
  createdAt: string;
  importedAt: string;
  tags: string[];
  modelHints: string[];
  style: string;
  lighting: string;
  camera: string;
  palette: string;
  mood: string;
  composition: string;
  aspectRatio: string;
  language: PromptLanguage;
  contentType: PromptContentType;
  metrics: PromptMetrics;
  complianceNote?: string;
  rawText?: string;
};

export type PromptExpandRequest = {
  idea?: string;
  language?: PromptLanguage;
  contentType?: "image" | "video";
  aspectRatio?: string;
  stylePreference?: string;
  avoid?: string;
};

export type PromptExpansionResult = {
  title: string;
  prompt: string;
  negativePrompt: string;
  language: PromptLanguage;
  contentType: "image" | "video";
  aspectRatio: string;
  modelHints: string[];
  breakdown: {
    subject: string;
    style: string;
    lighting: string;
    camera: string;
    palette: string;
    scene: string;
    mood: string;
    composition: string;
    quality: string;
  };
  preservedDetails: string[];
  creativeAdditions: string[];
  variants: string[];
  provider: "deepseek" | "local-fallback";
  model: string;
  generatedAt: string;
  note?: string;
};

export type PromptImageAnalysisResult = {
  title: string;
  prompt: string;
  negativePrompt: string;
  language: PromptLanguage;
  modelHints: string[];
  breakdown: {
    subject: string;
    style: string;
    lighting: string;
    camera: string;
    palette: string;
    scene: string;
    mood: string;
    composition: string;
  };
  confidence: number;
  provider: "xai-vision" | "local-fallback";
  model: string;
  generatedAt: string;
  note?: string;
};

type ChatMessage = {
  role: "system" | "user";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
};

const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL ??
  "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash";
const PROMPT_DEEPSEEK_TIMEOUT_MS = Number(
  process.env.PROMPT_DEEPSEEK_TIMEOUT_MS ?? 45000,
);

const X_RECENT_SEARCH_URL =
  process.env.X_RECENT_SEARCH_URL ??
  "https://api.x.com/2/tweets/search/recent";
const X_SEARCH_TIMEOUT_MS = Number(process.env.X_SEARCH_TIMEOUT_MS ?? 16000);
const X_DEFAULT_QUERY =
  process.env.X_PROMPT_SEARCH_QUERY ??
  [
    "(AI prompt OR \"image prompt\" OR \"video prompt\" OR Midjourney OR Seedance OR Veo OR Kling OR Runway OR \"Grok Imagine\")",
    "has:media -is:retweet",
    "-is:reply",
    "lang:en",
  ].join(" ");

const VISION_API_URL =
  process.env.PROMPT_VISION_API_URL ?? "https://api.x.ai/v1/chat/completions";
const VISION_MODEL = process.env.PROMPT_VISION_MODEL ?? "grok-4";
const VISION_TIMEOUT_MS = Number(process.env.PROMPT_VISION_TIMEOUT_MS ?? 30000);

const maxPromptLength = 5000;
const maxImportTextLength = 24000;

export const promptSourcePlan = {
  primary:
    "公开 X 搜索快照与 CC BY 社区索引并行收集，保留作者、时间、互动量、生成图和原帖链接。",
  fallback:
    "X 付费 API 不可用时，GitHub Actions 每天三次刷新公开索引；建好 prompt_items 表并设置 PROMPT_SUPABASE_ENABLED=true 后可持久化人工导入。",
  compliance:
    "不抓取 X 页面 HTML；只保存公开搜索结果、社区许可数据和必要元数据，并始终回链原作者。",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, fallback = "", limit = maxPromptLength) {
  if (typeof value !== "string") return fallback;

  return value
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim()
    .slice(0, limit);
}

function normalizeLanguage(value: unknown): PromptLanguage {
  return value === "en" ? "en" : "zh";
}

function normalizeContentType(value: unknown): PromptContentType {
  if (value === "video" || value === "prompt" || value === "case") {
    return value;
  }

  return "image";
}

function normalizeSourceType(value: unknown): PromptSourceType {
  if (
    value === "x" ||
    value === "community" ||
    value === "manual" ||
    value === "api"
  ) {
    return value;
  }

  return "seed";
}

function createTimeoutSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  };
}

async function readJsonResponse(response: Response) {
  const text = await response.text();

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (!isRecord(payload)) return fallback;

  const error = payload.error;

  if (isRecord(error) && typeof error.message === "string") {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  return fallback;
}

function parseJsonObject(text: string) {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) return null;

    try {
      return JSON.parse(text.slice(start, end + 1)) as unknown;
    } catch {
      return null;
    }
  }
}

function getPromptScore(metrics: Partial<PromptMetrics>) {
  const likes = Number(metrics.likes || 0);
  const reposts = Number(metrics.reposts || 0);
  const replies = Number(metrics.replies || 0);
  const quotes = Number(metrics.quotes || 0);
  const bookmarks = Number(metrics.bookmarks || 0);
  const views = Number(metrics.views || 0);

  return Math.round(
    likes * 2 + reposts * 4 + quotes * 3 + bookmarks * 3 + replies + views / 500,
  );
}

function normalizeMetrics(metrics?: Partial<PromptMetrics>): PromptMetrics {
  const normalized = {
    likes: Math.max(0, Number(metrics?.likes || 0)),
    reposts: Math.max(0, Number(metrics?.reposts || 0)),
    replies: Math.max(0, Number(metrics?.replies || 0)),
    quotes: Math.max(0, Number(metrics?.quotes || 0)),
    bookmarks: Math.max(0, Number(metrics?.bookmarks || 0)),
    views: Math.max(0, Number(metrics?.views || 0)),
    score: 0,
  };

  normalized.score =
    Number(metrics?.score || 0) || getPromptScore(normalized);

  return normalized;
}

function uniqueStrings(values: unknown[], limit = 8) {
  return Array.from(
    new Set(
      values
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ).slice(0, limit);
}

function makeSlug(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || crypto.randomUUID();
}

function stripUrls(value: string) {
  return value.replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim();
}

function inferTags(text: string) {
  const tagRules: Array<[RegExp, string]> = [
    [/midjourney|mj/i, "Midjourney"],
    [/grok|xai|x\.ai/i, "Grok"],
    [/veo/i, "Veo"],
    [/seedance|doubao/i, "Seedance"],
    [/kling/i, "Kling"],
    [/runway/i, "Runway"],
    [/flux/i, "Flux"],
    [/portrait|人物|肖像/i, "人物"],
    [/product|电商|产品/i, "产品"],
    [/cinematic|电影|摄影/i, "电影感"],
    [/video|motion|运镜|镜头/i, "视频"],
    [/prompt|提示词/i, "Prompt"],
  ];

  return uniqueStrings(tagRules.flatMap(([rule, tag]) => (rule.test(text) ? [tag] : [])), 8);
}

function inferModelHints(text: string, contentType: PromptContentType) {
  const hints = [
    /midjourney|mj/i.test(text) ? "Midjourney" : "",
    /grok|xai|x\.ai/i.test(text) ? "Grok Imagine" : "",
    /veo/i.test(text) ? "Veo" : "",
    /seedance|doubao/i.test(text) ? "Seedance" : "",
    /kling/i.test(text) ? "Kling" : "",
    /runway/i.test(text) ? "Runway" : "",
    /flux/i.test(text) ? "Flux" : "",
  ];

  const defaults =
    contentType === "video"
      ? ["Seedance", "Veo", "Kling"]
      : ["Grok Imagine", "Midjourney", "Flux"];

  return uniqueStrings([...hints, ...defaults], 5);
}

function inferTitle(text: string) {
  const clean = stripUrls(text);
  const firstLine = clean.split(/\n+/)[0]?.trim() || clean;
  const title = firstLine
    .replace(/^prompt\s*[:：-]?\s*/i, "")
    .replace(/^提示词\s*[:：-]?\s*/i, "")
    .slice(0, 34);

  return title || "AI Prompt 案例";
}

export function normalizePromptFeedItem(
  value: Omit<Partial<PromptFeedItem>, "metrics"> & {
    text?: string;
    metrics?: Partial<PromptMetrics>;
  },
): PromptFeedItem {
  const now = new Date().toISOString();
  const rawText = cleanText(value.rawText ?? value.text ?? value.prompt ?? "");
  const prompt = cleanText(
    value.prompt,
    rawText ||
      "高质量 AI 视觉案例，主体明确，空间层次清楚，光线服务情绪，构图可直接复刻。",
  );
  const contentType = normalizeContentType(value.contentType);
  const id =
    cleanText(value.id, "", 160) ||
    `${normalizeSourceType(value.sourceType)}-${makeSlug(
      value.sourceUrl || prompt,
    )}`;
  const tags = uniqueStrings(
    [...(value.tags || []), ...inferTags(`${prompt} ${rawText}`)],
    10,
  );
  const modelHints = uniqueStrings(
    [
      ...(value.modelHints || []),
      ...inferModelHints(`${prompt} ${rawText}`, contentType),
    ],
    6,
  );

  return {
    id,
    title: cleanText(value.title, inferTitle(prompt || rawText), 72),
    description: cleanText(
      value.description,
      contentType === "video"
        ? "适合拆成首帧、分段动作和运镜约束的视频 prompt 案例。"
        : "适合复刻风格、光线、主体和构图的图像 prompt 案例。",
      260,
    ),
    prompt,
    negativePrompt: cleanText(
      value.negativePrompt,
      "不要水印，不要 logo，不要低清模糊，不要畸形手，不要多余文字，不要主体漂移，不要过曝。",
      1400,
    ),
    imageUrl: cleanText(value.imageUrl, "", 900) || undefined,
    videoUrl: cleanText(value.videoUrl, "", 900) || undefined,
    sourceUrl: cleanText(value.sourceUrl, "", 900) || undefined,
    sourceType: normalizeSourceType(value.sourceType),
    authorName: cleanText(value.authorName, "", 120) || undefined,
    authorHandle: cleanText(value.authorHandle, "", 120) || undefined,
    createdAt: cleanText(value.createdAt, now, 80),
    importedAt: cleanText(value.importedAt, now, 80),
    tags,
    modelHints,
    style: cleanText(value.style, "写实商业影像", 120),
    lighting: cleanText(value.lighting, "柔和主光，暗部保留细节", 120),
    camera: cleanText(value.camera, "中长焦摄影感，主体清楚", 120),
    palette: cleanText(value.palette, "低饱和主色，局部高光点缀", 120),
    mood: cleanText(value.mood, "克制、精致、有故事感", 120),
    composition: cleanText(value.composition, "前景/中景/背景分层，主体位于视觉焦点", 180),
    aspectRatio: cleanText(value.aspectRatio, contentType === "video" ? "9:16" : "3:4", 24),
    language: normalizeLanguage(value.language),
    contentType,
    metrics: normalizeMetrics(value.metrics),
    complianceNote: cleanText(value.complianceNote, "", 260) || undefined,
    rawText: rawText || undefined,
  };
}

export function dedupePromptItems(items: PromptFeedItem[]) {
  const byKey = new Map<string, PromptFeedItem>();

  items.forEach((item) => {
    const key = item.sourceUrl || item.id || item.prompt.slice(0, 120);
    const existing = byKey.get(key);

    if (!existing || item.metrics.score > existing.metrics.score) {
      byKey.set(key, item);
    }
  });

  return Array.from(byKey.values()).sort((left, right) => {
    if (left.metrics.score !== right.metrics.score) {
      return right.metrics.score - left.metrics.score;
    }

    return (
      new Date(right.createdAt).getTime() -
      new Date(left.createdAt).getTime()
    );
  });
}

export const seedPromptItems: PromptFeedItem[] = [
  normalizePromptFeedItem({
    id: "seed-product-lightbox",
    sourceType: "seed",
    title: "黑曜石护肤瓶电商主图",
    description: "产品摄影、湿润石材、暖金边缘光，适合电商主图和详情页首屏。",
    prompt:
      "一瓶黑曜石质感高端护肤精华，透明玻璃瓶居中，湿润黑色石材台面，背后有柔和暖金色边缘光，瓶身反射清晰但不过曝，背景干净有微弱水汽，前景有少量水珠和石材纹理，商业产品摄影，85mm 镜头质感，浅景深，画面高级、克制、可留白用于标题。",
    negativePrompt:
      "不要乱码文字，不要假 logo，不要多瓶重复，不要瓶身畸形，不要过度眩光，不要低清模糊。",
    imageUrl: "/destinypixel-deep-space.png",
    tags: ["产品", "电商", "Grok"],
    modelHints: ["Grok Imagine", "Midjourney"],
    style: "高端商业产品摄影",
    lighting: "暖金边缘光，柔和顶光",
    camera: "85mm 产品摄影，浅景深",
    palette: "黑曜石、暖金、透明玻璃",
    mood: "精致、昂贵、克制",
    composition: "产品居中，底部道具少量分布，右上留白",
    aspectRatio: "1:1",
    contentType: "image",
    createdAt: "2026-07-08T08:10:00.000Z",
    metrics: { likes: 780, reposts: 96, replies: 24, quotes: 18, bookmarks: 210, views: 68000, score: 0 },
  }),
  normalizePromptFeedItem({
    id: "seed-cinematic-portrait",
    sourceType: "seed",
    title: "雨夜短剧人物定妆",
    description: "适合短剧首帧、角色定妆和连续性锁定。",
    prompt:
      "都市悬疑短剧女律师角色定妆，30 岁左右，黑色羊毛西装外套，白衬衫被雨打湿一角，手里握着一部亮屏手机，屏幕光照亮她紧张但克制的表情，背景是深夜法院外的玻璃门和雨痕，真人写实，近脸中景，50mm 电影摄影，冷蓝环境光与手机冷白光，皮肤真实，眼神有压力和判断力。",
    negativePrompt:
      "不要海报大字，不要水印，不要夸张惊恐表情，不要脸部塑料感，不要多余人物，不要五官漂移。",
    imageUrl: "/juben/director-desk.png",
    tags: ["短剧", "人物", "首帧"],
    modelHints: ["Grok Imagine", "Flux", "Midjourney"],
    style: "真人写实短剧",
    lighting: "雨夜冷蓝环境光，手机屏幕补光",
    camera: "50mm 中近景，浅景深",
    palette: "冷蓝、黑色、白色屏幕光",
    mood: "紧张、克制、现实",
    composition: "人物占画面 60%，背景玻璃门形成纵深",
    aspectRatio: "9:16",
    contentType: "image",
    createdAt: "2026-07-08T10:20:00.000Z",
    metrics: { likes: 640, reposts: 88, replies: 19, quotes: 12, bookmarks: 160, views: 42000, score: 0 },
  }),
  normalizePromptFeedItem({
    id: "seed-video-camera",
    sourceType: "seed",
    title: "4 秒产品开盖运镜",
    description: "图生视频镜头约束，适合 Seedance、Veo、Kling。",
    prompt:
      "4 秒产品视频，0-1 秒镜头从瓶盖上方极近特写开始，金属盖边缘有柔和高光；1-2.5 秒摄影机缓慢后退并略微下移，露出透明瓶身和湿润石材台面；2.5-4 秒一只手从右侧进入轻轻旋开瓶盖，微量水汽和反射变化出现，主体始终居中，焦点从瓶盖切到瓶身 logo 区域，动作真实细腻，商业广告片质感。",
    negativePrompt:
      "不要突然换场景，不要手指畸形，不要瓶身变形，不要镜头乱晃，不要字幕，不要水印。",
    imageUrl: "/english/hero-study.png",
    tags: ["视频", "运镜", "产品"],
    modelHints: ["Seedance", "Veo", "Kling"],
    style: "商业产品视频",
    lighting: "柔和棚拍光，金属边缘高光",
    camera: "微距推拉，焦点平滑切换",
    palette: "黑、透明玻璃、暖金",
    mood: "精密、干净、高级",
    composition: "主体居中，手部从右侧进入，背景保持不变",
    aspectRatio: "9:16",
    contentType: "video",
    createdAt: "2026-07-08T12:40:00.000Z",
    metrics: { likes: 910, reposts: 130, replies: 32, quotes: 20, bookmarks: 260, views: 92000, score: 0 },
  }),
  normalizePromptFeedItem({
    id: "seed-long-infographic",
    sourceType: "seed",
    title: "AI 工具长信息图布局",
    description: "适合小红书、博客配图和工具说明长图。",
    prompt:
      "一张 9:16 纵向 AI 创作工作流信息图，分成 5 个清晰模块：灵感收集、prompt 扩写、首帧生成、视频运镜、发布复盘。每个模块有小图标、编号、短标题占位和 2 行说明占位，背景为干净浅灰白，点缀青绿色和橙色线条，卡片之间有细分隔线，信息层级清楚，现代中文 SaaS 视觉，适合手机阅读。",
    negativePrompt:
      "不要真实可读乱码，不要密密麻麻小字，不要水印，不要 logo，不要过度装饰，不要低清模糊。",
    imageUrl: "/archetypes/sixty-archetypes.png",
    tags: ["信息图", "排版", "中文"],
    modelHints: ["Grok Imagine", "Midjourney"],
    style: "现代信息图设计",
    lighting: "干净平面光",
    camera: "正视图，无透视变形",
    palette: "浅灰白、青绿、橙色、深墨色",
    mood: "清楚、专业、轻量",
    composition: "纵向模块化排版，顶部标题区，内容区五段",
    aspectRatio: "9:16",
    contentType: "image",
    createdAt: "2026-07-07T16:20:00.000Z",
    metrics: { likes: 520, reposts: 62, replies: 14, quotes: 8, bookmarks: 140, views: 36000, score: 0 },
  }),
  normalizePromptFeedItem({
    id: "seed-fashion-editorial",
    sourceType: "seed",
    title: "青铜绿丝绒时装大片",
    description: "人物、服装材质、场景色彩和杂志摄影。",
    prompt:
      "高级时装杂志大片，一位亚洲女性模特穿青铜绿色丝绒长外套，站在旧剧院后台的木质楼梯旁，墙面有斑驳海报和暖色钨丝灯，服装材质有细腻绒面反光，模特侧身回头，表情平静自信，35mm 胶片摄影质感，暖橙灯光与深绿色阴影对比，画面有戏剧感但不过度夸张。",
    negativePrompt:
      "不要多余肢体，不要塑料皮肤，不要廉价影楼风，不要背景文字乱码，不要过曝，不要脸部变形。",
    imageUrl: "/zhangshengjun/peach-awakening.jpg",
    tags: ["人物", "时装", "摄影"],
    modelHints: ["Midjourney", "Flux", "Grok Imagine"],
    style: "杂志时装摄影",
    lighting: "暖色钨丝灯，深绿色阴影",
    camera: "35mm 胶片感，中景",
    palette: "青铜绿、暖橙、旧木色",
    mood: "复古、从容、戏剧化",
    composition: "模特三分线站位，楼梯形成斜向引导",
    aspectRatio: "3:4",
    contentType: "image",
    createdAt: "2026-07-07T18:05:00.000Z",
    metrics: { likes: 820, reposts: 104, replies: 28, quotes: 16, bookmarks: 190, views: 75000, score: 0 },
  }),
  normalizePromptFeedItem({
    id: "seed-scene-concept",
    sourceType: "seed",
    title: "海边城市清晨概念图",
    description: "前中后景分层、旅行摄影和城市氛围。",
    prompt:
      "清晨海边城市旅行摄影，前景是被潮水打湿的石阶和几片反光水洼，中景有骑自行车的人经过老街拱门，远景是海面薄雾和古建筑轮廓，日出金色光线从左侧进入，空气湿润，画面安静但有生活气息，真实摄影，24mm 广角，前景纹理清楚，远景柔和。",
    negativePrompt:
      "不要旅游海报文字，不要过度 HDR，不要虚假天空，不要人群混乱，不要低清，不要水印。",
    imageUrl: "/mazu/mazu-hero.png",
    tags: ["风景", "旅行", "摄影"],
    modelHints: ["Grok Imagine", "Midjourney", "Flux"],
    style: "真实旅行摄影",
    lighting: "清晨金色侧光，薄雾漫射",
    camera: "24mm 广角，前景纹理清楚",
    palette: "金色、海蓝、湿石灰、旧砖红",
    mood: "安静、清新、有生活气",
    composition: "前景石阶，中景人物，远景海面和建筑",
    aspectRatio: "16:9",
    contentType: "image",
    createdAt: "2026-07-07T20:10:00.000Z",
    metrics: { likes: 460, reposts: 51, replies: 10, quotes: 7, bookmarks: 90, views: 28000, score: 0 },
  }),
];

function fallbackPromptExpansion(
  input: Required<PromptExpandRequest> & { language: PromptLanguage; contentType: "image" | "video" },
  note?: string,
): PromptExpansionResult {
  const idea = cleanText(input.idea, "一个高级、真实、有清晰主体的 AI 视觉画面", 900);
  const isVideo = input.contentType === "video";
  const zh = input.language === "zh";
  const style = input.stylePreference || (isVideo ? "真人写实视频" : "电影级商业摄影");
  const aspectRatio = input.aspectRatio || (isVideo ? "9:16" : "3:4");
  const avoid = input.avoid || "水印、logo、乱码文字、低清模糊、主体漂移、畸形手、多余肢体";
  const title = zh ? `${idea.slice(0, 22)} · 基础整理` : `${idea.slice(0, 28)} · Basic draft`;
  const breakdown = zh
    ? {
        subject: idea,
        style,
        lighting: "未补写，等待智能服务根据主体与场景决定",
        camera: isVideo
          ? "未补写，等待智能服务生成分段动作与运镜"
          : "未补写，等待智能服务根据画面意图选择镜头",
        palette: "未补写，保持用户明确给出的颜色",
        scene: "未补写，不擅自加入室内、窗边、廊下等固定场景",
        mood: "未补写，等待智能服务根据主体关系推导",
        composition: `保持用户意图，画幅 ${aspectRatio}`,
        quality: "主体、材质和空间关系清楚，不改变用户明确设定",
      }
    : {
        subject: idea,
        style,
        lighting: "Not expanded; waiting for the intelligent service to infer lighting from the subject and scene.",
        camera: isVideo
          ? "Not expanded; waiting for timed action and camera direction."
          : "Not expanded; waiting for a lens choice based on the visual intent.",
        palette: "Not expanded; preserve every color explicitly provided by the user.",
        scene: "Not expanded; no default location is inserted.",
        mood: "Not expanded; waiting for contextual inference.",
        composition: `Preserve user intent in ${aspectRatio}.`,
        quality: "Keep the subject, materials, and spatial relationships clear without replacing explicit constraints.",
      };

  const prompt = zh
    ? `${idea}。风格：${style}。画幅：${aspectRatio}。保留上述所有明确设定，不擅自替换服装、颜色、版型、年龄、身份、场景或动作。`
    : `${idea}. Style: ${style}. Aspect ratio: ${aspectRatio}. Preserve every explicit attribute above; do not replace clothing, color, fit, age, identity, location, or action.`;

  return {
    title,
    prompt,
    negativePrompt: zh
      ? `不要${avoid}，不要裸露和性器官细节，不要未成年人或幼态性化，不要过曝，不要廉价影楼感，不要海报大字，不要塑料皮肤。`
      : `No ${avoid}, no nudity or sexual anatomy, no minors or young-looking sexualization, no overexposure, no cheap studio look, no poster typography, no plastic skin.`,
    language: input.language,
    contentType: input.contentType,
    aspectRatio,
    modelHints: isVideo ? ["Seedance", "Veo", "Kling"] : ["Grok Imagine", "Midjourney", "Flux"],
    breakdown,
    preservedDetails: [idea],
    creativeAdditions: [],
    variants: [],
    provider: "local-fallback",
    model: note || "structured-local-expander",
    generatedAt: new Date().toISOString(),
    note,
  };
}

function buildPromptExpansionMessages(
  input: Required<PromptExpandRequest> & { language: PromptLanguage; contentType: "image" | "video" },
): ChatMessage[] {
  return [
    {
      role: "system",
      content: [
        "You are a senior AI image and video prompt director for Chinese creators.",
        "Expand rough ideas into production-ready, visually rich prompts with subject, style, lighting, camera, palette, scene, mood, composition, quality, and negative constraints.",
        "First silently separate the input into LOCKED FACTS and OPEN SLOTS. LOCKED FACTS are every explicit identity, age range, ethnicity, garment category, garment fit, garment length, color, material, pose, action, location, time, object, relationship, and aspect ratio. They are hard constraints.",
        "Never replace, soften, or contradict a locked fact. A tight top must remain tight; a short skirt must remain a short skirt; a specified color, location, age, identity, and action must remain. Do not turn one garment into another merely to make the result more poetic.",
        "Only invent details for OPEN SLOTS. Add context-sensitive specifics such as facial traits, hairstyle, fabric weave, seams, accessories, micro-expression, environmental evidence, light behavior, lens choice, color relationships, and compositional tension.",
        "Choose additions from the actual semantic context. Campus, street, product, fantasy, documentary, fashion, food, architecture, and UI prompts must not share one recurring scene, palette, lens, pose, or mood.",
        "Do not copy examples, stock phrases, or a house template. Avoid defaulting to ink blue, ivory, mist, silver, window light, corridors, chiffon, embroidery, 85mm, or Eastern poetry unless the user's idea genuinely calls for them.",
        "Make the result feel art-directed and surprising while remaining faithful. Prefer specific nouns, physically plausible materials, micro-actions, spatial evidence, and a coherent visual idea over adjective stacking.",
        "Respect safety and commercial usability: do not add nudity, sexual anatomy, minors, young-looking sexualization, pornographic framing, or fetish detail. If the user asks for exposed sexual anatomy, transform it into tasteful fashion, portrait, swimwear, or editorial styling without explicit anatomy.",
        "Default to Chinese output when language is zh. Use English only when language is en.",
        "For video prompts include segmented timing, subject motion, camera motion, focus changes, and continuity constraints.",
        "The main prompt should usually be 220-480 Chinese characters for image prompts, or 280-560 Chinese characters for video prompts. The breakdown fields should add useful information instead of repeating the same sentence.",
        "Before returning JSON, silently audit the result against every locked fact and repair any contradiction.",
        "Return strict JSON only. No markdown.",
        "Schema:",
        "{",
        '  "title": "...",',
        '  "prompt": "...",',
        '  "negativePrompt": "...",',
        '  "modelHints": ["..."],',
        '  "breakdown": {"subject": "...", "style": "...", "lighting": "...", "camera": "...", "palette": "...", "scene": "...", "mood": "...", "composition": "...", "quality": "..."},',
        '  "preservedDetails": ["explicit user detail 1", "explicit user detail 2"],',
        '  "creativeAdditions": ["new inferred detail 1", "new inferred detail 2"],',
        '  "variants": ["...", "...", "..."]',
        "}",
      ].join("\n"),
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          idea: input.idea,
          language: input.language,
          contentType: input.contentType,
          aspectRatio: input.aspectRatio,
          stylePreference: input.stylePreference,
          avoid: input.avoid,
          outputRules: [
            "The main prompt must be directly usable in image/video generation tools.",
            "Preserve every explicit fact exactly in meaning. Expansion means filling missing visual decisions, never replacing supplied ones.",
            "Include subject details, face/hair/wardrobe/materials if relevant, style, lighting, camera/lens, palette, scene, mood, composition, quality, and negative constraints.",
            "Use concrete visual nouns and action constraints; avoid vague words only.",
            "For Chinese output, use vivid Chinese visual language suitable for copy-paste prompt generation.",
            "List preservedDetails and creativeAdditions separately so the user can audit what was kept and what was invented.",
            "Negative prompt must include the user's avoid list plus no watermark, no messy text, no low quality, no distorted hands/fingers, no subject drift, no explicit sexual anatomy.",
          ],
        },
        null,
        2,
      ),
    },
  ];
}

function looksLikePromptExpansion(value: unknown): value is Partial<PromptExpansionResult> {
  return isRecord(value) && typeof value.prompt === "string";
}

export function normalizePromptExpandRequest(body: PromptExpandRequest) {
  const language = normalizeLanguage(body.language);
  const contentType: "image" | "video" =
    body.contentType === "video" ? "video" : "image";

  return {
    idea: cleanText(body.idea, "", 1200),
    language,
    contentType,
    aspectRatio: cleanText(body.aspectRatio, contentType === "video" ? "9:16" : "3:4", 24),
    stylePreference: cleanText(body.stylePreference, "", 160),
    avoid: cleanText(body.avoid, "", 500),
  };
}

export async function expandPrompt(
  body: PromptExpandRequest,
): Promise<PromptExpansionResult> {
  const input = normalizePromptExpandRequest(body);

  if (input.idea.length < 2) {
    return fallbackPromptExpansion(
      { ...input, idea: "一个高级、真实、有清晰主体的 AI 视觉画面" },
      "Idea was empty; used a structured default.",
    );
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return fallbackPromptExpansion(input, "DEEPSEEK_API_KEY is not configured.");
  }

  const timeout = createTimeoutSignal(PROMPT_DEEPSEEK_TIMEOUT_MS);

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        temperature: 0.68,
        max_tokens: 1800,
        response_format: { type: "json_object" },
        messages: buildPromptExpansionMessages(input),
      }),
      cache: "no-store",
      signal: timeout.signal,
    });
    const payload = await readJsonResponse(response);

    if (!response.ok) {
      return fallbackPromptExpansion(
        input,
        getErrorMessage(payload, "DeepSeek prompt expansion failed."),
      );
    }

    const content = (
      payload as {
        choices?: Array<{ message?: { content?: string } }>;
      }
    ).choices?.[0]?.message?.content;
    const parsed = typeof content === "string" ? parseJsonObject(content) : null;

    if (!looksLikePromptExpansion(parsed)) {
      return fallbackPromptExpansion(input, "DeepSeek returned an incomplete JSON shape.");
    }

    const fallback = fallbackPromptExpansion(input);
    const record = parsed as Partial<PromptExpansionResult>;

    return {
      title: cleanText(record.title, fallback.title, 120),
      prompt: cleanText(record.prompt, fallback.prompt, 5000),
      negativePrompt: cleanText(
        record.negativePrompt,
        fallback.negativePrompt,
        1800,
      ),
      language: input.language,
      contentType: input.contentType,
      aspectRatio: input.aspectRatio,
      modelHints:
        Array.isArray(record.modelHints) && record.modelHints.length > 0
          ? uniqueStrings(record.modelHints, 6)
          : fallback.modelHints,
      breakdown: isRecord(record.breakdown)
        ? {
            subject: cleanText(record.breakdown.subject, fallback.breakdown.subject, 500),
            style: cleanText(record.breakdown.style, fallback.breakdown.style, 300),
            lighting: cleanText(record.breakdown.lighting, fallback.breakdown.lighting, 300),
            camera: cleanText(record.breakdown.camera, fallback.breakdown.camera, 300),
            palette: cleanText(record.breakdown.palette, fallback.breakdown.palette, 300),
            scene: cleanText(record.breakdown.scene, fallback.breakdown.scene, 300),
            mood: cleanText(record.breakdown.mood, fallback.breakdown.mood, 300),
            composition: cleanText(record.breakdown.composition, fallback.breakdown.composition, 300),
            quality: cleanText(record.breakdown.quality, fallback.breakdown.quality, 300),
          }
        : fallback.breakdown,
      preservedDetails:
        Array.isArray(record.preservedDetails) && record.preservedDetails.length > 0
          ? uniqueStrings(record.preservedDetails, 12)
          : fallback.preservedDetails,
      creativeAdditions:
        Array.isArray(record.creativeAdditions) && record.creativeAdditions.length > 0
          ? uniqueStrings(record.creativeAdditions, 12)
          : fallback.creativeAdditions,
      variants:
        Array.isArray(record.variants) && record.variants.length > 0
          ? uniqueStrings(record.variants, 4)
          : fallback.variants,
      provider: "deepseek",
      model: DEEPSEEK_MODEL,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "DeepSeek prompt expansion failed.";

    return fallbackPromptExpansion(input, message);
  } finally {
    timeout.clear();
  }
}

function fallbackImageAnalysis(
  language: PromptLanguage,
  note?: string,
  filename?: string,
): PromptImageAnalysisResult {
  const zh = language === "zh";
  const subject = filename
    ? zh
      ? `上传图片 ${filename} 的主体`
      : `the main subject in ${filename}`
    : zh
      ? "上传图片中的主体"
      : "the main subject in the uploaded image";
  const prompt = zh
    ? `${subject}，保持原图主体比例、主要材质、服装/产品形态和空间关系，真实摄影质感，主体清楚，背景有层次，光线方向明确，色调统一，细节可检查，构图稳定，适合重新生成为高质量参考图。`
    : `${subject}, preserve the original subject proportions, main materials, outfit/product shape, and spatial relationships, realistic photographic quality, clear subject separation, layered background, directional lighting, unified color palette, inspectable details, stable composition, suitable for regenerating a high-quality reference image.`;

  return {
    title: zh ? "图片反推 Prompt" : "Reverse Image Prompt",
    prompt,
    negativePrompt: zh
      ? "不要改变主体身份，不要多余文字，不要水印，不要低清模糊，不要畸形手，不要多余肢体，不要错误透视。"
      : "Do not change subject identity, no extra text, no watermark, no low resolution blur, no malformed hands, no extra limbs, no broken perspective.",
    language,
    modelHints: ["Grok Imagine", "Midjourney", "Flux"],
    breakdown: {
      subject,
      style: zh ? "真实摄影 / 高质量 AI 复刻" : "realistic photography / high-quality AI recreation",
      lighting: zh ? "根据原图光线方向复刻，保持主体可读" : "match the source lighting direction and keep the subject readable",
      camera: zh ? "按原图景别与透视关系复刻" : "match the source framing and perspective",
      palette: zh ? "保持原图主色和局部强调色" : "preserve the source main palette and accent colors",
      scene: zh ? "保持原图空间关系和背景层次" : "preserve source spatial relationships and background depth",
      mood: zh ? "贴近原图情绪，不额外戏剧化" : "match the source mood without extra dramatization",
      composition: zh ? "保持主体位置、留白和视觉重心" : "preserve subject position, negative space, and visual weight",
    },
    confidence: 0.22,
    provider: "local-fallback",
    model: "structured-local-image-fallback",
    generatedAt: new Date().toISOString(),
    note,
  };
}

function looksLikeImageAnalysis(value: unknown): value is Partial<PromptImageAnalysisResult> {
  return isRecord(value) && typeof value.prompt === "string";
}

export async function analyzePromptImage({
  imageDataUrl,
  mimeType,
  language = "zh",
  filename,
}: {
  imageDataUrl: string;
  mimeType: string;
  language?: PromptLanguage;
  filename?: string;
}): Promise<PromptImageAnalysisResult> {
  const normalizedLanguage = normalizeLanguage(language);
  const apiKey =
    process.env.PROMPT_VISION_API_KEY ||
    process.env.XAI_API_KEY ||
    process.env.GROK_API_KEY;

  if (!apiKey) {
    return fallbackImageAnalysis(
      normalizedLanguage,
      "Vision API key is not configured.",
      filename,
    );
  }

  if (!/^data:image\//.test(imageDataUrl) || !/^image\//.test(mimeType)) {
    return fallbackImageAnalysis(
      normalizedLanguage,
      "Unsupported image input.",
      filename,
    );
  }

  const timeout = createTimeoutSignal(VISION_TIMEOUT_MS);

  try {
    const response = await fetch(VISION_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        temperature: 0.32,
        max_tokens: 1500,
        response_format: { type: "json_object" },
        store: false,
        messages: [
          {
            role: "system",
            content: [
              "You are a visual prompt reverse-engineer for AI image generation.",
              "Analyze the uploaded image and return a prompt that preserves subject, style, lighting, camera, palette, scene, mood, and composition.",
              "Default to Chinese when language is zh. Use English only when language is en.",
              "Do not identify private people. Describe visible visual attributes instead.",
              "Return strict JSON only.",
              "Schema:",
              "{",
              '  "title": "...",',
              '  "prompt": "...",',
              '  "negativePrompt": "...",',
              '  "modelHints": ["..."],',
              '  "breakdown": {"subject": "...", "style": "...", "lighting": "...", "camera": "...", "palette": "...", "scene": "...", "mood": "...", "composition": "..."},',
              '  "confidence": 0.75',
              "}",
            ].join("\n"),
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  language: normalizedLanguage,
                  filename,
                  instruction:
                    "Reverse-engineer this image into a reusable generation prompt with negative constraints.",
                }),
              },
              {
                type: "image_url",
                image_url: { url: imageDataUrl },
              },
            ],
          },
        ],
      }),
      cache: "no-store",
      signal: timeout.signal,
    });
    const payload = await readJsonResponse(response);

    if (!response.ok) {
      return fallbackImageAnalysis(
        normalizedLanguage,
        getErrorMessage(payload, "Vision analysis failed."),
        filename,
      );
    }

    const content = (
      payload as {
        choices?: Array<{ message?: { content?: string } }>;
      }
    ).choices?.[0]?.message?.content;
    const parsed = typeof content === "string" ? parseJsonObject(content) : null;

    if (!looksLikeImageAnalysis(parsed)) {
      return fallbackImageAnalysis(
        normalizedLanguage,
        "Vision model returned an incomplete JSON shape.",
        filename,
      );
    }

    const fallback = fallbackImageAnalysis(normalizedLanguage, undefined, filename);
    const record = parsed as Partial<PromptImageAnalysisResult>;

    return {
      title: cleanText(record.title, fallback.title, 120),
      prompt: cleanText(record.prompt, fallback.prompt, 5000),
      negativePrompt: cleanText(
        record.negativePrompt,
        fallback.negativePrompt,
        1800,
      ),
      language: normalizedLanguage,
      modelHints:
        Array.isArray(record.modelHints) && record.modelHints.length > 0
          ? uniqueStrings(record.modelHints, 6)
          : fallback.modelHints,
      breakdown: isRecord(record.breakdown)
        ? {
            subject: cleanText(record.breakdown.subject, fallback.breakdown.subject, 500),
            style: cleanText(record.breakdown.style, fallback.breakdown.style, 300),
            lighting: cleanText(record.breakdown.lighting, fallback.breakdown.lighting, 300),
            camera: cleanText(record.breakdown.camera, fallback.breakdown.camera, 300),
            palette: cleanText(record.breakdown.palette, fallback.breakdown.palette, 300),
            scene: cleanText(record.breakdown.scene, fallback.breakdown.scene, 300),
            mood: cleanText(record.breakdown.mood, fallback.breakdown.mood, 300),
            composition: cleanText(record.breakdown.composition, fallback.breakdown.composition, 300),
          }
        : fallback.breakdown,
      confidence: Math.max(0, Math.min(1, Number(record.confidence || 0.72))),
      provider: "xai-vision",
      model: VISION_MODEL,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Vision analysis failed.";

    return fallbackImageAnalysis(normalizedLanguage, message, filename);
  } finally {
    timeout.clear();
  }
}

function getXBearerToken() {
  return (
    process.env.X_BEARER_TOKEN ||
    process.env.X_API_BEARER_TOKEN ||
    process.env.TWITTER_BEARER_TOKEN ||
    ""
  );
}

function getXMediaUrl(media: Record<string, unknown>) {
  const direct = cleanText(media.url, "", 900);
  const preview = cleanText(media.preview_image_url, "", 900);

  if (direct) return direct;
  if (preview) return preview;

  return undefined;
}

function getXVideoUrl(media: Record<string, unknown>) {
  const variants = Array.isArray(media.variants) ? media.variants : [];
  const mp4s = variants
    .filter(isRecord)
    .filter((variant) => cleanText(variant.content_type) === "video/mp4")
    .sort((left, right) => Number(right.bit_rate || 0) - Number(left.bit_rate || 0));

  return cleanText(mp4s[0]?.url, "", 900) || undefined;
}

export async function collectPromptItemsFromX({
  query = X_DEFAULT_QUERY,
  limit = 25,
}: {
  query?: string;
  limit?: number;
} = {}) {
  const bearerToken = getXBearerToken();

  if (!bearerToken) {
    return {
      items: [] as PromptFeedItem[],
      skipped: true,
      reason:
        "X_BEARER_TOKEN / X_API_BEARER_TOKEN / TWITTER_BEARER_TOKEN is not configured.",
      query,
    };
  }

  const params = new URLSearchParams({
    query,
    max_results: String(Math.min(100, Math.max(10, limit))),
    expansions: "author_id,attachments.media_keys",
    "tweet.fields":
      "attachments,author_id,created_at,public_metrics,text,entities,lang",
    "user.fields": "name,username,verified",
    "media.fields":
      "alt_text,duration_ms,height,media_key,preview_image_url,type,url,variants,width",
  });
  const timeout = createTimeoutSignal(X_SEARCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${X_RECENT_SEARCH_URL}?${params}`, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      cache: "no-store",
      signal: timeout.signal,
    });
    const payload = await readJsonResponse(response);

    if (!response.ok) {
      return {
        items: [] as PromptFeedItem[],
        skipped: true,
        reason: getErrorMessage(payload, "X recent search request failed."),
        query,
      };
    }

    const data = Array.isArray((payload as { data?: unknown }).data)
      ? ((payload as { data: Array<Record<string, unknown>> }).data ?? [])
      : [];
    const includes = isRecord((payload as { includes?: unknown }).includes)
      ? ((payload as { includes: Record<string, unknown> }).includes ?? {})
      : {};
    const users = Array.isArray(includes.users)
      ? (includes.users as Array<Record<string, unknown>>)
      : [];
    const media = Array.isArray(includes.media)
      ? (includes.media as Array<Record<string, unknown>>)
      : [];
    const usersById = new Map(users.map((user) => [cleanText(user.id), user]));
    const mediaByKey = new Map(media.map((item) => [cleanText(item.media_key), item]));
    const items = data.map((tweet) => {
      const id = cleanText(tweet.id);
      const text = cleanText(tweet.text, "", 3600);
      const author = usersById.get(cleanText(tweet.author_id));
      const username = cleanText(author?.username);
      const attachments = isRecord(tweet.attachments) ? tweet.attachments : {};
      const mediaKeys = Array.isArray(attachments.media_keys)
        ? attachments.media_keys.filter((key): key is string => typeof key === "string")
        : [];
      const firstMedia = mediaKeys
        .map((key) => mediaByKey.get(key))
        .find((item): item is Record<string, unknown> => Boolean(item));
      const mediaType = cleanText(firstMedia?.type);
      const publicMetrics = isRecord(tweet.public_metrics)
        ? tweet.public_metrics
        : {};
      const contentType: PromptContentType =
        mediaType === "video" || /video|veo|seedance|kling|runway/i.test(text)
          ? "video"
          : /prompt/i.test(text)
            ? "prompt"
            : "image";
      const prompt = stripUrls(text);

      return normalizePromptFeedItem({
        id: `x-${id}`,
        sourceType: "x",
        title: inferTitle(prompt),
        description:
          contentType === "video"
            ? "来自 X 官方 API 的视频 prompt / AI video 案例线索。"
            : "来自 X 官方 API 的图像 prompt / AI image 案例线索。",
        prompt,
        negativePrompt:
          "不要水印，不要 logo，不要低清模糊，不要随机文字，不要主体漂移；复刻时保留原作者思路并链接来源。",
        imageUrl: firstMedia ? getXMediaUrl(firstMedia) : undefined,
        videoUrl: firstMedia ? getXVideoUrl(firstMedia) : undefined,
        sourceUrl: username && id ? `https://x.com/${username}/status/${id}` : undefined,
        authorName: cleanText(author?.name, "", 120) || undefined,
        authorHandle: username ? `@${username}` : undefined,
        createdAt: cleanText(tweet.created_at, new Date().toISOString(), 80),
        tags: inferTags(text),
        modelHints: inferModelHints(text, contentType),
        contentType,
        aspectRatio: contentType === "video" ? "9:16" : "auto",
        metrics: {
          likes: Number(publicMetrics.like_count || 0),
          reposts: Number(publicMetrics.retweet_count || 0),
          replies: Number(publicMetrics.reply_count || 0),
          quotes: Number(publicMetrics.quote_count || 0),
          bookmarks: Number(publicMetrics.bookmark_count || 0),
          views: Number(publicMetrics.impression_count || 0),
          score: 0,
        },
        complianceNote: "Collected via X API v2 recent search; show attribution and link back to the original post.",
        rawText: text,
      });
    });

    return {
      items: dedupePromptItems(items).slice(0, limit),
      skipped: false,
      reason: undefined,
      query,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "X recent search request failed.";

    return {
      items: [] as PromptFeedItem[],
      skipped: true,
      reason: message,
      query,
    };
  } finally {
    timeout.clear();
  }
}

export function parseManualPromptImport(text: string) {
  const clean = cleanText(text, "", maxImportTextLength);

  if (!clean) return [];

  try {
    const parsed = JSON.parse(clean) as unknown;
    const records = Array.isArray(parsed) ? parsed : [parsed];

    return records
      .filter(isRecord)
      .map((record) => {
        const item = record as Partial<PromptFeedItem> & { text?: string };

        return normalizePromptFeedItem({
          ...item,
          sourceType:
            item.sourceType === "x" ||
            item.sourceType === "api" ||
            item.sourceType === "seed"
              ? item.sourceType
              : "manual",
          importedAt: new Date().toISOString(),
        });
      });
  } catch {
    const chunks = clean
      .split(/\n{2,}|(?=https?:\/\/(?:x\.com|twitter\.com)\/\S+)/i)
      .map((chunk) => chunk.trim())
      .filter(Boolean);

    return chunks.map((chunk, index) => {
      const sourceUrl =
        chunk.match(/https?:\/\/(?:x\.com|twitter\.com)\/\S+/i)?.[0] || "";
      const textWithoutUrl = stripUrls(chunk);
      const contentType = /video|运镜|镜头|veo|seedance|kling|runway/i.test(chunk)
        ? "video"
        : "image";

      return normalizePromptFeedItem({
        id: `manual-${Date.now()}-${index}-${makeSlug(sourceUrl || textWithoutUrl)}`,
        sourceType: "manual",
        sourceUrl,
        title: inferTitle(textWithoutUrl || sourceUrl),
        prompt: textWithoutUrl || sourceUrl,
        description: sourceUrl
          ? "手动导入的 X/Twitter prompt 线索。"
          : "手动导入的 prompt 线索。",
        tags: inferTags(chunk),
        modelHints: inferModelHints(chunk, contentType),
        contentType,
        rawText: chunk,
        importedAt: new Date().toISOString(),
      });
    });
  }
}
