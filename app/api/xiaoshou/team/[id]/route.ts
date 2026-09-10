import {
  apiError,
  assertSameOrigin,
  requireSessionUser,
  SalesAuthError,
} from "@/lib/xiaoshou/auth";
import { getUserRowById, toSalesUser, updateUser, writeAudit } from "@/lib/xiaoshou/store";
import { parseJsonBody, teamPatchSchema } from "@/lib/xiaoshou/validation";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    const actor = await requireSessionUser(request, { roles: ["owner", "admin"] });
    const { id } = await context.params;
    const row = await getUserRowById(id);
    if (!row) throw new SalesAuthError("没有找到该成员。", 404, "MEMBER_NOT_FOUND");
    const current = toSalesUser(row);
    const input = parseJsonBody(teamPatchSchema, await request.json());

    if (current.role === "owner" && (input.role || input.status)) {
      throw new SalesAuthError("公司负责人账户不能被停用或改换角色。", 400, "OWNER_PROTECTED");
    }
    if (actor.role !== "owner" && input.role === "admin") {
      throw new SalesAuthError("只有公司负责人可以任命管理员。", 403, "FORBIDDEN");
    }
    if (actor.id === id && input.status && input.status !== "active") {
      throw new SalesAuthError("不能停用当前登录账户。", 400, "SELF_SUSPEND_BLOCKED");
    }

    const member = await updateUser(id, input);
    await writeAudit({
      actor,
      action: input.status === "active" && current.status === "pending"
        ? "member.approved"
        : "member.updated",
      targetType: "user",
      targetId: id,
      metadata: { fields: Object.keys(input) },
    });
    return Response.json({ member });
  } catch (error) {
    return apiError(error);
  }
}
