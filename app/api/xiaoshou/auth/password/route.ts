import {
  apiError,
  assertSameOrigin,
  changeSalesPassword,
  requireSessionUser,
} from "@/lib/xiaoshou/auth";
import {
  parseJsonBody,
  passwordChangeSchema,
} from "@/lib/xiaoshou/validation";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireSessionUser(request, { active: false });
    const input = parseJsonBody(passwordChangeSchema, await request.json());
    await changeSalesPassword(actor, input);
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
