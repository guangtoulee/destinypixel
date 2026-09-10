import {
  apiError,
  assertSameOrigin,
  requireSessionUser,
  SalesAuthError,
} from "@/lib/xiaoshou/auth";
import {
  getCompanySettings,
  getCustomerFor,
  getVisitFor,
  patchCustomer,
  patchVisit,
  writeAudit,
} from "@/lib/xiaoshou/store";
import { parseJsonBody, visitPatchSchema } from "@/lib/xiaoshou/validation";

export const runtime = "nodejs";

function distanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadius = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = toRadians(lat2 - lat1);
  const longitudeDelta = toRadians(lon2 - lon1);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(a));
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    const user = await requireSessionUser(request);
    const { id } = await context.params;
    const current = await getVisitFor(user, id);
    if (!current) {
      throw new SalesAuthError("没有找到该拜访任务。", 404, "VISIT_NOT_FOUND");
    }
    const input = parseJsonBody(visitPatchSchema, await request.json());
    const now = new Date().toISOString();
    let updates: Parameters<typeof patchVisit>[1] = {};

    if (
      (input.action === "checkin" || input.action === "complete") &&
      current.salespersonId !== user.id
    ) {
      throw new SalesAuthError(
        "签到和完成拜访必须由任务所属销售人员本人操作。",
        403,
        "VISIT_ASSIGNEE_REQUIRED",
      );
    }

    if (input.action === "reschedule") {
      if (!input.scheduledAt) {
        throw new SalesAuthError("请选择新的拜访时间。", 400, "VALIDATION_ERROR");
      }
      updates = { scheduledAt: input.scheduledAt, status: "planned" };
    }

    if (input.action === "checkin") {
      if (current.status !== "planned") {
        throw new SalesAuthError("当前任务不能重复签到。", 409, "VISIT_STATE_INVALID");
      }
      const settings = await getCompanySettings();
      if (
        settings.requireVisitLocation &&
        (input.latitude === undefined ||
          input.latitude === null ||
          input.longitude === undefined ||
          input.longitude === null)
      ) {
        throw new SalesAuthError("签到需要获取当前位置。", 400, "LOCATION_REQUIRED");
      }
      const customer = await getCustomerFor(user, current.customerId);
      if (
        customer?.latitude !== null &&
        customer?.latitude !== undefined &&
        customer.longitude !== null &&
        input.latitude !== null &&
        input.latitude !== undefined &&
        input.longitude !== null &&
        input.longitude !== undefined
      ) {
        const distance = distanceInMeters(
          customer.latitude,
          customer.longitude,
          input.latitude,
          input.longitude,
        );
        if (distance > settings.visitRadiusMeters) {
          throw new SalesAuthError(
            `当前位置距离客户约 ${Math.round(distance)} 米，超出签到范围。`,
            400,
            "OUTSIDE_VISIT_RADIUS",
          );
        }
      }
      updates = {
        status: "in_progress",
        checkInAt: now,
        checkInLatitude: input.latitude ?? null,
        checkInLongitude: input.longitude ?? null,
      };
    }

    if (input.action === "complete") {
      if (current.status !== "in_progress") {
        throw new SalesAuthError("请先签到，再完成拜访。", 409, "VISIT_STATE_INVALID");
      }
      updates = {
        status: "completed",
        checkOutAt: now,
        notes: input.notes ?? "",
        displayScore: input.displayScore ?? null,
        stockStatus: input.stockStatus ?? "",
        nextAction: input.nextAction ?? "",
      };
      const customer = await getCustomerFor(user, current.customerId);
      if (customer) await patchCustomer(user, customer, { lastVisitAt: now });
    }

    if (input.action === "cancel") {
      if (current.status === "completed") {
        throw new SalesAuthError("已完成的拜访不能取消。", 409, "VISIT_STATE_INVALID");
      }
      updates = { status: "cancelled", notes: input.notes ?? current.notes };
    }

    const visit = await patchVisit(current, updates);
    await writeAudit({
      actor: user,
      action: `visit.${input.action}`,
      targetType: "visit",
      targetId: id,
      metadata: {
        status: visit?.status,
        hasLocation: Boolean(input.latitude !== undefined && input.longitude !== undefined),
      },
    });
    return Response.json({ visit });
  } catch (error) {
    return apiError(error);
  }
}
