import "server-only";

export type OceanStreamDiagnostic = {
  event: "error" | "cancel";
  bytesTransferred: number;
  elapsedMs: number;
  errorName: string | null;
  causeCode: string | null;
  requestAborted: boolean;
};

function safeLabel(value: unknown) {
  return typeof value === "string" && /^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(value) ? value : null;
}

function logDiagnostic(diagnostic: OceanStreamDiagnostic) {
  // Normal browser navigation can cancel images; reserve error severity for failures.
  const log = diagnostic.event === "cancel" ? console.info : console.error;
  log("[ocean-media] stream", JSON.stringify(diagnostic));
}

export function diagnoseOceanStream(
  source: ReadableStream<Uint8Array>,
  requestSignal: AbortSignal,
  report: (diagnostic: OceanStreamDiagnostic) => void = logDiagnostic,
) {
  const reader = source.getReader();
  const started = performance.now();
  let bytesTransferred = 0;
  let settled = false;

  function record(event: OceanStreamDiagnostic["event"], error: unknown) {
    const detail = error && typeof error === "object" ? error as { name?: unknown; cause?: unknown } : null;
    const cause = detail?.cause && typeof detail.cause === "object" ? detail.cause as { code?: unknown } : null;
    try {
      report({
        event, bytesTransferred, elapsedMs: Math.round(performance.now() - started),
        errorName: safeLabel(detail?.name), causeCode: safeLabel(cause?.code),
        requestAborted: requestSignal.aborted,
      });
    } catch { /* Diagnostics must not change stream delivery. */ }
  }

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const chunk = await reader.read();
        if (settled) return;
        if (chunk.done) {
          settled = true;
          reader.releaseLock();
          controller.close();
          return;
        }
        bytesTransferred += chunk.value.byteLength;
        controller.enqueue(chunk.value);
      } catch (error) {
        if (settled) return;
        settled = true;
        record("error", error);
        reader.releaseLock();
        controller.error(error);
      }
    },
    async cancel(reason) {
      if (settled) return;
      settled = true;
      record("cancel", reason);
      try { await reader.cancel(reason); }
      catch (error) { record("error", error); throw error; }
      finally { reader.releaseLock(); }
    },
  }, { highWaterMark: 0 });
}
