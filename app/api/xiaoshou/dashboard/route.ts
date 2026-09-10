import { apiError, requireSessionUser } from "@/lib/xiaoshou/auth";
import {
  listCustomersFor,
  listOrdersFor,
  listUsers,
  listVisitsFor,
} from "@/lib/xiaoshou/store";
import { canViewCompany } from "@/lib/xiaoshou/types";

export const runtime = "nodejs";

const shanghaiDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function dateKey(value: string | Date) {
  return shanghaiDate.format(typeof value === "string" ? new Date(value) : value);
}

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser(request);
    const companyScope = canViewCompany(user.role);
    const [customers, visits, orders, users] = await Promise.all([
      listCustomersFor(user),
      listVisitsFor(user),
      listOrdersFor(user),
      companyScope ? listUsers() : Promise.resolve([user]),
    ]);
    const today = dateKey(new Date());
    const month = today.slice(0, 7);
    const todayVisits = visits.filter((visit) => dateKey(visit.scheduledAt) === today);
    const monthOrders = orders.filter((order) => dateKey(order.createdAt).startsWith(month));
    const countedOrders = monthOrders.filter(
      (order) => order.status === "approved" || order.status === "fulfilled",
    );
    const activeUsers = users.filter((member) => member.status === "active");
    const salespeople = activeUsers.filter((member) => member.role === "sales");
    const now = Date.now();

    const topSalespeople = salespeople
      .map((member) => ({
        id: member.id,
        name: member.name,
        revenue: countedOrders
          .filter((order) => order.salespersonId === member.id)
          .reduce((sum, order) => sum + order.amount, 0),
        visits: visits.filter(
          (visit) =>
            visit.salespersonId === member.id &&
            visit.status === "completed" &&
            dateKey(visit.scheduledAt).startsWith(month),
        ).length,
        target: member.monthlyTarget,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return Response.json({
      dashboard: {
        scope: companyScope ? "company" : "personal",
        metrics: {
          todayVisits: todayVisits.length,
          completedVisits: todayVisits.filter((visit) => visit.status === "completed").length,
          monthOrders: monthOrders.length,
          monthRevenue: countedOrders.reduce((sum, order) => sum + order.amount, 0),
          activeCustomers: customers.filter((customer) => customer.status === "active").length,
          activeSalespeople: salespeople.length,
          pendingMembers: users.filter((member) => member.status === "pending").length,
          monthlyTarget: companyScope
            ? salespeople.reduce((sum, member) => sum + member.monthlyTarget, 0)
            : user.monthlyTarget,
        },
        nextVisits: visits
          .filter(
            (visit) =>
              visit.status === "planned" && new Date(visit.scheduledAt).getTime() >= now,
          )
          .sort(
            (a, b) =>
              new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
          )
          .slice(0, 5),
        recentOrders: orders.slice(0, 5),
        topSalespeople,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
