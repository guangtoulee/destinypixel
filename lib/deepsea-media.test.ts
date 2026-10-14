import assert from "node:assert/strict";
import { after, test } from "node:test";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { proxy } from "../proxy";
import { POST } from "../app/ocean/auth/route";
import { GET, HEAD } from "../app/ocean/deepsea/media/[...path]/route";
import { OCEAN_COOKIE_NAME, createOceanSession } from "./ocean-access";
import { DEEPSEA_BLOB_PREFIX, deepseaMediaKey } from "./deepsea-media";

const directory = mkdtempSync(path.join(tmpdir(), "deepsea-media-test-"));
const envKeys = ["BLENDER_ACCESS_PASSWORD", "BLENDER_SESSION_SECRET", "DEEPSEA_MEDIA_LOCAL_DIR", "VERCEL"];
const saved = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));
process.env.BLENDER_ACCESS_PASSWORD = "deepsea-fixture-password";
process.env.BLENDER_SESSION_SECRET = "deepsea-fixture-session-secret-at-least-32-chars";
process.env.DEEPSEA_MEDIA_LOCAL_DIR = directory;
delete process.env.VERCEL;
writeFileSync(path.join(directory, "fixture.json"), "0123456789");
after(() => {
  for (const key of envKeys) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
  rmSync(directory, { recursive: true, force: true });
});

test("deepsea entry redirects to its own destination and protects nested resources", () => {
  const entry = proxy(new NextRequest("https://www.destinypixel.com/ocean/deepsea"));
  assert.equal(entry.headers.get("location"), "https://www.destinypixel.com/ocean/access?next=deepsea");
  for (const target of ["/ocean/deepsea/presentation.html", "/ocean/deepsea/media/fixture.json", "/ocean/deepsea/assets/viewer.js", "/_next/static/..%2f..%2focean/deepsea/media/fixture.json"]) {
    const denied = proxy(new NextRequest("https://www.destinypixel.com" + target));
    assert.equal(denied.status, 401, target);
    assert.match(denied.headers.get("cache-control") || "", /private, no-store/);
  }
});

test("login keeps the chosen museum and ignores arbitrary redirect destinations", async () => {
  const login = (next: string, password: string) => POST(new NextRequest("https://www.destinypixel.com/ocean/auth?next=" + encodeURIComponent(next), {
    method: "POST",
    headers: { Origin: "https://www.destinypixel.com", "Content-Type": "application/x-www-form-urlencoded", "x-forwarded-for": next },
    body: new URLSearchParams({ password }),
  }));
  assert.equal((await login("deepsea", "wrong")).headers.get("location"), "/ocean/access?error=invalid&next=deepsea");
  const accepted = await login("deepsea", "deepsea-fixture-password");
  assert.equal(accepted.headers.get("location"), "/ocean/deepsea");
  assert.equal(accepted.cookies.get(OCEAN_COOKIE_NAME)?.path, "/ocean");
  assert.equal((await login("https://untrusted.example", "deepsea-fixture-password")).headers.get("location"), "/ocean");
});

test("deepsea storage is isolated and rejects path traversal", () => {
  assert.equal(deepseaMediaKey(["manifest.json"]), DEEPSEA_BLOB_PREFIX + "manifest.json");
  assert.equal(deepseaMediaKey(["assets", "a".repeat(64), "展馆.glb"]), DEEPSEA_BLOB_PREFIX + "assets/" + "a".repeat(64) + "/展馆.glb");
  for (const segments of [["..", "manifest.json"], ["assets", "bad", "x.glb"], ["%2e%2e"], ["x/y"], ["x\\y"], ["assets", "a".repeat(64), "../x.glb"]]) {
    assert.equal(deepseaMediaKey(segments), null);
  }
});

test("media handler independently enforces access and serves exact ranges", async () => {
  const context = { params: Promise.resolve({ path: ["fixture.json"] }) };
  const request = (authenticated: boolean, range?: string) => new NextRequest("https://www.destinypixel.com/ocean/deepsea/media/fixture.json", {
    headers: { ...(authenticated ? { Cookie: `${OCEAN_COOKIE_NAME}=${createOceanSession()}` } : {}), ...(range ? { Range: range } : {}) },
  });
  const denied = await GET(request(false), context);
  assert.equal(denied.status, 401);
  const complete = await GET(request(true), context);
  assert.equal(await complete.text(), "0123456789");
  const partial = await GET(request(true, "bytes=2-5"), context);
  assert.equal(partial.status, 206);
  assert.equal(partial.headers.get("content-range"), "bytes 2-5/10");
  assert.equal(await partial.text(), "2345");
  const headers = await HEAD(request(true), context);
  assert.equal(headers.headers.get("content-length"), "10");
  assert.equal((await GET(request(true, "bytes=10-"), context)).status, 416);
});
