import { cookies } from "next/headers";
import { privateJson, commerceError } from "@/lib/commerce/http";
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
      return privateJson({ member: null, reports: [] });
    }

    const member = await getDestinyMemberByToken(token);
    if (!member) {
      return privateJson({ member: null, reports: [] }, 401);
    }

    const saved = await listSavedReportsForToken(token);

    return privateJson(saved);
  } catch (error) {
    return commerceError(error);
  }
}
