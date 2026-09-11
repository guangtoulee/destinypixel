import "server-only";
import { MemberAuthError, memberAuthErrorResponse } from "@/lib/member-auth-security";
export { assertSameOriginMemberMutation as assertMutation, readMemberAuthBody as readBody } from "@/lib/member-auth-security";
export function privateJson(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(data, { status, headers: { "Cache-Control": "private, no-store", ...headers } });
}
export function commerceError(error: unknown) {
  if (error instanceof MemberAuthError) return memberAuthErrorResponse(error);
  return privateJson({ error: "Service temporarily unavailable. Please try again later.", code: "SERVICE_UNAVAILABLE" }, 503);
}
