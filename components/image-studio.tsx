"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Brush,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Settings2,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import styles from "./image-studio.module.css";

type ImageModel = "grok-imagine-image" | "grok-imagine-image-quality";
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

type GeneratedImage = {
  url?: string;
  b64Json?: string;
  revisedPrompt?: string;
};

type GenerateResponse = {
  images?: GeneratedImage[];
  model?: ImageModel;
  resolution?: ImageResolution;
  aspectRatio?: ImageAspectRatio;
  estimatedCostUsd?: number;
  originalPrompt?: string;
  promptUsed?: string;
  promptEnhanced?: boolean;
  refinementNote?: string;
  error?: string;
};

type HistoryItem = {
  id: string;
  prompt: string;
  images: GeneratedImage[];
  model: ImageModel;
  resolution: ImageResolution;
  aspectRatio: ImageAspectRatio;
  estimatedCostUsd: number;
  createdAt: string;
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
  value: ImageModel;
  cost: string;
}> = [
  { label: "Quality", value: "grok-imagine-image-quality", cost: "$0.07" },
  { label: "Fast", value: "grok-imagine-image", cost: "$0.02" },
];

const styleOptions = [
  "editorial poster",
  "product hero",
  "cinematic still",
  "minimal brand KV",
  "3D icon set",
  "social thumbnail",
];

const promptPresets = [
  "A luxury skincare bottle on wet black stone, morning light, soft reflections, premium editorial product photography",
  "A clean 2K app icon set for an AI image studio, glass, brushed metal, warm accent colors, product-ready",
  "A Chinese New Year campaign key visual, modern red paper craft, elegant typography space, premium commercial design",
  "A cinematic travel poster for Meizhou, temple lights, sea wind, documentary texture, sophisticated composition",
];

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

const historyKey = "destinypixel-image-studio-history";

function imageSrc(image: GeneratedImage) {
  if (image.url) return image.url;
  if (image.b64Json) return `data:image/png;base64,${image.b64Json}`;
  return "";
}

function formatCost(value?: number) {
  if (!value) return "$0.00";
  return `$${value.toFixed(2)}`;
}

export default function ImageStudio() {
  const [prompt, setPrompt] = useState(promptPresets[0]);
  const [style, setStyle] = useState(styleOptions[0]);
  const [model, setModel] = useState<ImageModel>("grok-imagine-image-quality");
  const [resolution, setResolution] = useState<ImageResolution>("2k");
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>("1:1");
  const [count, setCount] = useState(1);
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [promptUsed, setPromptUsed] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "refining" | "generating">(
    "idle",
  );
  const [estimatedCostUsd, setEstimatedCostUsd] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const isBusy = status !== "idle";

  const estimatedRunCost = useMemo(() => {
    const unit = model === "grok-imagine-image-quality" ? 0.07 : 0.02;
    return unit * count;
  }, [count, model]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(historyKey);
      if (saved) setHistory(JSON.parse(saved).slice(0, 6));
    } catch {
      setHistory([]);
    }
  }, []);

  function remember(item: HistoryItem) {
    const next = [item, ...history].slice(0, 6);
    setHistory(next);

    try {
      window.localStorage.setItem(historyKey, JSON.stringify(next));
    } catch {
      // Local history is a convenience only.
    }
  }

  async function generate(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const cleanPrompt = prompt.trim();

    if (!cleanPrompt) {
      setError("先写一个画面想法。");
      return;
    }

    setStatus(enhancePrompt ? "refining" : "generating");
    setError("");

    try {
      const response = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: cleanPrompt,
          style,
          model,
          resolution,
          aspectRatio,
          count,
          enhancePrompt,
        }),
      });

      setStatus("generating");

      const data = (await response.json()) as GenerateResponse;

      if (!response.ok) {
        throw new Error(data.error || "生成失败。");
      }

      const nextImages = data.images ?? [];
      setImages(nextImages);
      setPromptUsed(data.promptUsed ?? cleanPrompt);
      setEstimatedCostUsd(data.estimatedCostUsd ?? estimatedRunCost);

      if (nextImages.length > 0) {
        remember({
          id: `${Date.now()}`,
          prompt: data.promptUsed ?? cleanPrompt,
          images: nextImages,
          model: data.model ?? model,
          resolution: data.resolution ?? resolution,
          aspectRatio: data.aspectRatio ?? aspectRatio,
          estimatedCostUsd: data.estimatedCostUsd ?? estimatedRunCost,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "生成失败。");
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
          style,
          model,
          resolution,
          aspectRatio,
          count,
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
      setError(caught instanceof Error ? caught.message : "润色失败。");
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

  function loadHistory(item: HistoryItem) {
    setPrompt(item.prompt);
    setModel(item.model);
    setResolution(item.resolution);
    setAspectRatio(item.aspectRatio);
    setImages(item.images);
    setPromptUsed(item.prompt);
    setEstimatedCostUsd(item.estimatedCostUsd);
  }

  return (
    <main className={styles.studioRoot}>
      <div className={styles.topbar}>
        <a className={styles.brand} href="/">
          <span className={styles.brandMark} />
          <span>DestinyPixel</span>
        </a>
        <div className={styles.topbarMeta}>
          <span>Grok Imagine</span>
          <span>{resolution.toUpperCase()}</span>
          <span>{formatCost(estimatedRunCost)} / run</span>
        </div>
      </div>

      <form className={styles.workspace} onSubmit={generate}>
        <section className={styles.controlSurface} aria-label="Image controls">
          <div className={styles.surfaceHeader}>
            <div>
              <p className={styles.eyebrow}>Image Studio</p>
              <h1>Generate production-ready visual assets</h1>
            </div>
            <ImageIcon aria-hidden="true" />
          </div>

          <label className={styles.promptField}>
            <span>Prompt</span>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe the image you want..."
              rows={8}
            />
          </label>

          <div className={styles.presetRow} aria-label="Prompt presets">
            {promptPresets.map((preset, index) => (
              <button
                className={styles.presetButton}
                key={preset}
                onClick={() => setPrompt(preset)}
                type="button"
              >
                #{index + 1}
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
                  ? "Refining"
                  : status === "generating"
                    ? "Generating"
                    : "Generate"}
              </span>
            </button>
            <button
              className={styles.secondaryButton}
              disabled={isBusy}
              onClick={refineOnly}
              type="button"
            >
              <Sparkles aria-hidden="true" />
              <span>Refine</span>
            </button>
            <button
              aria-label="Reset prompt"
              className={styles.iconButton}
              disabled={isBusy}
              onClick={() => {
                setPrompt(promptPresets[0]);
                setImages([]);
                setPromptUsed("");
                setError("");
              }}
              title="Reset prompt"
              type="button"
            >
              <RefreshCw aria-hidden="true" />
            </button>
          </div>

          {error ? <p className={styles.errorLine}>{error}</p> : null}

          <div className={styles.settingsBlock}>
            <div className={styles.blockTitle}>
              <Settings2 aria-hidden="true" />
              <span>Model</span>
            </div>
            <div className={styles.segmentedTwo}>
              {modelOptions.map((option) => (
                <button
                  aria-pressed={model === option.value}
                  className={model === option.value ? styles.activeSegment : ""}
                  key={option.value}
                  onClick={() => setModel(option.value)}
                  type="button"
                >
                  <span>{option.label}</span>
                  <small>{option.cost}</small>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.settingsGrid}>
            <div className={styles.settingsBlock}>
              <div className={styles.blockTitle}>
                <ImageIcon aria-hidden="true" />
                <span>Resolution</span>
              </div>
              <div className={styles.segmentedTwo}>
                {(["2k", "1k"] as ImageResolution[]).map((value) => (
                  <button
                    aria-pressed={resolution === value}
                    className={resolution === value ? styles.activeSegment : ""}
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
                <span>Count</span>
              </div>
              <div className={styles.segmentedThree}>
                {[1, 2, 4].map((value) => (
                  <button
                    aria-pressed={count === value}
                    className={count === value ? styles.activeSegment : ""}
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
              <span>Aspect</span>
            </div>
            <div className={styles.aspectGrid}>
              {aspectOptions.map((option) => (
                <button
                  aria-pressed={aspectRatio === option.value}
                  className={aspectRatio === option.value ? styles.activeSegment : ""}
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
            <span>Style</span>
            <select value={style} onChange={(event) => setStyle(event.target.value)}>
              {styleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.toggleRow}>
            <input
              checked={enhancePrompt}
              onChange={(event) => setEnhancePrompt(event.target.checked)}
              type="checkbox"
            />
            <span>DeepSeek prompt polish</span>
          </label>
        </section>

        <section className={styles.previewSurface} aria-label="Generated images">
          <div className={styles.previewHeader}>
            <div>
              <p className={styles.eyebrow}>Canvas</p>
              <h2>{images.length ? "Latest generation" : "Reference board"}</h2>
            </div>
            {promptUsed ? (
              <button
                aria-label="Copy final prompt"
                className={styles.iconButton}
                onClick={() => copyText(promptUsed)}
                title="Copy final prompt"
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
                    <img alt={`Generated image ${index + 1}`} src={src} />
                    <div className={styles.resultActions}>
                      <span>#{index + 1}</span>
                      <a href={src} rel="noreferrer" target="_blank">
                        <ExternalLink aria-hidden="true" />
                        <span>Open</span>
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
              <span>Model</span>
              <strong>
                {model === "grok-imagine-image-quality" ? "Quality" : "Fast"}
              </strong>
            </div>
            <div>
              <span>Size</span>
              <strong>
                {resolution.toUpperCase()} / {aspectRatio}
              </strong>
            </div>
            <div>
              <span>Cost</span>
              <strong>{formatCost(estimatedCostUsd || estimatedRunCost)}</strong>
            </div>
          </div>

          {promptUsed ? (
            <div className={styles.finalPrompt}>
              <div className={styles.blockTitle}>
                <Sparkles aria-hidden="true" />
                <span>Final prompt</span>
              </div>
              <p>{promptUsed}</p>
            </div>
          ) : null}
        </section>
      </form>

      {history.length ? (
        <aside className={styles.historyStrip} aria-label="Local history">
          <div className={styles.historyTitle}>Recent</div>
          <div className={styles.historyItems}>
            {history.map((item) => (
              <button key={item.id} onClick={() => loadHistory(item)} type="button">
                <img alt="" src={imageSrc(item.images[0])} />
                <span>{item.prompt}</span>
              </button>
            ))}
          </div>
        </aside>
      ) : null}
    </main>
  );
}
