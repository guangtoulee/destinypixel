import assert from "node:assert/strict";
import { after, test } from "node:test";
import { NextRequest } from "next/server";
import { BLENDER_COOKIE_NAME, BLENDER_SESSION_TTL, createBlenderSession, isBlenderAccessConfigured, verifyBlenderPassword, verifyBlenderSession } from "./blender-access";
import { proxy } from "../proxy";
import { POST } from "../app/blender/auth/route";

const previousPassword = process.env.BLENDER_ACCESS_PASSWORD;
const previousSecret = process.env.BLENDER_SESSION_SECRET;
const testPassword = "local-test-access-password";
const testSecret = "local-test-signing-key-with-at-least-32-characters";
process.env.BLENDER_ACCESS_PASSWORD = testPassword;
process.env.BLENDER_SESSION_SECRET = testSecret;
after(() => {
  if (previousPassword === undefined) delete process.env.BLENDER_ACCESS_PASSWORD;
  else process.env.BLENDER_ACCESS_PASSWORD = previousPassword;
  if (previousSecret === undefined) delete process.env.BLENDER_SESSION_SECRET;
  else process.env.BLENDER_SESSION_SECRET = previousSecret;
});

test("only the configured password passes", () => {
  assert.equal(verifyBlenderPassword(testPassword), true);
  assert.equal(verifyBlenderPassword("wrong"), false);
  assert.equal(verifyBlenderPassword(""), false);
  assert.equal(verifyBlenderPassword("x".repeat(257)), false);
});

test("session expires and rejects tampering, future issuance and configuration changes", () => {
  const now = 1_800_000_000_000;
  const token = createBlenderSession(now);
  assert.equal(verifyBlenderSession(token, now), true);
  assert.equal(verifyBlenderSession(token, now + (BLENDER_SESSION_TTL - 1) * 1000), true);
  assert.equal(verifyBlenderSession(token, now + BLENDER_SESSION_TTL * 1000), false);
  assert.equal(verifyBlenderSession(token, now - 31_000), false);
  assert.equal(verifyBlenderSession(token.slice(0, -1) + (token.endsWith("0") ? "1" : "0"), now), false);
  assert.equal(verifyBlenderSession("v1.1800000000." + "a".repeat(32) + "." + "0".repeat(64), now), false);
  process.env.BLENDER_ACCESS_PASSWORD = "changed-password";
  assert.equal(verifyBlenderSession(token, now), false);
  process.env.BLENDER_ACCESS_PASSWORD = testPassword;
  process.env.BLENDER_SESSION_SECRET = testSecret + "rotated";
  assert.equal(verifyBlenderSession(token, now), false);
  process.env.BLENDER_SESSION_SECRET = testSecret;
});

test("missing private configuration always fails closed", () => {
  const token = createBlenderSession();
  delete process.env.BLENDER_ACCESS_PASSWORD;
  assert.equal(isBlenderAccessConfigured(), false);
  assert.equal(verifyBlenderSession(token), false);
  assert.equal(verifyBlenderPassword(testPassword), false);
  assert.throws(() => createBlenderSession());
  process.env.BLENDER_ACCESS_PASSWORD = testPassword;
  delete process.env.BLENDER_SESSION_SECRET;
  assert.equal(isBlenderAccessConfigured(), false);
  assert.equal(verifyBlenderSession(token), false);
  process.env.BLENDER_SESSION_SECRET = testSecret;
});

test("GET and HEAD protect all model files, including encoded direct URLs", () => {
  for (const method of ["GET", "HEAD"]) {
    for (const path of ["/blender/viewer.html", "/blender/assets/museum.glb", "/blender/assets/views.json", "/%62lender/assets/museum.glb"]) {
      const response = proxy(new NextRequest(`https://www.destinypixel.com${path}`, { method }));
      assert.equal(response.status, 401, `${method} ${path}`);
      assert.match(response.headers.get("cache-control") || "", /private, no-store/);
    }
  }
  const redirect = proxy(new NextRequest("https://www.destinypixel.com/blender"));
  assert.equal(redirect.status, 307);
  assert.equal(redirect.headers.get("location"), "https://www.destinypixel.com/blender/access");
  assert.equal(proxy(new NextRequest("https://www.destinypixel.com/blender/access")).status, 200);
  assert.equal(proxy(new NextRequest("https://www.destinypixel.com/blender/auth")).status, 200);
});

test("valid cookies pass model requests while other site routing is preserved", () => {
  const response = proxy(new NextRequest("https://www.destinypixel.com/blender/assets/museum.glb", {
    headers: { Cookie: `${BLENDER_COOKIE_NAME}=${createBlenderSession()}` },
  }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-middleware-next"), "1");
  assert.match(response.headers.get("cache-control") || "", /private, no-store/);
  const rewrite = proxy(new NextRequest("https://zhangshengjun.org/", { headers: { host: "zhangshengjun.org" } }));
  assert.equal(rewrite.headers.get("x-middleware-rewrite"), "https://zhangshengjun.org/zhangshengjun");
  assert.equal(proxy(new NextRequest("https://www.destinypixel.com/tarot")).headers.get("x-middleware-next"), "1");
});

test("private posters cannot be read through the Next.js image optimizer", () => {
  for (const path of ["/blender/assets/poster.jpg", "/%62lender/assets/poster.jpg", "https://www.destinypixel.com/blender/assets/poster.jpg"]) {
    const url = new URL("https://www.destinypixel.com/_next/image");
    url.searchParams.set("url", path);
    url.searchParams.set("w", "640");
    url.searchParams.set("q", "75");
    const response = proxy(new NextRequest(url));
    assert.equal(response.status, 401);
    assert.match(response.headers.get("cache-control") || "", /private, no-store/);
  }
  const publicImage = proxy(new NextRequest("https://www.destinypixel.com/_next/image?url=%2Farchetypes%2Fexample.jpg&w=640&q=75"));
  assert.equal(publicImage.headers.get("x-middleware-next"), "1");
});

function loginRequest(password: string, origin = "https://www.destinypixel.com") {
  return new NextRequest("https://www.destinypixel.com/blender/auth", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/x-www-form-urlencoded", "x-forwarded-for": "127.0.0.1" },
    body: new URLSearchParams({ password }),
  });
}

test("login rejects wrong passwords and cross-site submissions without cookies", async () => {
  const wrong = await POST(loginRequest("wrong"));
  assert.equal(wrong.status, 303);
  assert.equal(wrong.headers.get("set-cookie"), null);
  assert.equal(wrong.headers.get("location"), "/blender/access?error=invalid");
  const crossSite = await POST(loginRequest(testPassword, "https://another.example"));
  assert.equal(crossSite.headers.get("set-cookie"), null);
  assert.equal(crossSite.headers.get("location"), "/blender/access?error=origin");
});

test("correct password creates a scoped signed HttpOnly session", async () => {
  const response = await POST(loginRequest(testPassword));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "/blender");
  const cookie = response.headers.get("set-cookie") || "";
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=lax/i);
  assert.match(cookie, /Path=\/blender/i);
  assert.match(cookie, /Max-Age=604800/i);
  assert.equal(cookie.includes(testPassword), false);
  assert.equal(verifyBlenderSession(response.cookies.get(BLENDER_COOKIE_NAME)?.value), true);
});

test("login uses the public Host or forwarded origin behind a reverse proxy", async () => {
  const cases: Record<string, string>[] = [
    { Host: "127.0.0.1:4188", Origin: "http://127.0.0.1:4188" },
    { Host: "localhost:4188", Origin: "https://www.destinypixel.com", "x-forwarded-host": "www.destinypixel.com", "x-forwarded-proto": "https" },
  ];
  for (const headers of cases) {
    const request = new NextRequest("http://localhost:4188/blender/auth", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ password: testPassword }),
    });
    const response = await POST(request);
    assert.equal(response.headers.get("location"), "/blender");
    assert.equal(verifyBlenderSession(response.cookies.get(BLENDER_COOKIE_NAME)?.value), true);
  }
  const wrongProtocol = new NextRequest("http://localhost:4188/blender/auth", {
    method: "POST",
    headers: { Host: "localhost:4188", Origin: "http://www.destinypixel.com", "x-forwarded-host": "www.destinypixel.com", "x-forwarded-proto": "https", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ password: testPassword }),
  });
  assert.equal((await POST(wrongProtocol)).headers.get("location"), "/blender/access?error=origin");
});
