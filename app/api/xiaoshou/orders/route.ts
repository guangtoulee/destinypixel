import {
  apiError,
  assertSameOrigin,
  requireSessionUser,
  SalesAuthError,
} from "@/lib/xiaoshou/auth";
import {
  getCustomerFor,
  insertOrder,
  listOrdersFor,
  listProducts,
  writeAudit,
} from "@/lib/xiaoshou/store";
import { orderCreateSchema, parseJsonBody } from "@/lib/xiaoshou/validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser(request);
    const orders = await listOrdersFor(user);
    return Response.json({ orders });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireSessionUser(request);
    const input = parseJsonBody(orderCreateSchema, await request.json());
    const customer = await getCustomerFor(user, input.customerId);
    if (!customer) {
      throw new SalesAuthError("没有找到该客户。", 404, "CUSTOMER_NOT_FOUND");
    }
    const products = await listProducts();
    const productMap = new Map(products.map((product) => [product.id, product]));
    const items = input.items.map((requested) => {
      const product = productMap.get(requested.productId);
      if (!product || !product.active) {
        throw new SalesAuthError("订单中包含已下架商品。", 400, "PRODUCT_UNAVAILABLE");
      }
      const subtotal = Math.round(product.price * requested.quantity * 100) / 100;
      return {
        productId: product.id,
        sku: product.sku,
        name: product.nameZh,
        quantity: requested.quantity,
        unitPrice: product.price,
        subtotal,
      };
    });
    const order = await insertOrder(user, {
      customerId: customer.id,
      items,
      notes: input.notes,
    });
    await writeAudit({
      actor: user,
      action: "order.created",
      targetType: "order",
      targetId: order.id,
      metadata: { orderNo: order.orderNo, amount: order.amount },
    });
    return Response.json({ order }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
