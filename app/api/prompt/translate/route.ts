import { readPromptFeed } from "@/lib/prompt-store";
import { getPromptTranslations } from "@/lib/prompt-translations";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { ids?: unknown } | null;
  const ids = Array.from(
    new Set(
      (Array.isArray(body?.ids) ? body.ids : [])
        .filter((id): id is string => typeof id === "string")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ).slice(0, 16);

  if (ids.length === 0) {
    return Response.json({ translations: {} });
  }

  const feed = await readPromptFeed(5000);
  const requested = new Set(ids);
  const items = feed.items.filter(
    (item) =>
      requested.has(item.id) &&
      item.sourceType === "x" &&
      item.language === "en",
  );
  const translations = await getPromptTranslations(items);

  return Response.json(
    { translations },
    { headers: { "Cache-Control": "no-store" } },
  );
}
