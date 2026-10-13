import assert from "node:assert/strict";
import { after, test } from "node:test";
import { NextRequest } from "next/server";
import { OCEAN_COOKIE_NAME, OCEAN_SESSION_TTL, createOceanSession, isOceanAccessConfigured, verifyOceanPassword, verifyOceanSession } from "./ocean-access";
import { proxy } from "../proxy";
import { POST } from "../app/ocean/auth/route";

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
  assert.equal(verifyOceanPassword(testPassword), true);
  assert.equal(verifyOceanPassword("wrong"), false);
  assert.equal(verifyOceanPassword(""), false);
  assert.equal(verifyOceanPassword("x".repeat(257)), false);
});

test("session expires and rejects tampering, future issuance and configuration changes", () => {
  const now = 1_800_000_000_000;
  const token = createOceanSession(now);
  assert.equal(verifyOceanSession(token, now), true);
  assert.equal(verifyOceanSession(token, now + (OCEAN_SESSION_TTL - 1) * 1000), true);
  assert.equal(verifyOceanSession(token, now + OCEAN_SESSION_TTL * 1000), false);
  assert.equal(verifyOceanSession(token, now - 31_000), false);
  assert.equal(verifyOceanSession(token.slice(0, -1) + (token.endsWith("0") ? "1" : "0"), now), false);
  assert.equal(verifyOceanSession("v1.1800000000." + "a".repeat(32) + "." + "0".repeat(64), now), false);
  process.env.BLENDER_ACCESS_PASSWORD = "changed-password";
  assert.equal(verifyOceanSession(token, now), false);
  process.env.BLENDER_ACCESS_PASSWORD = testPassword;
  process.env.BLENDER_SESSION_SECRET = testSecret + "rotated";
  assert.equal(verifyOceanSession(token, now), false);
  process.env.BLENDER_SESSION_SECRET = testSecret;
});

test("missing private configuration always fails closed", () => {
  const token = createOceanSession();
  delete process.env.BLENDER_ACCESS_PASSWORD;
  assert.equal(isOceanAccessConfigured(), false);
  assert.equal(verifyOceanSession(token), false);
  assert.equal(verifyOceanPassword(testPassword), false);
  assert.throws(() => createOceanSession());
  process.env.BLENDER_ACCESS_PASSWORD = testPassword;
  delete process.env.BLENDER_SESSION_SECRET;
  assert.equal(isOceanAccessConfigured(), false);
  assert.equal(verifyOceanSession(token), false);
  process.env.BLENDER_SESSION_SECRET = testSecret;
});

test("GET and HEAD protect all model files, including encoded direct URLs, renders and PDF", () => {
  for (const method of ["GET", "HEAD"]) {
    for (const path of ["/ocean/presentation.html", "/ocean/media/museum.glb", "/ocean/media/render.jpg", "/ocean/media/proposal.pdf", "/ocean/media/manifest.json", "/%6fcean/assets/museum.glb"]) {
      const response = proxy(new NextRequest(`https://www.destinypixel.com${path}`, { method }));
      assert.equal(response.status, 401, `${method} ${path}`);
      assert.match(response.headers.get("cache-control") || "", /private, no-store/);
    }
  }
  const redirect = proxy(new NextRequest("https://www.destinypixel.com/ocean"));
  assert.equal(redirect.status, 307);
  assert.equal(redirect.headers.get("location"), "https://www.destinypixel.com/ocean/access");
  assert.equal(proxy(new NextRequest("https://www.destinypixel.com/ocean/access")).status, 200);
  assert.equal(proxy(new NextRequest("https://www.destinypixel.com/ocean/auth")).status, 200);
});

test("valid cookies pass model requests while other site routing is preserved", () => {
  const response = proxy(new NextRequest("https://www.destinypixel.com/ocean/media/museum.glb", {
    headers: { Cookie: `${OCEAN_COOKIE_NAME}=${createOceanSession()}` },
  }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-middleware-next"), "1");
  assert.match(response.headers.get("cache-control") || "", /private, no-store/);
  const rewrite = proxy(new NextRequest("https://zhangshengjun.org/", { headers: { host: "zhangshengjun.org" } }));
  assert.equal(rewrite.headers.get("x-middleware-rewrite"), "https://zhangshengjun.org/zhangshengjun");
  assert.equal(proxy(new NextRequest("https://www.destinypixel.com/tarot")).headers.get("x-middleware-next"), "1");
});

test("private posters cannot be read through the Next.js image optimizer", () => {
  for (const path of ["/ocean/media/poster.jpg", "/%6fcean/assets/poster.jpg", "https://www.destinypixel.com/ocean/media/poster.jpg"]) {
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
  return new NextRequest("https://www.destinypixel.com/ocean/auth", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/x-www-form-urlencoded", "x-forwarded-for": "127.0.0.1" },
    body: new URLSearchParams({ password }),
  });
}

test("login rejects wrong passwords and cross-site submissions without cookies", async () => {
  const wrong = await POST(loginRequest("wrong"));
  assert.equal(wrong.status, 303);
  assert.equal(wrong.headers.get("set-cookie"), null);
  assert.equal(wrong.headers.get("location"), "/ocean/access?error=invalid");
  const crossSite = await POST(loginRequest(testPassword, "https://another.example"));
  assert.equal(crossSite.headers.get("set-cookie"), null);
  assert.equal(crossSite.headers.get("location"), "/ocean/access?error=origin");
});

test("correct password creates a scoped signed HttpOnly session", async () => {
  const response = await POST(loginRequest(testPassword));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "/ocean");
  const cookie = response.headers.get("set-cookie") || "";
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=lax/i);
  assert.match(cookie, /Path=\/ocean/i);
  assert.match(cookie, /Max-Age=604800/i);
  assert.equal(cookie.includes(testPassword), false);
  assert.equal(verifyOceanSession(response.cookies.get(OCEAN_COOKIE_NAME)?.value), true);
});

test("login uses the public Host or forwarded origin behind a reverse proxy", async () => {
  const cases: Record<string, string>[] = [
    { Host: "127.0.0.1:4188", Origin: "http://127.0.0.1:4188" },
    { Host: "localhost:4188", Origin: "https://www.destinypixel.com", "x-forwarded-host": "www.destinypixel.com", "x-forwarded-proto": "https" },
  ];
  for (const headers of cases) {
    const request = new NextRequest("http://localhost:4188/ocean/auth", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ password: testPassword }),
    });
    const response = await POST(request);
    assert.equal(response.headers.get("location"), "/ocean");
    assert.equal(verifyOceanSession(response.cookies.get(OCEAN_COOKIE_NAME)?.value), true);
  }
  const wrongProtocol = new NextRequest("http://localhost:4188/ocean/auth", {
    method: "POST",
    headers: { Host: "localhost:4188", Origin: "http://www.destinypixel.com", "x-forwarded-host": "www.destinypixel.com", "x-forwarded-proto": "https", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ password: testPassword }),
  });
  assert.equal((await POST(wrongProtocol)).headers.get("location"), "/ocean/access?error=origin");
});


test("museum cookies do not grant access to the other path", () => {
  const token = createOceanSession();
  const ocean = proxy(new NextRequest("https://www.destinypixel.com/ocean/media/museum.glb", { headers: { Cookie: `blender_access=${token}` } }));
  assert.equal(ocean.status, 401);
  const blender = proxy(new NextRequest("https://www.destinypixel.com/blender/assets/museum.glb", { headers: { Cookie: `${OCEAN_COOKIE_NAME}=${token}` } }));
  assert.equal(blender.status, 401);
});


test("decoded static traversal aliases stay private, including excluded prefixes", () => {
  for (const path of ["/foo/..%2focean/media/manifest.json", "/api/..%2focean/media/manifest.json", "/_next/static/..%2f..%2focean/media/manifest.json", "/robots.txt/..%2focean/media/manifest.json", "/x/..%2fblender/viewer.html", "/foo/..%5cocean/media/manifest.json", "/foo/..%252focean/media/manifest.json"]) {
    const response = proxy(new NextRequest(`https://www.destinypixel.com${path}`));
    assert.equal(response.status, 401, path);
    assert.match(response.headers.get("cache-control") || "", /private, no-store/);
  }
  const image = new URL("https://www.destinypixel.com/_next/image");
  image.searchParams.set("url", "/foo/..%2focean/media/render.png"); image.searchParams.set("w", "640"); image.searchParams.set("q", "75");
  assert.equal(proxy(new NextRequest(image)).status, 401);
});
