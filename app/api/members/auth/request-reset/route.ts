import { getMemberAuthReadiness, requestDestinyPasswordReset } from "@/lib/member-store";
import { assertSameOriginMemberMutation, enforceMemberAuthRateLimit, MemberAuthError, memberAuthErrorResponse, memberAuthJson, normalizeMemberEmail, readMemberAuthBody } from "@/lib/member-auth-security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOriginMemberMutation(request);
    if (!getMemberAuthReadiness().passwordResetAvailable) throw new MemberAuthError("PASSWORD_RESET_UNAVAILABLE", "密码找回邮件服务暂未配置。", 503);
    const body = await readMemberAuthBody(request);
    const email = normalizeMemberEmail(body.email);
    await enforceMemberAuthRateLimit(request, "request_reset", email);
    return memberAuthJson(await requestDestinyPasswordReset(email));
  } catch (error) {
    return memberAuthErrorResponse(error);
  }
}
