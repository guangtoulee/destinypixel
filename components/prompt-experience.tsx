"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  Copy,
  Database,
  ExternalLink,
  FileUp,
  Filter,
  Globe2,
  Image as ImageIcon,
  Languages,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  Video,
  WandSparkles,
} from "lucide-react";
import styles from "./prompt-experience.module.css";

type PromptLanguage = "zh" | "en";
type PromptContentType = "image" | "video" | "prompt" | "case";
type PromptSourceType = "x" | "manual" | "seed" | "api";

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
  metrics: PromptMetrics;
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

const styleOptions = [
  "电影级商业摄影",
  "真人写实短剧",
  "高端产品摄影",
  "杂志时装大片",
  "中文信息图设计",
  "3D 物件 / App 图标",
  "赛博城市夜景",
  "自然旅行摄影",
];

const aspectOptions = ["9:16", "3:4", "1:1", "16:9", "4:3", "auto"];

const starterIdeas = [
  "一个会发光的透明行李箱，适合旅行品牌海报",
  "雨夜女律师收到已故母亲微信语音，短剧首帧",
  "咖啡杯从桌面滑向镜头，4 秒产品视频",
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
  if (value === "x") return "X API";
  if (value === "manual") return "手动";
  if (value === "api") return "API";

  return "样例";
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

export default function PromptExperience() {
  const [items, setItems] = useState<PromptFeedItem[]>([]);
  const [feedStatus, setFeedStatus] = useState<Status>("loading");
  const [feedError, setFeedError] = useState("");
  const [feedNotice, setFeedNotice] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [persistent, setPersistent] = useState(false);
  const [sourcePlan, setSourcePlan] = useState<FeedResponse["sourcePlan"]>();
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [language, setLanguage] = useState<PromptLanguage>("zh");
  const [contentType, setContentType] = useState<"image" | "video">("image");
  const [idea, setIdea] = useState(starterIdeas[0]);
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

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      const typeMatch =
        activeFilter === "all" ? true : item.contentType === activeFilter;
      const queryMatch = query
        ? [
            item.title,
            item.description,
            item.prompt,
            item.negativePrompt,
            item.tags.join(" "),
            item.modelHints.join(" "),
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;

      return typeMatch && queryMatch;
    });
  }, [activeFilter, items, searchTerm]);

  const feedStats = useMemo(() => {
    const xCount = items.filter((item) => item.sourceType === "x").length;
    const videoCount = items.filter((item) => item.contentType === "video").length;
    const imageCount = items.filter((item) => item.contentType === "image").length;

    return { xCount, videoCount, imageCount };
  }, [items]);

  async function loadFeed(refresh = false) {
    setFeedStatus("loading");
    setFeedError("");
    setFeedNotice("");

    try {
      const params = new URLSearchParams({ limit: "48" });
      if (refresh) params.set("refresh", "1");

      const response = await fetch(`/api/prompt/feed?${params}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as FeedResponse;

      if (!response.ok) {
        throw new Error(data.error || "读取瀑布流失败。");
      }

      setItems(data.items || []);
      setUpdatedAt(data.updatedAt || "");
      setPersistent(Boolean(data.persistent));
      setSourcePlan(data.sourcePlan);

      if (data.refresh) {
        setFeedNotice(
          data.refresh.skipped
            ? data.refresh.reason || "未配置 X API，已使用本地数据。"
            : `已收集 ${data.refresh.collected} 条 X API 线索。`,
        );
      }

      setFeedStatus("ready");
    } catch (error) {
      setFeedStatus("error");
      setFeedError(error instanceof Error ? error.message : "读取瀑布流失败。");
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
      setExpandError("先写一个想法。");
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
      const data = (await response.json()) as PromptExpansionResult & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "扩写失败。");
      }

      setExpanded(data);
      setExpandStatus("ready");
    } catch (error) {
      setExpandStatus("error");
      setExpandError(error instanceof Error ? error.message : "扩写失败。");
    }
  }

  async function analyzeImage(file: File) {
    setImageStatus("loading");
    setImageError("");
    setImageResult(null);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.set("image", file);
      formData.set("language", language);

      const response = await fetch("/api/prompt/analyze-image", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as PromptImageAnalysisResult & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "图片分析失败。");
      }

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

      if (!response.ok) {
        throw new Error(data.error || "导入失败。");
      }

      setImportText("");
      setFeedNotice(`已导入 ${data.saved || data.items?.length || 0} 条线索。`);
      setImportStatus("ready");
      await loadFeed(false);
    } catch (error) {
      setImportStatus("error");
      setImportError(error instanceof Error ? error.message : "导入失败。");
    }
  }

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <a className={styles.brand} href="/">
          <ArrowLeft aria-hidden="true" size={16} />
          <span>DestinyPixel</span>
        </a>
        <div className={styles.topbarMeta}>
          <span>提示词雷达</span>
          <span>{persistent ? "已持久化" : "本地源"}</span>
          <span>{updatedAt ? formatDate(updatedAt) : "实时"}</span>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.operatorPanel}>
          <section className={styles.hero}>
            <div className={styles.heroText}>
              <p className={styles.eyebrow}>AI Prompt 工作台</p>
              <h1>趋势瀑布流与中文提示词生产</h1>
            </div>
            <div className={styles.heroStats} aria-label="瀑布流统计">
              <span>
                <strong>{items.length}</strong>
                总数
              </span>
              <span>
                <strong>{feedStats.imageCount}</strong>
                图片
              </span>
              <span>
                <strong>{feedStats.videoCount}</strong>
                视频
              </span>
            </div>
          </section>

          <section className={styles.sourceStrip} aria-label="数据源状态">
            <div>
              <ShieldCheck aria-hidden="true" />
              <span>{feedStats.xCount > 0 ? "X API 已接入" : "手动/样例源"}</span>
            </div>
            <button
              disabled={feedStatus === "loading"}
              onClick={() => void loadFeed(true)}
              type="button"
            >
              {feedStatus === "loading" ? (
                <Loader2 aria-hidden="true" className={styles.spin} />
              ) : (
                <RefreshCw aria-hidden="true" />
              )}
              刷新
            </button>
          </section>

          {feedNotice || feedError ? (
            <p
              className={styles.inlineNotice}
              data-tone={feedError ? "error" : "neutral"}
            >
              {feedError || feedNotice}
            </p>
          ) : null}

          <form className={styles.toolSurface} onSubmit={submitExpand}>
            <div className={styles.toolTitle}>
              <WandSparkles aria-hidden="true" />
              <span>描述扩写</span>
            </div>

            <div className={styles.segmented}>
              <button
                aria-pressed={contentType === "image"}
                onClick={() => setContentType("image")}
                type="button"
              >
                <ImageIcon aria-hidden="true" />
                图片
              </button>
              <button
                aria-pressed={contentType === "video"}
                onClick={() => {
                  setContentType("video");
                  if (aspectRatio === "3:4") setAspectRatio("9:16");
                }}
                type="button"
              >
                <Video aria-hidden="true" />
                视频
              </button>
              <button
                aria-pressed={language === "zh"}
                onClick={() => setLanguage("zh")}
                type="button"
              >
                中
              </button>
              <button
                aria-pressed={language === "en"}
                onClick={() => setLanguage("en")}
                type="button"
              >
                EN
              </button>
            </div>

            <label className={styles.field}>
              <span>想法</span>
              <textarea
                onChange={(event) => setIdea(event.target.value)}
                value={idea}
              />
            </label>

            <div className={styles.quickIdeas}>
              {starterIdeas.map((starter) => (
                <button
                  key={starter}
                  onClick={() => setIdea(starter)}
                  type="button"
                >
                  {starter}
                </button>
              ))}
            </div>

            <div className={styles.fieldGrid}>
              <label className={styles.field}>
                <span>风格</span>
                <select
                  onChange={(event) => setStylePreference(event.target.value)}
                  value={stylePreference}
                >
                  {styleOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
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

            <label className={styles.field}>
              <span>负向约束</span>
              <input
                onChange={(event) => setAvoid(event.target.value)}
                value={avoid}
              />
            </label>

            <div className={styles.actionRow}>
              <button disabled={expandStatus === "loading"} type="submit">
                {expandStatus === "loading" ? (
                  <Loader2 aria-hidden="true" className={styles.spin} />
                ) : (
                  <Sparkles aria-hidden="true" />
                )}
                扩写 Prompt
              </button>
              {expandError ? <span data-tone="error">{expandError}</span> : null}
            </div>
          </form>

          <section className={styles.toolSurface}>
            <div className={styles.toolTitle}>
              <Upload aria-hidden="true" />
              <span>图片反推</span>
            </div>
            <label className={styles.uploadBox}>
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
                <img alt="Uploaded preview" src={imagePreview} />
              ) : (
                <span>
                  <FileUp aria-hidden="true" />
                  上传图片
                </span>
              )}
            </label>
            {imageStatus === "loading" ? (
              <p className={styles.inlineNotice}>
                <Loader2 aria-hidden="true" className={styles.spin} />
                正在分析
              </p>
            ) : null}
            {imageError ? (
              <p className={styles.inlineNotice} data-tone="error">
                {imageError}
              </p>
            ) : null}
          </section>

          <form className={styles.toolSurface} onSubmit={submitImport}>
            <div className={styles.toolTitle}>
              <Database aria-hidden="true" />
              <span>手动导入</span>
            </div>
            <label className={styles.field}>
              <span>链接 / 文本 / JSON</span>
              <textarea
                className={styles.compactTextarea}
                onChange={(event) => setImportText(event.target.value)}
                placeholder="https://x.com/..."
                value={importText}
              />
            </label>
            <div className={styles.actionRow}>
              <button disabled={importStatus === "loading"} type="submit">
                {importStatus === "loading" ? (
                  <Loader2 aria-hidden="true" className={styles.spin} />
                ) : (
                  <FileUp aria-hidden="true" />
                )}
                导入
              </button>
              {importError ? <span data-tone="error">{importError}</span> : null}
            </div>
          </form>

          {sourcePlan ? (
            <section className={styles.sourcePlan}>
              <div>
                <Globe2 aria-hidden="true" />
                <span>数据方案</span>
              </div>
              <p>{sourcePlan.primary}</p>
              <p>{sourcePlan.fallback}</p>
            </section>
          ) : null}
        </aside>

        <section className={styles.feedPanel}>
          <div className={styles.feedHeader}>
            <div>
              <p className={styles.eyebrow}>瀑布流</p>
              <h2>热门 prompt 与案例</h2>
            </div>
            <div className={styles.searchBox}>
              <Search aria-hidden="true" />
              <input
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="搜索模型、风格、主题"
                value={searchTerm}
              />
            </div>
          </div>

          <div className={styles.filterBar} aria-label="瀑布流筛选">
            {(["all", "image", "video", "prompt", "case"] as FeedFilter[]).map(
              (filter) => (
                <button
                  aria-pressed={activeFilter === filter}
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  type="button"
                >
                  <Filter aria-hidden="true" />
                  {filter === "all" ? "全部" : contentLabel(filter)}
                </button>
              ),
            )}
          </div>

          {expanded || imageResult ? (
            <section className={styles.resultShelf} aria-label="生成结果">
              {expanded ? (
                <article className={styles.resultPanel}>
                  <div className={styles.resultTopline}>
                    <span>
                      <WandSparkles aria-hidden="true" />
                      {expanded.provider === "deepseek" ? "DeepSeek" : "本地规则"}
                    </span>
                    <button
                      onClick={() =>
                        void copyText(
                          buildExpansionCopy(expanded),
                          "expanded-prompt",
                        )
                      }
                      type="button"
                    >
                      <Copy aria-hidden="true" />
                      {copied === "expanded-prompt" ? "已复制" : "复制整包"}
                    </button>
                  </div>
                  <h3>{expanded.title}</h3>
                  <p>{expanded.prompt}</p>
                  <div className={styles.negativeBlock}>
                    <strong>负向</strong>
                    <span>{expanded.negativePrompt}</span>
                  </div>
                  <div className={styles.breakdownGrid}>
                    {Object.entries(expanded.breakdown).map(([key, value]) => (
                      <span key={key}>
                        <strong>{breakdownLabels[key] || key}</strong>
                        {value}
                      </span>
                    ))}
                  </div>
                </article>
              ) : null}

              {imageResult ? (
                <article className={styles.resultPanel}>
                  <div className={styles.resultTopline}>
                    <span>
                      <ImageIcon aria-hidden="true" />
                      {Math.round(imageResult.confidence * 100)}%
                    </span>
                    <button
                      onClick={() =>
                        void copyText(
                          buildImageAnalysisCopy(imageResult),
                          "image-prompt",
                        )
                      }
                      type="button"
                    >
                      <Copy aria-hidden="true" />
                      {copied === "image-prompt" ? "已复制" : "复制整包"}
                    </button>
                  </div>
                  <h3>{imageResult.title}</h3>
                  <p>{imageResult.prompt}</p>
                  <div className={styles.negativeBlock}>
                    <strong>负向</strong>
                    <span>{imageResult.negativePrompt}</span>
                  </div>
                  {imageResult.note ? (
                    <p className={styles.inlineNotice}>{imageResult.note}</p>
                  ) : null}
                </article>
              ) : null}
            </section>
          ) : null}

          {feedStatus === "loading" && items.length === 0 ? (
            <div className={styles.loadingState}>
              <Loader2 aria-hidden="true" className={styles.spin} />
              <span>加载瀑布流</span>
            </div>
          ) : (
            <div className={styles.waterfall}>
              {filteredItems.map((item) => (
                <article className={styles.promptCard} key={item.id}>
                  {mediaSrc(item) ? (
                    <div className={styles.mediaFrame}>
                      <img alt={item.title} loading="lazy" src={mediaSrc(item)} />
                      <span>{contentLabel(item.contentType)}</span>
                    </div>
                  ) : null}

                  <div className={styles.cardBody}>
                    <div className={styles.cardTopline}>
                      <span>{sourceLabel(item.sourceType)}</span>
                      <span>
                        <CalendarClock aria-hidden="true" />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <h3>{item.title}</h3>
                    <p className={styles.description}>{item.description}</p>

                    <div className={styles.tagRow}>
                      {item.tags.slice(0, 4).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>

                    <div className={styles.promptText}>{item.prompt}</div>

                    <div className={styles.cardMetaGrid}>
                      <span>
                        <strong>风格</strong>
                        {item.style}
                      </span>
                      <span>
                        <strong>光线</strong>
                        {item.lighting}
                      </span>
                      <span>
                        <strong>镜头</strong>
                        {item.camera}
                      </span>
                      <span>
                        <strong>画幅</strong>
                        {item.aspectRatio}
                      </span>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        onClick={() => void copyText(item.prompt, item.id)}
                        type="button"
                      >
                        <Copy aria-hidden="true" />
                        {copied === item.id ? "已复制" : "复制"}
                      </button>
                      {item.sourceUrl ? (
                        <a href={item.sourceUrl} rel="noreferrer" target="_blank">
                          <ExternalLink aria-hidden="true" />
                          来源
                        </a>
                      ) : null}
                      <span>{formatNumber(item.metrics.score)} 热度</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {filteredItems.length === 0 && feedStatus !== "loading" ? (
            <div className={styles.emptyState}>
              <Languages aria-hidden="true" />
              <span>没有匹配的 prompt。</span>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
