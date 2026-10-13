import { NextRequest, NextResponse } from "next/server";
import { BLENDER_COOKIE_NAME, BLENDER_PRIVATE_HEADERS, verifyBlenderSession } from "@/lib/blender-access";

import { OCEAN_COOKIE_NAME, verifyOceanSession } from "@/lib/ocean-access";

const zhangShengJunHosts = new Set(["zhangshengjun.org", "www.zhangshengjun.org"]);

function normalizedMuseumPath(pathname: string) {
  let decoded = pathname;
  // Next.js can resolve encoded separators and dot segments during static-file serving.
  // Canonicalize them before authorization, including aliases under normally excluded paths.
  for (let i = 0; i < 5; i += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch { break; }
  }
  const segments: string[] = [];
  for (const segment of decoded.replace(/\\/g, "/").split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") segments.pop();
    else segments.push(segment);
  }
  return `/${segments.join("/")}`;
}

function museumRoot(pathname: string): "blender" | "ocean" | null {
  const root = normalizedMuseumPath(pathname).toLowerCase().split("/")[1];
  return root === "blender" || root === "ocean" ? root : null;
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();
  const { pathname } = request.nextUrl;

  // The optimizer fetches public images internally, outside the museum cookie paths.
  // Deny optimization of private model images while leaving all other images unchanged.
  if (pathname === "/_next/image") {
    const imageUrl = request.nextUrl.searchParams.get("url");
    if (imageUrl) {
      try {
        const image = new URL(imageUrl, request.nextUrl.origin);
        if (museumRoot(image.pathname)) {
          return new NextResponse("需要访问口令。", { status: 401, headers: BLENDER_PRIVATE_HEADERS });
        }
      } catch { /* The image optimizer handles invalid URLs. */ }
    }
    return NextResponse.next();
  }

  // Include encoded paths so direct static-file URLs cannot bypass the access gate.
  const protectedPath = normalizedMuseumPath(pathname);
  const root = museumRoot(pathname);
  if (root) {
    const isAccessEndpoint = pathname === `/${root}/access` || pathname === `/${root}/auth`;
    const verifySession = root === "ocean" ? verifyOceanSession : verifyBlenderSession;
    const cookieName = root === "ocean" ? OCEAN_COOKIE_NAME : BLENDER_COOKIE_NAME;
    if (!isAccessEndpoint && !verifySession(request.cookies.get(cookieName)?.value)) {
      if (protectedPath.replace(/\/$/, "").toLowerCase() === `/${root}`) {
        const url = request.nextUrl.clone();
        url.pathname = `/${root}/access`;
        url.search = "";
        const response = NextResponse.redirect(url);
        for (const [key, value] of Object.entries(BLENDER_PRIVATE_HEADERS)) response.headers.set(key, value);
        return response;
      }
      return new NextResponse("需要访问口令。", { status: 401, headers: BLENDER_PRIVATE_HEADERS });
    }
    const response = NextResponse.next();
    for (const [key, value] of Object.entries(BLENDER_PRIVATE_HEADERS)) response.headers.set(key, value);
    return response;
  }

  if (host && zhangShengJunHosts.has(host) && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/zhangshengjun";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
