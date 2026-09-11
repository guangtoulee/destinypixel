import assert from "node:assert/strict";
import test from "node:test";
import { createHash, pbkdf2Sync, randomBytes, randomUUID } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  assertSameOriginMemberMutation, enforceMemberAuthRateLimit, MemberAuthError,
  memberAuthDatabaseRequest, memberAuthErrorResponse, normalizeMemberEmail,
  readMemberAuthBody, validateMemberName, validateMemberPassword,
} from "./member-auth-security";

test("member auth preserves legacy users while enforcing durable sessions and one-use recovery", async () => {
  // All credentials, email addresses and rows below are synthetic; network is mocked.
  await mkdir(join(process.cwd(), "work"), { recursive: true });
  const directory = await mkdtemp(join(process.cwd(), "work", "member-auth-test-"));
  const file = join(directory, "members.json");
  Object.assign(process.env, {
    NODE_ENV: "test", VERCEL: "", SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_URL: "", SUPABASE_SERVICE_ROLE_KEY: "",
    DESTINY_MEMBER_LOCAL_STORE_ENABLED: "true", DESTINY_MEMBER_STORE_FILE: file,
    RESEND_API_KEY: "", DESTINY_AUTH_EMAIL_FROM: "", NEXT_PUBLIC_SITE_URL: "https://example.test",
  });
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;
  const calls: Array<{ url: string; body: Record<string, unknown> }> = [];
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    assert.equal(url, "https://api.resend.com/emails", "unexpected network call");
    calls.push({ url, body: JSON.parse(String(init?.body)) });
    return Response.json({ id: "synthetic-delivery" });
  };
  const legacyId = randomUUID();
  const legacyToken = randomBytes(32).toString("base64url");
  const salt = randomBytes(16).toString("base64url");
  const legacy = {
    id: legacyId, email: "legacy@example.test", email_normalized: "legacy@example.test", name: "Synthetic member",
    password_salt: salt, password_hash: pbkdf2Sync("oldpwd", salt, 120000, 32, "sha256").toString("base64url"),
    session_token_hash: createHash("sha256").update(legacyToken).digest("hex"),
    session_expires_at: new Date(Date.now() + 86400000).toISOString(), plan: "vip",
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  await writeFile(file, JSON.stringify({ members: [legacy], saved_reports: [] }));
  try {
    const auth = await import("./member-store");
    assert.equal((await auth.getDestinyMemberByToken(legacyToken))?.id, legacyId);
    const login = await auth.loginDestinyMember({ email: " LEGACY@example.test ", password: "oldpwd" });
    assert.equal(login.member.id, legacyId);
    assert.equal(login.member.plan, "vip");
    assert.equal("password_hash" in login.member, false);
    assert.equal(await auth.getDestinyMemberByToken(legacyToken), null);
    await auth.revokeDestinyMemberSession(login.token);
    assert.equal(await auth.getDestinyMemberByToken(login.token), null);
    await assert.rejects(auth.loginDestinyMember({ email: legacy.email, password: "wrong" }), (e: unknown) => e instanceof MemberAuthError && e.code === "LOGIN_INVALID");
    await assert.rejects(auth.registerDestinyMember({ email: "new@example.test", password: "short" }), (e: unknown) => e instanceof MemberAuthError && e.code === "PASSWORD_TOO_SHORT");

    Object.assign(process.env, { NODE_ENV: "production" });
    assert.equal(auth.isMemberStorePersistent(), false);
    await assert.rejects(auth.loginDestinyMember({ email: legacy.email, password: "oldpwd" }), (e: unknown) => e instanceof MemberAuthError && e.status === 503);
    Object.assign(process.env, { NODE_ENV: "test" });
    assert.equal(auth.getMemberAuthReadiness().passwordResetAvailable, false);
    await assert.rejects(auth.requestDestinyPasswordReset(legacy.email), (e: unknown) => e instanceof MemberAuthError && e.code === "PASSWORD_RESET_UNAVAILABLE");
    assert.equal(calls.length, 0);

    Object.assign(process.env, { RESEND_API_KEY: "re_synthetic_key", DESTINY_AUTH_EMAIL_FROM: "DestinyPixel <noreply@example.test>" });
    const active = await auth.loginDestinyMember({ email: legacy.email, password: "oldpwd" });
    const knownResult = await auth.requestDestinyPasswordReset(legacy.email);
    const unknownResult = await auth.requestDestinyPasswordReset("missing@example.test");
    assert.deepEqual(knownResult, unknownResult);
    assert.equal(calls.length, 1);
    const url = new URL(String(calls[0].body.text).split("\n")[1]);
    const resetToken = url.searchParams.get("reset")!;
    assert.equal(url.origin, "https://example.test");
    assert.ok(resetToken);
    assert.equal((await readFile(file, "utf8")).includes(resetToken), false);
    const attempts = await Promise.allSettled([
      auth.resetDestinyMemberPassword({ token: resetToken, password: "new-password-1" }),
      auth.resetDestinyMemberPassword({ token: resetToken, password: "new-password-1" }),
    ]);
    assert.equal(attempts.filter((result) => result.status === "fulfilled").length, 1);
    assert.equal(attempts.filter((result) => result.status === "rejected").length, 1);
    assert.equal(await auth.getDestinyMemberByToken(active.token), null);
    const verified = await auth.findDestinyMemberByEmail(legacy.email);
    assert.ok(verified?.email_verified_at);
    assert.equal((await auth.loginDestinyMember({ email: legacy.email, password: "new-password-1" })).member.id, legacyId);
    await assert.rejects(auth.loginDestinyMember({ email: legacy.email, password: "oldpwd" }));

    await auth.requestDestinyPasswordReset(legacy.email);
    const expiredToken = new URL(String(calls[1].body.text).split("\n")[1]).searchParams.get("reset")!;
    const store = JSON.parse(await readFile(file, "utf8"));
    for (const token of store.password_resets) token.expires_at = "2000-01-01T00:00:00.000Z";
    await writeFile(file, JSON.stringify(store));
    await assert.rejects(auth.resetDestinyMemberPassword({ token: expiredToken, password: "another-password" }), (e: unknown) => e instanceof MemberAuthError && e.code === "INVALID_RESET_TOKEN");

    globalThis.fetch = async () => new Response("synthetic provider error", { status: 503 });
    console.warn = () => undefined;
    assert.deepEqual(await auth.requestDestinyPasswordReset(legacy.email), unknownResult);

    Object.assign(process.env, { SUPABASE_URL: "https://database.example.test", SUPABASE_SERVICE_ROLE_KEY: "synthetic-service-key", NODE_ENV: "production" });
    const rpcCalls: string[] = [];
    globalThis.fetch = async (input, init) => {
      assert.equal(String(input), "https://database.example.test/rest/v1/rpc/destiny_auth_consume_rate_limit");
      const body = JSON.parse(String(init?.body));
      assert.match(body.p_key, /^[a-f0-9]{64}$/);
      assert.equal(String(init?.body).includes(legacy.email), false);
      rpcCalls.push(body.p_key);
      return Response.json([{ allowed: true, retry_after: 10 }]);
    };
    const req = new Request("https://example.test/api/members/auth/login", { method: "POST", headers: { origin: "https://example.test", "x-forwarded-for": "192.0.2.4" } });
    await enforceMemberAuthRateLimit(req, "login", legacy.email);
    assert.equal(rpcCalls.length, 2);
    globalThis.fetch = async () => Response.json([{ allowed: false, retry_after: 19 }]);
    await assert.rejects(enforceMemberAuthRateLimit(req, "login", legacy.email), (e: unknown) => e instanceof MemberAuthError && e.status === 429 && e.retryAfter === 19);
    globalThis.fetch = async (input, init) => {
      if (init?.method === "GET") return Response.json([legacy]);
      // A concurrent reset changed the password after verification: no session may be created.
      assert.equal(new URL(String(input)).searchParams.get("password_hash"), `eq.${legacy.password_hash}`);
      return Response.json([]);
    };
    await assert.rejects(auth.loginDestinyMember({ email: legacy.email, password: "oldpwd" }), (e: unknown) => e instanceof MemberAuthError && e.status === 503);
    globalThis.fetch = async () => new Response("synthetic private database detail", { status: 500 });
    await assert.rejects(memberAuthDatabaseRequest("destiny_members"), (e: unknown) => e instanceof MemberAuthError && !e.message.includes("private"));
    assert.equal((await memberAuthErrorResponse(new Error("private database detail")).text()).includes("private database detail"), false);
  } finally {
    globalThis.fetch = originalFetch;
    console.warn = originalWarn;
    await rm(directory, { recursive: true, force: true });
  }
});

test("auth accepts only bounded valid input and same-origin JSON mutations", async () => {
  assert.equal(normalizeMemberEmail(" User+test@Example.test "), "user+test@example.test");
  for (const email of ["a..b@example.test", "user@-example.test", "user@example", "x".repeat(300), 1]) assert.throws(() => normalizeMemberEmail(email));
  assert.throws(() => validateMemberPassword("x".repeat(129)));
  assert.throws(() => validateMemberName("x".repeat(101)));
  assert.doesNotThrow(() => validateMemberPassword("oldpwd"));
  const request = (origin: string) => new Request("https://example.test/api/members/auth/login", { method: "POST", headers: { origin } });
  assert.doesNotThrow(() => assertSameOriginMemberMutation(request("https://example.test")));
  assert.throws(() => assertSameOriginMemberMutation(request("https://evil.test")));
  assert.throws(() => assertSameOriginMemberMutation(new Request("https://example.test", { method: "POST" })));
  await assert.rejects(readMemberAuthBody(new Request("https://example.test", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: "x".repeat(9000) }) })), (e: unknown) => e instanceof MemberAuthError && e.status === 413);
});
