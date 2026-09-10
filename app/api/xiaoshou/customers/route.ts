import {
  apiError,
  assertSameOrigin,
  requireSessionUser,
  SalesAuthError,
} from "@/lib/xiaoshou/auth";
import {
  insertCustomer,
  listCustomersFor,
  writeAudit,
} from "@/lib/xiaoshou/store";
import {
  customerCreateSchema,
  parseJsonBody,
} from "@/lib/xiaoshou/validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser(request);
    const customers = await listCustomersFor(user);
    const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase();
    const filtered = query
      ? customers.filter((customer) =>
          [
            customer.name,
            customer.code,
            customer.city,
            customer.channel,
            customer.contact,
          ].some((value) => value.toLowerCase().includes(query)),
        )
      : customers;
    return Response.json({ customers: filtered });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireSessionUser(request);
    const input = parseJsonBody(customerCreateSchema, await request.json());
    if (!input.name || !input.address) {
      throw new SalesAuthError("请填写完整客户信息。", 400, "VALIDATION_ERROR");
    }
    const customer = await insertCustomer(user, input);
    await writeAudit({
      actor: user,
      action: "customer.created",
      targetType: "customer",
      targetId: customer.id,
      metadata: { code: customer.code },
    });
    return Response.json({ customer }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
