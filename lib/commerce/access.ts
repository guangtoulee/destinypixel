import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { ReportRecord } from "@/lib/db/repository";
import { destinyMemberSessionCookie, getDestinyMemberByToken } from "@/lib/member-store";
import { checkoutOffer, paidReportsEnabled, paypalMode, isAdminMember } from "./config";
import { databaseRequest } from "./database";

export function isReportId(value: unknown): value is string { return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value); }
export function guestCookieName(id: string) { return `dp_report_access_${id}`; }
export function guestHash(token: string) { return createHash("sha256").update(token).digest("hex"); }
export function newGuestToken() { return randomBytes(32).toString("base64url"); }
export async function currentMember() {
  const token = (await cookies()).get(destinyMemberSessionCookie)?.value ?? "";
  return getDestinyMemberByToken(token);
}
type AccessRow = { report_id: string; member_id: string | null; guest_token_hash: string | null; guest_expires_at: string | null };
export function validGuestProof(row: AccessRow, token: string, now = Date.now()) {
  if (row.member_id || !/^[A-Za-z0-9_-]{43}$/.test(token) || !row.guest_token_hash || !/^[0-9a-f]{64}$/.test(row.guest_token_hash)) return false;
  const expires = Date.parse(row.guest_expires_at ?? "");
  return Number.isFinite(expires) && expires > now && timingSafeEqual(Buffer.from(row.guest_token_hash), Buffer.from(guestHash(token)));
}
export async function getReportAccess(id: string) {
  const member = await currentMember();
  const base = { report: null as ReportRecord | null, member, canRead: false, isFull: false, claimable: false, offer: checkoutOffer(member), commerceEnabled: paidReportsEnabled() };
  if (!isReportId(id)) return base;
  const [row] = await databaseRequest<AccessRow[]>(`destiny_report_access?report_id=eq.${id}&limit=1`);
  if (!row) return base;
  const token = (await cookies()).get(guestCookieName(id))?.value ?? "";
  const claimable = validGuestProof(row, token);
  const ownsReport = Boolean(member && row.member_id === member.id);
  if (!ownsReport && !claimable) return base;
  const [raw] = await databaseRequest<Array<Omit<ReportRecord, "user" | "birth_record">>>(`reports?id=eq.${id}&limit=1`);
  if (!raw) return base;
  const [[user], [birth_record]] = await Promise.all([
    databaseRequest<ReportRecord["user"][]>(`users?id=eq.${raw.user_id}&select=id,name,email&limit=1`),
    databaseRequest<ReportRecord["birth_record"][]>(`birth_records?id=eq.${raw.birth_record_id}&limit=1`),
  ]);
  if (!user || !birth_record) return base;
  // PostgreSQL TIME includes seconds; the calculation input is an exact local minute.
  birth_record.birth_time = birth_record.birth_time.slice(0, 5);
  const orders = member ? await databaseRequest<Array<{ mode: string }>>(`destiny_report_orders?report_id=eq.${id}&member_id=eq.${member.id}&status=eq.completed&select=mode`) : [];
  const purchased = orders.some(order => order.mode === "live" || (order.mode === "sandbox" && paypalMode() === "sandbox" && (process.env.VERCEL_ENV !== "production" || isAdminMember(member))));
  const adminTestAccess = ownsReport && isAdminMember(member);
  return { ...base, report: { ...raw, user, birth_record }, canRead: true, claimable, isFull: !paidReportsEnabled() || purchased || adminTestAccess };
}
export async function claimReportForMember(id: string) {
  const access = await getReportAccess(id);
  if (!access.member || !access.canRead || !access.report) return null;
  if (access.claimable) {
    const token = (await cookies()).get(guestCookieName(id))?.value ?? "";
    const claimed = await databaseRequest<boolean>("rpc/destiny_claim_report", { method: "POST", body: { p_report: id, p_member: access.member.id, p_guest_hash: guestHash(token) } });
    if (!claimed) return null;
    // Re-read ownership before returning account-specific entitlements.
    return getReportAccess(id);
  }
  return access;
}
