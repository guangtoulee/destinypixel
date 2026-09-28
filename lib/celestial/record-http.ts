import "server-only";
import { currentMember } from "@/lib/commerce/access";
import { isAdminMember } from "@/lib/commerce/config";
import { privateJson, commerceError } from "@/lib/commerce/http";
import { MemberAuthError } from "@/lib/member-auth-security";
export async function requireRecordMember(admin = false) {
  const member = await currentMember();
  if (!member) throw new MemberAuthError("AUTH_REQUIRED", "Please log in to save or view records.", 401);
  if (admin && !isAdminMember(member)) throw new MemberAuthError("FORBIDDEN", "Administrator access required.", 403);
  return member;
}
export function recordError(error: unknown) {
  if (error instanceof SyntaxError || (error instanceof Error && /^(INVALID_|INCOMPLETE_|RECORD_TOO_LARGE)/.test(error.message))) return privateJson({ code: "INVALID_RECORD" }, error instanceof Error && error.message === "RECORD_TOO_LARGE" ? 413 : 400);
  return commerceError(error);
}
export function recordOffset(request: Request) {
  const raw = new URL(request.url).searchParams.get("offset") || "0";
  if (!/^\d{1,6}$/.test(raw)) throw new Error("INVALID_RECORD");
  return Number(raw);
}
