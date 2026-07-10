"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Clock3,
  Copy,
  Database,
  ExternalLink,
  FileUp,
  Globe2,
  Image as ImageIcon,
  Languages,
  Loader2,
  LockKeyhole,
  LogOut,
  Pin,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Video,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import styles from "./prompt-experience.module.css";

type PromptLanguage = "zh" | "en";
type PromptContentType = "image" | "video" | "prompt" | "case";
type PromptSourceType = "x" | "community" | "manual" | "seed" | "api";
type PromptCategory =
  | "人像时尚"
  | "产品商业"
  | "视频叙事"
  | "平面设计"
  | "插画三维"
  | "建筑空间"
  | "风景旅行"
  | "工具工作流"
  | "视觉创意";
type ActiveTool = "expand" | "image";

type PromptMetrics = {
  likes: number;
  reposts: number;
  replies: number;
  quotes: number;
  bookmarks: number;
  views: number;
  score: number;
};

type PromptFeedItem = {
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
  category: PromptCategory;
  metrics: PromptMetrics;
  isPinned?: boolean;
  complianceNote?: string;
};

type PromptExpansionResult = {
  title: string;
  prompt: string;
  negativePrompt: string;
  language: PromptLanguage;
  contentType: "image" | "video";
  aspectRatio: string;
  modelHints: string[];
  breakdown: Record<string, string>;
  preservedDetails: string[];
  creativeAdditions: string[];
  variants: string[];
  provider: "deepseek" | "local-fallback";
  model: string;
  generatedAt: string;
  note?: string;
};

type PromptImageAnalysisResult = {
  title: string;
  prompt: string;
  negativePrompt: string;
  language: PromptLanguage;
  modelHints: string[];
  breakdown: Record<string, string>;
  confidence: number;
  provider: "xai-vision" | "local-fallback";
  model: string;
  generatedAt: string;
  note?: string;
};

type FeedResponse = {
  items?: PromptFeedItem[];
  updatedAt?: string;
  persistent?: boolean;
  sourceSummary?: {
    community: number;
    publicX: number;
    total: number;
  };
  sourcePlan?: {
    primary: string;
    fallback: string;
    compliance: string;
  };
  refresh?: {
    skipped: boolean;
    reason?: string;
    query: string;
    collected: number;
  };
  error?: string;
};

type ImportResponse = {
  saved?: number;
  items?: PromptFeedItem[];
  persistent?: boolean;
  error?: string;
};

type Status = "idle" | "loading" | "ready" | "error";
type FeedFilter = "all" | PromptContentType;
type CategoryFilter = "all" | PromptCategory;
type AdminStatus = "guest" | "checking" | "authenticated";

const categoryOrder: PromptCategory[] = [
  "人像时尚",
  "产品商业",
  "视频叙事",
  "平面设计",
  "插画三维",
  "建筑空间",
  "风景旅行",
  "工具工作流",
  "视觉创意",
];

const styleOptions = [
  "电影级商业摄影",
  "自然纪实摄影",
  "杂志时装大片",
  "真人写实短剧",
  "高端产品摄影",
  "中文平面设计",
  "实验性视觉艺术",
  "3D 物件 / App 图标",
];

const aspectOptions = ["9:16", "3:4", "1:1", "16:9", "4:3", "auto"];

const starterIdeas = [
  "凌晨便利店里，穿银色雨衣的人正在挑一颗桃子",
  "透明行李箱漂浮在盐湖上，旅行品牌夏季海报",
  "雨夜女律师收到已故母亲的语音，短剧首帧",
];

const breakdownLabels: Record<string, string> = {
  subject: "对象",
  style: "风格",
  lighting: "光线",
  camera: "镜头",
  palette: "色调",
  scene: "场景",
  mood: "氛围",
  composition: "构图",
  quality: "质量",
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "刚刚";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatNumber(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value || 0);
}

function sourceLabel(value: PromptSourceType) {
  if (value === "x") return "X / LIVE";
  if (value === "community") return "COMMUNITY INDEX";
  if (value === "manual") return "MANUAL";
  if (value === "api") return "PUBLIC API";
  return "ARCHIVE";
}

function contentLabel(value: PromptContentType) {
  if (value === "video") return "视频";
  if (value === "prompt") return "提示词";
  if (value === "case") return "案例";
  return "图片";
}

function mediaSrc(item: PromptFeedItem) {
  return item.imageUrl || item.videoUrl || "";
}

function formatBreakdown(breakdown: Record<string, string>) {
  return Object.entries(breakdown)
    .filter(([, value]) => Boolean(value?.trim()))
    .map(([key, value]) => `${breakdownLabels[key] || key}：${value}`)
    .join("\n");
}

function buildExpansionCopy(result: PromptExpansionResult) {
  return [
    result.prompt,
    "",
    result.preservedDetails?.length ? `【保留原设】\n${result.preservedDetails.join("、")}` : "",
    result.creativeAdditions?.length ? `【创作补全】\n${result.creativeAdditions.join("、")}` : "",
    "",
    "【细节拆解】",
    formatBreakdown(result.breakdown),
    "",
    "【负向约束】",
    result.negativePrompt,
    "",
    `【画幅】${result.aspectRatio}`,
    result.modelHints.length ? `【适合模型】${result.modelHints.join(" / ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildImageAnalysisCopy(result: PromptImageAnalysisResult) {
  return [
    result.prompt,
    "",
    "【细节拆解】",
    formatBreakdown(result.breakdown),
    "",
    "【负向约束】",
    result.negativePrompt,
    "",
    result.modelHints.length ? `【适合模型】${result.modelHints.join(" / ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildFeedCopy(item: PromptFeedItem) {
  return [
    item.prompt,
    `【分类】${item.category}`,
    "",
    "【细节拆解】",
    `风格：${item.style}`,
    `光线：${item.lighting}`,
    `镜头：${item.camera}`,
    `色调：${item.palette}`,
    `氛围：${item.mood}`,
    `构图：${item.composition}`,
    "",
    "【负向约束】",
    item.negativePrompt,
    "",
    `【画幅】${item.aspectRatio}`,
    item.modelHints.length ? `【适合模型】${item.modelHints.join(" / ")}` : "",
    item.sourceUrl ? `【来源】${item.sourceUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export default function PromptExperience() {
  const [items, setItems] = useState<PromptFeedItem[]>([]);
  const [feedStatus, setFeedStatus] = useState<Status>("loading");
  const [feedError, setFeedError] = useState("");
  const [feedNotice, setFeedNotice] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [sourcePlan, setSourcePlan] = useState<FeedResponse["sourcePlan"]>();
  const [sourceSummary, setSourceSummary] = useState<FeedResponse["sourceSummary"]>();
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("all");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTool, setActiveTool] = useState<ActiveTool>("expand");

  const [language, setLanguage] = useState<PromptLanguage>("zh");
  const [contentType, setContentType] = useState<"image" | "video">("image");
  const [idea, setIdea] = useState("");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [stylePreference, setStylePreference] = useState(styleOptions[0]);
  const [avoid, setAvoid] = useState("水印、乱码文字、低清模糊、畸形手、主体漂移");
  const [expandStatus, setExpandStatus] = useState<Status>("idle");
  const [expandError, setExpandError] = useState("");
  const [expanded, setExpanded] = useState<PromptExpansionResult | null>(null);

  const [imageStatus, setImageStatus] = useState<Status>("idle");
  const [imageError, setImageError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageResult, setImageResult] = useState<PromptImageAnalysisResult | null>(null);

  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState<Status>("idle");
  const [importError, setImportError] = useState("");
  const [copied, setCopied] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminStatus, setAdminStatus] = useState<AdminStatus>("guest");
  const [adminUsername, setAdminUsername] = useState("lee");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [moderatingId, setModeratingId] = useState("");

  const availableCategories = useMemo(
    () => categoryOrder.filter((category) => items.some((item) => item.category === category)),
    [items],
  );

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const typeMatch = activeFilter === "all" || item.contentType === activeFilter;
      const categoryMatch = activeCategory === "all" || item.category === activeCategory;
      const queryMatch = query
        ? [
            item.title,
            item.description,
            item.prompt,
            item.tags.join(" "),
            item.modelHints.join(" "),
            item.authorName || "",
            item.authorHandle || "",
            item.category,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;
      return typeMatch && categoryMatch && queryMatch;
    });
  }, [activeCategory, activeFilter, items, searchTerm]);

  const signalItems = useMemo(
    () => filteredItems.filter((item) => item.sourceType === "x").slice(0, 10),
    [filteredItems],
  );
  const visualItems = useMemo(
    () => {
      const editorialOrder = [
        "forest-goddess",
        "chengdu-map",
        "cyber-kawaii",
        "macau-hanfu",
        "dusk-portrait",
        "photo-restore",
        "rose-selfie",
        "beach-lace",
      ];
      return filteredItems
        .filter((item) => Boolean(mediaSrc(item)))
        .sort((left, right) => {
          if (left.isPinned !== right.isPinned) return left.isPinned ? -1 : 1;
          const leftRank = editorialOrder.findIndex((token) => left.imageUrl?.includes(token));
          const rightRank = editorialOrder.findIndex((token) => right.imageUrl?.includes(token));
          const normalizedLeft = leftRank === -1 ? editorialOrder.length : leftRank;
          const normalizedRight = rightRank === -1 ? editorialOrder.length : rightRank;
          if (normalizedLeft !== normalizedRight) return normalizedLeft - normalizedRight;
          return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
        })
        .slice(0, 30);
    },
    [filteredItems],
  );
  const textArchive = useMemo(
    () =>
      filteredItems
        .filter((item) => item.sourceType !== "x" && !mediaSrc(item))
        .slice(0, 8),
    [filteredItems],
  );

  async function loadFeed(refresh = false) {
    setFeedStatus("loading");
    setFeedError("");
    setFeedNotice("");
    try {
      const params = new URLSearchParams({ limit: "48" });
      if (refresh) params.set("refresh", "1");
      const response = await fetch(`/api/prompt/feed?${params}`, { cache: "no-store" });
      const data = (await response.json()) as FeedResponse;
      if (!response.ok) throw new Error(data.error || "读取信号失败。");
      setItems(data.items || []);
      setUpdatedAt(data.updatedAt || "");
      setSourcePlan(data.sourcePlan);
      setSourceSummary(data.sourceSummary);
      if (data.refresh) {
        setFeedNotice(
          data.refresh.skipped
            ? "付费 X API 未启用，当前展示公开搜索快照。"
            : `新增 ${data.refresh.collected} 条 X API 线索。`,
        );
      }
      setFeedStatus("ready");
    } catch (error) {
      setFeedStatus("error");
      setFeedError(error instanceof Error ? error.message : "读取信号失败。");
    }
  }

  useEffect(() => {
    void loadFeed(false);
  }, []);

  async function copyText(value: string, key: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1400);
    } catch {
      setExpandError("复制失败，可以手动选中文本。");
    }
  }

  async function submitExpand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanIdea = idea.trim();
    if (!cleanIdea) {
      setExpandError("先写一个画面想法。");
      return;
    }
    setExpandStatus("loading");
    setExpandError("");
    try {
      const response = await fetch("/api/prompt/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: cleanIdea,
          language,
          contentType,
          aspectRatio,
          stylePreference,
          avoid,
        }),
      });
      const data = (await response.json()) as PromptExpansionResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "扩写失败。");
      setExpanded(data);
      setExpandStatus("ready");
      if (data.provider === "local-fallback") {
        setExpandError("智能服务暂时不可用，当前仅保留原始设定，请稍后重试。");
      }
    } catch (error) {
      setExpandStatus("error");
      setExpandError(error instanceof Error ? error.message : "扩写失败。");
    }
  }

  async function analyzeImage(file: File) {
    setImageStatus("loading");
    setImageError("");
    setImageResult(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
    try {
      const formData = new FormData();
      formData.set("image", file);
      formData.set("language", language);
      const response = await fetch("/api/prompt/analyze-image", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as PromptImageAnalysisResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "图片分析失败。");
      setImageResult(data);
      setImageStatus("ready");
    } catch (error) {
      setImageStatus("error");
      setImageError(error instanceof Error ? error.message : "图片分析失败。");
    }
  }

  async function submitImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (importText.trim().length < 3) {
      setImportError("粘贴一条链接、文本或 JSON。");
      return;
    }
    setImportStatus("loading");
    setImportError("");
    try {
      const response = await fetch("/api/prompt/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: importText }),
      });
      const data = (await response.json()) as ImportResponse;
      if (!response.ok) throw new Error(data.error || "导入失败。");
      setImportText("");
      setFeedNotice(`已导入 ${data.saved || data.items?.length || 0} 条线索。`);
      setImportStatus("ready");
      await loadFeed(false);
    } catch (error) {
      setImportStatus("error");
      setImportError(error instanceof Error ? error.message : "导入失败。");
    }
  }

  async function openAdmin() {
    setAdminOpen(true);
    setAdminError("");
    if (adminStatus === "authenticated") return;
    setAdminStatus("checking");
    try {
      const response = await fetch("/api/prompt/admin/session", { cache: "no-store" });
      const data = (await response.json()) as { authenticated?: boolean; username?: string };
      setAdminStatus(data.authenticated ? "authenticated" : "guest");
      if (data.username) setAdminUsername(data.username);
    } catch {
      setAdminStatus("guest");
    }
  }

  async function submitAdminLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdminStatus("checking");
    setAdminError("");
    try {
      const response = await fetch("/api/prompt/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUsername, password: adminPassword }),
      });
      const data = (await response.json()) as { authenticated?: boolean; error?: string };
      if (!response.ok || !data.authenticated) {
        throw new Error(data.error || "登录失败。");
      }
      setAdminStatus("authenticated");
      setAdminPassword("");
      setAdminOpen(false);
      setFeedNotice("管理员模式已开启，可以置顶或删除案例。");
    } catch (error) {
      setAdminStatus("guest");
      setAdminError(error instanceof Error ? error.message : "登录失败。");
    }
  }

  async function logoutAdmin() {
    await fetch("/api/prompt/admin/logout", { method: "POST" }).catch(() => null);
    setAdminStatus("guest");
    setAdminOpen(false);
    setFeedNotice("管理员模式已退出。");
  }

  async function moderateItem(item: PromptFeedItem, action: "pin" | "unpin" | "delete") {
    if (action === "delete" && !window.confirm(`确定从雷达中删除“${item.title}”？`)) {
      return;
    }
    setModeratingId(item.id);
    setFeedError("");
    try {
      const response = await fetch("/api/prompt/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, action }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "管理操作失败。");
      await loadFeed(false);
      setFeedNotice(
        action === "delete"
          ? "案例已删除，后续定时抓取不会把它重新放回来。"
          : action === "pin"
            ? "案例已置顶。"
            : "已取消置顶。",
      );
    } catch (error) {
      if (responseNeedsLogin(error)) setAdminStatus("guest");
      setFeedError(error instanceof Error ? error.message : "管理操作失败。");
    } finally {
      setModeratingId("");
    }
  }

  function responseNeedsLogin(error: unknown) {
    return error instanceof Error && error.message.includes("登录");
  }

  function adminControls(item: PromptFeedItem) {
    if (adminStatus !== "authenticated") return null;
    const busy = moderatingId === item.id;
    return (
      <div className={styles.adminControls}>
        <button
          disabled={busy}
          onClick={() => void moderateItem(item, item.isPinned ? "unpin" : "pin")}
          title={item.isPinned ? "取消置顶" : "置顶"}
          type="button"
        >
          {busy ? <Loader2 aria-hidden="true" className={styles.spin} /> : <Pin aria-hidden="true" />}
        </button>
        <button
          disabled={busy}
          onClick={() => void moderateItem(item, "delete")}
          title="删除"
          type="button"
        >
          <Trash2 aria-hidden="true" />
        </button>
      </div>
    );
  }

  const activeResult = activeTool === "expand" ? expanded : imageResult;

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <a className={styles.brand} href="/">
          <ArrowLeft aria-hidden="true" size={16} />
          <span>DESTINYPIXEL</span>
        </a>
        <nav aria-label="Prompt 页面导航" className={styles.pageNav}>
          <a href="#studio">创作台</a>
          <a href="#signals">实时信号</a>
          <a href="#cases">案例墙</a>
        </nav>
        <div className={styles.topbarStatus}>
          <div className={styles.liveStamp}>
            <i aria-hidden="true" />
            <span>{feedStatus === "loading" ? "SYNCING" : "RADAR LIVE"}</span>
            <time>{updatedAt ? formatDate(updatedAt) : "--:--"}</time>
          </div>
          <button
            aria-label="打开管理员入口"
            className={styles.adminTrigger}
            data-active={adminStatus === "authenticated"}
            onClick={() => void openAdmin()}
            title="管理"
            type="button"
          >
            <ShieldCheck aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className={styles.signalTicker} aria-label="实时信号滚动条">
        <span className={styles.tickerLabel}>
          <Radio aria-hidden="true" /> LIVE WIRE
        </span>
        <div className={styles.tickerTrack}>
          {(items.filter((item) => item.sourceType === "x").slice(0, 5) || []).map(
            (item) => (
              <a href={item.sourceUrl} key={item.id} rel="noreferrer" target="_blank">
                <b>{item.authorHandle || "@X"}</b>
                <span>{item.title}</span>
              </a>
            ),
          )}
        </div>
      </div>

      <section className={styles.studio} id="studio">
        <div className={styles.studioHeading}>
          <div>
            <p>PROMPT ATELIER / 中文导演台</p>
            <h1>一句话，长成一整个画面。</h1>
          </div>
          <div className={styles.indexMark} aria-hidden="true">
            01
          </div>
        </div>

        <div className={styles.workbench}>
          <div className={styles.composerPane}>
            <div className={styles.toolSwitch}>
              <button
                aria-pressed={activeTool === "expand"}
                onClick={() => setActiveTool("expand")}
                type="button"
              >
                <WandSparkles aria-hidden="true" /> 智能扩写
              </button>
              <button
                aria-pressed={activeTool === "image"}
                onClick={() => setActiveTool("image")}
                type="button"
              >
                <ImageIcon aria-hidden="true" /> 图片反推
              </button>
              <button
                className={styles.languageButton}
                onClick={() => setLanguage((value) => (value === "zh" ? "en" : "zh"))}
                title="切换输出语言"
                type="button"
              >
                <Languages aria-hidden="true" /> {language === "zh" ? "中文" : "EN"}
              </button>
            </div>

            {activeTool === "expand" ? (
              <form className={styles.composerForm} onSubmit={submitExpand}>
                <label className={styles.ideaField}>
                  <span>你的画面</span>
                  <textarea
                    autoFocus
                    onChange={(event) => setIdea(event.target.value)}
                    placeholder="写几个词也可以，比如：午夜泳池、红色雨伞、一个刚说完谎的人……"
                    value={idea}
                  />
                  <small>{idea.length.toString().padStart(3, "0")} / 1200</small>
                </label>

                <div className={styles.seedRow}>
                  {starterIdeas.map((starter, index) => (
                    <button key={starter} onClick={() => setIdea(starter)} type="button">
                      <span>0{index + 1}</span>
                      {starter}
                    </button>
                  ))}
                </div>

                <div className={styles.controlRail}>
                  <div className={styles.modeToggle}>
                    <button
                      aria-pressed={contentType === "image"}
                      onClick={() => setContentType("image")}
                      type="button"
                    >
                      <ImageIcon aria-hidden="true" /> 图片
                    </button>
                    <button
                      aria-pressed={contentType === "video"}
                      onClick={() => setContentType("video")}
                      type="button"
                    >
                      <Video aria-hidden="true" /> 视频
                    </button>
                  </div>
                  <label>
                    <span>审美方向</span>
                    <select
                      onChange={(event) => setStylePreference(event.target.value)}
                      value={stylePreference}
                    >
                      {styleOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>画幅</span>
                    <select
                      onChange={(event) => setAspectRatio(event.target.value)}
                      value={aspectRatio}
                    >
                      {aspectOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className={styles.avoidField}>
                  <span>排除</span>
                  <input onChange={(event) => setAvoid(event.target.value)} value={avoid} />
                </label>

                <div className={styles.generateRow}>
                  <button disabled={expandStatus === "loading"} type="submit">
                    {expandStatus === "loading" ? (
                      <Loader2 aria-hidden="true" className={styles.spin} />
                    ) : (
                      <Zap aria-hidden="true" />
                    )}
                    {expandStatus === "loading" ? "正在构思" : "生成完整 Prompt"}
                    <ArrowUpRight aria-hidden="true" />
                  </button>
                  {expandError ? <p data-tone="error">{expandError}</p> : null}
                </div>
              </form>
            ) : (
              <div className={styles.imageTool}>
                <label className={styles.uploadStage}>
                  <input
                    accept="image/*"
                    disabled={imageStatus === "loading"}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void analyzeImage(file);
                      event.target.value = "";
                    }}
                    type="file"
                  />
                  {imagePreview ? (
                    <img alt="上传图片预览" src={imagePreview} />
                  ) : (
                    <div>
                      <Upload aria-hidden="true" />
                      <strong>DROP IMAGE</strong>
                      <span>JPG / PNG / WEBP</span>
                    </div>
                  )}
                </label>
                {imageStatus === "loading" ? (
                  <p className={styles.toolMessage}>
                    <Loader2 aria-hidden="true" className={styles.spin} /> 正在读取画面结构
                  </p>
                ) : null}
                {imageError ? <p className={styles.toolMessage}>{imageError}</p> : null}
              </div>
            )}
          </div>

          <div className={styles.outputPane}>
            <div className={styles.outputHeader}>
              <span>OUTPUT / DIRECTOR&apos;S CUT</span>
              {activeResult ? (
                <button
                  onClick={() =>
                    void copyText(
                      activeTool === "expand" && expanded
                        ? buildExpansionCopy(expanded)
                        : imageResult
                          ? buildImageAnalysisCopy(imageResult)
                          : "",
                      "active-result",
                    )
                  }
                  title="复制完整 Prompt 包"
                  type="button"
                >
                  {copied === "active-result" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                  {copied === "active-result" ? "已复制" : "复制整包"}
                </button>
              ) : null}
            </div>

            {activeTool === "expand" && expanded ? (
              <article className={styles.expansionResult}>
                <div className={styles.resultIdentity}>
                  <span data-live={expanded.provider === "deepseek"}>
                    {expanded.provider === "deepseek" ? "AI DIRECTED" : "BASIC FALLBACK"}
                  </span>
                  <small>{expanded.model}</small>
                </div>
                <h2>{expanded.title}</h2>
                <p className={styles.mainPrompt}>{expanded.prompt}</p>

                <div className={styles.auditColumns}>
                  <div>
                    <strong>LOCKED / 保留原设</strong>
                    <ul>
                      {(expanded.preservedDetails || []).map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>ADDED / 创作补全</strong>
                    <ul>
                      {(expanded.creativeAdditions || []).map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <dl className={styles.breakdownList}>
                  {Object.entries(expanded.breakdown).map(([key, value]) => (
                    <div key={key}>
                      <dt>{breakdownLabels[key] || key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className={styles.negativeLine}>
                  <strong>NEGATIVE</strong>
                  <span>{expanded.negativePrompt}</span>
                </div>
              </article>
            ) : activeTool === "image" && imageResult ? (
              <article className={styles.expansionResult}>
                <div className={styles.resultIdentity}>
                  <span data-live={imageResult.provider === "xai-vision"}>
                    VISION / {Math.round(imageResult.confidence * 100)}%
                  </span>
                  <small>{imageResult.model}</small>
                </div>
                <h2>{imageResult.title}</h2>
                <p className={styles.mainPrompt}>{imageResult.prompt}</p>
                <dl className={styles.breakdownList}>
                  {Object.entries(imageResult.breakdown).map(([key, value]) => (
                    <div key={key}>
                      <dt>{breakdownLabels[key] || key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className={styles.negativeLine}>
                  <strong>NEGATIVE</strong>
                  <span>{imageResult.negativePrompt}</span>
                </div>
              </article>
            ) : (
              <div className={styles.outputIdle}>
                <span>READY / 00</span>
                <div aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
                <p>{activeTool === "expand" ? "等待一句值得展开的话" : "等待一张值得拆解的图"}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={styles.radarSection} id="signals">
        <div className={styles.sectionHeading}>
          <div>
            <p>PUBLIC SIGNALS / 近 14 天</p>
            <h2>正在被讨论的画面方法</h2>
          </div>
          <div className={styles.radarStats}>
            <span><b>{sourceSummary?.publicX ?? signalItems.length}</b> X 信号</span>
            <span><b>{sourceSummary?.community ?? visualItems.length}</b> 图像案例</span>
            <span><b>{sourceSummary?.total ?? items.length}</b> 当前收录</span>
          </div>
        </div>

        <div className={styles.radarToolbar}>
          <div className={styles.filterBar} aria-label="案例类型筛选">
            {(["all", "image", "video", "prompt", "case"] as FeedFilter[]).map((filter) => (
              <button
                aria-pressed={activeFilter === filter}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter === "all" ? "全部" : contentLabel(filter)}
              </button>
            ))}
          </div>
          <label className={styles.searchBox}>
            <Search aria-hidden="true" />
            <input
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="搜索作者、模型、风格"
              value={searchTerm}
            />
          </label>
          <button
            className={styles.refreshButton}
            disabled={feedStatus === "loading"}
            onClick={() => void loadFeed(false)}
            title="刷新当前快照"
            type="button"
          >
            <RefreshCw aria-hidden="true" className={feedStatus === "loading" ? styles.spin : ""} />
          </button>
        </div>

        <div className={styles.categoryRail} aria-label="内容分类筛选">
          <span>INDEX BY SUBJECT</span>
          <button
            aria-pressed={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            type="button"
          >
            全分类 <b>{items.length}</b>
          </button>
          {availableCategories.map((category) => (
            <button
              aria-pressed={activeCategory === category}
              key={category}
              onClick={() => setActiveCategory(category)}
              type="button"
            >
              {category} <b>{items.filter((item) => item.category === category).length}</b>
            </button>
          ))}
        </div>

        {feedNotice || feedError ? (
          <p className={styles.feedNotice} data-tone={feedError ? "error" : "neutral"}>
            {feedError || feedNotice}
          </p>
        ) : null}

        {signalItems.length ? (
          <div className={styles.signalDeck}>
            {signalItems.map((item, index) => (
              <article className={styles.signalCard} data-tone={index % 4} key={item.id}>
                <div className={styles.signalMeta}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.categoryTag}>{item.category}</span>
                  <time>{formatDate(item.createdAt)}</time>
                </div>
                <div className={styles.signalAuthor}>
                  <i aria-hidden="true" />
                  <span>{item.authorHandle || item.authorName || "X CREATOR"}</span>
                  {item.isPinned ? <b><Pin aria-hidden="true" /> 置顶</b> : null}
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className={styles.signalTags}>
                  {item.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <div className={styles.signalFooter}>
                  <span><Zap aria-hidden="true" /> {formatNumber(item.metrics.score)}</span>
                  <span>{formatNumber(item.metrics.views)} views</span>
                  {item.sourceUrl ? (
                    <a href={item.sourceUrl} rel="noreferrer" target="_blank" title="打开 X 原帖">
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                  ) : null}
                  {adminControls(item)}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className={styles.caseSection} id="cases">
        <div className={styles.caseMasthead}>
          <div>
            <p>VISUAL INDEX / 带原图与原帖</p>
            <h2>不是灵感图，是可以拆开的案例。</h2>
          </div>
          <span>UPDATED {updatedAt ? formatDate(updatedAt) : "--"}</span>
        </div>

        {feedStatus === "loading" && items.length === 0 ? (
          <div className={styles.loadingState}>
            <Loader2 aria-hidden="true" className={styles.spin} />
            <span>正在同步真实案例</span>
          </div>
        ) : (
          <div className={styles.visualGrid}>
            {visualItems.map((item, index) => (
              <article className={styles.visualCard} data-shape={index % 7} key={item.id}>
                <div className={styles.visualMedia}>
                  {item.videoUrl && !item.imageUrl ? (
                    <video controls loop muted playsInline src={item.videoUrl} />
                  ) : (
                    <img alt={item.title} loading="lazy" src={mediaSrc(item)} />
                  )}
                </div>
                <div className={styles.visualTopline}>
                  <span>{item.isPinned ? "PINNED / " : ""}{item.category}</span>
                  <span>{contentLabel(item.contentType)} / {item.aspectRatio}</span>
                </div>
                <div className={styles.visualCaption}>
                  <p>{sourceLabel(item.sourceType)} · {item.authorHandle || item.authorName || "COMMUNITY"}</p>
                  <h3>{item.title}</h3>
                  <div className={styles.visualPrompt}>{item.prompt}</div>
                  <div className={styles.visualActions}>
                    <button
                      onClick={() => void copyText(buildFeedCopy(item), item.id)}
                      title="复制完整 Prompt 包"
                      type="button"
                    >
                      {copied === item.id ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                      {copied === item.id ? "已复制" : "复制整包"}
                    </button>
                    {item.sourceUrl ? (
                      <a href={item.sourceUrl} rel="noreferrer" target="_blank">
                        原帖 <ExternalLink aria-hidden="true" />
                      </a>
                    ) : null}
                    {adminControls(item)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {textArchive.length ? (
          <div className={styles.textArchive}>
            {textArchive.map((item) => (
              <article key={item.id}>
                <span>{item.category} / {sourceLabel(item.sourceType)}</span>
                <h3>{item.title}</h3>
                <p>{item.prompt}</p>
                <button onClick={() => void copyText(buildFeedCopy(item), item.id)} type="button">
                  <Copy aria-hidden="true" /> 复制整包
                </button>
                {adminControls(item)}
              </article>
            ))}
          </div>
        ) : null}

        {filteredItems.length === 0 && feedStatus !== "loading" ? (
          <div className={styles.emptyState}>
            <Languages aria-hidden="true" />
            <span>没有匹配的案例</span>
          </div>
        ) : null}
      </section>

      <footer className={styles.dataFooter}>
        <details>
          <summary>
            <Database aria-hidden="true" /> 数据源与手动导入
          </summary>
          <div className={styles.dataDrawer}>
            <div className={styles.sourceLedger}>
              <Globe2 aria-hidden="true" />
              <div>
                <strong>PUBLIC SOURCE LEDGER</strong>
                <p>{sourcePlan?.primary}</p>
                <p>{sourcePlan?.fallback}</p>
                <p>{sourcePlan?.compliance}</p>
              </div>
            </div>
            <form className={styles.importForm} onSubmit={submitImport}>
              <label>
                <span>链接 / 文本 / JSON</span>
                <textarea
                  onChange={(event) => setImportText(event.target.value)}
                  placeholder="https://x.com/..."
                  value={importText}
                />
              </label>
              <button disabled={importStatus === "loading"} type="submit">
                {importStatus === "loading" ? (
                  <Loader2 aria-hidden="true" className={styles.spin} />
                ) : (
                  <FileUp aria-hidden="true" />
                )}
                导入
              </button>
              {importError ? <span>{importError}</span> : null}
            </form>
          </div>
        </details>
        <div className={styles.footerLine}>
          <span>DESTINYPIXEL / PROMPT RADAR</span>
          <span><Clock3 aria-hidden="true" /> 09:30 · 15:30 · 21:30 CST</span>
        </div>
      </footer>

      {adminOpen ? (
        <div className={styles.adminOverlay} onMouseDown={() => setAdminOpen(false)}>
          <section
            aria-labelledby="prompt-admin-title"
            aria-modal="true"
            className={styles.adminDialog}
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className={styles.adminDialogHead}>
              <div>
                <span>PRIVATE CONTROL</span>
                <h2 id="prompt-admin-title">雷达管理员</h2>
              </div>
              <button onClick={() => setAdminOpen(false)} title="关闭" type="button">
                <X aria-hidden="true" />
              </button>
            </div>
            {adminStatus === "authenticated" ? (
              <div className={styles.adminSession}>
                <ShieldCheck aria-hidden="true" />
                <strong>{adminUsername} 已登录</strong>
                <p>关闭面板后，每个案例会显示置顶和删除按钮。</p>
                <button onClick={() => void logoutAdmin()} type="button">
                  <LogOut aria-hidden="true" /> 退出管理模式
                </button>
              </div>
            ) : (
              <form className={styles.adminForm} onSubmit={submitAdminLogin}>
                <label>
                  <span>用户名</span>
                  <input
                    autoComplete="username"
                    onChange={(event) => setAdminUsername(event.target.value)}
                    value={adminUsername}
                  />
                </label>
                <label>
                  <span>密码</span>
                  <input
                    autoComplete="current-password"
                    onChange={(event) => setAdminPassword(event.target.value)}
                    type="password"
                    value={adminPassword}
                  />
                </label>
                {adminError ? <p>{adminError}</p> : null}
                <button disabled={adminStatus === "checking"} type="submit">
                  {adminStatus === "checking" ? (
                    <Loader2 aria-hidden="true" className={styles.spin} />
                  ) : (
                    <LockKeyhole aria-hidden="true" />
                  )}
                  {adminStatus === "checking" ? "验证中" : "进入控制台"}
                </button>
              </form>
            )}
          </section>
        </div>
      ) : null}
    </main>
  );
}
