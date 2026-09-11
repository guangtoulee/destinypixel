type GenerationEndpoint = "/api/generate-natal" | "/api/generate-transit";

function waitForRetry(milliseconds: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    signal.throwIfAborted();
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Request aborted", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, milliseconds);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export async function requestReportGeneration(
  endpoint: GenerationEndpoint,
  reportId: string,
  locale: string,
  signal: AbortSignal,
  dependencies: { fetcher?: typeof fetch; wait?: typeof waitForRetry } = {},
) {
  const fetcher = dependencies.fetcher ?? fetch;
  const wait = dependencies.wait ?? waitForRetry;
  for (let retry = 0; retry <= 20; retry += 1) {
    signal.throwIfAborted();
    const response = await fetcher(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, locale }),
      signal,
      cache: "no-store",
    });
    if (response.status !== 409) return response;
    const detail = await response.clone().json().catch(() => null) as { code?: string } | null;
    if (detail?.code !== "GENERATION_RUNNING") return response;
    if (retry === 20) throw new Error("Report generation is still running. Retry shortly.");
    await wait(3000, signal);
  }
  throw new Error("Report generation is unavailable.");
}
