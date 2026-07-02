export type ImageAspectRatio =
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

export type ImageResolution = "1k" | "2k";

export type ImageProvider = "grok" | "comfyui";

export type GrokImageModel =
  | "grok-imagine-image"
  | "grok-imagine-image-quality";

export type ImageModel = GrokImageModel | "z-image-comfyui";

export type ImageAssetType =
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

export type GeneratedImage = {
  url?: string;
  b64Json?: string;
  revisedPrompt?: string;
};

export type ImageGenerationResult = {
  images: GeneratedImage[];
  model: ImageModel;
  provider: ImageProvider;
  resolution: ImageResolution;
  aspectRatio: ImageAspectRatio;
  estimatedCostUsd: number;
  raw?: unknown;
};

const XAI_IMAGE_API_URL =
  process.env.XAI_IMAGE_API_URL ?? "https://api.x.ai/v1/images/generations";
const XAI_IMAGE_DEFAULT_MODEL =
  (process.env.XAI_IMAGE_DEFAULT_MODEL as GrokImageModel | undefined) ??
  "grok-imagine-image-quality";
const XAI_IMAGE_TIMEOUT_MS = Number(process.env.XAI_IMAGE_TIMEOUT_MS ?? 90000);

const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL ?? "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash";
const DEEPSEEK_TIMEOUT_MS = Number(process.env.DEEPSEEK_TIMEOUT_MS ?? 18000);

const COMFYUI_API_URL = process.env.COMFYUI_API_URL?.replace(/\/$/, "");
const COMFYUI_TIMEOUT_MS = Number(process.env.COMFYUI_TIMEOUT_MS ?? 180000);
const COMFYUI_POLL_INTERVAL_MS = Number(
  process.env.COMFYUI_POLL_INTERVAL_MS ?? 1500,
);

const MODEL_COST: Record<GrokImageModel, Record<ImageResolution, number>> = {
  "grok-imagine-image": {
    "1k": 0.02,
    "2k": 0.02,
  },
  "grok-imagine-image-quality": {
    "1k": 0.05,
    "2k": 0.07,
  },
};

const ASPECT_RATIOS: ImageAspectRatio[] = [
  "auto",
  "1:1",
  "16:9",
  "9:16",
  "4:3",
  "3:4",
  "3:2",
  "2:3",
  "2:1",
  "1:2",
];

const RESOLUTIONS: ImageResolution[] = ["1k", "2k"];
const PROVIDERS: ImageProvider[] = ["grok", "comfyui"];
const GROK_MODELS: GrokImageModel[] = [
  "grok-imagine-image",
  "grok-imagine-image-quality",
];
const ASSET_TYPES: ImageAssetType[] = [
  "poster",
  "portrait",
  "ecommerce",
  "infographic",
  "cartoon-character",
  "abstract-background",
  "landscape",
  "social",
  "logo-icon",
  "ui-mockup",
  "packaging",
  "scene",
];

function normalizeEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
) {
  return typeof value === "string" && allowed.includes(value as T)
    ? (value as T)
    : fallback;
}

export function normalizeImageRequest(input: Record<string, unknown>) {
  const provider = normalizeEnum(input.provider, PROVIDERS, "grok");
  const model = normalizeEnum(
    input.model,
    GROK_MODELS,
    GROK_MODELS.includes(XAI_IMAGE_DEFAULT_MODEL)
      ? XAI_IMAGE_DEFAULT_MODEL
      : "grok-imagine-image-quality",
  );
  const resolution = normalizeEnum(input.resolution, RESOLUTIONS, "2k");
  const aspectRatio = normalizeEnum(input.aspectRatio, ASPECT_RATIOS, "1:1");
  const assetType = normalizeEnum(input.assetType, ASSET_TYPES, "poster");
  const count = Math.min(
    4,
    Math.max(1, Number.isFinite(Number(input.count)) ? Number(input.count) : 1),
  );

  return {
    provider,
    model: provider === "comfyui" ? "z-image-comfyui" : model,
    resolution,
    aspectRatio,
    assetType,
    count: Math.floor(count),
  };
}

function createTimeoutSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(timeout) };
}

async function readJsonResponse(response: Response) {
  const text = await response.text();

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;

  const record = payload as Record<string, unknown>;
  const error = record.error;

  if (error && typeof error === "object") {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  if (typeof error === "string" && error.trim()) {
    const code = typeof record.code === "string" ? `${record.code}: ` : "";
    return `${code}${error}`;
  }

  if (typeof record.message === "string" && record.message.trim()) {
    return record.message;
  }

  return fallback;
}

function getComfyDimensions(
  aspectRatio: ImageAspectRatio,
  resolution: ImageResolution,
) {
  const oneK: Record<ImageAspectRatio, { width: number; height: number }> = {
    auto: { width: 1024, height: 1024 },
    "1:1": { width: 1024, height: 1024 },
    "16:9": { width: 1344, height: 768 },
    "9:16": { width: 768, height: 1344 },
    "4:3": { width: 1152, height: 864 },
    "3:4": { width: 864, height: 1152 },
    "3:2": { width: 1216, height: 832 },
    "2:3": { width: 832, height: 1216 },
    "2:1": { width: 1408, height: 704 },
    "1:2": { width: 704, height: 1408 },
  };
  const twoK: Record<ImageAspectRatio, { width: number; height: number }> = {
    auto: { width: 1536, height: 1536 },
    "1:1": { width: 1536, height: 1536 },
    "16:9": { width: 1792, height: 1024 },
    "9:16": { width: 1024, height: 1792 },
    "4:3": { width: 1536, height: 1152 },
    "3:4": { width: 1152, height: 1536 },
    "3:2": { width: 1536, height: 1024 },
    "2:3": { width: 1024, height: 1536 },
    "2:1": { width: 1792, height: 896 },
    "1:2": { width: 896, height: 1792 },
  };

  return resolution === "2k" ? twoK[aspectRatio] : oneK[aspectRatio];
}

function createZImageWorkflow({
  prompt,
  aspectRatio,
  resolution,
  count,
}: {
  prompt: string;
  aspectRatio: ImageAspectRatio;
  resolution: ImageResolution;
  count: number;
}) {
  const { width, height } = getComfyDimensions(aspectRatio, resolution);
  const seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  const steps = Number(process.env.COMFYUI_Z_IMAGE_STEPS ?? 20);
  const cfg = Number(process.env.COMFYUI_Z_IMAGE_CFG ?? 4);
  const shift = Number(process.env.COMFYUI_Z_IMAGE_SHIFT ?? 3);

  return {
    "9": {
      inputs: {
        filename_prefix: "destinypixel-z-image",
        images: ["65", 0],
      },
      class_type: "SaveImage",
    },
    "62": {
      inputs: {
        clip_name: process.env.COMFYUI_Z_IMAGE_CLIP ?? "qwen_3_4b.safetensors",
        type: "lumina2",
        device: "default",
      },
      class_type: "CLIPLoader",
    },
    "63": {
      inputs: {
        vae_name: process.env.COMFYUI_Z_IMAGE_VAE ?? "ae.safetensors",
      },
      class_type: "VAELoader",
    },
    "65": {
      inputs: {
        samples: ["69", 0],
        vae: ["63", 0],
      },
      class_type: "VAEDecode",
    },
    "66": {
      inputs: {
        unet_name:
          process.env.COMFYUI_Z_IMAGE_UNET ?? "z_image_bf16.safetensors",
        weight_dtype: "default",
      },
      class_type: "UNETLoader",
    },
    "67": {
      inputs: {
        text: prompt,
        clip: ["62", 0],
      },
      class_type: "CLIPTextEncode",
    },
    "68": {
      inputs: {
        width,
        height,
        batch_size: count,
      },
      class_type: "EmptySD3LatentImage",
    },
    "69": {
      inputs: {
        seed,
        steps,
        cfg,
        sampler_name: "res_multistep",
        scheduler: "simple",
        denoise: 1,
        model: ["70", 0],
        positive: ["67", 0],
        negative: ["71", 0],
        latent_image: ["68", 0],
      },
      class_type: "KSampler",
    },
    "70": {
      inputs: {
        shift,
        model: ["66", 0],
      },
      class_type: "ModelSamplingAuraFlow",
    },
    "71": {
      inputs: {
        text: process.env.COMFYUI_Z_IMAGE_NEGATIVE ?? "",
        clip: ["62", 0],
      },
      class_type: "CLIPTextEncode",
    },
  };
}

function getComfyPromptRecord(payload: unknown, promptId: string) {
  if (!payload || typeof payload !== "object") return undefined;

  return (payload as Record<string, unknown>)[promptId] ?? payload;
}

function extractComfyOutputImages(record: unknown) {
  if (!record || typeof record !== "object") return [];

  const outputs = (record as { outputs?: Record<string, unknown> }).outputs;
  if (!outputs || typeof outputs !== "object") return [];

  return Object.values(outputs).flatMap((output) => {
    if (!output || typeof output !== "object") return [];

    const images = (output as { images?: unknown }).images;
    if (!Array.isArray(images)) return [];

    return images.flatMap((image) => {
      if (!image || typeof image !== "object") return [];

      const item = image as Record<string, unknown>;
      const filename = typeof item.filename === "string" ? item.filename : "";
      const type = typeof item.type === "string" ? item.type : "output";
      const subfolder =
        typeof item.subfolder === "string" ? item.subfolder : "";

      return filename ? [{ filename, type, subfolder }] : [];
    });
  });
}

export async function refineImagePrompt({
  prompt,
  style,
  assetType,
  aspectRatio,
  resolution,
}: {
  prompt: string;
  style?: string;
  assetType?: ImageAssetType;
  aspectRatio: ImageAspectRatio;
  resolution: ImageResolution;
}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return {
      prompt,
      skipped: true,
      reason: "DEEPSEEK_API_KEY is not configured.",
    };
  }

  const timeout = createTimeoutSignal(DEEPSEEK_TIMEOUT_MS);

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        temperature: 0.45,
        max_tokens: 700,
        messages: [
          {
            role: "system",
            content:
              [
                "You are the prompt architect for a Chinese/English AI stock-asset website.",
                "The user may write in Chinese, English, or mixed language. Understand the real commercial intent first, then convert it into one precise English image-generation prompt for Grok Imagine.",
                "Preserve concrete product, person, place, color, cultural, era, and mood details from the user. Do not translate brand names, exact Chinese phrases, or proper nouns unless needed.",
                "Infer the asset format from asset_type and aspect_ratio. Add composition, camera/viewpoint, subject hierarchy, material texture, lighting, background, color palette, negative space, and finish quality.",
                "For posters and ecommerce, leave clean copy space unless the user gives exact text. For long infographics, design a vertical information layout with sections, icons, charts, and placeholder blocks; avoid tiny unreadable text. For cartoon characters, describe character sheet details, pose, expression, outfit, and clean silhouette. For portraits, specify framing, lens feel, styling, and realistic anatomy. For abstract backgrounds, avoid a single-color wash and include layered depth. For landscapes, include foreground, midground, background, season, atmosphere, and light.",
                "If the user explicitly asks for visible text, include the exact requested text in quotes. Otherwise add: no readable text, no watermark, no logo.",
                "Return only the final English prompt. No explanation, no bullets, no JSON.",
              ].join(" "),
          },
          {
            role: "user",
            content: JSON.stringify({
              prompt,
              asset_type: assetType || "poster",
              style: style || "editorial design asset",
              aspect_ratio: aspectRatio,
              resolution,
              output_expectation:
                "One production-ready prompt suitable for commercial material generation.",
            }),
          },
        ],
      }),
      signal: timeout.signal,
    });

    const payload = await readJsonResponse(response);

    if (!response.ok) {
      return {
        prompt,
        skipped: true,
        reason: getErrorMessage(payload, "DeepSeek prompt refinement failed."),
      };
    }

    const content = (
      payload as {
        choices?: Array<{ message?: { content?: string } }>;
      }
    ).choices?.[0]?.message?.content?.trim();

    return {
      prompt: content || prompt,
      skipped: !content,
      reason: content ? undefined : "DeepSeek returned an empty prompt.",
    };
  } finally {
    timeout.clear();
  }
}

export async function generateGrokImages({
  prompt,
  model,
  resolution,
  aspectRatio,
  count,
}: {
  prompt: string;
  model: GrokImageModel;
  resolution: ImageResolution;
  aspectRatio: ImageAspectRatio;
  count: number;
}): Promise<ImageGenerationResult> {
  const apiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;

  if (!apiKey) {
    throw new Error("XAI_API_KEY is not configured.");
  }

  const timeout = createTimeoutSignal(XAI_IMAGE_TIMEOUT_MS);

  try {
    const body: Record<string, unknown> = {
      model,
      prompt,
      n: count,
      resolution,
    };

    if (aspectRatio !== "auto") {
      body.aspect_ratio = aspectRatio;
    }

    const response = await fetch(XAI_IMAGE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: timeout.signal,
    });

    const payload = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(getErrorMessage(payload, "xAI image generation failed."));
    }

    const data = Array.isArray((payload as { data?: unknown }).data)
      ? ((payload as { data: Array<Record<string, unknown>> }).data ?? [])
      : [];

    const images = data
      .map((item) => ({
        url: typeof item.url === "string" ? item.url : undefined,
        b64Json: typeof item.b64_json === "string" ? item.b64_json : undefined,
        revisedPrompt:
          typeof item.revised_prompt === "string" ? item.revised_prompt : undefined,
      }))
      .filter((item) => item.url || item.b64Json);

    return {
      images,
      model,
      provider: "grok",
      resolution,
      aspectRatio,
      estimatedCostUsd: Number(
        (MODEL_COST[model][resolution] * count).toFixed(2),
      ),
      raw: payload,
    };
  } finally {
    timeout.clear();
  }
}

export async function generateComfyImages({
  prompt,
  resolution,
  aspectRatio,
  count,
}: {
  prompt: string;
  resolution: ImageResolution;
  aspectRatio: ImageAspectRatio;
  count: number;
}): Promise<ImageGenerationResult> {
  if (!COMFYUI_API_URL) {
    throw new Error(
      "COMFYUI_API_URL is not configured. Use a local URL for LAN testing or an HTTPS tunnel URL for production.",
    );
  }

  const workflow = createZImageWorkflow({
    prompt,
    aspectRatio,
    resolution,
    count,
  });
  const timeout = createTimeoutSignal(15000);

  let promptId = "";

  try {
    const response = await fetch(`${COMFYUI_API_URL}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: crypto.randomUUID(),
        prompt: workflow,
      }),
      signal: timeout.signal,
    });
    const payload = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(getErrorMessage(payload, "ComfyUI queue failed."));
    }

    promptId =
      typeof (payload as { prompt_id?: unknown }).prompt_id === "string"
        ? (payload as { prompt_id: string }).prompt_id
        : "";

    if (!promptId) {
      throw new Error("ComfyUI did not return a prompt id.");
    }
  } finally {
    timeout.clear();
  }

  const deadline = Date.now() + COMFYUI_TIMEOUT_MS;
  let outputImages: Array<{
    filename: string;
    type: string;
    subfolder: string;
  }> = [];
  let rawHistory: unknown;

  while (Date.now() < deadline) {
    const response = await fetch(`${COMFYUI_API_URL}/history/${promptId}`, {
      cache: "no-store",
    });
    const payload = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(getErrorMessage(payload, "ComfyUI history failed."));
    }

    rawHistory = payload;
    outputImages = extractComfyOutputImages(
      getComfyPromptRecord(payload, promptId),
    );

    if (outputImages.length > 0) break;
    await sleep(COMFYUI_POLL_INTERVAL_MS);
  }

  if (outputImages.length === 0) {
    throw new Error("ComfyUI timed out before returning an image.");
  }

  const images = await Promise.all(
    outputImages.slice(0, count).map(async (image) => {
      const params = new URLSearchParams({
        filename: image.filename,
        type: image.type,
      });

      if (image.subfolder) params.set("subfolder", image.subfolder);

      const response = await fetch(`${COMFYUI_API_URL}/view?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch ComfyUI image ${image.filename}.`);
      }

      const bytes = Buffer.from(await response.arrayBuffer());

      return {
        b64Json: bytes.toString("base64"),
        revisedPrompt: prompt,
      };
    }),
  );

  return {
    images,
    model: "z-image-comfyui",
    provider: "comfyui",
    resolution,
    aspectRatio,
    estimatedCostUsd: 0,
    raw: rawHistory,
  };
}
