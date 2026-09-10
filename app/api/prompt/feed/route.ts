import {
  collectPromptItemsFromX,
  promptSourcePlan,
} from "@/lib/ai/prompt";
import { readPromptFeed, savePromptItems } from "@/lib/prompt-store";
import { getIndexablePromptItems, promptSnapshotInfo, selectFeaturedPromptItems } from "@/lib/prompt-library";
import { applyPromptModeration, readPromptModeration } from "@/lib/prompt-moderation";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const shouldRefresh = url.searchParams.get("refresh") === "1";
  const featuredOnly = url.searchParams.get("scope") === "featured";
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

  const feed = featuredOnly
    ? {
        items: applyPromptModeration(getIndexablePromptItems(), await readPromptModeration()),
        ...promptSnapshotInfo,
        persistent: true,
      }
    : await readPromptFeed(limit);
  const items = featuredOnly
    ? selectFeaturedPromptItems(feed.items, limit)
    : feed.items;

  return Response.json(
    {
      ...feed,
      items,
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
