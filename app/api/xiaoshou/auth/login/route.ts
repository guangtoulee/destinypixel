import { NextResponse } from "next/server";
import {
  apiError,
  assertSameOrigin,
  loginSalesUser,
  salesCookieOptions,
} from "@/lib/xiaoshou/auth";
import { salesConfig } from "@/lib/xiaoshou/config";
import { loginSchema, parseJsonBody } from "@/lib/xiaoshou/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const input = parseJsonBody(loginSchema, await request.json());
    const result = await loginSalesUser(input);
    const response = NextResponse.json({ user: result.user });
    response.cookies.set(salesConfig.sessionCookie, result.token, salesCookieOptions());
    return response;
  } catch (error) {
    return apiError(error);
  }
}
