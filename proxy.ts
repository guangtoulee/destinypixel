import { NextRequest, NextResponse } from "next/server";

const zhangShengJunHosts = new Set(["zhangshengjun.org", "www.zhangshengjun.org"]);

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();
  const { pathname } = request.nextUrl;

  if (host && zhangShengJunHosts.has(host) && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/zhangshengjun";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml).*)"],
};
