import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

// This runs unmodified migrations in real PostgreSQL/WASM with synthetic data.
// PGlite is single-connection: concurrent promises test repeated claim semantics,
// not multi-connection PostgreSQL lock scheduling or hosted Supabase configuration.
test("membership and report commerce migrations enforce durable private state", async (t) => {
  const db = new PGlite({ extensions: { pgcrypto } });
  const firstMember = randomUUID();
  const secondMember = randomUUID();
  const guestHash = "a".repeat(64);
  const privateTables = [
    "destiny_members", "saved_reports", "users", "birth_records", "reports",
    "destiny_member_password_resets", "destiny_auth_rate_limits",
    "destiny_report_access", "destiny_report_orders", "destiny_payment_events",
    "destiny_report_generations",
  ];
  const privateFunctions = [
    "destiny_auth_consume_rate_limit(text,integer,integer)",
    "destiny_auth_reset_password(text,text,text)",
    "destiny_create_private_report(jsonb,uuid,text)",
    "destiny_claim_report(uuid,uuid,text)",
    "destiny_begin_checkout(uuid,uuid,integer,text,text)",
    "destiny_prepare_capture(uuid,uuid)",
    "destiny_replace_voided_checkout(uuid,uuid,text,integer,text,text)",
    "destiny_apply_payment(uuid,text,text,integer,text,text,text,text)",
    "destiny_claim_generation(uuid,text,text,integer)",
    "destiny_admin_counts()",
  ];
  const payload = {
    birth: { name: "Synthetic Test", gender: "female", locale: "zh", birthDate: "1990-01-01", birthTime: "12:00", birthPlace: "Synthetic City", latitude: 30, longitude: 120, timezone: "Asia/Shanghai", trueSolarTime: "12:00" },
    bazi: { test: true }, astro: { test: true }, aiContent: { overview: "Synthetic content" },
  };
  async function scalar<T>(sql: string, params: unknown[] = []) {
    const result = await db.query<{ value: T }>(sql, params);
    return result.rows[0]?.value;
  }
  async function createReport(member: string | null = firstMember, hash: string | null = null) {
    return scalar<string>("select destiny_create_private_report($1::jsonb,$2::uuid,$3::text) as value", [JSON.stringify(payload), member, hash]);
  }
  async function claimReport(report: string, member: string | null, hash: string | null) {
    return scalar<boolean>("select destiny_claim_report($1::uuid,$2::uuid,$3::text) as value", [report, member, hash]);
  }
  async function createOrder(report: string, paypalId: string | null = randomUUID()) {
    return scalar<string>("insert into destiny_report_orders(report_id,member_id,paypal_order_id,amount_cents,currency,mode) values($1,$2,$3,199,'USD','sandbox') returning id as value", [report, firstMember, paypalId]);
  }
  async function applyPayment(order: string, paypalId: string | null, capture: string | null, state: string, event: string | null = null, amount: number | null = 199, currency: string | null = "USD", eventType: string | null = state) {
    return scalar<boolean>("select destiny_apply_payment($1::uuid,$2,$3,$4::integer,$5,$6,$7,$8) as value", [order, paypalId, capture, amount, currency, state, event, eventType]);
  }
  type GenerationClaim = { state: "claimed" | "running" | "ready" | "exhausted"; id?: string; leaseToken?: string; content?: string };
  async function claimGeneration(report: string, kind = "natal", locale = "zh", year = 0) {
    return scalar<GenerationClaim>("select destiny_claim_generation($1::uuid,$2,$3,$4::integer) as value", [report, kind, locale, year]);
  }

  try {
    await db.exec("create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls; grant usage on schema public to anon, authenticated, service_role;");
    const migrations = await Promise.all(["schema.sql", "membership-auth.sql", "report-commerce.sql"].map(name => readFile(new URL(name, import.meta.url), "utf8")));
    await t.test("all migrations execute unchanged and rerun without removing existing data", async () => {
      for (const migration of migrations) await db.exec(migration);
      await db.query("insert into destiny_members(id,email,email_normalized,password_salt,password_hash) values($1,'first@example.test','first@example.test',$3,$4),($2,'second@example.test','second@example.test',$3,$4)", [firstMember, secondMember, "s".repeat(22), "h".repeat(43)]);
      for (const migration of migrations) await db.exec(migration);
      assert.equal(await scalar<number>("select count(*)::integer as value from destiny_members"), 2);
    });

    await t.test("RLS and explicit table/function privileges isolate browser roles", async () => {
      for (const table of privateTables) {
        assert.equal(await scalar<boolean>("select relrowsecurity as value from pg_class where oid=$1::regclass", [`public.${table}`]), true, table);
        for (const role of ["anon", "authenticated"]) {
          assert.equal(await scalar<boolean>("select has_table_privilege($1,$2,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') as value", [role, `public.${table}`]), false, `${role}: ${table}`);
        }
        for (const permission of ["SELECT", "INSERT", "UPDATE", "DELETE"]) {
          assert.equal(await scalar<boolean>("select has_table_privilege('service_role',$1,$2) as value", [`public.${table}`, permission]), true, `service_role ${permission}: ${table}`);
        }
      }
      for (const fn of privateFunctions) {
        assert.equal(await scalar<boolean>("select has_function_privilege('service_role',$1,'EXECUTE') as value", [`public.${fn}`]), true, fn);
        for (const role of ["anon", "authenticated"]) {
          assert.equal(await scalar<boolean>("select has_function_privilege($1,$2,'EXECUTE') as value", [role, `public.${fn}`]), false, `${role}: ${fn}`);
        }
      }
      for (const role of ["anon", "authenticated"]) {
        await db.exec(`set role ${role}`);
        try {
          await assert.rejects(db.query("select * from destiny_members"), /permission denied/);
          await assert.rejects(db.query("select destiny_claim_report($1::uuid,$2::uuid,$3::text)", [randomUUID(), firstMember, guestHash]), /permission denied/);
        } finally { await db.exec("reset role"); }
      }
    });

    // Exercise trusted server queries under the real grants rather than db owner.
    await db.exec("set role service_role");

    await t.test("report creation is atomic and claim requires the actual guest proof", async () => {
      const memberReport = await createReport();
      assert.equal(await claimReport(memberReport, secondMember, guestHash), false);
      assert.equal(await claimReport(memberReport, firstMember, null), true);
      assert.equal(await scalar<string>("select member_id::text as value from destiny_report_access where report_id=$1", [memberReport]), firstMember);
      const guestReport = await createReport(null, guestHash);
      assert.equal(await claimReport(guestReport, secondMember, null), false);
      assert.equal(await claimReport(guestReport, null, guestHash), false);
      assert.equal(await claimReport(guestReport, secondMember, "b".repeat(64)), false);
      assert.equal(await claimReport(guestReport, firstMember, guestHash), true);
      assert.equal(await claimReport(guestReport, secondMember, guestHash), false);
      const claimed = await db.query<{ member_id: string; guest_token_hash: null; guest_expires_at: null }>("select member_id,guest_token_hash,guest_expires_at from destiny_report_access where report_id=$1", [guestReport]);
      assert.deepEqual(claimed.rows[0], { member_id: firstMember, guest_token_hash: null, guest_expires_at: null });
      for (const expiry of [null, "2000-01-01T00:00:00Z"]) {
        const expiredReport = await createReport(null, guestHash);
        await db.query("update destiny_report_access set guest_expires_at=$2 where report_id=$1", [expiredReport, expiry]);
        assert.equal(await claimReport(expiredReport, secondMember, guestHash), false);
      }
      assert.equal(await claimReport(randomUUID(), firstMember, guestHash), false);
      const before = await scalar<number>("select count(*)::integer as value from reports");
      await assert.rejects(createReport(null, null), /missing owner/);
      await assert.rejects(createReport(randomUUID()), /foreign key/);
      assert.equal(await scalar<number>("select count(*)::integer as value from reports"), before);
      assert.equal(await scalar<number>("select count(*)::integer as value from users"), before);
      assert.equal(await scalar<number>("select count(*)::integer as value from birth_records"), before);
    });

    await t.test("payment matching rejects missing fields and mismatched evidence", async () => {
      const report = await createReport();
      const order = await createOrder(report, "PAYPAL-MATCH");
      for (const args of [
        [null, "CAPTURE-MATCH", 199, "USD"],
        ["PAYPAL-MATCH", null, 199, "USD"],
        ["PAYPAL-MATCH", "CAPTURE-MATCH", null, "USD"],
        ["PAYPAL-MATCH", "CAPTURE-MATCH", 199, null],
        ["PAYPAL-WRONG", "CAPTURE-MATCH", 199, "USD"],
        ["PAYPAL-MATCH", "CAPTURE-MATCH", 200, "USD"],
        ["PAYPAL-MATCH", "CAPTURE-MATCH", 199, "EUR"],
      ] as Array<[string | null, string | null, number | null, string | null]>) {
        await assert.rejects(applyPayment(order, args[0], args[1], "completed", null, args[2], args[3]), /payment mismatch|capture mismatch/);
      }
      const unbound = await createOrder(report, null);
      await assert.rejects(applyPayment(unbound, "PAYPAL-UNBOUND", "CAPTURE-UNBOUND", "completed"), /payment mismatch/);
      assert.equal(await scalar<string>("select status as value from destiny_report_orders where id=$1", [order]), "created");
      assert.equal(await applyPayment(order, "PAYPAL-MATCH", "CAPTURE-MATCH", "completed"), true);
      await assert.rejects(applyPayment(order, "PAYPAL-MATCH", "WRONG-CAPTURE", "refunded"), /capture mismatch/);
    });

    await t.test("checkout requires ownership and reuses one open order at its original price", async () => {
      const report = await createReport();
      type Checkout = { id: string; amount_cents: number; status: string; member_id: string; mode: string };
      const begin = (member: string | null = firstMember, amount = 199, mode = "sandbox", id = report) => scalar<Checkout>("select destiny_begin_checkout($1::uuid,$2::uuid,$3::integer,'USD',$4) as value", [id, member, amount, mode]);
      await assert.rejects(begin(secondMember), /report access denied/);
      await assert.rejects(begin(null), /invalid checkout/);
      await assert.rejects(begin(firstMember, 0), /invalid checkout/);
      await assert.rejects(begin(firstMember, 199, "invalid"), /invalid checkout/);
      const guest = await createReport(null, guestHash);
      await assert.rejects(begin(firstMember, 199, "sandbox", guest), /report access denied/);
      const attempts = await Promise.all(Array.from({ length: 8 }, () => begin()));
      assert.equal(new Set(attempts.map(item => item.id)).size, 1);
      const order = attempts[0];
      assert.equal(order.amount_cents, 199);
      const reused = await begin(firstMember, 599);
      assert.equal(reused.id, order.id);
      assert.equal(reused.amount_cents, 199);
      await db.query("update destiny_report_orders set paypal_order_id='PAYPAL-CHECKOUT' where id=$1", [order.id]);
      assert.equal(await applyPayment(order.id, "PAYPAL-CHECKOUT", "CAPTURE-CHECKOUT", "pending"), false);
      assert.equal((await begin()).id, order.id);
      assert.equal(await applyPayment(order.id, "PAYPAL-CHECKOUT", "CAPTURE-CHECKOUT", "completed"), true);
      await assert.rejects(begin(), /report already purchased/);
      const liveOrder = await begin(firstMember, 299, "live");
      assert.notEqual(liveOrder.id, order.id);
      assert.equal(liveOrder.mode, "live");
      assert.equal(await applyPayment(order.id, "PAYPAL-CHECKOUT", "CAPTURE-CHECKOUT", "refunded"), false);
      const repurchase = await begin(firstMember, 599);
      assert.notEqual(repurchase.id, order.id);
      assert.equal(repurchase.amount_cents, 599);
      await db.query("update destiny_report_orders set status='denied' where id=$1", [repurchase.id]);
      assert.notEqual((await begin()).id, repurchase.id);
    });

    await t.test("payment event dedupe and terminal states cannot grant access twice or revive it", async () => {
      const report = await createReport();
      const order = await createOrder(report, "PAYPAL-DEDUPE");
      assert.equal(await applyPayment(order, "PAYPAL-DEDUPE", "CAPTURE-DEDUPE", "completed", "EVENT-PAID", 199, "USD", "PAYMENT.CAPTURE.COMPLETED"), true);
      assert.equal(await applyPayment(order, "PAYPAL-DEDUPE", "CAPTURE-DEDUPE", "completed", "EVENT-PAID", 199, "USD", "PAYMENT.CAPTURE.COMPLETED"), true);
      assert.equal(await scalar<number>("select count(*)::integer as value from destiny_payment_events where id='EVENT-PAID'"), 1);
      const other = await createOrder(report, "PAYPAL-OTHER");
      await assert.rejects(applyPayment(other, "PAYPAL-OTHER", "CAPTURE-OTHER", "completed", "EVENT-PAID", 199, "USD", "PAYMENT.CAPTURE.COMPLETED"), /payment event mismatch/);
      await assert.rejects(applyPayment(order, "PAYPAL-DEDUPE", "CAPTURE-DEDUPE", "refunded", "EVENT-PAID", 199, "USD", "PAYMENT.CAPTURE.REFUNDED"), /payment event mismatch/);
      assert.equal(await scalar<string>("select status as value from destiny_report_orders where id=$1", [other]), "created");
      assert.equal(await applyPayment(order, "PAYPAL-DEDUPE", "CAPTURE-DEDUPE", "pending", "EVENT-LATE-PENDING"), true);
      assert.equal(await applyPayment(order, "PAYPAL-DEDUPE", "CAPTURE-DEDUPE", "refunded", "EVENT-REFUND"), false);
      assert.equal(await applyPayment(order, "PAYPAL-DEDUPE", "CAPTURE-DEDUPE", "completed", "EVENT-LATE-PAID"), false);
      assert.equal(await applyPayment(order, "PAYPAL-DEDUPE", "CAPTURE-DEDUPE", "completed", "EVENT-PAID", 199, "USD", "PAYMENT.CAPTURE.COMPLETED"), false);
      assert.equal(await scalar<string>("select status as value from destiny_report_orders where id=$1", [order]), "refunded");
      for (const terminal of ["refunded", "reversed", "denied"]) {
        const paypalId = `PAYPAL-${terminal}`;
        const captureId = `CAPTURE-${terminal}`;
        const terminalOrder = await createOrder(report, paypalId);
        assert.equal(await applyPayment(terminalOrder, paypalId, captureId, terminal), false);
        assert.equal(await applyPayment(terminalOrder, paypalId, captureId, "completed"), false);
        assert.equal(await scalar<string>("select status as value from destiny_report_orders where id=$1", [terminalOrder]), terminal);
      }
    });

    await t.test("checkout replacement is atomic and cannot retire an order already entering capture", async () => {
      type Checkout = { id: string; amount_cents: number; status: string; checkout_retired_at: string | null };
      const report = await createReport();
      const oldOrder = await createOrder(report, "PAYPAL-VOIDED");
      const prepare = (id = oldOrder, member = firstMember) => scalar<Checkout>("select destiny_prepare_capture($1::uuid,$2::uuid) as value", [id, member]);
      const replace = (id = oldOrder, paypalId = "PAYPAL-VOIDED", member = firstMember, amount = 299) => scalar<Checkout>("select destiny_replace_voided_checkout($1::uuid,$2::uuid,$3,$4::integer,'USD','sandbox') as value", [id, member, paypalId, amount]);
      await assert.rejects(prepare(oldOrder, secondMember), /order access denied/);
      await assert.rejects(replace(oldOrder, "PAYPAL-VOIDED", secondMember), /checkout replacement denied/);
      await assert.rejects(replace(), /checkout replacement denied/, "recent orders cannot be replaced");
      await db.query("update destiny_report_orders set created_at=clock_timestamp()-interval '4 hours' where id=$1", [oldOrder]);
      await assert.rejects(replace(oldOrder, "WRONG-PAYPAL"), /checkout replacement denied/);
      await assert.rejects(replace(oldOrder, "PAYPAL-VOIDED", firstMember, 0), /invalid checkout/);
      assert.equal(await scalar<string>("select status as value from destiny_report_orders where id=$1", [oldOrder]), "created", "failed replacement rolls back retirement");
      assert.equal(await scalar<string | null>("select checkout_retired_at as value from destiny_report_orders where id=$1", [oldOrder]), null);
      const replacements = await Promise.all([replace(), replace()]);
      assert.equal(replacements[0].id, replacements[1].id);
      assert.notEqual(replacements[0].id, oldOrder);
      assert.equal(replacements[0].amount_cents, 299);
      assert.equal(await scalar<number>("select count(*)::integer as value from destiny_report_orders where report_id=$1", [report]), 2);
      const oldAfter = await prepare();
      assert.equal(oldAfter.status, "denied", "a capture arriving after retirement must not revive the old checkout");
      assert.ok(oldAfter.checkout_retired_at);

      const racingReport = await createReport();
      const racingOrder = await createOrder(racingReport, "PAYPAL-RACING");
      await db.query("update destiny_report_orders set created_at=clock_timestamp()-interval '4 hours' where id=$1", [racingOrder]);
      assert.equal((await prepare(racingOrder)).status, "pending");
      await assert.rejects(replace(racingOrder, "PAYPAL-RACING"), /checkout replacement denied/, "capture wins before retirement even with no capture ID yet");
      assert.equal(await scalar<number>("select count(*)::integer as value from destiny_report_orders where report_id=$1", [racingReport]), 1);
      for (const terminal of ["completed", "refunded", "reversed", "denied"]) {
        await db.query("update destiny_report_orders set status=$2 where id=$1", [racingOrder, terminal]);
        assert.equal((await prepare(racingOrder)).status, terminal);
        await assert.rejects(replace(racingOrder, "PAYPAL-RACING"), /checkout replacement denied/);
      }
      await db.query("update destiny_report_orders set status='created',capture_id='CAPTURE-ALREADY-KNOWN' where id=$1", [racingOrder]);
      await assert.rejects(replace(racingOrder, "PAYPAL-RACING"), /checkout replacement denied/);
    });

    await t.test("generation claims have one current lease, bounded retries and reusable ready content", async () => {
      const report = await createReport();
      const claims = await Promise.all(Array.from({ length: 8 }, () => claimGeneration(report)));
      assert.equal(claims.filter(item => item.state === "claimed").length, 1);
      assert.equal(claims.filter(item => item.state === "running").length, 7);
      const first = claims.find(item => item.state === "claimed")!;
      assert.ok(first.id && first.leaseToken);
      await db.query("update destiny_report_generations set lease_expires_at=clock_timestamp()-interval '1 second' where id=$1", [first.id]);
      const recovered = await claimGeneration(report);
      assert.equal(recovered.state, "claimed");
      assert.equal(recovered.id, first.id);
      assert.notEqual(recovered.leaseToken, first.leaseToken);
      // This is the conditional write the server must use after a provider call.
      const staleWrite = await db.query("update destiny_report_generations set status='ready',content='stale' where id=$1 and lease_token=$2 and status='running' returning id", [first.id, first.leaseToken]);
      assert.equal(staleWrite.rows.length, 0);
      const freshWrite = await db.query("update destiny_report_generations set status='ready',content='Synthetic ready report' where id=$1 and lease_token=$2 and status='running' returning id", [recovered.id, recovered.leaseToken]);
      assert.equal(freshWrite.rows.length, 1);
      assert.deepEqual(await claimGeneration(report), { state: "ready", content: "Synthetic ready report" });
      const retryReport = await createReport();
      const retry = await claimGeneration(retryReport);
      for (let attempt = 2; attempt <= 5; attempt++) {
        await db.query("update destiny_report_generations set status='error' where id=$1", [retry.id]);
        assert.equal((await claimGeneration(retryReport)).state, "claimed");
        assert.equal(await scalar<number>("select attempts as value from destiny_report_generations where id=$1", [retry.id]), attempt);
      }
      await db.query("update destiny_report_generations set lease_expires_at=clock_timestamp()-interval '1 second' where id=$1", [retry.id]);
      assert.deepEqual(await claimGeneration(retryReport), { state: "exhausted" });
      assert.equal((await claimGeneration(retryReport, "transit", "zh", 2027)).state, "claimed");
      assert.equal((await claimGeneration(retryReport, "natal", "en", 0)).state, "claimed");
    });

    await t.test("admin aggregates exceed page size and exclude sandbox and refunded money", async () => {
      type Counts = { members: number; reports: number; paidOrders: number; pendingOrders: number; revenue: Array<{ currency: string; amount: string }> };
      const counts = () => scalar<Counts>("select destiny_admin_counts() as value");
      const before = await counts();
      assert.deepEqual(before.revenue, []);
      const report = await createReport();
      await db.query("insert into destiny_members(email,email_normalized,password_salt,password_hash) select 'extra-'||n||'@example.test','extra-'||n||'@example.test',$1,$2 from generate_series(1,55) n", ["s".repeat(22), "h".repeat(43)]);
      await db.query("insert into destiny_report_orders(report_id,member_id,amount_cents,currency,mode,status) select $1,$2,199,'USD','live','completed' from generate_series(1,56)", [report, firstMember]);
      for (const [mode, status, amount] of [["live", "refunded", 99999], ["live", "reversed", 99999], ["live", "denied", 99999], ["sandbox", "completed", 99999], ["sandbox", "pending", 99999], ["live", "created", 199], ["live", "pending", 199]] as const) {
        await db.query("insert into destiny_report_orders(report_id,member_id,amount_cents,currency,mode,status) values($1,$2,$3,'USD',$4,$5)", [report, firstMember, amount, mode, status]);
      }
      const after = await counts();
      assert.deepEqual(after, { members: before.members + 55, reports: before.reports + 1, paidOrders: before.paidOrders + 56, pendingOrders: before.pendingOrders + 2, revenue: [{ currency: "USD", amount: "111.44" }] });
    });

    await t.test("auth SQL throttles persist and password resets are expiring, single-use and revoke sessions", async () => {
      const throttleKey = "c".repeat(64);
      const throttle = () => db.query<{ allowed: boolean; retry_after: number }>("select * from destiny_auth_consume_rate_limit($1,2,3600)", [throttleKey]);
      assert.equal((await throttle()).rows[0].allowed, true);
      assert.equal((await throttle()).rows[0].allowed, true);
      const limited = (await throttle()).rows[0];
      assert.equal(limited.allowed, false);
      assert.ok(limited.retry_after > 0 && limited.retry_after <= 3600);
      await db.query("update destiny_auth_rate_limits set window_start=clock_timestamp()-interval '1 day' where key_hash=$1", [throttleKey]);
      assert.equal((await throttle()).rows[0].allowed, true);
      const resetHash = "d".repeat(64);
      const siblingHash = "e".repeat(64);
      const expiredHash = "f".repeat(64);
      await db.query("update destiny_members set session_token_hash='old-session',session_expires_at=clock_timestamp()+interval '1 day' where id=$1", [firstMember]);
      await db.query("insert into destiny_member_password_resets(member_id,token_hash,expires_at) values($1,$2,clock_timestamp()+interval '30 minutes'),($1,$3,clock_timestamp()+interval '30 minutes'),($1,$4,clock_timestamp()-interval '1 second')", [firstMember, resetHash, siblingHash, expiredHash]);
      const reset = (hash: string) => scalar<boolean>("select destiny_auth_reset_password($1,$2,$3) as value", [hash, "n".repeat(22), "p".repeat(43)]);
      assert.equal(await reset(expiredHash), false);
      assert.equal(await reset("0".repeat(64)), false);
      const resets = await Promise.all([reset(resetHash), reset(resetHash)]);
      assert.deepEqual(resets, [true, false]);
      assert.equal(await reset(siblingHash), false);
      const member = await db.query<{ session_token_hash: null; session_expires_at: null; verified: boolean; password_hash: string }>("select session_token_hash,session_expires_at,email_verified_at is not null as verified,password_hash from destiny_members where id=$1", [firstMember]);
      assert.deepEqual(member.rows[0], { session_token_hash: null, session_expires_at: null, verified: true, password_hash: "p".repeat(43) });
    });
  } finally { await db.close(); }
});
