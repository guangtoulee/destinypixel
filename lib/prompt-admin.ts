import {
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";

export const promptAdminCookieName = "destinypixel_prompt_admin";

const defaultUsername = "lee";
const defaultPasswordHash =
  "a320480f534776bddb5cdb54b1e93d210a3c7d199e80a23c1b2178497b184c76";
const sessionLifetimeSeconds = 60 * 60 * 24 * 7;

type SessionPayload = {
  sub: string;
  exp: number;
};

function adminUsername() {
  return (process.env.PROMPT_ADMIN_USERNAME || defaultUsername).trim();
}

function sessionSecret() {
  return (
    process.env.PROMPT_ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    `local-${defaultPasswordHash}`
  );
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function sameValue(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret())
    .update(value)
    .digest("base64url");
}

function readCookies(request: Request) {
  return new Map(
    (request.headers.get("cookie") || "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separator = part.indexOf("=");
        return separator === -1
          ? [part, ""]
          : [part.slice(0, separator), decodeURIComponent(part.slice(separator + 1))];
      }),
  );
}

export function verifyPromptAdminCredentials(username: string, password: string) {
  const configuredPassword = process.env.PROMPT_ADMIN_PASSWORD;
  const expectedPasswordHash = configuredPassword
    ? sha256(configuredPassword)
    : defaultPasswordHash;

  return (
    sameValue(username.trim(), adminUsername()) &&
    sameValue(sha256(password), expectedPasswordHash)
  );
}

export function createPromptAdminSession() {
  const payload: SessionPayload = {
    sub: adminUsername(),
    exp: Math.floor(Date.now() / 1000) + sessionLifetimeSeconds,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function readPromptAdminSession(request: Request) {
  const token = readCookies(request).get(promptAdminCookieName);
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || !sameValue(sign(encoded), signature)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (payload.sub !== adminUsername() || payload.exp <= Date.now() / 1000) {
      return null;
    }
    return { username: payload.sub };
  } catch {
    return null;
  }
}

export function promptAdminSessionCookie(token: string) {
  return [
    `${promptAdminCookieName}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    process.env.NODE_ENV === "production" ? "Secure" : "",
    `Max-Age=${sessionLifetimeSeconds}`,
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearPromptAdminSessionCookie() {
  return [
    `${promptAdminCookieName}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    process.env.NODE_ENV === "production" ? "Secure" : "",
    "Max-Age=0",
  ]
    .filter(Boolean)
    .join("; ");
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const requestHost =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      new URL(request.url).host;
    return new URL(origin).host === requestHost;
  } catch {
    return false;
  }
}
