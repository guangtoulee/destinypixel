import { NextResponse } from "next/server";
import { apiError, assertSameOrigin, logoutSalesUser } from "@/lib/xiaoshou/auth";
import { salesConfig } from "@/lib/xiaoshou/config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await logoutSalesUser(request);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(salesConfig.sessionCookie, "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (error) {
    return apiError(error);
  }
}
