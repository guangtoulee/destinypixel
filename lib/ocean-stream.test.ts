import assert from "node:assert/strict";
import { test } from "node:test";
import { diagnoseOceanStream, type OceanStreamDiagnostic } from "./ocean-stream";

const nextTurn = () => new Promise<void>(resolve => setImmediate(resolve));

test("successful streams preserve bytes and remain silent", async () => {
  const diagnostics: OceanStreamDiagnostic[] = [];
  const source = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(Uint8Array.of(1, 2));
      controller.enqueue(Uint8Array.of(3, 4, 5));
      controller.close();
    },
  });
  const stream = diagnoseOceanStream(source, new AbortController().signal, diagnostic => diagnostics.push(diagnostic));
  assert.deepEqual([...new Uint8Array(await new Response(stream).arrayBuffer())], [1, 2, 3, 4, 5]);
  assert.deepEqual(diagnostics, []);
  assert.equal(source.locked, false);
});

test("consumer demand controls upstream reads", async () => {
  let pulls = 0;
  const source = new ReadableStream<Uint8Array>({
    pull(controller) {
      pulls += 1;
      controller.enqueue(Uint8Array.of(pulls));
      if (pulls === 2) controller.close();
    },
  }, { highWaterMark: 0 });
  const reader = diagnoseOceanStream(source, new AbortController().signal).getReader();
  await nextTurn();
  assert.equal(pulls, 0);
  assert.deepEqual((await reader.read()).value, Uint8Array.of(1));
  await nextTurn();
  assert.equal(pulls, 1);
  assert.deepEqual((await reader.read()).value, Uint8Array.of(2));
  assert.equal((await reader.read()).done, true);
});

test("midstream failure preserves the error and records only sanitized metadata", async () => {
  const diagnostics: OceanStreamDiagnostic[] = [];
  const secret = "/private/fixture.png?token=fixture-secret";
  const failure = new TypeError(secret, { cause: { code: "UND_ERR_SOCKET", message: secret } });
  let pulls = 0;
  const source = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (pulls++ === 0) controller.enqueue(Uint8Array.of(1, 2, 3));
      else throw failure;
    },
  }, { highWaterMark: 0 });
  const request = new AbortController();
  const reader = diagnoseOceanStream(source, request.signal, diagnostic => diagnostics.push(diagnostic)).getReader();
  assert.equal((await reader.read()).value?.byteLength, 3);
  request.abort(secret);
  await assert.rejects(reader.read(), error => error === failure);
  assert.equal(diagnostics.length, 1);
  const [diagnostic] = diagnostics;
  assert.deepEqual({ ...diagnostic, elapsedMs: 0 }, {
    event: "error", bytesTransferred: 3, elapsedMs: 0,
    errorName: "TypeError", causeCode: "UND_ERR_SOCKET", requestAborted: true,
  });
  assert.equal(Number.isInteger(diagnostic.elapsedMs), true);
  assert.equal(JSON.stringify(diagnostics).includes(secret), false);
  assert.equal(source.locked, false);
});

test("destination cancellation interrupts a pending read and cancels the upstream", async () => {
  const diagnostics: OceanStreamDiagnostic[] = [];
  let finishPull: (() => void) | undefined;
  let cancelledWith: unknown;
  const source = new ReadableStream<Uint8Array>({
    pull() { return new Promise<void>(resolve => { finishPull = resolve; }); },
    cancel(reason) { cancelledWith = reason; },
  }, { highWaterMark: 0 });
  const reader = diagnoseOceanStream(source, new AbortController().signal, diagnostic => diagnostics.push(diagnostic)).getReader();
  const pending = reader.read();
  await nextTurn();
  const reason = { name: "AbortError", message: "private URL or token must stay out of logs" };
  await reader.cancel(reason);
  finishPull?.();
  assert.equal((await pending).done, true);
  assert.equal(cancelledWith, reason);
  assert.equal(source.locked, false);
  assert.deepEqual(diagnostics.map(diagnostic => ({ ...diagnostic, elapsedMs: 0 })), [{
    event: "cancel", bytesTransferred: 0, elapsedMs: 0, errorName: "AbortError", causeCode: null, requestAborted: false,
  }]);
  assert.equal(JSON.stringify(diagnostics).includes(reason.message), false);
});
