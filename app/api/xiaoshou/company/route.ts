import {
  apiError,
  assertSameOrigin,
  requireSessionUser,
} from "@/lib/xiaoshou/auth";
import {
  getCompanySettings,
  updateCompanySettings,
  writeAudit,
} from "@/lib/xiaoshou/store";
import {
  companySettingsSchema,
  parseJsonBody,
} from "@/lib/xiaoshou/validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireSessionUser(request);
    return Response.json({ settings: await getCompanySettings() });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireSessionUser(request, { roles: ["owner", "admin"] });
    const input = parseJsonBody(companySettingsSchema, await request.json());
    const settings = await updateCompanySettings(input);
    await writeAudit({
      actor,
      action: "company.settings_updated",
      targetType: "company",
      targetId: "packom-china",
      metadata: { fields: Object.keys(input) },
    });
    return Response.json({ settings });
  } catch (error) {
    return apiError(error);
  }
}
