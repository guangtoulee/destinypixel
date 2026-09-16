import type { CompatibilityInput, CompatibilityResult } from "./model";

export class CompatibilityRequestError extends Error {
  constructor(public code: "invalid" | "limited" | "unavailable", public detail?: string) {
    super(code);
  }
}

class TransientFailure extends Error {}
const retryableStatuses = new Set([408, 500, 502, 503, 504]);

function pause(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => { clearTimeout(timer); signal.removeEventListener("abort", abort); reject(signal.reason); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, ms);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
}

/** Only the read-only calculation is retried. Never replay an AI/provider request here. */
export async function requestCompatibilityCalculation(
  payload: Omit<CompatibilityInput, "mode" | "consent"> & { consent: boolean },
  signal: AbortSignal,
  options: { fetch?: typeof fetch; timeoutMs?: number; retryDelayMs?: number } = {},
): Promise<CompatibilityResult> {
  const requestFetch = options.fetch ?? fetch;
  const body = JSON.stringify({ ...payload, mode: "calculate" });
  for (let attempt = 0; attempt < 2; attempt++) {
    if (signal.aborted) throw signal.reason;
    const controller = new AbortController();
    const abort = () => controller.abort(signal.reason);
    signal.addEventListener("abort", abort, { once: true });
    const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 15_000);
    try {
      const response = await requestFetch("/api/compatibility", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body, signal: controller.signal, cache: "no-store",
      });
      if (!response.ok) {
        if (retryableStatuses.has(response.status)) {
          await response.body?.cancel();
          throw new TransientFailure();
        }
        if (response.status === 429) throw new CompatibilityRequestError("limited");
        const data = await response.json().catch(() => null);
        const detail = typeof data?.error === "string" && data.error.length <= 500 ? data.error : undefined;
        throw new CompatibilityRequestError(response.status >= 500 ? "unavailable" : "invalid", detail);
      }
      const data = await response.json();
      if (data?.result?.version !== "relationship-v2" || !Number.isFinite(data.result.score)
        || !Array.isArray(data.result.people) || data.result.people.length !== 2
        || !Array.isArray(data.result.dimensions) || data.result.dimensions.length !== 4
        || !data.result.baziConnection || !data.result.people.every((person: CompatibilityResult["people"][number]) => person?.animal?.name)) {
        throw new TransientFailure();
      }
      return data.result;
    } catch (error) {
      if (signal.aborted) throw signal.reason;
      if (error instanceof CompatibilityRequestError) throw error;
      // Fetch rejection, interrupted body, timeout or temporary gateway response.
      if (attempt === 1) throw new CompatibilityRequestError("unavailable");
    } finally {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
    }
    await pause(options.retryDelayMs ?? 600, signal);
  }
  throw new CompatibilityRequestError("unavailable");
}
