import {
  apiError,
  assertSameOrigin,
  requireSessionUser,
  SalesAuthError,
} from "@/lib/xiaoshou/auth";
import {
  getCustomerFor,
  insertVisit,
  listVisitsFor,
  writeAudit,
} from "@/lib/xiaoshou/store";
import { parseJsonBody, visitCreateSchema } from "@/lib/xiaoshou/validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser(request);
    const visits = await listVisitsFor(user);
    const scope = new URL(request.url).searchParams.get("scope");
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const tomorrow = today + 24 * 60 * 60 * 1000;
    const filtered =
      scope === "today"
        ? visits.filter((visit) => {
            const time = new Date(visit.scheduledAt).getTime();
            return time >= today && time < tomorrow;
          })
        : visits;
    return Response.json({ visits: filtered });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireSessionUser(request);
    const input = parseJsonBody(visitCreateSchema, await request.json());
    const customer = await getCustomerFor(user, input.customerId);
    if (!customer) {
      throw new SalesAuthError("没有找到该客户。", 404, "CUSTOMER_NOT_FOUND");
    }
    const visit = await insertVisit(user, input);
    await writeAudit({
      actor: user,
      action: "visit.scheduled",
      targetType: "visit",
      targetId: visit.id,
      metadata: { customerId: input.customerId, scheduledAt: input.scheduledAt },
    });
    return Response.json({ visit }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
