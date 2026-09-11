import { cookies } from "next/headers";
import {
  destinyMemberSessionCookie,
  destinyMemberSessionDays,
  loginDestinyMember,
} from "@/lib/member-store";
import { assertSameOriginMemberMutation, enforceMemberAuthRateLimit, memberAuthErrorResponse, memberAuthJson, normalizeMemberEmail, readMemberAuthBody, validateMemberPassword } from "@/lib/member-auth-security";

export const runtime = "nodejs";

async function setSessionCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(destinyMemberSessionCookie, token, {
    httpOnly: true,
    maxAge: destinyMemberSessionDays * 24 * 60 * 60,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function POST(request: Request) {
  try {
    assertSameOriginMemberMutation(request);
    const body = await readMemberAuthBody(request);
    const email = normalizeMemberEmail(body.email);
    await enforceMemberAuthRateLimit(request, "login", email);
    const result = await loginDestinyMember({
      email,
      password: validateMemberPassword(body.password),
    });

    await setSessionCookie(result.token);

    return memberAuthJson({ member: result.member });
  } catch (error) {
    return memberAuthErrorResponse(error);
  }
}
