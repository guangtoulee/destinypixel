import { apiError, getSessionUser } from "@/lib/xiaoshou/auth";
import { salesConfig } from "@/lib/xiaoshou/config";
import { capabilitiesFor } from "@/lib/xiaoshou/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    return Response.json({
      authenticated: Boolean(user),
      user,
      capabilities: user ? capabilitiesFor(user) : [],
      company: {
        id: salesConfig.companyId,
        name: salesConfig.companyName,
        nameEn: salesConfig.companyNameEn,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
