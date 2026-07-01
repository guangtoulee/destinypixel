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

export type ImageModel = "grok-imagine-image" | "grok-imagine-image-quality";

export type GeneratedImage = {
  url?: string;
  b64Json?: string;
  revisedPrompt?: string;
};

export type ImageGenerationResult = {
  images: GeneratedImage[];
  model: ImageModel;
  resolution: ImageResolution;
  aspectRatio: ImageAspectRatio;
  estimatedCostUsd: number;
  raw?: unknown;
};

const XAI_IMAGE_API_URL =
  process.env.XAI_IMAGE_API_URL ?? "https://api.x.ai/v1/images/generations";
const XAI_IMAGE_DEFAULT_MODEL =
  (process.env.XAI_IMAGE_DEFAULT_MODEL as ImageModel | undefined) ??
  "grok-imagine-image-quality";
const XAI_IMAGE_TIMEOUT_MS = Number(process.env.XAI_IMAGE_TIMEOUT_MS ?? 90000);

const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL ?? "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash";
const DEEPSEEK_TIMEOUT_MS = Number(process.env.DEEPSEEK_TIMEOUT_MS ?? 18000);

const MODEL_COST: Record<ImageModel, number> = {
  "grok-imagine-image": 0.02,
  "grok-imagine-image-quality": 0.07,
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
const MODELS: ImageModel[] = ["grok-imagine-image", "grok-imagine-image-quality"];

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
  const model = normalizeEnum(
    input.model,
    MODELS,
    MODELS.includes(XAI_IMAGE_DEFAULT_MODEL)
      ? XAI_IMAGE_DEFAULT_MODEL
      : "grok-imagine-image-quality",
  );
  const resolution = normalizeEnum(input.resolution, RESOLUTIONS, "2k");
  const aspectRatio = normalizeEnum(input.aspectRatio, ASPECT_RATIOS, "1:1");
  const count = Math.min(
    4,
    Math.max(1, Number.isFinite(Number(input.count)) ? Number(input.count) : 1),
  );

  return {
    model,
    resolution,
    aspectRatio,
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

export async function refineImagePrompt({
  prompt,
  style,
  aspectRatio,
  resolution,
}: {
  prompt: string;
  style?: string;
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
              "Rewrite the user's image idea into one polished English image-generation prompt. Preserve intent, add concrete composition, lighting, medium, color, and material details. Do not mention policies or explain your work. Return only the final prompt.",
          },
          {
            role: "user",
            content: JSON.stringify({
              prompt,
              style: style || "editorial design asset",
              aspect_ratio: aspectRatio,
              resolution,
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
  model: ImageModel;
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
      resolution,
      aspectRatio,
      estimatedCostUsd: Number((MODEL_COST[model] * count).toFixed(2)),
      raw: payload,
    };
  } finally {
    timeout.clear();
  }
}
