import { currentMember } from "@/lib/commerce/access";
import { databaseRequest } from "@/lib/commerce/database";
import { checkoutOffer, isAdminMember, paidReportsEnabled, paypalMode } from "@/lib/commerce/config";
import { getMemberAuthReadiness } from "@/lib/member-store";
import { privateJson, commerceError } from "@/lib/commerce/http";
export const runtime = "nodejs";
export async function GET() {
  try {
    const member = await currentMember();
    const readiness = { checkout: checkoutOffer(member), passwordResetAvailable: getMemberAuthReadiness().passwordResetAvailable };
    if (!member) return privateJson({ error: "Please sign in.", ...readiness }, 401);
    const [access, orders] = await Promise.all([
      databaseRequest<Array<{report_id:string;created_at:string;reports:{status:string;birth_records:{name:string;locale:string}}}>>(`destiny_report_access?member_id=eq.${member.id}&select=report_id,created_at,reports(status,birth_records(name,locale))&order=created_at.desc&limit=100`),
      databaseRequest<Array<{id:string;report_id:string;status:string;amount_cents:number;currency:string;mode:string;created_at:string}>>(`destiny_report_orders?member_id=eq.${member.id}&select=id,report_id,status,amount_cents,currency,mode,created_at&order=created_at.desc&limit=100`),
    ]);
    const paid = new Set(orders.filter(o=>o.status==="completed" && (o.mode==="live" || (paypalMode()==="sandbox" && (process.env.VERCEL_ENV!=="production" || isAdminMember(member))))).map(o=>o.report_id));
    return privateJson({
      member: {id:member.id,email:member.email,name:member.name,plan:member.plan}, ...readiness,
      reports:access.map(a=>({id:a.report_id,title:a.reports?.birth_records?.name || "Birth report",locale:a.reports?.birth_records?.locale || "en",createdAt:a.created_at,access:!paidReportsEnabled()||paid.has(a.report_id)?"full":"basic",status:a.reports?.status || "ai_pending"})),
      orders:orders.map(o=>({id:o.id,reportId:o.report_id,status:o.status,amount:(o.amount_cents/100).toFixed(2),currency:o.currency,createdAt:o.created_at,mode:o.mode})),
    });
  } catch(error) { return commerceError(error); }
}
