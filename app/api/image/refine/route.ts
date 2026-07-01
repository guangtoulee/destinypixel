import {
  normalizeImageRequest,
  refineImagePrompt,
} from "@/lib/ai/image-studio";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const prompt =
    typeof body?.prompt === "string" ? body.prompt.trim().slice(0, 2500) : "";

  if (prompt.length < 3) {
    return Response.json(
      { error: "Please enter a prompt before refining." },
      { status: 400 },
    );
  }

  const settings = normalizeImageRequest(body ?? {});
  const style = typeof body?.style === "string" ? body.style.trim() : "";
  const result = await refineImagePrompt({
    prompt,
    style,
    assetType: settings.assetType,
    aspectRatio: settings.aspectRatio,
    resolution: settings.resolution,
  });

  return Response.json(result);
}
