export const API_BASE =
  process.env.NEXT_PUBLIC_MV_API_BASE || "http://127.0.0.1:8000";

function connectionError(detail: string) {
  if (/failed to fetch|networkerror|load failed/i.test(detail)) {
    return "本机 4090 节点未连接。请先在 GPU 电脑启动 AI Singer Studio，然后刷新此页面。";
  }
  return detail;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      cache: "no-store",
    });
    if (!response.ok) {
      let detail = `${response.status} ${response.statusText}`;
      try {
        const payload = await response.json();
        detail = payload.detail || detail;
      } catch {
        // Keep the HTTP status when the response is not JSON.
      }
      throw new Error(detail);
    }
    return response.json() as Promise<T>;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "无法连接本机 GPU 节点";
    throw new Error(connectionError(detail));
  }
}

export function mediaUrl(path: string): string {
  return `${API_BASE}${path}`;
}
