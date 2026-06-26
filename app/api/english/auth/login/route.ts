import { loginEnglishMember } from "@/lib/english-member-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };
    const result = await loginEnglishMember({
      username: body.username ?? "",
      password: body.password ?? "",
    });

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "登录失败。" },
      { status: 400 },
    );
  }
}
