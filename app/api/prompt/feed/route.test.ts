import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "./route";
import {
  featuredPromptLimit,
  getIndexablePromptItems,
  isIndexablePromptItem,
  selectFeaturedPromptItems,
} from "@/lib/prompt-library";

test("featured selection caps growth after exclusions and preserves the incoming pin order", () => {
  const selected = getIndexablePromptItems();
  const excluded = { ...selected[0], id: "test-unpublished-entry" };
  // Repeat safe public identities to exercise growth independently of today's index size.
  const candidates = [...selected, ...selected].reverse();
  const actual = selectFeaturedPromptItems([excluded, ...candidates], 1000);
  assert.equal(actual.length, featuredPromptLimit);
  assert.deepEqual(actual.map((item) => item.id), candidates.slice(0, featuredPromptLimit).map((item) => item.id));
  assert.equal(selectFeaturedPromptItems([excluded, ...candidates], 12).length, 12);
});

test("featured feed respects editorial and moderation exclusions while full search retains the archive", async () => {
  // This test runs entirely against in-memory fixtures and the checked-in snapshot.
  process.env.PROMPT_SUPABASE_ENABLED = "false";
  process.env.SUPABASE_URL = "";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "";

  const selected = getIndexablePromptItems();
  const deletedId = selected[0].id;
  const archiveOnly = { ...selected[1], id: "test-archive-only-prompt", prompt: "An archive-only fixture with a unique prompt.", sourceUrl: "https://example.com/archive-only" };
  Object.assign(globalThis, {
    __destinyPixelPromptStore: { items: [archiveOnly], updatedAt: "2026-09-10T00:00:00.000Z" },
    __destinyPixelPromptModeration: {
      value: { deletedIds: [deletedId], pinnedIds: [], updatedAt: "2026-09-10T00:00:00.000Z" },
      expiresAt: Number.MAX_SAFE_INTEGER,
      bucketReady: false,
    },
  });

  const featuredResponse = await GET(new Request("http://localhost/api/prompt/feed?scope=featured"));
  const featuredText = await featuredResponse.text();
  const featured = JSON.parse(featuredText);
  assert.ok(featured.items.length > 0);
  assert.ok(featured.items.length <= featuredPromptLimit);
  assert.ok(featured.items.every(isIndexablePromptItem));
  assert.ok(featured.items.every((item: { id: string; rawText?: string }) => item.id !== deletedId && item.id !== archiveOnly.id && !("rawText" in item)));

  const fullResponse = await GET(new Request("http://localhost/api/prompt/feed?limit=2000"));
  const fullText = await fullResponse.text();
  const full = JSON.parse(fullText);
  assert.ok(full.items.some((item: { id: string }) => item.id === archiveOnly.id));
  assert.ok(full.items.every((item: { id: string }) => item.id !== deletedId));
  assert.ok(full.items.length > featured.items.length);
  assert.ok(featuredText.length < fullText.length * 0.2);

  const limited = await (await GET(new Request("http://localhost/api/prompt/feed?limit=12"))).json();
  assert.equal(limited.items.length, 12);
  const featuredLimited = await (await GET(new Request("http://localhost/api/prompt/feed?scope=featured&limit=12"))).json();
  assert.equal(featuredLimited.items.length, 12);
});
