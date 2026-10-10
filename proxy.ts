import { NextRequest, NextResponse } from "next/server";
import { BLENDER_COOKIE_NAME, BLENDER_PRIVATE_HEADERS, verifyBlenderSession } from "@/lib/blender-access";

const zhangShengJunHosts = new Set(["zhangshengjun.org", "www.zhangshengjun.org"]);

function blenderPath(pathname: string) {
  let decoded = pathname;
  try { decoded = decodeURIComponent(pathname); } catch { /* Invalid paths are rejected by Next.js. */ }
  return decoded.toLowerCase() === "/blender" || decoded.toLowerCase().startsWith("/blender/");
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();
  const { pathname } = request.nextUrl;

  // The optimizer fetches public images internally, outside the /blender cookie path.
  // Deny optimization of private model images while leaving all other images unchanged.
  if (pathname === "/_next/image") {
    const imageUrl = request.nextUrl.searchParams.get("url");
    if (imageUrl) {
      try {
        const image = new URL(imageUrl, request.nextUrl.origin);
        if (image.origin === request.nextUrl.origin && blenderPath(image.pathname)) {
          return new NextResponse("需要访问口令。", { status: 401, headers: BLENDER_PRIVATE_HEADERS });
        }
      } catch { /* The image optimizer handles invalid URLs. */ }
    }
    return NextResponse.next();
  }

  // Include encoded paths so direct static-file URLs cannot bypass the access gate.
  let protectedPath = pathname;
  try { protectedPath = decodeURIComponent(pathname); } catch { /* Invalid paths are rejected by Next.js. */ }
  if (blenderPath(pathname)) {
    const isAccessEndpoint = pathname === "/blender/access" || pathname === "/blender/auth";
    if (!isAccessEndpoint && !verifyBlenderSession(request.cookies.get(BLENDER_COOKIE_NAME)?.value)) {
      if (protectedPath.replace(/\/$/, "").toLowerCase() === "/blender") {
        const url = request.nextUrl.clone();
        url.pathname = "/blender/access";
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
  matcher: ["/_next/image", "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml).*)"],
};
