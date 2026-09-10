import { NextResponse } from "next/server";
import {
  apiError,
  assertSameOrigin,
  registerSalesUser,
  salesCookieOptions,
} from "@/lib/xiaoshou/auth";
import { salesConfig } from "@/lib/xiaoshou/config";
import { parseJsonBody, registerSchema } from "@/lib/xiaoshou/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const input = parseJsonBody(registerSchema, await request.json());
    const result = await registerSalesUser(input);
    const response = NextResponse.json({ user: result.user }, { status: 201 });
    response.cookies.set(salesConfig.sessionCookie, result.token, salesCookieOptions());
    return response;
  } catch (error) {
    return apiError(error);
  }
}
