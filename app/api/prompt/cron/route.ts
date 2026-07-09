import { collectPromptItemsFromX } from "@/lib/ai/prompt";
import { savePromptItems } from "@/lib/prompt-store";

export const runtime = "nodejs";
export const maxDuration = 120;

function canRunCron(request: Request) {
  const secret = process.env.CRON_SECRET || process.env.PROMPT_CRON_SECRET;

  if (!secret) return process.env.NODE_ENV !== "production";

  return (
    request.headers.get("authorization") === `Bearer ${secret}` ||
    request.headers.get("x-cron-secret") === secret
  );
}

export async function GET(request: Request) {
  if (!canRunCron(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(
    100,
    Math.max(10, Number(url.searchParams.get("limit") || 50)),
  );
  const query = url.searchParams.get("query")?.trim() || undefined;
  const collected = await collectPromptItemsFromX({ query, limit });
  const saved =
    collected.items.length > 0
      ? await savePromptItems(collected.items)
      : { saved: 0, persistent: false };

  return Response.json(
    {
      ok: true,
      collected: collected.items.length,
      saved: saved.saved,
      persistent: saved.persistent,
      skipped: collected.skipped,
      reason: collected.reason,
      query: collected.query,
      ranAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: Request) {
  return GET(request);
}
