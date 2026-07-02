import {
  generateGrokImages,
  normalizeImageRequest,
  queueComfyImages,
  refineImagePrompt,
  type GrokImageModel,
} from "@/lib/ai/image-studio";

export const runtime = "nodejs";
export const maxDuration = 180;

function canAccessImageStudio(request: Request) {
  const token = process.env.IMAGE_STUDIO_ACCESS_TOKEN;
  if (!token) return true;

  return request.headers.get("x-image-studio-token") === token;
}

export async function POST(request: Request) {
  if (!canAccessImageStudio(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  const prompt =
    typeof body?.prompt === "string" ? body.prompt.trim().slice(0, 2500) : "";

  if (prompt.length < 3) {
    return Response.json(
      { error: "Please enter a prompt before generating." },
      { status: 400 },
    );
  }

  const settings = normalizeImageRequest(body ?? {});
  const style = typeof body?.style === "string" ? body.style.trim() : "";
  const shouldEnhance = Boolean(body?.enhancePrompt);

  try {
    const refinement = shouldEnhance
      ? await refineImagePrompt({
          prompt,
          style,
          assetType: settings.assetType,
          aspectRatio: settings.aspectRatio,
          resolution: settings.resolution,
        })
      : { prompt, skipped: true, reason: undefined };

    const grokModel: GrokImageModel =
      settings.model === "grok-imagine-image" ||
      settings.model === "grok-imagine-image-quality"
        ? settings.model
        : "grok-imagine-image-quality";

    const result =
      settings.provider === "comfyui"
        ? await queueComfyImages({
            prompt: refinement.prompt,
            resolution: settings.resolution,
            aspectRatio: settings.aspectRatio,
            count: settings.count,
          })
        : await generateGrokImages({
            prompt: refinement.prompt,
            model: grokModel,
            resolution: settings.resolution,
            aspectRatio: settings.aspectRatio,
            count: settings.count,
          });

    return Response.json({
      ...result,
      originalPrompt: prompt,
      promptUsed: refinement.prompt,
      promptEnhanced: shouldEnhance && !refinement.skipped,
      refinementNote: refinement.reason,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Image generation failed.";

    return Response.json({ error: message }, { status: 500 });
  }
}
