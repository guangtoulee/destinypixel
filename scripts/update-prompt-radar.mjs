import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputPath = path.join(root, "data", "prompt-radar.json");
const communityReadmeUrl =
  "https://api.github.com/repos/YouMind-OpenLab/awesome-gpt-image-2/contents/README_zh.md?ref=main";
const anySearchUrl = "https://api.anysearch.com/mcp";
const blockedPublicPostIds = new Set(["2075056094477689161"]);

const localImageByPostId = {
  "2074982569096204487": "/prompt-radar/beach-lace.webp",
  "2074936593220018430": "/prompt-radar/photo-restore.webp",
  "2074924228714119502": "/prompt-radar/forest-goddess.webp",
  "2074880780116131907": "/prompt-radar/rose-selfie.webp",
  "2074877306414514442": "/prompt-radar/macau-hanfu.webp",
  "2074866627850776919": "/prompt-radar/cyber-kawaii.webp",
  "2074795635770048518": "/prompt-radar/dusk-portrait.webp",
  "2045861258520568230": "/prompt-radar/chengdu-map.webp",
};

function clean(value = "") {
  return String(value)
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripMarkdown(value = "") {
  return clean(value)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseChineseDate(value) {
  const match = value.match(/(20\d{2})年(\d{1,2})月(\d{1,2})日/);
  if (!match) return new Date().toISOString();
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T12:00:00.000Z`;
}

function scoreMetrics(metrics) {
  return Math.round(
    metrics.likes * 2 +
      metrics.reposts * 4 +
      metrics.quotes * 3 +
      metrics.bookmarks * 3 +
      metrics.replies +
      metrics.views / 500,
  );
}

function inferContentType(text) {
  if (/video|seedance|veo|kling|runway|运镜|视频|镜头序列/i.test(text)) {
    return "video";
  }
  if (/prompt|提示词/i.test(text)) return "prompt";
  return "image";
}

function inferCategory(text, contentType) {
  if (
    contentType === "video" ||
    /seedance|veo|kling|runway|视频|短片|分镜|运镜|镜头序列|video|motion/i.test(text)
  ) return "视频叙事";
  if (/产品|商品|电商|包装|广告|品牌|product|commercial|packaging|e-?commerce/i.test(text)) return "产品商业";
  if (/海报|字体|排版|信息图|地图|菜单|logo|标志|poster|typography|infographic|graphic design|editorial design/i.test(text)) return "平面设计";
  if (/插画|动漫|卡通|角色|手办|图标|三维|渲染|像素|illustration|anime|cartoon|character|3d|render|icon|pixel art/i.test(text)) return "插画三维";
  if (/工作流|教程|模型|更新|评测|节点|参数|工具|workflow|tutorial|model update|benchmark|comfyui|pipeline/i.test(text)) return "工具工作流";
  if (/人像|肖像|自拍|人物|女孩|男孩|女性|男性|美女|时装|服装|portrait|selfie|fashion|woman|girl|man|boy/i.test(text)) return "人像时尚";
  if (/建筑|室内|空间|家居|展厅|城市|街区|architecture|interior|building|urban|room/i.test(text)) return "建筑空间";
  if (/风景|旅行|山川|海岸|森林|自然|城市漫游|landscape|travel|nature|scenery|mountain|ocean/i.test(text)) return "风景旅行";
  return "视觉创意";
}

function inferTags(text) {
  const rules = [
    [/gpt image|gpt-image/i, "GPT Image 2"],
    [/grok|imagine/i, "Grok Imagine"],
    [/midjourney|\bmj\b/i, "Midjourney"],
    [/seedance/i, "Seedance"],
    [/veo/i, "Veo"],
    [/kling/i, "Kling"],
    [/runway/i, "Runway"],
    [/肖像|人像|portrait|selfie/i, "人像"],
    [/产品|product|电商/i, "产品"],
    [/视频|video|motion/i, "视频"],
    [/海报|poster|信息图|infographic|slides/i, "平面设计"],
    [/汉服|国风|中式|chinese style/i, "东方美学"],
    [/摄影|photo|cinematic/i, "摄影"],
  ];
  return Array.from(
    new Set(rules.flatMap(([pattern, tag]) => (pattern.test(text) ? [tag] : []))),
  ).slice(0, 6);
}

function modelHints(text, contentType) {
  const explicit = [
    /gpt image|gpt-image/i.test(text) ? "GPT Image 2" : "",
    /grok|imagine/i.test(text) ? "Grok Imagine" : "",
    /midjourney/i.test(text) ? "Midjourney" : "",
    /seedance/i.test(text) ? "Seedance" : "",
    /veo/i.test(text) ? "Veo" : "",
    /kling/i.test(text) ? "Kling" : "",
    /runway/i.test(text) ? "Runway" : "",
  ].filter(Boolean);
  const defaults = contentType === "video" ? ["Seedance", "Veo"] : ["GPT Image 2"];
  return Array.from(new Set([...explicit, ...defaults])).slice(0, 5);
}

function findSection(block, heading, nextHeading = "####") {
  const start = block.indexOf(heading);
  if (start < 0) return "";
  const rest = block.slice(start + heading.length).trimStart();
  const end = rest.indexOf(`\n${nextHeading}`);
  return clean(end >= 0 ? rest.slice(0, end) : rest);
}

function proxyImage(url) {
  if (!url) return undefined;
  if (!url.includes("cms-assets.youmind.com")) return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=1400&output=webp`;
}

function parseCommunityEntry(block) {
  const title = stripMarkdown(block.match(/^### No\.\s*\d+:\s*(.+)$/m)?.[1] || "");
  const sourceUrl = block.match(/\*\*来源:\*\*\s*\[[^\]]+\]\((https:\/\/x\.com\/[^)]+)\)/)?.[1];
  const postId = sourceUrl?.match(/status\/(\d+)/)?.[1];
  const prompt = clean(block.match(/#### 📝 提示词\s*\n+```[^\n]*\n([\s\S]*?)\n```/)?.[1] || "");
  const description = stripMarkdown(findSection(block, "#### 📖 描述"));
  const imageUrl = block.match(/<img\s+src="([^"]+)"/)?.[1];
  const authorMatch = block.match(/\*\*作者:\*\*\s*\[([^\]]+)\]\(https:\/\/x\.com\/([^)]+)\)/);
  const published = block.match(/\*\*发布时间:\*\*\s*([^\n]+)/)?.[1] || "";
  const language = /Language-ZH/i.test(block) ? "zh" : "zh";
  const tryUrl = block.match(/\[👉 立即尝试 →\]\((https:\/\/youmind\.com\/[^)]+)\)/)?.[1];

  if (!title || !prompt || !sourceUrl || !postId) return null;
  if (blockedPublicPostIds.has(postId)) return null;
  if (/(?:bikini|lingerie|onlyfans|比基尼|内衣|情趣)/i.test(`${title} ${prompt}`)) {
    return null;
  }

  const contentType = inferContentType(`${title} ${description} ${prompt}`);
  const tags = inferTags(`${title} ${description} ${prompt}`);
  const category = inferCategory(`${title} ${description} ${prompt} ${tags.join(" ")}`, contentType);

  return {
    id: `community-${postId}`,
    title,
    description: description && description !== "null" ? description.slice(0, 260) : "社区公开索引收录的完整视觉提示词。",
    prompt,
    negativePrompt: "遵循原提示词中的避免项；不要水印、乱码、低清、畸形手、错误透视或主体漂移。",
    imageUrl: localImageByPostId[postId] || proxyImage(imageUrl),
    sourceUrl,
    sourceType: "community",
    authorName: authorMatch?.[1],
    authorHandle: authorMatch?.[2] ? `@${authorMatch[2]}` : undefined,
    createdAt: parseChineseDate(published),
    importedAt: new Date().toISOString(),
    tags,
    modelHints: modelHints(`${title} ${prompt}`, contentType),
    style: tags.includes("摄影") ? "社区实测摄影提示词" : "社区实测视觉提示词",
    lighting: "按原提示词的光线描述执行",
    camera: "按原提示词的镜头与景别执行",
    palette: "按原提示词的配色关系执行",
    mood: "按原提示词的情绪目标执行",
    composition: "按原提示词的构图与画幅执行",
    aspectRatio: prompt.match(/(?:--ar|比例|画幅)[：:\s]*(\d+[:：]\d+)/i)?.[1]?.replace("：", ":") || "auto",
    language,
    contentType,
    category,
    metrics: { likes: 0, reposts: 0, replies: 0, quotes: 0, bookmarks: 0, views: 0, score: 0 },
    complianceNote: `CC BY 4.0 community index via YouMind; original X author and post linked.${tryUrl ? ` Detail: ${tryUrl}` : ""}`,
    rawText: prompt,
  };
}

function parseCommunityReadme(markdown) {
  const allStart = markdown.indexOf("## 📋 所有提示词");
  const featuredStart = markdown.indexOf("## 🔥 精选提示词");
  const featured =
    featuredStart >= 0 && allStart > featuredStart
      ? markdown.slice(featuredStart, allStart)
      : "";
  const latest = allStart >= 0 ? markdown.slice(allStart) : markdown;
  const splitEntries = (section) =>
    section
      .split(/\n(?=### No\.\s*\d+:)/)
      .map(parseCommunityEntry)
      .filter(Boolean);

  return [...splitEntries(latest).slice(0, 24), ...splitEntries(featured).slice(0, 3)];
}

async function fetchCommunityReadme() {
  const response = await fetch(communityReadmeUrl, {
    headers: {
      Accept: "application/vnd.github.raw+json",
      "User-Agent": "DestinyPixel-Prompt-Radar",
    },
  });
  if (!response.ok) throw new Error(`Community index returned ${response.status}`);
  return response.text();
}

async function anySearch(query, keyword, type = "x_media") {
  const response = await fetch(anySearchUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.ANYSEARCH_API_KEY
        ? { Authorization: `Bearer ${process.env.ANYSEARCH_API_KEY}` }
        : {}),
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "search",
        arguments: {
          query,
          domain: "social_media",
          sub_domain: "social_media.social_media",
          sub_domain_params: { type, keyword },
          max_results: 10,
        },
      },
    }),
  });
  if (!response.ok) throw new Error(`AnySearch returned ${response.status}`);
  const payload = await response.json();
  const text = payload?.result?.content?.find((item) => item.type === "text")?.text;
  if (!text) throw new Error("AnySearch returned no text results");
  return text;
}

function parseNumber(value) {
  return Number(String(value || "0").replace(/,/g, "")) || 0;
}

function parseAnySearchResult(block) {
  const headline = stripMarkdown(block.match(/^###\s*\d+\.\s*([\s\S]*?)(?=\n- \*\*URL\*\*:)/m)?.[1] || "");
  const sourceUrl = block.match(/- \*\*URL\*\*:\s*(https:\/\/x\.com\/[^\s]+)/)?.[1];
  const postId = sourceUrl?.match(/status\/(\d+)/)?.[1];
  const snippet = clean(block.split(/- \*\*URL\*\*:[^\n]*\n-\s*/)[1] || "");
  const [bodyPart, metaPart = ""] = snippet.split(/\s+---\s+Author:\s*/);
  const body = clean(bodyPart.replace(/https:\/\/t\.co\/\S+/g, ""));
  const authorMatch = metaPart.match(/^(.*?)\s+\(@([^\)]+)\)/);
  const posted = metaPart.match(/Posted:\s*(.*?)\s*\|\s*Lang:/)?.[1];
  const metrics = {
    likes: parseNumber(metaPart.match(/Likes:\s*([\d,]+)/)?.[1]),
    reposts: parseNumber(metaPart.match(/Retweets:\s*([\d,]+)/)?.[1]),
    replies: parseNumber(metaPart.match(/Replies:\s*([\d,]+)/)?.[1]),
    quotes: parseNumber(metaPart.match(/Quotes:\s*([\d,]+)/)?.[1]),
    bookmarks: parseNumber(metaPart.match(/Bookmarks:\s*([\d,]+)/)?.[1]),
    views: parseNumber(metaPart.match(/Views:\s*([\d,]+)/)?.[1]),
    score: 0,
  };

  if (!headline || !sourceUrl || !postId || body.length < 30 || !posted) return null;
  const publishedAt = new Date(posted);
  if (Number.isNaN(publishedAt.getTime())) return null;
  if (Date.now() - publishedAt.getTime() > 14 * 24 * 60 * 60 * 1000) return null;
  const visualSignalCount = [
    /\b(?:seedance|veo|kling|runway|grok imagine|midjourney|flux)\b/i,
    /\bAI\s+(?:image|video|visual|film)/i,
    /(?:image|video)\s+(?:generation|generator|editing|prompt)/i,
    /(?:prompt\s*[:：]|storyboard|cinematic|camera|shot|portrait|render|运镜|分镜|生图|视频)/i,
  ].filter((pattern) => pattern.test(`${headline} ${body}`)).length;
  if (visualSignalCount < 2) return null;
  if (/(onlyfans|porn|nsfw|nude|ai girlfriend|virtual girlfriend)/i.test(body)) return null;

  metrics.score = scoreMetrics(metrics);
  const contentType = inferContentType(`${headline} ${body}`);
  const title = headline.replace(/^@[^:]+:\s*/, "").split(/\n/)[0].slice(0, 96);
  const category = inferCategory(`${headline} ${body}`, contentType);

  return {
    id: `x-public-${postId}`,
    title,
    description: body.slice(0, 220),
    prompt: body,
    negativePrompt: "保留原作者方法与归属；复刻时避免水印、低清、畸变、主体漂移和无关文字。",
    sourceUrl,
    sourceType: "x",
    authorName: authorMatch?.[1],
    authorHandle: authorMatch?.[2] ? `@${authorMatch[2]}` : undefined,
    createdAt: publishedAt.toISOString(),
    importedAt: new Date().toISOString(),
    tags: inferTags(`${headline} ${body}`),
    modelHints: modelHints(`${headline} ${body}`, contentType),
    style: contentType === "video" ? "实时 AI 视频案例" : "实时 AI 视觉案例",
    lighting: "查看原帖媒体与作者说明",
    camera: contentType === "video" ? "按原帖镜头流程执行" : "查看原帖画面",
    palette: "查看原帖媒体",
    mood: "公开社区实时讨论",
    composition: "查看原帖媒体与工作流",
    aspectRatio: "auto",
    language: /Lang:\s*zh/i.test(metaPart) ? "zh" : "en",
    contentType,
    category,
    metrics,
    complianceNote: "Discovered through public social search; original X author and post linked.",
    rawText: body,
  };
}

function parseAnySearchMarkdown(markdown) {
  return markdown
    .split(/\n(?=###\s*\d+\.)/)
    .map(parseAnySearchResult)
    .filter(Boolean);
}

function publicArticleQualityScore(item) {
  const text = `${item.title || ""} ${item.description || ""} ${item.prompt || ""}`;
  if (
    (item.prompt || "").trim().length < 180 ||
    /(\b\d{2,}\s+AI tools|save you .*hours|\$[\d,]+\/?month|link in bio|subscribe|course|giveaway|only two prompts|million views)/i.test(text)
  ) return -100;

  const metrics = item.metrics || {};
  let score = 0;
  score += metrics.score >= 2000 ? 5 : metrics.score >= 800 ? 4 : metrics.score >= 400 ? 3 : metrics.score >= 150 ? 1 : 0;
  score += metrics.views >= 50000 ? 3 : metrics.views >= 15000 ? 2 : metrics.views >= 5000 ? 1 : 0;
  score += metrics.bookmarks >= 300 ? 3 : metrics.bookmarks >= 100 ? 2 : metrics.bookmarks >= 30 ? 1 : 0;
  if (/(prompt|workflow|tutorial|how to|case study|breakdown|comparison|compare|\bvs\.?\b|storyboard|camera|shot)/i.test(text)) score += 2;
  if (/(release|launch|update|new model|available|testflight|version|v\d+(?:\.\d+)?|2\.0|3\.1|4k)/i.test(text)) score += 2;
  if (/\b(?:seedance|veo|kling|runway|midjourney|gpt.?image|grok imagine|flux|comfyui)\b/i.test(text)) score += 1;
  if ((item.prompt || "").trim().length >= 500) score += 1;
  if (/(illegal|broke the internet|hard to believe|wild|insane|game.?changer|nobody expects)/i.test(text)) score -= 1;
  return score;
}

async function collectPublicX() {
  const queries = [
    ["AI image prompt Midjourney Flux Grok Imagine", "AI image prompt Midjourney Flux Grok Imagine", "x_media"],
    ["AI video prompt Seedance Veo Kling Runway", "AI video prompt Seedance Veo Kling Runway", "x_media"],
    ["AI visual prompt workflow case study", "AI visual prompt workflow case study", "x_latest"],
  ];
  const settled = await Promise.allSettled(
    queries.map(([query, keyword, type]) => anySearch(query, keyword, type)),
  );
  return settled.flatMap((result) =>
    result.status === "fulfilled"
      ? parseAnySearchMarkdown(result.value).filter((item) => publicArticleQualityScore(item) >= 10)
      : [],
  );
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.sourceUrl || item.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isAllowedArchiveItem(item) {
  const postId = item?.sourceUrl?.match(/status\/(\d+)/)?.[1];
  if (postId && blockedPublicPostIds.has(postId)) return false;
  const text = `${item?.title || ""} ${item?.description || ""} ${item?.prompt || ""}`;
  return !/(?:onlyfans|porn|nsfw|nude|bikini|lingerie|ai girlfriend|virtual girlfriend|比基尼|内衣|情趣)/i.test(text);
}

async function main() {
  const previous = await fs
    .readFile(outputPath, "utf8")
    .then(JSON.parse)
    .catch(() => ({ items: [] }));

  const [communityResult, xResult] = await Promise.allSettled([
    fetchCommunityReadme().then(parseCommunityReadme),
    collectPublicX(),
  ]);

  const previousItems = Array.isArray(previous.items) ? previous.items : [];
  const freshCommunityItems =
    communityResult.status === "fulfilled" ? communityResult.value : [];
  const freshXItems =
    xResult.status === "fulfilled" ? xResult.value : [];

  const items = dedupe([
    ...freshXItems,
    ...freshCommunityItems,
    ...previousItems,
  ].filter(isAllowedArchiveItem))
    .map((item) => ({
      ...item,
      category: inferCategory(
        `${item.title || ""} ${item.description || ""} ${item.prompt || ""} ${(item.tags || []).join(" ")}`,
        item.contentType || inferContentType(item.prompt || ""),
      ),
    }))
    .sort((left, right) => {
      const scoreDiff = (right.metrics?.score || 0) - (left.metrics?.score || 0);
      if (scoreDiff) return scoreDiff;
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });

  if (items.length === 0) throw new Error("No prompt radar items were collected");

  const payload = {
    version: 3,
    updatedAt: new Date().toISOString(),
    sourceSummary: {
      community: items.filter((item) => item.sourceType === "community").length,
      publicX: items.filter((item) => item.sourceType === "x").length,
      total: items.length,
    },
    items,
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(
    `Prompt radar updated: ${items.length} retained items (${freshXItems.length} fresh public X, ${freshCommunityItems.length} fresh community).`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
