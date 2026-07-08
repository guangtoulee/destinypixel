import { analyzeJubenIdea, type JubenRequestBody } from "@/lib/ai/juben";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: JubenRequestBody;

  try {
    body = (await request.json()) as JubenRequestBody;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = await analyzeJubenIdea(body);

  return Response.json(result, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
