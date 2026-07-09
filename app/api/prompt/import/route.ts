import { parseManualPromptImport } from "@/lib/ai/prompt";
import { savePromptItems } from "@/lib/prompt-store";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    text?: string;
  } | null;
  const text = typeof body?.text === "string" ? body.text : "";

  if (text.trim().length < 3) {
    return Response.json({ error: "Missing import text." }, { status: 400 });
  }

  const items = parseManualPromptImport(text);

  if (items.length === 0) {
    return Response.json({ error: "No prompt items found." }, { status: 400 });
  }

  const result = await savePromptItems(items);

  return Response.json(
    {
      ...result,
      items,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
