import {
  analyzePromptImage,
  type PromptLanguage,
} from "@/lib/ai/prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

const maxImageBytes = Number(process.env.PROMPT_IMAGE_MAX_BYTES ?? 8_000_000);

function normalizeLanguage(value: FormDataEntryValue | null): PromptLanguage {
  return value === "en" ? "en" : "zh";
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return Response.json({ error: "Invalid form data." }, { status: 400 });
  }

  const image = formData.get("image");

  if (!(image instanceof File)) {
    return Response.json({ error: "Missing image file." }, { status: 400 });
  }

  if (!image.type.startsWith("image/")) {
    return Response.json({ error: "Unsupported image file." }, { status: 400 });
  }

  if (image.size > maxImageBytes) {
    return Response.json(
      { error: `Image is too large. Limit: ${Math.round(maxImageBytes / 1_000_000)}MB.` },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await image.arrayBuffer());
  const imageDataUrl = `data:${image.type};base64,${buffer.toString("base64")}`;
  const result = await analyzePromptImage({
    imageDataUrl,
    mimeType: image.type,
    language: normalizeLanguage(formData.get("language")),
    filename: image.name,
  });

  return Response.json(result, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
