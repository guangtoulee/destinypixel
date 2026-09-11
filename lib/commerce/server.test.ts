import assert from "node:assert/strict";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import test from "node:test";
import type { ReportOrder } from "./orders";
import type { PaypalCapture, PaypalOrder } from "./paypal-validation";

test("commerce server routes authorize persisted reports and verified provider evidence", async (t) => {
  // Only Next's request cookie binding and external fetch are replaced. The
  // access, auth, pricing, provider adapter, generation and route code are real.
  // This file uses tsx's CommonJS loader so production code needs no test hooks.
  const require = createRequire(import.meta.url);
  const runtimeModule = require("node:module") as { _load: (name: string, parent: unknown, isMain: boolean) => unknown };
  const originalLoad = runtimeModule._load;
  const originalFetch = globalThis.fetch;
  const testEnv = {
    NODE_ENV: "test", VERCEL: "", VERCEL_ENV: "preview",
    SUPABASE_URL: "https://database.example.test", NEXT_PUBLIC_SUPABASE_URL: "", SUPABASE_SERVICE_ROLE_KEY: "synthetic-service-key",
    DESTINY_MEMBER_LOCAL_STORE_ENABLED: "false", DESTINY_PAID_REPORTS_ENABLED: "true", DESTINY_REPORT_PRICE_USD: "1.99",
    PAYPAL_MODE: "sandbox", PAYPAL_CLIENT_ID: "synthetic-client", PAYPAL_CLIENT_SECRET: "synthetic-secret", PAYPAL_WEBHOOK_ID: "synthetic-webhook", PAYPAL_MERCHANT_ID: "MERCHANT123",
    DEEPSEEK_API_KEY: "synthetic-model-key", DEEPSEEK_API_URL: "https://model.example.test/chat", NEXT_PUBLIC_SITE_URL: "https://site.example.test",
    DESTINY_ADMIN_MEMBER_IDS: "", DESTINY_ADMIN_EMAILS: "", AUTH_RATE_LIMIT_SECRET: "synthetic-rate-secret",
  };
  const oldEnv = Object.fromEntries(Object.keys(testEnv).map(key => [key, process.env[key]]));
  Object.assign(process.env, testEnv);
  const cookieJar = new Map<string, string>();
  runtimeModule._load = (name, parent, isMain) => {
    if (name === "server-only") return {};
    if (name === "next/headers") return { cookies: async () => ({ get: (key: string) => cookieJar.has(key) ? { name: key, value: cookieJar.get(key)! } : undefined }) };
    return originalLoad(name, parent, isMain);
  };
  const reportId = randomUUID();
  const memberId = randomUUID();
  const otherMemberId = randomUUID();
  const orderId = randomUUID();
  const userId = randomUUID();
  const birthId = randomUUID();
  const memberToken = randomBytes(32).toString("base64url");
  const otherToken = randomBytes(32).toString("base64url");
  const guestToken = randomBytes(32).toString("base64url");
  const hash = (value: string) => createHash("sha256").update(value).digest("hex");
  const members = [memberId, otherMemberId].map((id, i) => ({ id, email: `synthetic-${i}@example.test`, email_normalized: `synthetic-${i}@example.test`, email_verified_at: null as string | null, name: "Synthetic member", password_salt: "s".repeat(22), password_hash: "p".repeat(43), session_token_hash: hash(i ? otherToken : memberToken), session_expires_at: new Date(Date.now() + 86400000).toISOString(), plan: "free", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }));
  const rawReport = { id: reportId, user_id: userId, birth_record_id: birthId, created_at: new Date().toISOString(), status: "ai_pending", bazi_data: {}, astro_data: { sunSign: "aries", sunSignCn: "白羊座", placements: [], majorAspects: [] }, ai_content: { meta: { provider: "initial", gender: "female" } } };
  const birth = { id: birthId, user_id: userId, name: "Persisted Synthetic Birth", gender: "female", locale: "zh", birth_date: "1990-01-01", birth_time: "12:00:00", birth_place: "Synthetic City", latitude: 30, longitude: 120, timezone: "Asia/Shanghai", true_solar_time: "12:00" };
  const baseOrder: ReportOrder = { id: orderId, report_id: reportId, member_id: memberId, paypal_order_id: "PAYPAL123", capture_id: null, amount_cents: 199, currency: "USD", mode: "sandbox", status: "created", created_at: new Date().toISOString() };
  type AccessRow = { report_id: string; member_id: string | null; guest_token_hash: string | null; guest_expires_at: string | null };
  type Call = { url: URL; method: string; body: Record<string, unknown>; headers: Headers };
  let accessRow: AccessRow;
  let orders: ReportOrder[];
  let providerOrder: PaypalOrder;
  let createdProviderOrder: PaypalOrder | undefined;
  let providerGetFailure: "not_found" | "timeout" | "server_error" | null;
  let replacementOrder: ReportOrder;
  let replacementSucceeds: boolean;
  let providerCapture: PaypalCapture;
  let lease: { state: string; id?: string; leaseToken?: string; content?: string };
  let claimSucceeds: boolean;
  let finishSucceeds: boolean;
  let paymentResult: boolean;
  let signatureValid: boolean;
  let modelContent: string;
  let modelFinishReason: string;
  let onModelCall: (() => void) | undefined;
  const calls: Call[] = [];
  const unexpected: string[] = [];
  const generationContent = ["DAY_MASTER", "OUTER_PERSONA", "DEEP_SELF", "CAREER", "LOVE", "GROWTH", "HEALTH"].map(marker => `[${marker}] ${"Synthetic interpretation. ".repeat(4)}`).join("\n").trim();
  function reset() {
    Object.assign(process.env, testEnv);
    members.forEach(member => { member.plan = "free"; member.email_verified_at = null; });
    cookieJar.clear();
    calls.length = 0;
    accessRow = { report_id: reportId, member_id: memberId, guest_token_hash: null, guest_expires_at: null };
    orders = [];
    providerCapture = { id: "CAPTURE123", status: "COMPLETED", amount: { value: "1.99", currency_code: "USD" }, supplementary_data: { related_ids: { order_id: "PAYPAL123" } } };
    providerOrder = { id: "PAYPAL123", status: "COMPLETED", purchase_units: [{ custom_id: orderId, payee: { merchant_id: "MERCHANT123" }, amount: { value: "1.99", currency_code: "USD" }, payments: { captures: [structuredClone(providerCapture)] } }], links: [{ rel: "approve", href: "https://www.sandbox.paypal.com/checkoutnow?token=PAYPAL123" }] };
    createdProviderOrder = undefined;
    providerGetFailure = null;
    replacementOrder = { ...baseOrder, id: randomUUID(), paypal_order_id: null, created_at: new Date().toISOString() };
    replacementSucceeds = true;
    lease = { state: "claimed", id: randomUUID(), leaseToken: randomUUID() };
    claimSucceeds = true;
    finishSucceeds = true;
    paymentResult = true;
    signatureValid = true;
    modelContent = generationContent;
    modelFinishReason = "stop";
    onModelCall = undefined;
  }
  const signIn = (other = false) => cookieJar.set("dp_member_session", other ? otherToken : memberToken);
  function setGuest(expiry: string | null = new Date(Date.now() + 60000).toISOString()) {
    accessRow = { report_id: reportId, member_id: null, guest_token_hash: hash(guestToken), guest_expires_at: expiry };
    cookieJar.set(`dp_report_access_${reportId}`, guestToken);
  }
  function unlock(mode: "live" | "sandbox" = "sandbox") {
    orders = [{ ...baseOrder, mode, status: "completed", capture_id: "CAPTURE123" }];
  }
  const privateReads = () => calls.filter(call => /\/rest\/v1\/(reports|users|birth_records)$/.test(call.url.pathname));
  const paymentCalls = () => calls.filter(call => call.url.pathname.endsWith("/rpc/destiny_apply_payment"));
  const modelCalls = () => calls.filter(call => call.url.hostname === "model.example.test");
  const request = (path: string, body: Record<string, unknown>, origin = "https://site.example.test") => new Request(`https://site.example.test${path}`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(body) });
  function matches(row: Record<string, unknown>, search: URLSearchParams) {
    for (const [key, value] of search) {
      if (value.startsWith("eq.") && String(row[key]) !== value.slice(3)) return false;
    }
    return true;
  }
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input));
    const method = init?.method || "GET";
    const body = typeof init?.body === "string" && init.body.startsWith("{") ? JSON.parse(init.body) as Record<string, unknown> : {};
    const headers = new Headers(init?.headers);
    calls.push({ url, method, body, headers });
    if (url.hostname === "database.example.test") {
      assert.equal(headers.get("authorization"), "Bearer synthetic-service-key");
      const resource = url.pathname.replace("/rest/v1/", "");
      if (method === "GET") {
        if (resource === "destiny_members") return Response.json(members.filter(row => matches(row, url.searchParams)));
        if (resource === "destiny_report_access") return Response.json(matches(accessRow, url.searchParams) ? [accessRow] : []);
        if (resource === "reports") return Response.json(matches(rawReport, url.searchParams) ? [rawReport] : []);
        if (resource === "users") return Response.json([{ id: userId, name: birth.name, email: null }]);
        if (resource === "birth_records") return Response.json([birth]);
        if (resource === "destiny_report_orders") return Response.json(orders.filter(row => matches(row, url.searchParams)));
      }
      if (resource === "rpc/destiny_claim_report") {
        if (claimSucceeds) accessRow = { ...accessRow, member_id: String(body.p_member), guest_token_hash: null, guest_expires_at: null };
        return Response.json(claimSucceeds);
      }
      if (resource === "rpc/destiny_auth_consume_rate_limit") return Response.json([{ allowed: true, retry_after: 1 }]);
      if (resource === "rpc/destiny_admin_counts") return Response.json({ members: 2, reports: 1, paidOrders: 0, pendingOrders: 0, revenue: [] });
      if (resource === "rpc/destiny_begin_checkout") return Response.json(orders[0] || { ...baseOrder, paypal_order_id: null });
      if (resource === "rpc/destiny_replace_voided_checkout") return replacementSucceeds ? Response.json(replacementOrder) : Response.json({ message: "checkout replacement denied" }, { status: 400 });
      if (resource === "rpc/destiny_prepare_capture") {
        const row = orders.find(order => order.id === body.p_order && order.member_id === body.p_member);
        assert.ok(row);
        if (row.status === "created") row.status = "pending";
        return Response.json(row);
      }
      if (resource === "rpc/destiny_apply_payment") return Response.json(paymentResult);
      if (resource === "rpc/destiny_claim_generation") return Response.json(lease);
      if (resource === "destiny_report_generations" && method === "PATCH") return Response.json(finishSucceeds ? [{ id: lease.id }] : []);
      if ((resource === "destiny_report_orders" || resource === "reports") && method === "PATCH") return Response.json([]);
    }
    if (url.hostname === "api-m.sandbox.paypal.com") {
      if (url.pathname === "/v1/oauth2/token") return Response.json({ access_token: "synthetic-oauth" });
      assert.equal(headers.get("authorization"), "Bearer synthetic-oauth");
      if (url.pathname === "/v1/notifications/verify-webhook-signature") return Response.json({ verification_status: signatureValid ? "SUCCESS" : "FAILURE" });
      if (url.pathname === "/v2/checkout/orders") return Response.json(createdProviderOrder ?? providerOrder);
      if (url.pathname === "/v2/checkout/orders/PAYPAL123") {
        if (providerGetFailure === "not_found") return Response.json({ name: "RESOURCE_NOT_FOUND" }, { status: 404 });
        if (providerGetFailure === "server_error") return Response.json({ name: "INTERNAL_SERVER_ERROR" }, { status: 500 });
        if (providerGetFailure === "timeout") throw new DOMException("Synthetic timeout", "TimeoutError");
        return Response.json(providerOrder);
      }
      if (url.pathname === "/v2/checkout/orders/PAYPAL123/capture") {
        providerOrder.status = "COMPLETED";
        providerOrder.purchase_units![0].payments = { captures: [structuredClone(providerCapture)] };
        return Response.json(providerOrder);
      }
      if (url.pathname === "/v2/payments/captures/CAPTURE123") return Response.json(providerCapture);
    }
    if (url.hostname === "model.example.test") {
      onModelCall?.();
      return Response.json({ choices: [{ finish_reason: modelFinishReason, message: { content: modelContent } }] });
    }
    unexpected.push(`${method} ${url.origin}${url.pathname}`);
    throw new Error("Unexpected fetch blocked by commerce test");
  };

  try {
    const access = require("./access.ts") as typeof import("./access");
    const config = require("./config.ts") as typeof import("./config");
    const accountRoute = require("../../app/api/account/route.ts") as typeof import("../../app/api/account/route");
    const adminRoute = require("../../app/api/admin/overview/route.ts") as typeof import("../../app/api/admin/overview/route");
    const generation = require("./generation.ts") as typeof import("./generation");
    const orderService = require("./orders.ts") as typeof import("./orders");
    const checkout = require("../../app/api/checkout/paypal/route.ts") as typeof import("../../app/api/checkout/paypal/route");
    const captureRoute = require("../../app/api/checkout/paypal/capture/route.ts") as typeof import("../../app/api/checkout/paypal/capture/route");
    const webhook = require("../../app/api/webhooks/paypal/route.ts") as typeof import("../../app/api/webhooks/paypal/route");
    const claimRoute = require("../../app/api/reports/claim/route.ts") as typeof import("../../app/api/reports/claim/route");
    async function scenario(name: string, run: () => Promise<void>) { await t.test(name, async () => { reset(); await run(); assert.deepEqual(unexpected, [], "No unexpected or live network calls"); }); }

    await scenario("a bare report ID and another member never expose private rows or start generation", async () => {
      for (const other of [false, true]) {
        if (other) signIn(true);
        const result = await access.getReportAccess(reportId);
        assert.equal(result.canRead, false);
        assert.equal(result.report, null);
        const response = await generation.generateReport(request("/api/generate-natal", { reportId }), "natal");
        assert.equal(response.status, 403);
        assert.equal((await response.text()).includes(birth.name), false);
      }
      assert.equal(privateReads().length, 0);
      assert.equal(modelCalls().length, 0);
      assert.equal(calls.some(call => call.url.pathname.endsWith("/rpc/destiny_claim_generation")), false);
      calls.length = 0;
      assert.equal((await access.getReportAccess("arbitrary-id?select=*" )).canRead, false);
      assert.equal(calls.filter(call => call.url.pathname.includes("destiny_report_access")).length, 0);
    });

    await scenario("guest proof expires and must be atomically claimed by a signed-in member", async () => {
      for (const expiry of [null, "invalid", "2000-01-01T00:00:00Z"]) {
        setGuest(expiry);
        assert.equal((await access.getReportAccess(reportId)).canRead, false);
      }
      assert.equal(privateReads().length, 0);
      setGuest();
      const guest = await access.getReportAccess(reportId);
      assert.equal(guest.canRead, true);
      assert.equal(guest.claimable, true);
      assert.equal(guest.isFull, false);
      assert.equal(guest.report?.birth_record.birth_time, "12:00");
      assert.equal(await access.claimReportForMember(reportId), null);
      signIn();
      claimSucceeds = false;
      assert.equal(await access.claimReportForMember(reportId), null);
      claimSucceeds = true;
      const response = await claimRoute.POST(request("/api/reports/claim", { reportId }));
      assert.equal(response.status, 200);
      const claimed = calls.find(call => call.url.pathname.endsWith("/rpc/destiny_claim_report"))!;
      assert.deepEqual(claimed.body, { p_report: reportId, p_member: memberId, p_guest_hash: hash(guestToken) });
      signIn(true);
      assert.equal((await access.getReportAccess(reportId)).canRead, false, "old guest cookie cannot reopen a claimed report");
    });

    await scenario("sandbox entitlements never become live purchases or unlock regular production members", async () => {
      signIn();
      unlock();
      assert.equal((await access.getReportAccess(reportId)).isFull, true);
      process.env.VERCEL_ENV = "production";
      assert.equal((await access.getReportAccess(reportId)).isFull, false);
      assert.equal((await access.getReportAccess(reportId)).offer.available, false);
      process.env.DESTINY_ADMIN_MEMBER_IDS = memberId;
      assert.equal((await access.getReportAccess(reportId)).isFull, true);
      process.env.DESTINY_ADMIN_MEMBER_IDS = "";
      process.env.PAYPAL_MODE = "live";
      assert.equal((await access.getReportAccess(reportId)).isFull, false);
      unlock("live");
      assert.equal((await access.getReportAccess(reportId)).isFull, true);
      orders = [{ ...baseOrder, status: "refunded", mode: "live" }];
      assert.equal((await access.getReportAccess(reportId)).isFull, false);
    });

    await scenario("email, verification and membership plan cannot grant administrator privileges", async () => {
      signIn();
      process.env.VERCEL_ENV = "production";
      process.env.DESTINY_ADMIN_EMAILS = members[0].email;
      members[0].plan = "vip";
      for (const verified of [null, new Date().toISOString()]) {
        members[0].email_verified_at = verified;
        assert.equal(config.isAdminMember(members[0]), false);
        assert.equal((await access.getReportAccess(reportId)).isFull, false);
        const account = await (await accountRoute.GET()).json();
        assert.equal(account.member.isAdmin, false);
        assert.equal(account.reports[0].access, "basic");
        assert.equal((await adminRoute.GET()).status, 403);
        assert.equal((await generation.generateReport(request("/api/generate-natal", { reportId }), "natal")).status, 402);
      }
      assert.equal(calls.some(call => call.url.pathname.endsWith("/rpc/destiny_admin_counts")), false);
      assert.equal(modelCalls().length, 0);
    });

    await scenario("an explicitly bound administrator can read and generate owned reports without payment", async () => {
      signIn();
      process.env.VERCEL_ENV = "production";
      process.env.DESTINY_ADMIN_MEMBER_IDS = ` ${memberId} `;
      for (const mode of ["disabled", "sandbox", "live"]) {
        process.env.PAYPAL_MODE = mode;
        const result = await access.getReportAccess(reportId);
        assert.equal(result.canRead, true);
        assert.equal(result.isFull, true);
        const account = await (await accountRoute.GET()).json();
        assert.equal(account.member.isAdmin, true);
        assert.equal(account.reports[0].access, "full");
        assert.deepEqual(account.orders, []);
      }
      assert.equal((await adminRoute.GET()).status, 200);
      const response = await generation.generateReport(request("/api/generate-natal", { reportId }), "natal");
      assert.equal(response.status, 200);
      assert.equal(await response.text(), generationContent);
      const checkoutResponse = await checkout.POST(request("/api/checkout/paypal", { reportId }));
      assert.equal(checkoutResponse.status, 409);
      assert.equal((await checkoutResponse.json()).alreadyUnlocked, true);
      assert.equal(modelCalls().length, 1);
      assert.equal(paymentCalls().length, 0);
      assert.equal(calls.some(call => call.url.hostname.endsWith("paypal.com") || call.url.pathname.endsWith("/rpc/destiny_begin_checkout")), false);
    });

    await scenario("administrator testing never bypasses another report owner's private access", async () => {
      signIn(true);
      process.env.DESTINY_ADMIN_MEMBER_IDS = otherMemberId;
      assert.equal(config.isAdminMember(members[1]), true);
      const result = await access.getReportAccess(reportId);
      assert.equal(result.canRead, false);
      assert.equal(result.isFull, false);
      assert.equal(result.report, null);
      assert.deepEqual((await (await accountRoute.GET()).json()).reports, []);
      assert.equal((await generation.generateReport(request("/api/generate-natal", { reportId }), "natal")).status, 403);
      assert.equal(privateReads().length, 0);
      assert.equal(modelCalls().length, 0);
    });

    await scenario("administrator guest reports require a successful atomic ownership claim before free testing", async () => {
      setGuest(); signIn();
      process.env.DESTINY_ADMIN_MEMBER_IDS = memberId;
      assert.equal((await access.getReportAccess(reportId)).isFull, false);
      claimSucceeds = false;
      assert.equal(await access.claimReportForMember(reportId), null);
      assert.equal((await access.getReportAccess(reportId)).isFull, false);
      claimSucceeds = true;
      const result = await access.claimReportForMember(reportId);
      assert.equal(result?.isFull, true);
      assert.equal(result?.claimable, false);
      assert.equal(accessRow.member_id, memberId);
      assert.equal(calls.some(call => call.url.hostname.endsWith("paypal.com") || call.url.pathname.endsWith("/rpc/destiny_begin_checkout")), false);
    });

    await scenario("administrator access revoked during generation cannot persist unlocked content", async () => {
      signIn();
      process.env.DESTINY_ADMIN_MEMBER_IDS = memberId;
      onModelCall = () => { process.env.DESTINY_ADMIN_MEMBER_IDS = ""; };
      const response = await generation.generateReport(request("/api/generate-natal", { reportId }), "natal");
      assert.equal(response.status, 503);
      assert.equal(calls.some(call => call.body.status === "ready"), false);
    });

    await scenario("production sandbox checkout is explicit and administrator-only while public paid reports stay off", async () => {
      process.env.VERCEL_ENV = "production";
      process.env.DESTINY_PAID_REPORTS_ENABLED = "false";
      process.env.DESTINY_ADMIN_MEMBER_IDS = memberId;
      assert.equal(config.checkoutOffer(null).available, false);
      assert.equal(config.checkoutOffer(members[1]).available, false);
      assert.equal(config.checkoutOffer(members[0]).available, true);
      signIn();
      assert.equal((await access.getReportAccess(reportId)).isFull, true);
      assert.equal((await checkout.POST(request("/api/checkout/paypal", { reportId }))).status, 409);
      assert.equal(calls.some(call => call.url.hostname.endsWith("paypal.com")), false);
      providerOrder.status = "CREATED";
      providerOrder.purchase_units![0].payments = undefined;
      const response = await checkout.POST(request("/api/checkout/paypal", { reportId, sandboxTest: true, amount: "0.01", mode: "live" }));
      assert.equal(response.status, 200);
      assert.match((await response.json()).approvalUrl, /^https:\/\/www\.sandbox\.paypal\.com\//);
      const begin = calls.find(call => call.url.pathname.endsWith("/rpc/destiny_begin_checkout"));
      assert.equal(begin?.body.p_mode, "sandbox");
      assert.equal(begin?.body.p_amount, 199);
      assert.equal(calls.some(call => call.url.hostname === "api-m.paypal.com"), false);
    });

    await scenario("sandbox-test requests cannot bypass regular members, live mode or report ownership", async () => {
      signIn(); process.env.VERCEL_ENV = "production";
      assert.equal((await checkout.POST(request("/api/checkout/paypal", { reportId, sandboxTest: true }))).status, 403);
      process.env.DESTINY_ADMIN_MEMBER_IDS = memberId;
      for (const paid of ["false", "true"]) {
        process.env.DESTINY_PAID_REPORTS_ENABLED = paid;
        process.env.PAYPAL_MODE = "live";
        assert.equal((await checkout.POST(request("/api/checkout/paypal", { reportId, sandboxTest: true }))).status, 403);
      }
      process.env.PAYPAL_MODE = "sandbox";
      process.env.DESTINY_ADMIN_MEMBER_IDS = otherMemberId;
      signIn(true);
      assert.equal((await checkout.POST(request("/api/checkout/paypal", { reportId, sandboxTest: true }))).status, 401);
      assert.equal(calls.some(call => call.url.hostname.endsWith("paypal.com") || call.url.pathname.endsWith("/rpc/destiny_begin_checkout")), false);
    });

    await scenario("completed administrator sandbox tests resume the same order without another provider creation", async () => {
      signIn(); unlock();
      process.env.VERCEL_ENV = "production";
      process.env.DESTINY_PAID_REPORTS_ENABLED = "false";
      process.env.DESTINY_ADMIN_MEMBER_IDS = memberId;
      const response = await checkout.POST(request("/api/checkout/paypal", { reportId, sandboxTest: true }));
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { resumeOrderId: orderId });
      assert.equal(calls.some(call => call.url.hostname.endsWith("paypal.com") || call.url.pathname.endsWith("/rpc/destiny_begin_checkout")), false);
    });

    await scenario("production sandbox capture requires the bound administrator as well as the order owner", async () => {
      signIn(); orders = [{ ...baseOrder }];
      process.env.VERCEL_ENV = "production";
      process.env.DESTINY_PAID_REPORTS_ENABLED = "false";
      assert.equal((await captureRoute.POST(request("/api/checkout/paypal/capture", { orderId }))).status, 403);
      assert.equal(calls.some(call => call.url.hostname.endsWith("paypal.com") || call.url.pathname.endsWith("/rpc/destiny_prepare_capture")), false);
      process.env.DESTINY_ADMIN_MEMBER_IDS = memberId;
      providerOrder.status = "APPROVED";
      providerOrder.purchase_units![0].payments = undefined;
      const response = await captureRoute.POST(request("/api/checkout/paypal/capture", { orderId }));
      assert.equal(response.status, 200);
      assert.equal((await response.json()).status, "completed");
      assert.equal(paymentCalls()[0].body.p_order, orderId);
    });

    await scenario("generation rejects unpaid reports and arbitrary client-only context", async () => {
      signIn();
      const arbitrary = await generation.generateReport(request("/api/generate-natal", { context: { reportId, birth: { name: "INJECTED" } } }), "natal");
      assert.equal(arbitrary.status, 400);
      const unpaid = await generation.generateReport(request("/api/generate-natal", { reportId }), "natal");
      assert.equal(unpaid.status, 402);
      assert.equal((await unpaid.json()).code, "REPORT_LOCKED");
      assert.equal(modelCalls().length, 0);
      assert.equal(calls.some(call => call.url.pathname.endsWith("/rpc/destiny_claim_generation")), false);
    });

    await scenario("paid generation reconstructs persisted birth context and uses a conditional lease write", async () => {
      signIn(); unlock();
      const response = await generation.generateReport(request("/api/generate-natal", { reportId, locale: "zh", context: { birth: { name: "INJECTED-CONTEXT" }, profile: { essenceEn: "INJECTED-CONTEXT" } } }), "natal");
      assert.equal(response.status, 200);
      assert.equal(await response.text(), generationContent);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
      const submitted = JSON.stringify(modelCalls()[0].body);
      assert.equal(submitted.includes("INJECTED-CONTEXT"), false);
      assert.equal(submitted.includes(birth.name), true);
      const write = calls.find(call => call.url.pathname.endsWith("/destiny_report_generations") && call.body.status === "ready")!;
      assert.equal(write.url.searchParams.get("id"), `eq.${lease.id}`);
      assert.equal(write.url.searchParams.get("lease_token"), `eq.${lease.leaseToken}`);
      assert.equal(write.url.searchParams.get("status"), "eq.running");
    });

    await scenario("cached generation avoids a provider call and an active lease returns 409", async () => {
      signIn(); unlock();
      lease = { state: "ready", content: "Synthetic cached report" };
      const ready = await generation.generateReport(request("/api/generate-natal", { reportId }), "natal");
      assert.equal(await ready.text(), "Synthetic cached report");
      lease = { state: "running" };
      const pending = await generation.generateReport(request("/api/generate-natal", { reportId }), "natal");
      assert.equal(pending.status, 409);
      assert.equal(pending.headers.get("retry-after"), "3");
      assert.equal(modelCalls().length, 0);
    });

    await scenario("a refund during generation or a replaced lease prevents content delivery", async () => {
      signIn(); unlock();
      onModelCall = () => { orders[0].status = "refunded"; };
      const revoked = await generation.generateReport(request("/api/generate-natal", { reportId }), "natal");
      assert.equal(revoked.status, 503);
      assert.equal((await revoked.text()).includes(generationContent), false);
      assert.equal(calls.some(call => call.body.status === "ready"), false);
      reset(); signIn(); unlock(); finishSucceeds = false;
      const stale = await generation.generateReport(request("/api/generate-natal", { reportId }), "natal");
      assert.equal(stale.status, 503);
      assert.equal((await stale.text()).includes(generationContent), false);
      assert.equal(calls.some(call => call.url.pathname.endsWith("/reports") && call.method === "PATCH"), false);
    });

    await scenario("incomplete model output is never saved as a paid report", async () => {
      signIn(); unlock(); modelFinishReason = "length";
      const truncated = await generation.generateReport(request("/api/generate-natal", { reportId }), "natal");
      assert.equal(truncated.status, 503);
      modelFinishReason = "stop"; modelContent = "Missing sections. ".repeat(30);
      const missingSections = await generation.generateReport(request("/api/generate-natal", { reportId }), "natal");
      assert.equal(missingSections.status, 503);
      assert.equal(calls.some(call => call.body.status === "ready"), false);
    });

    await scenario("complete provider prose with redundant end labels is normalized before private persistence", async () => {
      signIn(); unlock();
      modelContent = ["DAY_MASTER", "OUTER_PERSONA", "DEEP_SELF", "CAREER", "LOVE", "GROWTH", "HEALTH"].map(marker => `[${marker}] ${"Synthetic interpretation. ".repeat(4)}\n[${marker}] 结束。`).join("\n");
      const response = await generation.generateReport(request("/api/generate-natal", { reportId }), "natal");
      assert.equal(response.status, 200);
      const content = await response.text();
      assert.equal(content.includes("结束。"), false);
      assert.equal((content.match(/\[CAREER\]/g) || []).length, 1);
      const saved = calls.find(call => call.body.status === "ready");
      assert.equal(saved?.body.content, content);
    });

    await scenario("checkout derives price and identity on the server and preserves provider idempotency", async () => {
      signIn(); providerOrder.status = "CREATED"; providerOrder.purchase_units![0].payments = undefined;
      const response = await checkout.POST(request("/api/checkout/paypal", { reportId, amount: "0.01", currency: "EUR", memberId: otherMemberId, mode: "live" }));
      assert.equal(response.status, 200);
      const begin = calls.find(call => call.url.pathname.endsWith("/rpc/destiny_begin_checkout"))!;
      assert.deepEqual(begin.body, { p_report: reportId, p_member: memberId, p_amount: 199, p_currency: "USD", p_mode: "sandbox" });
      const create = calls.find(call => call.url.pathname === "/v2/checkout/orders" && call.method === "POST")!;
      assert.equal(create.headers.get("paypal-request-id"), `create-${orderId}`);
      const units = create.body.purchase_units as Array<{ custom_id: string; amount: { value: string; currency_code: string } }>;
      assert.equal(units[0].custom_id, orderId);
      assert.deepEqual(units[0].amount, { value: "1.99", currency_code: "USD" });
      reset(); signIn(true);
      const unauthorized = await checkout.POST(request("/api/checkout/paypal", { reportId }));
      assert.equal(unauthorized.status, 401);
      assert.equal(calls.some(call => call.url.hostname.endsWith("paypal.com")), false);
    });

    await scenario("capture requires the order's member and repeated requests use the same capture key", async () => {
      orders = [{ ...baseOrder }];
      let response = await captureRoute.POST(request("/api/checkout/paypal/capture", { orderId }));
      assert.equal(response.status, 401);
      signIn(true);
      response = await captureRoute.POST(request("/api/checkout/paypal/capture", { orderId }));
      assert.equal(response.status, 404);
      assert.equal(calls.some(call => call.url.hostname.endsWith("paypal.com")), false);
      signIn(); providerOrder.status = "APPROVED"; providerOrder.purchase_units![0].payments = undefined;
      response = await captureRoute.POST(request("/api/checkout/paypal/capture", { orderId, amount: "0.01" }));
      assert.equal(response.status, 200);
      assert.equal((await response.json()).status, "completed");
      response = await captureRoute.POST(request("/api/checkout/paypal/capture", { orderId }));
      assert.equal(response.status, 200);
      const captures = calls.filter(call => call.url.pathname.endsWith("/capture"));
      assert.equal(captures.length, 1);
      assert.equal(captures[0].headers.get("paypal-request-id"), `capture-${orderId}`);
      const preparedAt = calls.findIndex(call => call.url.pathname.endsWith("/rpc/destiny_prepare_capture"));
      const paypalAt = calls.findIndex(call => call.url.hostname.endsWith("paypal.com"));
      assert.ok(preparedAt >= 0 && preparedAt < paypalAt, "SQL prevents retirement before any capture-related provider request");
      assert.deepEqual(paymentCalls()[0].body, paymentCalls()[1].body);
      // PostgreSQL independently tests late-completed after refund. This checks
      // that the HTTP adapter honors SQL's false result instead of unlocking.
      paymentResult = false;
      response = await captureRoute.POST(request("/api/checkout/paypal/capture", { orderId }));
      assert.equal(response.status, 409);
      assert.equal((await response.json()).status, "revoked");
    });

    await scenario("approved checkout resumes the same local order without creating or capturing here", async () => {
      signIn(); orders = [{ ...baseOrder }];
      providerOrder.status = "APPROVED";
      providerOrder.links = [];
      providerOrder.purchase_units![0].payments = undefined;
      const response = await checkout.POST(request("/api/checkout/paypal", { reportId }));
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { resumeOrderId: orderId });
      assert.equal(calls.some(call => call.url.pathname === "/v2/checkout/orders" || call.url.pathname.endsWith("/capture")), false);
      assert.equal(paymentCalls().length, 0);
      providerOrder.purchase_units![0].custom_id = "WRONG";
      assert.equal((await checkout.POST(request("/api/checkout/paypal", { reportId }))).status, 503);
    });

    await scenario("completed checkout only advertises an unlock after actual reconciliation", async () => {
      signIn(); orders = [{ ...baseOrder }];
      const response = await checkout.POST(request("/api/checkout/paypal", { reportId }));
      assert.equal(response.status, 409);
      assert.equal((await response.json()).alreadyUnlocked, true);
      assert.equal(paymentCalls().length, 1);
      assert.equal(calls.some(call => call.url.pathname === "/v2/checkout/orders" || call.url.pathname.endsWith("/capture")), false);
      paymentResult = false;
      const revoked = await checkout.POST(request("/api/checkout/paypal", { reportId }));
      assert.equal(revoked.status, 409);
      assert.equal((await revoked.json()).alreadyUnlocked, false);
      reset(); signIn(); unlock();
      const alreadyPaid = await checkout.POST(request("/api/checkout/paypal", { reportId }));
      assert.equal(alreadyPaid.status, 409);
      assert.equal((await alreadyPaid.json()).alreadyUnlocked, true);
      assert.equal(calls.some(call => call.url.hostname.endsWith("paypal.com")), false);
    });

    await scenario("only explicitly VOIDED old uncaptured checkouts can receive a replacement", async () => {
      signIn(); orders = [{ ...baseOrder, created_at: "2000-01-01T00:00:00Z" }];
      providerOrder.status = "VOIDED";
      providerOrder.purchase_units![0].payments = undefined;
      createdProviderOrder = { ...structuredClone(providerOrder), id: "NEWPAYPAL123", status: "CREATED", links: [{ rel: "approve", href: "https://www.sandbox.paypal.com/checkoutnow?token=NEWPAYPAL123" }] };
      createdProviderOrder.purchase_units![0].custom_id = replacementOrder.id;
      const response = await checkout.POST(request("/api/checkout/paypal", { reportId }));
      assert.equal(response.status, 200);
      assert.equal((await response.json()).orderId, replacementOrder.id);
      const replacement = calls.find(call => call.url.pathname.endsWith("/rpc/destiny_replace_voided_checkout"))!;
      assert.deepEqual(replacement.body, { p_order: orderId, p_member: memberId, p_paypal_order: "PAYPAL123", p_amount: 199, p_currency: "USD", p_mode: "sandbox" });
      const creation = calls.find(call => call.url.pathname === "/v2/checkout/orders")!;
      assert.equal(creation.headers.get("paypal-request-id"), `create-${replacementOrder.id}`);
      assert.notEqual(replacementOrder.id, orderId);
    });

    await scenario("404, timeout, unknown error, pending or capture evidence never trigger replacement", async () => {
      for (const failure of ["not_found", "timeout", "server_error"] as const) {
        reset(); signIn(); orders = [{ ...baseOrder, created_at: "2000-01-01T00:00:00Z" }]; providerGetFailure = failure;
        assert.equal((await checkout.POST(request("/api/checkout/paypal", { reportId }))).status, 503);
        assert.equal(calls.some(call => call.url.pathname.endsWith("/rpc/destiny_replace_voided_checkout") || call.url.pathname === "/v2/checkout/orders"), false);
      }
      for (const change of [
        () => { orders[0].status = "pending"; },
        () => { orders[0].capture_id = "CAPTURE123"; },
        () => { providerOrder.purchase_units![0].payments = { captures: [providerCapture] }; },
        () => { orders[0].created_at = new Date().toISOString(); },
        () => { providerOrder.purchase_units![0].custom_id = "WRONG"; },
      ]) {
        reset(); signIn(); orders = [{ ...baseOrder, created_at: "2000-01-01T00:00:00Z" }]; providerOrder.status = "VOIDED"; providerOrder.purchase_units![0].payments = undefined; change();
        assert.equal((await checkout.POST(request("/api/checkout/paypal", { reportId }))).status, 503);
        assert.equal(calls.some(call => call.url.pathname.endsWith("/rpc/destiny_replace_voided_checkout") || call.url.pathname === "/v2/checkout/orders"), false);
      }
      reset(); signIn(); orders = [{ ...baseOrder, created_at: "2000-01-01T00:00:00Z" }]; providerOrder.status = "VOIDED"; providerOrder.purchase_units![0].payments = undefined; replacementSucceeds = false;
      assert.equal((await checkout.POST(request("/api/checkout/paypal", { reportId }))).status, 503, "SQL capture/replacement race denial must stop provider creation");
      assert.equal(calls.some(call => call.url.pathname.endsWith("/rpc/destiny_replace_voided_checkout")), true);
      assert.equal(calls.filter(call => call.url.pathname === "/v2/checkout/orders").length, 0);
    });

    await scenario("terminal orders never return to pending or initiate another provider capture", async () => {
      for (const status of ["refunded", "reversed", "denied"]) {
        reset(); signIn(); orders = [{ ...baseOrder, status }];
        const response = await captureRoute.POST(request("/api/checkout/paypal/capture", { orderId }));
        assert.equal(response.status, 409);
        assert.equal((await response.json()).status, status);
        assert.equal(orders[0].status, status);
        assert.equal(calls.some(call => call.url.hostname.endsWith("paypal.com")), false);
      }
    });

    await scenario("wrong amount, currency, custom ID, merchant, capture or status never calls the grant RPC", async () => {
      const changes: Array<() => void> = [
        () => { providerOrder.purchase_units![0].amount!.value = "0.01"; },
        () => { providerOrder.purchase_units![0].amount!.currency_code = "EUR"; },
        () => { providerOrder.purchase_units![0].custom_id = randomUUID(); },
        () => { providerOrder.purchase_units![0].payee!.merchant_id = "WRONG"; },
        () => { providerCapture.amount!.value = "0.01"; },
        () => { providerCapture.amount!.currency_code = "EUR"; },
        () => { providerCapture.id = "WRONGCAPTURE"; },
        () => { providerCapture.status = "APPROVED"; },
        () => { providerOrder.status = "APPROVED"; },
        () => { providerCapture.supplementary_data!.related_ids!.order_id = "WRONGORDER"; },
      ];
      for (const change of changes) {
        reset(); change();
        await assert.rejects(orderService.applyCapture(baseOrder, providerOrder, providerCapture));
        assert.equal(paymentCalls().length, 0);
      }
    });

    await scenario("webhooks verify signatures before reads and a verified refund overrides stale capture status", async () => {
      const event = { id: "SYNTHETICEVENT", event_type: "PAYMENT.CAPTURE.REFUNDED", resource: { id: "REFUND123", supplementary_data: { related_ids: { capture_id: "CAPTURE123" } } } };
      const webhookRequest = () => new Request("https://site.example.test/api/webhooks/paypal", { method: "POST", headers: { "content-type": "application/json", "paypal-transmission-id": "synthetic-transmission", "paypal-transmission-time": "2026-01-01T00:00:00Z", "paypal-transmission-sig": "synthetic-signature", "paypal-cert-url": "https://api-m.sandbox.paypal.com/cert/synthetic", "paypal-auth-algo": "SHA256withRSA" }, body: JSON.stringify(event) });
      orders = [{ ...baseOrder, status: "completed", capture_id: "CAPTURE123" }];
      signatureValid = false;
      let response = await webhook.POST(webhookRequest());
      assert.equal(response.status, 400);
      assert.equal(calls.some(call => call.url.hostname === "database.example.test"), false);
      signatureValid = true; paymentResult = false;
      response = await webhook.POST(webhookRequest());
      assert.equal(response.status, 200);
      assert.equal(paymentCalls()[0].body.p_state, "refunded");
      assert.equal(paymentCalls()[0].body.p_event_id, event.id);
      assert.equal(paymentCalls()[0].body.p_event_type, event.event_type);
      const verification = calls.find(call => call.url.pathname.endsWith("verify-webhook-signature"))!;
      assert.equal(verification.body.webhook_id, "synthetic-webhook");
      assert.deepEqual(verification.body.webhook_event, event);
    });

    await scenario("a signed v2 capture-declined event overrides stale completed provider evidence", async () => {
      orders = [{ ...baseOrder, status: "completed", capture_id: "CAPTURE123" }];
      paymentResult = false;
      const event = { id: "SYNTHETICDECLINE", event_type: "PAYMENT.CAPTURE.DECLINED", resource: { id: "CAPTURE123" } };
      const response = await webhook.POST(new Request("https://site.example.test/api/webhooks/paypal", { method: "POST", headers: { "content-type": "application/json", "paypal-transmission-id": "synthetic-transmission", "paypal-transmission-time": "2026-01-01T00:00:00Z", "paypal-transmission-sig": "synthetic-signature", "paypal-cert-url": "https://api-m.sandbox.paypal.com/cert/synthetic", "paypal-auth-algo": "SHA256withRSA" }, body: JSON.stringify(event) }));
      assert.equal(response.status, 200);
      assert.equal(providerCapture.status, "COMPLETED", "the authenticated event must override a stale capture snapshot");
      assert.equal(paymentCalls().length, 1);
      assert.equal(paymentCalls()[0].body.p_state, "denied");
      assert.equal(paymentCalls()[0].body.p_event_type, "PAYMENT.CAPTURE.DECLINED");
      assert.equal(paymentCalls()[0].body.p_event_id, event.id);
    });

    await scenario("a refund resource resolves its original capture from a PayPal up link", async () => {
      orders = [{ ...baseOrder, status: "completed", capture_id: "CAPTURE123" }];
      paymentResult = false;
      const event = { id: "SYNTHETICREFUNDUP", event_type: "PAYMENT.CAPTURE.REFUNDED", resource_type: "refund", resource: { id: "REFUND123", status: "COMPLETED", links: [{ rel: "self", href: "https://api.sandbox.paypal.com/v2/payments/refunds/REFUND123", method: "GET" }, { rel: "up", href: "https://api.sandbox.paypal.com/v2/payments/captures/CAPTURE123", method: "GET" }] } };
      const response = await webhook.POST(new Request("https://site.example.test/api/webhooks/paypal", { method: "POST", headers: { "content-type": "application/json", "paypal-transmission-id": "synthetic-transmission", "paypal-transmission-time": "2026-01-01T00:00:00Z", "paypal-transmission-sig": "synthetic-signature", "paypal-cert-url": "https://api-m.sandbox.paypal.com/cert/synthetic", "paypal-auth-algo": "SHA256withRSA" }, body: JSON.stringify(event) }));
      assert.equal(response.status, 200);
      assert.equal(calls.filter(call => call.url.pathname === "/v2/payments/captures/CAPTURE123").length, 1);
      assert.equal(calls.some(call => call.url.pathname.endsWith("/REFUND123")), false, "a refund ID must never be queried as a capture ID");
      assert.equal(paymentCalls().length, 1);
      assert.equal(paymentCalls()[0].body.p_capture, "CAPTURE123");
      assert.equal(paymentCalls()[0].body.p_state, "refunded");
      assert.equal(paymentCalls()[0].body.p_event_id, event.id);
    });

    await scenario("refund up links outside authenticated PayPal HTTPS origins cannot reach private or payment records", async () => {
      for (const href of ["https://attacker.example.test/v2/payments/captures/CAPTURE123", "https://api.sandbox.paypal.com.attacker.example.test/v2/payments/captures/CAPTURE123", "http://api.sandbox.paypal.com/v2/payments/captures/CAPTURE123"]) {
        reset();
        const event = { id: "SYNTHETICUNTRUSTEDREFUND", event_type: "PAYMENT.CAPTURE.REFUNDED", resource_type: "refund", resource: { id: "REFUND123", links: [{ rel: "up", href, method: "GET" }] } };
        const response = await webhook.POST(new Request("https://site.example.test/api/webhooks/paypal", { method: "POST", headers: { "content-type": "application/json", "paypal-transmission-id": "synthetic-transmission", "paypal-transmission-time": "2026-01-01T00:00:00Z", "paypal-transmission-sig": "synthetic-signature", "paypal-cert-url": "https://api-m.sandbox.paypal.com/cert/synthetic", "paypal-auth-algo": "SHA256withRSA" }, body: JSON.stringify(event) }));
        assert.equal(response.status, 503);
        assert.equal(calls.filter(call => call.url.pathname.endsWith("verify-webhook-signature")).length, 1);
        assert.equal(calls.some(call => call.url.hostname === "database.example.test" || call.url.pathname.startsWith("/v2/payments/")), false);
        assert.equal(paymentCalls().length, 0);
      }
    });

    await scenario("direct capture reconciliation recognizes the v2 DECLINED status without a webhook", async () => {
      paymentResult = false;
      providerCapture.status = "DECLINED";
      assert.equal(await orderService.applyCapture(baseOrder, providerOrder, providerCapture), "denied");
      assert.equal(paymentCalls().length, 1);
      assert.equal(paymentCalls()[0].body.p_state, "denied");
      assert.equal(paymentCalls()[0].body.p_event_id, null);
      assert.equal(paymentCalls()[0].body.p_event_type, null);
    });

    await scenario("all browser mutations reject cross-origin requests before private reads", async () => {
      signIn(); unlock();
      const handlers = [checkout.POST, captureRoute.POST, claimRoute.POST, (req: Request) => generation.generateReport(req, "natal")];
      for (const handler of handlers) assert.equal((await handler(request("/api/test", { reportId, orderId }, "https://evil.example.test"))).status, 403);
      assert.equal(calls.length, 0);
    });
  } finally {
    runtimeModule._load = originalLoad;
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries(oldEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
