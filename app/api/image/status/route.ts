import {
  getComfyImageJob,
  normalizeImageRequest,
} from "@/lib/ai/image-studio";

export const runtime = "nodejs";
export const maxDuration = 30;

function canAccessImageStudio(request: Request) {
  const token = process.env.IMAGE_STUDIO_ACCESS_TOKEN;
  if (!token) return true;

  return request.headers.get("x-image-studio-token") === token;
}

export async function GET(request: Request) {
  if (!canAccessImageStudio(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const jobId = url.searchParams.get("jobId")?.trim() ?? "";

  if (!jobId) {
    return Response.json({ error: "Missing ComfyUI job id." }, { status: 400 });
  }

  const settings = normalizeImageRequest({
    provider: "comfyui",
    resolution: url.searchParams.get("resolution"),
    aspectRatio: url.searchParams.get("aspectRatio"),
    count: url.searchParams.get("count"),
  });

  try {
    const result = await getComfyImageJob({
      jobId,
      resolution: settings.resolution,
      aspectRatio: settings.aspectRatio,
      count: settings.count,
    });

    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Image status check failed.";

    return Response.json({ error: message }, { status: 500 });
  }
}
