import { cookies } from "next/headers";
import { destinyMemberSessionCookie, revokeDestinyMemberSession } from "@/lib/member-store";
import { assertSameOriginMemberMutation, memberAuthErrorResponse, memberAuthJson } from "@/lib/member-auth-security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOriginMemberMutation(request);
    const cookieStore = await cookies();
    await revokeDestinyMemberSession(cookieStore.get(destinyMemberSessionCookie)?.value ?? "");
    cookieStore.delete(destinyMemberSessionCookie);
    return memberAuthJson({ ok: true });
  } catch (error) {
    return memberAuthErrorResponse(error);
  }
}
