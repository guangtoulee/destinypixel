const CLOUD_API_BASE =
  process.env.NEXT_PUBLIC_MV_API_BASE ||
  "https://ai-singer-studio-relay.ai-singer-studio.workers.dev";

const SESSION_KEY = "ai-singer-studio-session";

function isLocalBrowser(): boolean {
  if (typeof window === "undefined") return false;
  return ["127.0.0.1", "localhost"].includes(window.location.hostname);
}

export function apiBase(): string {
  return isLocalBrowser() ? "http://127.0.0.1:8000" : CLOUD_API_BASE;
}

export function isRemoteStudio(): boolean {
  return !isLocalBrowser();
}

export function sessionToken(): string {
  if (typeof window === "undefined" || !isRemoteStudio()) return "";
  return window.localStorage.getItem(SESSION_KEY) || "";
}

export function clearStudioSession(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
}

export async function loginStudio(code: string): Promise<void> {
  const response = await fetch(`${CLOUD_API_BASE}/v1/web/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({})) as { token?: string; error?: string };
  if (!response.ok || !payload.token) throw new Error(payload.error || "登录失败");
  window.localStorage.setItem(SESSION_KEY, payload.token);
}

function connectionError(detail: string) {
  if (/failed to fetch|networkerror|load failed/i.test(detail)) {
    return isRemoteStudio()
      ? "无法连接安全中继，请检查网络后重试。"
      : "本机 4090 节点未连接。请先启动 AI Singer Studio，然后刷新此页面。";
  }
  return detail;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const headers = new Headers(init?.headers);
    const token = sessionToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const response = await fetch(`${apiBase()}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
    if (!response.ok) {
      let detail = `${response.status} ${response.statusText}`;
      try {
        const payload = await response.json() as { detail?: string; error?: string };
        detail = payload.detail || payload.error || detail;
      } catch {
        // Keep the HTTP status when the response is not JSON.
      }
      if (response.status === 401 && isRemoteStudio()) {
        clearStudioSession();
        throw new Error("REMOTE_AUTH_REQUIRED");
      }
      throw new Error(detail);
    }
    return response.json() as Promise<T>;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "无法连接 GPU 节点";
    throw new Error(connectionError(detail));
  }
}

async function audioDuration(file: File): Promise<number | null> {
  if (!file.type.startsWith("audio/") || typeof document === "undefined") return null;
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<number | null>((resolve) => {
      const audio = document.createElement("audio");
      const finish = (value: number | null) => { audio.src = ""; resolve(value); };
      audio.preload = "metadata";
      audio.onloadedmetadata = () => finish(Number.isFinite(audio.duration) ? audio.duration : null);
      audio.onerror = () => finish(null);
      audio.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function uploadProjectAsset<T>(
  projectId: string,
  kind: "character" | "song" | "vocal_stem",
  file: File,
): Promise<T> {
  if (!isRemoteStudio()) {
    const form = new FormData();
    form.append("file", file);
    return api<T>(`/api/projects/${projectId}/assets?kind=${kind}`, { method: "POST", body: form });
  }
  const duration = await audioDuration(file);
  return api<T>(`/api/projects/${projectId}/assets?kind=${kind}`, {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "X-Asset-Kind": kind,
      "X-File-Name": file.name,
      ...(duration ? { "X-Media-Duration": String(duration) } : {}),
    },
    body: file,
  });
}

export function mediaUrl(path: string): string {
  const base = `${apiBase()}${path}`;
  const token = sessionToken();
  if (!token || !isRemoteStudio()) return base;
  return `${base}${base.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(token)}`;
}
