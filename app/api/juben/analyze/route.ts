import {
  analyzeJubenIdea,
  JubenSourceParseError,
  type JubenRequestBody,
} from "@/lib/ai/juben";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: JubenRequestBody;

  try {
    body = (await request.json()) as JubenRequestBody;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  let result;
  try {
    result = await analyzeJubenIdea(body);
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
