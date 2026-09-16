import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateCompatibility, parseCompatibilityInput } from "./model";
import { CompatibilityRequestError, requestCompatibilityCalculation } from "./request";

const input = parseCompatibilityInput({
  people: [{ birthDate: "1991-03-21", birthTime: "10:35", cityId: "new-york-us" }, { birthDate: "1993-10-04", birthTime: "17:20", cityId: "shanghai-cn" }],
  locale: "zh", consent: true, mode: "calculate",
});
const result = calculateCompatibility(input);
const freshSignal = () => new AbortController().signal;
const success = () => Response.json({ result });
const unavailable = (e: unknown) => e instanceof CompatibilityRequestError && e.code === "unavailable";

test("first Load failed is recovered within one submission; only calculation is replayed", async () => {
  const bodies: string[] = [];
  const response = await requestCompatibilityCalculation(input, freshSignal(), {
    retryDelayMs: 0,
    fetch: (async (_url, init) => {
      bodies.push(String(init?.body));
      if (bodies.length === 1) throw new TypeError("Load failed");
      return success();
    }) as typeof fetch,
  });
  assert.deepEqual(response, result);
  assert.equal(bodies.length, 2);
  assert.equal(bodies[0], bodies[1]);
  assert.equal(JSON.parse(bodies[1]).mode, "calculate");
});

test("a healthy first request is never repeated", async () => {
  let calls = 0;
  await requestCompatibilityCalculation(input, freshSignal(), { fetch: (async () => { calls++; return success(); }) as typeof fetch });
  assert.equal(calls, 1);
});

test("temporary gateway errors and interrupted JSON recover once", async () => {
  for (const first of [() => new Response("Unavailable", { status: 503 }), () => new Response("Gateway timeout", { status: 504 }), () => new Response('{"result":')]) {
    let calls = 0;
    const response = await requestCompatibilityCalculation(input, freshSignal(), {
      retryDelayMs: 0, fetch: (async () => ++calls === 1 ? first() : success()) as typeof fetch,
    });
    assert.equal(calls, 2); assert.deepEqual(response, result);
  }
});

test("invalid input, origin rejection and rate limits are not retried", async () => {
  for (const status of [400, 403, 429]) {
    let calls = 0;
    await assert.rejects(requestCompatibilityCalculation(input, freshSignal(), {
      fetch: (async () => { calls++; return Response.json({ error: "Check the birth time." }, { status }); }) as typeof fetch,
    }), (e: unknown) => e instanceof CompatibilityRequestError && e.code === (status === 429 ? "limited" : "invalid"));
    assert.equal(calls, 1);
  }
});

test("persistent failure stops after two attempts with a localized error code, not raw browser text", async () => {
  let calls = 0;
  await assert.rejects(requestCompatibilityCalculation(input, freshSignal(), {
    retryDelayMs: 0, fetch: (async () => { calls++; throw new TypeError("Load failed"); }) as typeof fetch,
  }), unavailable);
  assert.equal(calls, 2);
});

test("a hung request is aborted before a successful second attempt", async () => {
  let calls = 0, firstAborted = false;
  const response = await requestCompatibilityCalculation(input, freshSignal(), {
    timeoutMs: 10, retryDelayMs: 0,
    fetch: ((_url, init) => {
      if (++calls === 2) return Promise.resolve(success());
      return new Promise((_resolve, reject) => init!.signal!.addEventListener("abort", () => { firstAborted = true; reject(new DOMException("Aborted", "AbortError")); }, { once: true }));
    }) as typeof fetch,
  });
  assert.equal(calls, 2); assert.equal(firstAborted, true); assert.deepEqual(response, result);
});

test("navigation/reset cancels a pending request and never triggers a retry", async () => {
  const controller = new AbortController(); let calls = 0;
  const request = requestCompatibilityCalculation(input, controller.signal, {
    retryDelayMs: 0,
    fetch: ((_url, init) => {
      calls++;
      return new Promise((_resolve, reject) => init!.signal!.addEventListener("abort", () => reject(init!.signal!.reason), { once: true }));
    }) as typeof fetch,
  });
  controller.abort();
  await assert.rejects(request, (e: unknown) => e instanceof DOMException && e.name === "AbortError");
  assert.equal(calls, 1);
});

test("navigation during the retry delay prevents the second request", async () => {
  const controller = new AbortController(); let calls = 0;
  const request = requestCompatibilityCalculation(input, controller.signal, {
    retryDelayMs: 100,
    fetch: (async () => { calls++; setTimeout(() => controller.abort(), 10); throw new TypeError("Load failed"); }) as typeof fetch,
  });
  await assert.rejects(request, (e: unknown) => e instanceof DOMException && e.name === "AbortError");
  assert.equal(calls, 1);
});
