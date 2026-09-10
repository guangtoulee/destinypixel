import {
  apiError,
  assertSameOrigin,
  requireSessionUser,
  SalesAuthError,
} from "@/lib/xiaoshou/auth";
import { getOrderFor, patchOrder, writeAudit } from "@/lib/xiaoshou/store";
import { canViewCompany } from "@/lib/xiaoshou/types";
import { orderPatchSchema, parseJsonBody } from "@/lib/xiaoshou/validation";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    const user = await requireSessionUser(request);
    const { id } = await context.params;
    const current = await getOrderFor(user, id);
    if (!current) {
      throw new SalesAuthError("没有找到该订单。", 404, "ORDER_NOT_FOUND");
    }
    const input = parseJsonBody(orderPatchSchema, await request.json());
    if (!canViewCompany(user.role) && input.status !== "cancelled") {
      throw new SalesAuthError("订单审核仅限公司管理人员。", 403, "FORBIDDEN");
    }
    if (!canViewCompany(user.role) && current.status !== "pending") {
      throw new SalesAuthError("当前订单不能取消。", 409, "ORDER_STATE_INVALID");
    }
    const reviewed = canViewCompany(user.role);
    const order = await patchOrder(current, {
      status: input.status,
      notes: input.notes ?? current.notes,
      reviewedBy: reviewed ? user.id : current.reviewedBy,
      reviewedAt: reviewed ? new Date().toISOString() : current.reviewedAt,
    });
    await writeAudit({
      actor: user,
      action: `order.${input.status}`,
      targetType: "order",
      targetId: id,
      metadata: { orderNo: current.orderNo },
    });
    return Response.json({ order });
  } catch (error) {
    return apiError(error);
  }
}
