import { NextRequest, NextResponse } from "next/server";
import { BLENDER_COOKIE_NAME, BLENDER_PRIVATE_HEADERS, BLENDER_SESSION_TTL, createBlenderSession, isBlenderAccessConfigured, verifyBlenderPassword } from "@/lib/blender-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Best-effort per-process throttling bounds repeated guesses without adding a database dependency.
const attempts = new Map<string, { count: number; expires: number }>();

function accessRedirect(error: string) {
  return new NextResponse(null, {
    status: 303,
    headers: { ...BLENDER_PRIVATE_HEADERS, Location: `/blender/access?error=${error}` },
  });
}

function isSameOrigin(request: NextRequest) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  // Next.js may construct request.url with an internal hostname behind a reverse proxy.
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
    || request.headers.get("host") || request.nextUrl.host;
  const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase()
    || request.nextUrl.protocol.replace(/:$/, "");
  if (protocol !== "http" && protocol !== "https") return false;
  try {
    const expected = new URL(`${protocol}://${host}`);
    return expected.host === host.toLowerCase() && new URL(origin).origin === expected.origin;
  } catch { return false; }
}

async function readPassword(request: NextRequest) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/x-www-form-urlencoded")) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    size += chunk.value.byteLength;
    if (size > 4096) {
      await reader.cancel();
      return null;
    }
    chunks.push(chunk.value);
  }
  const password = new URLSearchParams(Buffer.concat(chunks).toString("utf8")).get("password");
  return password && password.length <= 256 ? password : null;
}

export async function POST(request: NextRequest) {
  if (!isBlenderAccessConfigured()) return accessRedirect("unavailable");
  if (!isSameOrigin(request)) return accessRedirect("origin");
  const now = Date.now();
  if (attempts.size > 2000) {
    for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key);
    if (attempts.size > 4000) attempts.clear();
  }
  const identity = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 100) || "unknown";
  const previous = attempts.get(identity);
  const bucket = previous && previous.expires > now ? previous : { count: 0, expires: now + 15 * 60 * 1000 };
  if (bucket.count >= 12) return accessRedirect("rate");
  bucket.count += 1;
  attempts.set(identity, bucket);
  let password: string | null;
  try { password = await readPassword(request); } catch { return accessRedirect("invalid"); }
  if (!password || !verifyBlenderPassword(password)) return accessRedirect("invalid");
  attempts.delete(identity);
  const response = new NextResponse(null, { status: 303, headers: { ...BLENDER_PRIVATE_HEADERS, Location: "/blender" } });
  response.cookies.set(BLENDER_COOKIE_NAME, createBlenderSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/blender",
    maxAge: BLENDER_SESSION_TTL,
  });
  return response;
}
