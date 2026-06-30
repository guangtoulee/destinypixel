import { cookies } from "next/headers";
import { destinyMemberSessionCookie } from "@/lib/member-store";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete(destinyMemberSessionCookie);

  return Response.json({ ok: true });
}
