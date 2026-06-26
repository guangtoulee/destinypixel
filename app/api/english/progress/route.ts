import {
  getEnglishMemberByToken,
  saveEnglishMemberProgress,
} from "@/lib/english-member-store";

export const runtime = "nodejs";

function readBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const [type, token] = authorization.split(" ");

  return type?.toLowerCase() === "bearer" ? token : "";
}

export async function GET(request: Request) {
  try {
    const token = readBearerToken(request);
    if (!token) return Response.json({ error: "请先登录。" }, { status: 401 });

    const member = await getEnglishMemberByToken(token);
    if (!member) return Response.json({ error: "登录已过期。" }, { status: 401 });

    return Response.json({
      member: {
        id: member.id,
        username: member.username,
      },
      progress: member.progress ?? {},
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "读取进度失败。" },
      { status: 400 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const token = readBearerToken(request);
    if (!token) return Response.json({ error: "请先登录。" }, { status: 401 });

    const body = (await request.json()) as { progress?: unknown };
    const result = await saveEnglishMemberProgress({
      token,
      progress: body.progress,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "保存进度失败。" },
      { status: 400 },
    );
  }
}
