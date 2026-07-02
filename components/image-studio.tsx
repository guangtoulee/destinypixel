"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Brush,
  Copy,
  Cpu,
  ExternalLink,
  Image as ImageIcon,
  Languages,
  Loader2,
  Pin,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";
import styles from "./image-studio.module.css";

type ImageProvider = "grok" | "comfyui";
type ImageModel =
  | "grok-imagine-image"
  | "grok-imagine-image-quality"
  | "z-image-comfyui";
type ImageResolution = "1k" | "2k";
type ImageAspectRatio =
  | "auto"
  | "1:1"
  | "16:9"
  | "9:16"
  | "4:3"
  | "3:4"
  | "3:2"
  | "2:3"
  | "2:1"
  | "1:2";
type ImageAssetType =
  | "poster"
  | "portrait"
  | "ecommerce"
  | "infographic"
  | "cartoon-character"
  | "abstract-background"
  | "landscape"
  | "social"
  | "logo-icon"
  | "ui-mockup"
  | "packaging"
  | "scene";

type GeneratedImage = {
  url?: string;
  b64Json?: string;
  revisedPrompt?: string;
};

type GenerateResponse = {
  images?: GeneratedImage[];
  provider?: ImageProvider;
  model?: ImageModel;
  resolution?: ImageResolution;
  aspectRatio?: ImageAspectRatio;
  estimatedCostUsd?: number;
  jobId?: string;
  status?: "queued" | "running" | "complete" | "failed";
  originalPrompt?: string;
  promptUsed?: string;
  promptEnhanced?: boolean;
  refinementNote?: string;
  error?: string;
};

type GalleryItem = {
  id: string;
  image: GeneratedImage;
  prompt: string;
  originalPrompt: string;
  assetType: ImageAssetType;
  style: string;
  provider: ImageProvider;
  model: ImageModel;
  resolution: ImageResolution;
  aspectRatio: ImageAspectRatio;
  estimatedCostUsd: number;
  createdAt: string;
  pinned?: boolean;
};

type AssetTypeOption = {
  value: ImageAssetType;
  label: string;
  description: string;
  prompt: string;
  aspectRatio: ImageAspectRatio;
  style: string;
};

const aspectOptions: Array<{ label: string; value: ImageAspectRatio }> = [
  { label: "Auto", value: "auto" },
  { label: "1:1", value: "1:1" },
  { label: "16:9", value: "16:9" },
  { label: "9:16", value: "9:16" },
  { label: "4:3", value: "4:3" },
  { label: "3:4", value: "3:4" },
  { label: "2:1", value: "2:1" },
  { label: "1:2", value: "1:2" },
];

const modelOptions: Array<{
  label: string;
  value: Exclude<ImageModel, "z-image-comfyui">;
}> = [
  { label: "高级", value: "grok-imagine-image-quality" },
  { label: "快速", value: "grok-imagine-image" },
];

const providerOptions: Array<{
  label: string;
  value: ImageProvider;
  detail: string;
}> = [
  { label: "Grok API", value: "grok", detail: "云端付费" },
  { label: "本地 ComfyUI", value: "comfyui", detail: "Z-Image" },
];

const styleOptions = [
  "商业海报 / KV",
  "电商产品摄影",
  "真实人物摄影",
  "卡通角色设定",
  "长信息图排版",
  "抽象科技背景",
  "风景旅行摄影",
  "极简品牌视觉",
  "3D 图标 / 物件",
  "UI 界面样机",
];

const assetTypeOptions: AssetTypeOption[] = [
  {
    value: "poster",
    label: "海报/KV",
    description: "活动主视觉、封面、广告图",
    aspectRatio: "3:4",
    style: "商业海报 / KV",
    prompt:
      "一张高级感 AI 素材网站发布海报，深色科技背景，温暖金色主光，中央是发光的创意画布和图片碎片，留出标题区域，商业主视觉质感",
  },
  {
    value: "portrait",
    label: "人物",
    description: "真人肖像、职业照、角色照",
    aspectRatio: "3:4",
    style: "真实人物摄影",
    prompt:
      "一位年轻创意总监的高级商业肖像，干净背景，柔和侧光，真实皮肤质感，简洁黑色服装，自信自然的表情，杂志摄影风格",
  },
  {
    value: "ecommerce",
    label: "电商图",
    description: "产品主图、详情页、卖点图",
    aspectRatio: "1:1",
    style: "电商产品摄影",
    prompt:
      "一瓶高端护肤精华的电商主图，产品居中，湿润黑色石材台面，柔和反射，干净背景，留出卖点文字区域，高级旗舰店质感",
  },
  {
    value: "infographic",
    label: "长信息图",
    description: "纵向说明图、流程图、详情页",
    aspectRatio: "9:16",
    style: "长信息图排版",
    prompt:
      "一张纵向 AI 设计工具功能信息图，分成 5 个清晰模块，图标、步骤线、数据卡片、留白文字区域，现代科技风，信息层级清楚",
  },
  {
    value: "cartoon-character",
    label: "卡通人物",
    description: "IP 角色、表情、儿童插画",
    aspectRatio: "1:1",
    style: "卡通角色设定",
    prompt:
      "一个友好的 AI 绘画助手卡通人物，圆润轮廓，明亮眼睛，手持发光画笔，适合应用吉祥物，干净背景，角色设定图质感",
  },
  {
    value: "abstract-background",
    label: "抽象背景",
    description: "科技底图、渐变、海报背景",
    aspectRatio: "16:9",
    style: "抽象科技背景",
    prompt:
      "高级抽象科技背景，半透明玻璃层、细腻光线、青绿色和琥珀色点缀，深色空间感，适合作为网站首屏或海报背景",
  },
  {
    value: "landscape",
    label: "风景图",
    description: "旅行、城市、自然、氛围图",
    aspectRatio: "16:9",
    style: "风景旅行摄影",
    prompt:
      "清晨海边城市风景，远处有古建筑轮廓，前景湿润石阶，中景薄雾，金色日出光线，电影级旅行摄影",
  },
  {
    value: "social",
    label: "社媒封面",
    description: "小红书、视频封面、Banner",
    aspectRatio: "4:3",
    style: "极简品牌视觉",
    prompt:
      "一张适合社媒封面的 AI 素材工具视觉，强对比构图，中心是发光图片卡片，周围是设计元素，醒目但干净，留标题空间",
  },
  {
    value: "logo-icon",
    label: "图标/Logo",
    description: "App 图标、功能图标、品牌符号",
    aspectRatio: "1:1",
    style: "3D 图标 / 物件",
    prompt:
      "一个 AI 图片生成工具的 3D 应用图标，圆角方形，玻璃和金属材质，中心是发光像素星图，简洁高级，可用于 App icon",
  },
  {
    value: "ui-mockup",
    label: "UI 样机",
    description: "网页、App、SaaS 界面展示",
    aspectRatio: "16:9",
    style: "UI 界面样机",
    prompt:
      "一个高级 AI 素材管理后台 UI 样机，大画布预览、左侧参数栏、右侧图片网格，深色专业界面，清晰信息层级，产品展示图",
  },
  {
    value: "packaging",
    label: "包装",
    description: "瓶盒袋、礼盒、贴纸包装",
    aspectRatio: "1:1",
    style: "电商产品摄影",
    prompt:
      "一套高端茶叶礼盒包装设计，哑光纸盒、烫金细节、自然纹理背景，产品摄影布光，品牌感强，留出标识区域",
  },
  {
    value: "scene",
    label: "场景概念",
    description: "空间、电影感、游戏概念图",
    aspectRatio: "16:9",
    style: "商业海报 / KV",
    prompt:
      "未来感创意工作室场景，墙上悬浮多张 AI 生成图，暖色台灯、深色材质、电影级空间光影，适合产品宣传概念图",
  },
];

const promptPresets = assetTypeOptions.slice(0, 6).map((option) => option.prompt);

const moodboardImages = [
  {
    src: "/destinypixel-deep-space.png",
    alt: "DestinyPixel deep space visual",
  },
  {
    src: "/archetypes/sixty-archetypes.png",
    alt: "Sixty archetypes visual board",
  },
  {
    src: "/mazu/mazu-hero.png",
    alt: "Mazu visual reference",
  },
];

const galleryKey = "destinypixel-image-studio-gallery-v2";
const legacyHistoryKey = "destinypixel-image-studio-history";
const adminPinHashKey = "destinypixel-image-studio-admin-pin";
const galleryLimit = 300;

function imageSrc(image: GeneratedImage) {
  if (image.url) return image.url;
  if (image.b64Json) return `data:image/png;base64,${image.b64Json}`;
  return "";
}

function getNetworkErrorMessage(message: string) {
  if (/load failed|failed to fetch|networkerror|fetch/i.test(message)) {
    return "连接中断了。本地 ComfyUI 出图时间比较长，先用 1K / 1 张再试。";
  }

  return message;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForImageJob({
  jobId,
  resolution,
  aspectRatio,
  count,
}: {
  jobId: string;
  resolution: ImageResolution;
  aspectRatio: ImageAspectRatio;
  count: number;
}) {
  const deadline = Date.now() + 10 * 60 * 1000;

  while (Date.now() < deadline) {
    await wait(2500);

    const params = new URLSearchParams({
      jobId,
      resolution,
      aspectRatio,
      count: String(count),
    });
    const response = await fetch(`/api/image/status?${params}`, {
      cache: "no-store",
    });
    const data = (await response.json()) as GenerateResponse;

    if (!response.ok) {
      throw new Error(data.error || "查询生成结果失败。");
    }

    if (data.status === "failed") {
      throw new Error(data.error || "本地 ComfyUI 生成失败。");
    }

    if (data.status === "complete" && data.images?.length) {
      return data;
    }
  }

  throw new Error("本地 ComfyUI 生成超时。");
}

function formatCost(value?: number) {
  if (!value) return "$0.00";
  return `$${value.toFixed(2)}`;
}

function getEstimatedUnitCost(
  provider: ImageProvider,
  model: ImageModel,
  resolution: ImageResolution,
) {
  if (provider === "comfyui") return 0;

  if (model === "grok-imagine-image-quality") {
    return resolution === "1k" ? 0.05 : 0.07;
  }

  return 0.02;
}

function migrateGalleryItems(input: unknown): GalleryItem[] {
  if (!Array.isArray(input)) return [];

  return input.flatMap((item, itemIndex) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;

    if (record.image && typeof record.image === "object") {
      return [record as GalleryItem];
    }

    const images = Array.isArray(record.images)
      ? (record.images as GeneratedImage[])
      : [];

    return images.map((image, imageIndex) => ({
      id: `${record.id || Date.now()}-${itemIndex}-${imageIndex}`,
      image,
      prompt: String(record.prompt || ""),
      originalPrompt: String(record.prompt || ""),
      assetType: "poster" as ImageAssetType,
      style: styleOptions[0],
      provider: "grok" as ImageProvider,
      model: (record.model as ImageModel) || "grok-imagine-image-quality",
      resolution: (record.resolution as ImageResolution) || "2k",
      aspectRatio: (record.aspectRatio as ImageAspectRatio) || "1:1",
      estimatedCostUsd: Number(record.estimatedCostUsd || 0),
      createdAt: String(record.createdAt || new Date().toISOString()),
      pinned: false,
    }));
  });
}

async function hashPin(pin: string) {
  const data = new TextEncoder().encode(pin);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default function ImageStudio() {
  const [assetType, setAssetType] = useState<ImageAssetType>("poster");
  const [prompt, setPrompt] = useState(assetTypeOptions[0].prompt);
  const [style, setStyle] = useState(assetTypeOptions[0].style);
  const [provider, setProvider] = useState<ImageProvider>("grok");
  const [model, setModel] = useState<ImageModel>("grok-imagine-image-quality");
  const [resolution, setResolution] = useState<ImageResolution>("2k");
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>(
    assetTypeOptions[0].aspectRatio,
  );
  const [count, setCount] = useState(1);
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [promptUsed, setPromptUsed] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "refining" | "generating">(
    "idle",
  );
  const [estimatedCostUsd, setEstimatedCostUsd] = useState(0);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminGateOpen, setAdminGateOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState("");
  const [hasAdminPin, setHasAdminPin] = useState(false);

  const isBusy = status !== "idle";

  const estimatedRunCost = useMemo(() => {
    return getEstimatedUnitCost(provider, model, resolution) * count;
  }, [count, model, provider, resolution]);

  const sortedGallery = useMemo(() => {
    return [...gallery].sort((left, right) => {
      if (left.pinned !== right.pinned) return left.pinned ? -1 : 1;

      return (
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      );
    });
  }, [gallery]);

  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(galleryKey) ||
        window.localStorage.getItem(legacyHistoryKey);
      if (saved) {
        setGallery(
          migrateGalleryItems(JSON.parse(saved)).slice(0, galleryLimit),
        );
      }
    } catch {
      setGallery([]);
    }

    try {
      setHasAdminPin(Boolean(window.localStorage.getItem(adminPinHashKey)));
    } catch {
      setHasAdminPin(false);
    }
  }, []);

  function persistGallery(next: GalleryItem[]) {
    const trimmed = next.slice(0, galleryLimit);
    setGallery(trimmed);

    try {
      window.localStorage.setItem(galleryKey, JSON.stringify(trimmed));
    } catch {
      setError("本地图库已满，可以先删除一些旧图。");
    }
  }

  function remember(items: GalleryItem[]) {
    persistGallery([...items, ...gallery]);
  }

  function applyAssetType(option: AssetTypeOption) {
    const promptIsPreset =
      !prompt.trim() ||
      assetTypeOptions.some((item) => item.prompt === prompt) ||
      promptPresets.includes(prompt);

    setAssetType(option.value);
    setStyle(option.style);
    setAspectRatio(option.aspectRatio);

    if (promptIsPreset) {
      setPrompt(option.prompt);
    }
  }

  function toggleAdminGate() {
    if (isAdmin) {
      setIsAdmin(false);
      setAdminGateOpen(false);
      setAdminPinInput("");
      return;
    }

    setAdminGateOpen((current) => !current);
    setError("");
  }

  async function submitAdminPin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const pin = adminPinInput.trim();
    const savedHash = window.localStorage.getItem(adminPinHashKey);

    if (!pin) return;
    if (pin.length < 4) {
      setError("管理口令至少 4 位。");
      return;
    }

    const nextHash = await hashPin(pin);

    if (!savedHash) {
      window.localStorage.setItem(adminPinHashKey, nextHash);
      setHasAdminPin(true);
      setIsAdmin(true);
      setAdminGateOpen(false);
      setAdminPinInput("");
      setError("");
      return;
    }

    if (nextHash === savedHash) {
      setIsAdmin(true);
      setAdminGateOpen(false);
      setAdminPinInput("");
      setError("");
      return;
    }

    setError("管理口令不对。");
  }

  async function generate(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const cleanPrompt = prompt.trim();
    const runResolution = provider === "comfyui" ? "1k" : resolution;
    const runCount = provider === "comfyui" ? 1 : count;

    if (!cleanPrompt) {
      setError("先写一个画面想法，中文也可以。");
      return;
    }

    if (provider === "comfyui") {
      setResolution(runResolution);
      setCount(runCount);
    }

    setStatus(enhancePrompt ? "refining" : "generating");
    setError("");

    try {
      const response = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: cleanPrompt,
          provider,
          assetType,
          style,
          model,
          resolution: runResolution,
          aspectRatio,
          count: runCount,
          enhancePrompt,
        }),
      });

      setStatus("generating");

      let data = (await response.json()) as GenerateResponse;

      if (!response.ok) {
        throw new Error(data.error || "生成失败。");
      }

      if (data.jobId && data.provider === "comfyui") {
        data = {
          ...data,
          ...(await waitForImageJob({
            jobId: data.jobId,
            resolution: data.resolution ?? runResolution,
            aspectRatio: data.aspectRatio ?? aspectRatio,
            count: runCount,
          })),
        };
      }

      const nextImages = data.images ?? [];
      const finalPrompt = data.promptUsed ?? cleanPrompt;
      const runCost = data.estimatedCostUsd ?? estimatedRunCost;
      setImages(nextImages);
      setPromptUsed(finalPrompt);
      setEstimatedCostUsd(runCost);

      if (nextImages.length > 0) {
        remember(
          nextImages.map((image, index) => ({
            id: `${Date.now()}-${index}`,
            image,
            prompt: finalPrompt,
            originalPrompt: cleanPrompt,
            assetType,
            style,
            provider: data.provider ?? provider,
            model:
              data.model ??
              (provider === "comfyui" ? "z-image-comfyui" : model),
            resolution: data.resolution ?? runResolution,
            aspectRatio: data.aspectRatio ?? aspectRatio,
            estimatedCostUsd: Number((runCost / nextImages.length).toFixed(2)),
            createdAt: new Date().toISOString(),
          })),
        );
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "生成失败。";
      setError(getNetworkErrorMessage(message));
    } finally {
      setStatus("idle");
    }
  }

  async function refineOnly() {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return;

    setStatus("refining");
    setError("");

    try {
      const response = await fetch("/api/image/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: cleanPrompt,
          provider,
          assetType,
          style,
          model,
          resolution: provider === "comfyui" ? "1k" : resolution,
          aspectRatio,
          count: provider === "comfyui" ? 1 : count,
        }),
      });
      const data = (await response.json()) as {
        prompt?: string;
        reason?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "润色失败。");
      }

      if (data.prompt) setPrompt(data.prompt);
      if (data.reason) setError(data.reason);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "润色失败。";
      setError(getNetworkErrorMessage(message));
    } finally {
      setStatus("idle");
    }
  }

  async function copyText(value: string) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setError("复制失败，可以手动选中文本。");
    }
  }

  function loadGalleryItem(item: GalleryItem) {
    setPrompt(item.originalPrompt || item.prompt);
    setAssetType(item.assetType);
    setStyle(item.style);
    setProvider(
      item.provider || (item.model === "z-image-comfyui" ? "comfyui" : "grok"),
    );
    setModel(
      item.model === "z-image-comfyui"
        ? "grok-imagine-image-quality"
        : item.model,
    );
    setResolution(item.resolution);
    setAspectRatio(item.aspectRatio);
    setImages([item.image]);
    setPromptUsed(item.prompt);
    setEstimatedCostUsd(item.estimatedCostUsd);
  }

  function deleteGalleryItem(id: string) {
    persistGallery(gallery.filter((item) => item.id !== id));
  }

  function togglePinGalleryItem(id: string) {
    persistGallery(
      gallery.map((item) =>
        item.id === id ? { ...item, pinned: !item.pinned } : item,
      ),
    );
  }

  return (
    <main className={styles.studioRoot}>
      <div className={styles.topbar}>
        <a className={styles.brand} href="/">
          <span className={styles.brandMark} />
          <span>DestinyPixel</span>
        </a>
        <div className={styles.topbarMeta}>
          <span>中文可用</span>
          <span>{provider === "comfyui" ? "ComfyUI Z-Image" : "Grok Imagine"}</span>
          <span>{resolution.toUpperCase()}</span>
          <span>{formatCost(estimatedRunCost)} / run</span>
          <button
            aria-label="隐藏管理入口"
            className={styles.adminDot}
            onClick={toggleAdminGate}
            title="管理入口"
            type="button"
          />
          {adminGateOpen && !isAdmin ? (
            <form className={styles.adminGate} onSubmit={submitAdminPin}>
              <input
                aria-label="管理口令"
                onChange={(event) => setAdminPinInput(event.target.value)}
                placeholder={hasAdminPin ? "管理口令" : "设置口令"}
                type="password"
                value={adminPinInput}
              />
              <button type="submit">进入</button>
            </form>
          ) : null}
        </div>
      </div>

      <form className={styles.workspace} onSubmit={generate}>
        <section className={styles.controlSurface} aria-label="图片生成控制台">
          <div className={styles.surfaceHeader}>
            <div>
              <p className={styles.eyebrow}>Image Studio</p>
              <h1>中文素材生成工作台</h1>
            </div>
            <Languages aria-hidden="true" />
          </div>

          <div className={styles.settingsBlock}>
            <div className={styles.blockTitle}>
              <ImageIcon aria-hidden="true" />
              <span>素材类型</span>
            </div>
            <div className={styles.assetGrid}>
              {assetTypeOptions.map((option) => (
                <button
                  aria-pressed={assetType === option.value}
                  className={
                    assetType === option.value ? styles.activeSegment : ""
                  }
                  key={option.value}
                  onClick={() => applyAssetType(option)}
                  type="button"
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          <label className={styles.promptField}>
            <span>画面描述</span>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="直接写中文：想要什么主体、风格、用途、颜色、画幅、是否留字区..."
              rows={8}
            />
          </label>

          <div className={styles.presetRow} aria-label="提示词示例">
            {promptPresets.map((preset, index) => (
              <button
                className={styles.presetButton}
                key={preset}
                onClick={() => setPrompt(preset)}
                type="button"
              >
                示例 {index + 1}
              </button>
            ))}
          </div>

          <div className={styles.actionRow}>
            <button
              className={styles.primaryButton}
              disabled={isBusy}
              type="submit"
            >
              {isBusy ? (
                <Loader2 aria-hidden="true" className={styles.spinIcon} />
              ) : (
                <WandSparkles aria-hidden="true" />
              )}
              <span>
                {status === "refining"
                  ? "解析中"
                  : status === "generating"
                    ? "生成中"
                    : "生成图片"}
              </span>
            </button>
            <button
              className={styles.secondaryButton}
              disabled={isBusy}
              onClick={refineOnly}
              type="button"
            >
              <Sparkles aria-hidden="true" />
              <span>只解析</span>
            </button>
            <button
              aria-label="重置提示词"
              className={styles.iconButton}
              disabled={isBusy}
              onClick={() => {
                setPrompt(assetTypeOptions[0].prompt);
                setAssetType(assetTypeOptions[0].value);
                setStyle(assetTypeOptions[0].style);
                setAspectRatio(assetTypeOptions[0].aspectRatio);
                setImages([]);
                setPromptUsed("");
                setError("");
              }}
              title="重置提示词"
              type="button"
            >
              <RefreshCw aria-hidden="true" />
            </button>
          </div>

          {error ? <p className={styles.errorLine}>{error}</p> : null}
          {isAdmin ? (
            <p className={styles.adminLine}>
              <ShieldCheck aria-hidden="true" />
              管理模式已开启：可置顶或删除下方本机图库。
            </p>
          ) : null}

          <div className={styles.settingsBlock}>
            <div className={styles.blockTitle}>
              <Cpu aria-hidden="true" />
              <span>出图通道</span>
            </div>
            <div className={styles.segmentedTwo}>
              {providerOptions.map((option) => (
                <button
                  aria-pressed={provider === option.value}
                  className={
                    provider === option.value ? styles.activeSegment : ""
                  }
                  key={option.value}
                  onClick={() => {
                    setProvider(option.value);
                    if (option.value === "comfyui") {
                      setResolution("1k");
                      setCount(1);
                    }
                    if (
                      option.value === "grok" &&
                      model === "z-image-comfyui"
                    ) {
                      setModel("grok-imagine-image-quality");
                    }
                  }}
                  type="button"
                >
                  <span>{option.label}</span>
                  <small>{option.detail}</small>
                </button>
              ))}
            </div>
          </div>

          {provider === "grok" ? (
            <div className={styles.settingsBlock}>
              <div className={styles.blockTitle}>
                <Settings2 aria-hidden="true" />
                <span>模型</span>
              </div>
              <div className={styles.segmentedTwo}>
                {modelOptions.map((option) => (
                  <button
                    aria-pressed={model === option.value}
                    className={
                      model === option.value ? styles.activeSegment : ""
                    }
                    key={option.value}
                    onClick={() => setModel(option.value)}
                    type="button"
                  >
                    <span>{option.label}</span>
                    <small>
                      {formatCost(
                        getEstimatedUnitCost(provider, option.value, resolution),
                      )}
                    </small>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.providerNote}>
              <strong>Z-Image / ComfyUI</strong>
              <span>通过后端连接本地或隧道地址，生成成本按 $0.00 记录。</span>
            </div>
          )}

          <div className={styles.settingsGrid}>
            <div className={styles.settingsBlock}>
              <div className={styles.blockTitle}>
                <ImageIcon aria-hidden="true" />
                <span>清晰度</span>
              </div>
              <div className={styles.segmentedTwo}>
                {(["2k", "1k"] as ImageResolution[]).map((value) => (
                  <button
                    aria-pressed={resolution === value}
                    className={resolution === value ? styles.activeSegment : ""}
                    disabled={provider === "comfyui" && value === "2k"}
                    key={value}
                    onClick={() => setResolution(value)}
                    type="button"
                  >
                    <span>{value.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.settingsBlock}>
              <div className={styles.blockTitle}>
                <Brush aria-hidden="true" />
                <span>数量</span>
              </div>
              <div className={styles.segmentedThree}>
                {[1, 2, 4].map((value) => (
                  <button
                    aria-pressed={count === value}
                    className={count === value ? styles.activeSegment : ""}
                    disabled={provider === "comfyui" && value > 1}
                    key={value}
                    onClick={() => setCount(value)}
                    type="button"
                  >
                    <span>{value}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.settingsBlock}>
            <div className={styles.blockTitle}>
              <ImageIcon aria-hidden="true" />
              <span>画幅</span>
            </div>
            <div className={styles.aspectGrid}>
              {aspectOptions.map((option) => (
                <button
                  aria-pressed={aspectRatio === option.value}
                  className={
                    aspectRatio === option.value ? styles.activeSegment : ""
                  }
                  key={option.value}
                  onClick={() => setAspectRatio(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className={styles.selectField}>
            <span>风格方向</span>
            <select value={style} onChange={(event) => setStyle(event.target.value)}>
              {styleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.settingsBlock}>
            <div className={styles.blockTitle}>
              <Sparkles aria-hidden="true" />
              <span>解析关键词</span>
            </div>
            <div className={styles.segmentedTwo}>
              <button
                aria-pressed={enhancePrompt}
                className={enhancePrompt ? styles.activeSegment : ""}
                onClick={() => setEnhancePrompt(true)}
                type="button"
              >
                <span>开</span>
                <small>DeepSeek</small>
              </button>
              <button
                aria-pressed={!enhancePrompt}
                className={!enhancePrompt ? styles.activeSegment : ""}
                onClick={() => setEnhancePrompt(false)}
                type="button"
              >
                <span>关</span>
                <small>直接生成</small>
              </button>
            </div>
          </div>
        </section>

        <section className={styles.previewSurface} aria-label="最新生成结果">
          <div className={styles.previewHeader}>
            <div>
              <p className={styles.eyebrow}>Canvas</p>
              <h2>{images.length ? "最新生成" : "参考视觉"}</h2>
            </div>
            {promptUsed ? (
              <button
                aria-label="复制最终提示词"
                className={styles.iconButton}
                onClick={() => copyText(promptUsed)}
                title="复制最终提示词"
                type="button"
              >
                <Copy aria-hidden="true" />
              </button>
            ) : null}
          </div>

          {images.length ? (
            <div className={styles.resultGrid}>
              {images.map((image, index) => {
                const src = imageSrc(image);
                return (
                  <article className={styles.resultItem} key={`${src}-${index}`}>
                    <img alt={`生成图片 ${index + 1}`} src={src} />
                    <div className={styles.resultActions}>
                      <span>#{index + 1}</span>
                      <a href={src} rel="noreferrer" target="_blank">
                        <ExternalLink aria-hidden="true" />
                        <span>打开</span>
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.moodboardGrid}>
              {moodboardImages.map((image) => (
                <img alt={image.alt} key={image.src} src={image.src} />
              ))}
            </div>
          )}

          <div className={styles.outputMeta}>
            <div>
              <span>模型</span>
              <strong>
                {provider === "comfyui"
                  ? "Z-Image"
                  : model === "grok-imagine-image-quality"
                    ? "高级"
                    : "快速"}
              </strong>
            </div>
            <div>
              <span>尺寸</span>
              <strong>
                {resolution.toUpperCase()} / {aspectRatio}
              </strong>
            </div>
            <div>
              <span>成本</span>
              <strong>{formatCost(estimatedCostUsd || estimatedRunCost)}</strong>
            </div>
          </div>

          {promptUsed ? (
            <div className={styles.finalPrompt}>
              <div className={styles.blockTitle}>
                <Sparkles aria-hidden="true" />
                <span>最终提示词</span>
              </div>
              <p>{promptUsed}</p>
            </div>
          ) : null}
        </section>
      </form>

      <aside className={styles.galleryFeed} aria-label="生成流">
        <div className={styles.galleryHeader}>
          <div>
            <p className={styles.eyebrow}>Gallery</p>
            <h2>生成流</h2>
          </div>
          <span>{sortedGallery.length} 张本机记录</span>
        </div>

        {sortedGallery.length ? (
          <div className={styles.feedGrid}>
            {sortedGallery.map((item) => {
              const src = imageSrc(item.image);

              return (
                <article
                  className={`${styles.feedItem} ${
                    item.pinned ? styles.pinnedItem : ""
                  }`}
                  key={item.id}
                >
                  <button
                    className={styles.feedImageButton}
                    onClick={() => loadGalleryItem(item)}
                    type="button"
                  >
                    <img alt={item.originalPrompt || item.prompt} src={src} />
                  </button>
                  <div className={styles.feedBody}>
                    <div className={styles.feedMeta}>
                      <span>
                        {
                          assetTypeOptions.find(
                            (option) => option.value === item.assetType,
                          )?.label
                        }
                      </span>
                      <span>
                        {item.resolution.toUpperCase()} / {item.aspectRatio}
                      </span>
                      <span>
                        {(item.provider || "grok") === "comfyui"
                          ? "ComfyUI"
                          : "Grok"}
                      </span>
                    </div>
                    <p>{item.originalPrompt || item.prompt}</p>
                    <div className={styles.feedActions}>
                      <a href={src} rel="noreferrer" target="_blank">
                        <ExternalLink aria-hidden="true" />
                        <span>打开</span>
                      </a>
                      {isAdmin ? (
                        <>
                          <button
                            onClick={() => togglePinGalleryItem(item.id)}
                            type="button"
                          >
                            <Pin aria-hidden="true" />
                            <span>{item.pinned ? "取消" : "置顶"}</span>
                          </button>
                          <button
                            onClick={() => deleteGalleryItem(item.id)}
                            type="button"
                          >
                            <Trash2 aria-hidden="true" />
                            <span>删除</span>
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyGallery}>
            生成后的图片会持续堆在这里；开启隐藏管理入口后可以置顶或删除。
          </div>
        )}
      </aside>
    </main>
  );
}
