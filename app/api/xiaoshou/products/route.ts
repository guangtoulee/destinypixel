import { apiError, requireSessionUser } from "@/lib/xiaoshou/auth";
import { listProducts } from "@/lib/xiaoshou/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireSessionUser(request);
    return Response.json({ products: await listProducts() });
  } catch (error) {
    return apiError(error);
  }
}
