import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const BLENDER_COOKIE_NAME = "blender_access";
export const BLENDER_SESSION_TTL = 7 * 24 * 60 * 60;

function accessConfig() {
  const password = process.env.BLENDER_ACCESS_PASSWORD;
  const secret = process.env.BLENDER_SESSION_SECRET;
  if (!password || !secret || secret.length < 32) return null;
  return { password, secret };
}

export function isBlenderAccessConfigured() {
  return accessConfig() !== null;
}

export function verifyBlenderPassword(candidate: string) {
  const config = accessConfig();
  if (!config || candidate.length > 256) return false;
  const digest = (value: string) => createHash("sha256").update(value, "utf8").digest();
  return timingSafeEqual(digest(candidate), digest(config.password));
}

function signSession(payload: string, config: NonNullable<ReturnType<typeof accessConfig>>) {
  // Password changes revoke old sessions; the domain prefix separates this cookie from other products.
  const passwordVersion = createHash("sha256").update(config.password, "utf8").digest("hex");
  return createHmac("sha256", config.secret)
    .update(`destinypixel:blender:session:v1\0${passwordVersion}\0${payload}`)
    .digest("hex");
}

export function createBlenderSession(now = Date.now()) {
  const config = accessConfig();
  if (!config) throw new Error("Blender access is not configured");
  const payload = `v1.${Math.floor(now / 1000)}.${randomBytes(16).toString("hex")}`;
  return `${payload}.${signSession(payload, config)}`;
}

export function verifyBlenderSession(token: string | undefined, now = Date.now()) {
  const config = accessConfig();
  if (!config || !token || token.length > 160) return false;
  const match = /^v1\.([0-9]{1,12})\.([a-f0-9]{32})\.([a-f0-9]{64})$/.exec(token);
  if (!match) return false;
  const issuedAt = Number(match[1]);
  const age = Math.floor(now / 1000) - issuedAt;
  if (age < -30 || age >= BLENDER_SESSION_TTL) return false;
  const payload = `v1.${match[1]}.${match[2]}`;
  return timingSafeEqual(Buffer.from(match[3], "hex"), Buffer.from(signSession(payload, config), "hex"));
}

export const BLENDER_PRIVATE_HEADERS = {
  "Referrer-Policy": "same-origin",
  "Cache-Control": "private, no-store, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
};
