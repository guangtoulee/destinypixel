import { test } from "node:test";
import assert from "node:assert/strict";
import { POST } from "@/app/api/compatibility/route";
const body = { people: [{ birthDate: "1991-03-21", birthTime: "10:35", cityId: "new-york-us" }, { birthDate: "1993-10-04", birthTime: "17:20", cityId: "shanghai-cn" }], locale: "en", consent: true, mode: "calculate" };
function request(value: unknown = body, origin = "https://example.test") { return new Request("https://example.test/api/compatibility", { method: "POST", headers: { origin, "Content-Type": "application/json", "x-forwarded-for": "192.0.2.8" }, body: JSON.stringify(value) }); }
test("calculation is private, rejects cross-site, oversized and invalid input", async () => {
  const good = await POST(request());
  assert.equal(good.status, 200); assert.equal(good.headers.get("cache-control"), "private, no-store");
  assert.equal((await good.json()).result.version, "relationship-v1");
  assert.equal((await POST(request(body, "https://other.test"))).status, 403);
  assert.equal((await POST(request({ ...body, payload: "x".repeat(9000) }))).status, 413);
  assert.equal((await POST(request({ ...body, consent: false }))).status, 400);
  assert.equal((await POST(request({ ...body, people: [body.people[0]] }))).status, 400);
});
test("AI fallback does not call the provider when durable limiter fails or denies", async () => {
  const old = { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY, fetch: globalThis.fetch };
  process.env.SUPABASE_URL = "https://db.example.test"; process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only";
  try {
    let calls = 0;
    globalThis.fetch = (async (url) => { calls++; assert.ok(String(url).includes("destiny_auth_consume_rate_limit")); return new Response("unavailable", { status: 503 }); }) as typeof fetch;
    let response = await POST(request({ ...body, mode: "interpret" }));
    assert.equal(response.status, 200); assert.equal((await response.json()).status, "unavailable"); assert.equal(calls, 1);
    globalThis.fetch = (async () => Response.json([{ allowed: false, retry_after: 60 }])) as typeof fetch;
    response = await POST(request({ ...body, mode: "interpret" }));
    assert.equal((await response.json()).status, "limited");
  } finally { globalThis.fetch = old.fetch; if(old.url === undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=old.url; if(old.key === undefined)delete process.env.SUPABASE_SERVICE_ROLE_KEY;else process.env.SUPABASE_SERVICE_ROLE_KEY=old.key; }
});
