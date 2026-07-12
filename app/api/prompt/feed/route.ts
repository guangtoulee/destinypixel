import {
  collectPromptItemsFromX,
  promptSourcePlan,
} from "@/lib/ai/prompt";
import { readPromptFeed, savePromptItems } from "@/lib/prompt-store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const shouldRefresh = url.searchParams.get("refresh") === "1";
  const limit = Math.min(
    5000,
    Math.max(12, Number(url.searchParams.get("limit") || 2000)),
  );
  let refresh:
    | Awaited<ReturnType<typeof collectPromptItemsFromX>>
    | undefined;

  if (shouldRefresh) {
    refresh = await collectPromptItemsFromX({ limit });

    if (refresh.items.length > 0) {
      await savePromptItems(refresh.items);
    }
  }

  const feed = await readPromptFeed(limit);

  return Response.json(
    {
      ...feed,
      sourcePlan: promptSourcePlan,
      refresh: refresh
        ? {
            skipped: refresh.skipped,
            reason: refresh.reason,
            query: refresh.query,
            collected: refresh.items.length,
          }
        : undefined,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
