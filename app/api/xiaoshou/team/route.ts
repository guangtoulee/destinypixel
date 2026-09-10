import { apiError, requireSessionUser } from "@/lib/xiaoshou/auth";
import {
  listOrdersFor,
  listUsers,
  listVisitsFor,
} from "@/lib/xiaoshou/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const actor = await requireSessionUser(request, {
      roles: ["owner", "admin", "manager"],
    });
    const [users, visits, orders] = await Promise.all([
      listUsers(),
      listVisitsFor(actor),
      listOrdersFor(actor),
    ]);
    const members = users.map((user) => ({
      ...user,
      visits: visits.filter((visit) => visit.salespersonId === user.id).length,
      completedVisits: visits.filter(
        (visit) => visit.salespersonId === user.id && visit.status === "completed",
      ).length,
      orders: orders.filter((order) => order.salespersonId === user.id).length,
      revenue: orders
        .filter(
          (order) =>
            order.salespersonId === user.id &&
            (order.status === "approved" || order.status === "fulfilled"),
        )
        .reduce((sum, order) => sum + order.amount, 0),
    }));
    return Response.json({ members });
  } catch (error) {
    return apiError(error);
  }
}
