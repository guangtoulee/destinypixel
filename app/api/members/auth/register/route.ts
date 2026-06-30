import { cookies } from "next/headers";
import {
  destinyMemberSessionCookie,
  destinyMemberSessionDays,
  registerDestinyMember,
} from "@/lib/member-store";

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
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      passwordConfirm?: string;
      name?: string;
    };
    const result = await registerDestinyMember({
      email: body.email ?? "",
      password: body.password ?? "",
      passwordConfirm: body.passwordConfirm,
      name: body.name,
    });

    await setSessionCookie(result.token);

    return Response.json({ member: result.member });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "注册失败。" },
      { status: 400 },
    );
  }
}
