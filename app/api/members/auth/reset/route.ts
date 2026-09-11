import { cookies } from "next/headers";
import { destinyMemberSessionCookie, resetDestinyMemberPassword } from "@/lib/member-store";
import { assertSameOriginMemberMutation, enforceMemberAuthRateLimit, MemberAuthError, memberAuthErrorResponse, memberAuthJson, readMemberAuthBody, validateMemberPassword } from "@/lib/member-auth-security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOriginMemberMutation(request);
    await enforceMemberAuthRateLimit(request, "reset");
    const body = await readMemberAuthBody(request);
    if (typeof body.token !== "string") throw new MemberAuthError("INVALID_RESET_TOKEN", "重置链接无效或已过期，请重新申请。");
    const result = await resetDestinyMemberPassword({
      token: body.token,
      password: validateMemberPassword(body.password, true),
      passwordConfirm: body.passwordConfirm === undefined ? undefined : validateMemberPassword(body.passwordConfirm, true),
    });
    (await cookies()).delete(destinyMemberSessionCookie);
    return memberAuthJson(result);
  } catch (error) {
    return memberAuthErrorResponse(error);
  }
}
