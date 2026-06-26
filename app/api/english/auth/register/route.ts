import { registerEnglishMember } from "@/lib/english-member-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
      passwordConfirm?: string;
      progress?: unknown;
    };

    if (!body.password || body.password !== body.passwordConfirm) {
      return Response.json({ error: "两次密码不一致。" }, { status: 400 });
    }

    const result = await registerEnglishMember({
      username: body.username ?? "",
      password: body.password,
      progress: body.progress,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "注册失败。" },
      { status: 400 },
    );
  }
}
