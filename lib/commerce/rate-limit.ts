import "server-only";
import { createHmac } from "node:crypto";
import { databaseRequest } from "./database";
import { MemberAuthError } from "@/lib/member-auth-security";
export async function limitCommerceAction(action: string, identity: string, limit: number, windowSeconds = 3600) {
  const secret = process.env.AUTH_RATE_LIMIT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Rate limit store unavailable");
  const key = createHmac("sha256", secret).update(`commerce:${action}:${identity}`).digest("hex");
  const rows = await databaseRequest<Array<{allowed:boolean;retry_after:number}>>("rpc/destiny_auth_consume_rate_limit", {method:"POST",body:{p_key:key,p_limit:limit,p_window_seconds:windowSeconds}});
  if (!rows[0]?.allowed) throw new MemberAuthError("RATE_LIMITED", "Please wait before trying again.", 429, rows[0]?.retry_after ?? 60);
}
