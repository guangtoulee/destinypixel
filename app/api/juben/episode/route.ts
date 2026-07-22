import {
  generateJubenEpisodeResult,
  JubenSourceParseError,
  type JubenEpisodeRequestBody,
} from "@/lib/ai/juben";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request: Request) {
  let body: JubenEpisodeRequestBody;

  try {
    body = (await request.json()) as JubenEpisodeRequestBody;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  let result;
  try {
    result = await generateJubenEpisodeResult(body);
  } catch (error) {
    if (error instanceof JubenSourceParseError) {
      return Response.json(
        { error: error.message, sourceManifest: error.sourceManifest },
        { status: 422 },
      );
    }
    throw error;
  }

  return Response.json(result, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
