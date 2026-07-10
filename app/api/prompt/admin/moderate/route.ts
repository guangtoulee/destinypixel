import {
  isSameOriginRequest,
  readPromptAdminSession,
} from "@/lib/prompt-admin";
import {
  moderatePromptItem,
  type PromptModerationAction,
} from "@/lib/prompt-moderation";

export const runtime = "nodejs";

const allowedActions = new Set<PromptModerationAction>([
  "pin",
  "unpin",
  "delete",
  "restore",
]);

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!readPromptAdminSession(request)) {
    return Response.json({ error: "管理员登录已失效。" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    action?: PromptModerationAction;
  } | null;
  const id = typeof body?.id === "string" ? body.id : "";
  const action = body?.action;
  if (!id || !action || !allowedActions.has(action)) {
    return Response.json({ error: "无效的管理操作。" }, { status: 400 });
  }

  try {
    const moderation = await moderatePromptItem(id, action);
    return Response.json(
      { ok: true, moderation },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "管理操作失败。" },
      { status: 500 },
    );
  }
}
