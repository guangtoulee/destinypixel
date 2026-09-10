import {
  apiError,
  assertSameOrigin,
  requireSessionUser,
  SalesAuthError,
} from "@/lib/xiaoshou/auth";
import {
  getCustomerFor,
  patchCustomer,
  writeAudit,
} from "@/lib/xiaoshou/store";
import {
  customerPatchSchema,
  parseJsonBody,
} from "@/lib/xiaoshou/validation";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    const user = await requireSessionUser(request);
    const { id } = await context.params;
    const current = await getCustomerFor(user, id);
    if (!current) {
      throw new SalesAuthError("没有找到该客户。", 404, "CUSTOMER_NOT_FOUND");
    }
    const input = parseJsonBody(customerPatchSchema, await request.json());
    const customer = await patchCustomer(user, current, input);
    await writeAudit({
      actor: user,
      action: "customer.updated",
      targetType: "customer",
      targetId: id,
      metadata: { fields: Object.keys(input) },
    });
    return Response.json({ customer });
  } catch (error) {
    return apiError(error);
  }
}
