import {
  generateJubenEpisodeResult,
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

  const result = await generateJubenEpisodeResult(body);

  return Response.json(result, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
