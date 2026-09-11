import assert from "node:assert/strict";
import test from "node:test";
import { requestReportGeneration } from "./generation-client";

const running = () => Response.json({ code: "GENERATION_RUNNING" }, { status: 409, headers: { "Retry-After": "3" } });

test("waits for another tab's generation and sends only the report ID and locale", async () => {
  let calls = 0;
  const waits: number[] = [];
  const response = await requestReportGeneration("/api/generate-natal", "private-report", "zh", new AbortController().signal, {
    fetcher: async (_url, options) => {
      assert.deepEqual(JSON.parse(String(options?.body)), { reportId: "private-report", locale: "zh" });
      calls += 1;
      return calls < 3 ? running() : new Response("persisted report");
    },
    wait: async (milliseconds) => { waits.push(milliseconds); },
  });
  assert.equal(await response.text(), "persisted report");
  assert.equal(calls, 3);
  assert.deepEqual(waits, [3000, 3000]);
});

test("stops after twenty retries and does not retry access or service failures", async () => {
  let calls = 0;
  let waits = 0;
  await assert.rejects(requestReportGeneration("/api/generate-transit", "report", "en", new AbortController().signal, {
    fetcher: async () => { calls += 1; return running(); },
    wait: async () => { waits += 1; },
  }), /still running/);
  assert.equal(calls, 21);
  assert.equal(waits, 20);
  for (const status of [401, 402, 403, 409, 503]) {
    let attempts = 0;
    const response = await requestReportGeneration("/api/generate-natal", "report", "en", new AbortController().signal, {
      fetcher: async () => { attempts += 1; return Response.json({ code: "OTHER_ERROR" }, { status }); },
      wait: async () => { assert.fail("Must not retry unrelated errors"); },
    });
    assert.equal(response.status, status);
    assert.equal(attempts, 1);
  }
});
