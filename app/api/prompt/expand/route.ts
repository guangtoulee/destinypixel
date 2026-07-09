import { expandPrompt, type PromptExpandRequest } from "@/lib/ai/prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: PromptExpandRequest;

  try {
    body = (await request.json()) as PromptExpandRequest;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = await expandPrompt(body);

  return Response.json(result, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
