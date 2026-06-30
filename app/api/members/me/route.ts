import { cookies } from "next/headers";
import {
  destinyMemberSessionCookie,
  getDestinyMemberByToken,
  listSavedReportsForToken,
} from "@/lib/member-store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(destinyMemberSessionCookie)?.value ?? "";

    if (!token) {
      return Response.json({ member: null, reports: [] });
    }

    const member = await getDestinyMemberByToken(token);
    if (!member) {
      return Response.json({ member: null, reports: [] }, { status: 401 });
    }

    const saved = await listSavedReportsForToken(token);

    return Response.json(saved);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "读取会员信息失败。" },
      { status: 400 },
    );
  }
}
