import {
  generateDirectorEpisode,
  type DirectorEpisodeRequest,
} from "@/lib/ai/daoyan";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(request: Request) {
  let body: DirectorEpisodeRequest;

  try {
    body = (await request.json()) as DirectorEpisodeRequest;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  return Response.json(await generateDirectorEpisode(body), {
    headers: { "Cache-Control": "no-store" },
  });
}
